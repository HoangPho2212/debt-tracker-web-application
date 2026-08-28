import React, { useState } from 'react';
import { X, Store, DollarSign, Phone, Save, RotateCcw } from 'lucide-react';
import { AppSettings } from '../types/contracts';
import { DEFAULT_SETTINGS } from '../services/storage';

interface SettingsModalProps {
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onSave,
  onClose,
}) => {
  const [restaurantName, setRestaurantName] = useState(settings.restaurantName);
  const [defaultMealPrice, setDefaultMealPrice] = useState<number>(settings.defaultMealPrice);
  const [phoneContact, setPhoneContact] = useState(settings.phoneContact || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      restaurantName: restaurantName.trim() || 'Quán Cơm Bình Dân',
      defaultMealPrice: Math.max(0, Number(defaultMealPrice) || 35000),
      phoneContact: phoneContact.trim() || undefined,
      currency: 'VNĐ',
    });
    onClose();
  };

  const handleReset = () => {
    setRestaurantName(DEFAULT_SETTINGS.restaurantName);
    setDefaultMealPrice(DEFAULT_SETTINGS.defaultMealPrice);
    setPhoneContact('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-3xl p-5 shadow-2xl space-y-4 animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Cài Đặt Quán Cơm
              </h3>
              <p className="text-xs text-slate-500">Tùy chỉnh thông tin và đơn giá</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Đơn giá suất cơm mặc định (VNĐ)
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
            <p className="text-[11px] text-slate-400 mt-1">
              Giá này sẽ tự động điền sẵn khi mở form ghi nợ mới.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Số điện thoại quán (đính kèm vào bill)
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

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
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
