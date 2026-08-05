export interface ContactMessageHtmlProps {
    name: string;
    email: string;
    message: string;
    phone?: string;
    website?: string;
}
export declare const contactMessageHtml: ({ name, email, message, phone, website, }: ContactMessageHtmlProps) => string;
