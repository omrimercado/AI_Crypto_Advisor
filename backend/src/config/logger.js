const pino = require('pino');

const isProduction = process.env.NODE_ENV === 'production';

const logger = pino({
  level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),

  // Redact sensitive fields
  redact: {
    paths: ['req.headers.authorization', 'password', 'token', 'apiKey'],
    censor: '[REDACTED]'
  },

  // Formatting
  formatters: {
    level: (label) => ({ level: label }),
    bindings: (bindings) => ({
      pid: bindings.pid,
      host: bindings.hostname,
      node_version: process.version
    })
  },

  // Pretty print in development
  transport: isProduction ? undefined : {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname'
    }
  },

  // Base context
  base: {
    service: 'crypto-advisor-api',
    env: process.env.NODE_ENV || 'development'
  }
});

// Create child loggers for different modules
const createModuleLogger = (moduleName) => logger.child({ module: moduleName });

module.exports = {
  logger,
  createModuleLogger
};
