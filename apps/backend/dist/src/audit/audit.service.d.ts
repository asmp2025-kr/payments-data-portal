import { DataSource } from 'typeorm';
export declare class AuditService {
    private readonly db;
    constructor(db: DataSource);
    getLogs(tenantId: string, dto: any): Promise<any>;
}
