import { ComplianceService } from './compliance.service';
export declare class ComplianceController {
    private readonly svc;
    constructor(svc: ComplianceService);
    getSummary(t: string): Promise<any>;
    getFindings(t: string, dto: any): Promise<any>;
    getBySeverity(t: string): Promise<any>;
    getScore(t: string): Promise<{
        score: number;
    }>;
}
