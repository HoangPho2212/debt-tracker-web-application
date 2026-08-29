# 03. Data Model & State Schema

## 1. Domain Types & TypeScript Interfaces

```typescript
/**
 * Individual meal debt transaction entry
 */
export interface DebtHistoryEntry {
  entryId: string;       // Unique ID, e.g., "ENT_1714000000_w8ux1"
  timestamp: string;     // ISO 8601 string, e.g., "2026-08-28T12:30:00.000Z"
  displayDate: string;   // Vietnamese display format, e.g., "12:30 28/08/2026"
  quantity: number;      // Number of meals (>= 1)
  pricePerMeal: number;  // Price in VND (>= 0)
  amount: number;        // Total for entry = quantity * pricePerMeal
  note?: string;         // Optional note, e.g., "Cơm sườn trứng", "Mang về"
}

/**
 * Customer debtor profile entity
 */
export interface DebtorRecord {
  id: string;            // Customer ID, e.g., "KH_1714000000_abc"
  name: string;          // Customer name (trimmed)
  normalizedName: string;// Lowercase, non-accented name for instant search
  phone?: string;        // Optional contact phone number
  totalDebt: number;     // Active outstanding debt balance in VND
  status: 'active' | 'settled'; // 'active' = unpaid debt, 'settled' = paid
  createdAt: string;     // ISO timestamp
  updatedAt: string;     // ISO timestamp of the latest change
  history: DebtHistoryEntry[]; // Array of debt transactions (reverse-chronological)
}

/**
 * Application Settings & Google Sheets Sync Configuration
 */
export interface AppSettings {
  restaurantName: string;
  defaultMealPrice: number;
  phoneContact?: string;
  currency: string;
  googleSheetUrl?: string;   // Live Google Spreadsheet URL (https://docs.google.com/spreadsheets/d/...)
  appsScriptUrl?: string;    // Google Apps Script Web App Endpoint (https://script.google.com/macros/s/.../exec)
  autoSyncEnabled?: boolean; // Toggles background synchronization
  lastSyncedAt?: string;     // Timestamp of last successful sync
}

/**
 * Sync Lifecycle State
 */
export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error' | 'offline' | 'unconfigured';
```

---

## 2. Sample JSON State Payload

```json
[
  {
    "id": "KH_1787986237996_w8ux1",
    "name": "Anh Tuấn Viettel",
    "normalizedName": "anh tuan viettel",
    "phone": "0987654321",
    "totalDebt": 70000,
    "status": "active",
    "createdAt": "2026-08-28T10:00:00.000Z",
    "updatedAt": "2026-08-29T11:30:00.000Z",
    "history": [
      {
        "entryId": "ENT_1787986237996_1",
        "timestamp": "2026-08-29T11:30:00.000Z",
        "displayDate": "11:30 29/08/2026",
        "quantity": 1,
        "pricePerMeal": 35000,
        "amount": 35000,
        "note": "Cơm sườn trứng"
      },
      {
        "entryId": "ENT_1787986237996_2",
        "timestamp": "2026-08-28T10:00:00.000Z",
        "displayDate": "10:00 28/08/2026",
        "quantity": 1,
        "pricePerMeal": 35000,
        "amount": 35000,
        "note": "Cơm gà nướng"
      }
    ]
  }
]
```
