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
exports.SettlementController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_guard_1 = require("../common/guards/jwt.guard");
const tenant_context_interceptor_1 = require("../common/interceptors/tenant-context.interceptor");
const decorators_1 = require("../common/decorators");
const settlement_service_1 = require("./settlement.service");
const pagination_dto_1 = require("../common/dto/pagination.dto");
let SettlementController = class SettlementController {
    constructor(svc) {
        this.svc = svc;
    }
    getSummary(tid, dto) {
        return this.svc.getSummary(tid, dto);
    }
    getPositions(tid, dto) {
        return this.svc.getNetPositions(tid, dto);
    }
    getTrend(tid, dto) {
        return this.svc.getDailyTrend(tid, dto);
    }
    getRecords(tid, dto) {
        return this.svc.getRecords(tid, dto);
    }
    getLiquidity(tid) {
        return this.svc.getLiquidityReport(tid);
    }
};
exports.SettlementController = SettlementController;
__decorate([
    (0, common_1.Get)('summary'),
    (0, swagger_1.ApiOperation)({ summary: 'Settlement KPI summary' }),
    __param(0, (0, decorators_1.TenantId)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, pagination_dto_1.DateRangeDto]),
    __metadata("design:returntype", void 0)
], SettlementController.prototype, "getSummary", null);
__decorate([
    (0, common_1.Get)('positions'),
    (0, swagger_1.ApiOperation)({ summary: 'Net settlement positions by participant' }),
    __param(0, (0, decorators_1.TenantId)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, pagination_dto_1.DateRangeDto]),
    __metadata("design:returntype", void 0)
], SettlementController.prototype, "getPositions", null);
__decorate([
    (0, common_1.Get)('trend'),
    (0, swagger_1.ApiOperation)({ summary: 'Daily settlement trend' }),
    __param(0, (0, decorators_1.TenantId)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, pagination_dto_1.DateRangeDto]),
    __metadata("design:returntype", void 0)
], SettlementController.prototype, "getTrend", null);
__decorate([
    (0, common_1.Get)('records'),
    (0, swagger_1.ApiOperation)({ summary: 'Paginated settlement records' }),
    __param(0, (0, decorators_1.TenantId)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SettlementController.prototype, "getRecords", null);
__decorate([
    (0, common_1.Get)('liquidity'),
    (0, swagger_1.ApiOperation)({ summary: 'Intraday liquidity exposure' }),
    __param(0, (0, decorators_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SettlementController.prototype, "getLiquidity", null);
exports.SettlementController = SettlementController = __decorate([
    (0, swagger_1.ApiTags)('settlement'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)(tenant_context_interceptor_1.TenantContextInterceptor),
    (0, common_1.Controller)('settlement'),
    __metadata("design:paramtypes", [settlement_service_1.SettlementService])
], SettlementController);
//# sourceMappingURL=settlement.controller.js.map