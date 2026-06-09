import { Controller, Get, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { TenantContextInterceptor } from '../common/interceptors/tenant-context.interceptor';
import { TenantId } from '../common/decorators';
import { AmlService } from './aml.service';
import { DateRangeDto } from '../common/dto/pagination.dto';

@ApiTags('aml')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@UseInterceptors(TenantContextInterceptor)
@Controller('aml')
export class AmlController {
  constructor(private readonly svc: AmlService) {}
  @Get('summary') getSummary(@TenantId() t: string, @Query() dto: DateRangeDto) { return this.svc.getSummary(t, dto); }
  @Get('trend') getTrend(@TenantId() t: string, @Query() dto: DateRangeDto) { return this.svc.getTrend(t, dto); }
  @Get('risk-distribution') getRisk(@TenantId() t: string) { return this.svc.getRiskDistribution(t); }
  @Get('alerts') getAlerts(@TenantId() t: string, @Query() dto: any) { return this.svc.getAlerts(t, dto); }
  @Get('sar') getSar(@TenantId() t: string, @Query() dto: DateRangeDto) { return this.svc.getSarFilings(t, dto); }
  @Get('sanctions') getSanctions(@TenantId() t: string, @Query() dto: DateRangeDto) { return this.svc.getSanctionsScreening(t, dto); }
}
