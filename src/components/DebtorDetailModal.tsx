import React, { useState } from 'react';
import {
  X,
  Trash2,
  Check,
  Phone,
  Edit2,
  Calendar,
  Share2,
  Save,
  Clock,
  Truck,
} from 'lucide-react';
import { DebtorViewState } from '../types/viewState';
import { AppSettings, DebtHistoryEntry } from '../types/contracts';
import { formatCurrency } from '../utils/formatters';

interface DebtorDetailModalProps {
  debtor: DebtorViewState;
  settings: AppSettings;
  onClose: () => void;
  onSettle: (debtorId: string) => void;
  onDeleteEntry: (debtorId: string, entryId: string) => void;
  onUpdateEntry?: (
    debtorId: string,
    entryId: string,
    updates: {
      timestamp?: string;
      quantity?: number;
      pricePerMeal?: number;
      shippingFee?: number;
      note?: string;
    }
  ) => void;
  onUpdateInfo: (debtorId: string, name: string, phone?: string) => void;
  onDeleteDebtor: (debtorId: string) => void;
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const DebtorDetailModal: React.FC<DebtorDetailModalProps> = ({
  debtor,
  settings,
  onClose,
  onSettle,
  onDeleteEntry,
  onUpdateEntry,
  onUpdateInfo,
  onDeleteDebtor,
  onShowToast,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(debtor.name);
  const [editPhone, setEditPhone] = useState(debtor.phone || '');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmDeleteDebtor, setConfirmDeleteDebtor] = useState(false);

  // State for editing individual history entry
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [editEntryDateTime, setEditEntryDateTime] = useState('');
  const [editEntryQty, setEditEntryQty] = useState(1);
  const [editEntryPrice, setEditEntryPrice] = useState(35000);
  const [editEntryShippingFee, setEditEntryShippingFee] = useState(0);
  const [editEntryNote, setEditEntryNote] = useState('');

  const isSettled = debtor.status === 'settled' || debtor.totalDebt === 0;

  const handleSaveInfo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) {
      onShowToast('Tên khách không được để trống.', 'error');
      return;
    }
    onUpdateInfo(debtor.id, editName.trim(), editPhone.trim() || undefined);
    setIsEditing(false);
    onShowToast('Đã cập nhật thông tin khách hàng.', 'success');
  };

  const handleStartEditEntry = (entry: DebtHistoryEntry) => {
    setEditingEntryId(entry.entryId);
    const d = new Date(entry.timestamp);
    const pad = (n: number) => String(n).padStart(2, '0');
    const localDt = isNaN(d.getTime())
      ? ''
      : `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    setEditEntryDateTime(localDt);
    setEditEntryQty(entry.quantity || 1);
    setEditEntryPrice(entry.pricePerMeal || 35000);
    setEditEntryShippingFee(entry.shippingFee || 0);
    setEditEntryNote(entry.note || '');
  };

  const handleSaveEditEntry = (entryId: string) => {
    if (!onUpdateEntry) return;

    let isoTimestamp: string | undefined = undefined;
    if (editEntryDateTime) {
      const parsed = new Date(editEntryDateTime);
      if (!isNaN(parsed.getTime())) {
        isoTimestamp = parsed.toISOString();
      }
    }

    onUpdateEntry(debtor.id, entryId, {
      timestamp: isoTimestamp,
      quantity: Math.max(1, Number(editEntryQty) || 1),
      pricePerMeal: Math.max(0, Number(editEntryPrice) || 0),
      shippingFee: Math.max(0, Number(editEntryShippingFee) || 0),
      note: editEntryNote.trim(),
    });

    setEditingEntryId(null);
    onShowToast('Đã cập nhật chi tiết bữa ăn nợ.', 'success');
  };

  const handleCopyBill = async () => {
    let billText = `📝 [${settings.restaurantName || 'QUÁN CƠM'}] CHI TIẾT CÔNG NỢ\n`;
    billText += `Khách hàng: ${debtor.name}\n`;
    if (debtor.phone) billText += `SĐT: ${debtor.phone}\n`;
    billText += `-------------------------\n`;

    debtor.history.forEach((h, idx) => {
      billText += `${idx + 1}. ${h.displayDate || h.timestamp}: ${h.quantity} suất (${formatCurrency(h.pricePerMeal)})`;
      if (h.shippingFee && h.shippingFee > 0) {
        billText += ` + Ship ${formatCurrency(h.shippingFee)}`;
      }
      billText += ` = ${formatCurrency(h.amount)}`;
      if (h.note) billText += ` [${h.note}]`;
      billText += `\n`;
    });

    billText += `-------------------------\n`;
    billText += `👉 TỔNG NỢ: ${debtor.formattedTotalDebt}\n`;
    if (settings.phoneContact) billText += `Liên hệ quán: ${settings.phoneContact}\n`;

    try {
      await navigator.clipboard.writeText(billText);
      onShowToast('Đã sao chép hóa đơn nợ vào Clipboard (Zalo/SMS)!', 'success');
    } catch {
      onShowToast('Không thể sao chép tự động.', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden animate-slide-up sm:animate-scale-up">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/80 flex items-start justify-between">
          <div className="flex-1 pr-2">
            {!isEditing ? (
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 line-clamp-1">
                  {debtor.name}
                </h2>
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded min-w-[32px] min-h-[32px] flex items-center justify-center"
                  title="Sửa tên/SĐT"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <form onSubmit={handleSaveInfo} className="space-y-2 mt-1">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-sm font-bold border border-emerald-500 rounded-lg bg-white"
                  placeholder="Tên khách"
                />
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                  placeholder="Số điện thoại"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded-lg shadow-xs"
                  >
                    Lưu
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1 bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
                  >
                    Hủy
                  </button>
                </div>
              </form>
            )}

            {!isEditing && debtor.phone && (
              <a
                href={`tel:${debtor.phone}`}
                className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-emerald-600 mt-1"
              >
                <Phone className="w-3 h-3 text-emerald-600" />
                <span>{debtor.phone}</span>
              </a>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-full transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Total Debt Banner */}
        <div
          className={`p-4 ${
            isSettled
              ? 'bg-emerald-50/70 border-b border-emerald-100'
              : 'bg-rose-50/70 border-b border-rose-100'
          } flex items-center justify-between`}
        >
          <div>
            <span className="text-xs font-semibold text-slate-500 block">
              Tổng số tiền đang nợ
            </span>
            <span
              className={`text-2xl font-black ${
                isSettled ? 'text-emerald-700' : 'text-rose-600'
              }`}
            >
              {debtor.formattedTotalDebt}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyBill}
              className="px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 active:scale-95 transition-all"
              title="Sao chép hóa đơn gửi Zalo/SMS"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Gửi Zalo</span>
            </button>

            {!isSettled && (
              <button
                type="button"
                onClick={() => {
                  onSettle(debtor.id);
                  onShowToast(`Đã thu hết nợ của ${debtor.name}!`, 'success');
                }}
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 active:scale-95 transition-all"
              >
                <Check className="w-4 h-4" />
                <span>Đã Thu Tiền</span>
              </button>
            )}
          </div>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Lịch sử các lần ghi nợ ({debtor.history.length})
            </h3>
          </div>

          {debtor.history.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              Chưa có lịch sử bữa ăn nào được ghi nhận.
            </div>
          ) : (
            <div className="space-y-2">
              {debtor.history.map((entry) => {
                const isEditingThisEntry = editingEntryId === entry.entryId;

                if (isEditingThisEntry) {
                  return (
                    <div
                      key={entry.entryId}
                      className="p-3.5 bg-amber-50/80 rounded-xl border border-amber-300 space-y-2.5 shadow-sm"
                    >
                      <div className="flex items-center justify-between text-xs font-bold text-amber-900 border-b border-amber-200/80 pb-1.5">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-amber-700" />
                          <span>Chỉnh sửa ngày giờ & chi tiết</span>
                        </span>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                          Ngày & Giờ nợ:
                        </label>
                        <input
                          type="datetime-local"
                          value={editEntryDateTime}
                          onChange={(e) => setEditEntryDateTime(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                            Số suất:
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={editEntryQty}
                            onChange={(e) => setEditEntryQty(Number(e.target.value) || 1)}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                            Đơn giá (VNĐ):
                          </label>
                          <input
                            type="number"
                            step="1000"
                            min="0"
                            value={editEntryPrice}
                            onChange={(e) => setEditEntryPrice(Number(e.target.value) || 0)}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                            Phí ship (VNĐ):
                          </label>
                          <input
                            type="number"
                            step="1000"
                            min="0"
                            value={editEntryShippingFee}
                            onChange={(e) => setEditEntryShippingFee(Number(e.target.value) || 0)}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                          Ghi chú món ăn:
                        </label>
                        <input
                          type="text"
                          value={editEntryNote}
                          onChange={(e) => setEditEntryNote(e.target.value)}
                          placeholder="VD: Cơm sườn trứng..."
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900"
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setEditingEntryId(null)}
                          className="px-3 py-1.5 bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
                        >
                          Hủy
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveEditEntry(entry.entryId)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>Lưu Thay Đổi</span>
                        </button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={entry.entryId}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-start justify-between gap-2"
                  >
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{entry.displayDate || entry.timestamp}</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-600">
                        <span className="font-bold text-slate-800">
                          {entry.quantity} suất
                        </span>
                        <span>×</span>
                        <span>{formatCurrency(entry.pricePerMeal)}</span>
                        {entry.shippingFee && entry.shippingFee > 0 && (
                          <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-amber-800 bg-amber-100/80 px-1.5 py-0.2 rounded border border-amber-200">
                            <Truck className="w-2.5 h-2.5 text-amber-700" />
                            + Ship {formatCurrency(entry.shippingFee)}
                          </span>
                        )}
                        <span>=</span>
                        <span className="font-bold text-rose-600">
                          {formatCurrency(entry.amount)}
                        </span>
                      </div>

                      {entry.note && (
                        <div className="text-xs text-slate-500 italic bg-white px-2 py-0.5 rounded border border-slate-100 inline-block mt-0.5 truncate max-w-full">
                          Món: {entry.note}
                        </div>
                      )}
                    </div>

                    {/* Actions: Edit or Delete */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {onUpdateEntry && confirmDeleteId !== entry.entryId && (
                        <button
                          type="button"
                          onClick={() => handleStartEditEntry(entry)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg min-w-[32px] min-h-[32px] flex items-center justify-center cursor-pointer"
                          title="Sửa ngày giờ / chi tiết / phí ship"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {confirmDeleteId === entry.entryId ? (
                        <div className="flex flex-col gap-1 items-end">
                          <span className="text-[10px] text-rose-600 font-medium">Xóa?</span>
                          <div className="flex gap-1">
                            <button
                              onClick={() => {
                                onDeleteEntry(debtor.id, entry.entryId);
                                setConfirmDeleteId(null);
                                onShowToast('Đã xóa bữa ăn nợ này.', 'info');
                              }}
                              className="px-2 py-1 bg-rose-600 text-white text-xs font-bold rounded"
                            >
                              Có
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-2 py-1 bg-slate-200 text-slate-700 text-xs rounded"
                            >
                              Không
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteId(entry.entryId)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors min-w-[32px] min-h-[32px] flex items-center justify-center cursor-pointer"
                          title="Xóa bữa ăn này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer: Delete Entire Debtor Profile */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          {!confirmDeleteDebtor ? (
            <button
              onClick={() => setConfirmDeleteDebtor(true)}
              className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1.5 py-1 px-2 rounded-lg hover:bg-rose-50 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xóa hồ sơ khách này</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-rose-600 font-bold">
                Xóa vĩnh viễn khách này?
              </span>
              <button
                onClick={() => {
                  onDeleteDebtor(debtor.id);
                  onClose();
                  onShowToast(`Đã xóa hồ sơ khách hàng ${debtor.name}.`, 'info');
                }}
                className="px-2.5 py-1 bg-rose-600 text-white text-xs font-bold rounded-lg shadow-xs"
              >
                Xác nhận
              </button>
              <button
                onClick={() => setConfirmDeleteDebtor(false)}
                className="px-2.5 py-1 bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
              >
                Hủy
              </button>
            </div>
          )}

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs rounded-xl cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
