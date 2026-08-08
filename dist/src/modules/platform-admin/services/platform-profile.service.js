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
exports.PlatformProfileService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_module_1 = require("../../../drizzle/drizzle.module");
const aws_service_1 = require("../../../common/aws/aws.service");
const schema_1 = require("../schema");
const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
const SIGNATURES = [
    {
        mime: 'image/png',
        test: (b) => b.length > 8 &&
            b[0] === 0x89 &&
            b[1] === 0x50 &&
            b[2] === 0x4e &&
            b[3] === 0x47,
    },
    {
        mime: 'image/jpeg',
        test: (b) => b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
    },
    {
        mime: 'image/webp',
        test: (b) => b.length > 12 &&
            b.toString('ascii', 0, 4) === 'RIFF' &&
            b.toString('ascii', 8, 12) === 'WEBP',
    },
];
let PlatformProfileService = class PlatformProfileService {
    constructor(db, awsService) {
        this.db = db;
        this.awsService = awsService;
    }
    async updateAvatar(admin, dataUri, ip) {
        const base64 = dataUri.slice(dataUri.indexOf(',') + 1);
        const buffer = Buffer.from(base64, 'base64');
        if (buffer.length === 0) {
            throw new common_1.BadRequestException('Avatar image could not be decoded.');
        }
        if (buffer.length > MAX_AVATAR_BYTES) {
            throw new common_1.BadRequestException('Avatar must be 2MB or smaller.');
        }
        const match = SIGNATURES.find((s) => s.test(buffer));
        if (!match) {
            throw new common_1.BadRequestException('Avatar must be a valid PNG, JPEG or WebP image.');
        }
        const normalised = `data:${match.mime};base64,${buffer.toString('base64')}`;
        const url = await this.awsService.uploadImageToS3(admin.email, 'platform-avatar', normalised);
        const [updated] = await this.db
            .update(schema_1.platformAdmins)
            .set({ avatar: url, updatedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(schema_1.platformAdmins.id, admin.id))
            .returning({
            id: schema_1.platformAdmins.id,
            email: schema_1.platformAdmins.email,
            firstName: schema_1.platformAdmins.firstName,
            lastName: schema_1.platformAdmins.lastName,
            avatar: schema_1.platformAdmins.avatar,
            lastLogin: schema_1.platformAdmins.lastLogin,
        });
        if (!updated)
            throw new common_1.NotFoundException('Admin not found.');
        await this.db.insert(schema_1.platformAuditLogs).values({
            adminId: admin.id,
            adminEmail: admin.email,
            action: 'update',
            entity: 'platform_admin_avatar',
            entityId: admin.id,
            details: `Updated avatar (${match.mime}, ${Math.round(buffer.length / 1024)}KB)`,
            ipAddress: ip,
        });
        return updated;
    }
    async removeAvatar(admin, ip) {
        const [updated] = await this.db
            .update(schema_1.platformAdmins)
            .set({ avatar: null, updatedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(schema_1.platformAdmins.id, admin.id))
            .returning({
            id: schema_1.platformAdmins.id,
            email: schema_1.platformAdmins.email,
            firstName: schema_1.platformAdmins.firstName,
            lastName: schema_1.platformAdmins.lastName,
            avatar: schema_1.platformAdmins.avatar,
            lastLogin: schema_1.platformAdmins.lastLogin,
        });
        if (!updated)
            throw new common_1.NotFoundException('Admin not found.');
        await this.db.insert(schema_1.platformAuditLogs).values({
            adminId: admin.id,
            adminEmail: admin.email,
            action: 'delete',
            entity: 'platform_admin_avatar',
            entityId: admin.id,
            details: 'Removed avatar',
            ipAddress: ip,
        });
        return updated;
    }
};
exports.PlatformProfileService = PlatformProfileService;
exports.PlatformProfileService = PlatformProfileService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(drizzle_module_1.DRIZZLE)),
    __metadata("design:paramtypes", [Object, aws_service_1.AwsService])
], PlatformProfileService);
//# sourceMappingURL=platform-profile.service.js.map