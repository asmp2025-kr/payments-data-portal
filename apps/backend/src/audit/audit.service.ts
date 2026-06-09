import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class AuditService {
  constructor(@InjectDataSource() private readonly db: DataSource) {}

  async getLogs(tenantId: string, dto: any) {
    const offset = ((dto.page || 1) - 1) * (dto.limit || 50);
    const params: any[] = [tenantId, dto.limit || 50, offset];
    const conds: string[] = [];
    if (dto.userId) { params.push(dto.userId); conds.push(`al.user_id = $${params.length}`); }
    if (dto.action) { params.push(`%${dto.action}%`); conds.push(`al.action ILIKE $${params.length}`); }
    if (dto.dateFrom) { params.push(dto.dateFrom); conds.push(`al.created_at >= $${params.length}`); }
    if (dto.dateTo) { params.push(dto.dateTo); conds.push(`al.created_at <= $${params.length}`); }
    const where = conds.length ? `AND ${conds.join(' AND ')}` : '';

    return this.db.query(`
      SELECT al.id, al.action, al.entity_type, al.entity_id, al.ip_address,
             al.result, al.created_at,
             u.email AS user_email, u.first_name, u.last_name, u.role
      FROM app.audit_logs al
      LEFT JOIN app.users u ON u.id = al.user_id
      WHERE al.tenant_id = $1 ${where}
      ORDER BY al.created_at DESC LIMIT $2 OFFSET $3
    `, params);
  }
}
