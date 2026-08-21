import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { aliasedTable, and, asc, eq, sql } from 'drizzle-orm';
import { Workbook } from 'exceljs';
import type { db } from 'src/drizzle/types/drizzle';
import { DRIZZLE } from 'src/drizzle/drizzle.module';
import {
  departments,
  employees,
  jobRoles,
  termination_reasons,
  termination_types,
} from 'src/drizzle/schema';
import { payroll } from 'src/modules/payroll/schema/payroll-run.schema';
import { payrollYtd } from 'src/modules/payroll/schema/payroll-ytd.schema';
import { taxFilings } from 'src/modules/payroll/schema/tax.schema';
import { leaveBalances } from 'src/modules/leave/schema/leave-balance.schema';
import { leaveRequests } from 'src/modules/leave/schema/leave-requests.schema';
import { leaveTypes } from 'src/modules/leave/schema/leave-types.schema';
import { assets } from 'src/modules/assets/schema/assets.schema';
import {
  employee_termination_checklist,
  termination_sessions,
} from './schema/termination-sessions.schema';

/** Nigerian payroll figures are naira; format so a spreadsheet sums them. */
const MONEY = '#,##0.00';

/** The sections HR can choose between. */
export const RECORD_SECTIONS = [
  'summary',
  'pay',
  'statutory',
  'leave',
  'offboarding',
] as const;
export type RecordSection = (typeof RECORD_SECTIONS)[number];

/**
 * Assembles a leaver's employment record into a workbook.
 *
 * The reason this is an export rather than only a screen: the usual trigger is
 * an outside request — a reference check, a pension query, an auditor, a
 * tribunal — where someone needs a file to send on, not a page to scroll.
 *
 * Sections are selectable because those requests differ. A pension query needs
 * statutory figures and nothing else; sending a full salary history in reply
 * discloses more about the person than the question asked for.
 *
 * Every query is scoped by companyId as well as employeeId: passing only the
 * employee id would let one tenant export another's staff by guessing a UUID.
 */
@Injectable()
export class OffboardingExportService {
  constructor(@Inject(DRIZZLE) private readonly db: db) {}

