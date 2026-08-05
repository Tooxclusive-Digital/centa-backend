import type { db } from 'src/drizzle/types/drizzle';
import { BirthdaysService } from 'src/modules/core/employees/birthdays/birthdays.service';
import { AnnouncementService } from 'src/modules/announcement/announcement.service';
import { CompanySettingsService } from 'src/company-settings/company-settings.service';
export declare class BirthdayCron {
    private readonly db;
    private readonly birthdays;
    private readonly announcements;
    private readonly settings;
    private readonly logger;
    private static readonly HR_ROLES;
    private static readonly CATEGORY;
    private static readonly SETTING_KEY;
    constructor(db: db, birthdays: BirthdaysService, announcements: AnnouncementService, settings: CompanySettingsService);
    runDailyBirthdays(): Promise<void>;
    private resolveAuthor;
    private runForCompany;
}
