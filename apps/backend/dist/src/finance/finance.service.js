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
exports.FinanceService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
let FinanceService = class FinanceService {
    constructor(db) {
        this.db = db;
    }
    async getRevenueSummary(tenantId, dto) {
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
    async getRevenueTrend(tenantId, dto) {
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
    async getInterchangeByParticipant(tenantId, dto) {
        const dateFrom = dto.dateFrom || new Date(Date.now() - 30 * 86400000).toISOString();
        const dateTo = dto.dateTo || new Date().toISOString();
        return this.db.query(`
      SELECT participant_code, SUM(interchange_fee) AS interchange, COUNT(*)::bigint AS volume
      FROM app.clearing_records WHERE cleared_at BETWEEN $1 AND $2
      GROUP BY participant_code ORDER BY interchange DESC LIMIT 20
    `, [dateFrom, dateTo]);
    }
};
exports.FinanceService = FinanceService;
exports.FinanceService = FinanceService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectDataSource)()),
    __metadata("design:paramtypes", [typeorm_2.DataSource])
], FinanceService);
//# sourceMappingURL=finance.service.js.map