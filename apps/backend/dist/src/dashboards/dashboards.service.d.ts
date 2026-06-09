import { DataSource } from 'typeorm';
export declare class DashboardsService {
    private readonly db;
    constructor(db: DataSource);
    findAll(tenantId: string, dto: any): Promise<any>;
    getTemplates(tenantId: string): Promise<any>;
    findById(tenantId: string, id: string): Promise<any>;
    create(tenantId: string, userId: string, data: any): Promise<any>;
    update(tenantId: string, id: string, data: any): Promise<any>;
    clone(tenantId: string, userId: string, id: string): Promise<any>;
    generateShareToken(id: string): Promise<{
        token: string;
    }>;
    delete(tenantId: string, id: string): Promise<{
        success: boolean;
    }>;
}
