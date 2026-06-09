import { Controller, Get, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { TenantContextInterceptor } from '../common/interceptors/tenant-context.interceptor';
import { TenantId } from '../common/decorators';
import { AccountsService } from './accounts.service';
import { DateRangeDto } from '../common/dto/pagination.dto';

@ApiTags('accounts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@UseInterceptors(TenantContextInterceptor)
@Controller('accounts')
export class AccountsController {
  constructor(private readonly svc: AccountsService) {}
  @Get('summary') getSummary(@TenantId() t: string) { return this.svc.getSummary(t); }
  @Get() getList(@TenantId() t: string, @Query() dto: any) { return this.svc.getList(t, dto); }
  @Get('dormancy') getDormancy(@TenantId() t: string) { return this.svc.getDormancyReport(t); }
}
