import type { db } from 'src/drizzle/types/drizzle';
import { AwsService } from 'src/common/aws/aws.service';
import { PlatformAdminUser } from '../types/platform-admin.type';
export declare class PlatformProfileService {
    private readonly db;
    private readonly awsService;
    constructor(db: db, awsService: AwsService);
    updateAvatar(admin: PlatformAdminUser, dataUri: string, ip?: string): Promise<{
        id: string;
        email: string;
        firstName: string | null;
        lastName: string | null;
        avatar: string | null;
        lastLogin: Date | null;
    }>;
    removeAvatar(admin: PlatformAdminUser, ip?: string): Promise<{
        id: string;
        email: string;
        firstName: string | null;
        lastName: string | null;
        avatar: string | null;
        lastLogin: Date | null;
    }>;
}
