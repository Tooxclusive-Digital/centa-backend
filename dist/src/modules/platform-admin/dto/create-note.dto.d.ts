export declare const NOTE_KINDS: readonly ["unpaid_run", "missed_payroll", "unfiled_statutory", "never_activated"];
export declare class CreateNoteDto {
    kind: string;
    companyId: string;
    subject?: string;
    body: string;
}
