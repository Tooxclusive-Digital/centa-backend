/**
 * Creates or updates the first platform admin.
 *
 *   PLATFORM_ADMIN_EMAIL=you@centahr.com \
 *   PLATFORM_ADMIN_PASSWORD='...' \
 *   npm run seed:platform-admin
 *
 * Idempotent: re-running with the same email resets that admin's password and
 * reactivates the account rather than creating a duplicate.
 */
import 'dotenv/config';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcryptjs';
import { platformAdmins } from './schema';

async function main() {
  const email = process.env.PLATFORM_ADMIN_EMAIL?.toLowerCase().trim();
  const password = process.env.PLATFORM_ADMIN_PASSWORD;
  const firstName = process.env.PLATFORM_ADMIN_FIRST_NAME ?? null;
  const lastName = process.env.PLATFORM_ADMIN_LAST_NAME ?? null;

  if (!email || !password) {
    throw new Error(
      'PLATFORM_ADMIN_EMAIL and PLATFORM_ADMIN_PASSWORD are required',
    );
  }
  if (password.length < 12) {
    throw new Error('PLATFORM_ADMIN_PASSWORD must be at least 12 characters');
  }
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set');
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl:
      process.env.PGSSL_DISABLE === '1'
        ? false
        : process.env.NODE_ENV === 'production'
          ? false
          : { rejectUnauthorized: false },
  });
  const db = drizzle(pool);

  try {
    const hashed = await bcrypt.hash(password, 10);

    const [existing] = await db
      .select({ id: platformAdmins.id })
      .from(platformAdmins)
      .where(eq(platformAdmins.email, email));

    if (existing) {
      await db
        .update(platformAdmins)
        .set({
          password: hashed,
          isActive: true,
          firstName,
          lastName,
          updatedAt: new Date(),
        })
        .where(eq(platformAdmins.id, existing.id));
      console.log(`Updated existing platform admin: ${email}`);
    } else {
      await db
        .insert(platformAdmins)
        .values({ email, password: hashed, firstName, lastName });
      console.log(`Created platform admin: ${email}`);
    }
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
