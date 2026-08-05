import { ConfigService } from '@nestjs/config';
import { ResendProvider } from '../resend.provider';
import { NewsletterRecipientDto } from '../dto/newsletter-recipient.dto';
export declare class NewsletterEmailService {
    private readonly config;
    private readonly resend;
    private readonly logger;
    constructor(config: ConfigService, resend: ResendProvider);
    sendNewsletter(recipients: NewsletterRecipientDto[], opts?: {
        campaignName?: string;
        categories?: string[];
    }): Promise<void>;
    private tagValue;
}
