import React, { useState, useEffect, useRef } from 'react';
import { X, Coins, Maximize2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Capacitor } from '@capacitor/core';
import { Keyboard } from '@capacitor/keyboard';
import CurrencySelectModal from './CurrencySelectModal';
import FullScreenChange from './FullScreenChange';
import AppHeader from './AppHeader';
import { maybeShowInterstitial } from '../ads';
import { loadSettings } from '../utils/settings';
import { addHistoryItem, getCurrentLocation } from '../utils/history';
import { getAdDebugInfo } from '../ads';

const EXCHANGE_RATE = 1.95583;

export default function CalculatorScreen() {
  const [dueEUR, setDueEUR] = useState("");
  const [dueBGN, setDueBGN] = useState("");
  const [paidEUR, setPaidEUR] = useState("");
  const [paidBGN, setPaidBGN] = useState("");

  const [showEURModal, setShowEURModal] = useState(false);
  const [showBGNModal, setShowBGNModal] = useState(false);
  const [showFullScreen, setShowFullScreen] = useState(false);
  const [suppressNextBlurModal, setSuppressNextBlurModal] = useState(false);

  const dueEURInputRef = React.useRef<HTMLInputElement>(null);
  const dueBGNInputRef = React.useRef<HTMLInputElement>(null);
  const paidEURInputRef = React.useRef<HTMLInputElement>(null);
  const paidBGNInputRef = React.useRef<HTMLInputElement>(null);

  const prevShowFsRef = useRef<boolean>(false);

  // Auto-focus on first input when component mounts
  useEffect(() => {
    // малко по-дълъг delay при студен старт, за да е сигурно, че webview е готов
    const timer = setTimeout(() => {
      focusAndShowKeyboard(dueEURInputRef);
    }, 250);
    return () => clearTimeout(timer);
  }, []);

  
  // Auto-convert between currencies for due amount
  useEffect(() => {
    if (dueEUR && !dueBGN) {
      setDueBGN((parseFloat(dueEUR) * EXCHANGE_RATE).toFixed(2));
    }
  }, [dueEUR]);

  useEffect(() => {
    if (dueBGN && !dueEUR) {
      setDueEUR((parseFloat(dueBGN) / EXCHANGE_RATE).toFixed(2));
    }
  }, [dueBGN]);

  // Maybe show interstitial ad on closed modal with calculation
  useEffect(() => {
    const wasOpen = prevShowFsRef.current;
    if (wasOpen && !showFullScreen) {
      setTimeout(() => {
        markCalculationAndMaybeShowAd();
      }, 200);
    }
    prevShowFsRef.current = showFullScreen;
  }, [showFullScreen]);

  
  const calculateTotals = () => {
    const totalDueEUR = parseFloat(dueEUR || "0");
    const totalDueBGN = parseFloat(dueBGN || "0");
    const totalPaidEUR = parseFloat(paidEUR || "0");
    const totalPaidBGN = parseFloat(paidBGN || "0");

    // Convert everything to EUR for comparison
    const dueInEUR = totalDueEUR || totalDueBGN / EXCHANGE_RATE;
    const paidInEUR = totalPaidEUR + totalPaidBGN / EXCHANGE_RATE;

    const changeInEUR = paidInEUR - dueInEUR;
    const remainingEUR = dueInEUR - paidInEUR;

    return {
      totalDueEUR,
      totalDueBGN,
      totalPaidEUR,
      totalPaidBGN,
      changeInEUR,
      remainingEUR,
      status:
        changeInEUR > 0.01
          ? "change"
          : changeInEUR < -0.01
            ? "insufficient"
            : "exact",
    };
  };

  const totals = calculateTotals();

  const clearAll = () => {
    setDueEUR("");
    setDueBGN("");
    setPaidEUR("");
    setPaidBGN("");
    try { localStorage.removeItem('lastDueCents'); } catch {}
  };

  const addQuickPay = (type: "EUR" | "BGN") => {
    if (type === "EUR" && totals.remainingEUR > 0) {
      setPaidEUR((parseFloat(paidEUR || "0") + totals.remainingEUR).toFixed(2));
    } else if (type === "BGN" && totals.remainingEUR > 0) {
      setPaidBGN(
        (
          parseFloat(paidBGN || "0") +
          totals.remainingEUR * EXCHANGE_RATE
        ).toFixed(2),
      );
    }
  };

  const getCurrentDueEurCents = (): number => {
    const eur = parseFloat(dueEUR || "0");
    const bgn = parseFloat(dueBGN || "0");
    const dueInEur = eur || (bgn / EXCHANGE_RATE);
    if (!isFinite(dueInEur) || dueInEur <= 0) return 0;
    return Math.round(dueInEur * 100);
  };
  
  // Normalize comma to dot for decimal input and prevent negative numbers
  const normalizeDecimal = (value: string): string => {
    let normalized = value.replace(",", ".");
    // Remove minus sign if present
    normalized = normalized.replace("-", "");
    return normalized;
  };

  // Count completed calculations and maybe show interstitial ad on every 3rd one
  let lastAdTryAt = 0;
  const markCalculationAndMaybeShowAd = () => {
    try {
      const now = Date.now();
      if (now - lastAdTryAt < 800) return; // анти-двойно тригване <0.8s
      lastAdTryAt = now;
      
      const dueKey = 'lastDueCents';
      const curDue = getCurrentDueEurCents();
      if (!curDue) return; // няма валидна дължима сума → не броим

      const lastDue = Number(localStorage.getItem(dueKey) ?? '0') || 0;
      if (lastDue === curDue) {
        // дължимата сума не е сменена → не броим повторно
        return;
      }

      // обнови "последно отчетена" дължима сума
      localStorage.setItem(dueKey, String(curDue));

      // инкремент на брояча и евентуално показване на реклама на всеки 3-ти път
      const cntKey = 'calcCount';
      const prev = Number(localStorage.getItem(cntKey) ?? '0') || 0;
      const next = prev + 1;
      localStorage.setItem(cntKey, String(next));

      if (next % 2 === 0) {
        maybeShowInterstitial();
      }
    } catch {
      // игнорирай storage грешки
    }
  };
  
  // Save history when calculation is complete
  const saveToHistory = async () => {
    const settings = loadSettings();
    
    // Only save if history saving is enabled
    if (!settings.saveHistory) {
      return;
    }

    // Only save if there's a valid calculation (has due amount and change)
    if (!hasDueAmount || totals.status !== "change") {
      return;
    }

    // Get location if enabled
    let location = undefined;
    if (settings.saveLocation) {
      location = await getCurrentLocation();
    }

    // Save to history
    addHistoryItem({
      dueEUR: totals.totalDueEUR,
      dueBGN: totals.totalDueBGN,
      paidEUR: totals.totalPaidEUR,
      paidBGN: totals.totalPaidBGN,
      changeEUR: totals.changeInEUR,
      location: location || undefined,
    });
  };

  // Handle blur event on paid fields - show full screen if there's change
  const handlePaidBlur = async () => {
    if (suppressNextBlurModal) {
      setSuppressNextBlurModal(false);
      return;
    }
    if (totals.status === "change") {
      await saveToHistory();
      setShowFullScreen(true);
    }
  };

  // Check if due amount is set
  const hasDueAmount = !!(dueEUR || dueBGN);

  // Handle clearing due EUR (also clears BGN)
  const clearDueEUR = () => {
    setDueEUR("");
    setDueBGN("");
    try { localStorage.removeItem('lastDueCents'); } catch {}
    setTimeout(() => focusAndShowKeyboard(dueEURInputRef), 0);
  };

  // Handle clearing due BGN (also clears EUR)
  const clearDueBGN = () => {
    setDueEUR("");
    setDueBGN("");
    try { localStorage.removeItem('lastDueCents'); } catch {}
    setTimeout(() => focusAndShowKeyboard(dueBGNInputRef), 0);
  };

  const selectAllOnFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    const input = e.currentTarget;

    input.select?.();

    requestAnimationFrame(() => {
      try {
        input.select?.();
        if (typeof input.setSelectionRange === "function") {
          input.setSelectionRange(0, input.value.length);
        }
      } catch {}
    });
  };
  
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    nextFieldRef: React.RefObject<HTMLInputElement> | null,
  ) => {
    if (e.key === "Enter") {
      if (nextFieldRef && nextFieldRef.current) {
        nextFieldRef.current.focus();
      } else if (nextFieldRef === null) {
        e.currentTarget.blur();
        handlePaidBlur();
      }
    }
  };

  const handlePaidKeyDown = async (
    e: React.KeyboardEvent<HTMLInputElement>,
    nextFieldRef: React.RefObject<HTMLInputElement> | null,
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      // Ако има ресто – директно модал
      if (totals.status === "change") {
        await saveToHistory();
        setShowFullScreen(true);
        return;
      }
      // Иначе – запази досегашното поведение (фокус нататък / blur)
      if (nextFieldRef?.current) {
        nextFieldRef.current.focus();
      } else {
        e.currentTarget.blur();
      }
    }
  };

  // Фокусира input и опитва да покаже soft keyboard (Android)
  const focusAndShowKeyboard = (ref: React.RefObject<HTMLInputElement>) => {
    if (!ref?.current) return;
    // предотврати скрол (някои мобилни браузъри)
    try {
      // @ts-ignore - не всички типове имат preventScroll
      ref.current.focus({ preventScroll: true });
    } catch {
      ref.current.focus();
    }
    // малко забавяне, за да е активен фокусът
    setTimeout(() => {
      if (Capacitor.getPlatform() === 'android') {
        // на Android често изисква изрично show()
        Keyboard.show().catch(() => {});
      }
    }, 40);
  };
  
  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      {/* <AppHeader title="Калкулатор за ресто (BGN/EUR)" /> */}

      {/* Status Panel */}
      {(dueEUR || dueBGN) ? (
        <Card
          className={`border-2 shadow-md ${
            totals.status === "insufficient"
              ? "border-red-300 bg-red-50"
              : totals.status === "exact"
                ? "border-green-300 bg-green-50"
                : "border-blue-300 bg-blue-50"
          }`}
        >
          <CardContent className="p-4 space-y-3">
            {totals.status === "insufficient" && (
              <div className="space-y-2">
                <p className="text-red-700">Недостатъчна сума</p>
                <p className="text-sm text-red-600">
                  Не достигат: {" "}
                  <span className="font-medium">
                    {totals.remainingEUR.toFixed(2)} €
                  </span>
                  {" или "}
                  <span className="font-medium">
                    {(totals.remainingEUR * EXCHANGE_RATE).toFixed(2)} лв.
                  </span>
                </p>
              </div>
            )}

            {totals.status === "exact" && (
              <div>
                <p className="text-green-700">Сумата е точна</p>
                <p className="text-sm text-green-600">Няма ресто</p>
              </div>
            )}

            {totals.status === "change" && (
              <div className="space-y-2">
                <p className="text-blue-700">Има ресто</p>
                <div className="bg-white rounded-lg p-3 border border-blue-200">
                  <p className="text-sm text-slate-600 mb-1">
                    Ресто за връщане:
                  </p>
                  <p className="text-blue-600">
                    {totals.changeInEUR.toFixed(2)} €
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={async () => {
                  await saveToHistory();
                  setShowFullScreen(true);
                }}
                className="flex-1 bg-blue-500 hover:bg-blue-600"
                disabled={totals.status !== "change"}
              >
                <Maximize2 className="h-4 w-4 mr-2" />
                Виж на цял екран
              </Button>
              <Button
                onClick={clearAll}
                variant="destructive"
                className="flex-1"
              >
                Изчисти
              </Button>
            </div>
          </CardContent>
        </Card>
    ) : (
      <Card className="bg-slate-50 border border-slate-200 shadow-sm">
        <CardContent className="p-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Посочете дължимата сума в едно от двете полета - лева или евро, като другото ще се изчисли автоматично. След това въведете колко плащате в лева, в евро или в комбинация от двете валути. Калкулаторът ще изчисли рестото в евро.
          </p>
        </CardContent>
      </Card>
    )}
      
      {/* Due Amount Section */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-4 space-y-4">
          <h2 className="text-slate-900">Дължима сума</h2>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="due-eur" className="text-slate-600">
                В евро
              </Label>
              <div className="relative">
                <Input
                  ref={dueEURInputRef}
                  id="due-eur"
                  type="text"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={dueEUR}
                  onChange={(e) => {
                    const normalized = normalizeDecimal(e.target.value);
                    setDueEUR(normalized);
                    setDueBGN("");
                  }}
                  onKeyDown={(e) => handleKeyDown(e, dueBGNInputRef)}
                  onFocus={selectAllOnFocus}
                  className="pr-8"
                />
                {dueEUR && (
                  <button
                    onClick={clearDueEUR}
                    className="absolute right-0 top-0 p-2-5 text-slate-400 hover:text-slate-600 z-10"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="due-bgn" className="text-slate-600">
                В лева
              </Label>
              <div className="relative">
                <Input
                  ref={dueBGNInputRef}
                  id="due-bgn"
                  type="text"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={dueBGN}
                  onChange={(e) => {
                    const normalized = normalizeDecimal(e.target.value);
                    setDueBGN(normalized);
                    setDueEUR("");
                  }}
                  onKeyDown={(e) => handleKeyDown(e, paidEURInputRef)}
                  onFocus={selectAllOnFocus}
                  className="pr-8"
                />
                {dueBGN && (
                  <button
                    onClick={clearDueBGN}
                    className="absolute right-0 top-0 p-2-5 text-slate-400 hover:text-slate-600 z-10"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Paid Amount Section */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-4 space-y-4">
          <h2 className="text-slate-900">Плащам</h2>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="paid-eur" className="text-slate-600">
                  В евро
                </Label>
                <button
                  onClick={() => setShowEURModal(true)}
                  disabled={!hasDueAmount}
                  className="text-xs text-orange-500 hover:text-orange-600 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Coins className="h-3 w-3" />
                  избери
                </button>
              </div>
              <div className="relative">
                <Input
                  ref={paidEURInputRef}
                  id="paid-eur"
                  type="text"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={paidEUR}
                  onChange={(e) => setPaidEUR(normalizeDecimal(e.target.value))}
                  onKeyDown={(e) => handlePaidKeyDown(e, paidBGNInputRef)}
                  onFocus={selectAllOnFocus}
                  onBlur={handlePaidBlur}
                  disabled={!hasDueAmount}
                  className="pr-8"
                />
                {paidEUR && (
                  <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => { setSuppressNextBlurModal(true); setPaidEUR(""); }}
                    className="absolute right-0 top-0 p-2-5 text-slate-400 hover:text-slate-600 z-10"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="paid-bgn" className="text-slate-600">
                  В лева
                </Label>
                <button
                  onClick={() => setShowBGNModal(true)}
                  disabled={!hasDueAmount}
                  className="text-xs text-orange-500 hover:text-orange-600 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Coins className="h-3 w-3" />
                  избери
                </button>
              </div>
              <div className="relative">
                <Input
                  ref={paidBGNInputRef}
                  id="paid-bgn"
                  type="text"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={paidBGN}
                  onChange={(e) => setPaidBGN(normalizeDecimal(e.target.value))}
                  onKeyDown={(e) => handlePaidKeyDown(e, null)}
                  onFocus={selectAllOnFocus}
                  onBlur={handlePaidBlur}
                  disabled={!hasDueAmount}
                  className="pr-8"
                />
                {paidBGN && (
                  <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => { setSuppressNextBlurModal(true); setPaidBGN(""); }}
                    className="absolute right-0 top-0 p-2-5 text-slate-400 hover:text-slate-600 z-10"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Quick pay buttons */}
          {totals.status === "insufficient" && (
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => addQuickPay("EUR")}
                variant="outline"
                className="border-blue-300 text-blue-600 hover:bg-blue-50"
              >
                + {totals.remainingEUR.toFixed(2)} €
              </Button>
              <Button
                onClick={() => addQuickPay("BGN")}
                variant="outline"
                className="border-blue-300 text-blue-600 hover:bg-blue-50"
              >
                + {(totals.remainingEUR * EXCHANGE_RATE).toFixed(2)} лв.
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      {/* Debug counter for interstitials */}
      <p className="text-xs text-muted-foreground text-center">
        Брой изчислени ресто в евро: {Number(localStorage.getItem('calcCount') ?? '0') || 0}
      </p>
      <div className="flex justify-center">
        <button
          className="text-[11px] underline text-slate-500"
          onClick={() => alert(getAdDebugInfo())}
        >
          Debug на рекламата
        </button>
      </div>

      {/* Modals */}
      <CurrencySelectModal
        open={showEURModal}
        onOpenChange={setShowEURModal}
        currency="EUR"
        currentAmount={parseFloat(paidEUR) || 0}
        onSelect={(amount) => {
          if (amount === null) {
            setPaidEUR("");
          } else {
            setPaidEUR(amount.toFixed(2));
          }
        }}
      />

      <CurrencySelectModal
        open={showBGNModal}
        onOpenChange={setShowBGNModal}
        currency="BGN"
        currentAmount={parseFloat(paidBGN) || 0}
        onSelect={(amount) => {
          if (amount === null) {
            setPaidBGN("");
          } else {
            setPaidBGN(amount.toFixed(2));
          }
        }}
      />

      {showFullScreen && (
        <Dialog
          open={showFullScreen}
          onOpenChange={(open) => setShowFullScreen(open)}
        >
          <DialogContent className="max-w-md">
            <DialogHeader className="sr-only">
              <DialogTitle>Ресто за връщане</DialogTitle>
            </DialogHeader>
            <FullScreenChange
              changeEUR={totals.changeInEUR}
              dueEUR={totals.totalDueEUR}
              dueBGN={totals.totalDueBGN}
              paidEUR={totals.totalPaidEUR}
              paidBGN={totals.totalPaidBGN}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
