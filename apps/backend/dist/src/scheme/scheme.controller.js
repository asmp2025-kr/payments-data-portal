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
exports.SchemeController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_guard_1 = require("../common/guards/jwt.guard");
const tenant_context_interceptor_1 = require("../common/interceptors/tenant-context.interceptor");
const decorators_1 = require("../common/decorators");
const scheme_service_1 = require("./scheme.service");
const pagination_dto_1 = require("../common/dto/pagination.dto");
let SchemeController = class SchemeController {
    constructor(svc) {
        this.svc = svc;
    }
    getSummary(t, dto) { return this.svc.getSummary(t, dto); }
    getPerfomance(t, dto) { return this.svc.getParticipantPerformance(t, dto); }
    getTrend(t, dto) { return this.svc.getTrend(t, dto); }
    getParticipants(t) { return this.svc.getParticipants(t); }
};
exports.SchemeController = SchemeController;
__decorate([
    (0, common_1.Get)('summary'),
    __param(0, (0, decorators_1.TenantId)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, pagination_dto_1.DateRangeDto]),
    __metadata("design:returntype", void 0)
], SchemeController.prototype, "getSummary", null);
__decorate([
    (0, common_1.Get)('participants/performance'),
    __param(0, (0, decorators_1.TenantId)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, pagination_dto_1.DateRangeDto]),
    __metadata("design:returntype", void 0)
], SchemeController.prototype, "getPerfomance", null);
__decorate([
    (0, common_1.Get)('trend'),
    __param(0, (0, decorators_1.TenantId)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, pagination_dto_1.DateRangeDto]),
    __metadata("design:returntype", void 0)
], SchemeController.prototype, "getTrend", null);
__decorate([
    (0, common_1.Get)('participants'),
    __param(0, (0, decorators_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SchemeController.prototype, "getParticipants", null);
exports.SchemeController = SchemeController = __decorate([
    (0, swagger_1.ApiTags)('scheme'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)(tenant_context_interceptor_1.TenantContextInterceptor),
    (0, common_1.Controller)('scheme'),
    __metadata("design:paramtypes", [scheme_service_1.SchemeService])
], SchemeController);
//# sourceMappingURL=scheme.controller.js.map