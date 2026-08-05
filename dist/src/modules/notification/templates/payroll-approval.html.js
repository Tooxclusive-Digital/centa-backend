"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.payrollApprovalHtml = void 0;
const _layout_1 = require("./_layout");
const payrollApprovalHtml = ({ name, month, companyName, url, }) => (0, _layout_1.layout)({
    title: 'Payroll Approval',
    preheader: `Payroll for ${month} is awaiting your approval.`,
    heading: `Approve payroll for ${month}`,
    subheading: `Hi <strong style="color: ${_layout_1.theme.text}">${(0, _layout_1.esc)(name)}</strong>,`,
    logoAlt: companyName,
    body: `<p style="margin: 0 0 14px 0">
                  Payroll for <strong>${(0, _layout_1.esc)(month)}</strong> at
                  <strong>${(0, _layout_1.esc)(companyName)}</strong> has been prepared and is
                  awaiting your approval.
                </p>

                <p style="margin: 0">
                  Please review the run and approve it so payments can be
                  processed on schedule.
                </p>`,
    cta: `${(0, _layout_1.button)(url, 'Review & Approve')}
                ${(0, _layout_1.linkFallback)(url)}`,
    footer: `<p style="margin: 0 0 16px 0">
                  If you believe you received this in error, please contact your
                  company administrator.
                </p>

                <p style="margin: 0">
                  Best regards,<br />
                  <strong>${(0, _layout_1.esc)(companyName)}</strong><br />
                  HR &amp; Payroll Team
                </p>`,
});
exports.payrollApprovalHtml = payrollApprovalHtml;
//# sourceMappingURL=payroll-approval.html.js.map