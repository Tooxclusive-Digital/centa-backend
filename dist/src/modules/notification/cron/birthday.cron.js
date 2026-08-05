"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var BirthdayCron_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BirthdayCron = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const drizzle_module_1 = require("../../../drizzle/drizzle.module");
const drizzle_orm_1 = require("drizzle-orm");
const schema_1 = require("../../../drizzle/schema");
const users_schema_1 = require("../../auth/schema/users.schema");
const permissions_schema_1 = require("../../auth/permissions/schema/permissions.schema");
const birthdays_service_1 = require("../../core/employees/birthdays/birthdays.service");
const announcement_service_1 = require("../../announcement/announcement.service");
const company_settings_service_1 = require("../../../company-settings/company-settings.service");
let BirthdayCron = BirthdayCron_1 = class BirthdayCron {
    constructor(db, birthdays, announcements, settings) {
        this.db = db;
        this.birthdays = birthdays;
        this.announcements = announcements;
        this.settings = settings;
        this.logger = new common_1.Logger(BirthdayCron_1.name);
    }
    async runDailyBirthdays() {
        this.logger.log({ op: 'birthday.cron.start' });
        const allCompanies = await this.db
            .select({ id: schema_1.companies.id, name: schema_1.companies.name })
            .from(schema_1.companies)
            .execute();
        for (const company of allCompanies) {
            try {
                await this.runForCompany(company.id);
            }
            catch (e) {
                this.logger.error({
                    op: 'birthday.cron.company.failed',
                    companyId: company.id,
                    msg: e?.message,
                }, e?.stack);
            }
        }
        this.logger.log({ op: 'birthday.cron.done' });
    }
    async resolveAuthor(companyId) {
        const [author] = await this.db
            .select({ id: users_schema_1.users.id })
            .from(users_schema_1.users)
            .innerJoin(permissions_schema_1.companyRoles, (0, drizzle_orm_1.eq)(permissions_schema_1.companyRoles.id, users_schema_1.users.companyRoleId))
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(users_schema_1.users.companyId, companyId), (0, drizzle_orm_1.inArray)(permissions_schema_1.companyRoles.name, BirthdayCron_1.HR_ROLES)))
            .limit(1)
            .execute();
        return author?.id ?? null;
    }
    async runForCompany(companyId) {
        const enabled = await this.settings.getSettingsOrDefaults(companyId, BirthdayCron_1.SETTING_KEY, false);
        if (enabled !== true && enabled !== 'true') {
            this.logger.debug({ op: 'birthday.cron.disabled.skip', companyId });
            return;
        }
        const celebrants = await this.birthdays.getTodaysBirthdays(companyId);
        if (!celebrants.length)
            return;
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
            const title = `🎂 Happy Birthday, ${name}! (${today})`;
            const body = [
                `<p>Today we're celebrating <strong>${escapeHtml(name)}</strong>${celebrant.department
                    ? ` from ${escapeHtml(celebrant.department)}`
                    : ''}.</p>`,
                `<p>Drop a comment below to send your birthday wishes! 🎉</p>`,
            ].join('');
            try {
                const created = await this.announcements.createSystemAnnouncement({
                    companyId,
                    createdBy: authorId,
                    title,
                    body,
                    categoryName: BirthdayCron_1.CATEGORY,
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
            }
            catch (e) {
                this.logger.error({
                    op: 'birthday.cron.announcement.failed',
                    companyId,
                    celebrantId: celebrant.employeeId,
                    msg: e?.message,
                });
            }
        }
    }
};
exports.BirthdayCron = BirthdayCron;
BirthdayCron.HR_ROLES = ['super_admin', 'admin', 'hr_manager'];
BirthdayCron.CATEGORY = 'Celebrations';
BirthdayCron.SETTING_KEY = 'announcements.birthday_enabled';
__decorate([
    (0, schedule_1.Cron)('0 08 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BirthdayCron.prototype, "runDailyBirthdays", null);
exports.BirthdayCron = BirthdayCron = BirthdayCron_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(drizzle_module_1.DRIZZLE)),
    __metadata("design:paramtypes", [Object, birthdays_service_1.BirthdaysService,
        announcement_service_1.AnnouncementService,
        company_settings_service_1.CompanySettingsService])
], BirthdayCron);
function escapeHtml(value) {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
//# sourceMappingURL=birthday.cron.js.map