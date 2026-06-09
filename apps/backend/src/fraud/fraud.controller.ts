import { Controller, Get, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { TenantContextInterceptor } from '../common/interceptors/tenant-context.interceptor';
import { TenantId } from '../common/decorators';
import { FraudService } from './fraud.service';
import { DateRangeDto } from '../common/dto/pagination.dto';

@ApiTags('fraud')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@UseInterceptors(TenantContextInterceptor)
@Controller('fraud')
export class FraudController {
  constructor(private readonly svc: FraudService) {}

  @Get('summary') getSummary(@TenantId() t: string, @Query() dto: DateRangeDto) { return this.svc.getSummary(t, dto); }
  @Get('trend') getTrend(@TenantId() t: string, @Query() dto: DateRangeDto) { return this.svc.getTrend(t, dto); }
  @Get('cases') getCases(@TenantId() t: string, @Query() dto: any) { return this.svc.getCases(t, dto); }
  @Get('merchant-risk') getMerchantRisk(@TenantId() t: string, @Query() dto: DateRangeDto) { return this.svc.getMerchantRisk(t, dto); }
  @Get('by-type') getByType(@TenantId() t: string, @Query() dto: DateRangeDto) { return this.svc.getByFraudType(t, dto); }
  @Get('geographic') getGeographic(@TenantId() t: string, @Query() dto: DateRangeDto) { return this.svc.getGeographic(t, dto); }
}
