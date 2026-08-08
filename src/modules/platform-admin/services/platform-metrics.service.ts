import { Inject, Injectable } from '@nestjs/common';
import { and, count, desc, eq, gte, sql } from 'drizzle-orm';
import type { db } from 'src/drizzle/types/drizzle';
import { DRIZZLE } from 'src/drizzle/drizzle.module';
import { companies, employees } from 'src/drizzle/schema';
import { payroll } from 'src/modules/payroll/schema/payroll-run.schema';
import { taxFilings } from 'src/modules/payroll/schema/tax.schema';

export type Interval = 'month' | 'week' | 'day';

@Injectable()
export class PlatformMetricsService {
  constructor(@Inject(DRIZZLE) private readonly db: db) {}

  /**
   * Bucket expression for a time series.
   *
   * `interval` is interpolated with sql.raw rather than bound as a parameter:
   * date_trunc's first argument must be a literal, and a bound $1 makes Postgres
   * reject it. Safe because Interval is a closed union validated at the
   * controller — never raw user input.
   *
   * Callers must GROUP BY / ORDER BY the *alias*, not this expression: Drizzle
   * emits a placeholder for a re-used sql template, which Postgres reads as a
   * bare column and rejects with "must appear in the GROUP BY clause".
   */
  private truncExpr(column: any, interval: Interval) {
    return sql<string>`to_char(date_trunc(${sql.raw(`'${interval}'`)}, ${column}), 'YYYY-MM-DD')`;
  }

