import {
  pgTable,
  uuid,
  text,
  jsonb,
  timestamp,
  varchar,
  index,
} from 'drizzle-orm/pg-core';
import { platformAdmins } from './platform-admin.schema';

/**
 * Audit trail for platform-admin actions.
 *
 * Separate from `audit_logs` because that table's user_id is a foreign key to
 * `users` (tenant staff). Platform admins are deliberately not rows in `users`,
 * so writing them there would either violate the FK or require weakening it.
 */
export const platformAuditLogs = pgTable(
  'platform_audit_logs',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    timestamp: timestamp('timestamp').notNull().defaultNow(),

    adminId: uuid('admin_id')
      .notNull()
      .references(() => platformAdmins.id, { onDelete: 'restrict' }),
    // Denormalised so the trail stays readable even if an admin is later
    // deactivated or renamed.
    adminEmail: varchar('admin_email', { length: 255 }).notNull(),

    action: text('action').notNull(),
    entity: text('entity').notNull(),
    entityId: uuid('entity_id'),

    details: text('details'),
    changes: jsonb('changes'),
    ipAddress: varchar('ip_address', { length: 45 }),
  },
  (t) => [
    index('idx_platform_audit_admin').on(t.adminId),
    index('idx_platform_audit_entity').on(t.entity, t.entityId),
    index('idx_platform_audit_timestamp').on(t.timestamp),
  ],
);

export type PlatformAuditLog = typeof platformAuditLogs.$inferSelect;
