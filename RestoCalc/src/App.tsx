import React, { useState } from 'react';
import { Calculator, History, Info } from 'lucide-react';
import CalculatorScreen from './components/CalculatorScreen';
import HistoryScreen from './components/HistoryScreen';
import InfoScreen from './components/InfoScreen';

export default function App() {
  const [activeTab, setActiveTab] = useState<'calculator' | 'history' | 'info'>('calculator');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-md mx-auto">
      {/* Main Content */}
      <div className="flex-1 overflow-auto pb-20">
        {activeTab === 'calculator' && <CalculatorScreen />}
        {activeTab === 'history' && <HistoryScreen />}
        {activeTab === 'info' && <InfoScreen />}
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-slate-200 shadow-lg">
        <div className="flex items-center justify-around">
          <button
            onClick={() => setActiveTab('calculator')}
            className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${
              activeTab === 'calculator'
                ? 'text-blue-500'
                : 'text-slate-400'
            }`}
          >
            <Calculator className="h-6 w-6" />
            <span className="text-xs">Калкулатор</span>
          </button>
          
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${
              activeTab === 'history'
                ? 'text-blue-500'
                : 'text-slate-400'
            }`}
          >
            <History className="h-6 w-6" />
            <span className="text-xs">История</span>
          </button>
          
          <button
            onClick={() => setActiveTab('info')}
            className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${
              activeTab === 'info'
                ? 'text-blue-500'
                : 'text-slate-400'
            }`}
          >
            <Info className="h-6 w-6" />
            <span className="text-xs">Информация</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
