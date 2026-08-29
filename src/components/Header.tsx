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
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 animate-pulse">
            <RefreshCw className="w-3 h-3 animate-spin" />
            <span>Đang lưu Sheets...</span>
          </span>
        );
      case 'synced':
        return (
          <span
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 cursor-pointer hover:bg-emerald-100 active:scale-95 transition-all"
            onClick={onManualSync}
            title="Đã đồng bộ 2 chiều. Bấm để làm mới ngay."
          >
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>
              {lastSyncedAt
                ? `Đã lưu Sheets (${new Date(lastSyncedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })})`
                : 'Đã lưu Sheets'}
            </span>
          </span>
        );
      case 'offline':
        return (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
            <WifiOff className="w-3 h-3" />
            <span>Lưu tạm offline</span>
          </span>
        );
      case 'error':
        return (
          <span
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200 cursor-pointer hover:bg-rose-100 active:scale-95 transition-all"
            onClick={onManualSync}
            title="Lỗi kết nối đồng bộ. Bấm để thử lại."
          >
            <AlertCircle className="w-3 h-3 text-rose-500" />
            <span>Lỗi đồng bộ (Thử lại)</span>
          </span>
        );
      case 'unconfigured':
      default:
        return (
          <span
            className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200 hover:text-emerald-700 hover:border-emerald-300 cursor-pointer transition-all"
            onClick={onOpenSettings}
            title="Chưa cài đặt link Google Sheets. Bấm để cấu hình."
          >
            <FileSpreadsheet className="w-3 h-3" />
            <span>Kết nối Sheets</span>
          </span>
        );
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 px-3 sm:px-4 py-2.5 shadow-xs">
      <div className="max-w-xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-2">
        {/* TẦNG 1: TÊN QUÁN CƠM & TRẠNG THÁI ĐỒNG BỘ (Rộng rãi, không bị cắt chữ) */}
        <div className="flex items-center justify-between sm:justify-start gap-2.5 min-w-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-sm shadow-orange-500/25 flex-shrink-0">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-black text-slate-900 leading-tight tracking-tight">
                {settings.restaurantName || 'Sổ Ghi Nợ Quán Cơm'}
              </h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                {getSyncStatusBadge()}
              </div>
            </div>
          </div>
        </div>

        {/* TẦNG 2: THANH PHÍM CHỨC NĂNG (Nút to 44px, phân cấp màu sắc rõ ràng) */}
        <div className="flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto">
          {/* Nút Xem trong Trang tính Google Sheets */}
          <button
            type="button"
            onClick={handleOpenGoogleSheet}
            className={`flex-1 sm:flex-initial px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 min-h-[42px] shadow-xs border cursor-pointer ${
              hasSheetUrl
                ? 'bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 text-emerald-800 border-emerald-300'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
            title="Mở Google Sheets trực tiếp"
            aria-label="Xem trong Trang tính"
          >
            <div className="w-5 h-5 rounded-md bg-[#0F9D58] flex items-center justify-center text-white shadow-xs flex-shrink-0">
              <FileSpreadsheet className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold">Trang Tính</span>
            <ExternalLink className="w-3 h-3 text-emerald-700/70" />
          </button>

          {/* Nút Làm Mới / Đồng Bộ 2 Chiều */}
          {onManualSync && (
            <button
              type="button"
              onClick={onManualSync}
              className={`p-2.5 sm:px-3 rounded-xl text-xs font-bold text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 active:scale-95 transition-all min-w-[42px] min-h-[42px] flex items-center justify-center gap-1 border border-slate-200 bg-slate-50 cursor-pointer ${
                syncStatus === 'syncing' ? 'text-emerald-600 bg-emerald-50 border-emerald-300' : ''
              }`}
              title="Làm mới & Tải dữ liệu từ Google Sheets về máy"
              aria-label="Làm mới dữ liệu"
            >
              <RefreshCw className={`w-4 h-4 ${syncStatus === 'syncing' ? 'animate-spin text-emerald-600' : ''}`} />
              <span className="hidden xs:inline sm:hidden">Làm mới</span>
            </button>
          )}

          {/* Nút Ghi Nợ Mới */}
          <button
            type="button"
            onClick={onOpenQuickAdd}
            className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 min-h-[42px] cursor-pointer ${
              isQuickAddOpen
                ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/30'
            }`}
            title="Mở form ghi nợ mới"
            aria-label="Ghi Nợ"
          >
            <Plus className="w-4 h-4" />
            <span>Ghi Nợ</span>
          </button>

          {/* Nút Sao Lưu / Khôi Phục JSON */}
          <button
            type="button"
            onClick={onOpenBackup}
            className="p-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 active:scale-95 transition-all min-w-[42px] min-h-[42px] flex items-center justify-center border border-slate-200 bg-slate-50 cursor-pointer"
            title="Sao lưu & Phục hồi JSON"
            aria-label="Sao lưu dữ liệu"
          >
            <Database className="w-4 h-4" />
          </button>

          {/* Nút Cài Đặt Quán */}
          <button
            type="button"
            onClick={onOpenSettings}
            className="p-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 active:scale-95 transition-all min-w-[42px] min-h-[42px] flex items-center justify-center border border-slate-200 bg-slate-50 cursor-pointer"
            title="Cài đặt quán & Google Sheets"
            aria-label="Cài đặt quán"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Nút Khóa Ứng Dụng */}
          {onLock && (
            <button
              type="button"
              onClick={onLock}
              className="p-2.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 active:scale-95 transition-all min-w-[42px] min-h-[42px] flex items-center justify-center border border-slate-200 bg-slate-50 cursor-pointer"
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
