/**
 * Backfills statutory filings against seeded payroll, to a target compliance rate.
 *
 *   npm run seed:filings                  # dry run — plan only
 *   npm run seed:filings -- --commit
 *   npm run seed:filings -- --rate 98 --commit
 *
 * Mirrors PlatformFilingService.recordFiling exactly: same columns, same
 * 'completed' status, same empty company_tin (companies carry no TIN column).
 * The difference is submitted_at, which is backdated to when the filing would
 * actually have been made rather than set to now.
 *
 * Filing deadline: Nigerian PAYE is due by the 10th of the following month, so
 * each filing lands 1–10 days into the month after the payroll month. Pension
 * and NHF follow the same window here.
 *
 * Only touches obligations that have no filing yet, so re-running tops up
 * rather than duplicating. Removal is by tag: filings created here carry a
 * reference number prefixed FILE-, which real filings never use.
 */
import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';

const COMMIT = process.argv.includes('--commit');
const RATE = (() => {
  const i = process.argv.indexOf('--rate');
  const v = i >= 0 ? Number(process.argv[i + 1]) : 98;
  if (!Number.isFinite(v) || v < 0 || v > 100) {
    throw new Error('--rate must be between 0 and 100');
  }
  return v;
})();

/** Deterministic PRNG so a re-run picks the same companies to leave unfiled. */
function makeRng(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * The date a filing was submitted: 1–10 days into the month AFTER the payroll
 * month, which is the statutory window. Weekends are rolled forward to the
 * Monday — nobody files at a tax office on a Sunday.
 */
function filingDate(payrollMonth: string, rng: () => number): string {
  const [y, m] = payrollMonth.split('-').map(Number);
  const nextY = m === 12 ? y + 1 : y;
  const nextM = m === 12 ? 1 : m + 1;

  const day = 1 + Math.floor(rng() * 10);
  const d = new Date(Date.UTC(nextY, nextM - 1, day));
  const dow = d.getUTCDay();
  if (dow === 0) d.setUTCDate(d.getUTCDate() + 1);
  else if (dow === 6) d.setUTCDate(d.getUTCDate() + 2);

  // Guard: rolling forward from the 10th could cross the deadline, so pull
  // back to the Friday instead of filing late.
  if (d.getUTCDate() > 10) d.setUTCDate(d.getUTCDate() - 3);

  return d.toISOString().slice(0, 19).replace('T', ' ');
}

/** Reference numbers that look like what each authority issues. */
function reference(taxType: string, rng: () => number): string {
  const n = Math.floor(rng() * 9_000_000) + 1_000_000;
  // FILE- prefix marks these as seeded so they can be removed selectively.
  if (taxType === 'PAYE') return `FILE-PAYE-${n}`;
  if (taxType === 'Pension') return `FILE-PFA-${n}`;
  return `FILE-NHF-${n}`;
}

async function main() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl:
      process.env.PGSSL_DISABLE === '1'
        ? false
        : process.env.NODE_ENV === 'production'
          ? false
          : { rejectUnauthorized: false },
  });

  try {
    // Obligations with no filing yet. payroll_id is NOT NULL and FKs to a
    // payslip, so each row carries one from its own period to satisfy it.
    const { rows: pending } = await pool.query<{
      company_id: string;
      company_name: string;
      payroll_month: string;
      tax_type: string;
      amount: string;
      payroll_id: string;
    }>(`
      with obligations as (
        select
          p.company_id,
          c.name as company_name,
          p.payroll_month,
          t.tax_type,
          case t.tax_type
            when 'PAYE' then sum(p.paye_tax)
            when 'Pension' then sum(p.pension_contribution + p.employer_pension_contribution)
            when 'NHF' then sum(p.nhf_contribution)
          end as amount,
          min(p.id::text) as payroll_id
        from payroll p
        join companies c on c.id = p.company_id
        cross join (values ('PAYE'),('Pension'),('NHF')) as t(tax_type)
        group by p.company_id, c.name, p.payroll_month, t.tax_type
      )
      select o.*
      from obligations o
      left join tax_filings f
        on f.company_id = o.company_id
       and f.payroll_month = o.payroll_month
       and lower(f.tax_type) = lower(o.tax_type)
      where o.amount > 0 and f.id is null
      order by o.payroll_month, o.company_name, o.tax_type
    `);

    const { rows: existing } = await pool.query<{ filed: string; total: string }>(`
      with obligations as (
        select p.company_id, p.payroll_month, t.tax_type,
          case t.tax_type
            when 'PAYE' then sum(p.paye_tax)
            when 'Pension' then sum(p.pension_contribution + p.employer_pension_contribution)
            when 'NHF' then sum(p.nhf_contribution)
          end as amount
        from payroll p
        cross join (values ('PAYE'),('Pension'),('NHF')) as t(tax_type)
        group by p.company_id, p.payroll_month, t.tax_type
      )
      select
        count(f.id)::text as filed,
        count(*)::text as total
      from obligations o
      left join tax_filings f
        on f.company_id = o.company_id
       and f.payroll_month = o.payroll_month
       and lower(f.tax_type) = lower(o.tax_type)
      where o.amount > 0
    `);

    const total = Number(existing[0].total);
    const alreadyFiled = Number(existing[0].filed);
    const targetFiled = Math.round((total * RATE) / 100);
    const toFile = Math.max(0, targetFiled - alreadyFiled);

    console.log(`\nObligations         ${total}`);
    console.log(`Already filed       ${alreadyFiled}`);
    console.log(`Target (${RATE}%)       ${targetFiled}`);
    console.log(`To file now         ${toFile}`);
    console.log(`Will remain unfiled ${total - targetFiled}\n`);

    if (toFile === 0) {
      console.log('Nothing to do.');
      return;
    }

    // Which obligations stay unfiled: the most recent ones. A company that has
    // not yet filed last month's PAYE is ordinary; one that never filed a year
    // ago is a different, less believable story.
    const rng = makeRng('filings-v1');
    const chosen = [...pending]
      .sort((a, b) => a.payroll_month.localeCompare(b.payroll_month))
      .slice(0, toFile);

    const byType = chosen.reduce<Record<string, number>>((acc, r) => {
      acc[r.tax_type] = (acc[r.tax_type] ?? 0) + 1;
      return acc;
    }, {});
    console.log('By type:', byType);

    const leftUnfiled = pending.length - chosen.length;
    if (leftUnfiled > 0) {
      const sample = pending
        .slice(chosen.length)
        .slice(0, 5)
        .map((r) => `${r.company_name} · ${r.payroll_month} · ${r.tax_type}`);
      console.log(`\nLeft unfiled (${leftUnfiled}), most recent first:`);
      for (const s of sample) console.log(`  ${s}`);
    }

    if (!COMMIT) {
      const d = chosen[0];
      if (d) {
        console.log(
          `\nExample: ${d.company_name} ${d.payroll_month} ${d.tax_type} ` +
            `→ submitted ${filingDate(d.payroll_month, rng)}`,
        );
      }
      console.log('\n🔍 Dry run — nothing written. Re-run with --commit.');
      return;
    }

    let written = 0;
    for (const o of chosen) {
      const submittedAt = filingDate(o.payroll_month, rng);
      await pool.query(
        `insert into tax_filings
           (id, payroll_id, company_id, tax_type, payroll_month, company_tin,
            reference_number, status, submitted_at, created_at, updated_at)
         values ($1,$2,$3,$4,$5,'',$6,'completed',$7::timestamp,$7::timestamp,$7::timestamp)`,
        [
          randomUUID(),
          o.payroll_id,
          o.company_id,
          o.tax_type,
          o.payroll_month,
          reference(o.tax_type, rng),
          submittedAt,
        ],
      );
      written++;
      if (written % 100 === 0) console.log(`  ${written}/${chosen.length}…`);
    }

    console.log(`\n✅ Filed ${written}. To undo:`);
    console.log(
      `   delete from tax_filings where reference_number like 'FILE-%';`,
    );
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
