import { Inject, Injectable, Logger } from '@nestjs/common';
import { DRIZZLE } from 'src/drizzle/drizzle.module';
import type { db } from 'src/drizzle/types/drizzle';
import { and, eq, sql } from 'drizzle-orm';
import { employees } from 'src/modules/core/employees/schema/employee.schema';
import { employeeProfiles } from 'src/modules/core/employees/schema/profile.schema';
import { departments } from 'src/drizzle/schema';
import { CacheService } from 'src/common/cache/cache.service';

export interface BirthdayEntry {
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string | null;
  /**
   * Day and month of the birthday, as MM-DD.
   *
   * Deliberately not the full date of birth: age is sensitive, and this list
   * is visible to every employee. The birth year never leaves the service.
   */
  birthdayMonthDay: string;
  /** The upcoming occurrence, as YYYY-MM-DD. */
  nextOccurrence: string;
  /** 0 = today, 1 = tomorrow, ... */
  daysAway: number;
}

@Injectable()
export class BirthdaysService {
  private readonly logger = new Logger(BirthdaysService.name);
  private readonly ttlSeconds = 60 * 60 * 6;

  constructor(
    @Inject(DRIZZLE) private readonly db: db,
    private readonly cache: CacheService,
  ) {}

  /**
   * Active employees whose birthday falls within the next `windowDays`
   * (inclusive of today).
   *
   * The day-difference is computed in SQL so the year boundary is handled by
   * Postgres rather than by JS date math: the next occurrence is this year's
   * anniversary, or next year's when that date has already passed. Feb 29 in a
   * non-leap year is normalised by Postgres to Mar 1.
   */
  async getUpcomingBirthdays(
    companyId: string,
    windowDays = 30,
  ): Promise<BirthdayEntry[]> {
    return this.cache.getOrSetVersioned(
      companyId,
      ['company', 'birthdays', String(windowDays)],
      async () => {
        // The anniversary falling on or after today.
        //
        // Adding whole years as an INTERVAL rather than rebuilding the date
        // with MAKE_DATE: MAKE_DATE raises "date field value out of range" for
        // a 29 Feb birthday in a non-leap year, which would fail the whole
        // query. Interval addition clamps 29 Feb to 28 Feb instead.
        const yearsToThisYear = sql`
          ((EXTRACT(YEAR FROM CURRENT_DATE)::int
            - EXTRACT(YEAR FROM ${employeeProfiles.dateOfBirth})::int) * INTERVAL '1 year')
        `;
        const thisYear = sql`(${employeeProfiles.dateOfBirth} + ${yearsToThisYear})::date`;
        const nextYear = sql`
          (${employeeProfiles.dateOfBirth}
            + ((EXTRACT(YEAR FROM CURRENT_DATE)::int
              - EXTRACT(YEAR FROM ${employeeProfiles.dateOfBirth})::int + 1) * INTERVAL '1 year'))::date
        `;
        const nextOccurrence = sql<string>`
          (CASE WHEN ${thisYear} >= CURRENT_DATE THEN ${thisYear} ELSE ${nextYear} END)
        `;

        const rows = await this.db
          .select({
            employeeId: employees.id,
            firstName: employees.firstName,
            lastName: employees.lastName,
            email: employees.email,
            department: departments.name,
            birthdayMonthDay:
              sql<string>`TO_CHAR(${employeeProfiles.dateOfBirth}, 'MM-DD')`.as(
                'birthday_month_day',
              ),
            nextOccurrence: sql<string>`TO_CHAR(${nextOccurrence}, 'YYYY-MM-DD')`.as(
              'next_occurrence',
            ),
            daysAway: sql<number>`(${nextOccurrence} - CURRENT_DATE)::int`.as(
              'days_away',
            ),
          })
          .from(employeeProfiles)
          .innerJoin(employees, eq(employees.id, employeeProfiles.employeeId))
          .leftJoin(departments, eq(departments.id, employees.departmentId))
          .where(
            and(
              eq(employees.companyId, companyId),
              eq(employees.employmentStatus, 'active'),
              sql`${employeeProfiles.dateOfBirth} IS NOT NULL`,
              // Ignore unusable dates: a picker defaulting to today stores a
              // birth year in the present, which would otherwise announce a
              // "birthday" for someone born this year.
              sql`${employeeProfiles.dateOfBirth} < CURRENT_DATE`,
              sql`(${nextOccurrence} - CURRENT_DATE)::int <= ${windowDays}`,
            ),
          )
          .orderBy(sql`days_away ASC`)
          .execute();

        return rows.map((r) => ({
          employeeId: r.employeeId,
          firstName: r.firstName,
          lastName: r.lastName,
          email: r.email,
          department: r.department,
          birthdayMonthDay: r.birthdayMonthDay,
          nextOccurrence: r.nextOccurrence,
          daysAway: Number(r.daysAway),
        }));
      },
      { ttlSeconds: this.ttlSeconds, tags: [`company:${companyId}:employees`] },
    );
  }

  /** Employees whose birthday is today. */
  async getTodaysBirthdays(companyId: string): Promise<BirthdayEntry[]> {
    const upcoming = await this.getUpcomingBirthdays(companyId, 0);
    return upcoming.filter((b) => b.daysAway === 0);
  }
}
