import { CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PlatformAuthService } from '../services/platform-auth.service';
export declare class PlatformAuthGuard implements CanActivate {
    private readonly jwtService;
    private readonly configService;
    private readonly platformAuthService;
    constructor(jwtService: JwtService, configService: ConfigService, platformAuthService: PlatformAuthService);
    canActivate(context: ExecutionContext): Promise<boolean>;
    private extractToken;
}
