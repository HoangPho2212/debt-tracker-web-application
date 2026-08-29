import { describe, it, expect } from 'vitest';
import { CreateDebtContract, BackupPayloadContract } from '../contracts/debtContract';

describe('JayContract: CreateDebtContract', () => {
  it('should validate and sanitize valid debt input', () => {
    const input = {
      name: '  Anh Tuấn Viettel  ',
      quantity: 2,
      pricePerMeal: 35000,
      note: '  Thêm trứng ốp la  ',
      phone: '0987654321',
    };

    const res = CreateDebtContract.validate(input);
    expect(res.isValid).toBe(true);
    expect(res.errors).toHaveLength(0);
    expect(res.sanitized).toEqual({
      name: 'Anh Tuấn Viettel',
      quantity: 2,
      pricePerMeal: 35000,
      note: 'Thêm trứng ốp la',
      phone: '0987654321',
    });
  });

  it('should fail when name is empty or too short', () => {
    const res1 = CreateDebtContract.validate({ name: '', quantity: 1, pricePerMeal: 35000 });
    expect(res1.isValid).toBe(false);
    expect(res1.errors).toContain('Tên khách hàng không được để trống.');

    const res2 = CreateDebtContract.validate({ name: 'A', quantity: 1, pricePerMeal: 35000 });
    expect(res2.isValid).toBe(false);
    expect(res2.errors).toContain('Tên khách hàng phải có ít nhất 2 ký tự.');
  });

  it('should fail when quantity is <= 0 or invalid', () => {
    const res = CreateDebtContract.validate({ name: 'Chị Lan', quantity: 0, pricePerMeal: 35000 });
    expect(res.isValid).toBe(false);
    expect(res.errors).toContain('Số lượng suất cơm phải lớn hơn 0.');
  });

  it('should validate and sanitize valid debt input with shipping fee', () => {
    const input = {
      name: 'Chị Lan Ngân Hàng',
      quantity: 3,
      pricePerMeal: 35000,
      shippingFee: 15000,
      note: 'Ship lầu 4',
    };

    const res = CreateDebtContract.validate(input);
    expect(res.isValid).toBe(true);
    expect(res.sanitized?.shippingFee).toBe(15000);
    expect(res.sanitized?.name).toBe('Chị Lan Ngân Hàng');
  });

  it('should reject negative shipping fee', () => {
    const res = CreateDebtContract.validate({ name: 'Chị Lan', quantity: 1, pricePerMeal: 35000, shippingFee: -5000 });
    expect(res.isValid).toBe(false);
    expect(res.errors).toContain('Phí ship phải là số không âm.');
  });
});

describe('JayContract: BackupPayloadContract', () => {
  it('should validate valid backup JSON payload', () => {
    const payload = {
      version: '1.0.0',
      exportedAt: '2026-08-28T12:00:00.000Z',
      app: 'QuanComDebtTracker',
      settings: {
        restaurantName: 'Quán Cơm Mai',
        defaultMealPrice: 40000,
        currency: 'VNĐ',
      },
      records: [
        {
          id: 'KH_1',
          name: 'Anh Nam',
          normalizedName: 'anh nam',
          totalDebt: 40000,
          status: 'active',
          createdAt: '2026-08-28T10:00:00.000Z',
          updatedAt: '2026-08-28T10:00:00.000Z',
          history: [
            {
              entryId: 'ENT_1',
              timestamp: '2026-08-28T10:00:00.000Z',
              displayDate: '10:00 28/08/2026',
              quantity: 1,
              pricePerMeal: 40000,
              amount: 40000,
            },
          ],
        },
      ],
    };

    const res = BackupPayloadContract.validate(payload);
    expect(res.isValid).toBe(true);
    expect(res.sanitized?.records).toHaveLength(1);
    expect(res.sanitized?.settings.restaurantName).toBe('Quán Cơm Mai');
  });

  it('should reject invalid backup payload lacking records array', () => {
    const res = BackupPayloadContract.validate({ version: '1.0.0' });
    expect(res.isValid).toBe(false);
    expect(res.errors).toContain('Tệp sao lưu thiếu danh sách bản ghi nợ (records).');
  });
});
