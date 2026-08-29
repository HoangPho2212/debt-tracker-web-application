import React, { useState, useEffect, useRef } from 'react';
import { Plus, Minus, Check, DollarSign, FileText, Phone, Clock, Calendar, Truck } from 'lucide-react';
import { CreateDebtInput, DebtorRecord, AppSettings } from '../types/contracts';
import { formatCurrency } from '../utils/formatters';
import { CreateDebtContract } from '../contracts/debtContract';

interface QuickAddFormProps {
  settings: AppSettings;
  existingRecords: DebtorRecord[];
  onSubmit: (input: CreateDebtInput) => void;
  onCancel?: () => void;
  presetCustomerName?: string;
}

const COMMON_NOTES = ['Cơm sườn', 'Cơm gà', 'Thêm trứng', 'Thêm cơm', 'Mang về', 'tại quán'];
const SHIPPING_PRESETS = [0, 5000, 10000, 15000];

export const QuickAddForm: React.FC<QuickAddFormProps> = ({
  settings,
  existingRecords,
  onSubmit,
  onCancel,
  presetCustomerName = '',
}) => {
  const [name, setName] = useState(presetCustomerName);
  const [quantity, setQuantity] = useState<number>(1);
  const [pricePerMeal, setPricePerMeal] = useState<number>(settings.defaultMealPrice || 35000);
  const [shippingFee, setShippingFee] = useState<number>(0);
  const [isCustomShip, setIsCustomShip] = useState<boolean>(false);
  const [note, setNote] = useState('');
  const [phone, setPhone] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Time customization state
  const [timeMode, setTimeMode] = useState<'now' | 'lunch_today' | 'yesterday_lunch' | 'custom'>('now');
  const [customDateTime, setCustomDateTime] = useState<string>(() => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
  });

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (presetCustomerName) {
      setName(presetCustomerName);
      const match = existingRecords.find((r) => r.name.toLowerCase() === presetCustomerName.toLowerCase());
      if (match && match.phone) {
        setPhone(match.phone);
      }
    }
  }, [presetCustomerName, existingRecords]);

  // Update default price if settings change
  useEffect(() => {
    if (!presetCustomerName) {
      setPricePerMeal(settings.defaultMealPrice || 35000);
    }
  }, [settings.defaultMealPrice, presetCustomerName]);

  const filteredSuggestions = existingRecords
    .filter((r) => name.trim() && r.name.toLowerCase().includes(name.trim().toLowerCase()))
    .slice(0, 5);

  const handleSelectSuggestion = (record: DebtorRecord) => {
    setName(record.name);
    if (record.phone) setPhone(record.phone);
    setShowSuggestions(false);
  };

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  const computeFinalTimestamp = (): string | undefined => {
    if (timeMode === 'now') return undefined;

    const now = new Date();
    if (timeMode === 'lunch_today') {
      const lunch = new Date(now);
      lunch.setHours(11, 30, 0, 0);
      return lunch.toISOString();
    }
    if (timeMode === 'yesterday_lunch') {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(12, 0, 0, 0);
      return yesterday.toISOString();
    }
    if (timeMode === 'custom' && customDateTime) {
      const parsed = new Date(customDateTime);
      if (!isNaN(parsed.getTime())) {
        return parsed.toISOString();
      }
    }
    return undefined;
  };

  const totalMealPrice = quantity * pricePerMeal;
  const totalAmount = totalMealPrice + shippingFee;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const inputData: CreateDebtInput = {
      name,
      quantity,
      pricePerMeal,
      shippingFee: shippingFee > 0 ? shippingFee : undefined,
      note: note.trim() || undefined,
      phone: phone.trim() || undefined,
      customTimestamp: computeFinalTimestamp(),
    };

    const validation = CreateDebtContract.validate(inputData);
    if (!validation.isValid) {
      setErrorMsg(validation.errors[0] || 'Vui lòng kiểm tra lại thông tin nhập.');
      return;
    }

    onSubmit(validation.sanitized!);

    // Reset form for next entry
    setName('');
    setQuantity(1);
    setShippingFee(0);
    setIsCustomShip(false);
    setNote('');
    setPhone('');
    setTimeMode('now');
    setErrorMsg(null);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-md transition-all">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
          {presetCustomerName ? `Ghi Thêm Nợ Cho: ${presetCustomerName}` : 'Ghi Nợ Suất Cơm Mới'}
        </h2>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-xs font-semibold text-slate-500 hover:text-slate-700 px-2 py-1 rounded-lg hover:bg-slate-100"
          >
            Đóng
          </button>
        )}
      </div>

      {errorMsg && (
        <div className="mb-3 p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl animate-shake">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Customer Name Input with Instant Search Auto-complete */}
        <div className="relative">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Tên người nợ <span className="text-rose-500">*</span>
          </label>
          <input
            ref={inputRef}
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setShowSuggestions(true);
              setErrorMsg(null);
            }}
            onFocus={() => setShowSuggestions(true)}
            placeholder="VD: Anh Tuấn Viettel, Chị Lan..."
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[44px]"
            required
            autoComplete="off"
          />

          {/* Suggestions Dropdown */}
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden divide-y divide-slate-100">
              <div className="px-3 py-1 bg-slate-50 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                Khách nợ đã có trong sổ
              </div>
              {filteredSuggestions.map((record) => (
                <button
                  key={record.id}
                  type="button"
                  onClick={() => handleSelectSuggestion(record)}
                  className="w-full px-3.5 py-2 text-left text-xs font-medium text-slate-800 hover:bg-emerald-50 flex items-center justify-between transition-colors"
                >
                  <span className="font-semibold">{record.name}</span>
                  <div className="flex items-center gap-2">
                    {record.phone && (
                      <span className="text-slate-400 text-[11px]">{record.phone}</span>
                    )}
                    <span
                      className={`text-[11px] font-bold ${
                        record.status === 'settled' || record.totalDebt === 0
                          ? 'text-emerald-600'
                          : 'text-rose-600'
                      }`}
                    >
                      {record.status === 'settled' || record.totalDebt === 0
                        ? 'Đã trả hết'
                        : `Nợ: ${formatCurrency(record.totalDebt)}`}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quantity & Unit Price Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Quantity */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Số lượng suất
            </label>
            <div className="flex items-center bg-slate-50 border border-slate-300 rounded-xl overflow-hidden min-h-[44px]">
              <button
                type="button"
                onClick={() => handleQuantityChange(-1)}
                className="w-11 h-11 flex items-center justify-center text-slate-700 hover:bg-slate-200 active:bg-slate-300 text-lg font-bold"
                aria-label="Giảm 1 suất"
              >
                <Minus className="w-4 h-4" />
              </button>
              <input
                type="number"
                min="1"
                max="1000"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                className="w-full text-center font-bold text-base text-slate-900 bg-transparent focus:outline-none"
              />
              <button
                type="button"
                onClick={() => handleQuantityChange(1)}
                className="w-11 h-11 flex items-center justify-center text-slate-700 hover:bg-slate-200 active:bg-slate-300 text-lg font-bold"
                aria-label="Tăng 1 suất"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Quantity Chips */}
            <div className="flex gap-1 mt-1.5">
              {[1, 2, 3, 5].map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setQuantity(q)}
                  className={`flex-1 py-1 rounded-lg text-xs font-semibold border transition-all ${
                    quantity === q
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Unit Price */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Đơn giá / suất
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <DollarSign className="w-4 h-4" />
              </div>
              <input
                type="number"
                step="1000"
                min="0"
                value={pricePerMeal}
                onChange={(e) => setPricePerMeal(Math.max(0, Number(e.target.value) || 0))}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[44px]"
              />
            </div>

            {/* Quick Price Chips */}
            <div className="flex gap-1 mt-1.5">
              {[30000, 35000, 40000, 50000].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPricePerMeal(p)}
                  className={`flex-1 py-1 rounded-lg text-[10px] font-semibold border transition-all ${
                    pricePerMeal === p
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  {p / 1000}k
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Phí Giao Hàng (Shipping Fee) */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              <Truck className="w-3.5 h-3.5 text-slate-500" />
              <span>Phí ship (giao hàng)</span>
            </label>
            {shippingFee > 0 && (
              <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                + {formatCurrency(shippingFee)}
              </span>
            )}
          </div>

          <div className="grid grid-cols-5 gap-1">
            {SHIPPING_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => {
                  setShippingFee(preset);
                  setIsCustomShip(false);
                }}
                className={`py-1.5 px-1 rounded-xl text-[11px] font-semibold border transition-all truncate text-center ${
                  !isCustomShip && shippingFee === preset
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {preset === 0 ? '0 đ' : `+${preset / 1000}k`}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setIsCustomShip(true)}
              className={`py-1.5 px-1 rounded-xl text-[11px] font-semibold border transition-all truncate text-center ${
                isCustomShip
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Khác...
            </button>
          </div>

          {isCustomShip && (
            <div className="mt-2 flex items-center gap-2">
              <input
                type="number"
                step="1000"
                min="0"
                value={shippingFee}
                onChange={(e) => setShippingFee(Math.max(0, Number(e.target.value) || 0))}
                placeholder="Nhập phí ship..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[40px]"
                autoFocus
              />
              <span className="text-xs font-bold text-slate-600 whitespace-nowrap">VNĐ</span>
            </div>
          )}
        </div>

        {/* Customizable Time Selection */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>Thời điểm nợ</span>
            </label>
            {timeMode !== 'now' && (
              <span className="text-[11px] text-amber-700 font-medium bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                {timeMode === 'lunch_today' && 'Trưa nay 11:30'}
                {timeMode === 'yesterday_lunch' && 'Trưa hôm qua 12:00'}
                {timeMode === 'custom' && 'Thời gian tùy chọn'}
              </span>
            )}
          </div>

          <div className="grid grid-cols-4 gap-1">
            <button
              type="button"
              onClick={() => setTimeMode('now')}
              className={`py-1.5 px-1 rounded-xl text-[11px] font-semibold border transition-all truncate text-center ${
                timeMode === 'now'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Bây giờ
            </button>
            <button
              type="button"
              onClick={() => setTimeMode('lunch_today')}
              className={`py-1.5 px-1 rounded-xl text-[11px] font-semibold border transition-all truncate text-center ${
                timeMode === 'lunch_today'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Trưa nay
            </button>
            <button
              type="button"
              onClick={() => setTimeMode('yesterday_lunch')}
              className={`py-1.5 px-1 rounded-xl text-[11px] font-semibold border transition-all truncate text-center ${
                timeMode === 'yesterday_lunch'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Hôm qua
            </button>
            <button
              type="button"
              onClick={() => setTimeMode('custom')}
              className={`py-1.5 px-1 rounded-xl text-[11px] font-semibold border transition-all truncate text-center flex items-center justify-center gap-1 ${
                timeMode === 'custom'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Calendar className="w-3 h-3" />
              <span>Tùy chọn</span>
            </button>
          </div>

          {/* Custom Date & Time Picker */}
          {timeMode === 'custom' && (
            <div className="mt-2 p-2.5 bg-slate-50 border border-slate-300 rounded-xl space-y-1">
              <label className="block text-[11px] font-semibold text-slate-600">
                Chọn ngày và giờ nợ cụ thể:
              </label>
              <input
                type="datetime-local"
                value={customDateTime}
                onChange={(e) => setCustomDateTime(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[40px]"
              />
            </div>
          )}
        </div>

        {/* Note / Dish Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Ghi chú món ăn (tùy chọn)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <FileText className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="VD: Cơm sườn, Thêm canh chua..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[40px]"
            />
          </div>

          {/* Quick Note Chips */}
          <div className="flex flex-wrap gap-1 mt-1.5">
            {COMMON_NOTES.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => setNote((prev) => (prev ? `${prev}, ${chip}` : chip))}
                className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 active:scale-95 border border-slate-200 cursor-pointer"
              >
                + {chip}
              </button>
            ))}
          </div>
        </div>

        {/* Optional Phone Number */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Số điện thoại (tùy chọn)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Phone className="w-4 h-4" />
            </div>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="VD: 0987654321"
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[40px]"
            />
          </div>
        </div>

        {/* Calculation Preview & Big Submit Button */}
        <div className="pt-2">
          <div className="flex items-center justify-between text-xs text-slate-600 mb-2 px-1">
            <span>
              Thành tiền: {quantity} suất × {formatCurrency(pricePerMeal)}
              {shippingFee > 0 && ` + Ship ${formatCurrency(shippingFee)}`}
            </span>
            <span className="text-base font-black text-rose-600">
              {formatCurrency(totalAmount)}
            </span>
          </div>

          <button
            type="submit"
            className="w-full min-h-[48px] py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-base rounded-xl shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer"
          >
            <Check className="w-5 h-5" />
            <span>GHI NỢ NGAY ({formatCurrency(totalAmount)})</span>
          </button>
        </div>
      </form>
    </div>
  );
};
