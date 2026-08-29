import React, { useState } from 'react';
import {
  X,
  Store,
  DollarSign,
  Phone,
  Save,
  RotateCcw,
  FileSpreadsheet,
  Link2,
  RefreshCw,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { AppSettings } from '../types/contracts';
import { DEFAULT_SETTINGS } from '../services/storage';

interface SettingsModalProps {
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
  onClose: () => void;
  onManualSync?: () => void;
  isSyncing?: boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onSave,
  onClose,
  onManualSync,
  isSyncing = false,
}) => {
  const [restaurantName, setRestaurantName] = useState(settings.restaurantName);
  const [defaultMealPrice, setDefaultMealPrice] = useState<number>(settings.defaultMealPrice);
  const [phoneContact, setPhoneContact] = useState(settings.phoneContact || '');
  const [googleSheetUrl, setGoogleSheetUrl] = useState(settings.googleSheetUrl || '');
  const [appsScriptUrl, setAppsScriptUrl] = useState(settings.appsScriptUrl || '');
  const [showGuide, setShowGuide] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...settings,
      restaurantName: restaurantName.trim() || 'Quán Cơm Bình Dân',
      defaultMealPrice: Math.max(0, Number(defaultMealPrice) || 35000),
      phoneContact: phoneContact.trim() || undefined,
      googleSheetUrl: googleSheetUrl.trim() || undefined,
      appsScriptUrl: appsScriptUrl.trim() || undefined,
      autoSyncEnabled: true,
      currency: 'VNĐ',
    });
    onClose();
  };

  const handleReset = () => {
    setRestaurantName(DEFAULT_SETTINGS.restaurantName);
    setDefaultMealPrice(DEFAULT_SETTINGS.defaultMealPrice);
    setPhoneContact('');
    setGoogleSheetUrl('');
    setAppsScriptUrl('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 animate-fade-in">
      <div className="w-full max-w-lg bg-white rounded-3xl p-5 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Cài Đặt Quán & Google Sheets
              </h3>
              <p className="text-xs text-slate-500">Tùy chỉnh thông tin và tự động đồng bộ</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl min-w-[40px] min-h-[40px] flex items-center justify-center"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Section 1: Thông tin quán */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
              1. Thông Tin Quán Cơm
            </h4>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tên quán cơm
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Store className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={restaurantName}
                  onChange={(e) => setRestaurantName(e.target.value)}
                  placeholder="VD: Quán Cơm Bình Dân Cô Ba"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Đơn giá suất mặc định (VNĐ)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <input
                    type="number"
                    step="1000"
                    min="0"
                    value={defaultMealPrice}
                    onChange={(e) => setDefaultMealPrice(Number(e.target.value) || 0)}
                    placeholder="35000"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Số điện thoại quán
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    value={phoneContact}
                    onChange={(e) => setPhoneContact(e.target.value)}
                    placeholder="VD: 0912345678"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Đồng bộ Google Sheets */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase text-emerald-700 tracking-wider flex items-center gap-1.5">
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>2. Kết Nối Google Sheets (Tự Động Đồng Bộ)</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowGuide((prev) => !prev)}
                className="text-[11px] text-emerald-700 hover:underline flex items-center gap-1 font-medium"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>{showGuide ? 'Ẩn hướng dẫn' : 'Xem hướng dẫn'}</span>
              </button>
            </div>

            {showGuide && (
              <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-2xl text-xs text-emerald-900 space-y-1.5">
                <div className="font-bold">Cách lấy URL Google Apps Script:</div>
                <ol className="list-decimal list-inside space-y-1 text-[11px] text-emerald-800">
                  <li>Tạo 1 trang tính Google Sheets mới.</li>
                  <li>Vào <b>Tiện ích mở rộng (Extensions)</b> ➔ <b>Apps Script</b>.</li>
                  <li>Dán mã trong file <code>google-apps-script/Code.gs</code> vào và bấm Lưu.</li>
                  <li>Bấm <b>Triển khai (Deploy)</b> ➔ <b>Triển khai mới</b> ➔ Loại <b>Ứng dụng web</b> ➔ Chọn quyền truy cập: <b>"Bất kỳ ai" (Anyone)</b>.</li>
                  <li>Copy URL Web App có đuôi <code>/exec</code> và dán vào ô bên dưới.</li>
                </ol>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Link Google Sheets (để mở xem trực tiếp)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                </div>
                <input
                  type="url"
                  value={googleSheetUrl}
                  onChange={(e) => setGoogleSheetUrl(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Google Apps Script Web App URL (để gửi dữ liệu ngầm)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Link2 className="w-4 h-4" />
                </div>
                <input
                  type="url"
                  value={appsScriptUrl}
                  onChange={(e) => setAppsScriptUrl(e.target.value)}
                  placeholder="https://script.google.com/macros/s/.../exec"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Mỗi khi ghi nợ hoặc thanh toán, dữ liệu sẽ tự động gửi lên URL này.
              </p>
            </div>

            {/* Test Sync Button */}
            {onManualSync && appsScriptUrl && (
              <div className="pt-1 flex gap-2">
                <button
                  type="button"
                  onClick={onManualSync}
                  disabled={isSyncing}
                  className="px-3 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Đang đồng bộ...' : 'Đồng Bộ Ngay Bây Giờ'}</span>
                </button>
                {googleSheetUrl && (
                  <a
                    href={googleSheetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1"
                  >
                    <span>Mở Sheets</span>
                    <ExternalLink className="w-3 h-3 text-slate-500" />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-xl flex items-center gap-1"
              title="Đặt lại mặc định"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Mặc định</span>
            </button>
            <button
              type="submit"
              className="flex-1 min-h-[44px] py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all"
            >
              <Save className="w-4 h-4" />
              <span>LƯU CÀI ĐẶT</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
