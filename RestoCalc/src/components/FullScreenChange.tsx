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
    <div className="p-6 space-y-6">
      {/* Main change amount */}
      <div className="text-center space-y-2">
        <p className="text-slate-600">Ресто за връщане</p>
        <div className="text-6xl text-blue-600 font-bold">
          {changeEUR.toFixed(2)}
        </div>
        <div className="text-2xl text-blue-500">EUR</div>
      </div>

      {/* Divider */}
      <div className="border-t border-slate-200" />

      {/* Transaction details */}
      <div className="space-y-4">
        <div className="bg-slate-50 rounded-lg p-4">
          <h3 className="text-sm text-slate-600 mb-3">Дължима сума</h3>
          <div className="flex items-center justify-between text-slate-700">
            <span>{dueEUR > 0 ? `${dueEUR.toFixed(2)} EUR` : '-'}</span>
            <span className="text-slate-400">/</span>
            <span>{dueBGN > 0 ? `${dueBGN.toFixed(2)} BGN` : '-'}</span>
          </div>
        </div>

        <div className="flex items-center justify-center text-orange-500">
          <ArrowRight className="h-5 w-5" />
        </div>

        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h3 className="text-sm text-blue-600 mb-3">Платена сума</h3>
          <div className="flex items-center justify-between text-blue-700">
            <span>{paidEUR > 0 ? `${paidEUR.toFixed(2)} EUR` : '-'}</span>
            <span className="text-blue-400">/</span>
            <span>{paidBGN > 0 ? `${paidBGN.toFixed(2)} BGN` : '-'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
