import { MessageEvent } from '@nestjs/common';
import { Observable } from 'rxjs';
import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private readonly svc;
    constructor(svc: NotificationsService);
    getAll(t: string, u: any, dto: any): Promise<any>;
    getUnread(t: string, u: any): Promise<any>;
    markRead(t: string, u: any, id: string): Promise<{
        success: boolean;
    }>;
    markAllRead(t: string, u: any): Promise<{
        success: boolean;
    }>;
    stream(t: string, u: any): Observable<MessageEvent>;
}
