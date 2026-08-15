/**
 * Client Logger Utility
 * Works seamlessly in both Development and Production.
 * - In Development: Full detailed logging with styled tags and error objects.
 * - In Production: Sanitized error and warning messages without exposing internal stack traces.
 */

const isDev = Boolean(
  typeof import.meta !== 'undefined' &&
  (import.meta.env?.DEV || import.meta.env?.MODE === 'development')
);

/**
 * Format and sanitize error objects (especially Axios errors)
 */
const formatError = (error) => {
  if (!error) return '';

  if (typeof error === 'string') return error;

  if (error.isAxiosError || error.name === 'AxiosError') {
    const status = error.response?.status;
    const serverMessage = error.response?.data?.message || error.response?.data?.error;
    const url = error.config?.url;
    const method = error.config?.method?.toUpperCase();

    const parts = [];
    if (status) parts.push(`[HTTP ${status}]`);
    if (method && url) parts.push(`${method} ${url}`);
    if (serverMessage) parts.push(`→ ${serverMessage}`);
    else if (error.message) parts.push(`→ ${error.message}`);

    return parts.join(' ') || error.message || 'Network request failed';
  }

  if (error instanceof Error) {
    return error.message;
  }

  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
};

const logger = {
  /**
   * Log informational message
   */
  info: (message, ...args) => {
    if (isDev) {
      console.info('%c[INFO]', 'color: #3b82f6; font-weight: bold;', message, ...args);
    }
  },

  /**
   * Log general messages
   */
  log: (message, ...args) => {
    if (isDev) {
      console.log(message, ...args);
    }
  },

  /**
   * Log warnings (in both dev and prod)
   */
  warn: (message, ...args) => {
    if (isDev) {
      console.warn('%c[WARN]', 'color: #f59e0b; font-weight: bold;', message, ...args);
    } else {
      console.warn(`[WARN] ${message}`);
    }
  },

  /**
   * Log errors cleanly (Works in BOTH Development & Production)
   */
  error: (message, error, ...rest) => {
    const formatted = error ? formatError(error) : '';
    if (isDev) {
      if (formatted) {
        console.error(`%c[ERROR] ${message}:`, 'color: #ef4444; font-weight: bold;', formatted, error, ...rest);
      } else {
        console.error(`%c[ERROR]`, 'color: #ef4444; font-weight: bold;', message, ...rest);
      }
    } else {
      // Production: Clean, structured log without leaking sensitive object dumps
      if (formatted) {
        console.error(`[ERROR] ${message}: ${formatted}`);
      } else {
        console.error(`[ERROR] ${message}`);
      }
    }
  },

  /**
   * Debug message (Dev only)
   */
  debug: (message, ...args) => {
    if (isDev) {
      console.debug('%c[DEBUG]', 'color: #8b5cf6; font-weight: bold;', message, ...args);
    }
  },
};

export default logger;
