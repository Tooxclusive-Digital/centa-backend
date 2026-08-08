"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlatformNoteService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_module_1 = require("../../../drizzle/drizzle.module");
const schema_1 = require("../../../drizzle/schema");
const schema_2 = require("../schema");
let PlatformNoteService = class PlatformNoteService {
    constructor(db) {
        this.db = db;
    }
    async getAll() {
        const rows = await this.db
            .select({
            id: schema_2.exceptionNotes.id,
            kind: schema_2.exceptionNotes.kind,
            companyId: schema_2.exceptionNotes.companyId,
            subject: schema_2.exceptionNotes.subject,
            body: schema_2.exceptionNotes.body,
            authorName: schema_2.exceptionNotes.authorName,
            createdAt: schema_2.exceptionNotes.createdAt,
        })
            .from(schema_2.exceptionNotes)
            .orderBy((0, drizzle_orm_1.desc)(schema_2.exceptionNotes.createdAt));
        return rows;
    }
    async create(dto, admin, ip) {
        const [company] = await this.db
            .select({ id: schema_1.companies.id, name: schema_1.companies.name })
            .from(schema_1.companies)
            .where((0, drizzle_orm_1.eq)(schema_1.companies.id, dto.companyId));
        if (!company)
            throw new common_1.NotFoundException('Company not found');
        const authorName = [admin.firstName, admin.lastName].filter(Boolean).join(' ').trim() ||
            admin.email;
        const [note] = await this.db
            .insert(schema_2.exceptionNotes)
            .values({
            kind: dto.kind,
            companyId: dto.companyId,
            subject: dto.subject ?? '',
            body: dto.body.trim(),
            authorId: admin.id,
            authorName,
        })
            .returning();
        await this.db.insert(schema_2.platformAuditLogs).values({
            adminId: admin.id,
            adminEmail: admin.email,
            action: 'add_exception_note',
            entity: 'exception_note',
            entityId: note.id,
            details: `Note on ${dto.kind} for ${company.name}`,
            changes: {
                kind: dto.kind,
                companyName: company.name,
                subject: dto.subject ?? '',
            },
            ipAddress: ip,
        });
        return note;
    }
    async remove(id, admin) {
        const [note] = await this.db
            .select()
            .from(schema_2.exceptionNotes)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_2.exceptionNotes.id, id), (0, drizzle_orm_1.eq)(schema_2.exceptionNotes.authorId, admin.id)));
        if (!note) {
            throw new common_1.NotFoundException('Note not found, or not yours to delete');
        }
        await this.db.delete(schema_2.exceptionNotes).where((0, drizzle_orm_1.eq)(schema_2.exceptionNotes.id, id));
        await this.db.insert(schema_2.platformAuditLogs).values({
            adminId: admin.id,
            adminEmail: admin.email,
            action: 'delete_exception_note',
            entity: 'exception_note',
            entityId: id,
            details: `Deleted note on ${note.kind}`,
            changes: { body: note.body },
        });
        return { success: true };
    }
};
exports.PlatformNoteService = PlatformNoteService;
exports.PlatformNoteService = PlatformNoteService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(drizzle_module_1.DRIZZLE)),
    __metadata("design:paramtypes", [Object])
], PlatformNoteService);
//# sourceMappingURL=platform-note.service.js.map