import { layout, button, panel, detailRow, esc, theme } from './_layout';

export interface AnnouncementHtmlProps {
  firstName: string;
  title: string;
  /** Admin-authored plain text — escaped, with newlines preserved. */
  body: string;
  publishedAt?: string;
  expiresAt?: string;
  companyName: string;
  url: string;
}

export const announcementHtml = ({
  firstName,
  title,
  body,
  publishedAt,
  expiresAt,
  companyName,
  url,
}: AnnouncementHtmlProps): string =>
  layout({
    title: 'Announcement',
    preheader: `${companyName}: ${title}`,
    heading: title,
    subheading: `Hi <strong style="color: ${theme.text}">${esc(firstName)}</strong>,`,
    logoAlt: companyName,
    body: `<p style="margin: 0 0 14px 0">
                  A new announcement has been posted at
                  <strong>${esc(companyName)}</strong>.
                </p>

                <p style="margin: 0 0 16px 0; white-space: pre-wrap">${esc(body)}</p>
                ${
                  publishedAt || expiresAt
                    ? panel(`
                  <tr>
                    <td style="padding: 4px 16px 12px 16px">
                      <table width="100%">
                        ${publishedAt ? detailRow('Published', publishedAt) : ''}
                        ${expiresAt ? detailRow('Expires', expiresAt) : ''}
                      </table>
                    </td>
                  </tr>`)
                    : ''
                }`,
    cta: button(url, 'View Announcement'),
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
