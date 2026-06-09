import { DataSource } from 'typeorm';
import { DateRangeDto } from '../common/dto/pagination.dto';
export declare class FraudService {
    private readonly db;
    constructor(db: DataSource);
    getSummary(tenantId: string, dto: DateRangeDto): Promise<any>;
    getTrend(tenantId: string, dto: DateRangeDto): Promise<any>;
    getMerchantRisk(tenantId: string, dto: DateRangeDto): Promise<any>;
    getCases(tenantId: string, dto: DateRangeDto & {
        status?: string;
        fraudType?: string;
    }): Promise<any>;
    getByFraudType(tenantId: string, dto: DateRangeDto): Promise<any>;
    getGeographic(tenantId: string, dto: DateRangeDto): Promise<any>;
}
