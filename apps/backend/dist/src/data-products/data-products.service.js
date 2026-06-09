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
exports.DataProductsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
let DataProductsService = class DataProductsService {
    constructor(db) {
        this.db = db;
    }
    async findAll(tenantId, dto) {
        const offset = ((dto.page || 1) - 1) * (dto.limit || 20);
        const conds = [];
        const params = [dto.limit || 20, offset];
        if (dto.domain) {
            params.push(dto.domain);
            conds.push(`domain = $${params.length}`);
        }
        if (dto.status) {
            params.push(dto.status);
            conds.push(`status = $${params.length}`);
        }
        if (dto.search) {
            params.push(`%${dto.search}%`);
            conds.push(`name ILIKE $${params.length}`);
        }
        const where = conds.length ? `AND ${conds.join(' AND ')}` : '';
        return this.db.query(`
      SELECT dp.*, u.email AS owner_email, u.first_name || ' ' || u.last_name AS owner_name
      FROM app.data_products dp
      LEFT JOIN app.users u ON u.id = dp.owner_id
      WHERE dp.status != 'archived' ${where}
      ORDER BY dp.quality_score DESC, dp.name
      LIMIT $1 OFFSET $2
    `, params);
    }
    async findById(tenantId, id) {
        const [dp] = await this.db.query(`SELECT * FROM app.data_products WHERE id = $1`, [id]);
        if (!dp)
            throw new common_1.NotFoundException('Data product not found');
        return dp;
    }
    async create(tenantId, userId, data) {
        const [dp] = await this.db.query(`
      INSERT INTO app.data_products (tenant_id, name, slug, domain, description, owner_id, quality_score, refresh_frequency, api_endpoint, schema_definition, lineage, tags, access_type)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *
    `, [tenantId, data.name, data.slug, data.domain, data.description, userId,
            data.qualityScore || 0, data.refreshFrequency || 'daily', data.apiEndpoint,
            JSON.stringify(data.schemaDefinition || {}), JSON.stringify(data.lineage || {}),
            data.tags || [], data.accessType || 'request']);
        return dp;
    }
    async requestAccess(tenantId, productId, userId, reason) {
        const [r] = await this.db.query(`
      INSERT INTO app.data_product_access (tenant_id, product_id, user_id, reason)
      VALUES ($1,$2,$3,$4) RETURNING *
    `, [tenantId, productId, userId, reason]);
        return r;
    }
    async getQualityMetrics(tenantId, id) {
        const [dp] = await this.db.query(`SELECT quality_score, refresh_frequency, updated_at FROM app.data_products WHERE id = $1`, [id]);
        if (!dp)
            throw new common_1.NotFoundException();
        return {
            qualityScore: dp.quality_score,
            completeness: Math.min(100, Number(dp.quality_score) + 5),
            timeliness: dp.refresh_frequency === 'realtime' ? 100 : dp.refresh_frequency === 'hourly' ? 95 : 90,
            accuracy: 99.2,
            lastRefreshed: dp.updated_at,
        };
    }
    async update(tenantId, id, data) {
        const [dp] = await this.db.query(`
      UPDATE app.data_products SET
        name = COALESCE($2, name), description = COALESCE($3, description),
        quality_score = COALESCE($4, quality_score), status = COALESCE($5, status),
        updated_at = NOW()
      WHERE id = $1 RETURNING *
    `, [id, data.name, data.description, data.qualityScore, data.status]);
        return dp;
    }
};
exports.DataProductsService = DataProductsService;
exports.DataProductsService = DataProductsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectDataSource)()),
    __metadata("design:paramtypes", [typeorm_2.DataSource])
], DataProductsService);
//# sourceMappingURL=data-products.service.js.map