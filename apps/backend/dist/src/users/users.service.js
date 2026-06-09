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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
let UsersService = class UsersService {
    constructor(db) {
        this.db = db;
    }
    async findAll(tenantId, dto) {
        const offset = ((dto.page || 1) - 1) * (dto.limit || 20);
        return this.db.query(`
      SELECT id, tenant_id, email, first_name, last_name, role, is_active, last_login_at, created_at
      FROM app.users WHERE tenant_id = $1
      ORDER BY created_at DESC LIMIT $2 OFFSET $3
    `, [tenantId, dto.limit || 20, offset]);
    }
    async findById(tenantId, id) {
        const [u] = await this.db.query(`SELECT * FROM app.users WHERE id = $1 AND tenant_id = $2`, [id, tenantId]);
        if (!u)
            throw new common_1.NotFoundException('User not found');
        return u;
    }
    async create(tenantId, data) {
        const [u] = await this.db.query(`
      INSERT INTO app.users (tenant_id, keycloak_id, email, first_name, last_name, role)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
    `, [tenantId, data.keycloakId, data.email, data.firstName, data.lastName, data.role || 'operations']);
        return u;
    }
    async update(tenantId, id, data) {
        const [u] = await this.db.query(`
      UPDATE app.users SET
        first_name = COALESCE($3, first_name),
        last_name  = COALESCE($4, last_name),
        role       = COALESCE($5, role),
        is_active  = COALESCE($6, is_active),
        updated_at = NOW()
      WHERE id = $1 AND tenant_id = $2 RETURNING *
    `, [id, tenantId, data.firstName, data.lastName, data.role, data.isActive]);
        return u;
    }
    async deactivate(tenantId, id) {
        await this.db.query(`UPDATE app.users SET is_active = false WHERE id = $1 AND tenant_id = $2`, [id, tenantId]);
        return { success: true };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectDataSource)()),
    __metadata("design:paramtypes", [typeorm_2.DataSource])
], UsersService);
//# sourceMappingURL=users.service.js.map