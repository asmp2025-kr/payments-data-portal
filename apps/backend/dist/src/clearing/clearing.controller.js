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
exports.ClearingController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_guard_1 = require("../common/guards/jwt.guard");
const tenant_context_interceptor_1 = require("../common/interceptors/tenant-context.interceptor");
const decorators_1 = require("../common/decorators");
const clearing_service_1 = require("./clearing.service");
const pagination_dto_1 = require("../common/dto/pagination.dto");
let ClearingController = class ClearingController {
    constructor(svc) {
        this.svc = svc;
    }
    getSummary(tenantId, dto) {
        return this.svc.getSummary(tenantId, dto);
    }
    getHourlyTrend(tenantId, dto) {
        return this.svc.getHourlyTrend(tenantId, dto);
    }
    getDailyTrend(tenantId, dto) {
        return this.svc.getDailyTrend(tenantId, dto);
    }
    getTransactions(tenantId, dto) {
        return this.svc.getTransactions(tenantId, dto);
    }
    getParticipants(tenantId, dto) {
        return this.svc.getParticipantRanking(tenantId, dto);
    }
    getExceptions(tenantId, dto) {
        return this.svc.getExceptions(tenantId, dto);
    }
};
exports.ClearingController = ClearingController;
__decorate([
    (0, common_1.Get)('summary'),
    (0, swagger_1.ApiOperation)({ summary: 'Clearing KPI summary' }),
    __param(0, (0, decorators_1.TenantId)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, pagination_dto_1.DateRangeDto]),
    __metadata("design:returntype", void 0)
], ClearingController.prototype, "getSummary", null);
__decorate([
    (0, common_1.Get)('trend/hourly'),
    (0, swagger_1.ApiOperation)({ summary: 'Hourly clearing throughput trend' }),
    __param(0, (0, decorators_1.TenantId)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, pagination_dto_1.DateRangeDto]),
    __metadata("design:returntype", void 0)
], ClearingController.prototype, "getHourlyTrend", null);
__decorate([
    (0, common_1.Get)('trend/daily'),
    (0, swagger_1.ApiOperation)({ summary: 'Daily clearing trend' }),
    __param(0, (0, decorators_1.TenantId)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, pagination_dto_1.DateRangeDto]),
    __metadata("design:returntype", void 0)
], ClearingController.prototype, "getDailyTrend", null);
__decorate([
    (0, common_1.Get)('transactions'),
    (0, swagger_1.ApiOperation)({ summary: 'Paginated clearing transactions' }),
    __param(0, (0, decorators_1.TenantId)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ClearingController.prototype, "getTransactions", null);
__decorate([
    (0, common_1.Get)('participants'),
    (0, swagger_1.ApiOperation)({ summary: 'Participant performance ranking' }),
    __param(0, (0, decorators_1.TenantId)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, pagination_dto_1.DateRangeDto]),
    __metadata("design:returntype", void 0)
], ClearingController.prototype, "getParticipants", null);
__decorate([
    (0, common_1.Get)('exceptions'),
    (0, swagger_1.ApiOperation)({ summary: 'Clearing exceptions and failures' }),
    __param(0, (0, decorators_1.TenantId)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, pagination_dto_1.DateRangeDto]),
    __metadata("design:returntype", void 0)
], ClearingController.prototype, "getExceptions", null);
exports.ClearingController = ClearingController = __decorate([
    (0, swagger_1.ApiTags)('clearing'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)(tenant_context_interceptor_1.TenantContextInterceptor),
    (0, common_1.Controller)('clearing'),
    __metadata("design:paramtypes", [clearing_service_1.ClearingService])
], ClearingController);
//# sourceMappingURL=clearing.controller.js.map