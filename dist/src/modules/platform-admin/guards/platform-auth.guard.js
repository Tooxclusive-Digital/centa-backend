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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlatformAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const platform_auth_service_1 = require("../services/platform-auth.service");
let PlatformAuthGuard = class PlatformAuthGuard {
    constructor(jwtService, configService, platformAuthService) {
        this.jwtService = jwtService;
        this.configService = configService;
        this.platformAuthService = platformAuthService;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const token = this.extractToken(request);
        if (!token)
            throw new common_1.UnauthorizedException();
        const secret = this.configService.get('PLATFORM_JWT_SECRET');
        if (!secret)
            throw new Error('PLATFORM_JWT_SECRET is not set');
        let payload;
        try {
            payload = await this.jwtService.verifyAsync(token, {
                secret,
            });
        }
        catch {
            throw new common_1.UnauthorizedException();
        }
        if (payload?.type !== 'platform' || !payload.sub) {
            throw new common_1.UnauthorizedException();
        }
        const admin = await this.platformAuthService.findActiveById(payload.sub);
        if (!admin)
            throw new common_1.UnauthorizedException();
        request['user'] = admin;
        return true;
    }
    extractToken(request) {
        const headers = request.headers || request.raw?.headers || {};
        const authHeader = headers.authorization || headers.Authorization;
        if (authHeader) {
            const [type, token] = String(authHeader).split(' ');
            if (type === 'Bearer' && token)
                return token;
        }
        return request?.cookies?.PlatformAuthentication;
    }
};
exports.PlatformAuthGuard = PlatformAuthGuard;
exports.PlatformAuthGuard = PlatformAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        config_1.ConfigService,
        platform_auth_service_1.PlatformAuthService])
], PlatformAuthGuard);
//# sourceMappingURL=platform-auth.guard.js.map