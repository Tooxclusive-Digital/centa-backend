import {
  layout,
  button,
  panel,
  detailRow,
  esc,
  theme,
} from './_layout';

export interface LeaveRequestHtmlProps {
  employeeName: string;
  companyName: string;
  statusTitle: string;
  statusMessage: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  totalDays: string;
  rejectionReason?: string;
  actionUrl?: string;
  actionText?: string;
  logoUrl?: string;
}

export const leaveRequestHtml = ({
  employeeName,
  companyName,
  statusTitle,
  statusMessage,
  leaveType,
  startDate,
  endDate,
  totalDays,
  rejectionReason,
  actionUrl,
  actionText = 'View Request',
  logoUrl,
}: LeaveRequestHtmlProps): string =>
  layout({
    title: 'Leave Request Update',
    preheader: `Leave request ${statusTitle} for ${employeeName} (${startDate} – ${endDate})`,
    heading: `Leave Request ${statusTitle}`,
    subheading: `Hello <strong style="color: ${theme.text}">${esc(employeeName)}</strong>, ${esc(statusMessage)}`,
    logoUrl,
    logoAlt: companyName,
    body: panel(`
                  <tr>
                    <td style="padding: 16px">
                      <div style="font-size: 13px; color: ${theme.muted}">Employee</div>
                      <div style="font-size: 16px; font-weight: 700">${esc(employeeName)}</div>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 0 16px 16px 16px">
                      <table width="100%">
                        ${detailRow('Leave Type', leaveType)}
                        ${detailRow('Dates', `${startDate} — ${endDate}`)}
                        ${detailRow('Total Days', totalDays)}
                        ${rejectionReason ? detailRow('Rejection Reason', rejectionReason) : ''}
                      </table>
                    </td>
                  </tr>`),
    cta: actionUrl ? button(actionUrl, actionText) : undefined,
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
