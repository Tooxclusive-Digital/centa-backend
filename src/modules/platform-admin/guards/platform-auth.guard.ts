import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PlatformAuthService } from '../services/platform-auth.service';
import { PlatformJwtPayload } from '../types/platform-admin.type';

/**
 * Guards every platform-admin route. Three independent checks must all pass:
 *   1. token verifies against PLATFORM_JWT_SECRET (not JWT_SECRET)
 *   2. payload carries `type: 'platform'`
 *   3. the admin row still exists and is active
 *
 * (1) alone already makes tenant tokens unusable here, since they are signed
 * with a different secret; (2) and (3) are defence in depth.
 */
@Injectable()
export class PlatformAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly platformAuthService: PlatformAuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);
    if (!token) throw new UnauthorizedException();

    const secret = this.configService.get<string>('PLATFORM_JWT_SECRET');
    if (!secret) throw new Error('PLATFORM_JWT_SECRET is not set');

    let payload: PlatformJwtPayload;
    try {
      payload = await this.jwtService.verifyAsync<PlatformJwtPayload>(token, {
        secret,
      });
    } catch {
      throw new UnauthorizedException();
    }

    if (payload?.type !== 'platform' || !payload.sub) {
      throw new UnauthorizedException();
    }

    const admin = await this.platformAuthService.findActiveById(payload.sub);
    if (!admin) throw new UnauthorizedException();

    request['user'] = admin;
    return true;
  }

  /** Bearer header first (the SPA sends it), falling back to the cookie. */
  private extractToken(request: any): string | undefined {
    const headers = request.headers || request.raw?.headers || {};
    const authHeader = headers.authorization || headers.Authorization;

    if (authHeader) {
      const [type, token] = String(authHeader).split(' ');
      if (type === 'Bearer' && token) return token;
    }

    return request?.cookies?.PlatformAuthentication;
  }
}
