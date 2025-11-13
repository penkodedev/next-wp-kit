// src/utils/logger.ts

/**
 * Sistema de logging profesional que solo muestra mensajes en desarrollo.
 * En producción, los logs se silencian para no exponer información sensible.
 */

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = {
  /**
   * Logs de error críticos (problemas que afectan funcionalidad)
   */
  error: (...args: any[]) => {
    if (isDevelopment) {
      console.error('🔴 [ERROR]', ...args);
    }
    // TODO: En producción, enviar a servicio de monitoreo (Sentry, LogRocket, etc.)
  },

  /**
   * Warnings (problemas potenciales que no rompen la app)
   */
  warn: (...args: any[]) => {
    if (isDevelopment) {
      console.warn('🟡 [WARN]', ...args);
    }
  },

  /**
   * Información general (debugging)
   */
  info: (...args: any[]) => {
    if (isDevelopment) {
      console.log('🔵 [INFO]', ...args);
    }
  },

  /**
   * Logs de éxito
   */
  success: (...args: any[]) => {
    if (isDevelopment) {
      console.log('🟢 [SUCCESS]', ...args);
    }
  },
};
