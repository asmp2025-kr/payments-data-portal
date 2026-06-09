import { ReconciliationService } from './reconciliation.service';
import { DateRangeDto } from '../common/dto/pagination.dto';
export declare class ReconciliationController {
    private readonly svc;
    constructor(svc: ReconciliationService);
    getSummary(t: string, dto: DateRangeDto): Promise<any>;
    getBreaks(t: string, dto: DateRangeDto): Promise<any>;
    getAging(t: string): Promise<any>;
    getTrend(t: string, dto: DateRangeDto): Promise<any>;
}
