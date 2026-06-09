import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
export declare class SearchService {
    private readonly cfg;
    private readonly db;
    private readonly opensearchUrl;
    constructor(cfg: ConfigService, db: DataSource);
    search(tenantId: string, query: string, type?: string): Promise<any>;
    private postgresSearch;
}
