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
exports.PlatformAuthController = void 0;
const common_1 = require("@nestjs/common");
const platform_auth_service_1 = require("./services/platform-auth.service");
const platform_login_dto_1 = require("./dto/platform-login.dto");
const platform_auth_guard_1 = require("./guards/platform-auth.guard");
const current_platform_admin_decorator_1 = require("./decorator/current-platform-admin.decorator");
let PlatformAuthController = class PlatformAuthController {
    constructor(platformAuth) {
        this.platformAuth = platformAuth;
    }
    async login(dto, res) {
        const { admin, accessToken } = await this.platformAuth.login(dto);
        res.setCookie('PlatformAuthentication', accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            path: '/',
        });
        return { success: true, admin, accessToken };
    }
    async logout(res) {
        res.clearCookie('PlatformAuthentication', { path: '/' });
        return { success: true };
    }
    async me(admin) {
        return { success: true, admin };
    }
};
exports.PlatformAuthController = PlatformAuthController;
__decorate([
    (0, common_1.Post)('login'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [platform_login_dto_1.PlatformLoginDto, Object]),
    __metadata("design:returntype", Promise)
], PlatformAuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('logout'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PlatformAuthController.prototype, "logout", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, common_1.UseGuards)(platform_auth_guard_1.PlatformAuthGuard),
    __param(0, (0, current_platform_admin_decorator_1.CurrentPlatformAdmin)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PlatformAuthController.prototype, "me", null);
exports.PlatformAuthController = PlatformAuthController = __decorate([
    (0, common_1.Controller)('platform/auth'),
    __metadata("design:paramtypes", [platform_auth_service_1.PlatformAuthService])
], PlatformAuthController);
//# sourceMappingURL=platform-auth.controller.js.map