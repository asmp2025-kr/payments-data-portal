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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimpleAuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("typeorm");
const bcrypt = require("bcrypt");
let SimpleAuthService = class SimpleAuthService {
    constructor(jwtService, dataSource) {
        this.jwtService = jwtService;
        this.dataSource = dataSource;
    }
    async login(email, password) {
        const result = await this.dataSource.query(`SELECT u.id, u.email, u.first_name, u.last_name, u.role, u.tenant_id,
              u.is_active, u.password_hash
       FROM app.users u
       WHERE u.email = $1 AND u.is_active = true
       LIMIT 1`, [email]);
        if (!result.length)
            throw new common_1.UnauthorizedException('Invalid credentials');
        const user = result[0];
        if (user.password_hash) {
            const valid = await bcrypt.compare(password, user.password_hash);
            if (!valid)
                throw new common_1.UnauthorizedException('Invalid credentials');
        }
        await this.dataSource.query(`UPDATE app.users SET last_login_at = NOW() WHERE id = $1`, [user.id]);
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            tenant_id: user.tenant_id,
            first_name: user.first_name,
            last_name: user.last_name,
        };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                role: user.role,
                tenant_id: user.tenant_id,
            },
        };
    }
    async me(userId) {
        const result = await this.dataSource.query(`SELECT u.id, u.email, u.first_name, u.last_name, u.role, u.tenant_id,
              t.name as tenant_name, t.slug as tenant_slug, t.theme_config,
              t.subscription_plan
       FROM app.users u
       JOIN app.tenants t ON t.id = u.tenant_id
       WHERE u.id = $1`, [userId]);
        return result[0];
    }
    async changePassword(userId, newPassword) {
        const hash = await bcrypt.hash(newPassword, 10);
        await this.dataSource.query(`UPDATE app.users SET password_hash = $1 WHERE id = $2`, [hash, userId]);
        return { message: 'Password updated' };
    }
};
exports.SimpleAuthService = SimpleAuthService;
exports.SimpleAuthService = SimpleAuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        typeorm_1.DataSource])
], SimpleAuthService);
//# sourceMappingURL=simple-auth.service.js.map