import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { DateRangeDto } from '../common/dto/pagination.dto';

@Injectable()
export class CardsService {
  constructor(@InjectDataSource() private readonly db: DataSource) {}

  async getSummary(tenantId: string, dto: DateRangeDto) {
    const dateFrom = dto.dateFrom || new Date(Date.now() - 30 * 86400000).toISOString();
    const dateTo = dto.dateTo || new Date().toISOString();
    const [s] = await this.db.query(`
      SELECT
        (SELECT COUNT(*) FROM app.cards WHERE status='active')::bigint        AS active_cards,
        (SELECT COUNT(*) FROM app.cards WHERE status='blocked')::bigint       AS blocked_cards,
        (SELECT COUNT(*) FROM app.cards WHERE status='inactive')::bigint      AS inactive_cards,
        COUNT(t.id)::bigint                                                    AS total_transactions,
        SUM(t.amount)                                                          AS total_spend,
        COUNT(t.id) FILTER(WHERE t.status='authorized')::bigint               AS authorized,
        COUNT(t.id) FILTER(WHERE t.status='declined')::bigint                 AS declined,
        ROUND(COUNT(t.id) FILTER(WHERE t.status IN('authorized','cleared','settled'))::numeric/
          NULLIF(COUNT(t.id),0)*100,2)                                         AS auth_success_rate,
        ROUND(COUNT(t.id) FILTER(WHERE t.status='declined')::numeric/
          NULLIF(COUNT(t.id),0)*100,2)                                         AS decline_rate
      FROM app.transactions t
      WHERE t.type='purchase' AND t.created_at BETWEEN $1 AND $2
    `, [dateFrom, dateTo]);
    return s;
  }

  async getSpendTrend(tenantId: string, dto: DateRangeDto) {
    const dateFrom = dto.dateFrom || new Date(Date.now() - 90 * 86400000).toISOString();
    const dateTo = dto.dateTo || new Date().toISOString();
    return this.db.query(`
      SELECT
        DATE_TRUNC('day', created_at)::date AS date,
        SUM(amount)                         AS spend,
        COUNT(*)::bigint                    AS transactions
      FROM app.transactions
      WHERE type='purchase' AND created_at BETWEEN $1 AND $2
      GROUP BY 1 ORDER BY 1
    `, [dateFrom, dateTo]);
  }

  async getDeclineAnalysis(tenantId: string, dto: DateRangeDto) {
    const dateFrom = dto.dateFrom || new Date(Date.now() - 30 * 86400000).toISOString();
    const dateTo = dto.dateTo || new Date().toISOString();
    return this.db.query(`
      SELECT
        response_code,
        COUNT(*)::bigint                              AS decline_count,
        ROUND(COUNT(*)::numeric/SUM(COUNT(*)) OVER()*100,2) AS pct
      FROM app.transactions
      WHERE status='declined' AND created_at BETWEEN $1 AND $2
        AND response_code IS NOT NULL
      GROUP BY response_code ORDER BY decline_count DESC LIMIT 20
    `, [dateFrom, dateTo]);
  }

  async getMerchantSpend(tenantId: string, dto: DateRangeDto) {
    const dateFrom = dto.dateFrom || new Date(Date.now() - 30 * 86400000).toISOString();
    const dateTo = dto.dateTo || new Date().toISOString();
    return this.db.query(`
      SELECT m.name, m.category, m.country,
        COUNT(t.id)::bigint AS transactions,
        SUM(t.amount) AS total_spend
      FROM app.transactions t
      JOIN app.merchants m ON m.id = t.merchant_id
      WHERE t.type='purchase' AND t.created_at BETWEEN $1 AND $2
      GROUP BY m.id, m.name, m.category, m.country
      ORDER BY total_spend DESC LIMIT 20
    `, [dateFrom, dateTo]);
  }

  async getSpendByChannel(tenantId: string, dto: DateRangeDto) {
    const dateFrom = dto.dateFrom || new Date(Date.now() - 30 * 86400000).toISOString();
    const dateTo = dto.dateTo || new Date().toISOString();
    return this.db.query(`
      SELECT channel, COUNT(*)::bigint AS count, SUM(amount) AS spend
      FROM app.transactions
      WHERE type='purchase' AND created_at BETWEEN $1 AND $2
      GROUP BY channel ORDER BY spend DESC
    `, [dateFrom, dateTo]);
  }
}
