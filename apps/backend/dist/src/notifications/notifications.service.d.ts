import { DataSource } from 'typeorm';
export declare class NotificationsService {
    private readonly db;
    constructor(db: DataSource);
    getForUser(tenantId: string, userId: string, dto: any): Promise<any>;
    getUnreadCount(tenantId: string, userId: string): Promise<any>;
    markRead(tenantId: string, userId: string, id: string): Promise<{
        success: boolean;
    }>;
    markAllRead(tenantId: string, userId: string): Promise<{
        success: boolean;
    }>;
    create(tenantId: string, data: any): Promise<any>;
}
