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
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
let NotificationsService = class NotificationsService {
    constructor(db) {
        this.db = db;
    }
    async getForUser(tenantId, userId, dto) {
        const offset = ((dto.page || 1) - 1) * (dto.limit || 20);
        return this.db.query(`
      SELECT * FROM app.notifications
      WHERE tenant_id = $1 AND (user_id = $2 OR user_id IS NULL)
      ORDER BY sent_at DESC LIMIT $3 OFFSET $4
    `, [tenantId, userId, dto.limit || 20, offset]);
    }
    async getUnreadCount(tenantId, userId) {
        const [r] = await this.db.query(`
      SELECT COUNT(*)::bigint AS count FROM app.notifications
      WHERE tenant_id = $1 AND (user_id = $2 OR user_id IS NULL) AND is_read = false
    `, [tenantId, userId]);
        return r;
    }
    async markRead(tenantId, userId, id) {
        await this.db.query(`
      UPDATE app.notifications SET is_read = true, read_at = NOW()
      WHERE id = $1 AND tenant_id = $2
    `, [id, tenantId]);
        return { success: true };
    }
    async markAllRead(tenantId, userId) {
        await this.db.query(`
      UPDATE app.notifications SET is_read = true, read_at = NOW()
      WHERE tenant_id = $1 AND (user_id = $2 OR user_id IS NULL) AND is_read = false
    `, [tenantId, userId]);
        return { success: true };
    }
    async create(tenantId, data) {
        const [n] = await this.db.query(`
      INSERT INTO app.notifications (tenant_id, user_id, type, title, message, link, channel, metadata)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *
    `, [tenantId, data.userId || null, data.type, data.title, data.message, data.link, data.channel || 'in_app', JSON.stringify(data.metadata || {})]);
        return n;
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectDataSource)()),
    __metadata("design:paramtypes", [typeorm_2.DataSource])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map