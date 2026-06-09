import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { DateRangeDto } from '../common/dto/pagination.dto';

@Injectable()
export class ClearingService {
  constructor(@InjectDataSource() private readonly db: DataSource) {}

  async getSummary(tenantId: string, dto: DateRangeDto) {
    const dateFrom = dto.dateFrom || new Date(Date.now() - 30 * 86400000).toISOString();
    const dateTo = dto.dateTo || new Date().toISOString();

    const [summary] = await this.db.query(`
      SELECT
        COUNT(*)::bigint                                                   AS total_transactions,
        SUM(gross_amount)                                                  AS total_value,
        COUNT(*) FILTER (WHERE status = 'cleared')::bigint                AS cleared_count,
        COUNT(*) FILTER (WHERE status = 'failed')::bigint                 AS failed_count,
        COUNT(*) FILTER (WHERE status = 'exception')::bigint              AS exception_count,
        ROUND(COUNT(*) FILTER (WHERE status = 'cleared')::numeric /
          NULLIF(COUNT(*), 0) * 100, 2)                                   AS success_rate,
        ROUND(AVG(processing_time_ms)::numeric, 0)                        AS avg_processing_time_ms,
        SUM(interchange_fee)                                               AS total_interchange_fees
      FROM app.clearing_records
      WHERE cleared_at BETWEEN $1 AND $2
    `, [dateFrom, dateTo]);

    return summary;
  }

  async getHourlyTrend(tenantId: string, dto: DateRangeDto) {
    const dateFrom = dto.dateFrom || new Date(Date.now() - 24 * 3600000).toISOString();
    const dateTo = dto.dateTo || new Date().toISOString();

    return this.db.query(`
      SELECT
        DATE_TRUNC('hour', cleared_at) AS hour,
        COUNT(*)::bigint               AS volume,
        SUM(gross_amount)              AS value,
        COUNT(*) FILTER (WHERE status = 'cleared')::bigint  AS cleared,
        COUNT(*) FILTER (WHERE status = 'failed')::bigint   AS failed
      FROM app.clearing_records
      WHERE cleared_at BETWEEN $1 AND $2
      GROUP BY 1 ORDER BY 1
    `, [dateFrom, dateTo]);
  }

  async getTransactions(tenantId: string, dto: DateRangeDto & { status?: string; participantCode?: string }) {
    const dateFrom = dto.dateFrom || new Date(Date.now() - 7 * 86400000).toISOString();
    const dateTo = dto.dateTo || new Date().toISOString();
    const offset = ((dto.page || 1) - 1) * (dto.limit || 20);

    const params: any[] = [dateFrom, dateTo, dto.limit || 20, offset];
    let statusFilter = '';
    if (dto.status) { params.push(dto.status); statusFilter = `AND cr.status = $${params.length}`; }

    const rows = await this.db.query(`
      SELECT
        cr.id, cr.clearing_batch, cr.status, cr.gross_amount, cr.interchange_fee,
        cr.net_amount, cr.processing_time_ms, cr.cleared_at, cr.error_code,
        cr.participant_code, t.transaction_ref, t.type, t.currency, t.channel
      FROM app.clearing_records cr
      LEFT JOIN app.transactions t ON t.id = cr.transaction_id
      WHERE cr.cleared_at BETWEEN $1 AND $2 ${statusFilter}
      ORDER BY cr.cleared_at DESC
      LIMIT $3 OFFSET $4
    `, params);

    const [{ total }] = await this.db.query(`
      SELECT COUNT(*)::bigint AS total
      FROM app.clearing_records cr
      WHERE cr.cleared_at BETWEEN $1 AND $2 ${statusFilter}
    `, params.slice(0, statusFilter ? -2 : undefined).concat(statusFilter ? [dto.status] : []));

    return { data: rows, total: Number(total), page: dto.page || 1, limit: dto.limit || 20 };
  }

  async getParticipantRanking(tenantId: string, dto: DateRangeDto) {
    const dateFrom = dto.dateFrom || new Date(Date.now() - 30 * 86400000).toISOString();
    const dateTo = dto.dateTo || new Date().toISOString();

    return this.db.query(`
      SELECT
        participant_code,
        COUNT(*)::bigint                                                   AS volume,
        SUM(gross_amount)                                                  AS value,
        ROUND(COUNT(*) FILTER (WHERE status = 'cleared')::numeric /
          NULLIF(COUNT(*),0) * 100, 2)                                    AS success_rate,
        ROUND(AVG(processing_time_ms)::numeric, 0)                        AS avg_time_ms,
        SUM(interchange_fee)                                               AS interchange_fees
      FROM app.clearing_records
      WHERE cleared_at BETWEEN $1 AND $2
      GROUP BY participant_code
      ORDER BY volume DESC
      LIMIT 20
    `, [dateFrom, dateTo]);
  }

  async getExceptions(tenantId: string, dto: DateRangeDto) {
    const dateFrom = dto.dateFrom || new Date(Date.now() - 7 * 86400000).toISOString();
    const dateTo = dto.dateTo || new Date().toISOString();

    return this.db.query(`
      SELECT
        cr.id, cr.clearing_batch, cr.status, cr.gross_amount, cr.error_code,
        cr.error_message, cr.participant_code, cr.cleared_at,
        t.transaction_ref, t.amount, t.currency
      FROM app.clearing_records cr
      LEFT JOIN app.transactions t ON t.id = cr.transaction_id
      WHERE cr.status IN ('failed','exception')
        AND cr.cleared_at BETWEEN $1 AND $2
      ORDER BY cr.cleared_at DESC
      LIMIT $3 OFFSET $4
    `, [dateFrom, dateTo, dto.limit || 50, ((dto.page || 1) - 1) * (dto.limit || 50)]);
  }

  async getDailyTrend(tenantId: string, dto: DateRangeDto) {
    const dateFrom = dto.dateFrom || new Date(Date.now() - 90 * 86400000).toISOString();
    const dateTo = dto.dateTo || new Date().toISOString();

    return this.db.query(`
      SELECT
        DATE_TRUNC('day', cleared_at)::date                               AS date,
        COUNT(*)::bigint                                                   AS volume,
        SUM(gross_amount)                                                  AS value,
        ROUND(COUNT(*) FILTER (WHERE status = 'cleared')::numeric /
          NULLIF(COUNT(*),0) * 100, 2)                                    AS success_rate,
        SUM(interchange_fee)                                               AS interchange_fees
      FROM app.clearing_records
      WHERE cleared_at BETWEEN $1 AND $2
      GROUP BY 1 ORDER BY 1
    `, [dateFrom, dateTo]);
  }
}
