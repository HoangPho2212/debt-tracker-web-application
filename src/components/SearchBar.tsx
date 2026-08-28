import React from 'react';
import { Search, X } from 'lucide-react';
import { DebtFilterType } from '../types/viewState';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeFilter: DebtFilterType;
  onFilterChange: (filter: DebtFilterType) => void;
  activeCount: number;
  settledCount: number;
  totalCount: number;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange,
  activeCount,
  settledCount,
  totalCount,
}) => {
  return (
    <div className="space-y-2.5">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Tìm tên khách, số ĐT, món ăn..."
          className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs min-h-[44px]"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
            aria-label="Xóa tìm kiếm"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex bg-slate-100/90 p-1 rounded-xl gap-1">
        <button
          type="button"
          onClick={() => onFilterChange('all')}
          className={`flex-1 py-2 px-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 min-h-[38px] ${
            activeFilter === 'all'
              ? 'bg-white text-slate-900 shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>Tất cả</span>
          <span className="px-1.5 py-0.2 bg-slate-200/70 text-slate-700 rounded-full text-[10px]">
            {totalCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => onFilterChange('active')}
          className={`flex-1 py-2 px-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 min-h-[38px] ${
            activeFilter === 'active'
              ? 'bg-white text-rose-700 shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>Đang nợ</span>
          <span className="px-1.5 py-0.2 bg-rose-100 text-rose-700 rounded-full text-[10px] font-bold">
            {activeCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => onFilterChange('settled')}
          className={`flex-1 py-2 px-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 min-h-[38px] ${
            activeFilter === 'settled'
              ? 'bg-white text-emerald-700 shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>Đã trả</span>
          <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-700 rounded-full text-[10px]">
            {settledCount}
          </span>
        </button>
      </div>
    </div>
  );
};
