import { Injectable, Logger } from '@nestjs/common';
import { ResendProvider } from '../resend.provider';
import { employeeInvitationHtml } from '../templates/employee-invitation.html';

@Injectable()
export class EmployeeInvitationService {
  private readonly logger = new Logger(EmployeeInvitationService.name);

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
        from: 'Employee Invitation <noreply@centahr.com>',
        subject: `Invitation to Join ${companyName} as ${role}`,
        html: employeeInvitationHtml({ name, companyName, verifyLink: url }),
      });

      if (error) throw error;
    } catch (error) {
      this.logger.error('sendInvitationEmail failed', error);
      throw error;
    }
  }
}
