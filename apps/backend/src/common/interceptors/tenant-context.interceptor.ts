import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';

@Injectable()
export class TenantContextInterceptor implements NestInterceptor {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const tenantId = request.user?.tenantId;

    if (tenantId) {
      request.tenantId = tenantId;
      // Set RLS context for the current request's DB queries
      await this.dataSource.query(
        `SELECT set_config('app.tenant_id', $1, true)`,
        [tenantId],
      );
    }

    return next.handle();
  }
}
