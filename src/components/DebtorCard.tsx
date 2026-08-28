import React from 'react';
import { Check, Plus, Clock, Phone, ChevronRight, History } from 'lucide-react';
import { DebtorViewState } from '../types/viewState';

interface DebtorCardProps {
  debtor: DebtorViewState;
  onSettle: (debtor: DebtorViewState) => void;
  onAddMoreDebt: (debtor: DebtorViewState) => void;
  onViewDetail: (debtor: DebtorViewState) => void;
}

export const DebtorCard: React.FC<DebtorCardProps> = ({
  debtor,
  onSettle,
  onAddMoreDebt,
  onViewDetail,
}) => {
  const isSettled = debtor.status === 'settled' || debtor.totalDebt === 0;

  return (
    <div
      className={`bg-white rounded-2xl border transition-all duration-200 shadow-xs hover:shadow-md ${
        isSettled
          ? 'border-slate-200/80 opacity-90'
          : 'border-rose-200/90 hover:border-rose-300'
      }`}
    >
      <div className="p-4">
        {/* Customer Info & Debt Amount Row */}
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 truncate">
                {debtor.name}
              </h3>
              {isSettled ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  Đã hết nợ
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                  {debtor.entryCount} lần nợ
                </span>
              )}
            </div>

            {debtor.phone && (
              <a
                href={`tel:${debtor.phone}`}
                className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-emerald-600 mt-0.5"
                onClick={(e) => e.stopPropagation()}
              >
                <Phone className="w-3 h-3 text-slate-400" />
                <span>{debtor.phone}</span>
              </a>
            )}
          </div>

          {/* Amount */}
          <div className="text-right flex-shrink-0">
            <div
              className={`text-lg sm:text-xl font-black tracking-tight ${
                isSettled ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {debtor.formattedTotalDebt}
            </div>
          </div>
        </div>

        {/* Recent Entry Note & Timestamp */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 mb-3">
          <div className="flex items-center gap-1.5 truncate">
            <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="truncate">
              Gần nhất: {debtor.latestEntryDisplayDate || 'Chưa có'}
            </span>
          </div>

          {debtor.history[0]?.note && (
            <span className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md truncate max-w-[140px]">
              {debtor.history[0].note}
            </span>
          )}
        </div>

        {/* Action Buttons Row */}
        <div className="flex items-center gap-2">
          {!isSettled && (
            <button
              type="button"
              onClick={() => onSettle(debtor)}
              className="flex-1 min-h-[44px] py-2 px-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Đã Thanh Toán</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onAddMoreDebt(debtor)}
            className={`min-h-[44px] py-2 px-3 text-xs font-bold rounded-xl flex items-center justify-center gap-1 border active:scale-95 transition-all ${
              isSettled
                ? 'flex-1 bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>+ Ghi Thêm</span>
          </button>

          <button
            type="button"
            onClick={() => onViewDetail(debtor)}
            className="min-h-[44px] py-2 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 flex items-center justify-center gap-1 active:scale-95 transition-all"
            title="Xem chi tiết lịch sử"
          >
            <History className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden xs:inline">Chi tiết</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      </div>
    </div>
  );
};
