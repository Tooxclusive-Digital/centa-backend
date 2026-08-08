import { PlatformAdminUser } from './types/platform-admin.type';
import { PlatformProfileService } from './services/platform-profile.service';
import { UpdateAvatarDto } from './dto/update-avatar.dto';
export declare class PlatformProfileController {
    private readonly profile;
    constructor(profile: PlatformProfileService);
    updateAvatar(dto: UpdateAvatarDto, admin: PlatformAdminUser, ip: string): Promise<{
        id: string;
        email: string;
        firstName: string | null;
        lastName: string | null;
        avatar: string | null;
        lastLogin: Date | null;
    }>;
    removeAvatar(admin: PlatformAdminUser, ip: string): Promise<{
        id: string;
        email: string;
        firstName: string | null;
        lastName: string | null;
        avatar: string | null;
        lastLogin: Date | null;
    }>;
}
