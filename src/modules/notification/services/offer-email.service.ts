import { Injectable, Logger } from '@nestjs/common';
import { ResendProvider } from '../resend.provider';
import { offerHtml } from '../templates/offer.html';
import { fromHeader } from '../templates/_layout';

@Injectable()
export class OfferEmailService {
  private readonly logger = new Logger(OfferEmailService.name);

  constructor(private readonly resend: ResendProvider) {}

  async sendOfferEmail(
    email: string,
    candidateName: string,
    jobTitle: string,
    companyName: string,
    offerUrl: string,
    companyLogo?: string,
  ) {
    try {
      const { error } = await this.resend.client.emails.send({
        to: email,
        from: fromHeader(`${companyName} HR`, 'noreply@centahr.com'),
        subject: `Your Job Offer for ${jobTitle} at ${companyName}`,
        html: offerHtml({
          name: candidateName,
          jobTitle,
          companyName,
          offerLink: offerUrl,
          companyLogo,
        }),
      });

      if (error) throw error;
    } catch (error) {
      this.logger.error('sendOfferEmail failed', error);
      throw error;
    }
  }
}
