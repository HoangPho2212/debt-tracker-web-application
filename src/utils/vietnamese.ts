/**
 * Utilities for Vietnamese string normalization and search matching
 */

export function normalizeVietnamese(input: string): string {
  if (!input) return '';
  
  let str = input.toLowerCase();

  // Replace Vietnamese specific characters
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
  str = str.replace(/đ/g, 'd');

  // Remove combining diacritical marks if any remained via Unicode normalization
  str = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // Replace multiple whitespace with a single space and trim
  str = str.replace(/\s+/g, ' ').trim();

  return str;
}

export function matchesVietnameseSearch(target: string, query: string): boolean {
  if (!query || !query.trim()) return true;
  if (!target) return false;

  const normalizedTarget = normalizeVietnamese(target);
  const normalizedQuery = normalizeVietnamese(query);

  return normalizedTarget.includes(normalizedQuery);
}
