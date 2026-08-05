export interface OfferHtmlProps {
    name: string;
    jobTitle: string;
    companyName: string;
    offerLink: string;
    companyLogo?: string;
}
export declare const offerHtml: ({ name, jobTitle, companyName, offerLink, companyLogo, }: OfferHtmlProps) => string;
