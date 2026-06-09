import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { DateRangeDto } from '../common/dto/pagination.dto';

@Injectable()
export class ComplianceService {
  constructor(@InjectDataSource() private readonly db: DataSource) {}

  async getSummary(tenantId: string) {
    const [s] = await this.db.query(`
      SELECT
        COUNT(*)::bigint                                              AS total_findings,
        COUNT(*) FILTER(WHERE status='open')::bigint                 AS open_findings,
        COUNT(*) FILTER(WHERE status='resolved')::bigint             AS resolved_findings,
        COUNT(*) FILTER(WHERE severity='critical')::bigint           AS critical,
        COUNT(*) FILTER(WHERE severity='high')::bigint               AS high,
        COUNT(*) FILTER(WHERE due_date < NOW() AND status!='resolved')::bigint AS overdue,
        ROUND(COUNT(*) FILTER(WHERE status='resolved')::numeric/NULLIF(COUNT(*),0)*100,2) AS resolution_rate
      FROM app.compliance_findings
    `);
    return s;
  }

  async getFindings(tenantId: string, dto: DateRangeDto & { status?: string; severity?: string }) {
    const offset = ((dto.page || 1) - 1) * (dto.limit || 20);
    const params: any[] = [dto.limit || 20, offset];
    const conds: string[] = [];
    if (dto.status) { params.push(dto.status); conds.push(`status = $${params.length}`); }
    if (dto.severity) { params.push(dto.severity); conds.push(`severity = $${params.length}`); }
    const where = conds.length ? `WHERE ${conds.join(' AND ')}` : '';
    return this.db.query(`SELECT * FROM app.compliance_findings ${where} ORDER BY created_at DESC LIMIT $1 OFFSET $2`, params);
  }

  async getBySeverity(tenantId: string) {
    return this.db.query(`
      SELECT severity, COUNT(*)::bigint AS count, COUNT(*) FILTER(WHERE status='open')::bigint AS open
      FROM app.compliance_findings GROUP BY severity ORDER BY count DESC
    `);
  }

  async getScore(tenantId: string) {
    const [s] = await this.db.query(`
      SELECT
        100 - ROUND(
          (COUNT(*) FILTER(WHERE status!='resolved' AND severity='critical')*25 +
           COUNT(*) FILTER(WHERE status!='resolved' AND severity='high')*15 +
           COUNT(*) FILTER(WHERE status!='resolved' AND severity='medium')*5 +
           COUNT(*) FILTER(WHERE status!='resolved' AND severity='low')*1)
          ::numeric / NULLIF(COUNT(*),0) ,0) AS score
      FROM app.compliance_findings
    `);
    return { score: Math.max(0, Number(s.score || 100)) };
  }
}
