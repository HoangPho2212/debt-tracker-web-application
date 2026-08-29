import {
  DebtorRecord,
  AppSettings,
  GoogleSheetsSyncPayload,
  GoogleSheetsSyncResult,
  FetchCloudDataResult,
} from '../types/contracts';

export const GoogleSheetsSyncEngine = {
  isValidAppsScriptUrl(url?: string): boolean {
    if (!url || typeof url !== 'string') return false;
    const trimmed = url.trim();
    return (
      trimmed.startsWith('https://script.google.com/macros/s/') &&
      (trimmed.includes('/exec') || trimmed.includes('/dev'))
    );
  },

  isValidGoogleSheetUrl(url?: string): boolean {
    if (!url || typeof url !== 'string') return false;
    const trimmed = url.trim();
    return (
      trimmed.startsWith('https://docs.google.com/spreadsheets/') ||
      trimmed.startsWith('https://sheets.google.com/')
    );
  },

  /**
   * PUSH: Sends local records up to Google Sheets
   */
  async syncToGoogleSheets(
    records: DebtorRecord[],
    settings: AppSettings
  ): Promise<GoogleSheetsSyncResult> {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return {
        success: false,
        message: 'Mất kết nối mạng. Dữ liệu đã được lưu an toàn trên máy (LocalStorage).',
      };
    }

    if (!settings.appsScriptUrl || !this.isValidAppsScriptUrl(settings.appsScriptUrl)) {
      return {
        success: false,
        message: 'Chưa cấu hình hoặc URL Google Apps Script không hợp lệ (/exec).',
      };
    }

    const payload: GoogleSheetsSyncPayload = {
      app: 'QuanComDebtTracker',
      timestamp: new Date().toISOString(),
      restaurantName: settings.restaurantName || 'Quán Cơm Bình Dân',
      records,
    };

    try {
      await fetch(settings.appsScriptUrl.trim(), {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload),
      });

      const nowIso = new Date().toISOString();
      return {
        success: true,
        message: `Đã đồng bộ ${records.length} khách hàng lên Google Sheets!`,
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
   * Merge Strategy: Combines Local and Cloud records cleanly
   */
  mergeCloudAndLocalRecords(
    localRecords: DebtorRecord[],
    cloudRecords: DebtorRecord[]
  ): DebtorRecord[] {
    if (!cloudRecords || cloudRecords.length === 0) return localRecords;
    if (!localRecords || localRecords.length === 0) return cloudRecords;

    const mergedMap = new Map<string, DebtorRecord>();

    // 1. Add all cloud records first
    for (const cloud of cloudRecords) {
      const key = cloud.normalizedName || cloud.name.toLowerCase().trim();
      mergedMap.set(key, { ...cloud });
    }

    // 2. Merge local records
    for (const local of localRecords) {
      const key = local.normalizedName || local.name.toLowerCase().trim();
      const existing = mergedMap.get(key);

      if (!existing) {
        mergedMap.set(key, { ...local });
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

        const dominant = localUpdated >= cloudUpdated ? local : existing;

        mergedMap.set(key, {
          ...dominant,
          name: localUpdated >= cloudUpdated ? local.name : existing.name,
          phone: dominant.phone || existing.phone || local.phone,
          history: mergedHistory,
          totalDebt: dominant.status === 'settled' ? 0 : dominant.totalDebt,
          status: dominant.status,
          updatedAt: new Date(Math.max(localUpdated, cloudUpdated)).toISOString(),
        });
      }
    }

    return Array.from(mergedMap.values()).sort((a, b) => {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  },
};
