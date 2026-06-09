import { Controller, Get, Post, Body, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { TenantContextInterceptor } from '../common/interceptors/tenant-context.interceptor';
import { TenantId } from '../common/decorators';
import { SubscriptionsService } from './subscriptions.service';

@ApiTags('subscriptions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@UseInterceptors(TenantContextInterceptor)
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly svc: SubscriptionsService) {}
  @Get('plans') getPlans() { return this.svc.getPlans(); }
  @Get('current') getCurrent(@TenantId() t: string) { return this.svc.getForTenant(t); }
  @Post() create(@TenantId() t: string, @Body() b: any) { return this.svc.create(t, b.plan); }
}
