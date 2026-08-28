import { describe, it, expect } from 'vitest';
import { DebtManager } from '../services/debtManager';
import { DebtorRecord, AppSettings } from '../types/contracts';

const mockSettings: AppSettings = {
  restaurantName: 'Quán Cơm 123',
  defaultMealPrice: 35000,
  currency: 'VNĐ',
};

describe('DebtManager Business Logic', () => {
  it('should create a new debtor when customer is not in records', () => {
    const initialRecords: DebtorRecord[] = [];
    const input = {
      name: 'Anh Tuấn',
      quantity: 1,
      pricePerMeal: 35000,
      note: 'Cơm sườn',
    };

    const { updatedRecords, affectedRecord } = DebtManager.addDebtEntry(initialRecords, input);

    expect(updatedRecords).toHaveLength(1);
    expect(affectedRecord.name).toBe('Anh Tuấn');
    expect(affectedRecord.normalizedName).toBe('anh tuan');
    expect(affectedRecord.totalDebt).toBe(35000);
    expect(affectedRecord.status).toBe('active');
    expect(affectedRecord.history).toHaveLength(1);
    expect(affectedRecord.history[0].amount).toBe(35000);
    expect(affectedRecord.history[0].note).toBe('Cơm sườn');
  });

  it('should accumulate debt when adding entry for existing customer (case-insensitive)', () => {
    const initialRecords: DebtorRecord[] = [
      {
        id: 'KH_1',
        name: 'Anh Tuấn',
        normalizedName: 'anh tuan',
        totalDebt: 35000,
        status: 'active',
        createdAt: '2026-08-28T10:00:00.000Z',
        updatedAt: '2026-08-28T10:00:00.000Z',
        history: [
          {
            entryId: 'ENT_1',
            timestamp: '2026-08-28T10:00:00.000Z',
            displayDate: '10:00 28/08/2026',
            quantity: 1,
            pricePerMeal: 35000,
            amount: 35000,
          },
        ],
      },
    ];

    const input = {
      name: '  anh tuấn  ', // slightly different casing and whitespace
      quantity: 2,
      pricePerMeal: 35000,
      note: '2 suất gà',
    };

    const { updatedRecords, affectedRecord } = DebtManager.addDebtEntry(initialRecords, input);

    expect(updatedRecords).toHaveLength(1);
    expect(affectedRecord.totalDebt).toBe(105000); // 35k + 70k
    expect(affectedRecord.history).toHaveLength(2);
    expect(affectedRecord.history[0].amount).toBe(70000);
  });

  it('should reactivate a settled customer when adding new debt', () => {
    const initialRecords: DebtorRecord[] = [
      {
        id: 'KH_1',
        name: 'Chị Mai',
        normalizedName: 'chi mai',
        totalDebt: 0,
        status: 'settled',
        createdAt: '2026-08-28T09:00:00.000Z',
        updatedAt: '2026-08-28T11:00:00.000Z',
        history: [],
      },
    ];

    const input = {
      name: 'Chị Mai',
      quantity: 1,
      pricePerMeal: 40000,
    };

    const { updatedRecords, affectedRecord } = DebtManager.addDebtEntry(initialRecords, input);

    expect(updatedRecords).toHaveLength(1);
    expect(affectedRecord.status).toBe('active');
    expect(affectedRecord.totalDebt).toBe(40000);
  });

  it('should settle debtor debt correctly', () => {
    const initialRecords: DebtorRecord[] = [
      {
        id: 'KH_1',
        name: 'Anh Tuấn',
        normalizedName: 'anh tuan',
        totalDebt: 70000,
        status: 'active',
        createdAt: '2026-08-28T10:00:00.000Z',
        updatedAt: '2026-08-28T10:00:00.000Z',
        history: [],
      },
    ];

    const updated = DebtManager.settleDebtor(initialRecords, 'KH_1');
    expect(updated[0].totalDebt).toBe(0);
    expect(updated[0].status).toBe('settled');
  });

  it('should delete history entry and recalculate total debt', () => {
    const initialRecords: DebtorRecord[] = [
      {
        id: 'KH_1',
        name: 'Anh Tuấn',
        normalizedName: 'anh tuan',
        totalDebt: 70000,
        status: 'active',
        createdAt: '2026-08-28T10:00:00.000Z',
        updatedAt: '2026-08-28T10:00:00.000Z',
        history: [
          {
            entryId: 'ENT_1',
            timestamp: '2026-08-28T10:00:00.000Z',
            displayDate: '10:00 28/08/2026',
            quantity: 1,
            pricePerMeal: 35000,
            amount: 35000,
          },
          {
            entryId: 'ENT_2',
            timestamp: '2026-08-28T11:00:00.000Z',
            displayDate: '11:00 28/08/2026',
            quantity: 1,
            pricePerMeal: 35000,
            amount: 35000,
          },
        ],
      },
    ];

    const updated = DebtManager.deleteHistoryEntry(initialRecords, 'KH_1', 'ENT_1');
    expect(updated[0].history).toHaveLength(1);
    expect(updated[0].totalDebt).toBe(35000);
  });

  it('should build ViewState with search and filters properly', () => {
    const records: DebtorRecord[] = [
      {
        id: 'KH_1',
        name: 'Anh Tuấn Viettel',
        normalizedName: 'anh tuan viettel',
        totalDebt: 70000,
        status: 'active',
        createdAt: '2026-08-28T10:00:00.000Z',
        updatedAt: '2026-08-28T10:00:00.000Z',
        history: [
          {
            entryId: 'ENT_1',
            timestamp: new Date().toISOString(),
            displayDate: '10:00 28/08/2026',
            quantity: 2,
            pricePerMeal: 35000,
            amount: 70000,
          },
        ],
      },
      {
        id: 'KH_2',
        name: 'Chị Hương Kế Toán',
        normalizedName: 'chi huong ke toan',
        totalDebt: 0,
        status: 'settled',
        createdAt: '2026-08-28T09:00:00.000Z',
        updatedAt: '2026-08-28T12:00:00.000Z',
        history: [],
      },
    ];

    const viewState = DebtManager.buildAppViewState(records, mockSettings, 'viettel', 'all');
    expect(viewState.filteredDebtors).toHaveLength(1);
    expect(viewState.filteredDebtors[0].name).toBe('Anh Tuấn Viettel');
    expect(viewState.summary.totalActiveDebt).toBe(70000);
    expect(viewState.summary.totalActiveDebtors).toBe(1);
    expect(viewState.summary.todayRecordedAmount).toBe(70000);
    expect(viewState.summary.todayMealsCount).toBe(2);
  });
});
