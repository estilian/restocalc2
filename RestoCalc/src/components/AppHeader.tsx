import React from 'react';
import appIcon from 'figma:asset/d1589902aa5001fd4669e9583f36428dbc3f3c88.png';

interface AppHeaderProps {
  title: string;
  subtitle?: string;
}

export default function AppHeader({ title, subtitle }: AppHeaderProps) {
  return (
    <div className="bg-white border-b border-slate-200 -mx-4 -mt-4 px-4 py-3 mb-5 sticky top-0 z-10">
      <div className="flex items-center gap-2.5">
        <img 
          src={appIcon} 
          alt="RestoCalc" 
          className="w-7 h-7 rounded-lg"
        />
        <div className="flex-1">
          <h2 className="text-slate-700">{title}</h2>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
}
