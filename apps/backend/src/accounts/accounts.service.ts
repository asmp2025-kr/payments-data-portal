import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { DateRangeDto } from '../common/dto/pagination.dto';

@Injectable()
export class AccountsService {
  constructor(@InjectDataSource() private readonly db: DataSource) {}

  async getSummary(tenantId: string) {
    const [s] = await this.db.query(`
      SELECT
        COUNT(*)::bigint                                         AS total_accounts,
        COUNT(*) FILTER(WHERE status='active')::bigint          AS active_accounts,
        COUNT(*) FILTER(WHERE status='dormant')::bigint         AS dormant_accounts,
        COUNT(*) FILTER(WHERE status='closed')::bigint          AS closed_accounts,
        COUNT(*) FILTER(WHERE status='frozen')::bigint          AS frozen_accounts,
        SUM(balance)                                            AS total_balance,
        SUM(available_balance)                                  AS total_available,
        COUNT(*) FILTER(WHERE last_activity_at > NOW()-INTERVAL '30 days')::bigint AS active_30d
      FROM app.accounts
    `);
    return s;
  }

  async getList(tenantId: string, dto: DateRangeDto & { status?: string; accountType?: string }) {
    const offset = ((dto.page || 1) - 1) * (dto.limit || 20);
    const params: any[] = [dto.limit || 20, offset];
    const conds: string[] = [];
    if (dto.status) { params.push(dto.status); conds.push(`status = $${params.length}`); }
    if (dto.accountType) { params.push(dto.accountType); conds.push(`account_type = $${params.length}`); }
    const where = conds.length ? `WHERE ${conds.join(' AND ')}` : '';
    return this.db.query(`SELECT * FROM app.accounts ${where} ORDER BY balance DESC LIMIT $1 OFFSET $2`, params);
  }

  async getDormancyReport(tenantId: string) {
    return this.db.query(`
      SELECT
        CASE
          WHEN last_activity_at < NOW()-INTERVAL '365 days' THEN '> 1 year'
          WHEN last_activity_at < NOW()-INTERVAL '180 days' THEN '6-12 months'
          WHEN last_activity_at < NOW()-INTERVAL '90 days'  THEN '3-6 months'
          ELSE '< 3 months'
        END AS dormancy_bucket,
        COUNT(*)::bigint AS count,
        SUM(balance) AS balance
      FROM app.accounts WHERE status = 'dormant'
      GROUP BY 1 ORDER BY 2 DESC
    `);
  }
}
