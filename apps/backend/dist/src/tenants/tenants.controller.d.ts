import { TenantsService } from './tenants.service';
export declare class TenantsController {
    private readonly svc;
    constructor(svc: TenantsService);
    findAll(): Promise<any>;
    findById(id: string): Promise<any>;
    create(body: any): Promise<any>;
    update(id: string, body: any): Promise<any>;
    getTheme(slug: string): Promise<any>;
}
