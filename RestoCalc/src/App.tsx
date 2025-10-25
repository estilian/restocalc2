import React, { useState, useEffect } from 'react';
import { Calculator, History, Info } from 'lucide-react';
import CalculatorScreen from './components/CalculatorScreen';
import HistoryScreen from './components/HistoryScreen';
import InfoScreen from './components/InfoScreen';
import { loadSettings, getEffectiveTheme } from './utils/settings';

import { Capacitor } from '@capacitor/core';
import { AdMobPlus } from '@admob-plus/capacitor';

export default function App() {
  const [activeTab, setActiveTab] = useState<'calculator' | 'history' | 'info'>('calculator');

  const goToSettings = () => {
    setActiveTab('info');
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('restocalc:open-settings'));
    }, 0);
  };

  useEffect(() => {
    if (Capacitor.getPlatform() !== 'android') return;
    AdMobPlus.start().catch((e) => console.warn('AdMobPlus.start() failed:', e));
  }, []);
  
  useEffect(() => {
    const settings = loadSettings(); // { theme: 'auto' | 'light' | 'dark', ... }

    const applyTheme = (mode: 'light' | 'dark') => {
      // 1) за Tailwind (class/selector)
      document.documentElement.classList.toggle('dark', mode === 'dark');
      document.documentElement.setAttribute('data-theme', mode);
    };

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

    if (settings.theme === 'auto') {
      applyTheme(prefersDark.matches ? 'dark' : 'light');
      const onChange = (e: MediaQueryListEvent) => applyTheme(e.matches ? 'dark' : 'light');
      prefersDark.addEventListener('change', onChange);
      return () => prefersDark.removeEventListener('change', onChange);
    } else {
      applyTheme(getEffectiveTheme(settings.theme)); // 'light' | 'dark'
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col max-w-md mx-auto">
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'calculator' && <CalculatorScreen />}
        {activeTab === 'history' && <HistoryScreen goToSettings={goToSettings} />}
        {activeTab === 'info' && <InfoScreen />}
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 shadow-lg safe-bottom pb-[calc(0rem+var(--safe-bottom))]">
        <div className="flex items-center justify-around">
          <button
            onClick={() => setActiveTab('calculator')}
            className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${
              activeTab === 'calculator'
                ? 'text-blue-500 dark:text-blue-400'
                : 'text-slate-400 dark:text-slate-500'
            }`}
          >
            <Calculator className="h-6 w-6" />
            <span className="text-xs">Калкулатор</span>
          </button>
          
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${
              activeTab === 'history'
                ? 'text-blue-500 dark:text-blue-400'
                : 'text-slate-400 dark:text-slate-500'
            }`}
          >
            <History className="h-6 w-6" />
            <span className="text-xs">История</span>
          </button>
          
          <button
            onClick={() => setActiveTab('info')}
            className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${
              activeTab === 'info'
                ? 'text-blue-500 dark:text-blue-400'
                : 'text-slate-400 dark:text-slate-500'
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
