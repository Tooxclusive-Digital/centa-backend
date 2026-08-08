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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlatformFilingService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_module_1 = require("../../../drizzle/drizzle.module");
const schema_1 = require("../../../drizzle/schema");
const tax_schema_1 = require("../../payroll/schema/tax.schema");
const schema_2 = require("../schema");
const OBLIGATION_AMOUNT = {
    PAYE: 'sum(paye_tax)',
    Pension: 'sum(pension_contribution + employer_pension_contribution)',
    NHF: 'sum(nhf_contribution)',
};
let PlatformFilingService = class PlatformFilingService {
    constructor(db) {
        this.db = db;
    }
    async recordFiling(dto, admin, ip) {
        const [company] = await this.db
            .select({ id: schema_1.companies.id, name: schema_1.companies.name })
            .from(schema_1.companies)
            .where((0, drizzle_orm_1.eq)(schema_1.companies.id, dto.companyId));
        if (!company)
            throw new common_1.NotFoundException('Company not found');
        const amountExpr = OBLIGATION_AMOUNT[dto.taxType];
        const obligation = await this.db.execute((0, drizzle_orm_1.sql) `
      select coalesce(${drizzle_orm_1.sql.raw(amountExpr)}, 0)::text as amount
      from payroll
      where company_id = ${dto.companyId}
        and payroll_month = ${dto.payrollMonth}
      having coalesce(${drizzle_orm_1.sql.raw(amountExpr)}, 0) > 0
    `);
        const rows = obligation.rows ?? obligation;
        if (!rows.length) {
            throw new common_1.NotFoundException(`No ${dto.taxType} obligation found for ${company.name} in ${dto.payrollMonth}`);
        }
        const amount = rows[0].amount;
        const existing = await this.db
            .select({ id: tax_schema_1.taxFilings.id, status: tax_schema_1.taxFilings.status })
            .from(tax_schema_1.taxFilings)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(tax_schema_1.taxFilings.companyId, dto.companyId), (0, drizzle_orm_1.eq)(tax_schema_1.taxFilings.payrollMonth, dto.payrollMonth), (0, drizzle_orm_1.sql) `lower(${tax_schema_1.taxFilings.taxType}) = lower(${dto.taxType})`));
        if (existing.length > 0) {
            throw new common_1.ConflictException(`A ${dto.taxType} filing already exists for ${company.name} in ${dto.payrollMonth}`);
        }
        const submittedAt = dto.submittedAt ? new Date(dto.submittedAt) : new Date();
        const anchor = await this.db.execute((0, drizzle_orm_1.sql) `
      select id
      from payroll
      where company_id = ${dto.companyId}
        and payroll_month = ${dto.payrollMonth}
      limit 1
    `);
        const anchorRows = anchor.rows ?? anchor;
        const payrollId = anchorRows[0]?.id;
        if (!payrollId) {
            throw new common_1.NotFoundException('No payroll rows found for that period');
        }
        const [inserted] = await this.db
            .insert(tax_schema_1.taxFilings)
            .values({
            payrollId,
            companyId: dto.companyId,
            taxType: dto.taxType,
            payrollMonth: dto.payrollMonth,
            companyTin: '',
            referenceNumber: dto.referenceNumber,
            status: 'completed',
            submittedAt,
        })
            .returning({ id: tax_schema_1.taxFilings.id });
        await this.db.insert(schema_2.platformAuditLogs).values({
            adminId: admin.id,
            adminEmail: admin.email,
            action: 'record_filing',
            entity: 'tax_filing',
            entityId: inserted.id,
            details: dto.note ??
                `${dto.taxType} filing recorded for ${company.name} (${dto.payrollMonth})`,
            changes: {
                companyId: dto.companyId,
                companyName: company.name,
                payrollMonth: dto.payrollMonth,
                taxType: dto.taxType,
                amount,
                referenceNumber: dto.referenceNumber,
                submittedAt: submittedAt.toISOString(),
            },
            ipAddress: ip,
        });
        return {
            success: true,
            filingId: inserted.id,
            companyName: company.name,
            payrollMonth: dto.payrollMonth,
            taxType: dto.taxType,
            amount,
            referenceNumber: dto.referenceNumber,
            submittedAt: submittedAt.toISOString(),
        };
    }
    async getAuditLog(limit = 50) {
        return this.db
            .select()
            .from(schema_2.platformAuditLogs)
            .orderBy((0, drizzle_orm_1.sql) `${schema_2.platformAuditLogs.timestamp} desc`)
            .limit(limit);
    }
};
exports.PlatformFilingService = PlatformFilingService;
exports.PlatformFilingService = PlatformFilingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(drizzle_module_1.DRIZZLE)),
    __metadata("design:paramtypes", [Object])
], PlatformFilingService);
//# sourceMappingURL=platform-filing.service.js.map