"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExcelEngine = void 0;
const common_1 = require("@nestjs/common");
const exceljs_1 = require("exceljs");
let ExcelEngine = class ExcelEngine {
    async generate(title, sheets) {
        const workbook = new exceljs_1.default.Workbook();
        workbook.creator = 'Payments Data Portal';
        workbook.created = new Date();
        workbook.modified = new Date();
        const coverSheet = workbook.addWorksheet('Cover');
        coverSheet.mergeCells('A1:H1');
        coverSheet.getCell('A1').value = title;
        coverSheet.getCell('A1').font = { size: 18, bold: true, color: { argb: 'FF2563EB' } };
        coverSheet.getCell('A2').value = `Generated: ${new Date().toLocaleString()}`;
        coverSheet.getCell('A2').font = { size: 10, color: { argb: 'FF666666' } };
        coverSheet.getCell('A3').value = 'Payments Data Portal — Confidential';
        coverSheet.getCell('A3').font = { size: 10, color: { argb: 'FFEF4444' } };
        for (const sheetDef of sheets) {
            const ws = workbook.addWorksheet(sheetDef.name);
            ws.columns = sheetDef.columns.map(c => ({ ...c, width: c.width || 18 }));
            const headerRow = ws.getRow(1);
            headerRow.eachCell((cell, _idx) => {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
                cell.font = { bold: true, color: { argb: 'FFF1F5F9' } };
                cell.alignment = { vertical: 'middle', horizontal: 'center' };
                cell.border = {
                    bottom: { style: 'medium', color: { argb: 'FF2563EB' } },
                };
            });
            sheetDef.rows.forEach((row, idx) => {
                const r = ws.addRow(row);
                if (idx % 2 === 0) {
                    r.eachCell(cell => {
                        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };
                    });
                }
            });
            ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: sheetDef.columns.length } };
            ws.views = [{ state: 'frozen', ySplit: 1 }];
        }
        const buffer = await workbook.xlsx.writeBuffer();
        return Buffer.from(buffer);
    }
};
exports.ExcelEngine = ExcelEngine;
exports.ExcelEngine = ExcelEngine = __decorate([
    (0, common_1.Injectable)()
], ExcelEngine);
//# sourceMappingURL=excel.engine.js.map