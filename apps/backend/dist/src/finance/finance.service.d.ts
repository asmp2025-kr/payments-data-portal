import { DataSource } from 'typeorm';
import { DateRangeDto } from '../common/dto/pagination.dto';
export declare class FinanceService {
    private readonly db;
    constructor(db: DataSource);
    getRevenueSummary(tenantId: string, dto: DateRangeDto): Promise<any>;
    getRevenueTrend(tenantId: string, dto: DateRangeDto): Promise<any>;
    getInterchangeByParticipant(tenantId: string, dto: DateRangeDto): Promise<any>;
}
