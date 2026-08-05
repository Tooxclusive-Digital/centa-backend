"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invitationHtml = void 0;
const _layout_1 = require("./_layout");
const invitationHtml = ({ name, companyName, role, verifyLink, }) => (0, _layout_1.layout)({
    title: 'Invitation',
    preheader: `You've been invited to join ${companyName} as ${role} on CentaHR.`,
    heading: 'You have been invited',
    subheading: `Hi <strong style="color: ${_layout_1.theme.text}">${(0, _layout_1.esc)(name)}</strong>,`,
    logoAlt: companyName,
    body: `<p style="margin: 0 0 14px 0">
                  You've been invited to join <strong>${(0, _layout_1.esc)(companyName)}</strong>
                  on CentaHR as <strong>${(0, _layout_1.esc)(role)}</strong>.
                </p>

                <p style="margin: 0">
                  Accept the invitation below to set up your account and get
                  started.
                </p>`,
    cta: `${(0, _layout_1.button)(verifyLink, 'Accept Invitation')}
                ${(0, _layout_1.linkFallback)(verifyLink)}`,
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
exports.invitationHtml = invitationHtml;
//# sourceMappingURL=invitation.html.js.map