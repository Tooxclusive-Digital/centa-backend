import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { PlatformAuthGuard } from './guards/platform-auth.guard';
import {
  Interval,
  PlatformMetricsService,
} from './services/platform-metrics.service';

const VALID_INTERVALS: Interval[] = ['month', 'week', 'day'];

function parseInterval(value?: string): Interval {
  return VALID_INTERVALS.includes(value as Interval)
    ? (value as Interval)
    : 'month';
}

function parseSince(value?: string): Date | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

/** Read-only, cross-company aggregates. No tenant scoping by design. */
@Controller('platform/metrics')
@UseGuards(PlatformAuthGuard)
export class PlatformMetricsController {
  constructor(private readonly metrics: PlatformMetricsService) {}

  @Get('overview')
  getOverview() {
    return this.metrics.getOverview();
  }

  @Get('companies')
  getCompanyGrowth(
    @Query('interval') interval?: string,
    @Query('since') since?: string,
  ) {
    return this.metrics.getCompanyGrowth(
      parseInterval(interval),
      parseSince(since),
    );
  }

  @Get('employees')
  getEmployeeGrowth(
    @Query('interval') interval?: string,
    @Query('since') since?: string,
  ) {
    return this.metrics.getEmployeeGrowth(
      parseInterval(interval),
      parseSince(since),
    );
  }

  @Get('payroll')
  getPayrollVolume(
    @Query('interval') interval?: string,
    @Query('since') since?: string,
  ) {
    return this.metrics.getPayrollVolume(
      parseInterval(interval),
      parseSince(since),
    );
  }

  @Get('exceptions')
  getExceptions() {
    return this.metrics.getExceptions();
  }

  @Get('statutory')
  getStatutorySummary() {
    return this.metrics.getStatutorySummary();
  }

  @Get('statutory/trend')
  getStatutoryTrend(
    @Query('interval') interval?: string,
    @Query('since') since?: string,
  ) {
    return this.metrics.getStatutoryTrend(
      parseInterval(interval),
      parseSince(since),
    );
  }

  @Get('remittances')
  getRemittances() {
    return this.metrics.getRemittances();
  }

  @Get('remittances/coverage')
  getRemittanceCoverage() {
    return this.metrics.getRemittanceCoverage();
  }

  @Get('adoption')
  getAdoptionFunnel() {
    return this.metrics.getAdoptionFunnel();
  }

  @Get('companies/top')
  getTopCompanies(@Query('limit') limit?: string) {
    return this.metrics.getTopCompanies(Math.min(Math.max(Number(limit) || 6, 1), 20));
  }

  @Get('companies/list')
  getCompanyList(@Query('limit') limit?: string, @Query('offset') offset?: string) {
    const parsedLimit = Math.min(Math.max(Number(limit) || 100, 1), 500);
    const parsedOffset = Math.max(Number(offset) || 0, 0);
    return this.metrics.getCompanyList(parsedLimit, parsedOffset);
  }
}
