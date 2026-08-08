import type { db } from 'src/drizzle/types/drizzle';
import { CreateNoteDto } from '../dto/create-note.dto';
import { PlatformAdminUser } from '../types/platform-admin.type';
export declare class PlatformNoteService {
    private readonly db;
    constructor(db: db);
    getAll(): Promise<{
        id: string;
        kind: string;
        companyId: string;
        subject: string;
        body: string;
        authorName: string;
        createdAt: Date;
    }[]>;
    create(dto: CreateNoteDto, admin: PlatformAdminUser, ip?: string): Promise<{
        id: string;
        createdAt: Date;
        companyId: string;
        body: string;
        subject: string;
        authorId: string;
        kind: string;
        authorName: string;
    }>;
    remove(id: string, admin: PlatformAdminUser): Promise<{
        success: boolean;
    }>;
}
