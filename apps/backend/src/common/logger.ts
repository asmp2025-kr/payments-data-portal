import * as winston from 'winston';

const transports: winston.transport[] = [
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.colorize(),
      winston.format.printf(({ timestamp, level, message, ...meta }) => {
        const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
        return `${timestamp} [${level}] ${message}${metaStr}`;
      }),
    ),
  }),
];

// Loki transport disabled in cloud deployment (DISABLE_LOKI=true / no winston-loki package)
// if (process.env.LOKI_URL) { ... }

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  transports,
});
