/**
 * Sổ Ghi Nợ Quán Cơm - Domain Contracts & Models
 * Follows Jay Framework rules and documentation specifications.
 */

export interface DebtHistoryEntry {
  entryId: string;       // Unique ID: e.g. "ENT_1714000000_xyz"
  timestamp: string;     // ISO format: "2026-08-28T12:30:00.000Z"
  displayDate: string;   // Vietnamese format: "12:30 28/08/2026"
  quantity: number;      // Quantity >= 1
  pricePerMeal: number;  // Price in VND >= 0
  amount: number;        // = quantity * pricePerMeal
  note?: string;         // Note: e.g. "Cơm sườn trứng", "Mang về"
}

export interface DebtorRecord {
  id: string;            // Customer ID: e.g. "KH_1714000000_abc"
  name: string;          // Customer name (trimmed)
  normalizedName: string;// Lowercase, non-accented name for instant search
  phone?: string;        // Optional phone number
  totalDebt: number;     // Total active debt in VND
  status: 'active' | 'settled'; // 'active' = currently has debt or active profile, 'settled' = paid
  createdAt: string;     // ISO timestamp
  updatedAt: string;     // ISO timestamp
  history: DebtHistoryEntry[]; // History entries
}

export interface AppSettings {
  restaurantName: string;
  defaultMealPrice: number;
  phoneContact?: string;
  currency: string;
}

export interface CreateDebtInput {
  name: string;
  quantity: number;
  pricePerMeal: number;
  note?: string;
  phone?: string;
}

export interface SettleDebtInput {
  debtorId: string;
  note?: string;
}

export interface UpdateDebtorInput {
  debtorId: string;
  name: string;
  phone?: string;
}

export interface DeleteHistoryEntryInput {
  debtorId: string;
  entryId: string;
}

export interface BackupPayload {
  version: string;
  exportedAt: string;
  app: string;
  settings: AppSettings;
  records: DebtorRecord[];
}

export interface ValidationResult<T> {
  isValid: boolean;
  errors: string[];
  sanitized?: T;
}

/**
 * JayContract Pattern interface
 */
export interface JayContract<TInput, TOutput> {
  validate(input: unknown): ValidationResult<TInput>;
  execute(input: TInput): TOutput;
}
