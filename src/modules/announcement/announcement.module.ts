import { Module } from '@nestjs/common';
import { AnnouncementService } from './announcement.service';
import { AnnouncementController } from './announcement.controller';
import { CommentService } from './comment.service';
import { ReactionService } from './reaction.service';
import { CategoryService } from './category.service';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'emailQueue',
    }),
  ],
  controllers: [AnnouncementController],
  providers: [
    AnnouncementService,
    CommentService,
    ReactionService,
    CategoryService,
  ],
  // BirthdayCron posts system announcements through this service.
  exports: [AnnouncementService],
})
export class AnnouncementModule {}
