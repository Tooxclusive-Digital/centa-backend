export interface AnnouncementHtmlProps {
    firstName: string;
    title: string;
    body: string;
    publishedAt?: string;
    expiresAt?: string;
    companyName: string;
    url: string;
}
export declare const announcementHtml: ({ firstName, title, body, publishedAt, expiresAt, companyName, url, }: AnnouncementHtmlProps) => string;
