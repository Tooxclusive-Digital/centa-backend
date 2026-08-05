"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.leaveRequestHtml = void 0;
const _layout_1 = require("./_layout");
const leaveRequestHtml = ({ employeeName, companyName, statusTitle, statusMessage, leaveType, startDate, endDate, totalDays, rejectionReason, actionUrl, actionText = 'View Request', logoUrl, }) => (0, _layout_1.layout)({
    title: 'Leave Request Update',
    preheader: `Leave request ${statusTitle} for ${employeeName} (${startDate} – ${endDate})`,
    heading: `Leave Request ${statusTitle}`,
    subheading: `Hello <strong style="color: ${_layout_1.theme.text}">${(0, _layout_1.esc)(employeeName)}</strong>, ${(0, _layout_1.esc)(statusMessage)}`,
    logoUrl,
    logoAlt: companyName,
    body: (0, _layout_1.panel)(`
                  <tr>
                    <td style="padding: 16px">
                      <div style="font-size: 13px; color: ${_layout_1.theme.muted}">Employee</div>
                      <div style="font-size: 16px; font-weight: 700">${(0, _layout_1.esc)(employeeName)}</div>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 0 16px 16px 16px">
                      <table width="100%">
                        ${(0, _layout_1.detailRow)('Leave Type', leaveType)}
                        ${(0, _layout_1.detailRow)('Dates', `${startDate} — ${endDate}`)}
                        ${(0, _layout_1.detailRow)('Total Days', totalDays)}
                        ${rejectionReason ? (0, _layout_1.detailRow)('Rejection Reason', rejectionReason) : ''}
                      </table>
                    </td>
                  </tr>`),
    cta: actionUrl ? (0, _layout_1.button)(actionUrl, actionText) : undefined,
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
exports.leaveRequestHtml = leaveRequestHtml;
//# sourceMappingURL=leave-request.html.js.map