import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ResendProvider } from '../resend.provider';
import { contactMessageHtml } from '../templates/contact-message.html';
import { CreateMessageDto } from '../dto/create-message.dto';

@Injectable()
export class ContactEmailService {
  private readonly logger = new Logger(ContactEmailService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly resend: ResendProvider,
  ) {}

  async sendContactEmail(dto: CreateMessageDto) {
    const { email, name, message, phone, website } = dto;

    const to = this.config.get<string>('NOTIFY_EMAIL_TO');
    if (!to) {
      this.logger.error('NOTIFY_EMAIL_TO is not configured; dropping message');
      return;
    }

    try {
      const { error } = await this.resend.client.emails.send({
        to,
        from: 'CentaHR <noreply@centahr.com>',
        replyTo: email,
        subject: `New Contact Us Message from ${name}`,
        html: contactMessageHtml({ name, email, message, phone, website }),
      });

      if (error) throw error;
    } catch (error) {
      this.logger.error('sendContactEmail failed', error);
      throw error;
    }
  }
}
