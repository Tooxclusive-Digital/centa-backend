import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { PlatformAuthService } from './services/platform-auth.service';
import { PlatformLoginDto } from './dto/platform-login.dto';
import { PlatformAuthGuard } from './guards/platform-auth.guard';
import { CurrentPlatformAdmin } from './decorator/current-platform-admin.decorator';
import { PlatformAdminUser } from './types/platform-admin.type';

@Controller('platform/auth')
export class PlatformAuthController {
  constructor(private readonly platformAuth: PlatformAuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: PlatformLoginDto,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    const { admin, accessToken } = await this.platformAuth.login(dto);

    // Distinct cookie name: `Authentication` belongs to tenant auth and both
    // are set on the same API host, so reusing it would clobber tenant sessions.
    res.setCookie('PlatformAuthentication', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/',
    });

    return { success: true, admin, accessToken };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Res({ passthrough: true }) res: FastifyReply) {
    res.clearCookie('PlatformAuthentication', { path: '/' });
    return { success: true };
  }

  @Get('me')
  @UseGuards(PlatformAuthGuard)
  async me(@CurrentPlatformAdmin() admin: PlatformAdminUser) {
    return { success: true, admin };
  }
}
