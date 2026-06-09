import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { TenantContextInterceptor } from '../common/interceptors/tenant-context.interceptor';
import { CurrentUser, TenantId } from '../common/decorators';
import { DashboardsService } from './dashboards.service';

@ApiTags('dashboards')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@UseInterceptors(TenantContextInterceptor)
@Controller('dashboards')
export class DashboardsController {
  constructor(private readonly svc: DashboardsService) {}
  @Get() findAll(@TenantId() t: string, @Query() dto: any) { return this.svc.findAll(t, dto); }
  @Get('templates') getTemplates(@TenantId() t: string) { return this.svc.getTemplates(t); }
  @Get(':id') findById(@TenantId() t: string, @Param('id') id: string) { return this.svc.findById(t, id); }
  @Post() create(@TenantId() t: string, @CurrentUser() u: any, @Body() b: any) { return this.svc.create(t, u.sub, b); }
  @Patch(':id') update(@TenantId() t: string, @Param('id') id: string, @Body() b: any) { return this.svc.update(t, id, b); }
  @Post(':id/clone') clone(@TenantId() t: string, @CurrentUser() u: any, @Param('id') id: string) { return this.svc.clone(t, u.sub, id); }
  @Post(':id/share') share(@Param('id') id: string) { return this.svc.generateShareToken(id); }
  @Delete(':id') remove(@TenantId() t: string, @Param('id') id: string) { return this.svc.delete(t, id); }
}
