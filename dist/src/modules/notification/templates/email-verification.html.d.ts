export interface EmailVerificationHtmlProps {
    verificationCode: string;
    companyName?: string;
}
export declare const emailVerificationHtml: ({ verificationCode, companyName, }: EmailVerificationHtmlProps) => string;
