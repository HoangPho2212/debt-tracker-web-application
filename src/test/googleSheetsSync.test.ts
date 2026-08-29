import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GoogleSheetsSyncEngine } from '../services/googleSheetsSync';
import { DebtorRecord, AppSettings } from '../types/contracts';

const mockSettings: AppSettings = {
  restaurantName: 'Quán Cơm Bình Dân',
  defaultMealPrice: 35000,
  currency: 'VNĐ',
  googleSheetUrl: 'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit',
  appsScriptUrl: 'https://script.google.com/macros/s/AKfycbytest12345/exec',
};

const mockRecords: DebtorRecord[] = [
  {
    id: 'KH_1',
    name: 'Anh Tuấn Viettel',
    normalizedName: 'anh tuan viettel',
    phone: '0987654321',
    totalDebt: 70000,
    status: 'active',
    createdAt: '2026-08-28T10:00:00.000Z',
    updatedAt: '2026-08-28T10:00:00.000Z',
    history: [
      {
        entryId: 'ENT_1',
        timestamp: '2026-08-28T10:00:00.000Z',
        displayDate: '10:00 28/08/2026',
        quantity: 2,
        pricePerMeal: 35000,
        amount: 70000,
        note: 'Cơm sườn trứng',
      },
    ],
  },
];

describe('GoogleSheetsSyncEngine', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('URL Validation', () => {
    it('should validate valid Google Apps Script Web App URL ending with /exec or /dev', () => {
      expect(
        GoogleSheetsSyncEngine.isValidAppsScriptUrl(
          'https://script.google.com/macros/s/AKfycbz_12345/exec'
        )
      ).toBe(true);
      expect(
        GoogleSheetsSyncEngine.isValidAppsScriptUrl(
          'https://script.google.com/macros/s/AKfycbz_12345/dev'
        )
      ).toBe(true);
    });

    it('should reject invalid Apps Script URLs', () => {
      expect(GoogleSheetsSyncEngine.isValidAppsScriptUrl('')).toBe(false);
      expect(GoogleSheetsSyncEngine.isValidAppsScriptUrl('https://google.com')).toBe(false);
    });

    it('should validate valid Google Sheet URLs', () => {
      expect(
        GoogleSheetsSyncEngine.isValidGoogleSheetUrl(
          'https://docs.google.com/spreadsheets/d/1abcxyz/edit'
        )
      ).toBe(true);
      expect(
        GoogleSheetsSyncEngine.isValidGoogleSheetUrl(
          'https://sheets.google.com/d/1abcxyz'
        )
      ).toBe(true);
    });
  });

  describe('syncToGoogleSheets (PUSH)', () => {
    it('should post payload to Apps Script Web App in no-cors mode', async () => {
      const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));
      global.fetch = fetchMock;

      const result = await GoogleSheetsSyncEngine.syncToGoogleSheets(mockRecords, mockSettings);

      expect(result.success).toBe(true);
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock).toHaveBeenCalledWith(
        mockSettings.appsScriptUrl,
        expect.objectContaining({
          method: 'POST',
          mode: 'no-cors',
        })
      );
    });

    it('should return error message when Apps Script URL is unconfigured', async () => {
      const emptySettings: AppSettings = {
        ...mockSettings,
        appsScriptUrl: '',
      };

      const result = await GoogleSheetsSyncEngine.syncToGoogleSheets(mockRecords, emptySettings);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Chưa cấu hình');
    });
  });

  describe('fetchRecordsFromGoogleSheets (PULL)', () => {
    it('should fetch records successfully via GET request', async () => {
      const mockCloudResponse = {
        status: 'success',
        restaurantName: 'Quán Cơm Cô Ba',
        records: mockRecords,
        syncedAt: '2026-08-29T14:00:00.000Z',
      };

      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockCloudResponse,
      });
      global.fetch = fetchMock;

      const result = await GoogleSheetsSyncEngine.fetchRecordsFromGoogleSheets(mockSettings);

      expect(result.success).toBe(true);
      expect(result.records?.length).toBe(1);
      expect(result.restaurantName).toBe('Quán Cơm Cô Ba');
      expect(fetchMock).toHaveBeenCalledWith(
        mockSettings.appsScriptUrl,
        expect.objectContaining({ method: 'GET' })
      );
    });
  });

  describe('mergeCloudAndLocalRecords', () => {
    it('should merge cloud and local records seamlessly', () => {
      const local: DebtorRecord[] = [
        {
          id: 'KH_1',
          name: 'Anh Tuấn Viettel',
          normalizedName: 'anh tuan viettel',
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

      const cloud: DebtorRecord[] = [
        {
          id: 'KH_2',
          name: 'Chị Lan Ngân Hàng',
          normalizedName: 'chi lan ngan hang',
          totalDebt: 70000,
          status: 'active',
          createdAt: '2026-08-29T11:00:00.000Z',
          updatedAt: '2026-08-29T11:00:00.000Z',
          history: [
            {
              entryId: 'ENT_2',
              timestamp: '2026-08-29T11:00:00.000Z',
              displayDate: '11:00 29/08/2026',
              quantity: 2,
              pricePerMeal: 35000,
              amount: 70000,
            },
          ],
        },
      ];

      const merged = GoogleSheetsSyncEngine.mergeCloudAndLocalRecords(local, cloud);

      expect(merged.length).toBe(2);
      expect(merged.some((r) => r.name === 'Anh Tuấn Viettel')).toBe(true);
      expect(merged.some((r) => r.name === 'Chị Lan Ngân Hàng')).toBe(true);
    });
  });
});
