import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

/** Exception kinds a note can attach to — mirrors the exceptions endpoint. */
export const NOTE_KINDS = [
  'unpaid_run',
  'missed_payroll',
  'unfiled_statutory',
  'never_activated',
] as const;

export class CreateNoteDto {
  @IsIn(NOTE_KINDS as unknown as string[])
  kind: string;

  @IsUUID()
  companyId: string;

  /** Scope within the company: a payroll month, a month + tax type, or ''. */
  @IsOptional()
  @IsString()
  @MaxLength(120)
  subject?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  body: string;
}
