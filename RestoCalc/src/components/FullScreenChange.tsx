import React from 'react';
import { ArrowRight } from 'lucide-react';

interface FullScreenChangeProps {
  changeEUR: number;
  dueEUR: number;
  dueBGN: number;
  paidEUR: number;
  paidBGN: number;
}

export default function FullScreenChange({
  changeEUR,
  dueEUR,
  dueBGN,
  paidEUR,
  paidBGN
}: FullScreenChangeProps) {
  return (
    <div className="p-2 space-y-2">
      {/* Main change amount */}
      <div className="text-center space-y-2">
        <p className="text-slate-600">Ресто за получаване</p>
        <div className="text-6xl text-blue-600 font-bold">
          {changeEUR.toFixed(2)}
        </div>
        <div className="text-2xl text-blue-500">EUR</div>
        <p className="text-xs text-red-600 text-center">*от 01.01.2026 не може да се връща ресто в лева</p>
      </div>

      {/* Divider */}
      <div className="border-t border-slate-200" />

      {/* Transaction details */}
      <div className="space-y-4">
        <div className="bg-slate-50 border rounded-lg p-4">
          <h3 className="text-sm text-slate-600 mb-3">Дължима сума</h3>
          <div className="flex items-center justify-between text-slate-700">
            <span>{dueEUR > 0 ? `${dueEUR.toFixed(2)} €` : '-'}</span>
            <span className="text-slate-400">или</span>
            <span>{dueBGN > 0 ? `${dueBGN.toFixed(2)} лв.` : '-'}</span>
          </div>
        </div>

        <div className="flex items-center justify-center text-orange-500">
          <ArrowRight className="h-5 w-5" />
        </div>

        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm text-blue-600 mb-3">Платена сума <small>(в евро)</small></h3>
              <div className="text-blue-500">{paidEUR > 0 ? `${paidEUR.toFixed(2)} €` : '-'}</div>
            </div>
            <div>
              <div className="text-blue-600">и</div>
            </div>
            <div>
              <h3 className="text-sm text-blue-600 mb-3">Платена сума <small>(в лева)</small></h3>
              <div className="text-blue-500 text-end">{paidBGN > 0 ? `${paidBGN.toFixed(2)} лв.` : '-'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
