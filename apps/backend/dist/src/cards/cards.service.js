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
exports.CardsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
let CardsService = class CardsService {
    constructor(db) {
        this.db = db;
    }
    async getSummary(tenantId, dto) {
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
    async getSpendTrend(tenantId, dto) {
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
    async getDeclineAnalysis(tenantId, dto) {
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
    async getMerchantSpend(tenantId, dto) {
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
    async getSpendByChannel(tenantId, dto) {
        const dateFrom = dto.dateFrom || new Date(Date.now() - 30 * 86400000).toISOString();
        const dateTo = dto.dateTo || new Date().toISOString();
        return this.db.query(`
      SELECT channel, COUNT(*)::bigint AS count, SUM(amount) AS spend
      FROM app.transactions
      WHERE type='purchase' AND created_at BETWEEN $1 AND $2
      GROUP BY channel ORDER BY spend DESC
    `, [dateFrom, dateTo]);
    }
};
exports.CardsService = CardsService;
exports.CardsService = CardsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectDataSource)()),
    __metadata("design:paramtypes", [typeorm_2.DataSource])
], CardsService);
//# sourceMappingURL=cards.service.js.map