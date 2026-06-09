"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const winston = require("winston");
const winston_loki_1 = require("winston-loki");
const transports = [
    new winston.transports.Console({
        format: winston.format.combine(winston.format.timestamp(), winston.format.colorize(), winston.format.printf(({ timestamp, level, message, ...meta }) => {
            const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
            return `${timestamp} [${level}] ${message}${metaStr}`;
        })),
    }),
];
if (process.env.LOKI_URL) {
    transports.push(new winston_loki_1.default({
        host: process.env.LOKI_URL,
        labels: { app: 'payments-backend' },
        json: true,
        format: winston.format.json(),
        replaceTimestamp: true,
        onConnectionError: (err) => console.error('Loki connection error:', err),
    }));
}
exports.logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    transports,
});
//# sourceMappingURL=logger.js.map