import { AccountsService } from './accounts.service';
export declare class AccountsController {
    private readonly svc;
    constructor(svc: AccountsService);
    getSummary(t: string): Promise<any>;
    getList(t: string, dto: any): Promise<any>;
    getDormancy(t: string): Promise<any>;
}
