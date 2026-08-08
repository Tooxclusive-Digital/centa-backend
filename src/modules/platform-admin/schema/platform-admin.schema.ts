import {
  pgTable,
  uuid,
  varchar,
  boolean,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

// Platform-level staff accounts. Deliberately separate from `users`:
// these have no companyId / companyRoleId, so tenant-scoped guards can
// never resolve them and they can never be scoped to a single company.
export const platformAdmins = pgTable(
  'platform_admins',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    email: varchar('email', { length: 255 }).notNull(),
    password: varchar('password', { length: 255 }).notNull(),
    firstName: varchar('first_name', { length: 100 }),
    lastName: varchar('last_name', { length: 100 }),
    // Public S3 URL, matching how `users.avatar` stores it. Null falls back to
    // the initials chip the header already renders.
    avatar: varchar('avatar', { length: 500 }),
    isActive: boolean('is_active').notNull().default(true),
    lastLogin: timestamp('last_login', { mode: 'date' }),
    createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex('uq_platform_admins_email').on(t.email)],
);

export type PlatformAdmin = typeof platformAdmins.$inferSelect;
