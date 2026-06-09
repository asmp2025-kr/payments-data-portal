"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CsvEngine = void 0;
const common_1 = require("@nestjs/common");
let CsvEngine = class CsvEngine {
    generate(columns, rows) {
        const escape = (v) => {
            if (v === null || v === undefined)
                return '';
            const str = String(v);
            if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
        };
        const header = columns.map(escape).join(',');
        const body = rows.map(row => columns.map(col => escape(row[col])).join(',')).join('\n');
        return `${header}\n${body}`;
    }
};
exports.CsvEngine = CsvEngine;
exports.CsvEngine = CsvEngine = __decorate([
    (0, common_1.Injectable)()
], CsvEngine);
//# sourceMappingURL=csv.engine.js.map