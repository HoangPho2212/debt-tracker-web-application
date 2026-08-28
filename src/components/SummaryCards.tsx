import React from 'react';
import { Wallet, Users, Utensils } from 'lucide-react';
import { SummaryStatsViewState } from '../types/viewState';

interface SummaryCardsProps {
  summary: SummaryStatsViewState;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ summary }) => {
  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-3">
      {/* Total Active Debt */}
      <div className="bg-gradient-to-br from-rose-50 to-red-100/80 border border-rose-200/80 rounded-2xl p-3 shadow-xs">
        <div className="flex items-center gap-1.5 text-rose-700 text-xs font-semibold mb-1">
          <Wallet className="w-3.5 h-3.5" />
          <span className="truncate">Tổng nợ quán</span>
        </div>
        <div className="text-base sm:text-lg font-black text-rose-600 tracking-tight line-clamp-1">
          {summary.formattedTotalActiveDebt}
        </div>
        <div className="text-[10px] text-rose-600/80 mt-0.5">
          {summary.totalActiveDebtors} khách chưa trả
        </div>
      </div>

      {/* Total Active Debtors */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-100/70 border border-amber-200/80 rounded-2xl p-3 shadow-xs">
        <div className="flex items-center gap-1.5 text-amber-700 text-xs font-semibold mb-1">
          <Users className="w-3.5 h-3.5" />
          <span className="truncate">Khách đang nợ</span>
        </div>
        <div className="text-base sm:text-lg font-black text-amber-900 tracking-tight">
          {summary.totalActiveDebtors} <span className="text-xs font-normal text-amber-700">người</span>
        </div>
        <div className="text-[10px] text-amber-700/80 mt-0.5">
          {summary.totalSettledDebtors} đã trả nợ
        </div>
      </div>

      {/* Today's Meals & Amount */}
      <div className="bg-gradient-to-br from-emerald-50 to-teal-100/70 border border-emerald-200/80 rounded-2xl p-3 shadow-xs">
        <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-semibold mb-1">
          <Utensils className="w-3.5 h-3.5" />
          <span className="truncate">Hôm nay</span>
        </div>
        <div className="text-base sm:text-lg font-black text-emerald-700 tracking-tight line-clamp-1">
          {summary.formattedTodayRecordedAmount}
        </div>
        <div className="text-[10px] text-emerald-600/80 mt-0.5">
          {summary.todayMealsCount} suất ghi hôm nay
        </div>
      </div>
    </div>
  );
};
