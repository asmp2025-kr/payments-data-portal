import { DataSource } from 'typeorm';
import { DateRangeDto } from '../common/dto/pagination.dto';
export declare class SettlementService {
    private readonly db;
    constructor(db: DataSource);
    getSummary(tenantId: string, dto: DateRangeDto): Promise<any>;
    getNetPositions(tenantId: string, dto: DateRangeDto): Promise<any>;
    getDailyTrend(tenantId: string, dto: DateRangeDto): Promise<any>;
    getRecords(tenantId: string, dto: DateRangeDto & {
        status?: string;
    }): Promise<any>;
    getLiquidityReport(tenantId: string): Promise<any>;
}
