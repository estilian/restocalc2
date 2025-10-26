import React, { useState, useEffect } from 'react';
import { X, Coins, Maximize2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import CurrencySelectModal from './CurrencySelectModal';
import FullScreenChange from './FullScreenChange';
import AppHeader from './AppHeader';
import { loadSettings } from '../utils/settings';
import { addHistoryItem, getCurrentLocation } from '../utils/history';

const EXCHANGE_RATE = 1.95583;

export default function CalculatorScreen() {
  const [dueEUR, setDueEUR] = useState('');
  const [dueBGN, setDueBGN] = useState('');
  const [paidEUR, setPaidEUR] = useState('');
  const [paidBGN, setPaidBGN] = useState('');
  
  const [showEURModal, setShowEURModal] = useState(false);
  const [showBGNModal, setShowBGNModal] = useState(false);
  const [showFullScreen, setShowFullScreen] = useState(false);

  const dueEURInputRef = React.useRef<HTMLInputElement>(null);

  // Auto-focus on first input when component mounts
  useEffect(() => {
    if (dueEURInputRef.current) {
      dueEURInputRef.current.focus();
    }
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

  const calculateTotals = () => {
    const totalDueEUR = parseFloat(dueEUR || '0');
    const totalDueBGN = parseFloat(dueBGN || '0');
    const totalPaidEUR = parseFloat(paidEUR || '0');
    const totalPaidBGN = parseFloat(paidBGN || '0');

    // Convert everything to EUR for comparison
    const dueInEUR = totalDueEUR || (totalDueBGN / EXCHANGE_RATE);
    const paidInEUR = totalPaidEUR + (totalPaidBGN / EXCHANGE_RATE);
    
    const changeInEUR = paidInEUR - dueInEUR;
    const remainingEUR = dueInEUR - paidInEUR;

    return {
      totalDueEUR,
      totalDueBGN,
      totalPaidEUR,
      totalPaidBGN,
      changeInEUR,
      remainingEUR,
      status: changeInEUR > 0.01 ? 'change' : changeInEUR < -0.01 ? 'insufficient' : 'exact'
    };
  };

  const totals = calculateTotals();

  const clearAll = () => {
    setDueEUR('');
    setDueBGN('');
    setPaidEUR('');
    setPaidBGN('');
  };

  const addQuickPay = (type: 'EUR' | 'BGN') => {
    if (type === 'EUR' && totals.remainingEUR > 0) {
      setPaidEUR((parseFloat(paidEUR || '0') + totals.remainingEUR).toFixed(2));
    } else if (type === 'BGN' && totals.remainingEUR > 0) {
      setPaidBGN((parseFloat(paidBGN || '0') + (totals.remainingEUR * EXCHANGE_RATE)).toFixed(2));
    }
  };

  // Normalize comma to dot for decimal input and prevent negative numbers
  const normalizeDecimal = (value: string): string => {
    let normalized = value.replace(',', '.');
    // Remove minus sign if present
    normalized = normalized.replace('-', '');
    return normalized;
  };

  // Save history when calculation is complete
  const saveToHistory = async () => {
    const settings = loadSettings();
    
    // Only save if history saving is enabled
    if (!settings.saveHistory) {
      return;
    }

    // Only save if there's a valid calculation (has due amount and change)
    if (!hasDueAmount || totals.status !== 'change') {
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
    if (totals.status === 'change') {
      await saveToHistory();
      setShowFullScreen(true);
    }
  };

  // Check if due amount is set
  const hasDueAmount = !!(dueEUR || dueBGN);

  // Handle clearing due EUR (also clears BGN)
  const clearDueEUR = () => {
    setDueEUR('');
    setDueBGN('');
  };

  // Handle clearing due BGN (also clears EUR)
  const clearDueBGN = () => {
    setDueEUR('');
    setDueBGN('');
  };

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <AppHeader title="Калкулатор за ресто (BGN/EUR)" />

      {/* Due Amount Section */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-4 space-y-4">
          <h2 className="text-slate-900">Дължима сума</h2>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="due-eur" className="text-slate-600">В евро (EUR)</Label>
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
                    setDueBGN('');
                  }}
                  className="pr-8"
                />
                {dueEUR && (
                  <button
                    onClick={clearDueEUR}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 z-10"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="due-bgn" className="text-slate-600">В лева (BGN)</Label>
              <div className="relative">
                <Input
                  id="due-bgn"
                  type="text"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={dueBGN}
                  onChange={(e) => {
                    const normalized = normalizeDecimal(e.target.value);
                    setDueBGN(normalized);
                    setDueEUR('');
                  }}
                  className="pr-8"
                />
                {dueBGN && (
                  <button
                    onClick={clearDueBGN}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 z-10"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
            <p className="text-xs text-slate-600 leading-relaxed">
              Посочете дължимата сума в едно от двете полета (лева или евро). След това въведете колко плащате в една или в двете валути. Калкулаторът автоматично ще изчисли рестото в евро.
            </p>
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
                <Label htmlFor="paid-eur" className="text-slate-600">Евро (EUR)</Label>
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
                  id="paid-eur"
                  type="text"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={paidEUR}
                  onChange={(e) => setPaidEUR(normalizeDecimal(e.target.value))}
                  onBlur={handlePaidBlur}
                  disabled={!hasDueAmount}
                  className="pr-8"
                />
                {paidEUR && (
                  <button
                    onClick={() => setPaidEUR('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 z-10"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="paid-bgn" className="text-slate-600">Лева (BGN)</Label>
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
                  id="paid-bgn"
                  type="text"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={paidBGN}
                  onChange={(e) => setPaidBGN(normalizeDecimal(e.target.value))}
                  onBlur={handlePaidBlur}
                  disabled={!hasDueAmount}
                  className="pr-8"
                />
                {paidBGN && (
                  <button
                    onClick={() => setPaidBGN('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 z-10"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Quick pay buttons */}
          {totals.status === 'insufficient' && (
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => addQuickPay('EUR')}
                variant="outline"
                className="border-blue-300 text-blue-600 hover:bg-blue-50"
              >
                + {totals.remainingEUR.toFixed(2)} EUR
              </Button>
              <Button
                onClick={() => addQuickPay('BGN')}
                variant="outline"
                className="border-blue-300 text-blue-600 hover:bg-blue-50"
              >
                + {(totals.remainingEUR * EXCHANGE_RATE).toFixed(2)} BGN
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status Panel */}
      {(dueEUR || dueBGN) && (
        <Card className={`border-2 shadow-md ${
          totals.status === 'insufficient' 
            ? 'border-red-300 bg-red-50' 
            : totals.status === 'exact'
            ? 'border-green-300 bg-green-50'
            : 'border-blue-300 bg-blue-50'
        }`}>
          <CardContent className="p-4 space-y-3">
            {totals.status === 'insufficient' && (
              <div className="space-y-2">
                <p className="text-red-700">Недостатъчна сума</p>
                <p className="text-sm text-red-600">
                  Недостигат: <span className="font-medium">{totals.remainingEUR.toFixed(2)} EUR</span>
                  {' или '}
                  <span className="font-medium">{(totals.remainingEUR * EXCHANGE_RATE).toFixed(2)} BGN</span>
                </p>
              </div>
            )}

            {totals.status === 'exact' && (
              <div>
                <p className="text-green-700">Сумата е точна</p>
                <p className="text-sm text-green-600">Няма ресто</p>
              </div>
            )}

            {totals.status === 'change' && (
              <div className="space-y-2">
                <p className="text-blue-700">Има ресто</p>
                <div className="bg-white rounded-lg p-3 border border-blue-200">
                  <p className="text-sm text-slate-600 mb-1">Ресто за връщане:</p>
                  <p className="text-blue-600">{totals.changeInEUR.toFixed(2)} EUR</p>
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
                disabled={totals.status !== 'change'}
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
      )}

      {/* Modals */}
      <CurrencySelectModal
        open={showEURModal}
        onOpenChange={setShowEURModal}
        currency="EUR"
        currentAmount={parseFloat(paidEUR) || 0}
        onSelect={(amount) => {
          setPaidEUR(amount.toFixed(2));
        }}
      />

      <CurrencySelectModal
        open={showBGNModal}
        onOpenChange={setShowBGNModal}
        currency="BGN"
        currentAmount={parseFloat(paidBGN) || 0}
        onSelect={(amount) => {
          setPaidBGN(amount.toFixed(2));
        }}
      />

      {showFullScreen && (
        <Dialog open onOpenChange={setShowFullScreen}>
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
