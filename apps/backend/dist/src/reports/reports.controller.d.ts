import { ReportsService } from './reports.service';
export declare class ReportsController {
    private readonly svc;
    constructor(svc: ReportsService);
    getCatalog(module?: string, search?: string): import("./catalog/report-catalog").ReportCatalogEntry[];
    getReports(t: string, dto: any): Promise<any>;
    getRuns(t: string, reportId?: string): Promise<any>;
    generate(t: string, u: any, body: any): Promise<any>;
    download(runId: string): Promise<{
        url: string;
    }>;
}
