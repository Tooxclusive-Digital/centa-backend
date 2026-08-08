import { PlatformAdminUser } from './types/platform-admin.type';
import { PlatformFilingService } from './services/platform-filing.service';
import { PlatformNoteService } from './services/platform-note.service';
import { RecordFilingDto } from './dto/record-filing.dto';
import { CreateNoteDto } from './dto/create-note.dto';
export declare class PlatformFilingController {
    private readonly filings;
    private readonly notes;
    constructor(filings: PlatformFilingService, notes: PlatformNoteService);
    recordFiling(dto: RecordFilingDto, admin: PlatformAdminUser, ip: string): Promise<{
        success: boolean;
        filingId: string;
        companyName: string;
        payrollMonth: string;
        taxType: string;
        amount: string;
        referenceNumber: string;
        submittedAt: string;
    }>;
    listNotes(): Promise<{
        id: string;
        kind: string;
        companyId: string;
        subject: string;
        body: string;
        authorName: string;
        createdAt: Date;
    }[]>;
    createNote(dto: CreateNoteDto, admin: PlatformAdminUser, ip: string): Promise<{
        id: string;
        createdAt: Date;
        companyId: string;
        body: string;
        subject: string;
        authorId: string;
        kind: string;
        authorName: string;
    }>;
    removeNote(id: string, admin: PlatformAdminUser): Promise<{
        success: boolean;
    }>;
    getAuditLog(limit?: string): Promise<{
        id: string;
        timestamp: Date;
        adminId: string;
        adminEmail: string;
        action: string;
        entity: string;
        entityId: string | null;
        details: string | null;
        changes: unknown;
        ipAddress: string | null;
    }[]>;
}
