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
exports.PlatformProfileController = void 0;
const common_1 = require("@nestjs/common");
const platform_auth_guard_1 = require("./guards/platform-auth.guard");
const current_platform_admin_decorator_1 = require("./decorator/current-platform-admin.decorator");
const platform_profile_service_1 = require("./services/platform-profile.service");
const update_avatar_dto_1 = require("./dto/update-avatar.dto");
let PlatformProfileController = class PlatformProfileController {
    constructor(profile) {
        this.profile = profile;
    }
    updateAvatar(dto, admin, ip) {
        return this.profile.updateAvatar(admin, dto.avatar, ip);
    }
    removeAvatar(admin, ip) {
        return this.profile.removeAvatar(admin, ip);
    }
};
exports.PlatformProfileController = PlatformProfileController;
__decorate([
    (0, common_1.Put)('avatar'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_platform_admin_decorator_1.CurrentPlatformAdmin)()),
    __param(2, (0, common_1.Ip)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_avatar_dto_1.UpdateAvatarDto, Object, String]),
    __metadata("design:returntype", void 0)
], PlatformProfileController.prototype, "updateAvatar", null);
__decorate([
    (0, common_1.Delete)('avatar'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, current_platform_admin_decorator_1.CurrentPlatformAdmin)()),
    __param(1, (0, common_1.Ip)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], PlatformProfileController.prototype, "removeAvatar", null);
exports.PlatformProfileController = PlatformProfileController = __decorate([
    (0, common_1.Controller)('platform/profile'),
    (0, common_1.UseGuards)(platform_auth_guard_1.PlatformAuthGuard),
    __metadata("design:paramtypes", [platform_profile_service_1.PlatformProfileService])
], PlatformProfileController);
//# sourceMappingURL=platform-profile.controller.js.map