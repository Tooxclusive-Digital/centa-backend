"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contactMessageHtml = void 0;
const _layout_1 = require("./_layout");
const contactMessageHtml = ({ name, email, message, phone, website, }) => (0, _layout_1.layout)({
    title: 'Contact Message',
    preheader: `New contact message from ${name}.`,
    heading: 'New contact message',
    subheading: `Submitted through the CentaHR website contact form.`,
    body: `${(0, _layout_1.panel)(`
                  <tr>
                    <td style="padding: 16px">
                      <div style="font-size: 13px; color: ${_layout_1.theme.muted}">From</div>
                      <div style="font-size: 16px; font-weight: 700">${(0, _layout_1.esc)(name)}</div>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 0 16px 16px 16px">
                      <table width="100%">
                        ${(0, _layout_1.detailRow)('Email', email)}
                        ${(0, _layout_1.detailRow)('Phone', phone || 'N/A')}
                        ${(0, _layout_1.detailRow)('Website', website || 'N/A')}
                      </table>
                    </td>
                  </tr>`)}

                <p style="margin: 16px 0 6px 0; font-size: 13px; color: ${_layout_1.theme.muted}">
                  Message
                </p>
                <p style="margin: 0; white-space: pre-wrap">${(0, _layout_1.esc)(message)}</p>`,
    footer: `<p style="margin: 0">
                  Reply directly to <strong>${(0, _layout_1.esc)(email)}</strong> to respond.
                </p>`,
});
exports.contactMessageHtml = contactMessageHtml;
//# sourceMappingURL=contact-message.html.js.map