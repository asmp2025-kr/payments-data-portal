import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { TenantContextInterceptor } from '../common/interceptors/tenant-context.interceptor';
import { Roles, TenantId } from '../common/decorators';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(TenantContextInterceptor)
@Controller('users')
export class UsersController {
  constructor(private readonly svc: UsersService) {}
  @Get() @Roles('bank_admin','super_admin') findAll(@TenantId() t: string, @Query() dto: any) { return this.svc.findAll(t, dto); }
  @Get(':id') findById(@TenantId() t: string, @Param('id') id: string) { return this.svc.findById(t, id); }
  @Post() @Roles('bank_admin','super_admin') create(@TenantId() t: string, @Body() body: any) { return this.svc.create(t, body); }
  @Patch(':id') @Roles('bank_admin','super_admin') update(@TenantId() t: string, @Param('id') id: string, @Body() body: any) { return this.svc.update(t, id, body); }
  @Delete(':id') @Roles('bank_admin','super_admin') deactivate(@TenantId() t: string, @Param('id') id: string) { return this.svc.deactivate(t, id); }
}
