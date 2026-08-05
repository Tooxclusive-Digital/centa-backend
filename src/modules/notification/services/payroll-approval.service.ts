import { Injectable, Logger } from '@nestjs/common';
import { ResendProvider } from '../resend.provider';
import { payrollApprovalHtml } from '../templates/payroll-approval.html';

@Injectable()
export class PayrollApprovalEmailService {
  private readonly logger = new Logger(PayrollApprovalEmailService.name);

  constructor(private readonly resend: ResendProvider) {}

  async sendApprovalEmail(
    email: string,
    name: string,
    url: string,
    month: string,
    companyName: string,
  ) {
    try {
      const { error } = await this.resend.client.emails.send({
        to: email,
        from: 'CentaHR <noreply@centahr.com>',
        subject: `Action Required: Approve Payroll for ${month}`,
        html: payrollApprovalHtml({ name, month, companyName, url }),
      });

      if (error) throw error;
    } catch (error) {
      this.logger.error('sendApprovalEmail failed', error);
      throw error;
    }
  }
}
