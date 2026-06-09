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
exports.AccountsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_guard_1 = require("../common/guards/jwt.guard");
const tenant_context_interceptor_1 = require("../common/interceptors/tenant-context.interceptor");
const decorators_1 = require("../common/decorators");
const accounts_service_1 = require("./accounts.service");
let AccountsController = class AccountsController {
    constructor(svc) {
        this.svc = svc;
    }
    getSummary(t) { return this.svc.getSummary(t); }
    getList(t, dto) { return this.svc.getList(t, dto); }
    getDormancy(t) { return this.svc.getDormancyReport(t); }
};
exports.AccountsController = AccountsController;
__decorate([
    (0, common_1.Get)('summary'),
    __param(0, (0, decorators_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AccountsController.prototype, "getSummary", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, decorators_1.TenantId)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AccountsController.prototype, "getList", null);
__decorate([
    (0, common_1.Get)('dormancy'),
    __param(0, (0, decorators_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AccountsController.prototype, "getDormancy", null);
exports.AccountsController = AccountsController = __decorate([
    (0, swagger_1.ApiTags)('accounts'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)(tenant_context_interceptor_1.TenantContextInterceptor),
    (0, common_1.Controller)('accounts'),
    __metadata("design:paramtypes", [accounts_service_1.AccountsService])
], AccountsController);
//# sourceMappingURL=accounts.controller.js.map