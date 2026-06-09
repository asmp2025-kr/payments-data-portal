import { DataSource } from 'typeorm';
import { DateRangeDto } from '../common/dto/pagination.dto';
export declare class SchemeService {
    private readonly db;
    constructor(db: DataSource);
    getSummary(tenantId: string, dto: DateRangeDto): Promise<any>;
    getParticipantPerformance(tenantId: string, dto: DateRangeDto): Promise<any>;
    getTrend(tenantId: string, dto: DateRangeDto): Promise<any>;
    getParticipants(tenantId: string): Promise<any>;
}
