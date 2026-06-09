"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AmlService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
let AmlService = class AmlService {
    constructor(db) {
        this.db = db;
    }
    async getSummary(tenantId, dto) {
        const dateFrom = dto.dateFrom || new Date(Date.now() - 30 * 86400000).toISOString();
        const dateTo = dto.dateTo || new Date().toISOString();
        const [s] = await this.db.query(`
      SELECT
        COUNT(*)::bigint                                                      AS total_alerts,
        COUNT(*) FILTER(WHERE status='open')::bigint                         AS open_alerts,
        COUNT(*) FILTER(WHERE status='investigating')::bigint                AS investigating,
        COUNT(*) FILTER(WHERE status='escalated')::bigint                    AS escalated,
        COUNT(*) FILTER(WHERE status='closed_sar')::bigint                   AS sar_filed,
        COUNT(*) FILTER(WHERE status='false_positive')::bigint               AS false_positives,
        COUNT(*) FILTER(WHERE risk_level='critical')::bigint                 AS critical_alerts,
        COUNT(*) FILTER(WHERE risk_level='high')::bigint                     AS high_risk_alerts,
        ROUND(AVG(EXTRACT(EPOCH FROM (COALESCE(closed_at,NOW())-created_at))/3600),1) AS avg_resolution_hours
      FROM app.aml_alerts
      WHERE created_at BETWEEN $1 AND $2
    `, [dateFrom, dateTo]);
        return s;
    }
    async getTrend(tenantId, dto) {
        const dateFrom = dto.dateFrom || new Date(Date.now() - 90 * 86400000).toISOString();
        const dateTo = dto.dateTo || new Date().toISOString();
        return this.db.query(`
      SELECT
        DATE_TRUNC('day', created_at)::date AS date,
        COUNT(*)::bigint                    AS alerts,
        COUNT(*) FILTER(WHERE risk_level='high' OR risk_level='critical')::bigint AS high_risk
      FROM app.aml_alerts WHERE created_at BETWEEN $1 AND $2
      GROUP BY 1 ORDER BY 1
    `, [dateFrom, dateTo]);
    }
    async getRiskDistribution(tenantId) {
        return this.db.query(`
      SELECT risk_level, COUNT(*)::bigint AS count
      FROM app.aml_alerts WHERE status NOT IN ('closed_no_action','false_positive')
      GROUP BY risk_level ORDER BY count DESC
    `);
    }
    async getAlerts(tenantId, dto) {
        const dateFrom = dto.dateFrom || new Date(Date.now() - 30 * 86400000).toISOString();
        const dateTo = dto.dateTo || new Date().toISOString();
        const offset = ((dto.page || 1) - 1) * (dto.limit || 20);
        const params = [dateFrom, dateTo, dto.limit || 20, offset];
        const conds = [];
        if (dto.status) {
            params.push(dto.status);
            conds.push(`status = $${params.length}`);
        }
        if (dto.riskLevel) {
            params.push(dto.riskLevel);
            conds.push(`risk_level = $${params.length}`);
        }
        const where = conds.length ? `AND ${conds.join(' AND ')}` : '';
        return this.db.query(`
      SELECT * FROM app.aml_alerts
      WHERE created_at BETWEEN $1 AND $2 ${where}
      ORDER BY created_at DESC LIMIT $3 OFFSET $4
    `, params);
    }
    async getSarFilings(tenantId, dto) {
        const dateFrom = dto.dateFrom || new Date(Date.now() - 90 * 86400000).toISOString();
        const dateTo = dto.dateTo || new Date().toISOString();
        return this.db.query(`
      SELECT sf.*, aa.alert_type, aa.risk_level, aa.risk_score
      FROM app.sar_filings sf
      JOIN app.aml_alerts aa ON aa.id = sf.aml_alert_id
      WHERE sf.filed_at BETWEEN $1 AND $2
      ORDER BY sf.filed_at DESC
    `, [dateFrom, dateTo]);
    }
    async getSanctionsScreening(tenantId, dto) {
        const dateFrom = dto.dateFrom || new Date(Date.now() - 30 * 86400000).toISOString();
        const dateTo = dto.dateTo || new Date().toISOString();
        return this.db.query(`
      SELECT * FROM app.sanctions_screening
      WHERE screened_at BETWEEN $1 AND $2
        AND result != 'no_match'
      ORDER BY match_score DESC, screened_at DESC
      LIMIT $3 OFFSET $4
    `, [dateFrom, dateTo, dto.limit || 50, ((dto.page || 1) - 1) * (dto.limit || 50)]);
    }
};
exports.AmlService = AmlService;
exports.AmlService = AmlService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectDataSource)()),
    __metadata("design:paramtypes", [typeorm_2.DataSource])
], AmlService);
//# sourceMappingURL=aml.service.js.map