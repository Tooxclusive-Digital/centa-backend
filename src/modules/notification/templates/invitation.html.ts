import { layout, button, linkFallback, esc, theme } from './_layout';

export interface InvitationHtmlProps {
  name: string;
  companyName: string;
  role: string;
  verifyLink: string;
}

export const invitationHtml = ({
  name,
  companyName,
  role,
  verifyLink,
}: InvitationHtmlProps): string =>
  layout({
    title: 'Invitation',
    preheader: `You've been invited to join ${companyName} as ${role} on CentaHR.`,
    heading: 'You have been invited',
    subheading: `Hi <strong style="color: ${theme.text}">${esc(name)}</strong>,`,
    logoAlt: companyName,
    body: `<p style="margin: 0 0 14px 0">
                  You've been invited to join <strong>${esc(companyName)}</strong>
                  on CentaHR as <strong>${esc(role)}</strong>.
                </p>

                <p style="margin: 0">
                  Accept the invitation below to set up your account and get
                  started.
                </p>`,
    cta: `${button(verifyLink, 'Accept Invitation')}
                ${linkFallback(verifyLink)}`,
    footer: `<p style="margin: 0 0 16px 0">
                  If you have any questions, feel free to reach out to your HR or
                  company administrator.
                </p>

                <p style="margin: 0">
                  Best regards,<br />
                  <strong>${esc(companyName)}</strong><br />
                  HR &amp; Payroll Team
                </p>`,
  });
