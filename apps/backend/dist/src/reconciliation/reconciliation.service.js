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
exports.ReconciliationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
let ReconciliationService = class ReconciliationService {
    constructor(db) {
        this.db = db;
    }
    async getSummary(tenantId, dto) {
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
    async getBreaks(tenantId, dto) {
        const dateFrom = dto.dateFrom || new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
        const dateTo = dto.dateTo || new Date().toISOString().split('T')[0];
        return this.db.query(`
      SELECT * FROM app.reconciliation_records
      WHERE status IN ('break','unmatched','investigating')
        AND recon_date BETWEEN $1 AND $2
      ORDER BY ABS(variance) DESC, aged_days DESC
      LIMIT $3 OFFSET $4
    `, [dateFrom, dateTo, dto.limit || 50, ((dto.page || 1) - 1) * (dto.limit || 50)]);
    }
    async getAgingReport(tenantId) {
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
    async getTrend(tenantId, dto) {
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
};
exports.ReconciliationService = ReconciliationService;
exports.ReconciliationService = ReconciliationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectDataSource)()),
    __metadata("design:paramtypes", [typeorm_2.DataSource])
], ReconciliationService);
//# sourceMappingURL=reconciliation.service.js.map