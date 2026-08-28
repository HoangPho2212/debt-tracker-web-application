import React, { useState, useEffect, useRef } from 'react';
import { Plus, Minus, Check, User, DollarSign, FileText, Phone, } from 'lucide-react';
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
  const [note, setNote] = useState('');
  const [phone, setPhone] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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

  const totalAmount = quantity * pricePerMeal;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const inputData: CreateDebtInput = {
      name,
      quantity,
      pricePerMeal,
      note: note.trim() || undefined,
      phone: phone.trim() || undefined,
    };

    const validation = CreateDebtContract.validate(inputData);
    if (!validation.isValid) {
      setErrorMsg(validation.errors[0] || 'Vui lòng kiểm tra lại thông tin nhập.');
      return;
    }

    onSubmit(validation.sanitized!);
    // Reset form for next fast entry
    setName('');
    setQuantity(1);
    setNote('');
    setPhone('');
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
            className="text-xs text-slate-500 hover:text-slate-700 px-2 py-1 rounded"
          >
            Đóng
          </button>
        )}
      </div>

      {errorMsg && (
        <div className="mb-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Customer Name Input with Autocomplete */}
        <div className="relative">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Tên khách hàng <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <User className="w-4 h-4" />
            </div>
            <input
              ref={inputRef}
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              placeholder="VD: Anh Tuấn Viettel, Chị Lan..."
              className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent min-h-[44px]"
              autoComplete="off"
            />
          </div>

          {/* Autocomplete Dropdown */}
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden divide-y divide-slate-100">
              {filteredSuggestions.map((sug) => (
                <button
                  key={sug.id}
                  type="button"
                  onClick={() => handleSelectSuggestion(sug)}
                  className="w-full px-3 py-2 text-left text-xs font-medium text-slate-800 hover:bg-emerald-50 flex items-center justify-between"
                >
                  <span className="font-semibold">{sug.name}</span>
                  <span className="text-slate-500">
                    {sug.totalDebt > 0 ? `Đang nợ: ${formatCurrency(sug.totalDebt)}` : 'Đã hết nợ'}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quantity & Unit Price Row */}
        <div className="grid grid-cols-2 gap-3">
          {/* Quantity Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Số lượng suất
            </label>
            <div className="flex items-center bg-slate-50 border border-slate-300 rounded-xl overflow-hidden min-h-[44px]">
              <button
                type="button"
                onClick={() => handleQuantityChange(-1)}
                className="w-11 h-11 flex items-center justify-center text-slate-700 hover:bg-slate-200 active:bg-slate-300 transition-colors"
                aria-label="Giảm 1 suất"
              >
                <Minus className="w-4 h-4" />
              </button>
              <input
                type="number"
                min="1"
                max="1000"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full text-center font-bold text-base text-slate-900 bg-transparent focus:outline-none"
              />
              <button
                type="button"
                onClick={() => handleQuantityChange(1)}
                className="w-11 h-11 flex items-center justify-center text-slate-700 hover:bg-slate-200 active:bg-slate-300 transition-colors"
                aria-label="Tăng 1 suất"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Quantity Presets */}
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
              Đơn giá / suất (đ)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                <DollarSign className="w-3.5 h-3.5" />
              </div>
              <input
                type="number"
                step="1000"
                min="0"
                value={pricePerMeal}
                onChange={(e) => setPricePerMeal(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full pl-7 pr-2.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[44px]"
              />
            </div>
            {/* Quick Price Presets */}
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
                className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 active:scale-95 border border-slate-200"
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
              Thành tiền ({quantity} suất × {formatCurrency(pricePerMeal)}):
            </span>
            <span className="text-base font-black text-rose-600">
              {formatCurrency(totalAmount)}
            </span>
          </div>

          <button
            type="submit"
            className="w-full min-h-[48px] py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-base rounded-xl shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
          >
            <Check className="w-5 h-5" />
            <span>GHI NỢ NGAY ({formatCurrency(totalAmount)})</span>
          </button>
        </div>
      </form>
    </div>
  );
};
