import { describe, it, expect } from 'vitest';
import { normalizeVietnamese, matchesVietnameseSearch } from '../utils/vietnamese';
import { formatCurrency, formatVietnameseDateTime, formatVietnameseDate, isToday } from '../utils/formatters';

describe('Vietnamese String & Formatter Utilities', () => {
  describe('normalizeVietnamese', () => {
    it('should correctly normalize Vietnamese diacritics and casing', () => {
      expect(normalizeVietnamese('Anh Tuấn Viettel')).toBe('anh tuan viettel');
      expect(normalizeVietnamese('  ĐẶNG VĂN ĐỒNG  ')).toBe('dang van dong');
      expect(normalizeVietnamese('Cơm sườn + bì + chả')).toBe('com suon + bi + cha');
      expect(normalizeVietnamese('Nguyễn Thị Hương')).toBe('nguyen thi huong');
    });

    it('should handle empty or whitespace string', () => {
      expect(normalizeVietnamese('')).toBe('');
      expect(normalizeVietnamese('   ')).toBe('');
    });
  });

  describe('matchesVietnameseSearch', () => {
    it('should match search query without diacritics', () => {
      expect(matchesVietnameseSearch('Anh Tuấn Viettel', 'tuan')).toBe(true);
      expect(matchesVietnameseSearch('Anh Tuấn Viettel', 'VIETTEL')).toBe(true);
      expect(matchesVietnameseSearch('Đặng Văn Đông', 'dong')).toBe(true);
      expect(matchesVietnameseSearch('Đặng Văn Đông', 'đặng')).toBe(true);
    });

    it('should return false when query does not match', () => {
      expect(matchesVietnameseSearch('Anh Tuấn Viettel', 'huyen')).toBe(false);
    });

    it('should return true if query is empty or only whitespace', () => {
      expect(matchesVietnameseSearch('Anh Tuấn', '')).toBe(true);
      expect(matchesVietnameseSearch('Anh Tuấn', '   ')).toBe(true);
    });
  });

  describe('formatCurrency', () => {
    it('should format VND currency with thousands separator', () => {
      expect(formatCurrency(35000)).toMatch(/35[.,]000\s*đ/);
      expect(formatCurrency(140000)).toMatch(/140[.,]000\s*đ/);
      expect(formatCurrency(0)).toBe('0 đ');
    });
  });

  describe('formatVietnameseDateTime', () => {
    it('should format date to Vietnamese format HH:mm DD/MM/YYYY', () => {
      const date = new Date(2026, 7, 28, 12, 30); // 28/08/2026 12:30
      expect(formatVietnameseDateTime(date)).toBe('12:30 28/08/2026');
    });

    it('should format date to Vietnamese format DD/MM/YYYY', () => {
      const date = new Date(2026, 7, 28, 12, 30);
      expect(formatVietnameseDate(date)).toBe('28/08/2026');
    });
  });

  describe('isToday', () => {
    it('should correctly identify today date', () => {
      expect(isToday(new Date())).toBe(true);
      expect(isToday(new Date(2020, 0, 1))).toBe(false);
    });
  });
});
