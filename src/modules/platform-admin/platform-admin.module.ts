import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PlatformAuthController } from './platform-auth.controller';
import { PlatformMetricsController } from './platform-metrics.controller';
import { PlatformFilingController } from './platform-filing.controller';
import { PlatformAuthService } from './services/platform-auth.service';
import { PlatformMetricsService } from './services/platform-metrics.service';
import { PlatformFilingService } from './services/platform-filing.service';
import { PlatformNoteService } from './services/platform-note.service';
import { PlatformProfileService } from './services/platform-profile.service';
import { PlatformProfileController } from './platform-profile.controller';
import { AwsService } from 'src/common/aws/aws.service';
import { PlatformAuthGuard } from './guards/platform-auth.guard';

@Module({
  imports: [
    // Registered without a default secret: every sign/verify in this module
    // passes PLATFORM_JWT_SECRET explicitly, so a missing override can never
    // silently fall back to the tenant JWT_SECRET.
    JwtModule.register({}),
  ],
  controllers: [
    PlatformAuthController,
    PlatformMetricsController,
    PlatformFilingController,
    PlatformProfileController,
  ],
  providers: [
    PlatformAuthService,
    PlatformMetricsService,
    PlatformFilingService,
    PlatformNoteService,
    PlatformProfileService,
    PlatformAuthGuard,
    // Provided here rather than imported: AwsService is registered per-module
    // across this codebase, not globally.
    AwsService,
    ConfigService,
  ],
  exports: [
    PlatformAuthService,
    PlatformMetricsService,
    PlatformFilingService,
    PlatformNoteService,
    PlatformProfileService,
  ],
})
export class PlatformAdminModule {}
