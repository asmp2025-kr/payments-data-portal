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
exports.AuditService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
let AuditService = class AuditService {
    constructor(db) {
        this.db = db;
    }
    async getLogs(tenantId, dto) {
        const offset = ((dto.page || 1) - 1) * (dto.limit || 50);
        const params = [tenantId, dto.limit || 50, offset];
        const conds = [];
        if (dto.userId) {
            params.push(dto.userId);
            conds.push(`al.user_id = $${params.length}`);
        }
        if (dto.action) {
            params.push(`%${dto.action}%`);
            conds.push(`al.action ILIKE $${params.length}`);
        }
        if (dto.dateFrom) {
            params.push(dto.dateFrom);
            conds.push(`al.created_at >= $${params.length}`);
        }
        if (dto.dateTo) {
            params.push(dto.dateTo);
            conds.push(`al.created_at <= $${params.length}`);
        }
        const where = conds.length ? `AND ${conds.join(' AND ')}` : '';
        return this.db.query(`
      SELECT al.id, al.action, al.entity_type, al.entity_id, al.ip_address,
             al.result, al.created_at,
             u.email AS user_email, u.first_name, u.last_name, u.role
      FROM app.audit_logs al
      LEFT JOIN app.users u ON u.id = al.user_id
      WHERE al.tenant_id = $1 ${where}
      ORDER BY al.created_at DESC LIMIT $2 OFFSET $3
    `, params);
    }
};
exports.AuditService = AuditService;
exports.AuditService = AuditService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectDataSource)()),
    __metadata("design:paramtypes", [typeorm_2.DataSource])
], AuditService);
//# sourceMappingURL=audit.service.js.map