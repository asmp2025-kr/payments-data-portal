import { DataSource } from 'typeorm';
export declare class DataProductsService {
    private readonly db;
    constructor(db: DataSource);
    findAll(tenantId: string, dto: any): Promise<any>;
    findById(tenantId: string, id: string): Promise<any>;
    create(tenantId: string, userId: string, data: any): Promise<any>;
    requestAccess(tenantId: string, productId: string, userId: string, reason: string): Promise<any>;
    getQualityMetrics(tenantId: string, id: string): Promise<{
        qualityScore: any;
        completeness: number;
        timeliness: number;
        accuracy: number;
        lastRefreshed: any;
    }>;
    update(tenantId: string, id: string, data: any): Promise<any>;
}
