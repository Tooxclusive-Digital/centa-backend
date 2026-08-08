import { IsString, Matches, MaxLength } from 'class-validator';

/**
 * A base64 image data URI, matching how the tenant profile endpoint accepts
 * avatars.
 *
 * The regex pins the format to the three types S3 will be told it is serving,
 * so a mislabelled payload is rejected before it reaches the bucket. MaxLength
 * is a coarse guard on the encoded string — the service re-checks the decoded
 * byte length, which is what actually matters.
 */
export class UpdateAvatarDto {
  @IsString()
  @Matches(/^data:image\/(png|jpe?g|webp);base64,[A-Za-z0-9+/]+=*$/, {
    message: 'avatar must be a base64 PNG, JPEG or WebP data URI',
  })
  // ~4MB of base64 ≈ 3MB decoded; the service enforces the real limit.
  @MaxLength(4_200_000, { message: 'avatar image is too large' })
  avatar: string;
}
