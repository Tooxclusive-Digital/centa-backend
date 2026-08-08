import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { eq } from 'drizzle-orm';
import type { db } from 'src/drizzle/types/drizzle';
import { DRIZZLE } from 'src/drizzle/drizzle.module';
import { AwsService } from 'src/common/aws/aws.service';
import { platformAdmins, platformAuditLogs } from '../schema';
import { PlatformAdminUser } from '../types/platform-admin.type';

/** Decoded ceiling. Generous for a headshot, small enough to bound the bucket. */
const MAX_AVATAR_BYTES = 2 * 1024 * 1024;

/**
 * Magic numbers for the formats the DTO allows. The declared MIME type in a
 * data URI is client-supplied and trivially wrong — checking the leading bytes
 * is what stops something that isn't an image being stored and then served
 * back from a public bucket.
 */
const SIGNATURES: Array<{ mime: string; test: (b: Buffer) => boolean }> = [
  {
    mime: 'image/png',
    test: (b) =>
      b.length > 8 &&
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
    test: (b) =>
      b.length > 12 &&
      b.toString('ascii', 0, 4) === 'RIFF' &&
      b.toString('ascii', 8, 12) === 'WEBP',
  },
];

@Injectable()
export class PlatformProfileService {
  constructor(
    @Inject(DRIZZLE) private readonly db: db,
    private readonly awsService: AwsService,
  ) {}

  /**
   * Replaces the admin's avatar.
   *
   * The S3 key is derived from the admin's email, matching the tenant upload
   * convention, which means a re-upload overwrites the previous object rather
   * than accumulating orphans. The consequence is that the URL is stable, so
   * the client needs a cache-buster to see a new image — handled there.
   */
  async updateAvatar(admin: PlatformAdminUser, dataUri: string, ip?: string) {
    const base64 = dataUri.slice(dataUri.indexOf(',') + 1);
    const buffer = Buffer.from(base64, 'base64');

    if (buffer.length === 0) {
      throw new BadRequestException('Avatar image could not be decoded.');
    }
    if (buffer.length > MAX_AVATAR_BYTES) {
      throw new BadRequestException('Avatar must be 2MB or smaller.');
    }

    const match = SIGNATURES.find((s) => s.test(buffer));
    if (!match) {
      throw new BadRequestException(
        'Avatar must be a valid PNG, JPEG or WebP image.',
      );
    }

    // Re-encode from the verified bytes so the stored object matches the type
    // we detected, not the one the client claimed.
    const normalised = `data:${match.mime};base64,${buffer.toString('base64')}`;

    const url = await this.awsService.uploadImageToS3(
      admin.email,
      'platform-avatar',
      normalised,
    );

    const [updated] = await this.db
      .update(platformAdmins)
      .set({ avatar: url, updatedAt: new Date() })
      .where(eq(platformAdmins.id, admin.id))
      .returning({
        id: platformAdmins.id,
        email: platformAdmins.email,
        firstName: platformAdmins.firstName,
        lastName: platformAdmins.lastName,
        avatar: platformAdmins.avatar,
        lastLogin: platformAdmins.lastLogin,
      });

    if (!updated) throw new NotFoundException('Admin not found.');

    await this.db.insert(platformAuditLogs).values({
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

  /** Clears the avatar, falling the UI back to the initials chip. */
  async removeAvatar(admin: PlatformAdminUser, ip?: string) {
    const [updated] = await this.db
      .update(platformAdmins)
      .set({ avatar: null, updatedAt: new Date() })
      .where(eq(platformAdmins.id, admin.id))
      .returning({
        id: platformAdmins.id,
        email: platformAdmins.email,
        firstName: platformAdmins.firstName,
        lastName: platformAdmins.lastName,
        avatar: platformAdmins.avatar,
        lastLogin: platformAdmins.lastLogin,
      });

    if (!updated) throw new NotFoundException('Admin not found.');

    await this.db.insert(platformAuditLogs).values({
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
}
