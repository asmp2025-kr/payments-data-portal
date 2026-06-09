import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { DateRangeDto } from '../common/dto/pagination.dto';

@Injectable()
export class FraudService {
  constructor(@InjectDataSource() private readonly db: DataSource) {}

  async getSummary(tenantId: string, dto: DateRangeDto) {
    const dateFrom = dto.dateFrom || new Date(Date.now() - 30 * 86400000).toISOString();
    const dateTo = dto.dateTo || new Date().toISOString();

    const [summary] = await this.db.query(`
      SELECT
        COUNT(*)::bigint                                                     AS total_cases,
        SUM(amount)                                                          AS total_fraud_amount,
        COUNT(*) FILTER (WHERE status = 'open')::bigint                     AS open_cases,
        COUNT(*) FILTER (WHERE status = 'investigating')::bigint            AS investigating,
        COUNT(*) FILTER (WHERE status = 'confirmed')::bigint                AS confirmed,
        COUNT(*) FILTER (WHERE status = 'false_positive')::bigint           AS false_positives,
        SUM(recovery_amount)                                                 AS total_recovered,
        ROUND(SUM(recovery_amount)/NULLIF(SUM(amount),0)*100, 2)           AS recovery_rate,
        ROUND(COUNT(*) FILTER(WHERE status='false_positive')::numeric/
          NULLIF(COUNT(*),0)*100,2)                                         AS false_positive_rate
      FROM app.fraud_cases
      WHERE detected_at BETWEEN $1 AND $2
    `, [dateFrom, dateTo]);
    return summary;
  }

  async getTrend(tenantId: string, dto: DateRangeDto) {
    const dateFrom = dto.dateFrom || new Date(Date.now() - 90 * 86400000).toISOString();
    const dateTo = dto.dateTo || new Date().toISOString();

    return this.db.query(`
      SELECT
        DATE_TRUNC('day', detected_at)::date AS date,
        COUNT(*)::bigint                     AS cases,
        SUM(amount)                          AS fraud_amount,
        SUM(recovery_amount)                 AS recovered
      FROM app.fraud_cases
      WHERE detected_at BETWEEN $1 AND $2
      GROUP BY 1 ORDER BY 1
    `, [dateFrom, dateTo]);
  }

  async getMerchantRisk(tenantId: string, dto: DateRangeDto) {
    const dateFrom = dto.dateFrom || new Date(Date.now() - 30 * 86400000).toISOString();
    const dateTo = dto.dateTo || new Date().toISOString();

    return this.db.query(`
      SELECT
        m.merchant_code, m.name AS merchant_name, m.category, m.country,
        m.risk_score,
        COUNT(fc.id)::bigint AS fraud_case_count,
        SUM(fc.amount)       AS total_fraud_amount
      FROM app.merchants m
      LEFT JOIN app.transactions t ON t.merchant_id = m.id
      LEFT JOIN app.fraud_cases fc ON fc.transaction_id = t.id
        AND fc.detected_at BETWEEN $1 AND $2
      WHERE m.risk_score > 50
      GROUP BY m.id, m.merchant_code, m.name, m.category, m.country, m.risk_score
      ORDER BY m.risk_score DESC, fraud_case_count DESC
      LIMIT 50
    `, [dateFrom, dateTo]);
  }

  async getCases(tenantId: string, dto: DateRangeDto & { status?: string; fraudType?: string }) {
    const dateFrom = dto.dateFrom || new Date(Date.now() - 30 * 86400000).toISOString();
    const dateTo = dto.dateTo || new Date().toISOString();
    const offset = ((dto.page || 1) - 1) * (dto.limit || 20);
    const params: any[] = [dateFrom, dateTo, dto.limit || 20, offset];
    const conditions: string[] = [];
    if (dto.status) { params.push(dto.status); conditions.push(`fc.status = $${params.length}`); }
    if (dto.fraudType) { params.push(dto.fraudType); conditions.push(`fc.fraud_type = $${params.length}`); }
    const where = conditions.length ? `AND ${conditions.join(' AND ')}` : '';

    return this.db.query(`
      SELECT fc.*, t.transaction_ref, t.channel, t.merchant_id
      FROM app.fraud_cases fc
      LEFT JOIN app.transactions t ON t.id = fc.transaction_id
      WHERE fc.detected_at BETWEEN $1 AND $2 ${where}
      ORDER BY fc.detected_at DESC
      LIMIT $3 OFFSET $4
    `, params);
  }

  async getByFraudType(tenantId: string, dto: DateRangeDto) {
    const dateFrom = dto.dateFrom || new Date(Date.now() - 30 * 86400000).toISOString();
    const dateTo = dto.dateTo || new Date().toISOString();

    return this.db.query(`
      SELECT
        fraud_type,
        COUNT(*)::bigint AS cases,
        SUM(amount)      AS amount,
        ROUND(COUNT(*)::numeric/SUM(COUNT(*)) OVER()*100,2) AS pct
      FROM app.fraud_cases
      WHERE detected_at BETWEEN $1 AND $2
      GROUP BY fraud_type ORDER BY cases DESC
    `, [dateFrom, dateTo]);
  }

  async getGeographic(tenantId: string, dto: DateRangeDto) {
    const dateFrom = dto.dateFrom || new Date(Date.now() - 30 * 86400000).toISOString();
    const dateTo = dto.dateTo || new Date().toISOString();

    return this.db.query(`
      SELECT
        t.country,
        COUNT(fc.id)::bigint AS fraud_cases,
        SUM(fc.amount)       AS fraud_amount
      FROM app.fraud_cases fc
      JOIN app.transactions t ON t.id = fc.transaction_id
      WHERE fc.detected_at BETWEEN $1 AND $2
        AND t.country IS NOT NULL
      GROUP BY t.country ORDER BY fraud_cases DESC
    `, [dateFrom, dateTo]);
  }
}
