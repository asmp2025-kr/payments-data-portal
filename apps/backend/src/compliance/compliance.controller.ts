import { Controller, Get, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { TenantContextInterceptor } from '../common/interceptors/tenant-context.interceptor';
import { TenantId } from '../common/decorators';
import { ComplianceService } from './compliance.service';
import { DateRangeDto } from '../common/dto/pagination.dto';

@ApiTags('compliance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@UseInterceptors(TenantContextInterceptor)
@Controller('compliance')
export class ComplianceController {
  constructor(private readonly svc: ComplianceService) {}
  @Get('summary') getSummary(@TenantId() t: string) { return this.svc.getSummary(t); }
  @Get('findings') getFindings(@TenantId() t: string, @Query() dto: any) { return this.svc.getFindings(t, dto); }
  @Get('by-severity') getBySeverity(@TenantId() t: string) { return this.svc.getBySeverity(t); }
  @Get('score') getScore(@TenantId() t: string) { return this.svc.getScore(t); }
}
