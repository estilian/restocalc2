import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

const EUR_DENOMINATIONS = {
  notes: [500, 200, 100, 50, 20, 10, 5],
  coins: [2, 1, 0.5, 0.2, 0.1, 0.05, 0.02, 0.01]
};

const BGN_DENOMINATIONS = {
  notes: [100, 50, 20, 10, 5],
  coins: [2, 1, 0.5, 0.2, 0.1, 0.05, 0.02, 0.01]
};

interface CurrencySelectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currency: 'EUR' | 'BGN';
  onSelect: (amount: number | null) => void;
  currentAmount?: number;
}

export default function CurrencySelectModal({
  open,
  onOpenChange,
  currency,
  onSelect,
  currentAmount
}: CurrencySelectModalProps) {
  const [selected, setSelected] = useState<{ [key: number]: number }>({});

  const prevOpenRef = useRef(false);

  const denominations = currency === 'EUR' ? EUR_DENOMINATIONS : BGN_DENOMINATIONS;

  const currencySymbol = currency === 'EUR' ? '€' : 'лв.';
  const currencyCoins = currency === 'EUR' ? '¢' : 'ст.';
  const currencyLabel = currency === 'EUR' ? 'евро' : 'лева';

  // Greedy algorithm to calculate optimal denomination combination
  const calculateOptimalCombination = (amount: number): { [key: number]: number } => {
    if (!amount || amount <= 0) return {};
    
    const allDenominations = [...denominations.notes, ...denominations.coins].sort((a, b) => b - a);
    const result: { [key: number]: number } = {};
    let remaining = amount;
    
    for (const denom of allDenominations) {
      if (remaining >= denom) {
        const count = Math.floor(remaining / denom);
        if (count > 0) {
          result[denom] = count;
          remaining = Math.round((remaining - (denom * count)) * 100) / 100;
        }
      }
    }
    
    return result;
  };

  const toggleDenomination = (value: number) => {
    setSelected(prev => ({
      ...prev,
      [value]: (prev[value] || 0) + 1
    }));
  };

  const removeDenomination = (value: number) => {
    setSelected(prev => {
      const newSelected = { ...prev };
      if (newSelected[value] > 1) {
        newSelected[value]--;
      } else {
        delete newSelected[value];
      }
      return newSelected;
    });
  };

  const calculateTotal = () => {
    return Object.entries(selected).reduce((sum, [value, count]) => {
      return sum + (parseFloat(value) * count);
    }, 0);
  };

  // Auto-update the amount in real-time
  useEffect(() => {
    if (!open) return;
    const total = calculateTotal();
    if (total === 0) {
      onSelect(null);
      return;
    }
    onSelect(total);
  }, [selected, open]);

  // Set optimal combination when modal opens with currentAmount
  useEffect(() => {
    const wasOpen = prevOpenRef.current;
    if (!wasOpen && open) {
      if (currentAmount && currentAmount > 0) {
        const optimal = calculateOptimalCombination(currentAmount);
        setSelected(optimal);
      } else {
        setSelected({});
      }
    }
    if (wasOpen && !open) {
      setSelected({});
    }
    prevOpenRef.current = open;
  }, [open, currency]);

  const handleClear = () => {
    setSelected({});
    onSelect(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Избери номинали в {currencyLabel}</DialogTitle>
          <DialogDescription className="sr-only">
            Изберете банкноти и монети за {currencyLabel}. С бутоните добавяте, с клик върху „Избрани“ премахвате.
            Полето „Общо“ се актуализира автоматично.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Auto-suggestion notice */}
          {(currentAmount ?? 0) > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-800">
                ✨ Автоматично предложение за {currentAmount!.toFixed(2)} {currencySymbol} с минимален брой банкноти/монети
              </p>
            </div>
          )}
          {/* Banknotes */}
          <div>
            <h3 className="text-sm text-slate-600 mb-2"><strong>Банкноти в {currencyLabel}:</strong></h3>
            <div className="grid grid-cols-3 gap-2">
              {denominations.notes.map(value => (
                <button
                  key={value}
                  onClick={() => toggleDenomination(value)}
                  className={`p-2 rounded-lg border-2 transition-all ${
                    selected[value]
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-slate-900">{value} {currencySymbol}</div>
                    {selected[value] && (
                      <Badge variant="secondary" className="mt-1">
                        x{selected[value]}
                      </Badge>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Coins */}
          <div>
            <h3 className="text-sm text-slate-600 mb-2">
              <strong>Монети в {currencyLabel}:</strong>
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {denominations.coins.map((value) => {
                const isSubunit = value < 1;
                const displayValue = isSubunit ? Math.round(value * 100) : value;
                const legend = isSubunit ? currencyCoins : currencySymbol;
                return (
                  <button
                    key={value}
                    onClick={() => toggleDenomination(value)}
                    className={`p-1 rounded-lg border-2 transition-all ${
                      selected[value]
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-xs text-slate-900">
                        {displayValue} {legend}
                      </div>
                      {selected[value] && (
                        <Badge variant="secondary" className="mt-1 text-xs">
                          x{selected[value]}
                        </Badge>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected items */}
          {Object.keys(selected).length > 0 && (
            <div className="bg-slate-50 rounded-lg p-3">
              <h3 className="text-sm text-slate-600 mb-2"><strong>Избрани</strong> <small>(натисни, за да изтриеш)</small>:</h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(selected).map(([value, count]) => (
                  <Badge
                    key={value}
                    variant="outline"
                    className="cursor-pointer hover:bg-slate-200"
                    onClick={() => removeDenomination(parseFloat(value))}
                  >
                    {value} x {count}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Total */}
          <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Общо:</span>
              <span className="text-blue-600">
                {calculateTotal().toFixed(2)} {currencySymbol}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              onClick={handleClear}
              variant="outline"
              className="flex-1"
            >
              Изчисти
            </Button>
            <Button
              onClick={() => onOpenChange(false)}
              className="flex-1 bg-blue-500 hover:bg-blue-600"
            >
              Затвори
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
