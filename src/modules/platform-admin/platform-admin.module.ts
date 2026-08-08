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
  ],
  providers: [
    PlatformAuthService,
    PlatformMetricsService,
    PlatformFilingService,
    PlatformNoteService,
    PlatformAuthGuard,
    ConfigService,
  ],
  exports: [
    PlatformAuthService,
    PlatformMetricsService,
    PlatformFilingService,
    PlatformNoteService,
  ],
})
export class PlatformAdminModule {}
