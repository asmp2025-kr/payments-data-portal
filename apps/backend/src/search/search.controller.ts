import { Controller, Get, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { TenantContextInterceptor } from '../common/interceptors/tenant-context.interceptor';
import { TenantId } from '../common/decorators';
import { SearchService } from './search.service';

@ApiTags('search')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@UseInterceptors(TenantContextInterceptor)
@Controller('search')
export class SearchController {
  constructor(private readonly svc: SearchService) {}
  @Get() search(@TenantId() t: string, @Query('q') q: string, @Query('type') type?: string) { return this.svc.search(t, q, type); }
}
