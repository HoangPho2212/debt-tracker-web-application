import { describe, it, expect, beforeEach } from 'vitest';
import { AuthEngine, AUTH_CONFIG } from '../services/auth';

describe('AuthEngine', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should start as unauthenticated when localStorage is empty', () => {
    expect(AuthEngine.isAuthenticated()).toBe(false);
  });

  it('should verify correct passcode Laodaiquan123', () => {
    expect(AuthEngine.verifyPassword('Laodaiquan123')).toBe(true);
    expect(AuthEngine.verifyPassword('  Laodaiquan123  ')).toBe(true);
  });

  it('should reject wrong passcode', () => {
    expect(AuthEngine.verifyPassword('wrongpassword')).toBe(false);
    expect(AuthEngine.verifyPassword('123456')).toBe(false);
    expect(AuthEngine.verifyPassword('')).toBe(false);
  });

  it('should login successfully and persist auth token', () => {
    const success = AuthEngine.login('Laodaiquan123');
    expect(success).toBe(true);
    expect(AuthEngine.isAuthenticated()).toBe(true);
    expect(localStorage.getItem(AUTH_CONFIG.STORAGE_KEY)).toBe(AUTH_CONFIG.AUTH_TOKEN_VALID);
  });

  it('should not authenticate if login fails', () => {
    const success = AuthEngine.login('wrong');
    expect(success).toBe(false);
    expect(AuthEngine.isAuthenticated()).toBe(false);
  });

  it('should logout and clear auth token', () => {
    AuthEngine.login('Laodaiquan123');
    expect(AuthEngine.isAuthenticated()).toBe(true);

    AuthEngine.logout();
    expect(AuthEngine.isAuthenticated()).toBe(false);
    expect(localStorage.getItem(AUTH_CONFIG.STORAGE_KEY)).toBeNull();
  });
});
