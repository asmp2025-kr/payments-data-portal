import { DashboardsService } from './dashboards.service';
export declare class DashboardsController {
    private readonly svc;
    constructor(svc: DashboardsService);
    findAll(t: string, dto: any): Promise<any>;
    getTemplates(t: string): Promise<any>;
    findById(t: string, id: string): Promise<any>;
    create(t: string, u: any, b: any): Promise<any>;
    update(t: string, id: string, b: any): Promise<any>;
    clone(t: string, u: any, id: string): Promise<any>;
    share(id: string): Promise<{
        token: string;
    }>;
    remove(t: string, id: string): Promise<{
        success: boolean;
    }>;
}
