import { DataSource } from 'typeorm';
import { DateRangeDto } from '../common/dto/pagination.dto';
export declare class ComplianceService {
    private readonly db;
    constructor(db: DataSource);
    getSummary(tenantId: string): Promise<any>;
    getFindings(tenantId: string, dto: DateRangeDto & {
        status?: string;
        severity?: string;
    }): Promise<any>;
    getBySeverity(tenantId: string): Promise<any>;
    getScore(tenantId: string): Promise<{
        score: number;
    }>;
}
