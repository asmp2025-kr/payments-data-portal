import { DataSource } from 'typeorm';
export declare const PLAN_FEATURES: {
    basic: {
        max_users: number;
        custom_dashboards: boolean;
        excel_export: boolean;
        api_access: boolean;
        white_label: boolean;
        sso: boolean;
    };
    professional: {
        max_users: number;
        custom_dashboards: boolean;
        excel_export: boolean;
        api_access: boolean;
        white_label: boolean;
        sso: boolean;
    };
    enterprise: {
        max_users: number;
        custom_dashboards: boolean;
        excel_export: boolean;
        api_access: boolean;
        white_label: boolean;
        sso: boolean;
    };
};
export declare class SubscriptionsService {
    private readonly db;
    constructor(db: DataSource);
    getForTenant(tenantId: string): Promise<any>;
    checkFeature(tenantId: string, feature: string): Promise<boolean>;
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
    create(tenantId: string, plan: string): Promise<any>;
}
