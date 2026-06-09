import { Controller, Get, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { TenantContextInterceptor } from '../common/interceptors/tenant-context.interceptor';
import { TenantId } from '../common/decorators';
import { SettlementService } from './settlement.service';
import { DateRangeDto } from '../common/dto/pagination.dto';

@ApiTags('settlement')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@UseInterceptors(TenantContextInterceptor)
@Controller('settlement')
export class SettlementController {
  constructor(private readonly svc: SettlementService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Settlement KPI summary' })
  getSummary(@TenantId() tid: string, @Query() dto: DateRangeDto) {
    return this.svc.getSummary(tid, dto);
  }

  @Get('positions')
  @ApiOperation({ summary: 'Net settlement positions by participant' })
  getPositions(@TenantId() tid: string, @Query() dto: DateRangeDto) {
    return this.svc.getNetPositions(tid, dto);
  }

  @Get('trend')
  @ApiOperation({ summary: 'Daily settlement trend' })
  getTrend(@TenantId() tid: string, @Query() dto: DateRangeDto) {
    return this.svc.getDailyTrend(tid, dto);
  }

  @Get('records')
  @ApiOperation({ summary: 'Paginated settlement records' })
  getRecords(@TenantId() tid: string, @Query() dto: DateRangeDto & { status?: string }) {
    return this.svc.getRecords(tid, dto);
  }

  @Get('liquidity')
  @ApiOperation({ summary: 'Intraday liquidity exposure' })
  getLiquidity(@TenantId() tid: string) {
    return this.svc.getLiquidityReport(tid);
  }
}
