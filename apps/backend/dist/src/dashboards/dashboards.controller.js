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
exports.DashboardsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_guard_1 = require("../common/guards/jwt.guard");
const tenant_context_interceptor_1 = require("../common/interceptors/tenant-context.interceptor");
const decorators_1 = require("../common/decorators");
const dashboards_service_1 = require("./dashboards.service");
let DashboardsController = class DashboardsController {
    constructor(svc) {
        this.svc = svc;
    }
    findAll(t, dto) { return this.svc.findAll(t, dto); }
    getTemplates(t) { return this.svc.getTemplates(t); }
    findById(t, id) { return this.svc.findById(t, id); }
    create(t, u, b) { return this.svc.create(t, u.sub, b); }
    update(t, id, b) { return this.svc.update(t, id, b); }
    clone(t, u, id) { return this.svc.clone(t, u.sub, id); }
    share(id) { return this.svc.generateShareToken(id); }
    remove(t, id) { return this.svc.delete(t, id); }
};
exports.DashboardsController = DashboardsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, decorators_1.TenantId)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], DashboardsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('templates'),
    __param(0, (0, decorators_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DashboardsController.prototype, "getTemplates", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, decorators_1.TenantId)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], DashboardsController.prototype, "findById", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, decorators_1.TenantId)()),
    __param(1, (0, decorators_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], DashboardsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, decorators_1.TenantId)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], DashboardsController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/clone'),
    __param(0, (0, decorators_1.TenantId)()),
    __param(1, (0, decorators_1.CurrentUser)()),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", void 0)
], DashboardsController.prototype, "clone", null);
__decorate([
    (0, common_1.Post)(':id/share'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DashboardsController.prototype, "share", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, decorators_1.TenantId)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], DashboardsController.prototype, "remove", null);
exports.DashboardsController = DashboardsController = __decorate([
    (0, swagger_1.ApiTags)('dashboards'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)(tenant_context_interceptor_1.TenantContextInterceptor),
    (0, common_1.Controller)('dashboards'),
    __metadata("design:paramtypes", [dashboards_service_1.DashboardsService])
], DashboardsController);
//# sourceMappingURL=dashboards.controller.js.map