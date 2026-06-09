import { Controller, Get, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { TenantContextInterceptor } from '../common/interceptors/tenant-context.interceptor';
import { TenantId } from '../common/decorators';
import { AuditService } from './audit.service';

@ApiTags('audit')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@UseInterceptors(TenantContextInterceptor)
@Controller('audit')
export class AuditController {
  constructor(private readonly svc: AuditService) {}
  @Get('logs') getLogs(@TenantId() t: string, @Query() dto: any) { return this.svc.getLogs(t, dto); }
}
