import { SchemeService } from './scheme.service';
import { DateRangeDto } from '../common/dto/pagination.dto';
export declare class SchemeController {
    private readonly svc;
    constructor(svc: SchemeService);
    getSummary(t: string, dto: DateRangeDto): Promise<any>;
    getPerfomance(t: string, dto: DateRangeDto): Promise<any>;
    getTrend(t: string, dto: DateRangeDto): Promise<any>;
    getParticipants(t: string): Promise<any>;
}
