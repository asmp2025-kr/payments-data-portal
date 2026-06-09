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
exports.SubscriptionsService = exports.PLAN_FEATURES = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
exports.PLAN_FEATURES = {
    basic: { max_users: 5, custom_dashboards: false, excel_export: false, api_access: false, white_label: false, sso: false },
    professional: { max_users: 50, custom_dashboards: true, excel_export: true, api_access: true, white_label: false, sso: false },
    enterprise: { max_users: -1, custom_dashboards: true, excel_export: true, api_access: true, white_label: true, sso: true },
};
let SubscriptionsService = class SubscriptionsService {
    constructor(db) {
        this.db = db;
    }
    async getForTenant(tenantId) {
        const [s] = await this.db.query(`
      SELECT s.*, (SELECT COUNT(*) FROM app.users WHERE tenant_id = $1 AND is_active = true) AS current_users
      FROM app.subscriptions s WHERE s.tenant_id = $1 AND s.status = 'active'
      ORDER BY s.created_at DESC LIMIT 1
    `, [tenantId]);
        return s;
    }
    async checkFeature(tenantId, feature) {
        const sub = await this.getForTenant(tenantId);
        if (!sub)
            return false;
        const features = exports.PLAN_FEATURES[sub.plan] || exports.PLAN_FEATURES.basic;
        return !!features[feature];
    }
    getPlans() {
        return Object.entries(exports.PLAN_FEATURES).map(([plan, features]) => ({
            plan, ...features,
            pricing: { basic: 299, professional: 999, enterprise: 0 }[plan],
        }));
    }
    async create(tenantId, plan) {
        const features = exports.PLAN_FEATURES[plan] || exports.PLAN_FEATURES.basic;
        const [s] = await this.db.query(`
      INSERT INTO app.subscriptions (tenant_id, plan, max_users, features_json)
      VALUES ($1,$2,$3,$4) RETURNING *
    `, [tenantId, plan, features.max_users, JSON.stringify(features)]);
        await this.db.query(`UPDATE app.tenants SET subscription_plan = $1 WHERE id = $2`, [plan, tenantId]);
        return s;
    }
};
exports.SubscriptionsService = SubscriptionsService;
exports.SubscriptionsService = SubscriptionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectDataSource)()),
    __metadata("design:paramtypes", [typeorm_2.DataSource])
], SubscriptionsService);
//# sourceMappingURL=subscriptions.service.js.map