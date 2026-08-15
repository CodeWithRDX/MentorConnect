/**
 * Server Logger Utility
 * Provides clean, timestamped server-side logging.
 */

const isProd = process.env.NODE_ENV === 'production';

const formatMessage = (level, message) => {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
};

const logger = {
  info: (message, ...meta) => {
    console.info(formatMessage('info', message), ...meta);
  },

  warn: (message, ...meta) => {
    console.warn(formatMessage('warn', message), ...meta);
  },

  error: (message, error, ...meta) => {
    const errorDetail = error instanceof Error ? error.message : (error || '');
    console.error(formatMessage('error', `${message}${errorDetail ? ` - ${errorDetail}` : ''}`), ...meta);
    if (!isProd && error && error.stack) {
      console.error(error.stack);
    }
  },

  debug: (message, ...meta) => {
    if (!isProd) {
      console.debug(formatMessage('debug', message), ...meta);
    }
  },
};

export default logger;
