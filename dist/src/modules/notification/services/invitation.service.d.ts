import { ResendProvider } from '../resend.provider';
export declare class InvitationService {
    private readonly resend;
    private readonly logger;
    constructor(resend: ResendProvider);
    sendInvitationEmail(email: string, name: string, companyName: string, role: string, url: string): Promise<void>;
}
