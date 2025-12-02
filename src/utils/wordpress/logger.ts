// src/utils/logger.ts

/**
 * Professional logging system that only displays messages in development.
 * In production, logs are silenced to avoid exposing sensitive information.
 */

const isDevelopment = process.env.NODE_ENV === 'development';

type LogArg = string | number | Error | object;

export const logger = {
	/**
	 * Critical error logs (issues that affect functionality)
	 */
	error: (...args: LogArg[]) => {
		if (isDevelopment) {
			console.error('\uD83D\uDD34 [ERROR]', ...args);
		}
		// TODO: In production, send to monitoring service (Sentry, LogRocket, etc.)
	},

	/**
	 * Warnings (potential issues that don't break the app)
	 */
	warn: (...args: LogArg[]) => {
		if (isDevelopment) {
			console.warn('\uD83D\uDFE1 [WARN]', ...args);
		}
	},

	/**
	 * General information (debugging)
	 */
	info: (...args: LogArg[]) => {
		if (isDevelopment) {
			console.log('\uD83D\uDD35 [INFO]', ...args);
		}
	},

	/**
	 * Success logs
	 */
	success: (...args: LogArg[]) => {
		if (isDevelopment) {
			console.log('\uD83D\uDFE2 [SUCCESS]', ...args);
		}
	},
};
