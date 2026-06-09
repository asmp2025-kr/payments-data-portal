import { DataSource } from 'typeorm';
import { DateRangeDto } from '../common/dto/pagination.dto';
export declare class ClearingService {
    private readonly db;
    constructor(db: DataSource);
    getSummary(tenantId: string, dto: DateRangeDto): Promise<any>;
    getHourlyTrend(tenantId: string, dto: DateRangeDto): Promise<any>;
    getTransactions(tenantId: string, dto: DateRangeDto & {
        status?: string;
        participantCode?: string;
    }): Promise<{
        data: any;
        total: number;
        page: number;
        limit: number;
    }>;
    getParticipantRanking(tenantId: string, dto: DateRangeDto): Promise<any>;
    getExceptions(tenantId: string, dto: DateRangeDto): Promise<any>;
    getDailyTrend(tenantId: string, dto: DateRangeDto): Promise<any>;
}
