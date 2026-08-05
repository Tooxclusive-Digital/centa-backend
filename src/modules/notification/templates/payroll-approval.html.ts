import { layout, button, linkFallback, esc, theme } from './_layout';

export interface PayrollApprovalHtmlProps {
  name: string;
  month: string;
  companyName: string;
  url: string;
}

export const payrollApprovalHtml = ({
  name,
  month,
  companyName,
  url,
}: PayrollApprovalHtmlProps): string =>
  layout({
    title: 'Payroll Approval',
    preheader: `Payroll for ${month} is awaiting your approval.`,
    heading: `Approve payroll for ${month}`,
    subheading: `Hi <strong style="color: ${theme.text}">${esc(name)}</strong>,`,
    logoAlt: companyName,
    body: `<p style="margin: 0 0 14px 0">
                  Payroll for <strong>${esc(month)}</strong> at
                  <strong>${esc(companyName)}</strong> has been prepared and is
                  awaiting your approval.
                </p>

                <p style="margin: 0">
                  Please review the run and approve it so payments can be
                  processed on schedule.
                </p>`,
    cta: `${button(url, 'Review & Approve')}
                ${linkFallback(url)}`,
    footer: `<p style="margin: 0 0 16px 0">
                  If you believe you received this in error, please contact your
                  company administrator.
                </p>

                <p style="margin: 0">
                  Best regards,<br />
                  <strong>${esc(companyName)}</strong><br />
                  HR &amp; Payroll Team
                </p>`,
  });
