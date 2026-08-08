"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.platformAuditLogs = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const platform_admin_schema_1 = require("./platform-admin.schema");
exports.platformAuditLogs = (0, pg_core_1.pgTable)('platform_audit_logs', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    timestamp: (0, pg_core_1.timestamp)('timestamp').notNull().defaultNow(),
    adminId: (0, pg_core_1.uuid)('admin_id')
        .notNull()
        .references(() => platform_admin_schema_1.platformAdmins.id, { onDelete: 'restrict' }),
    adminEmail: (0, pg_core_1.varchar)('admin_email', { length: 255 }).notNull(),
    action: (0, pg_core_1.text)('action').notNull(),
    entity: (0, pg_core_1.text)('entity').notNull(),
    entityId: (0, pg_core_1.uuid)('entity_id'),
    details: (0, pg_core_1.text)('details'),
    changes: (0, pg_core_1.jsonb)('changes'),
    ipAddress: (0, pg_core_1.varchar)('ip_address', { length: 45 }),
}, (t) => [
    (0, pg_core_1.index)('idx_platform_audit_admin').on(t.adminId),
    (0, pg_core_1.index)('idx_platform_audit_entity').on(t.entity, t.entityId),
    (0, pg_core_1.index)('idx_platform_audit_timestamp').on(t.timestamp),
]);
//# sourceMappingURL=platform-audit.schema.js.map