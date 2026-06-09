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
exports.FinanceController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_guard_1 = require("../common/guards/jwt.guard");
const tenant_context_interceptor_1 = require("../common/interceptors/tenant-context.interceptor");
const decorators_1 = require("../common/decorators");
const finance_service_1 = require("./finance.service");
const pagination_dto_1 = require("../common/dto/pagination.dto");
let FinanceController = class FinanceController {
    constructor(svc) {
        this.svc = svc;
    }
    getRevSummary(t, dto) { return this.svc.getRevenueSummary(t, dto); }
    getRevTrend(t, dto) { return this.svc.getRevenueTrend(t, dto); }
    getInterchange(t, dto) { return this.svc.getInterchangeByParticipant(t, dto); }
};
exports.FinanceController = FinanceController;
__decorate([
    (0, common_1.Get)('revenue/summary'),
    __param(0, (0, decorators_1.TenantId)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, pagination_dto_1.DateRangeDto]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "getRevSummary", null);
__decorate([
    (0, common_1.Get)('revenue/trend'),
    __param(0, (0, decorators_1.TenantId)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, pagination_dto_1.DateRangeDto]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "getRevTrend", null);
__decorate([
    (0, common_1.Get)('interchange'),
    __param(0, (0, decorators_1.TenantId)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, pagination_dto_1.DateRangeDto]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "getInterchange", null);
exports.FinanceController = FinanceController = __decorate([
    (0, swagger_1.ApiTags)('finance'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)(tenant_context_interceptor_1.TenantContextInterceptor),
    (0, common_1.Controller)('finance'),
    __metadata("design:paramtypes", [finance_service_1.FinanceService])
], FinanceController);
//# sourceMappingURL=finance.controller.js.map