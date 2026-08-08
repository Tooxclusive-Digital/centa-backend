"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.platformAdmins = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.platformAdmins = (0, pg_core_1.pgTable)('platform_admins', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    email: (0, pg_core_1.varchar)('email', { length: 255 }).notNull(),
    password: (0, pg_core_1.varchar)('password', { length: 255 }).notNull(),
    firstName: (0, pg_core_1.varchar)('first_name', { length: 100 }),
    lastName: (0, pg_core_1.varchar)('last_name', { length: 100 }),
    isActive: (0, pg_core_1.boolean)('is_active').notNull().default(true),
    lastLogin: (0, pg_core_1.timestamp)('last_login', { mode: 'date' }),
    createdAt: (0, pg_core_1.timestamp)('created_at', { mode: 'date' }).notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at', { mode: 'date' }).notNull().defaultNow(),
}, (t) => [(0, pg_core_1.uniqueIndex)('uq_platform_admins_email').on(t.email)]);
//# sourceMappingURL=platform-admin.schema.js.map