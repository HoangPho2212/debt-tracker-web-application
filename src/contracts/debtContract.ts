import {
  CreateDebtInput,
  ValidationResult,
  JayContract,
  BackupPayload,
  DebtorRecord,
  DebtHistoryEntry,
  AppSettings
} from '../types/contracts';

/**
 * Validation rules and JayContract implementation for creating / adding debt
 */
export const CreateDebtContract: JayContract<CreateDebtInput, CreateDebtInput> = {
  validate(input: unknown): ValidationResult<CreateDebtInput> {
    const errors: string[] = [];

    if (!input || typeof input !== 'object') {
      return { isValid: false, errors: ['Dữ liệu nhập không hợp lệ.'] };
    }

    const payload = input as Partial<CreateDebtInput>;

    // Validate Name
    const name = typeof payload.name === 'string' ? payload.name.trim() : '';
    if (!name) {
      errors.push('Tên khách hàng không được để trống.');
    } else if (name.length < 2) {
      errors.push('Tên khách hàng phải có ít nhất 2 ký tự.');
    } else if (name.length > 100) {
      errors.push('Tên khách hàng không được vượt quá 100 ký tự.');
    }

    // Validate Quantity
    const quantity = Number(payload.quantity);
    if (isNaN(quantity) || quantity <= 0) {
      errors.push('Số lượng suất cơm phải lớn hơn 0.');
    } else if (!Number.isInteger(quantity)) {
      errors.push('Số lượng suất cơm phải là số nguyên.');
    } else if (quantity > 1000) {
      errors.push('Số lượng suất cơm tối đa là 1.000 suất.');
    }

    // Validate PricePerMeal
    const pricePerMeal = Number(payload.pricePerMeal);
    if (isNaN(pricePerMeal) || pricePerMeal < 0) {
      errors.push('Đơn giá không hợp lệ.');
    } else if (pricePerMeal > 100000000) {
      errors.push('Đơn giá không được vượt quá 100.000.000 đ.');
    }

    // Validate ShippingFee (optional)
    let shippingFee = 0;
    if (payload.shippingFee !== undefined && payload.shippingFee !== null) {
      const parsedShip = Number(payload.shippingFee);
      if (isNaN(parsedShip) || parsedShip < 0) {
        errors.push('Phí ship phải là số không âm.');
      } else if (parsedShip > 10000000) {
        errors.push('Phí ship tối đa là 10.000.000 đ.');
      } else {
        shippingFee = Math.round(parsedShip);
      }
    }

    // Validate Phone (optional)
    let phone: string | undefined = undefined;
    if (payload.phone && typeof payload.phone === 'string' && payload.phone.trim()) {
      phone = payload.phone.trim();
      const phoneRegex = /^[0-9+()\-.\s]{9,15}$/;
      if (!phoneRegex.test(phone)) {
        errors.push('Số điện thoại không đúng định dạng.');
      }
    }

    // Note sanitization
    const note = typeof payload.note === 'string' ? payload.note.trim() : undefined;

    if (errors.length > 0) {
      return { isValid: false, errors };
    }

    return {
      isValid: true,
      errors: [],
      sanitized: {
        name,
        quantity: Math.floor(quantity),
        pricePerMeal: Math.round(pricePerMeal),
        shippingFee: shippingFee > 0 ? shippingFee : undefined,
        note: note || undefined,
        phone: phone || undefined,
        customTimestamp: payload.customTimestamp,
      },
    };
  },

  execute(input: CreateDebtInput): CreateDebtInput {
    const result = this.validate(input);
    if (!result.isValid || !result.sanitized) {
      throw new Error(result.errors.join(', '));
    }
    return result.sanitized;
  },
};

/**
 * Backup File Validation Contract
 */
export const BackupPayloadContract: JayContract<BackupPayload, BackupPayload> = {
  validate(input: unknown): ValidationResult<BackupPayload> {
    const errors: string[] = [];

    if (!input || typeof input !== 'object') {
      return { isValid: false, errors: ['Tệp sao lưu không đúng định dạng JSON.'] };
    }

    const payload = input as Partial<BackupPayload>;

    if (!Array.isArray(payload.records)) {
      errors.push('Tệp sao lưu thiếu danh sách bản ghi nợ (records).');
    } else {
      for (let i = 0; i < payload.records.length; i++) {
        const r = payload.records[i];
        if (!r || typeof r !== 'object') {
          errors.push(`Bản ghi thứ ${i + 1} không hợp lệ.`);
          break;
        }
        if (!r.id || typeof r.name !== 'string' || !r.name.trim()) {
          errors.push(`Bản ghi thứ ${i + 1} thiếu mã hoặc tên khách.`);
          break;
        }
        if (!Array.isArray(r.history)) {
          errors.push(`Bản ghi "${r.name}" thiếu danh sách lịch sử nợ.`);
          break;
        }
      }
    }

    if (errors.length > 0) {
      return { isValid: false, errors };
    }

    const sanitizedRecords: DebtorRecord[] = (payload.records || []).map((r) => {
      const sanitizedHistory: DebtHistoryEntry[] = (r.history || []).map((h) => {
        const q = Number(h.quantity) || 1;
        const p = Number(h.pricePerMeal) || 0;
        const s = Number(h.shippingFee) || 0;
        const calculatedAmount = (q * p) + s;
        return {
          entryId: String(h.entryId || Date.now()),
          timestamp: String(h.timestamp || new Date().toISOString()),
          displayDate: String(h.displayDate || ''),
          quantity: q,
          pricePerMeal: p,
          shippingFee: s > 0 ? s : undefined,
          amount: Number(h.amount) || calculatedAmount,
          note: h.note ? String(h.note) : undefined,
        };
      });

      const totalDebt = sanitizedHistory.reduce((sum, item) => sum + item.amount, 0);

      return {
        id: String(r.id),
        name: String(r.name).trim(),
        normalizedName: String(r.normalizedName || r.name.toLowerCase().trim()),
        phone: r.phone ? String(r.phone).trim() : undefined,
        totalDebt: r.status === 'settled' ? 0 : (typeof r.totalDebt === 'number' ? r.totalDebt : totalDebt),
        status: (r.status === 'settled' || r.status === 'active') ? r.status : 'active',
        createdAt: String(r.createdAt || new Date().toISOString()),
        updatedAt: String(r.updatedAt || new Date().toISOString()),
        history: sanitizedHistory,
      };
    });

    const defaultSettings: AppSettings = {
      restaurantName: 'Quán Cơm Bình Dân',
      defaultMealPrice: 35000,
      currency: 'VNĐ',
    };

    const sanitizedSettings: AppSettings = {
      restaurantName: payload.settings?.restaurantName?.trim() || defaultSettings.restaurantName,
      defaultMealPrice: Number(payload.settings?.defaultMealPrice) || defaultSettings.defaultMealPrice,
      phoneContact: payload.settings?.phoneContact?.trim() || undefined,
      currency: payload.settings?.currency?.trim() || defaultSettings.currency,
    };

    return {
      isValid: true,
      errors: [],
      sanitized: {
        version: String(payload.version || '1.0.0'),
        exportedAt: String(payload.exportedAt || new Date().toISOString()),
        app: 'QuanComDebtTracker',
        settings: sanitizedSettings,
        records: sanitizedRecords,
      },
    };
  },

  execute(input: BackupPayload): BackupPayload {
    const result = this.validate(input);
    if (!result.isValid || !result.sanitized) {
      throw new Error(result.errors.join(', '));
    }
    return result.sanitized;
  },
};
