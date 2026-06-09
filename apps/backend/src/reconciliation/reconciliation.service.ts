import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { DateRangeDto } from '../common/dto/pagination.dto';

@Injectable()
export class ReconciliationService {
  constructor(@InjectDataSource() private readonly db: DataSource) {}

  async getSummary(tenantId: string, dto: DateRangeDto) {
    const dateFrom = dto.dateFrom || new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
    const dateTo = dto.dateTo || new Date().toISOString().split('T')[0];
    const [s] = await this.db.query(`
      SELECT
        COUNT(*)::bigint                                         AS total_records,
        COUNT(*) FILTER(WHERE status='matched')::bigint          AS matched,
        COUNT(*) FILTER(WHERE status='unmatched')::bigint        AS unmatched,
        COUNT(*) FILTER(WHERE status='break')::bigint            AS breaks,
        COUNT(*) FILTER(WHERE status='investigating')::bigint    AS investigating,
        COUNT(*) FILTER(WHERE aged_days > 5)::bigint             AS aged_items,
        SUM(ABS(variance))                                       AS total_variance,
        ROUND(COUNT(*) FILTER(WHERE status='matched')::numeric/NULLIF(COUNT(*),0)*100,2) AS match_rate
      FROM app.reconciliation_records
      WHERE recon_date BETWEEN $1 AND $2
    `, [dateFrom, dateTo]);
    return s;
  }

  async getBreaks(tenantId: string, dto: DateRangeDto) {
    const dateFrom = dto.dateFrom || new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
    const dateTo = dto.dateTo || new Date().toISOString().split('T')[0];
    return this.db.query(`
      SELECT * FROM app.reconciliation_records
      WHERE status IN ('break','unmatched','investigating')
        AND recon_date BETWEEN $1 AND $2
      ORDER BY ABS(variance) DESC, aged_days DESC
      LIMIT $3 OFFSET $4
    `, [dateFrom, dateTo, dto.limit||50, ((dto.page||1)-1)*(dto.limit||50)]);
  }

  async getAgingReport(tenantId: string) {
    return this.db.query(`
      SELECT
        CASE WHEN aged_days <= 1 THEN '0-1 days'
             WHEN aged_days <= 3 THEN '2-3 days'
             WHEN aged_days <= 7 THEN '4-7 days'
             ELSE '> 7 days'
        END AS aging_bucket,
        COUNT(*)::bigint AS count,
        SUM(ABS(variance)) AS total_variance
      FROM app.reconciliation_records
      WHERE status IN ('break','unmatched','investigating')
      GROUP BY 1 ORDER BY min(aged_days)
    `);
  }

  async getTrend(tenantId: string, dto: DateRangeDto) {
    const dateFrom = dto.dateFrom || new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
    const dateTo = dto.dateTo || new Date().toISOString().split('T')[0];
    return this.db.query(`
      SELECT recon_date,
        COUNT(*)::bigint AS total,
        COUNT(*) FILTER(WHERE status='matched')::bigint AS matched,
        COUNT(*) FILTER(WHERE status IN ('break','unmatched'))::bigint AS breaks
      FROM app.reconciliation_records WHERE recon_date BETWEEN $1 AND $2
      GROUP BY 1 ORDER BY 1
    `, [dateFrom, dateTo]);
  }
}
