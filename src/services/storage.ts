import { DebtorRecord, AppSettings, BackupPayload } from '../types/contracts';
import { BackupPayloadContract } from '../contracts/debtContract';

export const STORAGE_KEYS = {
  RECORDS: 'QUAN_COM_DEBT_RECORDS_V1',
  SETTINGS: 'QUAN_COM_SETTINGS_V1',
} as const;

export const DEFAULT_SETTINGS: AppSettings = {
  restaurantName: 'Quán Cơm Bình Dân',
  defaultMealPrice: 35000,
  phoneContact: '',
  currency: 'VNĐ',
  appsScriptUrl: 'https://script.google.com/macros/s/AKfycbyPQVci49QP2rWDUHkTRbSnra4OawodYLezXA4zgbR5oLlZM6uqMun7Q1r-Mvk4u7og/exec',
  autoSyncEnabled: true,
};

export const StorageEngine = {
  loadRecords(): DebtorRecord[] {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return [];
      }
      const raw = window.localStorage.getItem(STORAGE_KEYS.RECORDS);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
      return [];
    } catch (err) {
      console.error('Failed to load records from LocalStorage:', err);
      return [];
    }
  },

  saveRecords(records: DebtorRecord[]): void {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      window.localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
    } catch (err) {
      console.error('Failed to save records to LocalStorage:', err);
      throw new Error('Bộ nhớ trình duyệt bị đầy hoặc không cho phép ghi. Vui lòng kiểm tra dung lượng.');
    }
  },

  loadSettings(): AppSettings {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return DEFAULT_SETTINGS;
      }
      const raw = window.localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!raw) return DEFAULT_SETTINGS;
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
      };
    } catch (err) {
      console.error('Failed to load settings from LocalStorage:', err);
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings: AppSettings): void {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      window.localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (err) {
      console.error('Failed to save settings to LocalStorage:', err);
    }
  },

  exportBackupJson(records: DebtorRecord[], settings: AppSettings): string {
    const payload: BackupPayload = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      app: 'QuanComDebtTracker',
      settings,
      records,
    };
    return JSON.stringify(payload, null, 2);
  },

  parseAndValidateBackup(jsonString: string): BackupPayload {
    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonString);
    } catch {
      throw new Error('Tệp không đúng định dạng JSON hợp lệ.');
    }

    const validation = BackupPayloadContract.validate(parsed);
    if (!validation.isValid || !validation.sanitized) {
      throw new Error(`Dữ liệu sao lưu không hợp lệ: ${validation.errors.join(', ')}`);
    }

    return validation.sanitized;
  },

  downloadBackupFile(records: DebtorRecord[], settings: AppSettings): void {
    const jsonStr = this.exportBackupJson(records, settings);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    const now = new Date();
    const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
    link.href = url;
    link.download = `quan_com_sao_luu_${dateStr}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },
};
