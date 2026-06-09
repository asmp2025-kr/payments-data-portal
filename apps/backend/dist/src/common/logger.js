"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const winston = require("winston");
const transports = [
    new winston.transports.Console({
        format: winston.format.combine(winston.format.timestamp(), winston.format.colorize(), winston.format.printf(({ timestamp, level, message, ...meta }) => {
            const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
            return `${timestamp} [${level}] ${message}${metaStr}`;
        })),
    }),
];
exports.logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    transports,
});
//# sourceMappingURL=logger.js.map