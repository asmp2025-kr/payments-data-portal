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
exports.DashboardsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const uuid_1 = require("uuid");
let DashboardsService = class DashboardsService {
    constructor(db) {
        this.db = db;
    }
    async findAll(tenantId, dto) {
        const offset = ((dto.page || 1) - 1) * (dto.limit || 20);
        return this.db.query(`
      SELECT d.*, u.email AS creator_email
      FROM app.dashboards d
      LEFT JOIN app.users u ON u.id = d.created_by
      WHERE (d.tenant_id = $1 OR d.is_template = true)
        AND d.is_shared = true OR d.created_by = ANY(
          SELECT id FROM app.users WHERE tenant_id = $1
        )
      ORDER BY d.is_template DESC, d.view_count DESC
      LIMIT $2 OFFSET $3
    `, [tenantId, dto.limit || 20, offset]);
    }
    async getTemplates(tenantId) {
        return this.db.query(`SELECT * FROM app.dashboards WHERE is_template = true ORDER BY module, name`);
    }
    async findById(tenantId, id) {
        const [d] = await this.db.query(`SELECT * FROM app.dashboards WHERE id = $1`, [id]);
        if (!d)
            throw new common_1.NotFoundException('Dashboard not found');
        return d;
    }
    async create(tenantId, userId, data) {
        const [d] = await this.db.query(`
      INSERT INTO app.dashboards (tenant_id, name, description, module, layout_config, widgets_config, is_template, created_by)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *
    `, [tenantId, data.name, data.description, data.module,
            JSON.stringify(data.layoutConfig || {}), JSON.stringify(data.widgetsConfig || []),
            false, userId]);
        return d;
    }
    async update(tenantId, id, data) {
        const [d] = await this.db.query(`
      UPDATE app.dashboards SET
        name = COALESCE($2, name),
        widgets_config = COALESCE($3::jsonb, widgets_config),
        layout_config = COALESCE($4::jsonb, layout_config),
        updated_at = NOW()
      WHERE id = $1 RETURNING *
    `, [id, data.name, data.widgetsConfig ? JSON.stringify(data.widgetsConfig) : null,
            data.layoutConfig ? JSON.stringify(data.layoutConfig) : null]);
        return d;
    }
    async clone(tenantId, userId, id) {
        const [orig] = await this.db.query(`SELECT * FROM app.dashboards WHERE id = $1`, [id]);
        if (!orig)
            throw new common_1.NotFoundException();
        const [d] = await this.db.query(`
      INSERT INTO app.dashboards (tenant_id, name, description, module, layout_config, widgets_config, created_by)
      VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *
    `, [tenantId, `${orig.name} (Copy)`, orig.description, orig.module,
            JSON.stringify(orig.layout_config), JSON.stringify(orig.widgets_config), userId]);
        return d;
    }
    async generateShareToken(id) {
        const token = (0, uuid_1.v4)();
        await this.db.query(`UPDATE app.dashboards SET share_token = $1, is_shared = true WHERE id = $2`, [token, id]);
        return { token };
    }
    async delete(tenantId, id) {
        await this.db.query(`DELETE FROM app.dashboards WHERE id = $1 AND tenant_id = $2 AND is_template = false`, [id, tenantId]);
        return { success: true };
    }
};
exports.DashboardsService = DashboardsService;
exports.DashboardsService = DashboardsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectDataSource)()),
    __metadata("design:paramtypes", [typeorm_2.DataSource])
], DashboardsService);
//# sourceMappingURL=dashboards.service.js.map