import { DataSource } from 'typeorm';
export declare class UsersService {
    private readonly db;
    constructor(db: DataSource);
    findAll(tenantId: string, dto: any): Promise<any>;
    findById(tenantId: string, id: string): Promise<any>;
    create(tenantId: string, data: any): Promise<any>;
    update(tenantId: string, id: string, data: any): Promise<any>;
    deactivate(tenantId: string, id: string): Promise<{
        success: boolean;
    }>;
}
