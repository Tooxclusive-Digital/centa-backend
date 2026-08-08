import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Ip,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PlatformAuthGuard } from './guards/platform-auth.guard';
import { CurrentPlatformAdmin } from './decorator/current-platform-admin.decorator';
import { PlatformAdminUser } from './types/platform-admin.type';
import { PlatformFilingService } from './services/platform-filing.service';
import { PlatformNoteService } from './services/platform-note.service';
import { RecordFilingDto } from './dto/record-filing.dto';
import { CreateNoteDto } from './dto/create-note.dto';

/**
 * The only write surface on the platform admin API. Kept separate from
 * PlatformMetricsController so that controller stays provably read-only.
 */
@Controller('platform/filings')
@UseGuards(PlatformAuthGuard)
export class PlatformFilingController {
  constructor(
    private readonly filings: PlatformFilingService,
    private readonly notes: PlatformNoteService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  recordFiling(
    @Body() dto: RecordFilingDto,
    @CurrentPlatformAdmin() admin: PlatformAdminUser,
    @Ip() ip: string,
  ) {
    return this.filings.recordFiling(dto, admin, ip);
  }

  /** Notes on operational exceptions — who is chasing what. */
  @Get('notes')
  listNotes() {
    return this.notes.getAll();
  }

  @Post('notes')
  @HttpCode(HttpStatus.CREATED)
  createNote(
    @Body() dto: CreateNoteDto,
    @CurrentPlatformAdmin() admin: PlatformAdminUser,
    @Ip() ip: string,
  ) {
    return this.notes.create(dto, admin, ip);
  }

  @Delete('notes/:id')
  removeNote(
    @Param('id') id: string,
    @CurrentPlatformAdmin() admin: PlatformAdminUser,
  ) {
    return this.notes.remove(id, admin);
  }

  @Get('audit')
  getAuditLog(@Query('limit') limit?: string) {
    return this.filings.getAuditLog(
      Math.min(Math.max(Number(limit) || 50, 1), 200),
    );
  }
}
