"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assessmentReminderHtml = void 0;
const _layout_1 = require("./_layout");
const assessmentReminderHtml = ({ firstName, employeeName, reviewerName, cycleName, dueDate, companyName, url, }) => (0, _layout_1.layout)({
    title: 'Performance Review',
    preheader: `Reminder: ${cycleName} performance review${dueDate ? ` due ${dueDate}` : ''}.`,
    heading: 'Performance review reminder',
    subheading: `Hi <strong style="color: ${_layout_1.theme.text}">${(0, _layout_1.esc)(firstName)}</strong>,`,
    logoAlt: companyName,
    body: `<p style="margin: 0 0 14px 0">
                  This is a reminder about an outstanding performance review for
                  the <strong>${(0, _layout_1.esc)(cycleName)}</strong> cycle.
                </p>

                ${(0, _layout_1.panel)(`
                  <tr>
                    <td style="padding: 16px">
                      <div style="font-size: 13px; color: ${_layout_1.theme.muted}">Review Cycle</div>
                      <div style="font-size: 16px; font-weight: 700">${(0, _layout_1.esc)(cycleName)}</div>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 0 16px 16px 16px">
                      <table width="100%">
                        ${(0, _layout_1.detailRow)('Employee', employeeName)}
                        ${reviewerName ? (0, _layout_1.detailRow)('Reviewer', reviewerName) : ''}
                        ${dueDate ? (0, _layout_1.detailRow)('Due Date', dueDate) : ''}
                      </table>
                    </td>
                  </tr>`)}`,
    cta: (0, _layout_1.button)(url, 'Complete Review'),
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
exports.assessmentReminderHtml = assessmentReminderHtml;
//# sourceMappingURL=assessment-reminder.html.js.map