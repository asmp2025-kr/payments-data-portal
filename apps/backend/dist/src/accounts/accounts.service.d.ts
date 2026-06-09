import { DataSource } from 'typeorm';
import { DateRangeDto } from '../common/dto/pagination.dto';
export declare class AccountsService {
    private readonly db;
    constructor(db: DataSource);
    getSummary(tenantId: string): Promise<any>;
    getList(tenantId: string, dto: DateRangeDto & {
        status?: string;
        accountType?: string;
    }): Promise<any>;
    getDormancyReport(tenantId: string): Promise<any>;
}
