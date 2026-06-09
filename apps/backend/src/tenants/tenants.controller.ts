import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators';
import { TenantsService } from './tenants.service';

@ApiTags('tenants')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tenants')
export class TenantsController {
  constructor(private readonly svc: TenantsService) {}

  @Get()
  @Roles('super_admin')
  findAll() { return this.svc.findAll(); }

  @Get(':id')
  @Roles('super_admin', 'bank_admin')
  findById(@Param('id') id: string) { return this.svc.findById(id); }

  @Post()
  @Roles('super_admin')
  create(@Body() body: any) { return this.svc.create(body); }

  @Patch(':id')
  @Roles('super_admin', 'bank_admin')
  update(@Param('id') id: string, @Body() body: any) { return this.svc.update(id, body); }

  @Get('theme/:slug')
  getTheme(@Param('slug') slug: string) { return this.svc.getThemeConfig(slug); }
}
