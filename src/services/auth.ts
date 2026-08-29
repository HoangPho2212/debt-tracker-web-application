/**
 * Sổ Ghi Nợ Quán Cơm - Authentication & Device Passcode Lock Engine
 */

export const AUTH_CONFIG = {
  STORAGE_KEY: 'QUAN_COM_AUTH_TOKEN_V1',
  DEFAULT_PASSWORD: 'Laodaiquan123',
  AUTH_TOKEN_VALID: 'AUTH_OK_LAODAIQUAN_V1',
} as const;

export const AuthEngine = {
  /**
   * Checks whether the current device is unlocked and authenticated
   */
  isAuthenticated(): boolean {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return false;
      }
      const token = window.localStorage.getItem(AUTH_CONFIG.STORAGE_KEY);
      return token === AUTH_CONFIG.AUTH_TOKEN_VALID;
    } catch {
      return false;
    }
  },

  /**
   * Verifies the input password against the eatery passcode
   */
  verifyPassword(inputPassword: string): boolean {
    if (!inputPassword || typeof inputPassword !== 'string') {
      return false;
    }
    return inputPassword.trim() === AUTH_CONFIG.DEFAULT_PASSWORD;
  },

  /**
   * Attempts to log in and unlock the device. Saves auth token if correct.
   */
  login(inputPassword: string): boolean {
    if (this.verifyPassword(inputPassword)) {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(AUTH_CONFIG.STORAGE_KEY, AUTH_CONFIG.AUTH_TOKEN_VALID);
        }
      } catch (err) {
        console.warn('LocalStorage auth save error:', err);
      }
      return true;
    }
    return false;
  },

  /**
   * Locks the application on this device
   */
  logout(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(AUTH_CONFIG.STORAGE_KEY);
      }
    } catch (err) {
      console.warn('LocalStorage auth remove error:', err);
    }
  },
};
