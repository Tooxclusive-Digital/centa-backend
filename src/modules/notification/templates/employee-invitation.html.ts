import { layout, button, linkFallback, esc, theme } from './_layout';

export interface EmployeeInvitationHtmlProps {
  name: string;
  companyName: string;
  verifyLink: string;
}

export const employeeInvitationHtml = ({
  name,
  companyName,
  verifyLink,
}: EmployeeInvitationHtmlProps): string =>
  layout({
    title: 'Account Activation',
    preheader: `You've been added to ${companyName} on CentaHR. Activate your account to get started.`,
    heading: 'Activate your account',
    subheading: `Hi <strong style="color: ${theme.text}">${esc(name)}</strong>,`,
    logoAlt: companyName,
    body: `<p style="margin: 0 0 14px 0">
                  You've been added to <strong>${esc(companyName)}</strong> on
                  CentaHR.
                </p>

                <p style="margin: 0 0 14px 0">
                  This gives you secure access to the company portal, where you
                  can:
                </p>

                <ul style="margin: 0 0 14px 18px; padding: 0; color: ${theme.body}">
                  <li style="margin: 6px 0">View and download payslips</li>
                  <li style="margin: 6px 0">
                    Manage your personal and employment information
                  </li>
                  <li style="margin: 6px 0">Update bank and tax details</li>
                  <li style="margin: 6px 0">
                    Access other company tools and resources
                  </li>
                </ul>

                <p style="margin: 0">
                  To get started, please set up your account by clicking the
                  button below:
                </p>`,
    cta: `${button(verifyLink, 'Activate Account')}
                ${linkFallback(verifyLink)}`,
    footer: `<p style="margin: 0 0 16px 0">
                  If you have any questions, feel free to reach out to your HR
                  or company administrator.
                </p>

                <p style="margin: 0">
                  Best regards,<br />
                  <strong>${esc(companyName)}</strong><br />
                  HR &amp; Payroll Team
                </p>`,
  });
