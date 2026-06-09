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
exports.AuditInterceptor = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const typeorm_1 = require("typeorm");
const typeorm_2 = require("@nestjs/typeorm");
const AUDITED_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];
let AuditInterceptor = class AuditInterceptor {
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const { method, url, user, ip, headers } = request;
        if (!AUDITED_METHODS.includes(method) || !user) {
            return next.handle();
        }
        return next.handle().pipe((0, rxjs_1.tap)(async () => {
            try {
                await this.dataSource.query(`INSERT INTO app.audit_logs (tenant_id, user_id, action, ip_address, user_agent, payload)
             VALUES ($1, $2, $3, $4, $5, $6)`, [
                    user.tenantId,
                    user.sub,
                    `${method} ${url}`,
                    ip,
                    headers['user-agent'],
                    JSON.stringify({ method, url }),
                ]);
            }
            catch (_e) {
            }
        }));
    }
};
exports.AuditInterceptor = AuditInterceptor;
exports.AuditInterceptor = AuditInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectDataSource)()),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], AuditInterceptor);
//# sourceMappingURL=audit.interceptor.js.map