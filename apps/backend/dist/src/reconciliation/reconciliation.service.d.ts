import { DataSource } from 'typeorm';
import { DateRangeDto } from '../common/dto/pagination.dto';
export declare class ReconciliationService {
    private readonly db;
    constructor(db: DataSource);
    getSummary(tenantId: string, dto: DateRangeDto): Promise<any>;
    getBreaks(tenantId: string, dto: DateRangeDto): Promise<any>;
    getAgingReport(tenantId: string): Promise<any>;
    getTrend(tenantId: string, dto: DateRangeDto): Promise<any>;
}
