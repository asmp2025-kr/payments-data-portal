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
exports.DataProductsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_guard_1 = require("../common/guards/jwt.guard");
const tenant_context_interceptor_1 = require("../common/interceptors/tenant-context.interceptor");
const decorators_1 = require("../common/decorators");
const data_products_service_1 = require("./data-products.service");
let DataProductsController = class DataProductsController {
    constructor(svc) {
        this.svc = svc;
    }
    findAll(t, dto) { return this.svc.findAll(t, dto); }
    findById(t, id) { return this.svc.findById(t, id); }
    create(t, u, b) { return this.svc.create(t, u.sub, b); }
    update(t, id, b) { return this.svc.update(t, id, b); }
    requestAccess(t, id, u, b) { return this.svc.requestAccess(t, id, u.sub, b.reason); }
    getQuality(t, id) { return this.svc.getQualityMetrics(t, id); }
};
exports.DataProductsController = DataProductsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, decorators_1.TenantId)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], DataProductsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, decorators_1.TenantId)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], DataProductsController.prototype, "findById", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, decorators_1.TenantId)()),
    __param(1, (0, decorators_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], DataProductsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, decorators_1.TenantId)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], DataProductsController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/access-request'),
    __param(0, (0, decorators_1.TenantId)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, decorators_1.CurrentUser)()),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", void 0)
], DataProductsController.prototype, "requestAccess", null);
__decorate([
    (0, common_1.Get)(':id/quality'),
    __param(0, (0, decorators_1.TenantId)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], DataProductsController.prototype, "getQuality", null);
exports.DataProductsController = DataProductsController = __decorate([
    (0, swagger_1.ApiTags)('data-products'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)(tenant_context_interceptor_1.TenantContextInterceptor),
    (0, common_1.Controller)('data-products'),
    __metadata("design:paramtypes", [data_products_service_1.DataProductsService])
], DataProductsController);
//# sourceMappingURL=data-products.controller.js.map