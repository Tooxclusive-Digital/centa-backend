import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
export declare class ResendProvider {
    private config;
    private readonly logger;
    readonly client: Resend;
    private readonly redirectTo?;
    constructor(config: ConfigService);
    private wrap;
}
