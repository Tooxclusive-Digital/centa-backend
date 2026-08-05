import { Injectable, Logger } from '@nestjs/common';
import { ResendProvider } from '../resend.provider';
import { invitationHtml } from '../templates/invitation.html';
import { fromHeader } from '../templates/_layout';

@Injectable()
export class InvitationService {
  private readonly logger = new Logger(InvitationService.name);

  constructor(private readonly resend: ResendProvider) {}

  async sendInvitationEmail(
    email: string,
    name: string,
    companyName: string,
    role: string,
    url: string,
  ) {
    try {
      const { error } = await this.resend.client.emails.send({
        to: email,
        // was noreply@centa.africa — consolidated onto the verified domain
        from: fromHeader(`Invitation to Join as ${role}`, 'noreply@centahr.com'),
        subject: `Invitation to Join ${companyName} as ${role}`,
        html: invitationHtml({ name, companyName, role, verifyLink: url }),
      });

      if (error) throw error;
    } catch (error) {
      this.logger.error('sendInvitationEmail failed', error);
      throw error;
    }
  }
}
