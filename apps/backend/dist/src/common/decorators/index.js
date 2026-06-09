"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantId = exports.CurrentUser = exports.Roles = exports.ROLES_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.ROLES_KEY = 'roles';
const Roles = (...roles) => (0, common_1.SetMetadata)(exports.ROLES_KEY, roles);
exports.Roles = Roles;
exports.CurrentUser = (0, common_1.createParamDecorator)((_data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
});
exports.TenantId = (0, common_1.createParamDecorator)((_data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    return request.tenantId;
});
//# sourceMappingURL=index.js.map