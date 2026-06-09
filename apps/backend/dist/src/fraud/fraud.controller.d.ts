import { FraudService } from './fraud.service';
import { DateRangeDto } from '../common/dto/pagination.dto';
export declare class FraudController {
    private readonly svc;
    constructor(svc: FraudService);
    getSummary(t: string, dto: DateRangeDto): Promise<any>;
    getTrend(t: string, dto: DateRangeDto): Promise<any>;
    getCases(t: string, dto: any): Promise<any>;
    getMerchantRisk(t: string, dto: DateRangeDto): Promise<any>;
    getByType(t: string, dto: DateRangeDto): Promise<any>;
    getGeographic(t: string, dto: DateRangeDto): Promise<any>;
}
