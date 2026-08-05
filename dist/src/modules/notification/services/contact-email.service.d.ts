import { ConfigService } from '@nestjs/config';
import { ResendProvider } from '../resend.provider';
import { CreateMessageDto } from '../dto/create-message.dto';
export declare class ContactEmailService {
    private readonly config;
    private readonly resend;
    private readonly logger;
    constructor(config: ConfigService, resend: ResendProvider);
    sendContactEmail(dto: CreateMessageDto): Promise<void>;
}
