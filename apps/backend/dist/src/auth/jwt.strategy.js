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
exports.JwtStrategy = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const passport_jwt_1 = require("passport-jwt");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("typeorm");
const typeorm_2 = require("@nestjs/typeorm");
let JwtStrategy = class JwtStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy) {
    constructor(cfg, dataSource) {
        super({
            secretOrKey: cfg.get('JWT_SECRET', 'payments_portal_secret'),
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
            algorithms: ['HS256'],
        });
        this.cfg = cfg;
        this.dataSource = dataSource;
    }
    async validate(payload) {
        const tenantId = payload.tenant_id;
        if (!tenantId)
            throw new common_1.UnauthorizedException('No tenant_id in token');
        if (!payload.sub)
            throw new common_1.UnauthorizedException('Invalid token payload');
        return {
            sub: payload.sub,
            tenantId: payload.tenant_id,
            email: payload.email,
            role: payload.role,
            firstName: payload.first_name,
            lastName: payload.last_name,
        };
    }
};
exports.JwtStrategy = JwtStrategy;
exports.JwtStrategy = JwtStrategy = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_2.InjectDataSource)()),
    __metadata("design:paramtypes", [config_1.ConfigService,
        typeorm_1.DataSource])
], JwtStrategy);
//# sourceMappingURL=jwt.strategy.js.map