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
exports.TenantsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
let TenantsService = class TenantsService {
    constructor(db) {
        this.db = db;
    }
    async findAll() {
        return this.db.query(`SELECT * FROM app.tenants WHERE is_active = true ORDER BY name`);
    }
    async findById(id) {
        const [t] = await this.db.query(`SELECT * FROM app.tenants WHERE id = $1`, [id]);
        if (!t)
            throw new common_1.NotFoundException('Tenant not found');
        return t;
    }
    async create(data) {
        const [t] = await this.db.query(`
      INSERT INTO app.tenants (name, slug, logo_url, theme_config, subscription_plan, contact_email, country)
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
    `, [data.name, data.slug, data.logoUrl, JSON.stringify(data.themeConfig || {}),
            data.subscriptionPlan || 'basic', data.contactEmail, data.country]);
        return t;
    }
    async update(id, data) {
        const [t] = await this.db.query(`
      UPDATE app.tenants SET
        name = COALESCE($2, name),
        logo_url = COALESCE($3, logo_url),
        theme_config = COALESCE($4::jsonb, theme_config),
        subscription_plan = COALESCE($5, subscription_plan),
        updated_at = NOW()
      WHERE id = $1 RETURNING *
    `, [id, data.name, data.logoUrl, data.themeConfig ? JSON.stringify(data.themeConfig) : null, data.subscriptionPlan]);
        return t;
    }
    async getThemeConfig(slug) {
        const [t] = await this.db.query(`SELECT name, slug, logo_url, theme_config FROM app.tenants WHERE slug = $1 AND is_active = true`, [slug]);
        return t || null;
    }
};
exports.TenantsService = TenantsService;
exports.TenantsService = TenantsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectDataSource)()),
    __metadata("design:paramtypes", [typeorm_2.DataSource])
], TenantsService);
//# sourceMappingURL=tenants.service.js.map