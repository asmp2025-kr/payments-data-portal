import { Controller, Get, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { TenantContextInterceptor } from '../common/interceptors/tenant-context.interceptor';
import { TenantId } from '../common/decorators';
import { FinanceService } from './finance.service';
import { DateRangeDto } from '../common/dto/pagination.dto';

@ApiTags('finance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@UseInterceptors(TenantContextInterceptor)
@Controller('finance')
export class FinanceController {
  constructor(private readonly svc: FinanceService) {}
  @Get('revenue/summary') getRevSummary(@TenantId() t: string, @Query() dto: DateRangeDto) { return this.svc.getRevenueSummary(t, dto); }
  @Get('revenue/trend') getRevTrend(@TenantId() t: string, @Query() dto: DateRangeDto) { return this.svc.getRevenueTrend(t, dto); }
  @Get('interchange') getInterchange(@TenantId() t: string, @Query() dto: DateRangeDto) { return this.svc.getInterchangeByParticipant(t, dto); }
}
