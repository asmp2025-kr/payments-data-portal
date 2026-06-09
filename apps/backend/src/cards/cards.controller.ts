import { Controller, Get, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { TenantContextInterceptor } from '../common/interceptors/tenant-context.interceptor';
import { TenantId } from '../common/decorators';
import { CardsService } from './cards.service';
import { DateRangeDto } from '../common/dto/pagination.dto';

@ApiTags('cards')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@UseInterceptors(TenantContextInterceptor)
@Controller('cards')
export class CardsController {
  constructor(private readonly svc: CardsService) {}
  @Get('summary') getSummary(@TenantId() t: string, @Query() dto: DateRangeDto) { return this.svc.getSummary(t, dto); }
  @Get('spend-trend') getSpendTrend(@TenantId() t: string, @Query() dto: DateRangeDto) { return this.svc.getSpendTrend(t, dto); }
  @Get('decline-analysis') getDeclines(@TenantId() t: string, @Query() dto: DateRangeDto) { return this.svc.getDeclineAnalysis(t, dto); }
  @Get('merchant-spend') getMerchants(@TenantId() t: string, @Query() dto: DateRangeDto) { return this.svc.getMerchantSpend(t, dto); }
  @Get('by-channel') getChannels(@TenantId() t: string, @Query() dto: DateRangeDto) { return this.svc.getSpendByChannel(t, dto); }
}
