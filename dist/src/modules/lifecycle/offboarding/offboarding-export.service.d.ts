import type { db } from 'src/drizzle/types/drizzle';
export declare const RECORD_SECTIONS: readonly ["summary", "pay", "statutory", "leave", "offboarding"];
export type RecordSection = (typeof RECORD_SECTIONS)[number];
export declare class OffboardingExportService {
    private readonly db;
    constructor(db: db);
    private date;
    private getPerson;
    private getSession;
    private tenure;
    private addSummary;
    private addPay;
    private addStatutory;
    private addLeave;
    private addOffboarding;
    generateWorkbook(employeeId: string, companyId: string, sections: RecordSection[]): Promise<{
        buffer: Buffer<import("exceljs").Buffer>;
        filename: string;
    }>;
}
