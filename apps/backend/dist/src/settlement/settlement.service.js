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
exports.SettlementService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
let SettlementService = class SettlementService {
    constructor(db) {
        this.db = db;
    }
    async getSummary(tenantId, dto) {
        const dateFrom = dto.dateFrom || new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
        const dateTo = dto.dateTo || new Date().toISOString().split('T')[0];
        const [summary] = await this.db.query(`
      SELECT
        COUNT(*)::bigint                                                        AS total_settlements,
        SUM(gross_amount)                                                       AS total_gross_value,
        SUM(net_amount)                                                         AS total_net_value,
        SUM(fees_amount)                                                        AS total_fees,
        COUNT(*) FILTER (WHERE status = 'settled')::bigint                     AS settled_count,
        COUNT(*) FILTER (WHERE status = 'failed')::bigint                      AS failed_count,
        COUNT(*) FILTER (WHERE status = 'exception')::bigint                   AS exception_count,
        ROUND(COUNT(*) FILTER (WHERE status = 'settled')::numeric /
          NULLIF(COUNT(*),0) * 100, 2)                                         AS success_rate,
        SUM(CASE WHEN status != 'settled' THEN gross_amount ELSE 0 END)        AS liquidity_exposure
      FROM app.settlement_records
      WHERE settlement_date BETWEEN $1 AND $2
    `, [dateFrom, dateTo]);
        return summary;
    }
    async getNetPositions(tenantId, dto) {
        const dateFrom = dto.dateFrom || new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
        const dateTo = dto.dateTo || new Date().toISOString().split('T')[0];
        return this.db.query(`
      SELECT
        sp.participant_code,
        sp.name AS participant_name,
        SUM(sr.gross_amount)  AS gross_position,
        SUM(sr.net_amount)    AS net_position,
        SUM(sr.fees_amount)   AS fees,
        sr.currency,
        MAX(sr.settlement_date) AS last_settlement
      FROM app.settlement_records sr
      JOIN app.scheme_participants sp ON sp.id = sr.participant_id
      WHERE sr.settlement_date BETWEEN $1 AND $2
      GROUP BY sp.participant_code, sp.name, sr.currency
      ORDER BY net_position DESC
      LIMIT 50
    `, [dateFrom, dateTo]);
    }
    async getDailyTrend(tenantId, dto) {
        const dateFrom = dto.dateFrom || new Date(Date.now() - 90 * 86400000).toISOString().split('T')[0];
        const dateTo = dto.dateTo || new Date().toISOString().split('T')[0];
        return this.db.query(`
      SELECT
        settlement_date,
        COUNT(*)::bigint       AS count,
        SUM(gross_amount)      AS gross_value,
        SUM(net_amount)        AS net_value,
        ROUND(COUNT(*) FILTER (WHERE status = 'settled')::numeric /
          NULLIF(COUNT(*),0)*100,2) AS success_rate
      FROM app.settlement_records
      WHERE settlement_date BETWEEN $1 AND $2
      GROUP BY 1 ORDER BY 1
    `, [dateFrom, dateTo]);
    }
    async getRecords(tenantId, dto) {
        const dateFrom = dto.dateFrom || new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
        const dateTo = dto.dateTo || new Date().toISOString().split('T')[0];
        const offset = ((dto.page || 1) - 1) * (dto.limit || 20);
        const params = [dateFrom, dateTo, dto.limit || 20, offset];
        let where = '';
        if (dto.status) {
            params.push(dto.status);
            where = `AND sr.status = $${params.length}`;
        }
        return this.db.query(`
      SELECT sr.*, sp.name AS participant_name, sp.participant_code
      FROM app.settlement_records sr
      LEFT JOIN app.scheme_participants sp ON sp.id = sr.participant_id
      WHERE sr.settlement_date BETWEEN $1 AND $2 ${where}
      ORDER BY sr.settlement_date DESC, sr.created_at DESC
      LIMIT $3 OFFSET $4
    `, params);
    }
    async getLiquidityReport(tenantId) {
        return this.db.query(`
      SELECT
        currency,
        SUM(CASE WHEN status IN ('pending','processing') THEN gross_amount ELSE 0 END) AS pending_exposure,
        SUM(CASE WHEN status = 'settled' THEN net_amount ELSE 0 END)                   AS settled_today,
        COUNT(*) FILTER (WHERE status IN ('pending','processing'))                     AS pending_count
      FROM app.settlement_records
      WHERE settlement_date = CURRENT_DATE
      GROUP BY currency
    `);
    }
};
exports.SettlementService = SettlementService;
exports.SettlementService = SettlementService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectDataSource)()),
    __metadata("design:paramtypes", [typeorm_2.DataSource])
], SettlementService);
//# sourceMappingURL=settlement.service.js.map