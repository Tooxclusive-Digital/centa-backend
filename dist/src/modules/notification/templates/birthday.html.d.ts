export interface BirthdayHtmlProps {
    firstName: string;
    companyName: string;
}
export declare const birthdayHtml: ({ firstName, companyName, }: BirthdayHtmlProps) => string;
export interface BirthdayTeamHtmlProps {
    firstName: string;
    celebrantName: string;
    celebrantDepartment?: string | null;
    companyName: string;
}
export declare const birthdayTeamHtml: ({ firstName, celebrantName, celebrantDepartment, companyName, }: BirthdayTeamHtmlProps) => string;
