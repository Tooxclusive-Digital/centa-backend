import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { db } from 'src/drizzle/types/drizzle';
import { PlatformLoginDto } from '../dto/platform-login.dto';
import { PlatformAdminUser } from '../types/platform-admin.type';
export declare class PlatformAuthService {
    private readonly db;
    private readonly jwtService;
    private readonly configService;
    constructor(db: db, jwtService: JwtService, configService: ConfigService);
    private signToken;
    login(dto: PlatformLoginDto): Promise<{
        admin: PlatformAdminUser;
        accessToken: string;
    }>;
    findActiveById(id: string): Promise<PlatformAdminUser | null>;
}
