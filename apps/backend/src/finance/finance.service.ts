import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { DateRangeDto } from '../common/dto/pagination.dto';

@Injectable()
export class FinanceService {
  constructor(@InjectDataSource() private readonly db: DataSource) {}

  async getRevenueSummary(tenantId: string, dto: DateRangeDto) {
    const dateFrom = dto.dateFrom || new Date(Date.now() - 30 * 86400000).toISOString();
    const dateTo = dto.dateTo || new Date().toISOString();
    const [s] = await this.db.query(`
      SELECT
        SUM(cr.interchange_fee)                           AS interchange_revenue,
        SUM(sr.fees_amount)                               AS settlement_fees,
        SUM(cr.interchange_fee) + SUM(sr.fees_amount)    AS total_revenue,
        COUNT(cr.id)::bigint                              AS processed_transactions,
        ROUND(SUM(cr.interchange_fee)/NULLIF(COUNT(cr.id),0),4) AS avg_fee_per_txn
      FROM app.clearing_records cr
      LEFT JOIN app.settlement_records sr ON sr.settlement_date BETWEEN $1::date AND $2::date
      WHERE cr.cleared_at BETWEEN $1 AND $2
    `, [dateFrom, dateTo]);
    return s;
  }

  async getRevenueTrend(tenantId: string, dto: DateRangeDto) {
    const dateFrom = dto.dateFrom || new Date(Date.now() - 90 * 86400000).toISOString();
    const dateTo = dto.dateTo || new Date().toISOString();
    return this.db.query(`
      SELECT
        DATE_TRUNC('day', cleared_at)::date AS date,
        SUM(interchange_fee) AS interchange_revenue,
        COUNT(*)::bigint AS transactions
      FROM app.clearing_records WHERE cleared_at BETWEEN $1 AND $2
      GROUP BY 1 ORDER BY 1
    `, [dateFrom, dateTo]);
  }

  async getInterchangeByParticipant(tenantId: string, dto: DateRangeDto) {
    const dateFrom = dto.dateFrom || new Date(Date.now() - 30 * 86400000).toISOString();
    const dateTo = dto.dateTo || new Date().toISOString();
    return this.db.query(`
      SELECT participant_code, SUM(interchange_fee) AS interchange, COUNT(*)::bigint AS volume
      FROM app.clearing_records WHERE cleared_at BETWEEN $1 AND $2
      GROUP BY participant_code ORDER BY interchange DESC LIMIT 20
    `, [dateFrom, dateTo]);
  }
}
