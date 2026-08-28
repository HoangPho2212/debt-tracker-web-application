import React from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import { DebtorViewState } from '../types/viewState';

interface SettleConfirmModalProps {
  debtor: DebtorViewState | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export const SettleConfirmModal: React.FC<SettleConfirmModalProps> = ({
  debtor,
  onConfirm,
  onCancel,
}) => {
  if (!debtor) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl space-y-4 animate-scale-up">
        <div className="flex items-center justify-between">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <button
            onClick={onCancel}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>
          <h3 className="text-base font-bold text-slate-900">
            Xác nhận thanh toán nợ?
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Đánh dấu đã thu đủ tiền cơm từ khách hàng:
          </p>
        </div>

        <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-100 text-center">
          <div className="text-sm font-bold text-slate-900">{debtor.name}</div>
          <div className="text-2xl font-black text-emerald-700 mt-1">
            {debtor.formattedTotalDebt}
          </div>
          <div className="text-[11px] text-emerald-800/80 mt-0.5">
            ({debtor.entryCount} lần nợ trước đó)
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <AlertCircle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
          <span>Lịch sử các bữa ăn vẫn sẽ được lưu trữ đầy đủ.</span>
        </div>

        <div className="flex flex-col gap-2 pt-1">
          <button
            type="button"
            onClick={onConfirm}
            className="w-full min-h-[48px] py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>XÁC NHẬN ĐÃ THU TIỀN</span>
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="w-full min-h-[40px] py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl"
          >
            Để sau
          </button>
        </div>
      </div>
    </div>
  );
};
