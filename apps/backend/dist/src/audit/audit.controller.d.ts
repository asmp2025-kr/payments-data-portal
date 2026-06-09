import { AuditService } from './audit.service';
export declare class AuditController {
    private readonly svc;
    constructor(svc: AuditService);
    getLogs(t: string, dto: any): Promise<any>;
}
