import { AmlService } from './aml.service';
import { DateRangeDto } from '../common/dto/pagination.dto';
export declare class AmlController {
    private readonly svc;
    constructor(svc: AmlService);
    getSummary(t: string, dto: DateRangeDto): Promise<any>;
    getTrend(t: string, dto: DateRangeDto): Promise<any>;
    getRisk(t: string): Promise<any>;
    getAlerts(t: string, dto: any): Promise<any>;
    getSar(t: string, dto: DateRangeDto): Promise<any>;
    getSanctions(t: string, dto: DateRangeDto): Promise<any>;
}
