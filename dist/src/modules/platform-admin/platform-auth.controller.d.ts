import { FastifyReply } from 'fastify';
import { PlatformAuthService } from './services/platform-auth.service';
import { PlatformLoginDto } from './dto/platform-login.dto';
import { PlatformAdminUser } from './types/platform-admin.type';
export declare class PlatformAuthController {
    private readonly platformAuth;
    constructor(platformAuth: PlatformAuthService);
    login(dto: PlatformLoginDto, res: FastifyReply): Promise<{
        success: boolean;
        admin: PlatformAdminUser;
        accessToken: string;
    }>;
    logout(res: FastifyReply): Promise<{
        success: boolean;
    }>;
    me(admin: PlatformAdminUser): Promise<{
        success: boolean;
        admin: PlatformAdminUser;
    }>;
}
