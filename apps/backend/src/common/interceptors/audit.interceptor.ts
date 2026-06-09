import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';

const AUDITED_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, user, ip, headers } = request;

    if (!AUDITED_METHODS.includes(method) || !user) {
      return next.handle();
    }

    return next.handle().pipe(
      tap(async () => {
        try {
          await this.dataSource.query(
            `INSERT INTO app.audit_logs (tenant_id, user_id, action, ip_address, user_agent, payload)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [
              user.tenantId,
              user.sub,
              `${method} ${url}`,
              ip,
              headers['user-agent'],
              JSON.stringify({ method, url }),
            ],
          );
        } catch (_e) {
          // Non-blocking — audit failure should not break the request
        }
      }),
    );
  }
}
