"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const winston_1 = require("winston");
const winston_loki_1 = require("winston-loki");
const transports = [
    new winston_1.default.transports.Console({
        format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.colorize(), winston_1.default.format.printf(({ timestamp, level, message, ...meta }) => {
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
        format: winston_1.default.format.json(),
        replaceTimestamp: true,
        onConnectionError: (err) => console.error('Loki connection error:', err),
    }));
}
exports.logger = winston_1.default.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    transports,
});
//# sourceMappingURL=logger.js.map