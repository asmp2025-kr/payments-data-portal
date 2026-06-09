import { Controller, Get, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { TenantContextInterceptor } from '../common/interceptors/tenant-context.interceptor';
import { CurrentUser, TenantId } from '../common/decorators';
import { ClearingService } from './clearing.service';
import { DateRangeDto } from '../common/dto/pagination.dto';

@ApiTags('clearing')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@UseInterceptors(TenantContextInterceptor)
@Controller('clearing')
export class ClearingController {
  constructor(private readonly svc: ClearingService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Clearing KPI summary' })
  getSummary(@TenantId() tenantId: string, @Query() dto: DateRangeDto) {
    return this.svc.getSummary(tenantId, dto);
  }

  @Get('trend/hourly')
  @ApiOperation({ summary: 'Hourly clearing throughput trend' })
  getHourlyTrend(@TenantId() tenantId: string, @Query() dto: DateRangeDto) {
    return this.svc.getHourlyTrend(tenantId, dto);
  }

  @Get('trend/daily')
  @ApiOperation({ summary: 'Daily clearing trend' })
  getDailyTrend(@TenantId() tenantId: string, @Query() dto: DateRangeDto) {
    return this.svc.getDailyTrend(tenantId, dto);
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Paginated clearing transactions' })
  getTransactions(@TenantId() tenantId: string, @Query() dto: DateRangeDto & { status?: string }) {
    return this.svc.getTransactions(tenantId, dto);
  }

  @Get('participants')
  @ApiOperation({ summary: 'Participant performance ranking' })
  getParticipants(@TenantId() tenantId: string, @Query() dto: DateRangeDto) {
    return this.svc.getParticipantRanking(tenantId, dto);
  }

  @Get('exceptions')
  @ApiOperation({ summary: 'Clearing exceptions and failures' })
  getExceptions(@TenantId() tenantId: string, @Query() dto: DateRangeDto) {
    return this.svc.getExceptions(tenantId, dto);
  }
}
