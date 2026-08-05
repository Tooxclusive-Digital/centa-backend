import { Injectable, Logger } from '@nestjs/common';
import { ResendProvider } from '../resend.provider';
import { passwordResetHtml } from '../templates/password-reset.html';

@Injectable()
export class PasswordResetEmailService {
  private readonly logger = new Logger(PasswordResetEmailService.name);

  constructor(private readonly resend: ResendProvider) {}

  async sendPasswordResetEmail(email: string, name: string, url: string) {
    try {
      const { error } = await this.resend.client.emails.send({
        to: email,
        from: 'CentaHR <noreply@centahr.com>',
        subject: 'Reset your password',
        html: passwordResetHtml({ name, verifyLink: url }),
      });

      if (error) throw error;
    } catch (error) {
      this.logger.error('sendPasswordResetEmail failed', error);
      throw error;
    }
  }
}
