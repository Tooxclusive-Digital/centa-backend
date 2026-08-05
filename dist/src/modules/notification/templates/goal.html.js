"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.goalApprovalRequestHtml = exports.goalUpdateHtml = exports.goalAssignmentHtml = exports.goalCheckinHtml = void 0;
const _layout_1 = require("./_layout");
const goalFooter = (companyName) => `<p style="margin: 0 0 16px 0">
                  If you have any questions, feel free to reach out to your HR or
                  company administrator.
                </p>

                <p style="margin: 0">
                  Best regards,<br />
                  <strong>${(0, _layout_1.esc)(companyName || 'CentaHR')}</strong><br />
                  HR &amp; Payroll Team
                </p>`;
const goalCheckinHtml = ({ firstName, title, dueDate, companyName, url, }) => (0, _layout_1.layout)({
    title: 'Goal Check-in',
    preheader: `Time to check in on your goal: ${title}`,
    heading: 'Goal check-in',
    subheading: `Hi <strong style="color: ${_layout_1.theme.text}">${(0, _layout_1.esc)(firstName)}</strong>,`,
    body: `<p style="margin: 0 0 14px 0">
                  This is a reminder to update your progress on the goal below.
                </p>

                ${(0, _layout_1.panel)(`
                  <tr>
                    <td style="padding: 16px">
                      <div style="font-size: 13px; color: ${_layout_1.theme.muted}">Goal</div>
                      <div style="font-size: 16px; font-weight: 700">${(0, _layout_1.esc)(title)}</div>
                    </td>
                  </tr>
                  ${dueDate
        ? `<tr>
                    <td style="padding: 0 16px 16px 16px">
                      <table width="100%">
                        ${(0, _layout_1.detailRow)('Due Date', dueDate)}
                      </table>
                    </td>
                  </tr>`
        : ''}`)}`,
    cta: (0, _layout_1.button)(url, 'Update Progress'),
    footer: goalFooter(companyName),
});
exports.goalCheckinHtml = goalCheckinHtml;
const goalAssignmentHtml = ({ assignedBy, assignedTo, title, dueDate, description, progress, url, }) => (0, _layout_1.layout)({
    title: 'Goal Assignment',
    preheader: `${assignedBy} assigned you a new goal: ${title}`,
    heading: 'A new goal was assigned to you',
    subheading: `Hi <strong style="color: ${_layout_1.theme.text}">${(0, _layout_1.esc)(assignedTo)}</strong>,`,
    body: `<p style="margin: 0 0 14px 0">
                  <strong>${(0, _layout_1.esc)(assignedBy)}</strong> has assigned you a new
                  goal.
                </p>

                ${(0, _layout_1.panel)(`
                  <tr>
                    <td style="padding: 16px">
                      <div style="font-size: 13px; color: ${_layout_1.theme.muted}">Goal</div>
                      <div style="font-size: 16px; font-weight: 700">${(0, _layout_1.esc)(title)}</div>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 0 16px 16px 16px">
                      <table width="100%">
                        ${(0, _layout_1.detailRow)('Due Date', dueDate)}
                        ${(0, _layout_1.detailRow)('Progress', progress)}
                        ${(0, _layout_1.detailRow)('Description', description)}
                      </table>
                    </td>
                  </tr>`)}`,
    cta: (0, _layout_1.button)(url, 'View Goal'),
    footer: goalFooter(),
});
exports.goalAssignmentHtml = goalAssignmentHtml;
const goalUpdateHtml = ({ firstName, addedBy, title, url, }) => (0, _layout_1.layout)({
    title: 'Goal Update',
    preheader: `${addedBy} posted an update on ${title}`,
    heading: 'New update on your goal',
    subheading: `Hi <strong style="color: ${_layout_1.theme.text}">${(0, _layout_1.esc)(firstName)}</strong>,`,
    body: `<p style="margin: 0 0 14px 0">
                  <strong>${(0, _layout_1.esc)(addedBy)}</strong> posted an update on the goal
                  <strong>${(0, _layout_1.esc)(title)}</strong>.
                </p>

                <p style="margin: 0">
                  Open the goal to see the latest progress and comments.
                </p>`,
    cta: (0, _layout_1.button)(url, 'View Update'),
    footer: goalFooter(),
});
exports.goalUpdateHtml = goalUpdateHtml;
const goalApprovalRequestHtml = ({ managerName, employeeName, title, dueDate, description, url, }) => (0, _layout_1.layout)({
    title: 'Goal Approval Required',
    preheader: `${employeeName} submitted a goal for your approval: ${title}`,
    heading: 'Goal approval required',
    subheading: `Hi <strong style="color: ${_layout_1.theme.text}">${(0, _layout_1.esc)(managerName)}</strong>,`,
    body: `<p style="margin: 0 0 14px 0">
                  <strong>${(0, _layout_1.esc)(employeeName)}</strong> has submitted a goal that
                  needs your review.
                </p>

                ${(0, _layout_1.panel)(`
                  <tr>
                    <td style="padding: 16px">
                      <div style="font-size: 13px; color: ${_layout_1.theme.muted}">Goal</div>
                      <div style="font-size: 16px; font-weight: 700">${(0, _layout_1.esc)(title)}</div>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 0 16px 16px 16px">
                      <table width="100%">
                        ${(0, _layout_1.detailRow)('Employee', employeeName)}
                        ${(0, _layout_1.detailRow)('Due Date', dueDate)}
                        ${(0, _layout_1.detailRow)('Description', description)}
                      </table>
                    </td>
                  </tr>`)}`,
    cta: (0, _layout_1.button)(url, 'Review Goal'),
    footer: goalFooter(),
});
exports.goalApprovalRequestHtml = goalApprovalRequestHtml;
//# sourceMappingURL=goal.html.js.map