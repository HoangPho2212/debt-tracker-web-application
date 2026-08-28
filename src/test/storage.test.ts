import { describe, it, expect, beforeEach } from 'vitest';
import { StorageEngine, DEFAULT_SETTINGS } from '../services/storage';
import { DebtorRecord } from '../types/contracts';

describe('StorageEngine', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('should save and load records from localStorage', () => {
    const mockRecords: DebtorRecord[] = [
      {
        id: 'KH_1',
        name: 'Anh Tuấn',
        normalizedName: 'anh tuan',
        totalDebt: 35000,
        status: 'active',
        createdAt: '2026-08-28T10:00:00.000Z',
        updatedAt: '2026-08-28T10:00:00.000Z',
        history: [],
      },
    ];

    StorageEngine.saveRecords(mockRecords);
    const loaded = StorageEngine.loadRecords();
    expect(loaded).toHaveLength(1);
    expect(loaded[0].name).toBe('Anh Tuấn');
  });

  it('should export and parse backup JSON correctly', () => {
    const mockRecords: DebtorRecord[] = [
      {
        id: 'KH_1',
        name: 'Anh Nam',
        normalizedName: 'anh nam',
        totalDebt: 70000,
        status: 'active',
        createdAt: '2026-08-28T10:00:00.000Z',
        updatedAt: '2026-08-28T10:00:00.000Z',
        history: [],
      },
    ];

    const jsonStr = StorageEngine.exportBackupJson(mockRecords, DEFAULT_SETTINGS);
    const parsed = StorageEngine.parseAndValidateBackup(jsonStr);

    expect(parsed.app).toBe('QuanComDebtTracker');
    expect(parsed.records).toHaveLength(1);
    expect(parsed.records[0].name).toBe('Anh Nam');
  });

  it('should return default settings if storage is empty', () => {
    const settings = StorageEngine.loadSettings();
    expect(settings.restaurantName).toBe(DEFAULT_SETTINGS.restaurantName);
    expect(settings.defaultMealPrice).toBe(DEFAULT_SETTINGS.defaultMealPrice);
  });
});
