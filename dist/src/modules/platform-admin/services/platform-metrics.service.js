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
exports.PlatformMetricsService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_module_1 = require("../../../drizzle/drizzle.module");
const schema_1 = require("../../../drizzle/schema");
const payroll_run_schema_1 = require("../../payroll/schema/payroll-run.schema");
const tax_schema_1 = require("../../payroll/schema/tax.schema");
let PlatformMetricsService = class PlatformMetricsService {
    constructor(db) {
        this.db = db;
    }
    truncExpr(column, interval) {
        return (0, drizzle_orm_1.sql) `to_char(date_trunc(${drizzle_orm_1.sql.raw(`'${interval}'`)}, ${column}), 'YYYY-MM-DD')`;
    }
    async getOverview() {
        const [companyStats] = await this.db
            .select({
            total: (0, drizzle_orm_1.count)(),
            active: (0, drizzle_orm_1.sql) `count(*) filter (where ${schema_1.companies.isActive})::int`,
        })
            .from(schema_1.companies);
        const [employeeStats] = await this.db
            .select({
            total: (0, drizzle_orm_1.count)(),
            live: (0, drizzle_orm_1.sql) `count(*) filter (where ${schema_1.employees.employmentStatus} in ('probation','active','on_leave','onboarding'))::int`,
        })
            .from(schema_1.employees);
        const payrollByCurrency = await this.db
            .select({
            currency: schema_1.companies.currency,
            grossVolume: (0, drizzle_orm_1.sql) `coalesce(sum(${payroll_run_schema_1.payroll.grossSalary}), 0)::text`,
            netVolume: (0, drizzle_orm_1.sql) `coalesce(sum(${payroll_run_schema_1.payroll.netSalary}), 0)::text`,
            payslipCount: (0, drizzle_orm_1.count)(),
        })
            .from(payroll_run_schema_1.payroll)
            .innerJoin(schema_1.companies, (0, drizzle_orm_1.eq)(payroll_run_schema_1.payroll.companyId, schema_1.companies.id))
            .groupBy(schema_1.companies.currency);
        const [runStats] = await this.db
            .select({
            totalRuns: (0, drizzle_orm_1.sql) `count(distinct ${payroll_run_schema_1.payroll.payrollRunId})::int`,
        })
            .from(payroll_run_schema_1.payroll);
        const [companyDelta] = await this.db
            .select({
            thisPeriod: (0, drizzle_orm_1.sql) `count(*) filter (where ${schema_1.companies.createdAt} >= date_trunc('month', now()))::int`,
            lastPeriod: (0, drizzle_orm_1.sql) `count(*) filter (where ${schema_1.companies.createdAt} >= date_trunc('month', now() - interval '1 month') and ${schema_1.companies.createdAt} < date_trunc('month', now()))::int`,
        })
            .from(schema_1.companies);
        const [employeeDelta] = await this.db
            .select({
            thisPeriod: (0, drizzle_orm_1.sql) `count(*) filter (where ${schema_1.employees.createdAt} >= date_trunc('month', now()))::int`,
            lastPeriod: (0, drizzle_orm_1.sql) `count(*) filter (where ${schema_1.employees.createdAt} >= date_trunc('month', now() - interval '1 month') and ${schema_1.employees.createdAt} < date_trunc('month', now()))::int`,
        })
            .from(schema_1.employees);
        const [pipeline] = await this.db
            .select({
            totalRuns: (0, drizzle_orm_1.sql) `count(distinct ${payroll_run_schema_1.payroll.payrollRunId})::int`,
            approvalPending: (0, drizzle_orm_1.sql) `count(distinct ${payroll_run_schema_1.payroll.payrollRunId}) filter (where ${payroll_run_schema_1.payroll.approvalStatus} = 'pending')::int`,
            approvalApproved: (0, drizzle_orm_1.sql) `count(distinct ${payroll_run_schema_1.payroll.payrollRunId}) filter (where ${payroll_run_schema_1.payroll.approvalStatus} = 'approved')::int`,
            approvalCompleted: (0, drizzle_orm_1.sql) `count(distinct ${payroll_run_schema_1.payroll.payrollRunId}) filter (where ${payroll_run_schema_1.payroll.approvalStatus} = 'completed')::int`,
            paymentPending: (0, drizzle_orm_1.sql) `count(distinct ${payroll_run_schema_1.payroll.payrollRunId}) filter (where ${payroll_run_schema_1.payroll.paymentStatus} = 'pending')::int`,
            paymentInProgress: (0, drizzle_orm_1.sql) `count(distinct ${payroll_run_schema_1.payroll.payrollRunId}) filter (where ${payroll_run_schema_1.payroll.paymentStatus} = 'in-progress')::int`,
            paymentPaid: (0, drizzle_orm_1.sql) `count(distinct ${payroll_run_schema_1.payroll.payrollRunId}) filter (where ${payroll_run_schema_1.payroll.paymentStatus} = 'paid')::int`,
        })
            .from(payroll_run_schema_1.payroll);
        const [recent] = await this.db
            .select({
            thisMonth: (0, drizzle_orm_1.sql) `coalesce(sum(${payroll_run_schema_1.payroll.grossSalary}) filter (where ${payroll_run_schema_1.payroll.payrollMonth} = to_char(date_trunc('month', now()) - interval '1 month', 'YYYY-MM')), 0)::text`,
            lastMonth: (0, drizzle_orm_1.sql) `coalesce(sum(${payroll_run_schema_1.payroll.grossSalary}) filter (where ${payroll_run_schema_1.payroll.payrollMonth} = to_char(date_trunc('month', now()) - interval '2 month', 'YYYY-MM')), 0)::text`,
            thisMonthRuns: (0, drizzle_orm_1.sql) `count(distinct ${payroll_run_schema_1.payroll.payrollRunId}) filter (where ${payroll_run_schema_1.payroll.payrollMonth} = to_char(date_trunc('month', now()) - interval '1 month', 'YYYY-MM'))::int`,
            thisMonthCompanies: (0, drizzle_orm_1.sql) `count(distinct ${payroll_run_schema_1.payroll.companyId}) filter (where ${payroll_run_schema_1.payroll.payrollMonth} = to_char(date_trunc('month', now()) - interval '1 month', 'YYYY-MM'))::int`,
            period: (0, drizzle_orm_1.sql) `to_char(date_trunc('month', now()) - interval '1 month', 'YYYY-MM')`,
        })
            .from(payroll_run_schema_1.payroll);
        const [activation] = await this.db
            .select({
            everRanPayroll: (0, drizzle_orm_1.sql) `count(distinct ${payroll_run_schema_1.payroll.companyId})::int`,
        })
            .from(payroll_run_schema_1.payroll);
        return {
            companies: {
                total: companyStats?.total ?? 0,
                active: companyStats?.active ?? 0,
                addedThisMonth: companyDelta?.thisPeriod ?? 0,
                addedLastMonth: companyDelta?.lastPeriod ?? 0,
                everRanPayroll: activation?.everRanPayroll ?? 0,
            },
            employees: {
                total: employeeStats?.total ?? 0,
                live: employeeStats?.live ?? 0,
                addedThisMonth: employeeDelta?.thisPeriod ?? 0,
                addedLastMonth: employeeDelta?.lastPeriod ?? 0,
            },
            payroll: {
                totalRuns: runStats?.totalRuns ?? 0,
                byCurrency: payrollByCurrency,
                recent: {
                    period: recent?.period ?? '',
                    gross: recent?.thisMonth ?? '0',
                    previousGross: recent?.lastMonth ?? '0',
                    runs: recent?.thisMonthRuns ?? 0,
                    companies: recent?.thisMonthCompanies ?? 0,
                },
                approval: {
                    pending: pipeline?.approvalPending ?? 0,
                    approved: pipeline?.approvalApproved ?? 0,
                    completed: pipeline?.approvalCompleted ?? 0,
                },
                payment: {
                    pending: pipeline?.paymentPending ?? 0,
                    inProgress: pipeline?.paymentInProgress ?? 0,
                    paid: pipeline?.paymentPaid ?? 0,
                },
            },
        };
    }
    async getCompanyGrowth(interval = 'month', since) {
        const bucket = this.truncExpr(schema_1.companies.createdAt, interval).as('period');
        const rows = await this.db
            .select({ period: bucket, added: (0, drizzle_orm_1.count)() })
            .from(schema_1.companies)
            .where(since ? (0, drizzle_orm_1.gte)(schema_1.companies.createdAt, since) : undefined)
            .groupBy((0, drizzle_orm_1.sql) `1`)
            .orderBy((0, drizzle_orm_1.sql) `1`);
        let running = 0;
        return rows.map((r) => {
            running += Number(r.added);
            return { period: r.period, added: Number(r.added), cumulative: running };
        });
    }
    async getEmployeeGrowth(interval = 'month', since) {
        const bucket = this.truncExpr(schema_1.employees.createdAt, interval).as('period');
        const rows = await this.db
            .select({ period: bucket, added: (0, drizzle_orm_1.count)() })
            .from(schema_1.employees)
            .where(since ? (0, drizzle_orm_1.gte)(schema_1.employees.createdAt, since) : undefined)
            .groupBy((0, drizzle_orm_1.sql) `1`)
            .orderBy((0, drizzle_orm_1.sql) `1`);
        const statusBreakdown = await this.db
            .select({
            status: schema_1.employees.employmentStatus,
            total: (0, drizzle_orm_1.count)(),
        })
            .from(schema_1.employees)
            .groupBy(schema_1.employees.employmentStatus);
        let running = 0;
        const series = rows.map((r) => {
            running += Number(r.added);
            return { period: r.period, added: Number(r.added), cumulative: running };
        });
        return { series, statusBreakdown };
    }
    async getPayrollVolume(interval = 'month', since) {
        const bucket = this.truncExpr(payroll_run_schema_1.payroll.payrollDate, interval).as('period');
        const rows = await this.db
            .select({
            period: bucket,
            currency: schema_1.companies.currency,
            gross: (0, drizzle_orm_1.sql) `coalesce(sum(${payroll_run_schema_1.payroll.grossSalary}), 0)::text`,
            net: (0, drizzle_orm_1.sql) `coalesce(sum(${payroll_run_schema_1.payroll.netSalary}), 0)::text`,
            payslips: (0, drizzle_orm_1.count)(),
            runs: (0, drizzle_orm_1.sql) `count(distinct ${payroll_run_schema_1.payroll.payrollRunId})::int`,
            companiesRun: (0, drizzle_orm_1.sql) `count(distinct ${payroll_run_schema_1.payroll.companyId})::int`,
        })
            .from(payroll_run_schema_1.payroll)
            .innerJoin(schema_1.companies, (0, drizzle_orm_1.eq)(payroll_run_schema_1.payroll.companyId, schema_1.companies.id))
            .where(since
            ? (0, drizzle_orm_1.gte)(payroll_run_schema_1.payroll.payrollDate, (0, drizzle_orm_1.sql) `${since.toISOString().slice(0, 10)}`)
            : undefined)
            .groupBy((0, drizzle_orm_1.sql) `1`, (0, drizzle_orm_1.sql) `2`)
            .orderBy((0, drizzle_orm_1.sql) `1`);
        return rows;
    }
    async getStatutorySummary() {
        return this.db
            .select({
            currency: schema_1.companies.currency,
            gross: (0, drizzle_orm_1.sql) `coalesce(sum(${payroll_run_schema_1.payroll.grossSalary}), 0)::text`,
            net: (0, drizzle_orm_1.sql) `coalesce(sum(${payroll_run_schema_1.payroll.netSalary}), 0)::text`,
            taxableIncome: (0, drizzle_orm_1.sql) `coalesce(sum(${payroll_run_schema_1.payroll.taxableIncome}), 0)::text`,
            payeTax: (0, drizzle_orm_1.sql) `coalesce(sum(${payroll_run_schema_1.payroll.payeTax}), 0)::text`,
            pensionEmployee: (0, drizzle_orm_1.sql) `coalesce(sum(${payroll_run_schema_1.payroll.pensionContribution}), 0)::text`,
            pensionEmployer: (0, drizzle_orm_1.sql) `coalesce(sum(${payroll_run_schema_1.payroll.employerPensionContribution}), 0)::text`,
            nhf: (0, drizzle_orm_1.sql) `coalesce(sum(${payroll_run_schema_1.payroll.nhfContribution}), 0)::text`,
            bonuses: (0, drizzle_orm_1.sql) `coalesce(sum(${payroll_run_schema_1.payroll.bonuses}), 0)::text`,
            salaryAdvance: (0, drizzle_orm_1.sql) `coalesce(sum(${payroll_run_schema_1.payroll.salaryAdvance}), 0)::text`,
            customDeductions: (0, drizzle_orm_1.sql) `coalesce(sum(${payroll_run_schema_1.payroll.customDeductions}), 0)::text`,
            totalDeductions: (0, drizzle_orm_1.sql) `coalesce(sum(${payroll_run_schema_1.payroll.totalDeductions}), 0)::text`,
            payslips: (0, drizzle_orm_1.count)(),
            employeesPaid: (0, drizzle_orm_1.sql) `count(distinct ${payroll_run_schema_1.payroll.employeeId})::int`,
            companiesPaying: (0, drizzle_orm_1.sql) `count(distinct ${payroll_run_schema_1.payroll.companyId})::int`,
        })
            .from(payroll_run_schema_1.payroll)
            .innerJoin(schema_1.companies, (0, drizzle_orm_1.eq)(payroll_run_schema_1.payroll.companyId, schema_1.companies.id))
            .groupBy(schema_1.companies.currency);
    }
    async getStatutoryTrend(interval = 'month', since) {
        const bucket = this.truncExpr(payroll_run_schema_1.payroll.payrollDate, interval).as('period');
        return this.db
            .select({
            period: bucket,
            currency: schema_1.companies.currency,
            payeTax: (0, drizzle_orm_1.sql) `coalesce(sum(${payroll_run_schema_1.payroll.payeTax}), 0)::text`,
            pension: (0, drizzle_orm_1.sql) `coalesce(sum(${payroll_run_schema_1.payroll.pensionContribution} + ${payroll_run_schema_1.payroll.employerPensionContribution}), 0)::text`,
            nhf: (0, drizzle_orm_1.sql) `coalesce(sum(${payroll_run_schema_1.payroll.nhfContribution}), 0)::text`,
        })
            .from(payroll_run_schema_1.payroll)
            .innerJoin(schema_1.companies, (0, drizzle_orm_1.eq)(payroll_run_schema_1.payroll.companyId, schema_1.companies.id))
            .where(since
            ? (0, drizzle_orm_1.gte)(payroll_run_schema_1.payroll.payrollDate, (0, drizzle_orm_1.sql) `${since.toISOString().slice(0, 10)}`)
            : undefined)
            .groupBy((0, drizzle_orm_1.sql) `1`, (0, drizzle_orm_1.sql) `2`)
            .orderBy((0, drizzle_orm_1.sql) `1`);
    }
    async getExceptions() {
        const rows = await this.db.execute((0, drizzle_orm_1.sql) `
      with prev_month as (
        select to_char(date_trunc('month', now()) - interval '1 month', 'YYYY-MM') as m
      ),
      -- Companies with active staff that skipped last month's payroll.
      missed as (
        select
          'missed_payroll'                         as kind,
          c.id                                     as company_id,
          c.name                                   as company_name,
          (select m from prev_month)               as detail,
          count(distinct e.id)::int                as magnitude,
          null::numeric                            as amount,
          null::int                                as age_days
        from companies c
        join employees e
          on e.company_id = c.id and e.employment_status = 'active'
        where not exists (
          select 1 from payroll p
          where p.company_id = c.id and p.payroll_month = (select m from prev_month)
        )
        group by c.id, c.name
        having count(distinct e.id) > 0
      ),
      -- Runs whose pay date has passed but money hasn't been marked paid.
      stuck as (
        select
          'unpaid_run'                             as kind,
          c.id                                     as company_id,
          c.name                                   as company_name,
          p.payroll_month                          as detail,
          count(*)::int                            as magnitude,
          sum(p.net_salary)                        as amount,
          max((current_date - p.payroll_date::date))::int as age_days
        from payroll p
        join companies c on c.id = p.company_id
        where p.payment_status <> 'paid'
          and p.payroll_date::date < current_date
        group by c.id, c.name, p.payroll_month
      ),
      -- Statutory amounts computed with no matching filing, rolled up per
      -- company. One row per company rather than per month × tax type: a
      -- company with 18 months of unfiled PAYE is one problem to chase, not
      -- 36, and listing them individually buries every other exception.
      unfiled as (
        select
          'unfiled_statutory'                      as kind,
          c.id                                     as company_id,
          c.name                                   as company_name,
          count(*)::text || ' obligations · oldest ' || min(o.payroll_month) as detail,
          count(*)::int                            as magnitude,
          sum(o.amount)                            as amount,
          max((current_date - to_date(o.payroll_month || '-01', 'YYYY-MM-DD')))::int as age_days
        from (
          select
            p.company_id,
            p.payroll_month,
            t.tax_type,
            case t.tax_type
              when 'PAYE' then sum(p.paye_tax)
              when 'Pension' then sum(p.pension_contribution + p.employer_pension_contribution)
              when 'NHF' then sum(p.nhf_contribution)
            end as amount
          from payroll p
          cross join (values ('PAYE'),('Pension'),('NHF')) as t(tax_type)
          group by p.company_id, p.payroll_month, t.tax_type
        ) o
        join companies c on c.id = o.company_id
        where o.amount > 0
          and not exists (
            select 1 from tax_filings f
            where f.company_id = o.company_id
              and f.payroll_month = o.payroll_month
              and lower(f.tax_type) = lower(o.tax_type)
          )
        group by c.id, c.name
      ),
      -- Signed up, never processed a run. Only flagged after 30 days.
      cold as (
        select
          'never_activated'                        as kind,
          c.id                                     as company_id,
          c.name                                   as company_name,
          to_char(c.created_at, 'Mon YYYY')        as detail,
          0                                        as magnitude,
          null::numeric                            as amount,
          (current_date - c.created_at::date)::int as age_days
        from companies c
        where not exists (select 1 from payroll p where p.company_id = c.id)
          and c.created_at < now() - interval '30 days'
      )
      select
        kind,
        company_id  as "companyId",
        company_name as "companyName",
        detail,
        magnitude,
        coalesce(amount, 0)::text as "amount",
        coalesce(age_days, 0) as "ageDays"
      from (
        select * from missed
        union all select * from stuck
        union all select * from unfiled
        union all select * from cold
      ) x
      order by age_days desc nulls last
    `);
        return rows.rows ?? rows;
    }
    async getRemittanceCoverage() {
        const rows = await this.db.execute((0, drizzle_orm_1.sql) `
      with obligations as (
        select
          p.company_id,
          c.name as company_name,
          p.payroll_month,
          t.tax_type,
          -- Raw column names, not Drizzle column refs: those expand to
          -- "payroll"."paye_tax", which is an invalid reference inside this CTE
          -- where the table is aliased as p.
          case t.tax_type
            when 'PAYE' then sum(p.paye_tax)
            when 'Pension' then sum(p.pension_contribution + p.employer_pension_contribution)
            when 'NHF' then sum(p.nhf_contribution)
          end as amount
        from payroll p
        join companies c on c.id = p.company_id
        cross join (values ('PAYE'),('Pension'),('NHF')) as t(tax_type)
        group by p.company_id, c.name, p.payroll_month, t.tax_type
      )
      select
        o.company_id            as "companyId",
        o.company_name          as "companyName",
        o.payroll_month         as "payrollMonth",
        o.tax_type              as "taxType",
        o.amount::text          as "amount",
        f.id                    as "filingId",
        f.status                as "status",
        f.reference_number      as "referenceNumber",
        f.submitted_at          as "submittedAt",
        f.approved_at           as "approvedAt"
      from obligations o
      left join tax_filings f
        on f.company_id = o.company_id
       and f.payroll_month = o.payroll_month
       and lower(f.tax_type) = lower(o.tax_type)
      where o.amount > 0
      order by o.payroll_month desc, o.company_name, o.tax_type
    `);
        return rows.rows ?? rows;
    }
    async getRemittances() {
        const byTypeStatus = await this.db
            .select({
            taxType: tax_schema_1.taxFilings.taxType,
            status: tax_schema_1.taxFilings.status,
            filings: (0, drizzle_orm_1.count)(),
        })
            .from(tax_schema_1.taxFilings)
            .groupBy(tax_schema_1.taxFilings.taxType, tax_schema_1.taxFilings.status);
        const recent = await this.db
            .select({
            id: tax_schema_1.taxFilings.id,
            taxType: tax_schema_1.taxFilings.taxType,
            status: tax_schema_1.taxFilings.status,
            payrollMonth: tax_schema_1.taxFilings.payrollMonth,
            referenceNumber: tax_schema_1.taxFilings.referenceNumber,
            submittedAt: tax_schema_1.taxFilings.submittedAt,
            approvedAt: tax_schema_1.taxFilings.approvedAt,
            companyName: schema_1.companies.name,
        })
            .from(tax_schema_1.taxFilings)
            .innerJoin(schema_1.companies, (0, drizzle_orm_1.eq)(tax_schema_1.taxFilings.companyId, schema_1.companies.id))
            .orderBy((0, drizzle_orm_1.desc)(tax_schema_1.taxFilings.createdAt))
            .limit(10);
        return { byTypeStatus, recent };
    }
    async getTopCompanies(limit = 6) {
        return this.db
            .select({
            id: schema_1.companies.id,
            name: schema_1.companies.name,
            currency: schema_1.companies.currency,
            gross: (0, drizzle_orm_1.sql) `coalesce(sum(${payroll_run_schema_1.payroll.grossSalary}), 0)::text`,
            payslips: (0, drizzle_orm_1.count)(),
            runs: (0, drizzle_orm_1.sql) `count(distinct ${payroll_run_schema_1.payroll.payrollRunId})::int`,
        })
            .from(payroll_run_schema_1.payroll)
            .innerJoin(schema_1.companies, (0, drizzle_orm_1.eq)(payroll_run_schema_1.payroll.companyId, schema_1.companies.id))
            .groupBy(schema_1.companies.id, schema_1.companies.name, schema_1.companies.currency)
            .orderBy((0, drizzle_orm_1.desc)((0, drizzle_orm_1.sql) `sum(${payroll_run_schema_1.payroll.grossSalary})`))
            .limit(limit);
    }
    async getAdoptionFunnel() {
        const result = await this.db.execute((0, drizzle_orm_1.sql) `
      with first_run as (
        select
          p.company_id            as company_id,
          min(p.payroll_date)     as first_payroll_date,
          max(p.payroll_date)     as last_payroll_date
        from payroll p
        group by p.company_id
      )
      select
        count(*)::int as signed_up,
        count(f.company_id)::int as activated,
        count(*) filter (
          where f.last_payroll_date >= (current_date - interval '60 days')
        )::int as currently_active,
        percentile_cont(0.5) within group (
          order by (f.first_payroll_date::date - c.created_at::date)
        ) as median_days_to_activate
      from companies c
      left join first_run f on f.company_id = c.id
    `);
        const row = result.rows[0];
        const signedUp = Number(row?.signed_up ?? 0);
        const activated = Number(row?.activated ?? 0);
        const currentlyActive = Number(row?.currently_active ?? 0);
        const median = row?.median_days_to_activate;
        return {
            signedUp,
            activated,
            currentlyActive,
            medianDaysToActivate: median === null || median === undefined ? null : Math.round(Number(median)),
            instrumented: {
                processingTime: false,
                errorRate: false,
            },
        };
    }
    async getCompanyList(limit = 100, offset = 0) {
        const liveEmployeeCount = this.db
            .select({
            companyId: schema_1.employees.companyId,
            liveCount: (0, drizzle_orm_1.count)().as('live_count'),
        })
            .from(schema_1.employees)
            .where((0, drizzle_orm_1.sql) `${schema_1.employees.employmentStatus} in ('probation','active','on_leave','onboarding')`)
            .groupBy(schema_1.employees.companyId)
            .as('live_employees');
        const lastPayroll = this.db
            .select({
            companyId: payroll_run_schema_1.payroll.companyId,
            lastPayrollDate: (0, drizzle_orm_1.sql) `max(${payroll_run_schema_1.payroll.payrollDate})`.as('last_payroll_date'),
        })
            .from(payroll_run_schema_1.payroll)
            .groupBy(payroll_run_schema_1.payroll.companyId)
            .as('last_payroll');
        const [{ total }] = await this.db
            .select({ total: (0, drizzle_orm_1.count)() })
            .from(schema_1.companies);
        const rows = await this.db
            .select({
            id: schema_1.companies.id,
            name: schema_1.companies.name,
            domain: schema_1.companies.domain,
            country: schema_1.companies.country,
            currency: schema_1.companies.currency,
            plan: schema_1.companies.subscriptionPlan,
            isActive: schema_1.companies.isActive,
            createdAt: schema_1.companies.createdAt,
            trialEndsAt: schema_1.companies.trialEndsAt,
            liveEmployees: (0, drizzle_orm_1.sql) `coalesce(${liveEmployeeCount.liveCount}, 0)::int`,
            lastPayrollDate: lastPayroll.lastPayrollDate,
        })
            .from(schema_1.companies)
            .leftJoin(liveEmployeeCount, (0, drizzle_orm_1.eq)(schema_1.companies.id, liveEmployeeCount.companyId))
            .leftJoin(lastPayroll, (0, drizzle_orm_1.eq)(schema_1.companies.id, lastPayroll.companyId))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.companies.createdAt))
            .limit(limit)
            .offset(offset);
        return { total, limit, offset, rows };
    }
};
exports.PlatformMetricsService = PlatformMetricsService;
exports.PlatformMetricsService = PlatformMetricsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(drizzle_module_1.DRIZZLE)),
    __metadata("design:paramtypes", [Object])
], PlatformMetricsService);
//# sourceMappingURL=platform-metrics.service.js.map