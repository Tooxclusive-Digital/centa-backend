"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exceptionNotes = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const schema_1 = require("../../../drizzle/schema");
const platform_admin_schema_1 = require("./platform-admin.schema");
exports.exceptionNotes = (0, pg_core_1.pgTable)('exception_notes', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    kind: (0, pg_core_1.varchar)('kind', { length: 40 }).notNull(),
    companyId: (0, pg_core_1.uuid)('company_id')
        .notNull()
        .references(() => schema_1.companies.id, { onDelete: 'cascade' }),
    subject: (0, pg_core_1.varchar)('subject', { length: 120 }).notNull().default(''),
    body: (0, pg_core_1.text)('body').notNull(),
    authorId: (0, pg_core_1.uuid)('author_id')
        .notNull()
        .references(() => platform_admin_schema_1.platformAdmins.id, { onDelete: 'restrict' }),
    authorName: (0, pg_core_1.varchar)('author_name', { length: 255 }).notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
}, (t) => [
    (0, pg_core_1.index)('idx_exception_notes_key').on(t.kind, t.companyId, t.subject),
    (0, pg_core_1.index)('idx_exception_notes_created').on(t.createdAt),
]);
//# sourceMappingURL=exception-note.schema.js.map