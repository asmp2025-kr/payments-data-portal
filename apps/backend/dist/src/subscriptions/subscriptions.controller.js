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
exports.SubscriptionsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_guard_1 = require("../common/guards/jwt.guard");
const tenant_context_interceptor_1 = require("../common/interceptors/tenant-context.interceptor");
const decorators_1 = require("../common/decorators");
const subscriptions_service_1 = require("./subscriptions.service");
let SubscriptionsController = class SubscriptionsController {
    constructor(svc) {
        this.svc = svc;
    }
    getPlans() { return this.svc.getPlans(); }
    getCurrent(t) { return this.svc.getForTenant(t); }
    create(t, b) { return this.svc.create(t, b.plan); }
};
exports.SubscriptionsController = SubscriptionsController;
__decorate([
    (0, common_1.Get)('plans'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SubscriptionsController.prototype, "getPlans", null);
__decorate([
    (0, common_1.Get)('current'),
    __param(0, (0, decorators_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SubscriptionsController.prototype, "getCurrent", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, decorators_1.TenantId)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SubscriptionsController.prototype, "create", null);
exports.SubscriptionsController = SubscriptionsController = __decorate([
    (0, swagger_1.ApiTags)('subscriptions'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)(tenant_context_interceptor_1.TenantContextInterceptor),
    (0, common_1.Controller)('subscriptions'),
    __metadata("design:paramtypes", [subscriptions_service_1.SubscriptionsService])
], SubscriptionsController);
//# sourceMappingURL=subscriptions.controller.js.map