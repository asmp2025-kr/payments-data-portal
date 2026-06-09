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
exports.NotificationsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const rxjs_1 = require("rxjs");
const jwt_guard_1 = require("../common/guards/jwt.guard");
const tenant_context_interceptor_1 = require("../common/interceptors/tenant-context.interceptor");
const decorators_1 = require("../common/decorators");
const notifications_service_1 = require("./notifications.service");
let NotificationsController = class NotificationsController {
    constructor(svc) {
        this.svc = svc;
    }
    getAll(t, u, dto) {
        return this.svc.getForUser(t, u.sub, dto);
    }
    getUnread(t, u) {
        return this.svc.getUnreadCount(t, u.sub);
    }
    markRead(t, u, id) {
        return this.svc.markRead(t, u.sub, id);
    }
    markAllRead(t, u) {
        return this.svc.markAllRead(t, u.sub);
    }
    stream(t, u) {
        return (0, rxjs_1.interval)(30000).pipe((0, rxjs_1.map)(async () => {
            const count = await this.svc.getUnreadCount(t, u.sub);
            return { data: JSON.stringify(count) };
        }), (0, rxjs_1.map)(v => v));
    }
};
exports.NotificationsController = NotificationsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, decorators_1.TenantId)()),
    __param(1, (0, decorators_1.CurrentUser)()),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "getAll", null);
__decorate([
    (0, common_1.Get)('unread-count'),
    __param(0, (0, decorators_1.TenantId)()),
    __param(1, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "getUnread", null);
__decorate([
    (0, common_1.Patch)(':id/read'),
    __param(0, (0, decorators_1.TenantId)()),
    __param(1, (0, decorators_1.CurrentUser)()),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "markRead", null);
__decorate([
    (0, common_1.Patch)('mark-all-read'),
    __param(0, (0, decorators_1.TenantId)()),
    __param(1, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "markAllRead", null);
__decorate([
    (0, common_1.Sse)('stream'),
    __param(0, (0, decorators_1.TenantId)()),
    __param(1, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", rxjs_1.Observable)
], NotificationsController.prototype, "stream", null);
exports.NotificationsController = NotificationsController = __decorate([
    (0, swagger_1.ApiTags)('notifications'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)(tenant_context_interceptor_1.TenantContextInterceptor),
    (0, common_1.Controller)('notifications'),
    __metadata("design:paramtypes", [notifications_service_1.NotificationsService])
], NotificationsController);
//# sourceMappingURL=notifications.controller.js.map