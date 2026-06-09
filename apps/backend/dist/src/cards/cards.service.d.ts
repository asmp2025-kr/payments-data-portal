import { DataSource } from 'typeorm';
import { DateRangeDto } from '../common/dto/pagination.dto';
export declare class CardsService {
    private readonly db;
    constructor(db: DataSource);
    getSummary(tenantId: string, dto: DateRangeDto): Promise<any>;
    getSpendTrend(tenantId: string, dto: DateRangeDto): Promise<any>;
    getDeclineAnalysis(tenantId: string, dto: DateRangeDto): Promise<any>;
    getMerchantSpend(tenantId: string, dto: DateRangeDto): Promise<any>;
    getSpendByChannel(tenantId: string, dto: DateRangeDto): Promise<any>;
}
