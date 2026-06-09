import { Controller, Get, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { TenantContextInterceptor } from '../common/interceptors/tenant-context.interceptor';
import { TenantId } from '../common/decorators';
import { SchemeService } from './scheme.service';
import { DateRangeDto } from '../common/dto/pagination.dto';

@ApiTags('scheme')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@UseInterceptors(TenantContextInterceptor)
@Controller('scheme')
export class SchemeController {
  constructor(private readonly svc: SchemeService) {}
  @Get('summary') getSummary(@TenantId() t: string, @Query() dto: DateRangeDto) { return this.svc.getSummary(t, dto); }
  @Get('participants/performance') getPerfomance(@TenantId() t: string, @Query() dto: DateRangeDto) { return this.svc.getParticipantPerformance(t, dto); }
  @Get('trend') getTrend(@TenantId() t: string, @Query() dto: DateRangeDto) { return this.svc.getTrend(t, dto); }
  @Get('participants') getParticipants(@TenantId() t: string) { return this.svc.getParticipants(t); }
}
