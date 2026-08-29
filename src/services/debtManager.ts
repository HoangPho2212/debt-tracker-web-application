import {
  DebtorRecord,
  DebtHistoryEntry,
  CreateDebtInput,
  UpdateHistoryEntryInput,
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

    let entryDate = new Date();
    if (rawInput.customTimestamp) {
      const parsed = new Date(rawInput.customTimestamp);
      if (!isNaN(parsed.getTime())) {
        entryDate = parsed;
      }
    }

    const isoTimestamp = entryDate.toISOString();
    const displayDate = formatVietnameseDateTime(entryDate);
    const shippingFee = validated.shippingFee || 0;
    const amount = (validated.quantity * validated.pricePerMeal) + shippingFee;

    const newEntry: DebtHistoryEntry = {
      entryId: generateId('ENT'),
      timestamp: isoTimestamp,
      displayDate,
      quantity: validated.quantity,
      pricePerMeal: validated.pricePerMeal,
      shippingFee: shippingFee > 0 ? shippingFee : undefined,
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
      const updatedHistory = [newEntry, ...existing.history].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      const newTotalDebt = (existing.status === 'settled' ? 0 : existing.totalDebt) + amount;

      affectedRecord = {
        ...existing,
        name: validated.name,
        phone: validated.phone || existing.phone,
        totalDebt: newTotalDebt,
        status: 'active',
        updatedAt: new Date().toISOString(),
        history: updatedHistory,
      };

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
        updatedAt: new Date().toISOString(),
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
   * Deletes a single history entry and recalibrates remaining debt
   */
  deleteHistoryEntry(
    records: DebtorRecord[],
    debtorId: string,
    entryId: string
  ): DebtorRecord[] {
    const now = new Date().toISOString();
    return records.map((record) => {
      if (record.id !== debtorId) return record;

      const targetEntry = record.history.find((e) => e.entryId === entryId);
      if (!targetEntry) return record;

      const updatedHistory = record.history.filter((e) => e.entryId !== entryId);
      const deductedDebt = Math.max(0, record.totalDebt - targetEntry.amount);
      const newStatus = deductedDebt === 0 && updatedHistory.length === 0 ? 'settled' : record.status;

      return {
        ...record,
        totalDebt: deductedDebt,
        status: newStatus,
        updatedAt: now,
        history: updatedHistory,
      };
    });
  },

  /**
   * Updates an existing history entry (timestamp, quantity, price, shippingFee, note)
   */
  updateHistoryEntry(
    records: DebtorRecord[],
    input: UpdateHistoryEntryInput
  ): DebtorRecord[] {
    const now = new Date().toISOString();
    return records.map((record) => {
      if (record.id !== input.debtorId) return record;

      const updatedHistory = record.history.map((entry) => {
        if (entry.entryId !== input.entryId) return entry;

        let entryDate = new Date(entry.timestamp);
        if (input.timestamp) {
          const parsed = new Date(input.timestamp);
          if (!isNaN(parsed.getTime())) {
            entryDate = parsed;
          }
        }

        const quantity = input.quantity !== undefined ? Math.max(1, Number(input.quantity)) : entry.quantity;
        const pricePerMeal = input.pricePerMeal !== undefined ? Math.max(0, Number(input.pricePerMeal)) : entry.pricePerMeal;
        const shippingFee = input.shippingFee !== undefined ? Math.max(0, Number(input.shippingFee)) : (entry.shippingFee || 0);
        const amount = (quantity * pricePerMeal) + shippingFee;

        return {
          ...entry,
          timestamp: entryDate.toISOString(),
          displayDate: formatVietnameseDateTime(entryDate),
          quantity,
          pricePerMeal,
          shippingFee: shippingFee > 0 ? shippingFee : undefined,
          amount,
          note: input.note !== undefined ? (input.note.trim() || undefined) : entry.note,
        };
      });

      updatedHistory.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      const newTotalDebt = record.status === 'settled'
        ? 0
        : updatedHistory.reduce((sum, h) => sum + h.amount, 0);

      return {
        ...record,
        totalDebt: newTotalDebt,
        updatedAt: now,
        history: updatedHistory,
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
