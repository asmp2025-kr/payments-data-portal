import { Injectable } from '@nestjs/common';

@Injectable()
export class CsvEngine {
  generate(columns: string[], rows: Record<string, any>[]): string {
    const escape = (v: any): string => {
      if (v === null || v === undefined) return '';
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
}
