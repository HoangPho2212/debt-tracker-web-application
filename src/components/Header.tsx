import React from 'react';
import {
  Settings,
  Database,
  Plus,
  UtensilsCrossed,
  FileSpreadsheet,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  WifiOff,
  ExternalLink,
  Lock,
} from 'lucide-react';
import { AppSettings, SyncStatus } from '../types/contracts';

interface HeaderProps {
  settings: AppSettings;
  syncStatus: SyncStatus;
  lastSyncedAt?: string;
  onOpenSettings: () => void;
  onOpenBackup: () => void;
  onOpenQuickAdd: () => void;
  onManualSync?: () => void;
  onLock?: () => void;
  isQuickAddOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  syncStatus,
  lastSyncedAt,
  onOpenSettings,
  onOpenBackup,
  onOpenQuickAdd,
  onManualSync,
  onLock,
  isQuickAddOpen,
}) => {
  const hasSheetUrl = Boolean(settings.googleSheetUrl && settings.googleSheetUrl.trim());

  const handleOpenGoogleSheet = (e: React.MouseEvent) => {
    e.preventDefault();
    if (hasSheetUrl) {
      window.open(settings.googleSheetUrl, '_blank', 'noopener,noreferrer');
    } else {
      onOpenSettings();
    }
  };

  const getSyncStatusBadge = () => {
    switch (syncStatus) {
      case 'syncing':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 animate-pulse">
            <RefreshCw className="w-2.5 h-2.5 animate-spin" />
            <span>Đang lưu Sheets...</span>
          </span>
        );
      case 'synced':
        return (
          <span
            className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 cursor-pointer hover:bg-emerald-100 transition-colors"
            onClick={onManualSync}
            title="Đã đồng bộ 2 chiều lên Google Sheets. Bấm để làm mới ngay."
          >
            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
            <span>
              {lastSyncedAt
                ? `Đã lưu Sheets (${new Date(lastSyncedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })})`
                : 'Đã đồng bộ Sheets'}
            </span>
          </span>
        );
      case 'offline':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
            <WifiOff className="w-2.5 h-2.5" />
            <span>Lưu tạm offline</span>
          </span>
        );
      case 'error':
        return (
          <span
            className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 cursor-pointer"
            onClick={onManualSync}
            title="Lỗi kết nối đồng bộ. Bấm để thử lại."
          >
            <AlertCircle className="w-2.5 h-2.5 text-rose-500" />
            <span>Lỗi đồng bộ (Bấm thử lại)</span>
          </span>
        );
      case 'unconfigured':
      default:
        return (
          <span
            className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-full border border-slate-200 hover:text-emerald-700 hover:border-emerald-300 cursor-pointer transition-colors"
            onClick={onOpenSettings}
            title="Chưa cài đặt link Google Sheets. Bấm để cấu hình."
          >
            <FileSpreadsheet className="w-2.5 h-2.5" />
            <span>Kết nối Sheets</span>
          </span>
        );
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 px-3 sm:px-4 py-2.5 shadow-xs">
      <div className="max-w-xl mx-auto flex items-center justify-between gap-2">
        {/* Brand & App Title */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-sm shadow-orange-500/20 flex-shrink-0">
            <UtensilsCrossed className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-base font-bold text-slate-900 leading-tight truncate">
              {settings.restaurantName || 'Sổ Ghi Nợ Quán Cơm'}
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              {getSyncStatusBadge()}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
          {/* Nút Xem trong Trang tính */}
          <button
            type="button"
            onClick={handleOpenGoogleSheet}
            className={`px-2.5 sm:px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 min-h-[40px] shadow-xs border ${
              hasSheetUrl
                ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300 hover:border-emerald-400'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
            title={
              hasSheetUrl
                ? 'Mở xem trực tiếp trong Google Sheets'
                : 'Cài đặt liên kết Google Sheets'
            }
          >
            <div className="w-5 h-5 rounded-md bg-[#0F9D58] flex items-center justify-center text-white shadow-xs flex-shrink-0">
              <FileSpreadsheet className="w-3.5 h-3.5" />
            </div>
            <span className="hidden xs:inline">Trang Tính</span>
            <ExternalLink className="w-3 h-3 text-emerald-700/70" />
          </button>

          {/* Nút Làm Mới / Đồng Bộ 2 Chiều (Refresh Button) */}
          {onManualSync && (
            <button
              type="button"
              onClick={onManualSync}
              className={`p-2 rounded-xl text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 active:scale-95 transition-all min-w-[40px] min-h-[40px] flex items-center justify-center border border-slate-200 ${
                syncStatus === 'syncing' ? 'text-emerald-600 bg-emerald-50' : ''
              }`}
              title="Làm mới & Tải dữ liệu từ Google Sheets về máy"
              aria-label="Làm mới dữ liệu"
            >
              <RefreshCw className={`w-4 h-4 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
            </button>
          )}

          {/* Quick Add Button */}
          <button
            type="button"
            onClick={onOpenQuickAdd}
            className={`p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 min-h-[40px] min-w-[40px] justify-center ${
              isQuickAddOpen
                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/30'
            }`}
            title="Ghi nợ mới"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Ghi Nợ</span>
          </button>

          {/* Backup / Restore Button */}
          <button
            type="button"
            onClick={onOpenBackup}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 active:scale-95 transition-all min-w-[40px] min-h-[40px] flex items-center justify-center border border-slate-200"
            title="Sao lưu & Phục hồi JSON"
            aria-label="Sao lưu dữ liệu"
          >
            <Database className="w-4 h-4" />
          </button>

          {/* Settings Button */}
          <button
            type="button"
            onClick={onOpenSettings}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 active:scale-95 transition-all min-w-[40px] min-h-[40px] flex items-center justify-center border border-slate-200"
            title="Cài đặt quán & Google Sheets"
            aria-label="Cài đặt quán"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Lock App Button */}
          {onLock && (
            <button
              type="button"
              onClick={onLock}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 active:scale-95 transition-all min-w-[40px] min-h-[40px] flex items-center justify-center border border-slate-200"
              title="Khóa ứng dụng (Cần mật khẩu để mở lại)"
              aria-label="Khóa ứng dụng"
            >
              <Lock className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
