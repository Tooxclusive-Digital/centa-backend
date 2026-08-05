"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.announcementHtml = void 0;
const _layout_1 = require("./_layout");
const announcementHtml = ({ firstName, title, body, publishedAt, expiresAt, companyName, url, }) => (0, _layout_1.layout)({
    title: 'Announcement',
    preheader: `${companyName}: ${title}`,
    heading: title,
    subheading: `Hi <strong style="color: ${_layout_1.theme.text}">${(0, _layout_1.esc)(firstName)}</strong>,`,
    logoAlt: companyName,
    body: `<p style="margin: 0 0 14px 0">
                  A new announcement has been posted at
                  <strong>${(0, _layout_1.esc)(companyName)}</strong>.
                </p>

                <p style="margin: 0 0 16px 0; white-space: pre-wrap">${(0, _layout_1.esc)(body)}</p>
                ${publishedAt || expiresAt
        ? (0, _layout_1.panel)(`
                  <tr>
                    <td style="padding: 4px 16px 12px 16px">
                      <table width="100%">
                        ${publishedAt ? (0, _layout_1.detailRow)('Published', publishedAt) : ''}
                        ${expiresAt ? (0, _layout_1.detailRow)('Expires', expiresAt) : ''}
                      </table>
                    </td>
                  </tr>`)
        : ''}`,
    cta: (0, _layout_1.button)(url, 'View Announcement'),
    footer: `<p style="margin: 0 0 16px 0">
                  If you have any questions, feel free to reach out to your HR or
                  company administrator.
                </p>

                <p style="margin: 0">
                  Best regards,<br />
                  <strong>${(0, _layout_1.esc)(companyName)}</strong><br />
                  HR &amp; Payroll Team
                </p>`,
});
exports.announcementHtml = announcementHtml;
//# sourceMappingURL=announcement.html.js.map