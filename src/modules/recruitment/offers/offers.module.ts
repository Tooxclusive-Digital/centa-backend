import { Module } from '@nestjs/common';
import { OffersService } from './offers.service';
import { OffersController } from './offers.controller';
import { OfferLetterModule } from './offer-letter/offer-letter.module';
import { BullModule } from '@nestjs/bullmq';
import { SendOffersService } from './send-offer.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { NotificationModule } from 'src/modules/notification/notification.module';

@Module({
  imports: [
    OfferLetterModule,
    BullModule.registerQueue({
      name: 'offerPdfQueue',
    }),
    // OfferEmailService is declared and exported by NotificationModule so it
    // can reach the ResendProvider that lives there.
    NotificationModule,
  ],
  controllers: [OffersController],
  providers: [OffersService, SendOffersService, JwtService, ConfigService],
})
export class OffersModule {}
