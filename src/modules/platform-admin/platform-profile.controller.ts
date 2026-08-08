import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Ip,
  Put,
  UseGuards,
} from '@nestjs/common';
import { PlatformAuthGuard } from './guards/platform-auth.guard';
import { CurrentPlatformAdmin } from './decorator/current-platform-admin.decorator';
import { PlatformAdminUser } from './types/platform-admin.type';
import { PlatformProfileService } from './services/platform-profile.service';
import { UpdateAvatarDto } from './dto/update-avatar.dto';

/**
 * The signed-in admin's own profile.
 *
 * Every route acts on the admin resolved from the token — there is no id
 * parameter, so one admin cannot change another's avatar.
 */
@Controller('platform/profile')
@UseGuards(PlatformAuthGuard)
export class PlatformProfileController {
  constructor(private readonly profile: PlatformProfileService) {}

  @Put('avatar')
  @HttpCode(HttpStatus.OK)
  updateAvatar(
    @Body() dto: UpdateAvatarDto,
    @CurrentPlatformAdmin() admin: PlatformAdminUser,
    @Ip() ip: string,
  ) {
    return this.profile.updateAvatar(admin, dto.avatar, ip);
  }

  @Delete('avatar')
  @HttpCode(HttpStatus.OK)
  removeAvatar(
    @CurrentPlatformAdmin() admin: PlatformAdminUser,
    @Ip() ip: string,
  ) {
    return this.profile.removeAvatar(admin, ip);
  }
}
