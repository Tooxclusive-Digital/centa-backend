import { layout, button, panel, detailRow, esc, theme } from './_layout';

export interface AssetRequestHtmlProps {
  employeeName: string;
  companyName: string;
  statusTitle: string;
  statusMessage: string;
  assetType: string;
  purpose: string;
  urgency: string;
  notes?: string;
  rejectionReason?: string;
  remarks?: string;
  actionUrl?: string;
  actionText?: string;
  logoUrl?: string;
}

export const assetRequestHtml = ({
  employeeName,
  companyName,
  statusTitle,
  statusMessage,
  assetType,
  purpose,
  urgency,
  notes,
  rejectionReason,
  remarks,
  actionUrl,
  actionText = 'View Request',
  logoUrl,
}: AssetRequestHtmlProps): string =>
  layout({
    title: 'Asset Request Update',
    preheader: `Asset request ${statusTitle} for ${employeeName} (${assetType})`,
    heading: `Asset Request ${statusTitle}`,
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
                        ${detailRow('Asset Type', assetType)}
                        ${detailRow('Purpose', purpose)}
                        ${detailRow('Urgency', urgency)}
                        ${notes ? detailRow('Notes', notes) : ''}
                        ${remarks ? detailRow('Remarks', remarks) : ''}
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
