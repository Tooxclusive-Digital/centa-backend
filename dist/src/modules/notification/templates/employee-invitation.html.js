"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.employeeInvitationHtml = void 0;
const _layout_1 = require("./_layout");
const employeeInvitationHtml = ({ name, companyName, verifyLink, }) => (0, _layout_1.layout)({
    title: 'Account Activation',
    preheader: `You've been added to ${companyName} on CentaHR. Activate your account to get started.`,
    heading: 'Activate your account',
    subheading: `Hi <strong style="color: ${_layout_1.theme.text}">${(0, _layout_1.esc)(name)}</strong>,`,
    logoAlt: companyName,
    body: `<p style="margin: 0 0 14px 0">
                  You've been added to <strong>${(0, _layout_1.esc)(companyName)}</strong> on
                  CentaHR.
                </p>

                <p style="margin: 0 0 14px 0">
                  This gives you secure access to the company portal, where you
                  can:
                </p>

                <ul style="margin: 0 0 14px 18px; padding: 0; color: ${_layout_1.theme.body}">
                  <li style="margin: 6px 0">View and download payslips</li>
                  <li style="margin: 6px 0">
                    Manage your personal and employment information
                  </li>
                  <li style="margin: 6px 0">Update bank and tax details</li>
                  <li style="margin: 6px 0">
                    Access other company tools and resources
                  </li>
                </ul>

                <p style="margin: 0">
                  To get started, please set up your account by clicking the
                  button below:
                </p>`,
    cta: `${(0, _layout_1.button)(verifyLink, 'Activate Account')}
                ${(0, _layout_1.linkFallback)(verifyLink)}`,
    footer: `<p style="margin: 0 0 16px 0">
                  If you have any questions, feel free to reach out to your HR
                  or company administrator.
                </p>

                <p style="margin: 0">
                  Best regards,<br />
                  <strong>${(0, _layout_1.esc)(companyName)}</strong><br />
                  HR &amp; Payroll Team
                </p>`,
});
exports.employeeInvitationHtml = employeeInvitationHtml;
//# sourceMappingURL=employee-invitation.html.js.map