  /**
   * One date format for the whole workbook.
   *
   * These columns are a mix of types: employment_start_date holds a full ISO
   * timestamp as text, termination_date holds a plain date string, and
   * completed_at is a real timestamp. Written raw they rendered three
   * different ways, and Excel treated the Date objects as numbers.
   */
  private date(value: unknown): string {
    if (!value) return '—';
    const d = value instanceof Date ? value : new Date(String(value));
    if (Number.isNaN(d.getTime())) return String(value);
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC',
    });
  }

  private async getPerson(employeeId: string, companyId: string) {
    const manager = aliasedTable(employees, 'manager');

    const [person] = await this.db
      .select({
        employeeNumber: employees.employeeNumber,
        firstName: employees.firstName,
        lastName: employees.lastName,
        email: employees.email,
        status: employees.employmentStatus,
        startDate: employees.employmentStartDate,
        endDate: employees.employmentEndDate,
        department: departments.name,
        jobRole: jobRoles.title,
        managerFirst: manager.firstName,
        managerLast: manager.lastName,
      })
      .from(employees)
      .leftJoin(departments, eq(employees.departmentId, departments.id))
      .leftJoin(jobRoles, eq(employees.jobRoleId, jobRoles.id))
      .leftJoin(manager, eq(employees.managerId, manager.id))
      .where(
        and(eq(employees.id, employeeId), eq(employees.companyId, companyId)),
      );

    if (!person) throw new NotFoundException('Employee not found');
    return person;
  }

  private async getSession(employeeId: string, companyId: string) {
    const [session] = await this.db
      .select({
        id: termination_sessions.id,
        terminationType: termination_types.name,
        terminationReason: termination_reasons.name,
        terminationDate: termination_sessions.terminationDate,
        eligibleForRehire: termination_sessions.eligibleForRehire,
        status: termination_sessions.status,
        startedAt: termination_sessions.startedAt,
        completedAt: termination_sessions.completedAt,
        notes: termination_sessions.notes,
      })
      .from(termination_sessions)
      .leftJoin(
        termination_types,
        eq(termination_types.id, termination_sessions.terminationType),
      )
      .leftJoin(
        termination_reasons,
        eq(termination_reasons.id, termination_sessions.terminationReason),
      )
      .where(
        and(
          eq(termination_sessions.employeeId, employeeId),
          eq(termination_sessions.companyId, companyId),
        ),
      )
      .orderBy(termination_sessions.startedAt)
      .limit(1);

    return session ?? null;
  }

  /**
   * Tenure in whole months, from start to exit (or today if still on the books).
   * Reported alongside the raw dates rather than instead of them — a reference
   * request usually wants "how long", an auditor wants the dates.
   */
  private tenure(start: string | null, end: string | null): string {
    if (!start) return '—';
    const from = new Date(start);
    const to = end ? new Date(end) : new Date();
    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return '—';
    const months =
      (to.getFullYear() - from.getFullYear()) * 12 +
      (to.getMonth() - from.getMonth());
    if (months < 1) return 'Under 1 month';
    const y = Math.floor(months / 12);
    const m = months % 12;
    return [y ? `${y} year${y > 1 ? 's' : ''}` : '', m ? `${m} month${m > 1 ? 's' : ''}` : '']
      .filter(Boolean)
      .join(' ');
  }

  private async addSummary(
    wb: Workbook,
    employeeId: string,
    companyId: string,
  ) {
    const person = await this.getPerson(employeeId, companyId);
    const session = await this.getSession(employeeId, companyId);

    const sheet = wb.addWorksheet('Summary');
    sheet.columns = [
      { header: 'Field', key: 'field', width: 26 },
      { header: 'Value', key: 'value', width: 48 },
    ];

    const managerName = person.managerFirst
      ? `${person.managerFirst} ${person.managerLast ?? ''}`.trim()
      : '—';
    const exitDate = person.endDate ?? session?.terminationDate ?? null;

    const totals = await this.db
      .select({
        months: sql<number>`count(*)::int`,
        gross: sql<string>`coalesce(sum(${payroll.grossSalary}), 0)::text`,
        net: sql<string>`coalesce(sum(${payroll.netSalary}), 0)::text`,
        paye: sql<string>`coalesce(sum(${payroll.payeTax}), 0)::text`,
        lastMonth: sql<string>`max(${payroll.payrollMonth})`,
      })
      .from(payroll)
      .where(
        and(
          eq(payroll.employeeId, employeeId),
          eq(payroll.companyId, companyId),
        ),
      );

    const paid = totals[0];
    const money = (v: unknown) =>
      Number(v ?? 0).toLocaleString('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 2,
      });

    const rows: Array<[string, unknown]> = [
      ['Employee number', person.employeeNumber],
      ['Name', `${person.firstName} ${person.lastName}`.trim()],
      ['Email', person.email],
      ['Department', person.department ?? '—'],
      ['Job role', person.jobRole ?? '—'],
      ['Manager', managerName],
      ['Employment status', person.status],
      ['Start date', this.date(person.startDate)],
      ['End date', this.date(exitDate)],
      ['Tenure', this.tenure(person.startDate, exitDate)],
      ['Exit type', session?.terminationType ?? '—'],
      // "No Reason Provided" is a placeholder, not a reason: showing it just
      // repeats that the field is empty.
      [
        'Exit reason',
        session?.terminationReason &&
        session.terminationReason !== 'No Reason Provided'
          ? session.terminationReason
          : '—',
      ],
      // Yes/No rather than TRUE/FALSE: this line is read by people outside HR.
      [
        'Eligible for rehire',
        session ? (session.eligibleForRehire ? 'Yes' : 'No') : '—',
      ],
      ['Offboarding status', session?.status ?? 'No offboarding record'],
      ['Offboarding completed', this.date(session?.completedAt)],
      ['', ''],
      ['Months paid', Number(paid?.months ?? 0)],
      ['Total gross paid', money(paid?.gross)],
      ['Total net paid', money(paid?.net)],
      ['Total PAYE withheld', money(paid?.paye)],
      ['Last month paid', paid?.lastMonth ?? '—'],
    ];
    rows.forEach(([field, value]) => sheet.addRow({ field, value }));
    sheet.getRow(1).font = { bold: true };
    sheet.views = [{ state: 'frozen', ySplit: 1 }];
  }

  private async addPay(wb: Workbook, employeeId: string, companyId: string) {
    const payslips = await this.db
      .select({
        payrollMonth: payroll.payrollMonth,
        payrollDate: payroll.payrollDate,
        basic: payroll.basic,
        gross: payroll.grossSalary,
        paye: payroll.payeTax,
        pension: payroll.pensionContribution,
        nhf: payroll.nhfContribution,
        deductions: payroll.totalDeductions,
        net: payroll.netSalary,
        paymentStatus: payroll.paymentStatus,
      })
      .from(payroll)
      .where(
        and(eq(payroll.employeeId, employeeId), eq(payroll.companyId, companyId)),
      )
      .orderBy(asc(payroll.payrollMonth));

    const sheet = wb.addWorksheet('Pay history');
    sheet.columns = [
      { header: 'Month', key: 'payrollMonth', width: 12 },
      { header: 'Pay date', key: 'payrollDate', width: 14 },
      { header: 'Basic', key: 'basic', width: 14, style: { numFmt: MONEY } },
      { header: 'Gross', key: 'gross', width: 14, style: { numFmt: MONEY } },
      { header: 'PAYE', key: 'paye', width: 14, style: { numFmt: MONEY } },
      { header: 'Pension', key: 'pension', width: 14, style: { numFmt: MONEY } },
      { header: 'NHF', key: 'nhf', width: 14, style: { numFmt: MONEY } },
      { header: 'Deductions', key: 'deductions', width: 14, style: { numFmt: MONEY } },
      { header: 'Net pay', key: 'net', width: 14, style: { numFmt: MONEY } },
      { header: 'Payment status', key: 'paymentStatus', width: 16 },
    ];

    const num = (v: unknown) => Number(v ?? 0);
    for (const p of payslips) {
      sheet.addRow({
        payrollMonth: p.payrollMonth,
        payrollDate: this.date(p.payrollDate),
        basic: num(p.basic),
        gross: num(p.gross),
        paye: num(p.paye),
        pension: num(p.pension),
        nhf: num(p.nhf),
        deductions: num(p.deductions),
        net: num(p.net),
        paymentStatus: p.paymentStatus,
      });
    }

    if (payslips.length) {
      const sum = (k: keyof (typeof payslips)[number]) =>
        payslips.reduce((s, p) => s + num(p[k]), 0);
      // The last payslip is the final settlement; called out because that is
      // the figure a leaver or their next employer usually asks about.
      const last = payslips[payslips.length - 1];
      sheet.addRow({});
      const totals = sheet.addRow({
        payrollMonth: 'Total',
        basic: sum('basic'),
        gross: sum('gross'),
        paye: sum('paye'),
        pension: sum('pension'),
        nhf: sum('nhf'),
        deductions: sum('deductions'),
        net: sum('net'),
      });
      totals.font = { bold: true };
      const final = sheet.addRow({
        payrollMonth: 'Final settlement',
        payrollDate: this.date(last.payrollDate),
        gross: num(last.gross),
        net: num(last.net),
        paymentStatus: last.paymentStatus,
      });
      final.font = { italic: true };
    } else {
      sheet.addRow({ payrollMonth: 'No payroll records for this employee' });
    }
    sheet.getRow(1).font = { bold: true };
    sheet.views = [{ state: 'frozen', ySplit: 1 }];
  }

  private async addStatutory(
    wb: Workbook,
    employeeId: string,
    companyId: string,
  ) {
    const ytd = await this.db
      .select({
        year: payrollYtd.year,
        payrollMonth: payrollYtd.payrollMonth,
        gross: payrollYtd.grossSalary,
        paye: payrollYtd.PAYE,
        pension: payrollYtd.pension,
        employerPension: payrollYtd.employerPension,
        nhf: payrollYtd.nhf,
      })
      .from(payrollYtd)
      .where(
        and(
          eq(payrollYtd.employeeId, employeeId),
          eq(payrollYtd.companyId, companyId),
        ),
      )
      .orderBy(asc(payrollYtd.payrollMonth));

    const sheet = wb.addWorksheet('Statutory');
    sheet.columns = [
      { header: 'Year', key: 'year', width: 10 },
      { header: 'Month', key: 'payrollMonth', width: 12 },
      { header: 'Gross', key: 'gross', width: 14, style: { numFmt: MONEY } },
      { header: 'PAYE', key: 'paye', width: 14, style: { numFmt: MONEY } },
      { header: 'Pension (employee)', key: 'pension', width: 18, style: { numFmt: MONEY } },
      { header: 'Pension (employer)', key: 'employerPension', width: 18, style: { numFmt: MONEY } },
      { header: 'NHF', key: 'nhf', width: 14, style: { numFmt: MONEY } },
    ];

    const num = (v: unknown) => Number(v ?? 0);
    for (const r of ytd) {
      sheet.addRow({
        year: r.year,
        payrollMonth: r.payrollMonth,
        gross: num(r.gross),
        paye: num(r.paye),
        pension: num(r.pension),
        employerPension: num(r.employerPension),
        nhf: num(r.nhf),
      });
    }
    if (!ytd.length) {
      sheet.addRow({ year: 'No year-to-date records for this employee' });
    }

    // Company filings covering the months this person was paid: evidence that
    // what was withheld from them was actually remitted.
    const months = new Set(ytd.map((r) => r.payrollMonth));
    if (months.size) {
      const filings = await this.db
        .select({
          payrollMonth: taxFilings.payrollMonth,
          taxType: taxFilings.taxType,
          referenceNumber: taxFilings.referenceNumber,
          status: taxFilings.status,
          submittedAt: taxFilings.submittedAt,
        })
        .from(taxFilings)
        .where(eq(taxFilings.companyId, companyId))
        .orderBy(asc(taxFilings.payrollMonth));

      const relevant = filings.filter((f) => months.has(f.payrollMonth));
      sheet.addRow({});
      const header = sheet.addRow({ year: 'Company filings covering these months' });
      header.font = { bold: true };
      sheet.addRow({ year: 'Month', payrollMonth: 'Type', gross: 'Reference', paye: 'Status', pension: 'Submitted' });
      if (relevant.length) {
        for (const f of relevant) {
          sheet.addRow({
            year: f.payrollMonth,
            payrollMonth: f.taxType,
            gross: f.referenceNumber ?? '—',
            paye: f.status ?? '—',
            pension: this.date(f.submittedAt),
          });
        }
      } else {
        sheet.addRow({ year: 'No filings recorded for these months' });
      }
    }

    sheet.getRow(1).font = { bold: true };
    sheet.views = [{ state: 'frozen', ySplit: 1 }];
  }

  private async addLeave(wb: Workbook, employeeId: string, companyId: string) {
    const balances = await this.db
      .select({
        year: leaveBalances.year,
        leaveType: leaveTypes.name,
        entitlement: leaveBalances.entitlement,
        used: leaveBalances.used,
        balance: leaveBalances.balance,
      })
      .from(leaveBalances)
      .leftJoin(leaveTypes, eq(leaveTypes.id, leaveBalances.leaveTypeId))
      .where(
        and(
          eq(leaveBalances.employeeId, employeeId),
          eq(leaveBalances.companyId, companyId),
        ),
      )
      .orderBy(asc(leaveBalances.year));

    const requests = await this.db
      .select({
        leaveType: leaveTypes.name,
        startDate: leaveRequests.startDate,
        endDate: leaveRequests.endDate,
        totalDays: leaveRequests.totalDays,
        status: leaveRequests.status,
        reason: leaveRequests.reason,
      })
      .from(leaveRequests)
      .leftJoin(leaveTypes, eq(leaveTypes.id, leaveRequests.leaveTypeId))
      .where(
        and(
          eq(leaveRequests.employeeId, employeeId),
          eq(leaveRequests.companyId, companyId),
        ),
      )
      .orderBy(asc(leaveRequests.startDate));

    const sheet = wb.addWorksheet('Leave');
    sheet.columns = [
      { header: 'Year / Type', key: 'a', width: 20 },
      { header: 'Entitlement', key: 'b', width: 14 },
      { header: 'Used', key: 'c', width: 12 },
      { header: 'Balance at exit', key: 'd', width: 16 },
      { header: 'Status', key: 'e', width: 14 },
    ];

    const balHeader = sheet.addRow({ a: 'Balances' });
    balHeader.font = { bold: true };
    if (balances.length) {
      for (const b of balances) {
        sheet.addRow({
          a: `${b.year} · ${b.leaveType ?? 'Unknown'}`,
          b: Number(b.entitlement ?? 0),
          c: Number(b.used ?? 0),
          d: Number(b.balance ?? 0),
        });
      }
    } else {
      sheet.addRow({ a: 'No leave balances recorded' });
    }

    sheet.addRow({});
    const reqHeader = sheet.addRow({ a: 'Requests taken' });
    reqHeader.font = { bold: true };
    sheet.addRow({ a: 'Type', b: 'Start', c: 'End', d: 'Days', e: 'Status' });
    if (requests.length) {
      for (const r of requests) {
        sheet.addRow({
          a: r.leaveType ?? 'Unknown',
          b: this.date(r.startDate),
          c: this.date(r.endDate),
          d: Number(r.totalDays ?? 0),
          e: r.status,
        });
      }
    } else {
      sheet.addRow({ a: 'No leave requests recorded' });
    }

    sheet.getRow(1).font = { bold: true };
    sheet.views = [{ state: 'frozen', ySplit: 1 }];
  }

  private async addOffboarding(
    wb: Workbook,
    employeeId: string,
    companyId: string,
  ) {
    const session = await this.getSession(employeeId, companyId);

    const checklist = session
      ? await this.db
          .select({
            name: employee_termination_checklist.name,
            completed: employee_termination_checklist.completed,
          })
          .from(employee_termination_checklist)
          .where(eq(employee_termination_checklist.sessionId, session.id))
      : [];

    // Assets still against this employee. is_deleted is excluded rather than
    // ignored: a written-off laptop is not an outstanding return.
    const held = await this.db
      .select({
        name: assets.name,
        internalId: assets.internalId,
        serialNumber: assets.serialNumber,
        status: assets.status,
        lendDate: assets.lendDate,
        returnDate: assets.returnDate,
      })
      .from(assets)
      .where(
        and(eq(assets.employeeId, employeeId), eq(assets.companyId, companyId)),
      );

    const sheet = wb.addWorksheet('Offboarding');
    sheet.columns = [
      { header: 'Item', key: 'a', width: 44 },
      { header: 'Detail', key: 'b', width: 22 },
      { header: 'Status', key: 'c', width: 16 },
    ];

    const done = checklist.filter((c) => c.completed).length;
    const head = sheet.addRow({
      a: 'Checklist',
      b: checklist.length ? `${done}/${checklist.length} complete` : '—',
    });
    head.font = { bold: true };
    if (checklist.length) {
      checklist.forEach((c) =>
        sheet.addRow({ a: c.name, c: c.completed ? 'Done' : 'Outstanding' }),
      );
    } else {
      sheet.addRow({ a: 'No offboarding checklist recorded' });
    }

    sheet.addRow({});
    const assetHead = sheet.addRow({ a: 'Assets' });
    assetHead.font = { bold: true };
    if (held.length) {
      sheet.addRow({ a: 'Asset', b: 'Serial', c: 'Returned' });
      for (const a of held) {
        sheet.addRow({
          a: `${a.name}${a.internalId ? ` (${a.internalId})` : ''}`,
          b: a.serialNumber ?? '—',
          c: a.returnDate
            ? `Yes · ${this.date(a.returnDate)}`
            : `No · ${a.status ?? 'held'}`,
        });
      }
    } else {
      sheet.addRow({ a: 'No assets assigned' });
    }

    if (session?.notes) {
      sheet.addRow({});
      const noteHead = sheet.addRow({ a: 'Notes' });
      noteHead.font = { bold: true };
      sheet.addRow({ a: session.notes });
    }

    sheet.getRow(1).font = { bold: true };
    sheet.views = [{ state: 'frozen', ySplit: 1 }];
  }

  /**
   * Builds the workbook for the requested sections.
   *
   * Summary is always included: a spreadsheet of salary figures with no name
   * attached to it is worse than useless once it leaves the building.
   */
  async generateWorkbook(
    employeeId: string,
    companyId: string,
    sections: RecordSection[],
  ) {
    const person = await this.getPerson(employeeId, companyId);

    const wb = new Workbook();
    wb.creator = 'Centa HR';
    wb.created = new Date();

    const wanted = new Set<RecordSection>(sections.length ? sections : ['summary']);
    wanted.add('summary');

    await this.addSummary(wb, employeeId, companyId);
    if (wanted.has('pay')) await this.addPay(wb, employeeId, companyId);
    if (wanted.has('statutory')) await this.addStatutory(wb, employeeId, companyId);
    if (wanted.has('leave')) await this.addLeave(wb, employeeId, companyId);
    if (wanted.has('offboarding')) await this.addOffboarding(wb, employeeId, companyId);

    const fullName = `${person.firstName} ${person.lastName}`.trim();
    const safeName = fullName.replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase();
    const buffer = await wb.xlsx.writeBuffer();

    return {
      buffer: Buffer.from(buffer),
      filename: `employment-record-${safeName || employeeId}.xlsx`,
    };
  }
}
