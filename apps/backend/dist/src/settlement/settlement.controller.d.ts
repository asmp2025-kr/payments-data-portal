import { SettlementService } from './settlement.service';
import { DateRangeDto } from '../common/dto/pagination.dto';
export declare class SettlementController {
    private readonly svc;
    constructor(svc: SettlementService);
    getSummary(tid: string, dto: DateRangeDto): Promise<any>;
    getPositions(tid: string, dto: DateRangeDto): Promise<any>;
    getTrend(tid: string, dto: DateRangeDto): Promise<any>;
    getRecords(tid: string, dto: DateRangeDto & {
        status?: string;
    }): Promise<any>;
    getLiquidity(tid: string): Promise<any>;
}
