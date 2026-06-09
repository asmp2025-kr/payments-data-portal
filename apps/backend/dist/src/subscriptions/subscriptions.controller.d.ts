import { SubscriptionsService } from './subscriptions.service';
export declare class SubscriptionsController {
    private readonly svc;
    constructor(svc: SubscriptionsService);
    getPlans(): ({
        pricing: number;
        max_users: number;
        custom_dashboards: boolean;
        excel_export: boolean;
        api_access: boolean;
        white_label: boolean;
        sso: boolean;
        plan: string;
    } | {
        pricing: number;
        max_users: number;
        custom_dashboards: boolean;
        excel_export: boolean;
        api_access: boolean;
        white_label: boolean;
        sso: boolean;
        plan: string;
    } | {
        pricing: number;
        max_users: number;
        custom_dashboards: boolean;
        excel_export: boolean;
        api_access: boolean;
        white_label: boolean;
        sso: boolean;
        plan: string;
    })[];
    getCurrent(t: string): Promise<any>;
    create(t: string, b: any): Promise<any>;
}
