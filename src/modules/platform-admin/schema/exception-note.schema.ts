import {
  pgTable,
  uuid,
  text,
  timestamp,
  varchar,
  index,
} from 'drizzle-orm/pg-core';
import { companies } from 'src/drizzle/schema';
import { platformAdmins } from './platform-admin.schema';

/**
 * Notes attached to an operational exception.
 *
 * Exceptions are DERIVED — computed on every request from payroll and filings,
 * never stored — so there is no row id to reference. A note is keyed instead by
 * the three fields that identify one:
 *
 *   kind + company_id + subject
 *
 * where `subject` is the exception's own detail scope: a payroll month for an
 * unpaid run, the tax type and month for a filing, and empty for company-wide
 * kinds like never_activated. That combination survives the underlying numbers
 * changing — an unpaid run growing by one payslip is still the same problem
 * someone is chasing.
 *
 * Notes deliberately outlive the exception that prompted them: when a payment
 * finally clears, the exception disappears but the record of who chased it and
 * what the PFA said is exactly what you want to keep.
 */
export const exceptionNotes = pgTable(
  'exception_notes',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    /** Matches OpsException.kind — 'unpaid_run', 'unfiled_statutory', etc. */
    kind: varchar('kind', { length: 40 }).notNull(),
    companyId: uuid('company_id')
      .notNull()
      .references(() => companies.id, { onDelete: 'cascade' }),
    /** Scope within the company: '2026-04', '2026-04 · PAYE', or ''. */
    subject: varchar('subject', { length: 120 }).notNull().default(''),

    body: text('body').notNull(),

    authorId: uuid('author_id')
      .notNull()
      .references(() => platformAdmins.id, { onDelete: 'restrict' }),
    // Denormalised so the thread stays readable if an admin is deactivated.
    authorName: varchar('author_name', { length: 255 }).notNull(),

    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => [
    // The lookup every read does: all notes for one exception.
    index('idx_exception_notes_key').on(t.kind, t.companyId, t.subject),
    index('idx_exception_notes_created').on(t.createdAt),
  ],
);

export type ExceptionNote = typeof exceptionNotes.$inferSelect;
