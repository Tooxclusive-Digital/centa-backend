import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import type { db } from 'src/drizzle/types/drizzle';
import { DRIZZLE } from 'src/drizzle/drizzle.module';
import { platformAdmins } from '../schema';
import { PlatformLoginDto } from '../dto/platform-login.dto';
import { PlatformAdminUser } from '../types/platform-admin.type';

@Injectable()
export class PlatformAuthService {
  constructor(
    @Inject(DRIZZLE) private readonly db: db,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Platform tokens are signed with PLATFORM_JWT_SECRET (never JWT_SECRET) and
   * carry `type: 'platform'`. A tenant token therefore cannot verify here, and a
   * platform token cannot verify against the tenant guards.
   */
  private signToken(admin: { id: string; email: string }) {
    const secret = this.configService.get<string>('PLATFORM_JWT_SECRET');
    if (!secret) throw new Error('PLATFORM_JWT_SECRET is not set');

    return this.jwtService.sign(
      { sub: admin.id, email: admin.email, type: 'platform' },
      {
        secret,
        expiresIn: `${this.configService.get<number>('PLATFORM_JWT_EXPIRATION') ?? 43200}s`,
      },
    );
  }

  async login(dto: PlatformLoginDto): Promise<{
    admin: PlatformAdminUser;
    accessToken: string;
  }> {
    const [admin] = await this.db
      .select()
      .from(platformAdmins)
      .where(eq(platformAdmins.email, dto.email.toLowerCase().trim()));

    // Same error for unknown email and bad password: don't leak which admin
    // emails exist.
    if (!admin || !admin.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordIsValid = await bcrypt.compare(dto.password, admin.password);
    if (!passwordIsValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.db
      .update(platformAdmins)
      .set({ lastLogin: new Date(), updatedAt: new Date() })
      .where(eq(platformAdmins.id, admin.id));

    return {
      admin: {
        id: admin.id,
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
        avatar: admin.avatar,
        lastLogin: admin.lastLogin,
      },
      accessToken: this.signToken(admin),
    };
  }

  async findActiveById(id: string): Promise<PlatformAdminUser | null> {
    const [admin] = await this.db
      .select({
        id: platformAdmins.id,
        email: platformAdmins.email,
        firstName: platformAdmins.firstName,
        lastName: platformAdmins.lastName,
        avatar: platformAdmins.avatar,
        lastLogin: platformAdmins.lastLogin,
        isActive: platformAdmins.isActive,
      })
      .from(platformAdmins)
      .where(eq(platformAdmins.id, id));

    if (!admin || !admin.isActive) return null;

    const { isActive: _isActive, ...user } = admin;
    return user;
  }
}
