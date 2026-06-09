import { DataSource } from 'typeorm';
export declare class TenantsService {
    private readonly db;
    constructor(db: DataSource);
    findAll(): Promise<any>;
    findById(id: string): Promise<any>;
    create(data: any): Promise<any>;
    update(id: string, data: any): Promise<any>;
    getThemeConfig(slug: string): Promise<any>;
}
