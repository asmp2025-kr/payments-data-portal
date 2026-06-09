import { Controller, Get, Post, Param, Body, Query, UseGuards, UseInterceptors, Res } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { TenantContextInterceptor } from '../common/interceptors/tenant-context.interceptor';
import { CurrentUser, TenantId } from '../common/decorators';
import { ReportsService } from './reports.service';

@ApiTags('reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@UseInterceptors(TenantContextInterceptor)
@Controller('reports')
export class ReportsController {
  constructor(private readonly svc: ReportsService) {}

  @Get('catalog')
  getCatalog(@Query('module') module?: string, @Query('search') search?: string) {
    return this.svc.getCatalog(module, search);
  }

  @Get()
  getReports(@TenantId() t: string, @Query() dto: any) { return this.svc.getReports(t, dto); }

  @Get('runs')
  getRuns(@TenantId() t: string, @Query('reportId') reportId?: string) { return this.svc.getRuns(t, reportId); }

  @Post('generate')
  generate(@TenantId() t: string, @CurrentUser() u: any, @Body() body: any) {
    return this.svc.generate(t, u.sub, body);
  }

  @Get('runs/:runId/download')
  async download(@Param('runId') runId: string) {
    const url = await this.svc.getDownloadUrl(runId);
    return { url };
  }
}
