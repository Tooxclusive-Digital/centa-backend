export interface NewsletterHtmlProps {
    firstName: string;
    companyName?: string;
    ctaUrl: string;
    unsubscribeUrl?: string;
}
export declare const newsletterHtml: ({ firstName, companyName, ctaUrl, unsubscribeUrl, }: NewsletterHtmlProps) => string;
