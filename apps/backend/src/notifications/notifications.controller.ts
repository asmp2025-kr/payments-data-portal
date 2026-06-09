import { Controller, Get, Patch, Param, Query, UseGuards, UseInterceptors, Sse, MessageEvent } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Observable, interval, map } from 'rxjs';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { TenantContextInterceptor } from '../common/interceptors/tenant-context.interceptor';
import { CurrentUser, TenantId } from '../common/decorators';
import { NotificationsService } from './notifications.service';

@ApiTags('notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@UseInterceptors(TenantContextInterceptor)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly svc: NotificationsService) {}

  @Get()
  getAll(@TenantId() t: string, @CurrentUser() u: any, @Query() dto: any) {
    return this.svc.getForUser(t, u.sub, dto);
  }

  @Get('unread-count')
  getUnread(@TenantId() t: string, @CurrentUser() u: any) {
    return this.svc.getUnreadCount(t, u.sub);
  }

  @Patch(':id/read')
  markRead(@TenantId() t: string, @CurrentUser() u: any, @Param('id') id: string) {
    return this.svc.markRead(t, u.sub, id);
  }

  @Patch('mark-all-read')
  markAllRead(@TenantId() t: string, @CurrentUser() u: any) {
    return this.svc.markAllRead(t, u.sub);
  }

  @Sse('stream')
  stream(@TenantId() t: string, @CurrentUser() u: any): Observable<MessageEvent> {
    return interval(30000).pipe(
      map(async () => {
        const count = await this.svc.getUnreadCount(t, u.sub);
        return { data: JSON.stringify(count) } as MessageEvent;
      }),
      map(v => v as any),
    );
  }
}
