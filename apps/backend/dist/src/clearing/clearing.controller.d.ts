import { ClearingService } from './clearing.service';
import { DateRangeDto } from '../common/dto/pagination.dto';
export declare class ClearingController {
    private readonly svc;
    constructor(svc: ClearingService);
    getSummary(tenantId: string, dto: DateRangeDto): Promise<any>;
    getHourlyTrend(tenantId: string, dto: DateRangeDto): Promise<any>;
    getDailyTrend(tenantId: string, dto: DateRangeDto): Promise<any>;
    getTransactions(tenantId: string, dto: DateRangeDto & {
        status?: string;
    }): Promise<{
        data: any;
        total: number;
        page: number;
        limit: number;
    }>;
    getParticipants(tenantId: string, dto: DateRangeDto): Promise<any>;
    getExceptions(tenantId: string, dto: DateRangeDto): Promise<any>;
}
