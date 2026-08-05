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
var BirthdaysService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BirthdaysService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_module_1 = require("../../../../drizzle/drizzle.module");
const drizzle_orm_1 = require("drizzle-orm");
const employee_schema_1 = require("../schema/employee.schema");
const profile_schema_1 = require("../schema/profile.schema");
const schema_1 = require("../../../../drizzle/schema");
const cache_service_1 = require("../../../../common/cache/cache.service");
let BirthdaysService = BirthdaysService_1 = class BirthdaysService {
    constructor(db, cache) {
        this.db = db;
        this.cache = cache;
        this.logger = new common_1.Logger(BirthdaysService_1.name);
        this.ttlSeconds = 60 * 60 * 6;
    }
    async getUpcomingBirthdays(companyId, windowDays = 30) {
        return this.cache.getOrSetVersioned(companyId, ['company', 'birthdays', String(windowDays)], async () => {
            const yearsToThisYear = (0, drizzle_orm_1.sql) `
          ((EXTRACT(YEAR FROM CURRENT_DATE)::int
            - EXTRACT(YEAR FROM ${profile_schema_1.employeeProfiles.dateOfBirth})::int) * INTERVAL '1 year')
        `;
            const thisYear = (0, drizzle_orm_1.sql) `(${profile_schema_1.employeeProfiles.dateOfBirth} + ${yearsToThisYear})::date`;
            const nextYear = (0, drizzle_orm_1.sql) `
          (${profile_schema_1.employeeProfiles.dateOfBirth}
            + ((EXTRACT(YEAR FROM CURRENT_DATE)::int
              - EXTRACT(YEAR FROM ${profile_schema_1.employeeProfiles.dateOfBirth})::int + 1) * INTERVAL '1 year'))::date
        `;
            const nextOccurrence = (0, drizzle_orm_1.sql) `
          (CASE WHEN ${thisYear} >= CURRENT_DATE THEN ${thisYear} ELSE ${nextYear} END)
        `;
            const rows = await this.db
                .select({
                employeeId: employee_schema_1.employees.id,
                firstName: employee_schema_1.employees.firstName,
                lastName: employee_schema_1.employees.lastName,
                email: employee_schema_1.employees.email,
                department: schema_1.departments.name,
                birthdayMonthDay: (0, drizzle_orm_1.sql) `TO_CHAR(${profile_schema_1.employeeProfiles.dateOfBirth}, 'MM-DD')`.as('birthday_month_day'),
                nextOccurrence: (0, drizzle_orm_1.sql) `TO_CHAR(${nextOccurrence}, 'YYYY-MM-DD')`.as('next_occurrence'),
                daysAway: (0, drizzle_orm_1.sql) `(${nextOccurrence} - CURRENT_DATE)::int`.as('days_away'),
            })
                .from(profile_schema_1.employeeProfiles)
                .innerJoin(employee_schema_1.employees, (0, drizzle_orm_1.eq)(employee_schema_1.employees.id, profile_schema_1.employeeProfiles.employeeId))
                .leftJoin(schema_1.departments, (0, drizzle_orm_1.eq)(schema_1.departments.id, employee_schema_1.employees.departmentId))
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(employee_schema_1.employees.companyId, companyId), (0, drizzle_orm_1.eq)(employee_schema_1.employees.employmentStatus, 'active'), (0, drizzle_orm_1.sql) `${profile_schema_1.employeeProfiles.dateOfBirth} IS NOT NULL`, (0, drizzle_orm_1.sql) `${profile_schema_1.employeeProfiles.dateOfBirth} < CURRENT_DATE`, (0, drizzle_orm_1.sql) `(${nextOccurrence} - CURRENT_DATE)::int <= ${windowDays}`))
                .orderBy((0, drizzle_orm_1.sql) `days_away ASC`)
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
        }, { ttlSeconds: this.ttlSeconds, tags: [`company:${companyId}:employees`] });
    }
    async getTodaysBirthdays(companyId) {
        const upcoming = await this.getUpcomingBirthdays(companyId, 0);
        return upcoming.filter((b) => b.daysAway === 0);
    }
};
exports.BirthdaysService = BirthdaysService;
exports.BirthdaysService = BirthdaysService = BirthdaysService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(drizzle_module_1.DRIZZLE)),
    __metadata("design:paramtypes", [Object, cache_service_1.CacheService])
], BirthdaysService);
//# sourceMappingURL=birthdays.service.js.map