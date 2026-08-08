"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const pg_1 = require("pg");
const node_postgres_1 = require("drizzle-orm/node-postgres");
const drizzle_orm_1 = require("drizzle-orm");
const bcrypt = require("bcryptjs");
const schema_1 = require("./schema");
async function main() {
    const email = process.env.PLATFORM_ADMIN_EMAIL?.toLowerCase().trim();
    const password = process.env.PLATFORM_ADMIN_PASSWORD;
    const firstName = process.env.PLATFORM_ADMIN_FIRST_NAME ?? null;
    const lastName = process.env.PLATFORM_ADMIN_LAST_NAME ?? null;
    if (!email || !password) {
        throw new Error('PLATFORM_ADMIN_EMAIL and PLATFORM_ADMIN_PASSWORD are required');
    }
    if (password.length < 12) {
        throw new Error('PLATFORM_ADMIN_PASSWORD must be at least 12 characters');
    }
    if (!process.env.DATABASE_URL) {
        throw new Error('DATABASE_URL is not set');
    }
    const pool = new pg_1.Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.PGSSL_DISABLE === '1'
            ? false
            : process.env.NODE_ENV === 'production'
                ? false
                : { rejectUnauthorized: false },
    });
    const db = (0, node_postgres_1.drizzle)(pool);
    try {
        const hashed = await bcrypt.hash(password, 10);
        const [existing] = await db
            .select({ id: schema_1.platformAdmins.id })
            .from(schema_1.platformAdmins)
            .where((0, drizzle_orm_1.eq)(schema_1.platformAdmins.email, email));
        if (existing) {
            await db
                .update(schema_1.platformAdmins)
                .set({
                password: hashed,
                isActive: true,
                firstName,
                lastName,
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(schema_1.platformAdmins.id, existing.id));
            console.log(`Updated existing platform admin: ${email}`);
        }
        else {
            await db
                .insert(schema_1.platformAdmins)
                .values({ email, password: hashed, firstName, lastName });
            console.log(`Created platform admin: ${email}`);
        }
    }
    finally {
        await pool.end();
    }
}
main().catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
});
//# sourceMappingURL=seed-platform-admin.js.map