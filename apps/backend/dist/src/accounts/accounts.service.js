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
exports.AccountsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
let AccountsService = class AccountsService {
    constructor(db) {
        this.db = db;
    }
    async getSummary(tenantId) {
        const [s] = await this.db.query(`
      SELECT
        COUNT(*)::bigint                                         AS total_accounts,
        COUNT(*) FILTER(WHERE status='active')::bigint          AS active_accounts,
        COUNT(*) FILTER(WHERE status='dormant')::bigint         AS dormant_accounts,
        COUNT(*) FILTER(WHERE status='closed')::bigint          AS closed_accounts,
        COUNT(*) FILTER(WHERE status='frozen')::bigint          AS frozen_accounts,
        SUM(balance)                                            AS total_balance,
        SUM(available_balance)                                  AS total_available,
        COUNT(*) FILTER(WHERE last_activity_at > NOW()-INTERVAL '30 days')::bigint AS active_30d
      FROM app.accounts
    `);
        return s;
    }
    async getList(tenantId, dto) {
        const offset = ((dto.page || 1) - 1) * (dto.limit || 20);
        const params = [dto.limit || 20, offset];
        const conds = [];
        if (dto.status) {
            params.push(dto.status);
            conds.push(`status = $${params.length}`);
        }
        if (dto.accountType) {
            params.push(dto.accountType);
            conds.push(`account_type = $${params.length}`);
        }
        const where = conds.length ? `WHERE ${conds.join(' AND ')}` : '';
        return this.db.query(`SELECT * FROM app.accounts ${where} ORDER BY balance DESC LIMIT $1 OFFSET $2`, params);
    }
    async getDormancyReport(tenantId) {
        return this.db.query(`
      SELECT
        CASE
          WHEN last_activity_at < NOW()-INTERVAL '365 days' THEN '> 1 year'
          WHEN last_activity_at < NOW()-INTERVAL '180 days' THEN '6-12 months'
          WHEN last_activity_at < NOW()-INTERVAL '90 days'  THEN '3-6 months'
          ELSE '< 3 months'
        END AS dormancy_bucket,
        COUNT(*)::bigint AS count,
        SUM(balance) AS balance
      FROM app.accounts WHERE status = 'dormant'
      GROUP BY 1 ORDER BY 2 DESC
    `);
    }
};
exports.AccountsService = AccountsService;
exports.AccountsService = AccountsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectDataSource)()),
    __metadata("design:paramtypes", [typeorm_2.DataSource])
], AccountsService);
//# sourceMappingURL=accounts.service.js.map