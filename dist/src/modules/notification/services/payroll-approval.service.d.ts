import { ResendProvider } from '../resend.provider';
export declare class PayrollApprovalEmailService {
    private readonly resend;
    private readonly logger;
    constructor(resend: ResendProvider);
    sendApprovalEmail(email: string, name: string, url: string, month: string, companyName: string): Promise<void>;
}
