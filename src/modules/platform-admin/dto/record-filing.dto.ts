import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
} from 'class-validator';

// Tax types Centa computes. A closed list keeps the obligation lookup honest —
// a filing for a type we never compute could never be reconciled.
export const FILEABLE_TAX_TYPES = ['PAYE', 'Pension', 'NHF'] as const;

export class RecordFilingDto {
  @IsUUID()
  companyId: string;

  /** Payroll month in YYYY-MM form, matching payroll.payroll_month. */
  @IsString()
  @Matches(/^\d{4}-\d{2}$/, { message: 'payrollMonth must be YYYY-MM' })
  payrollMonth: string;

  @IsIn(FILEABLE_TAX_TYPES as unknown as string[])
  taxType: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  referenceNumber: string;

  /** ISO date the filing was submitted. Defaults to now when omitted. */
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'submittedAt must be YYYY-MM-DD' })
  submittedAt?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
