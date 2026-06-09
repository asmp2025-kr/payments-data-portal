import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { TenantContextInterceptor } from '../common/interceptors/tenant-context.interceptor';
import { CurrentUser, TenantId } from '../common/decorators';
import { DataProductsService } from './data-products.service';

@ApiTags('data-products')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@UseInterceptors(TenantContextInterceptor)
@Controller('data-products')
export class DataProductsController {
  constructor(private readonly svc: DataProductsService) {}
  @Get() findAll(@TenantId() t: string, @Query() dto: any) { return this.svc.findAll(t, dto); }
  @Get(':id') findById(@TenantId() t: string, @Param('id') id: string) { return this.svc.findById(t, id); }
  @Post() create(@TenantId() t: string, @CurrentUser() u: any, @Body() b: any) { return this.svc.create(t, u.sub, b); }
  @Patch(':id') update(@TenantId() t: string, @Param('id') id: string, @Body() b: any) { return this.svc.update(t, id, b); }
  @Post(':id/access-request') requestAccess(@TenantId() t: string, @Param('id') id: string, @CurrentUser() u: any, @Body() b: any) { return this.svc.requestAccess(t, id, u.sub, b.reason); }
  @Get(':id/quality') getQuality(@TenantId() t: string, @Param('id') id: string) { return this.svc.getQualityMetrics(t, id); }
}
