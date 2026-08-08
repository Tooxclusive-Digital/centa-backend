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
exports.PlatformAuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = require("bcryptjs");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_module_1 = require("../../../drizzle/drizzle.module");
const schema_1 = require("../schema");
let PlatformAuthService = class PlatformAuthService {
    constructor(db, jwtService, configService) {
        this.db = db;
        this.jwtService = jwtService;
        this.configService = configService;
    }
    signToken(admin) {
        const secret = this.configService.get('PLATFORM_JWT_SECRET');
        if (!secret)
            throw new Error('PLATFORM_JWT_SECRET is not set');
        return this.jwtService.sign({ sub: admin.id, email: admin.email, type: 'platform' }, {
            secret,
            expiresIn: `${this.configService.get('PLATFORM_JWT_EXPIRATION') ?? 43200}s`,
        });
    }
    async login(dto) {
        const [admin] = await this.db
            .select()
            .from(schema_1.platformAdmins)
            .where((0, drizzle_orm_1.eq)(schema_1.platformAdmins.email, dto.email.toLowerCase().trim()));
        if (!admin || !admin.isActive) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const passwordIsValid = await bcrypt.compare(dto.password, admin.password);
        if (!passwordIsValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        await this.db
            .update(schema_1.platformAdmins)
            .set({ lastLogin: new Date(), updatedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(schema_1.platformAdmins.id, admin.id));
        return {
            admin: {
                id: admin.id,
                email: admin.email,
                firstName: admin.firstName,
                lastName: admin.lastName,
                lastLogin: admin.lastLogin,
            },
            accessToken: this.signToken(admin),
        };
    }
    async findActiveById(id) {
        const [admin] = await this.db
            .select({
            id: schema_1.platformAdmins.id,
            email: schema_1.platformAdmins.email,
            firstName: schema_1.platformAdmins.firstName,
            lastName: schema_1.platformAdmins.lastName,
            lastLogin: schema_1.platformAdmins.lastLogin,
            isActive: schema_1.platformAdmins.isActive,
        })
            .from(schema_1.platformAdmins)
            .where((0, drizzle_orm_1.eq)(schema_1.platformAdmins.id, id));
        if (!admin || !admin.isActive)
            return null;
        const { isActive: _isActive, ...user } = admin;
        return user;
    }
};
exports.PlatformAuthService = PlatformAuthService;
exports.PlatformAuthService = PlatformAuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(drizzle_module_1.DRIZZLE)),
    __metadata("design:paramtypes", [Object, jwt_1.JwtService,
        config_1.ConfigService])
], PlatformAuthService);
//# sourceMappingURL=platform-auth.service.js.map