  /** Headline counters for the overview tiles. */
  async getOverview() {
    const [companyStats] = await this.db
      .select({
        total: count(),
        active: sql<number>`count(*) filter (where ${companies.isActive})::int`,
      })
      .from(companies);

    const [employeeStats] = await this.db
      .select({
        total: count(),
        live: sql<number>`count(*) filter (where ${employees.employmentStatus} in ('probation','active','on_leave','onboarding'))::int`,
      })
      .from(employees);

    // Payroll amounts are plain decimals with no currency column, and
    // companies.currency varies (NGN/USD/EUR/GBP). Summing across companies
    // would mix units, so volume is always grouped by the company's currency.
    const payrollByCurrency = await this.db
      .select({
        currency: companies.currency,
        grossVolume: sql<string>`coalesce(sum(${payroll.grossSalary}), 0)::text`,
        netVolume: sql<string>`coalesce(sum(${payroll.netSalary}), 0)::text`,
        payslipCount: count(),
      })
      .from(payroll)
      .innerJoin(companies, eq(payroll.companyId, companies.id))
      .groupBy(companies.currency);

    const [runStats] = await this.db
      .select({
        totalRuns: sql<number>`count(distinct ${payroll.payrollRunId})::int`,
      })
      .from(payroll);

    // Month-over-month deltas. A tile showing "47 companies" says nothing about
    // whether the business is moving; "47, +6 this month" does.
    const [companyDelta] = await this.db
      .select({
        thisPeriod: sql<number>`count(*) filter (where ${companies.createdAt} >= date_trunc('month', now()))::int`,
        lastPeriod: sql<number>`count(*) filter (where ${companies.createdAt} >= date_trunc('month', now() - interval '1 month') and ${companies.createdAt} < date_trunc('month', now()))::int`,
      })
      .from(companies);

    const [employeeDelta] = await this.db
      .select({
        thisPeriod: sql<number>`count(*) filter (where ${employees.createdAt} >= date_trunc('month', now()))::int`,
        lastPeriod: sql<number>`count(*) filter (where ${employees.createdAt} >= date_trunc('month', now() - interval '1 month') and ${employees.createdAt} < date_trunc('month', now()))::int`,
      })
      .from(employees);

    // Operational health.
    //
    // approval_status and payment_status advance together — markAsInProgress
    // sets approval to 'completed' and payment to 'in-progress' in one
    // statement — so they are reported as two separate counts rather than
    // forced into a single funnel where a run would be double-counted.
    const [pipeline] = await this.db
      .select({
        totalRuns: sql<number>`count(distinct ${payroll.payrollRunId})::int`,
        // Approval side
        approvalPending: sql<number>`count(distinct ${payroll.payrollRunId}) filter (where ${payroll.approvalStatus} = 'pending')::int`,
        approvalApproved: sql<number>`count(distinct ${payroll.payrollRunId}) filter (where ${payroll.approvalStatus} = 'approved')::int`,
        approvalCompleted: sql<number>`count(distinct ${payroll.payrollRunId}) filter (where ${payroll.approvalStatus} = 'completed')::int`,
        // Payment side
        paymentPending: sql<number>`count(distinct ${payroll.payrollRunId}) filter (where ${payroll.paymentStatus} = 'pending')::int`,
        paymentInProgress: sql<number>`count(distinct ${payroll.payrollRunId}) filter (where ${payroll.paymentStatus} = 'in-progress')::int`,
        paymentPaid: sql<number>`count(distinct ${payroll.payrollRunId}) filter (where ${payroll.paymentStatus} = 'paid')::int`,
      })
      .from(payroll);

    // Last completed month vs the one before it. All-time totals answer "how
    // big are we"; this answers "is this month normal", which is the question
    // an ops team actually has.
    const [recent] = await this.db
      .select({
        thisMonth: sql<string>`coalesce(sum(${payroll.grossSalary}) filter (where ${payroll.payrollMonth} = to_char(date_trunc('month', now()) - interval '1 month', 'YYYY-MM')), 0)::text`,
        lastMonth: sql<string>`coalesce(sum(${payroll.grossSalary}) filter (where ${payroll.payrollMonth} = to_char(date_trunc('month', now()) - interval '2 month', 'YYYY-MM')), 0)::text`,
        thisMonthRuns: sql<number>`count(distinct ${payroll.payrollRunId}) filter (where ${payroll.payrollMonth} = to_char(date_trunc('month', now()) - interval '1 month', 'YYYY-MM'))::int`,
        thisMonthCompanies: sql<number>`count(distinct ${payroll.companyId}) filter (where ${payroll.payrollMonth} = to_char(date_trunc('month', now()) - interval '1 month', 'YYYY-MM'))::int`,
        period: sql<string>`to_char(date_trunc('month', now()) - interval '1 month', 'YYYY-MM')`,
      })
      .from(payroll);

    // Companies that have onboarded but never run payroll — the activation gap.
    const [activation] = await this.db
      .select({
        everRanPayroll: sql<number>`count(distinct ${payroll.companyId})::int`,
      })
      .from(payroll);

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

  /** Companies onboarded per interval, plus a running cumulative total. */
  async getCompanyGrowth(interval: Interval = 'month', since?: Date) {
    const bucket = this.truncExpr(companies.createdAt, interval).as('period');

    const rows = await this.db
      .select({ period: bucket, added: count() })
      .from(companies)
      .where(since ? gte(companies.createdAt, since) : undefined)
      .groupBy(sql`1`)
      .orderBy(sql`1`);

    let running = 0;
    return rows.map((r) => {
      running += Number(r.added);
      return { period: r.period, added: Number(r.added), cumulative: running };
    });
  }

  /** Employees onboarded per interval, cumulative, plus current status split. */
  async getEmployeeGrowth(interval: Interval = 'month', since?: Date) {
    const bucket = this.truncExpr(employees.createdAt, interval).as('period');

    const rows = await this.db
      .select({ period: bucket, added: count() })
      .from(employees)
      .where(since ? gte(employees.createdAt, since) : undefined)
      .groupBy(sql`1`)
      .orderBy(sql`1`);

    const statusBreakdown = await this.db
      .select({
        status: employees.employmentStatus,
        total: count(),
      })
      .from(employees)
      .groupBy(employees.employmentStatus);

    let running = 0;
    const series = rows.map((r) => {
      running += Number(r.added);
      return { period: r.period, added: Number(r.added), cumulative: running };
    });

    return { series, statusBreakdown };
  }

  /**
   * Payroll volume per interval, split by currency. Uses payrollDate (the
   * period the run is for) rather than createdAt, so backfilled runs land in
   * the month they belong to.
   */
  async getPayrollVolume(interval: Interval = 'month', since?: Date) {
    const bucket = this.truncExpr(payroll.payrollDate, interval).as('period');

    const rows = await this.db
      .select({
        period: bucket,
        currency: companies.currency,
        gross: sql<string>`coalesce(sum(${payroll.grossSalary}), 0)::text`,
        net: sql<string>`coalesce(sum(${payroll.netSalary}), 0)::text`,
        payslips: count(),
        runs: sql<number>`count(distinct ${payroll.payrollRunId})::int`,
        companiesRun: sql<number>`count(distinct ${payroll.companyId})::int`,
      })
      .from(payroll)
      .innerJoin(companies, eq(payroll.companyId, companies.id))
      .where(
        since
          ? gte(payroll.payrollDate, sql`${since.toISOString().slice(0, 10)}`)
          : undefined,
      )
      // Ordinals: 1 = period bucket, 2 = currency (select order).
      .groupBy(sql`1`, sql`2`)
      .orderBy(sql`1`);

    return rows;
  }

  /**
   * Statutory totals — the compliance story: what Centa has computed and
   * withheld on behalf of Nigerian employers (PAYE, pension, NHF).
   *
   * Grouped by currency for the same reason as volume: payroll rows carry no
   * currency of their own, so cross-tenant sums would mix units.
   */
  async getStatutorySummary() {
    return this.db
      .select({
        currency: companies.currency,
        gross: sql<string>`coalesce(sum(${payroll.grossSalary}), 0)::text`,
        net: sql<string>`coalesce(sum(${payroll.netSalary}), 0)::text`,
        taxableIncome: sql<string>`coalesce(sum(${payroll.taxableIncome}), 0)::text`,
        payeTax: sql<string>`coalesce(sum(${payroll.payeTax}), 0)::text`,
        pensionEmployee: sql<string>`coalesce(sum(${payroll.pensionContribution}), 0)::text`,
        pensionEmployer: sql<string>`coalesce(sum(${payroll.employerPensionContribution}), 0)::text`,
        nhf: sql<string>`coalesce(sum(${payroll.nhfContribution}), 0)::text`,
        bonuses: sql<string>`coalesce(sum(${payroll.bonuses}), 0)::text`,
        salaryAdvance: sql<string>`coalesce(sum(${payroll.salaryAdvance}), 0)::text`,
        customDeductions: sql<string>`coalesce(sum(${payroll.customDeductions}), 0)::text`,
        totalDeductions: sql<string>`coalesce(sum(${payroll.totalDeductions}), 0)::text`,
        payslips: count(),
        employeesPaid: sql<number>`count(distinct ${payroll.employeeId})::int`,
        companiesPaying: sql<number>`count(distinct ${payroll.companyId})::int`,
      })
      .from(payroll)
      .innerJoin(companies, eq(payroll.companyId, companies.id))
      .groupBy(companies.currency);
  }

  /** Statutory contributions per period, for the trend chart. */
  async getStatutoryTrend(interval: Interval = 'month', since?: Date) {
    const bucket = this.truncExpr(payroll.payrollDate, interval).as('period');

    return this.db
      .select({
        period: bucket,
        currency: companies.currency,
        payeTax: sql<string>`coalesce(sum(${payroll.payeTax}), 0)::text`,
        pension: sql<string>`coalesce(sum(${payroll.pensionContribution} + ${payroll.employerPensionContribution}), 0)::text`,
        nhf: sql<string>`coalesce(sum(${payroll.nhfContribution}), 0)::text`,
      })
      .from(payroll)
      .innerJoin(companies, eq(payroll.companyId, companies.id))
      .where(
        since
          ? gte(payroll.payrollDate, sql`${since.toISOString().slice(0, 10)}`)
          : undefined,
      )
      // Ordinals: 1 = period bucket, 2 = currency (select order).
      .groupBy(sql`1`, sql`2`)
      .orderBy(sql`1`);
  }

  /**
   * Operational exceptions — the things a platform team needs to act on today.
   *
   * Deliberately not aggregates. Each row names a company and a problem:
   * payroll that didn't run, money that hasn't moved, filings past due, and
   * signups that never activated. This is what an ops console leads with;
   * totals answer "how are we doing", exceptions answer "what do I do now".
   */
  async getExceptions() {
    const rows = await this.db.execute(sql`
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

    return (rows as any).rows ?? rows;
  }

  /**
   * Remittance coverage: every statutory obligation Centa computed, matched
   * against whether a filing exists for it.
   *
   * The obligation set is derived from payroll (company × month × tax type
   * where an amount was actually computed) and LEFT JOINed to tax_filings, so
   * a missing filing shows up as a row rather than as an absence. Filing-side
   * counts alone can never reveal what was never filed.
   */
  async getRemittanceCoverage() {
    const rows = await this.db.execute(sql`
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

    return (rows as any).rows ?? rows;
  }

  /**
   * Remittance status from tax_filings — whether what was withheld has actually
   * been filed with FIRS / the PFAs, which is the part employers are liable for.
   */
  async getRemittances() {
    const byTypeStatus = await this.db
      .select({
        taxType: taxFilings.taxType,
        status: taxFilings.status,
        filings: count(),
      })
      .from(taxFilings)
      .groupBy(taxFilings.taxType, taxFilings.status);

    const recent = await this.db
      .select({
        id: taxFilings.id,
        taxType: taxFilings.taxType,
        status: taxFilings.status,
        payrollMonth: taxFilings.payrollMonth,
        referenceNumber: taxFilings.referenceNumber,
        submittedAt: taxFilings.submittedAt,
        approvedAt: taxFilings.approvedAt,
        companyName: companies.name,
      })
      .from(taxFilings)
      .innerJoin(companies, eq(taxFilings.companyId, companies.id))
      .orderBy(desc(taxFilings.createdAt))
      .limit(10);

    return { byTypeStatus, recent };
  }

  /**
   * Leaderboard for the overview: the companies driving the most volume.
   * Grouped by currency alongside the amount so the figures stay comparable.
   */
  async getTopCompanies(limit = 6) {
    return this.db
      .select({
        id: companies.id,
        name: companies.name,
        currency: companies.currency,
        gross: sql<string>`coalesce(sum(${payroll.grossSalary}), 0)::text`,
        payslips: count(),
        runs: sql<number>`count(distinct ${payroll.payrollRunId})::int`,
      })
      .from(payroll)
      .innerJoin(companies, eq(payroll.companyId, companies.id))
      .groupBy(companies.id, companies.name, companies.currency)
      .orderBy(desc(sql`sum(${payroll.grossSalary})`))
      .limit(limit);
  }

  /**
   * Adoption funnel: signed up -> activated -> still running payroll.
   *
   * "Activated" means a company has ever produced a payslip; "currently active"
   * means it produced one in the last 60 days. The gap between those two is the
   * number that matters — companies that onboarded, ran payroll once, and then
   * stopped are churn that a cumulative signup chart hides entirely.
   *
   * Time-to-activate is reported as a median rather than a mean: a handful of
   * companies that sign up and run payroll months later would drag an average
   * well past anything a typical company experiences.
   */
  async getAdoptionFunnel() {
    // Raw column names inside the CTE: Drizzle expands a column reference to
    // "payroll"."payroll_date", which is not valid once the table is aliased.
    // The pg driver returns a QueryResult, so rows come off `.rows` rather
    // than the result itself being iterable.
    const result = await this.db.execute<{
      signed_up: number;
      activated: number;
      currently_active: number;
      median_days_to_activate: number | null;
    }>(sql`
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
      // Null when nothing has activated yet — the UI shows a dash rather than
      // implying a zero-day activation.
      medianDaysToActivate: median === null || median === undefined ? null : Math.round(Number(median)),
      /**
       * Not yet instrumented. Payroll runs carry no start/finish timestamps and
       * there is no run-failure log, so average processing time and error rate
       * cannot be computed from existing rows. Surfaced explicitly so the UI can
       * say so rather than render a fabricated trend.
       */
      instrumented: {
        processingTime: false,
        errorRate: false,
      },
    };
  }

  /** Per-company table: plan, country, live headcount, last payroll date. */
  async getCompanyList(limit = 100, offset = 0) {
    const liveEmployeeCount = this.db
      .select({
        companyId: employees.companyId,
        liveCount: count().as('live_count'),
      })
      .from(employees)
      .where(
        sql`${employees.employmentStatus} in ('probation','active','on_leave','onboarding')`,
      )
      .groupBy(employees.companyId)
      .as('live_employees');

    const lastPayroll = this.db
      .select({
        companyId: payroll.companyId,
        lastPayrollDate: sql<string>`max(${payroll.payrollDate})`.as(
          'last_payroll_date',
        ),
      })
      .from(payroll)
      .groupBy(payroll.companyId)
      .as('last_payroll');

    const [{ total }] = await this.db
      .select({ total: count() })
      .from(companies);

    const rows = await this.db
      .select({
        id: companies.id,
        name: companies.name,
        domain: companies.domain,
        country: companies.country,
        currency: companies.currency,
        plan: companies.subscriptionPlan,
        isActive: companies.isActive,
        createdAt: companies.createdAt,
        trialEndsAt: companies.trialEndsAt,
        liveEmployees: sql<number>`coalesce(${liveEmployeeCount.liveCount}, 0)::int`,
        lastPayrollDate: lastPayroll.lastPayrollDate,
      })
      .from(companies)
      .leftJoin(liveEmployeeCount, eq(companies.id, liveEmployeeCount.companyId))
      .leftJoin(lastPayroll, eq(companies.id, lastPayroll.companyId))
      .orderBy(desc(companies.createdAt))
      .limit(limit)
      .offset(offset);

    return { total, limit, offset, rows };
  }
}
