import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { PdfEngine } from './engines/pdf.engine';
import { ExcelEngine } from './engines/excel.engine';
import { CsvEngine } from './engines/csv.engine';
export declare class ReportsService {
    private readonly db;
    private readonly cfg;
    private readonly pdfEngine;
    private readonly excelEngine;
    private readonly csvEngine;
    private minio;
    constructor(db: DataSource, cfg: ConfigService, pdfEngine: PdfEngine, excelEngine: ExcelEngine, csvEngine: CsvEngine);
    getCatalog(module?: string, search?: string): import("./catalog/report-catalog").ReportCatalogEntry[];
    getReports(tenantId: string, dto: any): Promise<any>;
    getRuns(tenantId: string, reportId?: string): Promise<any>;
    generate(tenantId: string, userId: string, body: any): Promise<any>;
    private doGenerate;
    private fetchReportData;
    getDownloadUrl(runId: string): Promise<string>;
}
