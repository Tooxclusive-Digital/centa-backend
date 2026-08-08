import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, desc, eq } from 'drizzle-orm';
import type { db } from 'src/drizzle/types/drizzle';
import { DRIZZLE } from 'src/drizzle/drizzle.module';
import { companies } from 'src/drizzle/schema';
import { exceptionNotes, platformAuditLogs } from '../schema';
import { CreateNoteDto } from '../dto/create-note.dto';
import { PlatformAdminUser } from '../types/platform-admin.type';

@Injectable()
export class PlatformNoteService {
  constructor(@Inject(DRIZZLE) private readonly db: db) {}

  /**
   * Every note, grouped by exception key.
   *
   * Returned as a whole rather than per-exception: the Ops page renders up to
   * 50 rows at once, and one request beats fifty. Volumes here are small —
   * notes are written by a handful of staff, not by customers.
   */
  async getAll() {
    const rows = await this.db
      .select({
        id: exceptionNotes.id,
        kind: exceptionNotes.kind,
        companyId: exceptionNotes.companyId,
        subject: exceptionNotes.subject,
        body: exceptionNotes.body,
        authorName: exceptionNotes.authorName,
        createdAt: exceptionNotes.createdAt,
      })
      .from(exceptionNotes)
      .orderBy(desc(exceptionNotes.createdAt));

    return rows;
  }

  async create(dto: CreateNoteDto, admin: PlatformAdminUser, ip?: string) {
    const [company] = await this.db
      .select({ id: companies.id, name: companies.name })
      .from(companies)
      .where(eq(companies.id, dto.companyId));

    if (!company) throw new NotFoundException('Company not found');

    const authorName =
      [admin.firstName, admin.lastName].filter(Boolean).join(' ').trim() ||
      admin.email;

    const [note] = await this.db
      .insert(exceptionNotes)
      .values({
        kind: dto.kind,
        companyId: dto.companyId,
        subject: dto.subject ?? '',
        body: dto.body.trim(),
        authorId: admin.id,
        authorName,
      })
      .returning();

    await this.db.insert(platformAuditLogs).values({
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

  /**
   * Deletes a note. Only its own author may remove it — an ops record that
   * anyone can erase is not much of a record.
   */
  async remove(id: string, admin: PlatformAdminUser) {
    const [note] = await this.db
      .select()
      .from(exceptionNotes)
      .where(
        and(eq(exceptionNotes.id, id), eq(exceptionNotes.authorId, admin.id)),
      );

    if (!note) {
      throw new NotFoundException('Note not found, or not yours to delete');
    }

    await this.db.delete(exceptionNotes).where(eq(exceptionNotes.id, id));

    await this.db.insert(platformAuditLogs).values({
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
}
