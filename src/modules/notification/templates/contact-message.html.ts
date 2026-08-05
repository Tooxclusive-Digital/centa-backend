import { layout, panel, detailRow, esc, theme } from './_layout';

export interface ContactMessageHtmlProps {
  name: string;
  email: string;
  message: string;
  phone?: string;
  website?: string;
}

export const contactMessageHtml = ({
  name,
  email,
  message,
  phone,
  website,
}: ContactMessageHtmlProps): string =>
  layout({
    title: 'Contact Message',
    preheader: `New contact message from ${name}.`,
    heading: 'New contact message',
    subheading: `Submitted through the CentaHR website contact form.`,
    body: `${panel(`
                  <tr>
                    <td style="padding: 16px">
                      <div style="font-size: 13px; color: ${theme.muted}">From</div>
                      <div style="font-size: 16px; font-weight: 700">${esc(name)}</div>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 0 16px 16px 16px">
                      <table width="100%">
                        ${detailRow('Email', email)}
                        ${detailRow('Phone', phone || 'N/A')}
                        ${detailRow('Website', website || 'N/A')}
                      </table>
                    </td>
                  </tr>`)}

                <p style="margin: 16px 0 6px 0; font-size: 13px; color: ${theme.muted}">
                  Message
                </p>
                <p style="margin: 0; white-space: pre-wrap">${esc(message)}</p>`,
    footer: `<p style="margin: 0">
                  Reply directly to <strong>${esc(email)}</strong> to respond.
                </p>`,
  });
