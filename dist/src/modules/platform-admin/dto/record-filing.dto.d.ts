export declare const FILEABLE_TAX_TYPES: readonly ["PAYE", "Pension", "NHF"];
export declare class RecordFilingDto {
    companyId: string;
    payrollMonth: string;
    taxType: string;
    referenceNumber: string;
    submittedAt?: string;
    note?: string;
}
