import { DebtorRecord, AppSettings, FetchCloudDataResult } from '../types/contracts';
import { normalizeVietnamese } from '../utils/vietnamese';

export interface GoogleSheetsSyncResult {
  success: boolean;
  message: string;
  syncedAt?: string;
}

export const GoogleSheetsSyncEngine = {
  /**
   * Validates if the Apps Script URL is a valid Google Apps Script Web App exec URL
   */
  isValidAppsScriptUrl(url?: string): boolean {
    if (!url || typeof url !== 'string') return false;
    const trimmed = url.trim();
    return (
      trimmed.startsWith('https://script.google.com/macros/s/') &&
      (trimmed.endsWith('/exec') || trimmed.endsWith('/dev') || trimmed.includes('/exec?'))
    );
  },

  /**
   * Validates if the Google Sheet URL is a valid Google Spreadsheet URL
   */
  isValidGoogleSheetUrl(url?: string): boolean {
    if (!url || typeof url !== 'string') return false;
    const trimmed = url.trim();
    return (
      trimmed.startsWith('https://docs.google.com/spreadsheets/d/') ||
      trimmed.startsWith('https://spreadsheets.google.com/') ||
      trimmed.startsWith('https://sheets.google.com/')
    );
  },

  /**
   * PUSH: Sends local records up to Google Sheets (via doPost)
   */
  async syncToGoogleSheets(
    records: DebtorRecord[],
    settings: AppSettings
  ): Promise<GoogleSheetsSyncResult> {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return {
        success: false,
        message: 'Thiết bị đang offline. Dữ liệu được lưu tạm trên máy.',
      };
    }

    if (!settings.appsScriptUrl || !this.isValidAppsScriptUrl(settings.appsScriptUrl)) {
      return {
        success: false,
        message: 'Chưa cấu hình Google Apps Script URL hoặc URL không hợp lệ.',
      };
    }

    const payload = {
      app: 'QuanComDebtTracker',
      timestamp: new Date().toISOString(),
      restaurantName: settings.restaurantName || 'Sổ Ghi Nợ Quán Cơm',
      records: records,
    };

    const targetUrl = settings.appsScriptUrl.trim();
    const nowIso = new Date().toISOString();

    try {
      await fetch(targetUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload),
      });

      return {
        success: true,
        message: 'Đã tự động đồng bộ lên Google Sheets thành công.',
        syncedAt: nowIso,
      };
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Lỗi kết nối';
      console.warn('Google Sheets Sync Warning:', errMsg);
      return {
        success: false,
        message: `Không thể kết nối đến Google Sheets (${errMsg}). Dữ liệu vẫn được lưu trên máy.`,
      };
    }
  },

  /**
   * PULL: Fetches latest cloud records from Google Sheets (via doGet)
   */
  async fetchRecordsFromGoogleSheets(
    settings: AppSettings
  ): Promise<FetchCloudDataResult> {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return {
        success: false,
        message: 'Không có mạng. Sử dụng dữ liệu hiện có trên máy.',
      };
    }

    if (!settings.appsScriptUrl || !this.isValidAppsScriptUrl(settings.appsScriptUrl)) {
      return {
        success: false,
        message: 'Chưa cấu hình Google Apps Script URL.',
      };
    }

    try {
      const targetUrl = settings.appsScriptUrl.trim();
      const response = await fetch(targetUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      if (data && Array.isArray(data.records)) {
        return {
          success: true,
          records: data.records as DebtorRecord[],
          restaurantName: data.restaurantName,
          syncedAt: data.syncedAt || new Date().toISOString(),
          message: `Đã tải ${data.records.length} khách hàng từ Google Sheets.`,
        };
      }

      return {
        success: false,
        message: 'Dữ liệu từ Google Sheets không đúng định dạng.',
      };
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Lỗi kết nối';
      return {
        success: false,
        message: `Không thể tải dữ liệu từ Google Sheets (${errMsg}).`,
      };
    }
  },

  /**
   * Merge Strategy: Combines Local and Cloud records cleanly with strict Vietnamese normalization and timestamp resolution
   */
  mergeCloudAndLocalRecords(
    localRecords: DebtorRecord[],
    cloudRecords: DebtorRecord[]
  ): DebtorRecord[] {
    if (!cloudRecords || cloudRecords.length === 0) return localRecords;
    if (!localRecords || localRecords.length === 0) {
      return cloudRecords.map((c) => ({
        ...c,
        normalizedName: normalizeVietnamese(c.name),
      }));
    }

    const mergedMap = new Map<string, DebtorRecord>();

    // 1. Add all cloud records first indexed by strict normalized name
    for (const cloud of cloudRecords) {
      const normName = normalizeVietnamese(cloud.name);
      mergedMap.set(normName, {
        ...cloud,
        normalizedName: normName,
      });
    }

    // 2. Merge local records
    for (const local of localRecords) {
      const normName = normalizeVietnamese(local.name);
      const existing = mergedMap.get(normName);

      if (!existing) {
        mergedMap.set(normName, {
          ...local,
          normalizedName: normName,
        });
      } else {
        // Both exist: compare timestamps and merge histories
        const localUpdated = new Date(local.updatedAt).getTime() || 0;
        const cloudUpdated = new Date(existing.updatedAt).getTime() || 0;

        // Combine history entries, deduping by entryId
        const historyMap = new Map<string, import('../types/contracts').DebtHistoryEntry>();
        for (const h of existing.history || []) {
          historyMap.set(h.entryId, h);
        }
        for (const h of local.history || []) {
          historyMap.set(h.entryId, h);
        }
        const mergedHistory = Array.from(historyMap.values()).sort((a, b) => {
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        });

        // Whichever record was updated most recently determines status and total debt
        const dominant = localUpdated >= cloudUpdated ? local : existing;

        mergedMap.set(normName, {
          id: existing.id || local.id,
          name: localUpdated >= cloudUpdated ? local.name : existing.name,
          normalizedName: normName,
          phone: dominant.phone || existing.phone || local.phone,
          history: mergedHistory,
          totalDebt: dominant.status === 'settled' ? 0 : dominant.totalDebt,
          status: dominant.status,
          createdAt: existing.createdAt || local.createdAt,
          updatedAt: new Date(Math.max(localUpdated, cloudUpdated)).toISOString(),
        });
      }
    }

    return Array.from(mergedMap.values()).sort((a, b) => {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  },
};
