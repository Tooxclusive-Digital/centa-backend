import { Module } from '@nestjs/common';
import { OffboardingService } from './offboarding.service';
import { OffboardingExportService } from './offboarding-export.service';
import { OffboardingController } from './offboarding.controller';
import { OffboardingConfigController } from './offboarding-config.controller';
import { OffboardingConfigService } from './offboarding-config.service';
import { OffboardingSeederService } from './offboarding-seeder.service';

@Module({
  controllers: [OffboardingController, OffboardingConfigController],
  providers: [
    OffboardingExportService,
    OffboardingService,
    OffboardingConfigService,
    OffboardingSeederService,
  ],
})
export class OffboardingModule {}
