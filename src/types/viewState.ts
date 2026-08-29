import { DebtHistoryEntry, AppSettings, SyncStatus } from './contracts';

export interface DebtorViewState {
  id: string;
  name: string;
  normalizedName: string;
  phone?: string;
  totalDebt: number;
  formattedTotalDebt: string;
  status: 'active' | 'settled';
  entryCount: number;
  latestEntryDisplayDate: string;
  history: DebtHistoryEntry[];
}

export interface SummaryStatsViewState {
  totalActiveDebt: number;
  formattedTotalActiveDebt: string;
  totalActiveDebtors: number;
  totalSettledDebtors: number;
  todayRecordedAmount: number;
  formattedTodayRecordedAmount: string;
  todayMealsCount: number;
}

export type DebtFilterType = 'all' | 'active' | 'settled';

export interface AppViewState {
  searchQuery: string;
  activeFilter: DebtFilterType;
  filteredDebtors: DebtorViewState[];
  allActiveDebtors: DebtorViewState[];
  allSettledDebtors: DebtorViewState[];
  summary: SummaryStatsViewState;
  settings: AppSettings;
  selectedDebtorDetail?: DebtorViewState;
  isQuickAddOpen: boolean;
  isSettingsOpen: boolean;
  isBackupRestoreOpen: boolean;
  syncStatus: SyncStatus;
  lastSyncedAt?: string;
}
