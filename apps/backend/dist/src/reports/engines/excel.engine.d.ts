export interface ExcelSheet {
    name: string;
    columns: {
        header: string;
        key: string;
        width?: number;
    }[];
    rows: Record<string, any>[];
}
export declare class ExcelEngine {
    generate(title: string, sheets: ExcelSheet[]): Promise<Buffer>;
}
