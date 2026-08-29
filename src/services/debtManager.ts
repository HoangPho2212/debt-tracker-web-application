import {
  DebtorRecord,
  DebtHistoryEntry,
  CreateDebtInput,
  AppSettings,
} from '../types/contracts';
import {
  AppViewState,
  DebtorViewState,
  SummaryStatsViewState,
  DebtFilterType,
} from '../types/viewState';
import { normalizeVietnamese, matchesVietnameseSearch } from '../utils/vietnamese';
import {
  formatCurrency,
  formatVietnameseDateTime,
  generateId,
  isToday,
} from '../utils/formatters';
import { CreateDebtContract } from '../contracts/debtContract';

export const DebtManager = {
  /**
   * Adds a new debt entry or accumulates debt for an existing customer
   */
  addDebtEntry(
    records: DebtorRecord[],
    rawInput: CreateDebtInput
  ): { updatedRecords: DebtorRecord[]; affectedRecord: DebtorRecord } {
    const validated = CreateDebtContract.execute(rawInput);

    const now = new Date();
    const isoTimestamp = now.toISOString();
    const displayDate = formatVietnameseDateTime(now);
    const amount = validated.quantity * validated.pricePerMeal;

    const newEntry: DebtHistoryEntry = {
      entryId: generateId('ENT'),
      timestamp: isoTimestamp,
      displayDate,
      quantity: validated.quantity,
      pricePerMeal: validated.pricePerMeal,
      amount,
      note: validated.note,
    };

    const targetNormalized = normalizeVietnamese(validated.name);
    const existingIndex = records.findIndex(
      (r) => r.normalizedName === targetNormalized
    );

    let updatedRecords = [...records];
    let affectedRecord: DebtorRecord;

    if (existingIndex >= 0) {
      const existing = records[existingIndex];
      const updatedHistory = [newEntry, ...existing.history];
      const newTotalDebt = (existing.status === 'settled' ? 0 : existing.totalDebt) + amount;

      affectedRecord = {
        ...existing,
        name: validated.name, // Keep latest casing
        phone: validated.phone || existing.phone,
        totalDebt: newTotalDebt,
        status: 'active',
        updatedAt: isoTimestamp,
        history: updatedHistory,
      };

      // Move updated customer to top of the list
      updatedRecords.splice(existingIndex, 1);
      updatedRecords.unshift(affectedRecord);
    } else {
      affectedRecord = {
        id: generateId('KH'),
        name: validated.name,
        normalizedName: targetNormalized,
        phone: validated.phone,
        totalDebt: amount,
        status: 'active',
        createdAt: isoTimestamp,
        updatedAt: isoTimestamp,
        history: [newEntry],
      };

      updatedRecords.unshift(affectedRecord);
    }

    return { updatedRecords, affectedRecord };
  },

  /**
   * Marks a debtor as settled (Đã thanh toán)
   */
  settleDebtor(records: DebtorRecord[], debtorId: string): DebtorRecord[] {
    const now = new Date().toISOString();
    return records.map((record) => {
      if (record.id !== debtorId) return record;
      return {
        ...record,
        totalDebt: 0,
        status: 'settled',
        updatedAt: now,
      };
    });
  },

  /**
   * Deletes a specific history entry and recalculates total debt
   */
  deleteHistoryEntry(
    records: DebtorRecord[],
    debtorId: string,
    entryId: string
  ): DebtorRecord[] {
    const now = new Date().toISOString();
    return records.map((record) => {
      if (record.id !== debtorId) return record;

      const updatedHistory = record.history.filter((h) => h.entryId !== entryId);
      const newTotalDebt = updatedHistory.reduce((sum, h) => sum + h.amount, 0);

      return {
        ...record,
        history: updatedHistory,
        totalDebt: record.status === 'settled' ? 0 : newTotalDebt,
        status: newTotalDebt === 0 ? 'settled' : record.status,
        updatedAt: now,
      };
    });
  },

  /**
   * Updates customer name and phone
   */
  updateDebtor(
    records: DebtorRecord[],
    debtorId: string,
    name: string,
    phone?: string
  ): DebtorRecord[] {
    const trimmedName = name.trim();
    if (!trimmedName) throw new Error('Tên khách hàng không được để trống.');

    const now = new Date().toISOString();
    const normalizedName = normalizeVietnamese(trimmedName);

    return records.map((record) => {
      if (record.id !== debtorId) return record;
      return {
        ...record,
        name: trimmedName,
        normalizedName,
        phone: phone ? phone.trim() : undefined,
        updatedAt: now,
      };
    });
  },

  /**
   * Permanently removes a debtor record
   */
  deleteDebtor(records: DebtorRecord[], debtorId: string): DebtorRecord[] {
    return records.filter((r) => r.id !== debtorId);
  },

  /**
   * Computes summary statistics for header cards
   */
  computeSummaryStats(records: DebtorRecord[]): SummaryStatsViewState {
    let totalActiveDebt = 0;
    let totalActiveDebtors = 0;
    let totalSettledDebtors = 0;
    let todayRecordedAmount = 0;
    let todayMealsCount = 0;

    for (const record of records) {
      if (record.status === 'active' && record.totalDebt > 0) {
        totalActiveDebt += record.totalDebt;
        totalActiveDebtors += 1;
      } else {
        totalSettledDebtors += 1;
      }

      for (const entry of record.history) {
        if (isToday(entry.timestamp)) {
          todayRecordedAmount += entry.amount;
          todayMealsCount += entry.quantity;
        }
      }
    }

    return {
      totalActiveDebt,
      formattedTotalActiveDebt: formatCurrency(totalActiveDebt),
      totalActiveDebtors,
      totalSettledDebtors,
      todayRecordedAmount,
      formattedTodayRecordedAmount: formatCurrency(todayRecordedAmount),
      todayMealsCount,
    };
  },

  /**
   * Transforms DebtorRecord to DebtorViewState
   */
  toDebtorViewState(record: DebtorRecord): DebtorViewState {
    const latestEntry = record.history[0];
    const latestEntryDisplayDate = latestEntry
      ? latestEntry.displayDate || formatVietnameseDateTime(latestEntry.timestamp)
      : formatVietnameseDateTime(record.updatedAt);

    return {
      id: record.id,
      name: record.name,
      normalizedName: record.normalizedName,
      phone: record.phone,
      totalDebt: record.totalDebt,
      formattedTotalDebt: formatCurrency(record.totalDebt),
      status: record.status,
      entryCount: record.history.length,
      latestEntryDisplayDate,
      history: record.history,
    };
  },

  /**
   * Constructs the full AppViewState with filtered records and summaries
   */
  buildAppViewState(
    records: DebtorRecord[],
    settings: AppSettings,
    searchQuery: string = '',
    activeFilter: DebtFilterType = 'all',
    selectedId?: string,
    isQuickAddOpen: boolean = false,
    isSettingsOpen: boolean = false,
    isBackupRestoreOpen: boolean = false,
    syncStatus: import('../types/contracts').SyncStatus = 'idle',
    lastSyncedAt?: string
  ): AppViewState {
    const allDebtorViewStates = records.map((r) => this.toDebtorViewState(r));

    const allActiveDebtors = allDebtorViewStates.filter(
      (r) => r.status === 'active' && r.totalDebt > 0
    );
    const allSettledDebtors = allDebtorViewStates.filter(
      (r) => r.status === 'settled' || r.totalDebt === 0
    );

    let filtered = allDebtorViewStates;
    if (activeFilter === 'active') {
      filtered = allActiveDebtors;
    } else if (activeFilter === 'settled') {
      filtered = allSettledDebtors;
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (r) =>
          matchesVietnameseSearch(r.name, searchQuery) ||
          (r.phone && r.phone.includes(searchQuery.trim())) ||
          r.history.some(h => h.note && matchesVietnameseSearch(h.note, searchQuery))
      );
    }

    const summary = this.computeSummaryStats(records);
    const selectedDebtorDetail = selectedId
      ? allDebtorViewStates.find((r) => r.id === selectedId)
      : undefined;

    return {
      searchQuery,
      activeFilter,
      filteredDebtors: filtered,
      allActiveDebtors,
      allSettledDebtors,
      summary,
      settings,
      selectedDebtorDetail,
      isQuickAddOpen,
      isSettingsOpen,
      isBackupRestoreOpen,
      syncStatus,
      lastSyncedAt,
    };
  },
};
