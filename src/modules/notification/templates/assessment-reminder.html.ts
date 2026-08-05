import { layout, button, panel, detailRow, esc, theme } from './_layout';

export interface AssessmentReminderHtmlProps {
  firstName: string;
  employeeName: string;
  reviewerName?: string;
  cycleName: string;
  dueDate?: string;
  companyName: string;
  url: string;
}

export const assessmentReminderHtml = ({
  firstName,
  employeeName,
  reviewerName,
  cycleName,
  dueDate,
  companyName,
  url,
}: AssessmentReminderHtmlProps): string =>
  layout({
    title: 'Performance Review',
    preheader: `Reminder: ${cycleName} performance review${dueDate ? ` due ${dueDate}` : ''}.`,
    heading: 'Performance review reminder',
    subheading: `Hi <strong style="color: ${theme.text}">${esc(firstName)}</strong>,`,
    logoAlt: companyName,
    body: `<p style="margin: 0 0 14px 0">
                  This is a reminder about an outstanding performance review for
                  the <strong>${esc(cycleName)}</strong> cycle.
                </p>

                ${panel(`
                  <tr>
                    <td style="padding: 16px">
                      <div style="font-size: 13px; color: ${theme.muted}">Review Cycle</div>
                      <div style="font-size: 16px; font-weight: 700">${esc(cycleName)}</div>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 0 16px 16px 16px">
                      <table width="100%">
                        ${detailRow('Employee', employeeName)}
                        ${reviewerName ? detailRow('Reviewer', reviewerName) : ''}
                        ${dueDate ? detailRow('Due Date', dueDate) : ''}
                      </table>
                    </td>
                  </tr>`)}`,
    cta: button(url, 'Complete Review'),
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
