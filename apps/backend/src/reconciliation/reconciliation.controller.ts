import { Controller, Get, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { TenantContextInterceptor } from '../common/interceptors/tenant-context.interceptor';
import { TenantId } from '../common/decorators';
import { ReconciliationService } from './reconciliation.service';
import { DateRangeDto } from '../common/dto/pagination.dto';

@ApiTags('reconciliation')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@UseInterceptors(TenantContextInterceptor)
@Controller('reconciliation')
export class ReconciliationController {
  constructor(private readonly svc: ReconciliationService) {}
  @Get('summary') getSummary(@TenantId() t: string, @Query() dto: DateRangeDto) { return this.svc.getSummary(t, dto); }
  @Get('breaks') getBreaks(@TenantId() t: string, @Query() dto: DateRangeDto) { return this.svc.getBreaks(t, dto); }
  @Get('aging') getAging(@TenantId() t: string) { return this.svc.getAgingReport(t); }
  @Get('trend') getTrend(@TenantId() t: string, @Query() dto: DateRangeDto) { return this.svc.getTrend(t, dto); }
}
