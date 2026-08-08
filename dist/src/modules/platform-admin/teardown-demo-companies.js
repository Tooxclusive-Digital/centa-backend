"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const pg_1 = require("pg");
const COMMIT = process.argv.includes('--commit');
const tagIndex = process.argv.indexOf('--tag');
const TAG = tagIndex > -1 ? process.argv[tagIndex + 1] : null;
if (TAG && !TAG.startsWith('SEED-')) {
    console.error('Refusing to run: --tag must start with "SEED-"');
    process.exit(1);
}
async function main() {
    if (!process.env.DATABASE_URL)
        throw new Error('DATABASE_URL is not set');
    const pool = new pg_1.Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.PGSSL_DISABLE === '1' ? false : { rejectUnauthorized: false },
    });
    const client = await pool.connect();
    try {
        const predicate = TAG ? `reg_no = $1` : `reg_no like 'SEED-%'`;
        const params = TAG ? [TAG] : [];
        const targets = await client.query(`select id, name, reg_no, created_at from companies where ${predicate} order by created_at`, params);
        if (targets.rows.length === 0) {
            console.log('No seeded companies found. Nothing to do.');
            return;
        }
        const ids = targets.rows.map((r) => r.id);
        const counts = {};
        for (const [label, sql] of [
            ['payroll', `select count(*)::int c from payroll where company_id = any($1)`],
            ['pay_slips', `select count(*)::int c from payslips where company_id = any($1)`],
            ['tax_filings', `select count(*)::int c from tax_filings where company_id = any($1)`],
            ['employee_compensations', `select count(*)::int c from employee_compensations where employee_id in (select id from employees where company_id = any($1))`],
            ['employees', `select count(*)::int c from employees where company_id = any($1)`],
            ['users', `select count(*)::int c from users where company_id = any($1)`],
            ['pay_groups', `select count(*)::int c from pay_groups where company_id = any($1)`],
            ['pay_schedules', `select count(*)::int c from pay_schedules where company_id = any($1)`],
            ['company_settings', `select count(*)::int c from company_settings where company_id = any($1)`],
            ['approval_workflows', `select count(*)::int c from approval_workflows where company_id = any($1)`],
            ['company_roles', `select count(*)::int c from company_roles where company_id = any($1)`],
        ]) {
            const r = await client.query(sql, [ids]).catch(() => ({ rows: [{ c: 0 }] }));
            counts[label] = r.rows[0].c;
        }
        console.log('Companies to remove:');
        targets.rows.forEach((r) => console.log(`  ${r.name}  (${r.reg_no}, joined ${String(r.created_at).slice(0, 10)})`));
        console.log('\nDependent rows:');
        Object.entries(counts).forEach(([k, v]) => console.log(`  ${k.padEnd(20)} ${v.toLocaleString()}`));
        if (!COMMIT) {
            console.log('\n🔍 Dry run — nothing deleted. Re-run with --commit to apply.');
            return;
        }
        await client.query('BEGIN');
        const del = async (sql) => {
            await client.query(sql, [ids]).catch((e) => {
                if (!/does not exist/i.test(e.message))
                    throw e;
            });
        };
        await del(`delete from payslips where company_id = any($1)`);
        await del(`delete from tax_filings where company_id = any($1)`);
        await del(`delete from payroll where company_id = any($1)`);
        await del(`delete from approval_steps where workflow_id in (select id from approval_workflows where company_id = any($1))`);
        await del(`delete from approval_workflows where company_id = any($1)`);
        await del(`delete from employee_compensations where employee_id in (select id from employees where company_id = any($1))`);
        await del(`delete from employees where company_id = any($1)`);
        await del(`delete from pay_groups where company_id = any($1)`);
        await del(`delete from pay_schedules where company_id = any($1)`);
        await del(`delete from company_settings where company_id = any($1)`);
        await del(`delete from users where company_id = any($1)`);
        await del(`delete from company_roles where company_id = any($1)`);
        await del(`delete from companies where id = any($1)`);
        await client.query('COMMIT');
        console.log('\n✅ Removed.');
    }
    catch (err) {
        if (COMMIT)
            await client.query('ROLLBACK').catch(() => { });
        throw err;
    }
    finally {
        client.release();
        await pool.end();
    }
}
main().catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
});
//# sourceMappingURL=teardown-demo-companies.js.map