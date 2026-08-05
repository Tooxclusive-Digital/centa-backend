import { ResendProvider } from '../resend.provider';
export declare class OfferEmailService {
    private readonly resend;
    private readonly logger;
    constructor(resend: ResendProvider);
    sendOfferEmail(email: string, candidateName: string, jobTitle: string, companyName: string, offerUrl: string, companyLogo?: string): Promise<void>;
}
