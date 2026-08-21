import {
  BadRequestException,
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Res,
  UseGuards,
  SetMetadata,
} from '@nestjs/common';
import type { FastifyReply } from 'fastify';
import { OffboardingService } from './offboarding.service';
import { UpdateOffboardingDto } from './dto/update-offboarding.dto';
import { BaseController } from 'src/common/interceptor/base.controller';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import type { User } from 'src/common/types/user.type';
import { CurrentUser } from 'src/modules/auth/decorator/current-user.decorator';
import { CreateOffboardingBeginDto } from './dto/create-offboarding.dto';
import { AddOffboardingDetailsDto } from './dto/add-offboarding-details.dto';
import {
  OffboardingExportService,
  RECORD_SECTIONS,
  type RecordSection,
} from './offboarding-export.service';

@Controller('offboarding')
@UseGuards(JwtAuthGuard)
@SetMetadata('permission', ['employees.manage'])
export class OffboardingController extends BaseController {
  constructor(
    private readonly offboardingService: OffboardingService,
    private readonly exportService: OffboardingExportService,
  ) {
    super();
  }

  /**
   * Downloads a leaver's employment record as a workbook.
   *
   * `sections` is a comma-separated subset — summary, pay, statutory, leave,
   * offboarding. Unknown values are dropped rather than rejected so a stale
   * bookmark still returns something useful.
   */
  @Get('employee/:employeeId/record')
  async downloadRecord(
    @Param('employeeId') employeeId: string,
    @CurrentUser() user: User,
    @Res({ passthrough: true }) reply: FastifyReply,
    @Query('sections') sections?: string,
  ) {
    // Postgres raises a 500 on a malformed uuid, so reject it here: a bad id
    // is a bad request, not a server fault.
    const UUID =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!UUID.test(employeeId)) {
      throw new BadRequestException('A valid employee id is required');
    }

    const requested = (sections ?? '')
      .split(',')
      .map((s) => s.trim())
      .filter((s): s is RecordSection =>
        (RECORD_SECTIONS as readonly string[]).includes(s),
      );

    const { buffer, filename } = await this.exportService.generateWorkbook(
      employeeId,
      user.companyId,
      requested,
    );

    reply
      .header('Content-Disposition', `attachment; filename="${filename}"`)
      .header(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );

    return reply.send(buffer);
  }

  @Post('begin')
  begin(@Body() dto: CreateOffboardingBeginDto, @CurrentUser() user: User) {
    return this.offboardingService.begin(dto, user);
  }

  @Post(':sessionId/details')
  addDetails(
    @Param('sessionId') sessionId: string,
    @Body() dto: AddOffboardingDetailsDto,
    @CurrentUser() user: User,
  ) {
    return this.offboardingService.addDetails(sessionId, dto, user);
  }

  @Post(':sessionId/cancel')
  cancel(@Param('sessionId') sessionId: string, @CurrentUser() user: User) {
    return this.offboardingService.cancel(sessionId, user);
  }

  @Get('employee/:employeeId')
  findByEmployeeId(
    @CurrentUser() user: User,
    @Param('employeeId') employeeId: string,
  ) {
    return this.offboardingService.findByEmployeeId(employeeId, user.companyId);
  }

  @Get()
  findAll(@CurrentUser() user: User) {
    return this.offboardingService.findAll(user.companyId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.offboardingService.findOne(id, user.companyId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateOffboardingDto: UpdateOffboardingDto,
    @CurrentUser() user: User,
  ) {
    return this.offboardingService.update(id, updateOffboardingDto, user);
  }

  @Patch('update-checklist')
  updateChecklist(
    @Body('checklistItemId') checklistItemId: string,
    @CurrentUser() user: User,
  ) {
    return this.offboardingService.updateChecklist(checklistItemId, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.offboardingService.remove(id, user);
  }
}
