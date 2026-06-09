import { Injectable } from '@nestjs/common';
import ExcelJS from 'exceljs';

export interface ExcelSheet {
  name: string;
  columns: { header: string; key: string; width?: number }[];
  rows: Record<string, any>[];
}

@Injectable()
export class ExcelEngine {
  async generate(title: string, sheets: ExcelSheet[]): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Payments Data Portal';
    workbook.created = new Date();
    workbook.modified = new Date();

    // Cover sheet
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

      // Header row styling
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

      // Data rows with alternating colors
      sheetDef.rows.forEach((row, idx) => {
        const r = ws.addRow(row);
        if (idx % 2 === 0) {
          r.eachCell(cell => {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };
          });
        }
      });

      // Auto-filter
      ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: sheetDef.columns.length } };

      // Freeze header
      ws.views = [{ state: 'frozen', ySplit: 1 }];
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
