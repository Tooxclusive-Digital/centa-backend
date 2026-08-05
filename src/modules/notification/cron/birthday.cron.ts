import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { DRIZZLE } from 'src/drizzle/drizzle.module';
import type { db } from 'src/drizzle/types/drizzle';
import { and, eq, inArray } from 'drizzle-orm';
import { companies } from 'src/drizzle/schema';
import { users } from 'src/modules/auth/schema/users.schema';
import { companyRoles } from 'src/modules/auth/permissions/schema/permissions.schema';
import { BirthdaysService } from 'src/modules/core/employees/birthdays/birthdays.service';
import { AnnouncementService } from 'src/modules/announcement/announcement.service';
import { CompanySettingsService } from 'src/company-settings/company-settings.service';

@Injectable()
export class BirthdayCron {
  private readonly logger = new Logger(BirthdayCron.name);

  /** Roles considered for authoring the system announcement. */
  private static readonly HR_ROLES = ['super_admin', 'admin', 'hr_manager'];

  private static readonly CATEGORY = 'Celebrations';

  /**
   * Opt-in per company, defaulting to OFF.
   *
   * Auto-posting someone's birthday to the whole company is not a safe
   * default: DOBs get entered for testing or imported wrong, and an
   * unwanted post cannot be un-seen. A company turns this on deliberately.
   */
  private static readonly SETTING_KEY = 'announcements.birthday_enabled';

  constructor(
    @Inject(DRIZZLE) private readonly db: db,
    private readonly birthdays: BirthdaysService,
    private readonly announcements: AnnouncementService,
    private readonly settings: CompanySettingsService,
  ) {}

  /**
   * Posts a birthday announcement each morning so colleagues can react and
   * comment on it, rather than pushing an email into everyone's inbox.
   *
   * Announcement titles carry the date, and creation is deduped by title, so
   * a re-run (or a second instance) cannot post twice.
   */
  @Cron('0 08 * * *')
  async runDailyBirthdays() {
    this.logger.log({ op: 'birthday.cron.start' });

    const allCompanies = await this.db
      .select({ id: companies.id, name: companies.name })
      .from(companies)
      .execute();

    for (const company of allCompanies) {
      try {
        await this.runForCompany(company.id);
      } catch (e: any) {
        this.logger.error(
          {
            op: 'birthday.cron.company.failed',
            companyId: company.id,
            msg: e?.message,
          },
          e?.stack,
        );
      }
    }

    this.logger.log({ op: 'birthday.cron.done' });
  }

  /**
   * A user id to attribute the announcement to.
   *
   * `announcements.createdBy` is required and the feed renders an author, so
   * system posts are attributed to an HR/admin account rather than a
   * synthetic id.
   */
  private async resolveAuthor(companyId: string): Promise<string | null> {
    const [author] = await this.db
      .select({ id: users.id })
      .from(users)
      .innerJoin(companyRoles, eq(companyRoles.id, users.companyRoleId))
      .where(
        and(
          eq(users.companyId, companyId),
          inArray(companyRoles.name, BirthdayCron.HR_ROLES),
        ),
      )
      .limit(1)
      .execute();

    return author?.id ?? null;
  }

  private async runForCompany(companyId: string) {
    const enabled = await this.settings.getSettingsOrDefaults(
      companyId,
      BirthdayCron.SETTING_KEY,
      false,
    );

    if (enabled !== true && enabled !== 'true') {
      this.logger.debug({ op: 'birthday.cron.disabled.skip', companyId });
      return;
    }

    const celebrants = await this.birthdays.getTodaysBirthdays(companyId);
    if (!celebrants.length) return;

    const authorId = await this.resolveAuthor(companyId);
    if (!authorId) {
      this.logger.warn({
        op: 'birthday.cron.no_author.skip',
        companyId,
        reason: 'no HR/admin user to attribute the announcement to',
      });
      return;
    }

    const today = new Date().toISOString().slice(0, 10);

    for (const celebrant of celebrants) {
      const name = `${celebrant.firstName} ${celebrant.lastName}`;

      // Title carries the date so next year's post is a distinct row and the
      // dedupe-by-title check only suppresses same-day re-runs.
      const title = `🎂 Happy Birthday, ${name}! (${today})`;

      const body = [
        `<p>Today we're celebrating <strong>${escapeHtml(name)}</strong>${
          celebrant.department
            ? ` from ${escapeHtml(celebrant.department)}`
            : ''
        }.</p>`,
        `<p>Drop a comment below to send your birthday wishes! 🎉</p>`,
      ].join('');

      try {
        const created = await this.announcements.createSystemAnnouncement({
          companyId,
          createdBy: authorId,
          title,
          body,
          categoryName: BirthdayCron.CATEGORY,
          pushTitle: `🎂 It's ${name}'s birthday!`,
          pushBody: 'Tap to send your wishes.',
        });

        this.logger.log({
          op: created
            ? 'birthday.cron.announcement.created'
            : 'birthday.cron.announcement.deduped',
          companyId,
          celebrantId: celebrant.employeeId,
        });
      } catch (e: any) {
        this.logger.error({
          op: 'birthday.cron.announcement.failed',
          companyId,
          celebrantId: celebrant.employeeId,
          msg: e?.message,
        });
      }
    }
  }
}

/** Names go into an HTML body; escape them so they can't inject markup. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
