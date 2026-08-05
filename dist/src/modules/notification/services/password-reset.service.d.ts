import { ResendProvider } from '../resend.provider';
export declare class PasswordResetEmailService {
    private readonly resend;
    private readonly logger;
    constructor(resend: ResendProvider);
    sendPasswordResetEmail(email: string, name: string, url: string): Promise<void>;
}
