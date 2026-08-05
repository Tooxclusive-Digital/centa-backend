import { ResendProvider } from '../resend.provider';
export declare class EmailVerificationService {
    private readonly resend;
    private readonly logger;
    constructor(resend: ResendProvider);
    private sendWithRetry;
    sendVerifyEmail(email: string, token: string, companyName?: string): Promise<void>;
    sendVerifyLogin(email: string, token: string): Promise<void>;
}
