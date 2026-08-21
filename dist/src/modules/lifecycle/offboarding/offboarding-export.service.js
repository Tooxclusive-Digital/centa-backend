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
exports.OffboardingExportService = exports.RECORD_SECTIONS = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const exceljs_1 = require("exceljs");
const drizzle_module_1 = require("../../../drizzle/drizzle.module");
const schema_1 = require("../../../drizzle/schema");
const payroll_run_schema_1 = require("../../payroll/schema/payroll-run.schema");
const payroll_ytd_schema_1 = require("../../payroll/schema/payroll-ytd.schema");
const tax_schema_1 = require("../../payroll/schema/tax.schema");
const leave_balance_schema_1 = require("../../leave/schema/leave-balance.schema");
const leave_requests_schema_1 = require("../../leave/schema/leave-requests.schema");
const leave_types_schema_1 = require("../../leave/schema/leave-types.schema");
const assets_schema_1 = require("../../assets/schema/assets.schema");
const termination_sessions_schema_1 = require("./schema/termination-sessions.schema");
const MONEY = '#,##0.00';
exports.RECORD_SECTIONS = [
    'summary',
    'pay',
    'statutory',
    'leave',
    'offboarding',
];
let OffboardingExportService = class OffboardingExportService {
    constructor(db) {
        this.db = db;
    }
    date(value) {
        if (!value)
            return '—';
        const d = value instanceof Date ? value : new Date(String(value));
        if (Number.isNaN(d.getTime()))
            return String(value);
        return d.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            timeZone: 'UTC',
        });
    }
    async getPerson(employeeId, companyId) {
        const manager = (0, drizzle_orm_1.aliasedTable)(schema_1.employees, 'manager');
        const [person] = await this.db
            .select({
            employeeNumber: schema_1.employees.employeeNumber,
            firstName: schema_1.employees.firstName,
            lastName: schema_1.employees.lastName,
            email: schema_1.employees.email,
            status: schema_1.employees.employmentStatus,
            startDate: schema_1.employees.employmentStartDate,
            endDate: schema_1.employees.employmentEndDate,
            department: schema_1.departments.name,
            jobRole: schema_1.jobRoles.title,
            managerFirst: manager.firstName,
            managerLast: manager.lastName,
        })
            .from(schema_1.employees)
            .leftJoin(schema_1.departments, (0, drizzle_orm_1.eq)(schema_1.employees.departmentId, schema_1.departments.id))
            .leftJoin(schema_1.jobRoles, (0, drizzle_orm_1.eq)(schema_1.employees.jobRoleId, schema_1.jobRoles.id))
            .leftJoin(manager, (0, drizzle_orm_1.eq)(schema_1.employees.managerId, manager.id))
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.employees.id, employeeId), (0, drizzle_orm_1.eq)(schema_1.employees.companyId, companyId)));
        if (!person)
            throw new common_1.NotFoundException('Employee not found');
        return person;
    }
    async getSession(employeeId, companyId) {
        const [session] = await this.db
            .select({
            id: termination_sessions_schema_1.termination_sessions.id,
            terminationType: schema_1.termination_types.name,
            terminationReason: schema_1.termination_reasons.name,
            terminationDate: termination_sessions_schema_1.termination_sessions.terminationDate,
            eligibleForRehire: termination_sessions_schema_1.termination_sessions.eligibleForRehire,
            status: termination_sessions_schema_1.termination_sessions.status,
            startedAt: termination_sessions_schema_1.termination_sessions.startedAt,
            completedAt: termination_sessions_schema_1.termination_sessions.completedAt,
            notes: termination_sessions_schema_1.termination_sessions.notes,
        })
            .from(termination_sessions_schema_1.termination_sessions)
            .leftJoin(schema_1.termination_types, (0, drizzle_orm_1.eq)(schema_1.termination_types.id, termination_sessions_schema_1.termination_sessions.terminationType))
            .leftJoin(schema_1.termination_reasons, (0, drizzle_orm_1.eq)(schema_1.termination_reasons.id, termination_sessions_schema_1.termination_sessions.terminationReason))
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(termination_sessions_schema_1.termination_sessions.employeeId, employeeId), (0, drizzle_orm_1.eq)(termination_sessions_schema_1.termination_sessions.companyId, companyId)))
            .orderBy(termination_sessions_schema_1.termination_sessions.startedAt)
            .limit(1);
        return session ?? null;
    }
    tenure(start, end) {
        if (!start)
            return '—';
        const from = new Date(start);
        const to = end ? new Date(end) : new Date();
        if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()))
            return '—';
        const months = (to.getFullYear() - from.getFullYear()) * 12 +
            (to.getMonth() - from.getMonth());
        if (months < 1)
            return 'Under 1 month';
        const y = Math.floor(months / 12);
        const m = months % 12;
        return [y ? `${y} year${y > 1 ? 's' : ''}` : '', m ? `${m} month${m > 1 ? 's' : ''}` : '']
            .filter(Boolean)
            .join(' ');
    }
    async addSummary(wb, employeeId, companyId) {
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
            months: (0, drizzle_orm_1.sql) `count(*)::int`,
            gross: (0, drizzle_orm_1.sql) `coalesce(sum(${payroll_run_schema_1.payroll.grossSalary}), 0)::text`,
            net: (0, drizzle_orm_1.sql) `coalesce(sum(${payroll_run_schema_1.payroll.netSalary}), 0)::text`,
            paye: (0, drizzle_orm_1.sql) `coalesce(sum(${payroll_run_schema_1.payroll.payeTax}), 0)::text`,
            lastMonth: (0, drizzle_orm_1.sql) `max(${payroll_run_schema_1.payroll.payrollMonth})`,
        })
            .from(payroll_run_schema_1.payroll)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(payroll_run_schema_1.payroll.employeeId, employeeId), (0, drizzle_orm_1.eq)(payroll_run_schema_1.payroll.companyId, companyId)));
        const paid = totals[0];
        const money = (v) => Number(v ?? 0).toLocaleString('en-NG', {
            style: 'currency',
            currency: 'NGN',
            minimumFractionDigits: 2,
        });
        const rows = [
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
            [
                'Exit reason',
                session?.terminationReason &&
                    session.terminationReason !== 'No Reason Provided'
                    ? session.terminationReason
                    : '—',
            ],
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
    async addPay(wb, employeeId, companyId) {
        const payslips = await this.db
            .select({
            payrollMonth: payroll_run_schema_1.payroll.payrollMonth,
            payrollDate: payroll_run_schema_1.payroll.payrollDate,
            basic: payroll_run_schema_1.payroll.basic,
            gross: payroll_run_schema_1.payroll.grossSalary,
            paye: payroll_run_schema_1.payroll.payeTax,
            pension: payroll_run_schema_1.payroll.pensionContribution,
            nhf: payroll_run_schema_1.payroll.nhfContribution,
            deductions: payroll_run_schema_1.payroll.totalDeductions,
            net: payroll_run_schema_1.payroll.netSalary,
            paymentStatus: payroll_run_schema_1.payroll.paymentStatus,
        })
            .from(payroll_run_schema_1.payroll)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(payroll_run_schema_1.payroll.employeeId, employeeId), (0, drizzle_orm_1.eq)(payroll_run_schema_1.payroll.companyId, companyId)))
            .orderBy((0, drizzle_orm_1.asc)(payroll_run_schema_1.payroll.payrollMonth));
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
        const num = (v) => Number(v ?? 0);
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
            const sum = (k) => payslips.reduce((s, p) => s + num(p[k]), 0);
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
        }
        else {
            sheet.addRow({ payrollMonth: 'No payroll records for this employee' });
        }
        sheet.getRow(1).font = { bold: true };
        sheet.views = [{ state: 'frozen', ySplit: 1 }];
    }
    async addStatutory(wb, employeeId, companyId) {
        const ytd = await this.db
            .select({
            year: payroll_ytd_schema_1.payrollYtd.year,
            payrollMonth: payroll_ytd_schema_1.payrollYtd.payrollMonth,
            gross: payroll_ytd_schema_1.payrollYtd.grossSalary,
            paye: payroll_ytd_schema_1.payrollYtd.PAYE,
            pension: payroll_ytd_schema_1.payrollYtd.pension,
            employerPension: payroll_ytd_schema_1.payrollYtd.employerPension,
            nhf: payroll_ytd_schema_1.payrollYtd.nhf,
        })
            .from(payroll_ytd_schema_1.payrollYtd)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(payroll_ytd_schema_1.payrollYtd.employeeId, employeeId), (0, drizzle_orm_1.eq)(payroll_ytd_schema_1.payrollYtd.companyId, companyId)))
            .orderBy((0, drizzle_orm_1.asc)(payroll_ytd_schema_1.payrollYtd.payrollMonth));
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
        const num = (v) => Number(v ?? 0);
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
        const months = new Set(ytd.map((r) => r.payrollMonth));
        if (months.size) {
            const filings = await this.db
                .select({
                payrollMonth: tax_schema_1.taxFilings.payrollMonth,
                taxType: tax_schema_1.taxFilings.taxType,
                referenceNumber: tax_schema_1.taxFilings.referenceNumber,
                status: tax_schema_1.taxFilings.status,
                submittedAt: tax_schema_1.taxFilings.submittedAt,
            })
                .from(tax_schema_1.taxFilings)
                .where((0, drizzle_orm_1.eq)(tax_schema_1.taxFilings.companyId, companyId))
                .orderBy((0, drizzle_orm_1.asc)(tax_schema_1.taxFilings.payrollMonth));
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
            }
            else {
                sheet.addRow({ year: 'No filings recorded for these months' });
            }
        }
        sheet.getRow(1).font = { bold: true };
        sheet.views = [{ state: 'frozen', ySplit: 1 }];
    }
    async addLeave(wb, employeeId, companyId) {
        const balances = await this.db
            .select({
            year: leave_balance_schema_1.leaveBalances.year,
            leaveType: leave_types_schema_1.leaveTypes.name,
            entitlement: leave_balance_schema_1.leaveBalances.entitlement,
            used: leave_balance_schema_1.leaveBalances.used,
            balance: leave_balance_schema_1.leaveBalances.balance,
        })
            .from(leave_balance_schema_1.leaveBalances)
            .leftJoin(leave_types_schema_1.leaveTypes, (0, drizzle_orm_1.eq)(leave_types_schema_1.leaveTypes.id, leave_balance_schema_1.leaveBalances.leaveTypeId))
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(leave_balance_schema_1.leaveBalances.employeeId, employeeId), (0, drizzle_orm_1.eq)(leave_balance_schema_1.leaveBalances.companyId, companyId)))
            .orderBy((0, drizzle_orm_1.asc)(leave_balance_schema_1.leaveBalances.year));
        const requests = await this.db
            .select({
            leaveType: leave_types_schema_1.leaveTypes.name,
            startDate: leave_requests_schema_1.leaveRequests.startDate,
            endDate: leave_requests_schema_1.leaveRequests.endDate,
            totalDays: leave_requests_schema_1.leaveRequests.totalDays,
            status: leave_requests_schema_1.leaveRequests.status,
            reason: leave_requests_schema_1.leaveRequests.reason,
        })
            .from(leave_requests_schema_1.leaveRequests)
            .leftJoin(leave_types_schema_1.leaveTypes, (0, drizzle_orm_1.eq)(leave_types_schema_1.leaveTypes.id, leave_requests_schema_1.leaveRequests.leaveTypeId))
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(leave_requests_schema_1.leaveRequests.employeeId, employeeId), (0, drizzle_orm_1.eq)(leave_requests_schema_1.leaveRequests.companyId, companyId)))
            .orderBy((0, drizzle_orm_1.asc)(leave_requests_schema_1.leaveRequests.startDate));
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
        }
        else {
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
        }
        else {
            sheet.addRow({ a: 'No leave requests recorded' });
        }
        sheet.getRow(1).font = { bold: true };
        sheet.views = [{ state: 'frozen', ySplit: 1 }];
    }
    async addOffboarding(wb, employeeId, companyId) {
        const session = await this.getSession(employeeId, companyId);
        const checklist = session
            ? await this.db
                .select({
                name: termination_sessions_schema_1.employee_termination_checklist.name,
                completed: termination_sessions_schema_1.employee_termination_checklist.completed,
            })
                .from(termination_sessions_schema_1.employee_termination_checklist)
                .where((0, drizzle_orm_1.eq)(termination_sessions_schema_1.employee_termination_checklist.sessionId, session.id))
            : [];
        const held = await this.db
            .select({
            name: assets_schema_1.assets.name,
            internalId: assets_schema_1.assets.internalId,
            serialNumber: assets_schema_1.assets.serialNumber,
            status: assets_schema_1.assets.status,
            lendDate: assets_schema_1.assets.lendDate,
            returnDate: assets_schema_1.assets.returnDate,
        })
            .from(assets_schema_1.assets)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(assets_schema_1.assets.employeeId, employeeId), (0, drizzle_orm_1.eq)(assets_schema_1.assets.companyId, companyId)));
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
            checklist.forEach((c) => sheet.addRow({ a: c.name, c: c.completed ? 'Done' : 'Outstanding' }));
        }
        else {
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
        }
        else {
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
    async generateWorkbook(employeeId, companyId, sections) {
        const person = await this.getPerson(employeeId, companyId);
        const wb = new exceljs_1.Workbook();
        wb.creator = 'Centa HR';
        wb.created = new Date();
        const wanted = new Set(sections.length ? sections : ['summary']);
        wanted.add('summary');
        await this.addSummary(wb, employeeId, companyId);
        if (wanted.has('pay'))
            await this.addPay(wb, employeeId, companyId);
        if (wanted.has('statutory'))
            await this.addStatutory(wb, employeeId, companyId);
        if (wanted.has('leave'))
            await this.addLeave(wb, employeeId, companyId);
        if (wanted.has('offboarding'))
            await this.addOffboarding(wb, employeeId, companyId);
        const fullName = `${person.firstName} ${person.lastName}`.trim();
        const safeName = fullName.replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase();
        const buffer = await wb.xlsx.writeBuffer();
        return {
            buffer: Buffer.from(buffer),
            filename: `employment-record-${safeName || employeeId}.xlsx`,
        };
    }
};
exports.OffboardingExportService = OffboardingExportService;
exports.OffboardingExportService = OffboardingExportService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(drizzle_module_1.DRIZZLE)),
    __metadata("design:paramtypes", [Object])
], OffboardingExportService);
//# sourceMappingURL=offboarding-export.service.js.map