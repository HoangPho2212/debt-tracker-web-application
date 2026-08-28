import React, { useState } from 'react';
import {
  X,
  Trash2,
  Check,
  Phone,
  Edit2,
  Calendar,
  Share2,
} from 'lucide-react';
import { DebtorViewState } from '../types/viewState';
import { AppSettings } from '../types/contracts';
import { formatCurrency } from '../utils/formatters';

interface DebtorDetailModalProps {
  debtor: DebtorViewState;
  settings: AppSettings;
  onClose: () => void;
  onSettle: (debtorId: string) => void;
  onDeleteEntry: (debtorId: string, entryId: string) => void;
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
  onUpdateInfo,
  onDeleteDebtor,
  onShowToast,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(debtor.name);
  const [editPhone, setEditPhone] = useState(debtor.phone || '');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmDeleteDebtor, setConfirmDeleteDebtor] = useState(false);

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

  const handleCopyBill = async () => {
    let billText = `📝 [${settings.restaurantName || 'QUÁN CƠM'}] CHI TIẾT CÔNG NỢ\n`;
    billText += `Khách hàng: ${debtor.name}\n`;
    if (debtor.phone) billText += `SĐT: ${debtor.phone}\n`;
    billText += `-------------------------\n`;

    debtor.history.forEach((h, idx) => {
      billText += `${idx + 1}. ${h.displayDate || h.timestamp}: ${h.quantity} suất (${formatCurrency(h.pricePerMeal)}) = ${formatCurrency(h.amount)}`;
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
                  className="p-1 text-slate-400 hover:text-slate-600 rounded"
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
                  className="w-full px-2.5 py-1 text-sm font-bold border border-emerald-500 rounded-lg"
                  placeholder="Tên khách"
                />
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-2.5 py-1 text-xs border border-slate-300 rounded-lg"
                  placeholder="Số điện thoại"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="px-3 py-1 bg-emerald-600 text-white text-xs font-semibold rounded-lg"
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
                className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-emerald-600 mt-1"
              >
                <Phone className="w-3 h-3 text-slate-400" />
                <span>{debtor.phone}</span>
              </a>
            )}

            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Tổng nợ:</span>
              <span
                className={`text-xl font-black ${
                  isSettled ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {debtor.formattedTotalDebt}
              </span>
              {isSettled && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  Đã thanh toán
                </span>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
              Lịch sử các lần ăn nợ ({debtor.history.length})
            </h4>
            {debtor.history.length > 0 && (
              <button
                type="button"
                onClick={handleCopyBill}
                className="text-xs text-emerald-700 font-semibold flex items-center gap-1 hover:underline active:scale-95"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Sao chép gửi Zalo</span>
              </button>
            )}
          </div>

          {debtor.history.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              Chưa có bản ghi lịch sử nào.
            </div>
          ) : (
            <div className="space-y-2.5">
              {debtor.history.map((entry) => (
                <div
                  key={entry.entryId}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-start justify-between gap-3"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{entry.displayDate || entry.timestamp}</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <span className="font-bold text-slate-800">
                        {entry.quantity} suất
                      </span>
                      <span>×</span>
                      <span>{formatCurrency(entry.pricePerMeal)}</span>
                      <span>=</span>
                      <span className="font-bold text-rose-600">
                        {formatCurrency(entry.amount)}
                      </span>
                    </div>

                    {entry.note && (
                      <div className="text-xs text-slate-500 italic bg-white px-2 py-0.5 rounded border border-slate-100 inline-block mt-0.5">
                        Món: {entry.note}
                      </div>
                    )}
                  </div>

                  {/* Delete individual entry */}
                  {confirmDeleteId === entry.entryId ? (
                    <div className="flex flex-col gap-1 items-end">
                      <span className="text-[10px] text-rose-600 font-medium">Xóa bữa này?</span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            onDeleteEntry(debtor.id, entry.entryId);
                            setConfirmDeleteId(null);
                            onShowToast('Đã xóa bữa ăn nợ này.', 'info');
                          }}
                          className="px-2 py-1 bg-rose-600 text-white text-[10px] font-bold rounded"
                        >
                          Xóa
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-2 py-1 bg-slate-200 text-slate-700 text-[10px] rounded"
                        >
                          Hủy
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(entry.entryId)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg min-w-[36px] min-h-[36px] flex items-center justify-center transition-colors"
                      title="Xóa lần nợ này"
                      aria-label="Xóa lần nợ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-2.5">
          {!isSettled && (
            <button
              type="button"
              onClick={() => {
                onSettle(debtor.id);
                onClose();
              }}
              className="w-full min-h-[48px] py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
            >
              <Check className="w-5 h-5" />
              <span>ĐÃ THU TIỀN / THANH TOÁN HẾT NỢ</span>
            </button>
          )}

          <div className="flex items-center justify-between pt-1">
            {confirmDeleteDebtor ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-rose-600 font-bold">Xóa hẳn khách này?</span>
                <button
                  type="button"
                  onClick={() => {
                    onDeleteDebtor(debtor.id);
                    onClose();
                    onShowToast(`Đã xóa hồ sơ khách "${debtor.name}".`, 'info');
                  }}
                  className="px-2.5 py-1 bg-rose-600 text-white text-xs font-bold rounded-lg"
                >
                  Xóa Ngay
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDeleteDebtor(false)}
                  className="px-2.5 py-1 bg-slate-200 text-slate-700 text-xs rounded-lg"
                >
                  Hủy
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDeleteDebtor(true)}
                className="text-xs text-rose-600 hover:text-rose-800 flex items-center gap-1 font-medium p-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa hồ sơ khách</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-xl"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
