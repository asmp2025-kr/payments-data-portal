export interface ReportCatalogEntry {
    id: string;
    name: string;
    module: string;
    type: string;
    description: string;
    formats: string[];
    defaultSchedule?: string;
    parameters: string[];
}
export declare const REPORT_CATALOG: ReportCatalogEntry[];
