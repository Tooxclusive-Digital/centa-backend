import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, eq, sql } from 'drizzle-orm';
import type { db } from 'src/drizzle/types/drizzle';
import { DRIZZLE } from 'src/drizzle/drizzle.module';
import { companies } from 'src/drizzle/schema';
import { taxFilings } from 'src/modules/payroll/schema/tax.schema';
import { platformAuditLogs } from '../schema';
import { RecordFilingDto } from '../dto/record-filing.dto';
import { PlatformAdminUser } from '../types/platform-admin.type';

/** Maps a tax type to the payroll columns that constitute its obligation. */
const OBLIGATION_AMOUNT: Record<string, string> = {
  PAYE: 'sum(paye_tax)',
  Pension: 'sum(pension_contribution + employer_pension_contribution)',
  NHF: 'sum(nhf_contribution)',
};

@Injectable()
export class PlatformFilingService {
  constructor(@Inject(DRIZZLE) private readonly db: db) {}

  /**
   * Records that a statutory obligation has been filed.
   *
   * Obligations are derived from payroll rather than stored, so there is no row
   * to update for an unfiled one — this inserts a tax_filings row. Three guards
   * apply before it will write:
   *   1. the company must exist
   *   2. an obligation must actually exist for that company/month/type with a
   *      non-zero amount (you cannot file something never computed)
   *   3. no filing may already exist for that combination (no double-filing)
   */
  async recordFiling(dto: RecordFilingDto, admin: PlatformAdminUser, ip?: string) {
    const [company] = await this.db
      .select({ id: companies.id, name: companies.name })
      .from(companies)
      .where(eq(companies.id, dto.companyId));

    if (!company) throw new NotFoundException('Company not found');

    // Guard 2: confirm the obligation exists and carries a non-zero amount.
    const amountExpr = OBLIGATION_AMOUNT[dto.taxType];
    const obligation = await this.db.execute(sql`
      select coalesce(${sql.raw(amountExpr)}, 0)::text as amount
      from payroll
      where company_id = ${dto.companyId}
        and payroll_month = ${dto.payrollMonth}
      having coalesce(${sql.raw(amountExpr)}, 0) > 0
    `);

    const rows = (obligation as any).rows ?? obligation;
    if (!rows.length) {
      throw new NotFoundException(
        `No ${dto.taxType} obligation found for ${company.name} in ${dto.payrollMonth}`,
      );
    }
    const amount = rows[0].amount as string;

    // Guard 3: reject a second filing for the same obligation. Case-insensitive
    // because tax_type is free text and existing rows are inconsistently cased.
    const existing = await this.db
      .select({ id: taxFilings.id, status: taxFilings.status })
      .from(taxFilings)
      .where(
        and(
          eq(taxFilings.companyId, dto.companyId),
          eq(taxFilings.payrollMonth, dto.payrollMonth),
          sql`lower(${taxFilings.taxType}) = lower(${dto.taxType})`,
        ),
      );

    if (existing.length > 0) {
      throw new ConflictException(
        `A ${dto.taxType} filing already exists for ${company.name} in ${dto.payrollMonth}`,
      );
    }

    const submittedAt = dto.submittedAt ? new Date(dto.submittedAt) : new Date();

    // payroll_id is NOT NULL on tax_filings, so the filing is anchored to a
    // representative payroll row for the period.
    const anchor = await this.db.execute(sql`
      select id
      from payroll
      where company_id = ${dto.companyId}
        and payroll_month = ${dto.payrollMonth}
      limit 1
    `);
    const anchorRows = (anchor as any).rows ?? anchor;
    const payrollId = anchorRows[0]?.id as string | undefined;

    if (!payrollId) {
      throw new NotFoundException('No payroll rows found for that period');
    }

    const [inserted] = await this.db
      .insert(taxFilings)
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
      .returning({ id: taxFilings.id });

    await this.db.insert(platformAuditLogs).values({
      adminId: admin.id,
      adminEmail: admin.email,
      action: 'record_filing',
      entity: 'tax_filing',
      entityId: inserted.id,
      details:
        dto.note ??
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

  /** Recent platform-admin actions, for the audit view. */
  async getAuditLog(limit = 50) {
    return this.db
      .select()
      .from(platformAuditLogs)
      .orderBy(sql`${platformAuditLogs.timestamp} desc`)
      .limit(limit);
  }
}
