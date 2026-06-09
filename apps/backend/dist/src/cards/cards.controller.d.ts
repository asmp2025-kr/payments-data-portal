import { CardsService } from './cards.service';
import { DateRangeDto } from '../common/dto/pagination.dto';
export declare class CardsController {
    private readonly svc;
    constructor(svc: CardsService);
    getSummary(t: string, dto: DateRangeDto): Promise<any>;
    getSpendTrend(t: string, dto: DateRangeDto): Promise<any>;
    getDeclines(t: string, dto: DateRangeDto): Promise<any>;
    getMerchants(t: string, dto: DateRangeDto): Promise<any>;
    getChannels(t: string, dto: DateRangeDto): Promise<any>;
}
