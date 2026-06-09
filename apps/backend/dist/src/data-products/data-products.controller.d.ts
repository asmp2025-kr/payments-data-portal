import { DataProductsService } from './data-products.service';
export declare class DataProductsController {
    private readonly svc;
    constructor(svc: DataProductsService);
    findAll(t: string, dto: any): Promise<any>;
    findById(t: string, id: string): Promise<any>;
    create(t: string, u: any, b: any): Promise<any>;
    update(t: string, id: string, b: any): Promise<any>;
    requestAccess(t: string, id: string, u: any, b: any): Promise<any>;
    getQuality(t: string, id: string): Promise<{
        qualityScore: any;
        completeness: number;
        timeliness: number;
        accuracy: number;
        lastRefreshed: any;
    }>;
}
