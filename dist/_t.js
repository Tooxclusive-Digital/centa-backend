"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const core_1 = require("@nestjs/core");
const nestjs_pino_1 = require("nestjs-pino");
const pg_1 = require("pg");
const app_module_1 = require("./src/app.module");
const offboarding_export_service_1 = require("./src/modules/lifecycle/offboarding/offboarding-export.service");
const exceljs_1 = require("exceljs");
(async () => {
    const pool = new pg_1.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
    const { rows: [e] } = await pool.query(`select id, company_id from employees where first_name='Blessing' and last_name='Jones' limit 1`);
    await pool.end();
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule, { bufferLogs: true });
    app.useLogger(app.get(nestjs_pino_1.Logger));
    const r = await app.get(offboarding_export_service_1.OffboardingExportService)
        .generateWorkbook(e.id, e.company_id, ['pay']);
    const wb = new exceljs_1.Workbook();
    await wb.xlsx.load(r.buffer);
    const s = wb.getWorksheet('Summary');
    console.log('OUT_START');
    for (let i = 2; i <= s.rowCount; i++) {
        const k = s.getCell(`A${i}`).value, v = s.getCell(`B${i}`).value;
        if (k)
            console.log('  ' + String(k).padEnd(22) + String(v ?? ''));
    }
    console.log('OUT_END');
    await app.close();
    process.exit(0);
})().catch(e => { console.error('FAILED:', e.message); process.exit(1); });
//# sourceMappingURL=_t.js.map