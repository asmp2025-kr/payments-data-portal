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
exports.SchemeService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
let SchemeService = class SchemeService {
    constructor(db) {
        this.db = db;
    }
    async getSummary(tenantId, dto) {
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
    async getParticipantPerformance(tenantId, dto) {
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
    async getTrend(tenantId, dto) {
        const dateFrom = dto.dateFrom || new Date(Date.now() - 90 * 86400000).toISOString().split('T')[0];
        const dateTo = dto.dateTo || new Date().toISOString().split('T')[0];
        return this.db.query(`
      SELECT period_date, SUM(volume)::bigint AS volume, SUM(value) AS value,
        ROUND(SUM(CASE WHEN sla_met THEN volume ELSE 0 END)::numeric/NULLIF(SUM(volume),0)*100,2) AS sla_rate
      FROM app.scheme_transactions WHERE period_date BETWEEN $1 AND $2
      GROUP BY 1 ORDER BY 1
    `, [dateFrom, dateTo]);
    }
    async getParticipants(tenantId) {
        return this.db.query(`SELECT * FROM app.scheme_participants ORDER BY name`);
    }
};
exports.SchemeService = SchemeService;
exports.SchemeService = SchemeService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectDataSource)()),
    __metadata("design:paramtypes", [typeorm_2.DataSource])
], SchemeService);
//# sourceMappingURL=scheme.service.js.map