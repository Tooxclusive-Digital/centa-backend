"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const core_1 = require("@nestjs/core");
const nestjs_pino_1 = require("nestjs-pino");
const node_crypto_1 = require("node:crypto");
const bcrypt = require("bcryptjs");
const pg_1 = require("pg");
const app_module_1 = require("../../app.module");
const run_service_1 = require("../payroll/run/run.service");
const COMMIT = process.argv.includes('--commit');
const RUN_ID = (0, node_crypto_1.randomUUID)().slice(0, 8);
const TAG = `SEED-${RUN_ID}`;
function drawSalary(medianGross, rng) {
    const r = rng();
    let multiple;
    if (r < 0.45) {
        multiple = 0.35 + rng() * 0.35;
    }
    else if (r < 0.8) {
        multiple = 0.7 + rng() * 0.6;
    }
    else if (r < 0.95) {
        multiple = 1.3 + rng() * 0.9;
    }
    else {
        multiple = 2.2 + rng() * 1.8;
    }
    return Math.max(45_000, Math.round((medianGross * multiple) / 1000) * 1000);
}
const COMPANY_ROSTER = [
    ['Tooxclusive Digital', 27, '2025-05', 17, 1, 0.03, 420_000, true],
    ['Harbourline Logistics Limited', 25, '2025-05', 17, 1, 0.03, 168_000, true],
    ['Ridgeway Foods Nigeria Limited', 28, '2025-06', 16, 2, 0.05, 119_000, true],
    ['Adaeze Textiles Limited', 26, '2025-06', 15, 1, 0.04, 95_000, true],
    ['Volta Manufacturing Nigeria', 26, '2025-07', 27, 2, 0.03, 91_000, true],
    ['Kestrel Advisory Limited', 31, '2025-07', 8, 1, 0.02, 420_000, true],
    ['Marnet Retail Nigeria Limited', 28, '2025-07', 7, 1, 0.06, 105_000, true],
    ['Ikeja Freight Services', 25, '2025-07', 17, 2, 0.04, 115_000, true],
    ['Sahel Agro Nigeria Limited', 30, '2025-08', 19, 2, 0.05, 77_000, true],
    ['Lagoon Health Partners', 28, '2025-08', 11, 1, 0.02, 259_000, true],
    ['Obasi & Sons Trading Limited', 26, '2025-08', 14, 1, 0.04, 101_000, true],
    ['Zenith Craft Nigeria Limited', 27, '2025-09', 15, 2, 0.05, 87_000, true],
    ['Bluewater Marine Services', 25, '2025-09', 20, 2, 0.03, 137_000, true],
    ['Chidera Pharmaceuticals Ltd', 28, '2025-09', 16, 1, 0.03, 161_000, true],
    ['Northgate Energy Nigeria', 31, '2025-10', 12, 1, 0.02, 343_000, true],
    ['Amara Fashion House Limited', 26, '2025-10', 10, 1, 0.07, 76_000, true],
    ['Ogun Steelworks Limited', 25, '2025-10', 24, 2, 0.04, 92_000, true],
    ['Silverline Media Nigeria', 28, '2025-11', 9, 1, 0.05, 147_000, true],
    ['Emeka Motors Limited', 27, '2025-11', 19, 2, 0.04, 112_000, true],
    ['Delta Springs Bottling Co', 26, '2025-11', 18, 2, 0.05, 78_000, true],
    ['Halima Foods Nigeria Limited', 28, '2025-12', 16, 2, 0.06, 84_000, true],
    ['Crestview Properties Limited', 31, '2025-12', 8, 1, 0.02, 294_000, true],
    ['Yaba Tech Solutions Limited', 25, '2026-01', 14, 1, 0.04, 245_000, true],
    ['Oluchi Logistics Nigeria', 26, '2026-01', 18, 2, 0.05, 109_000, true],
    ['Ibadan Millers Limited', 28, '2026-02', 17, 2, 0.04, 85_000, true],
    ['Coral Reef Hospitality Ltd', 27, '2026-02', 15, 2, 0.07, 92_000, true],
    ['Nnamdi Electricals Limited', 25, '2026-03', 13, 1, 0.03, 129_000, true],
    ['Greenfield Farms Nigeria', 26, '2026-03', 16, 2, 0.05, 73_000, true],
    ['Aliyu Security Services Ltd', 28, '2026-04', 20, 2, 0.06, 67_000, true],
    ['Pearl Gate Consulting Limited', 31, '2026-05', 8, 1, 0.02, 329_000, true],
    ['Bayelsa Marine Supplies Ltd', 28, '2026-05', 14, 1, 0.04, 132_000, true],
    ['Folake Interiors Nigeria', 27, '2026-02', 0, 0, 0, 0, false],
    ['Uche Brothers Haulage Ltd', 28, '2026-03', 0, 0, 0, 0, false],
    ['Plateau Dairy Nigeria Limited', 26, '2026-04', 0, 0, 0, 0, false],
    ['Segun Autoworks Limited', 25, '2026-05', 0, 0, 0, 0, false],
    ['Calabar Seafoods Limited', 28, '2026-05', 0, 0, 0, 0, false],
    ['Bisi Catering Services Ltd', 27, '2026-06', 0, 0, 0, 0, false],
    ['Warri Pipe Fittings Nigeria', 26, '2026-06', 0, 0, 0, 0, false],
    ['Temitope Logistics Limited', 25, '2026-06', 0, 0, 0, 0, false],
    ['Jos Highland Farms Limited', 28, '2026-07', 0, 0, 0, 0, false],
    ['Ibekwe Plumbing Nigeria Ltd', 27, '2026-07', 0, 0, 0, 0, false],
    ['Abeokuta Tile Company', 26, '2026-07', 0, 0, 0, 0, false],
    ['Yetunde Beauty Group Limited', 25, '2026-08', 0, 0, 0, 0, false],
    ['Onitsha Spare Parts Limited', 28, '2026-08', 0, 0, 0, 0, false],
    ['Zaria Textile Mills Limited', 26, '2026-06', 0, 0, 0, 0, false],
    ['Owerri Logistics Nigeria Ltd', 27, '2026-06', 0, 0, 0, 0, false],
    ['Benin Foods Processing Ltd', 25, '2026-07', 0, 0, 0, 0, false],
    ['Chioma Interiors Limited', 28, '2026-07', 0, 0, 0, 0, false],
    ['Port Harcourt Marine Ltd', 26, '2026-08', 0, 0, 0, 0, false],
    ['Kaduna Grains Nigeria Limited', 27, '2026-08', 0, 0, 0, 0, false],
];
const JOIN_DAYS = [3, 7, 11, 14, 18, 21, 24, 27];
const COMPANIES = COMPANY_ROSTER.map(([name, payDay, joinMonth, headcount, hires, attrition, medianGross, runsPayroll], i) => {
    const slug = name
        .toLowerCase()
        .replace(/&/g, 'and')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    const joinDay = JOIN_DAYS[i % JOIN_DAYS.length];
    const [jy, jm] = joinMonth.split('-').map(Number);
    const firstY = jm === 12 ? jy + 1 : jy;
    const firstM = jm === 12 ? 1 : jm + 1;
    const firstPayroll = `${firstY}-${String(firstM).padStart(2, '0')}`;
    const appliesNhf = runsPayroll && i % 2 === 0;
    return {
        name,
        domain: slug,
        appliesNhf,
        payDay,
        joined: `${joinMonth}-${String(joinDay).padStart(2, '0')}`,
        employeeStart: `${firstPayroll}-01`,
        firstPayroll,
        startingHeadcount: headcount,
        hiresPerMonth: hires,
        monthlyAttrition: attrition,
        medianGross,
        runsPayroll,
    };
});
const PAYROLL_SETTINGS = {
    'payroll.apply_paye': true,
    'payroll.apply_pension': true,
    'payroll.apply_nhf': false,
    'payroll.apply_nhis': false,
    'payroll.apply_nsitf': false,
    'payroll.basic_percent': 20,
    'payroll.housing_percent': 25,
    'payroll.transport_percent': 10,
    'payroll.default_pension_employee_percent': 8,
    'payroll.default_pension_employer_percent': 10,
    'payroll.default_tax_relief': 200000,
    'payroll.nhf_percent': 2.5,
    'payroll.currency': 'NGN',
    'payroll.pay_day': 28,
    'payroll.pay_cycle': ['monthly'],
    'payroll.multi_level_approval': false,
    'payroll.approver': 'payroll_specialist',
    'payroll.approver_chain': ['hr_manager'],
    'payroll.approval_fallback': ['super_admin', 'hr_director'],
    'payroll.enable_proration': true,
    'payroll.proration_method': 'working_days',
    'payroll.deduction_for_absence': false,
    'payroll.leave_deduction': false,
    'payroll.use_leave': false,
    'payroll.use_loan': false,
    'payroll.use_overtime': false,
    'payroll.enable_13th_month': false,
    'payroll.allowance_others': [],
};
const FIRST_NAMES = [
    'Adaeze', 'Chinedu', 'Ifeoma', 'Emeka', 'Ngozi', 'Tunde', 'Folake', 'Segun', 'Amaka', 'Yusuf',
    'Bisi', 'Kelechi', 'Halima', 'Obinna', 'Zainab', 'Femi', 'Chiamaka', 'Ibrahim', 'Temitope', 'Uche',
    'Aisha', 'Damilola', 'Nnamdi', 'Funmi', 'Suleiman', 'Oluchi', 'Bashir', 'Kemi', 'Ikenna', 'Hauwa',
    'Gbenga', 'Chioma', 'Musa', 'Yetunde', 'Abdul',
];
const LAST_NAMES = [
    'Okafor', 'Adeyemi', 'Balogun', 'Eze', 'Mohammed', 'Okonkwo', 'Abiodun', 'Nwachukwu', 'Bello', 'Ogunleye',
    'Danjuma', 'Chukwu', 'Aliyu', 'Oyelaran', 'Umeh', 'Sanni', 'Ibekwe', 'Lawal', 'Nwosu', 'Adebayo',
];
function makeRng(seed) {
    let h = 2166136261;
    for (const ch of seed) {
        h ^= ch.charCodeAt(0);
        h = Math.imul(h, 16777619);
    }
    return () => {
        h ^= h << 13;
        h ^= h >>> 17;
        h ^= h << 5;
        return ((h >>> 0) % 100000) / 100000;
    };
}
function monthsBetween(startMonth, endMonth) {
    const out = [];
    let [y, m] = startMonth.split('-').map(Number);
    const [ey, em] = endMonth.split('-').map(Number);
    while (y < ey || (y === ey && m <= em)) {
        out.push(`${y}-${String(m).padStart(2, '0')}`);
        m += 1;
        if (m > 12) {
            m = 1;
            y += 1;
        }
    }
    return out;
}
function payableMonths(startMonth, currentMonth, payDay, today) {
    const all = monthsBetween(startMonth, currentMonth);
    const last = all.at(-1);
    if (last !== currentMonth)
        return all;
    const payDate = resolvePayDate(currentMonth, payDay);
    const todayIso = today.toISOString().slice(0, 10);
    return payDate <= todayIso ? all : all.slice(0, -1);
}
function endOfMonth(month) {
    const [y, m] = month.split('-').map(Number);
    return new Date(Date.UTC(y, m, 0)).toISOString().slice(0, 10);
}
function startOfMonth(month) {
    return `${month}-01`;
}
const NG_HOLIDAYS = new Set([
    '2025-12-25', '2025-12-26',
    '2026-12-25', '2026-12-26',
    '2025-10-01', '2026-10-01',
    '2026-05-01', '2025-05-01',
]);
function resolvePayDate(month, payDay) {
    const [y, m] = month.split('-').map(Number);
    const lastDay = new Date(Date.UTC(y, m, 0)).getUTCDate();
    let date = new Date(Date.UTC(y, m - 1, Math.min(payDay, lastDay)));
    for (let guard = 0; guard < 10; guard++) {
        const day = date.getUTCDay();
        const iso = date.toISOString().slice(0, 10);
        const isWeekend = day === 0 || day === 6;
        if (!isWeekend && !NG_HOLIDAYS.has(iso))
            break;
        date = new Date(date.getTime() - 86_400_000);
    }
    return date.toISOString().slice(0, 10);
}
function planWorkforce(spec, months, rng) {
    const people = [];
    const hire = (startMonth) => {
        const person = {
            id: (0, node_crypto_1.randomUUID)(),
            gross: drawSalary(spec.medianGross, rng),
            startMonth,
            endMonth: null,
            startDate: startOfMonth(startMonth),
            endDate: null,
        };
        people.push(person);
        return person;
    };
    for (let i = 0; i < spec.startingHeadcount; i++)
        hire(months[0]);
    for (let i = 1; i < months.length; i++) {
        const month = months[i];
        const employed = people.filter((p) => p.endMonth === null);
        const leavers = Math.floor(employed.length * spec.monthlyAttrition + rng());
        for (let l = 0; l < leavers && employed.length - l > 5; l++) {
            const eligible = employed.filter((p) => p.endMonth === null && p.startMonth < month);
            if (eligible.length === 0)
                break;
            const leaver = eligible[Math.floor(rng() * eligible.length)];
            leaver.endMonth = months[i - 1];
            leaver.endDate = endOfMonth(months[i - 1]);
        }
        for (let h = 0; h < spec.hiresPerMonth; h++)
            hire(month);
    }
    return people;
}
function employedIn(person, month) {
    if (month < person.startMonth)
        return false;
    if (person.endMonth !== null && month > person.endMonth)
        return false;
    return true;
}
async function main() {
    if (!process.env.DATABASE_URL)
        throw new Error('DATABASE_URL is not set');
    const rng = makeRng(RUN_ID);
    const today = new Date();
    const currentMonth = `${today.getUTCFullYear()}-${String(today.getUTCMonth() + 1).padStart(2, '0')}`;
    console.log(`\ntag  ${TAG}\n`);
    let plannedRows = 0;
    let plannedPeople = 0;
    let plannedMonthlyGross = 0;
    const activating = COMPANIES.filter((c) => c.runsPayroll);
    for (const spec of COMPANIES) {
        if (!spec.runsPayroll) {
            console.log(`${spec.name} — joined ${spec.joined} · no payroll run`);
            continue;
        }
        const months = payableMonths(spec.firstPayroll, currentMonth, spec.payDay, today);
        const preview = planWorkforce(spec, months, makeRng(RUN_ID + spec.domain));
        const rows = months.reduce((sum, m) => sum + preview.filter((p) => employedIn(p, m)).length, 0);
        plannedRows += rows;
        plannedPeople += preview.length;
        const finalCount = preview.filter((p) => p.endMonth === null).length;
        plannedMonthlyGross += preview
            .filter((p) => p.endMonth === null)
            .reduce((sum, p) => sum + p.gross, 0);
        console.log(`${spec.name} (${spec.domain})\n` +
            `  joined ${spec.joined} · ${months.length} payroll runs (${months[0]} → ${months.at(-1)})\n` +
            `  headcount ${spec.startingHeadcount} → ${finalCount} · ` +
            `${preview.length - finalCount} leavers · median ₦${(spec.medianGross / 1000).toFixed(0)}k\n` +
            `  ~${rows.toLocaleString()} payroll rows`);
    }
    const activation = (activating.length / COMPANIES.length) * 100;
    console.log(`\n${COMPANIES.length} companies · ${activating.length} running payroll ` +
        `(${activation.toFixed(0)}% activation)\n` +
        `~${plannedRows.toLocaleString()} payroll rows · ~${plannedPeople.toLocaleString()} people\n` +
        `~₦${Math.round(plannedMonthlyGross / 1_000_000)}M gross per month at current headcount`);
    if (!COMMIT) {
        console.log('\n🔍 Dry run — nothing written. Re-run with --commit to apply.\n');
        return;
    }
    const pool = new pg_1.Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.PGSSL_DISABLE === '1' ? false : { rejectUnauthorized: false },
    });
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule, {
        bufferLogs: true,
    });
    app.useLogger(app.get(nestjs_pino_1.Logger));
    const runService = app.get(run_service_1.RunService);
    try {
        for (const spec of COMPANIES) {
            const months = payableMonths(spec.firstPayroll, currentMonth, spec.payDay, today);
            const companyId = (0, node_crypto_1.randomUUID)();
            const roleId = (0, node_crypto_1.randomUUID)();
            const adminUserId = (0, node_crypto_1.randomUUID)();
            const inertPassword = await bcrypt.hash((0, node_crypto_1.randomUUID)() + (0, node_crypto_1.randomUUID)(), 10);
            console.log(`\n── ${spec.name} ──`);
            await pool.query(`insert into companies (id, name, domain, country, currency, reg_no, is_active, primary_contact_name, primary_contact_email, subscription_plan, created_at, updated_at)
         values ($1,$2,$3,'nigeria','NGN',$4,true,$5,$6,'pro',$7::timestamp,$7::timestamp)`, [companyId, spec.name, spec.domain, TAG, 'Operations Lead', `ops@${spec.domain}.ng`, spec.joined]);
            await pool.query(`insert into company_roles (id, company_id, name) values ($1,$2,'super_admin')`, [roleId, companyId]);
            await pool.query(`insert into users (id, email, password, first_name, last_name, company_id, company_role_id, is_verified, created_at, updated_at)
         values ($1,$2,$3,'Payroll','Admin',$4,$5,true,$6::timestamp,$6::timestamp)`, [adminUserId, `payroll@${spec.domain}.ng`, inertPassword, companyId, roleId, spec.joined]);
            for (const [key, value] of Object.entries(PAYROLL_SETTINGS)) {
                const resolved = key === 'payroll.apply_nhf' ? spec.appliesNhf : value;
                await pool.query(`insert into company_settings (id, company_id, key, value, created_at, updated_at)
           values ($1,$2,$3,$4::jsonb,$5::timestamp,$5::timestamp)`, [(0, node_crypto_1.randomUUID)(), companyId, key, JSON.stringify(resolved), spec.joined]);
            }
            const scheduleId = (0, node_crypto_1.randomUUID)();
            const payGroupId = (0, node_crypto_1.randomUUID)();
            await pool.query(`insert into pay_schedules (id, company_id, start_date, pay_frequency, pay_schedule, weekend_adjustment, holiday_adjustment, created_at, updated_at)
         values ($1,$2,$3::timestamp,'monthly',$4::jsonb,'friday','previous',$5::timestamp,$5::timestamp)`, [
                scheduleId, companyId, spec.joined,
                JSON.stringify(months.map((m) => `${resolvePayDate(m, spec.payDay)}T23:59:59.999Z`)),
                spec.joined,
            ]);
            await pool.query(`insert into pay_groups (id, name, apply_paye, apply_pension, apply_nhf, pay_schedule_id, company_id, created_at, updated_at)
         values ($1,'monthly',true,true,$5,$2,$3,$4::timestamp,$4::timestamp)`, [payGroupId, scheduleId, companyId, spec.joined, spec.appliesNhf]);
            if (!spec.runsPayroll) {
                console.log('  signed up · no payroll run');
                continue;
            }
            const workforce = planWorkforce(spec, months, makeRng(RUN_ID + spec.domain));
            const finalHeadcount = workforce.filter((p) => p.endMonth === null).length;
            for (const [i, person] of workforce.entries()) {
                const first = FIRST_NAMES[Math.floor(rng() * FIRST_NAMES.length)];
                const last = LAST_NAMES[Math.floor(rng() * LAST_NAMES.length)];
                const userId = (0, node_crypto_1.randomUUID)();
                const email = `${first.toLowerCase()}.${last.toLowerCase()}${i}@${spec.domain}.ng`;
                await pool.query(`insert into users (id, email, password, first_name, last_name, company_id, company_role_id, is_verified, created_at, updated_at)
           values ($1,$2,$3,$4,$5,$6,$7,true,$8::timestamp,$8::timestamp)`, [userId, email, inertPassword, first, last, companyId, roleId, person.startDate]);
                await pool.query(`insert into employees (id, employee_number, user_id, company_id, pay_group_id, first_name, last_name, email, employment_start_date, employment_end_date, employment_status, created_at)
           values ($1,$2,$3,$4,$5,$6,$7,$8,$9::text,$10::timestamp,'active',$11::timestamp)`, [
                    person.id, `EMP${String(i + 1).padStart(4, '0')}`, userId, companyId,
                    payGroupId, first, last, email, person.startDate, person.endDate,
                    person.startDate,
                ]);
                await pool.query(`insert into employee_compensations (id, employee_id, gross_salary, effective_date, apply_nhf, created_at, updated_at)
           values ($1,$2,$3,$4::text,$6,$5::timestamp,$5::timestamp)`, [
                    (0, node_crypto_1.randomUUID)(), person.id, person.gross * 12, person.startDate,
                    person.startDate, spec.appliesNhf,
                ]);
            }
            const leavers = workforce.length - finalHeadcount;
            console.log(`  ${workforce.length} employees over the period · ` +
                `${spec.startingHeadcount} at start → ${finalHeadcount} at end · ${leavers} left`);
            const engineUser = {
                id: adminUserId,
                companyId,
                email: `payroll@${spec.domain}.ng`,
                role: 'super_admin',
            };
            for (const month of months) {
                const payrollDate = resolvePayDate(month, spec.payDay);
                const active = workforce.filter((p) => employedIn(p, month)).map((p) => p.id);
                const notYet = workforce
                    .filter((p) => month < p.startMonth)
                    .map((p) => p.id);
                const gone = workforce
                    .filter((p) => p.endMonth !== null && month > p.endMonth)
                    .map((p) => p.id);
                if (active.length) {
                    await pool.query(`update employees set employment_status='active' where id = any($1)`, [active]);
                }
                if (notYet.length) {
                    await pool.query(`update employees set employment_status='onboarding' where id = any($1)`, [notYet]);
                }
                if (gone.length) {
                    await pool.query(`update employees set employment_status='resigned' where id = any($1)`, [gone]);
                }
                try {
                    const result = await runService.calculatePayrollForCompany(engineUser, payrollDate);
                    console.log(`  ${month}  ✓ ${result.employeeCount} employees`);
                }
                catch (err) {
                    console.log(`  ${month}  ✗ ${err instanceof Error ? err.message.slice(0, 90) : err}`);
                }
            }
            const settleBefore = new Date(today.getTime() - 5 * 86_400_000)
                .toISOString()
                .slice(0, 10);
            await pool.query(`update payroll
            set payment_status='paid',
                approval_status='completed',
                payment_date = payroll_date,
                approval_date = payroll_date
          where company_id = $1 and payroll_date::date <= $2::date`, [companyId, settleBefore]);
            const stillEmployed = workforce.filter((p) => p.endMonth === null).map((p) => p.id);
            const departed = workforce.filter((p) => p.endMonth !== null).map((p) => p.id);
            if (stillEmployed.length) {
                await pool.query(`update employees set employment_status='active' where id = any($1)`, [stillEmployed]);
            }
            if (departed.length) {
                await pool.query(`update employees set employment_status='resigned' where id = any($1)`, [departed]);
            }
        }
        const summary = await pool.query(`select c.name,
              count(*)::int rows,
              count(distinct p.payroll_month)::int months,
              sum(p.gross_salary)::numeric(15,2) gross,
              sum(p.paye_tax)::numeric(15,2) paye,
              sum(p.pension_contribution + p.employer_pension_contribution)::numeric(15,2) pension
       from payroll p join companies c on c.id = p.company_id
       where c.reg_no = $1 group by 1 order by 1`, [TAG]);
        console.log('\n─────────────────────────────────────────');
        console.table(summary.rows);
        console.log(`tag  ${TAG}`);
        console.log('─────────────────────────────────────────');
        console.log(`\n✅ Done. To undo:\n   npm run teardown:demo-companies -- --tag ${TAG} --commit\n`);
    }
    finally {
        await app.close();
        await pool.end();
    }
}
main().catch((err) => {
    console.error(err instanceof Error ? err.stack : err);
    process.exit(1);
});
//# sourceMappingURL=seed-demo-companies.js.map