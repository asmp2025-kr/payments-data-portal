import { DataSource } from 'typeorm';
import { DateRangeDto } from '../common/dto/pagination.dto';
export declare class AmlService {
    private readonly db;
    constructor(db: DataSource);
    getSummary(tenantId: string, dto: DateRangeDto): Promise<any>;
    getTrend(tenantId: string, dto: DateRangeDto): Promise<any>;
    getRiskDistribution(tenantId: string): Promise<any>;
    getAlerts(tenantId: string, dto: DateRangeDto & {
        status?: string;
        riskLevel?: string;
    }): Promise<any>;
    getSarFilings(tenantId: string, dto: DateRangeDto): Promise<any>;
    getSanctionsScreening(tenantId: string, dto: DateRangeDto): Promise<any>;
}
