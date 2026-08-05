// src/email/services/newsletter-email.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ResendProvider } from '../resend.provider';
import { newsletterHtml } from '../templates/newsletter.html';
import { NewsletterRecipientDto } from '../dto/newsletter-recipient.dto';

/** Resend accepts at most 100 messages per batch call. */
const BATCH_LIMIT = 100;

const SUBJECT = 'Cut HR admin by 40% with AI-driven efficiency';

@Injectable()
export class NewsletterEmailService {
  private readonly logger = new Logger(NewsletterEmailService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly resend: ResendProvider,
  ) {}

  /**
   * SendGrid rendered one message per `personalizations` entry server-side.
   * Resend has no merge-field equivalent, so each recipient's HTML is rendered
   * here and sent through the batch endpoint in chunks of 100.
   */
  async sendNewsletter(
    recipients: NewsletterRecipientDto[],
    opts?: { campaignName?: string; categories?: string[] },
  ) {
    if (!recipients?.length) return;

    const ctaUrl = this.config.get<string>('CLIENT_URL') || 'https://centahr.com';
    const unsubscribeBase = this.config.get<string>('NEWSLETTER_UNSUBSCRIBE_URL');

    const messages = recipients.map((r) => {
      const unsubscribeUrl = unsubscribeBase
        ? `${unsubscribeBase}?email=${encodeURIComponent(r.email)}`
        : undefined;

      return {
        to: r.email,
        from: 'CentaHR <marketing@centahr.com>',
        subject: SUBJECT,
        html: newsletterHtml({
          firstName: r.name || 'there',
          companyName: r.companyName,
          ctaUrl,
          unsubscribeUrl,
        }),
        // SendGrid categories/customArgs -> Resend tags. Tag values must be
        // ASCII alphanumeric, underscores or dashes.
        tags: [
          { name: 'type', value: 'newsletter' },
          ...(opts?.campaignName
            ? [{ name: 'campaign', value: this.tagValue(opts.campaignName) }]
            : []),
          ...(opts?.categories || []).map((c) => ({
            name: 'category',
            value: this.tagValue(c),
          })),
        ],
        ...(unsubscribeUrl
          ? { headers: { 'List-Unsubscribe': `<${unsubscribeUrl}>` } }
          : {}),
      };
    });

    let sent = 0;

    for (let i = 0; i < messages.length; i += BATCH_LIMIT) {
      const chunk = messages.slice(i, i + BATCH_LIMIT);

      try {
        const { error } = await this.resend.client.batch.send(chunk);
        if (error) throw error;

        sent += chunk.length;
      } catch (error) {
        this.logger.error(
          `Newsletter batch failed (recipients ${i + 1}-${i + chunk.length})`,
          error,
        );
        throw error;
      }
    }

    this.logger.log(`Newsletter sent: ${sent} recipients.`);
  }

  /** Resend rejects tag values outside [A-Za-z0-9_-]. */
  private tagValue(raw: string) {
    return raw.replace(/[^A-Za-z0-9_-]/g, '_').slice(0, 256);
  }
}
