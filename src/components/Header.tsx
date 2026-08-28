import React from 'react';
import { Settings, Database, Plus, UtensilsCrossed } from 'lucide-react';
import { AppSettings } from '../types/contracts';

interface HeaderProps {
  settings: AppSettings;
  onOpenSettings: () => void;
  onOpenBackup: () => void;
  onOpenQuickAdd: () => void;
  isQuickAddOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  onOpenSettings,
  onOpenBackup,
  onOpenQuickAdd,
  isQuickAddOpen,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 px-4 py-3 shadow-xs">
      <div className="max-w-xl mx-auto flex items-center justify-between">
        {/* Brand & App Title */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-sm shadow-orange-500/20">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 leading-tight line-clamp-1">
              {settings.restaurantName || 'Sổ Ghi Nợ Quán Cơm'}
            </h1>
            <p className="text-xs text-slate-500 flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
              Sổ Nợ Cơm Bình Dân
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onOpenQuickAdd}
            className={`p-2.5 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-all active:scale-95 min-h-[44px] ${
              isQuickAddOpen
                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/30'
            }`}
            title="Ghi nợ mới"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Ghi Nợ</span>
          </button>

          <button
            onClick={onOpenBackup}
            className="p-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 active:scale-95 transition-all min-w-[44px] min-h-[44px] flex items-center justify-center border border-slate-200"
            title="Sao lưu & Phục hồi"
            aria-label="Sao lưu dữ liệu"
          >
            <Database className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenSettings}
            className="p-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 active:scale-95 transition-all min-w-[44px] min-h-[44px] flex items-center justify-center border border-slate-200"
            title="Cài đặt"
            aria-label="Cài đặt quán"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
