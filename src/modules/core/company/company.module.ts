import { Module } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';
import { LocationsModule } from './locations/locations.module';
import { CompanyTaxModule } from './company-tax/company-tax.module';
import { OnboardingSeederService } from 'src/modules/lifecycle/onboarding/seeder.service';
import { DocumentsModule } from './documents/documents.module';
import { BirthdaysService } from 'src/modules/core/employees/birthdays/birthdays.service';

@Module({
  controllers: [CompanyController],
  providers: [CompanyService, OnboardingSeederService, BirthdaysService],
  imports: [LocationsModule, CompanyTaxModule, DocumentsModule],
  exports: [CompanyService, LocationsModule, BirthdaysService],
})
export class CompanyModule {}
