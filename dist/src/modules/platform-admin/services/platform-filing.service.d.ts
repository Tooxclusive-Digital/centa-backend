import type { db } from 'src/drizzle/types/drizzle';
import { RecordFilingDto } from '../dto/record-filing.dto';
import { PlatformAdminUser } from '../types/platform-admin.type';
export declare class PlatformFilingService {
    private readonly db;
    constructor(db: db);
    recordFiling(dto: RecordFilingDto, admin: PlatformAdminUser, ip?: string): Promise<{
        success: boolean;
        filingId: string;
        companyName: string;
        payrollMonth: string;
        taxType: string;
        amount: string;
        referenceNumber: string;
        submittedAt: string;
    }>;
    getAuditLog(limit?: number): Promise<{
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
