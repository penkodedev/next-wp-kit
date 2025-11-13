// src/utils/logger.ts

/**
 * Professional logging system that only displays messages in development.
 * In production, logs are silenced to avoid exposing sensitive information.
 */

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = {
  /**
   * Critical error logs (issues that affect functionality)
   */
  error: (...args: any[]) => {
    if (isDevelopment) {
      console.error('🔴 [ERROR]', ...args);
    }
    // TODO: In production, send to monitoring service (Sentry, LogRocket, etc.)
  },

  /**
   * Warnings (potential issues that don't break the app)
   */
  warn: (...args: any[]) => {
    if (isDevelopment) {
      console.warn('🟡 [WARN]', ...args);
    }
  },

  /**
   * General information (debugging)
   */
  info: (...args: any[]) => {
    if (isDevelopment) {
      console.log('🔵 [INFO]', ...args);
    }
  },

  /**
   * Success logs
   */
  success: (...args: any[]) => {
    if (isDevelopment) {
      console.log('🟢 [SUCCESS]', ...args);
    }
  },
};
