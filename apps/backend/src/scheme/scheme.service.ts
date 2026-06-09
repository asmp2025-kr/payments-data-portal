import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { DateRangeDto } from '../common/dto/pagination.dto';

@Injectable()
export class SchemeService {
  constructor(@InjectDataSource() private readonly db: DataSource) {}

  async getSummary(tenantId: string, dto: DateRangeDto) {
    const dateFrom = dto.dateFrom || new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
    const dateTo = dto.dateTo || new Date().toISOString().split('T')[0];
    const [s] = await this.db.query(`
      SELECT
        SUM(volume)::bigint                                            AS total_volume,
        SUM(value)                                                     AS total_value,
        ROUND(SUM(CASE WHEN sla_met THEN volume ELSE 0 END)::numeric/
          NULLIF(SUM(volume),0)*100,2)                                 AS sla_compliance_rate,
        SUM(sla_breach_count)::bigint                                  AS sla_breaches,
        COUNT(DISTINCT participant_id)::bigint                         AS active_participants
      FROM app.scheme_transactions
      WHERE period_date BETWEEN $1 AND $2
    `, [dateFrom, dateTo]);
    return s;
  }

  async getParticipantPerformance(tenantId: string, dto: DateRangeDto) {
    const dateFrom = dto.dateFrom || new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
    const dateTo = dto.dateTo || new Date().toISOString().split('T')[0];
    return this.db.query(`
      SELECT
        sp.participant_code, sp.name, sp.type, sp.country,
        SUM(st.volume)::bigint AS volume,
        SUM(st.value) AS value,
        ROUND(SUM(CASE WHEN st.sla_met THEN st.volume ELSE 0 END)::numeric/
          NULLIF(SUM(st.volume),0)*100,2) AS sla_rate,
        SUM(st.sla_breach_count) AS sla_breaches
      FROM app.scheme_transactions st
      JOIN app.scheme_participants sp ON sp.id = st.participant_id
      WHERE st.period_date BETWEEN $1 AND $2
      GROUP BY sp.id, sp.participant_code, sp.name, sp.type, sp.country
      ORDER BY volume DESC LIMIT 50
    `, [dateFrom, dateTo]);
  }

  async getTrend(tenantId: string, dto: DateRangeDto) {
    const dateFrom = dto.dateFrom || new Date(Date.now() - 90 * 86400000).toISOString().split('T')[0];
    const dateTo = dto.dateTo || new Date().toISOString().split('T')[0];
    return this.db.query(`
      SELECT period_date, SUM(volume)::bigint AS volume, SUM(value) AS value,
        ROUND(SUM(CASE WHEN sla_met THEN volume ELSE 0 END)::numeric/NULLIF(SUM(volume),0)*100,2) AS sla_rate
      FROM app.scheme_transactions WHERE period_date BETWEEN $1 AND $2
      GROUP BY 1 ORDER BY 1
    `, [dateFrom, dateTo]);
  }

  async getParticipants(tenantId: string) {
    return this.db.query(`SELECT * FROM app.scheme_participants ORDER BY name`);
  }
}
