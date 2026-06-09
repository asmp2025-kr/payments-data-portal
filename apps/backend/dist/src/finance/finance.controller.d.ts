import { FinanceService } from './finance.service';
import { DateRangeDto } from '../common/dto/pagination.dto';
export declare class FinanceController {
    private readonly svc;
    constructor(svc: FinanceService);
    getRevSummary(t: string, dto: DateRangeDto): Promise<any>;
    getRevTrend(t: string, dto: DateRangeDto): Promise<any>;
    getInterchange(t: string, dto: DateRangeDto): Promise<any>;
}
