import { layout, button, panel, detailRow, esc, theme } from './_layout';

const goalFooter = (companyName?: string) => `<p style="margin: 0 0 16px 0">
                  If you have any questions, feel free to reach out to your HR or
                  company administrator.
                </p>

                <p style="margin: 0">
                  Best regards,<br />
                  <strong>${esc(companyName || 'CentaHR')}</strong><br />
                  HR &amp; Payroll Team
                </p>`;

// ---------------------------------------------------------------------------
// Check-in reminder
// ---------------------------------------------------------------------------

export interface GoalCheckinHtmlProps {
  firstName: string;
  title: string;
  dueDate?: string;
  companyName?: string;
  url: string;
}

export const goalCheckinHtml = ({
  firstName,
  title,
  dueDate,
  companyName,
  url,
}: GoalCheckinHtmlProps): string =>
  layout({
    title: 'Goal Check-in',
    preheader: `Time to check in on your goal: ${title}`,
    heading: 'Goal check-in',
    subheading: `Hi <strong style="color: ${theme.text}">${esc(firstName)}</strong>,`,
    body: `<p style="margin: 0 0 14px 0">
                  This is a reminder to update your progress on the goal below.
                </p>

                ${panel(`
                  <tr>
                    <td style="padding: 16px">
                      <div style="font-size: 13px; color: ${theme.muted}">Goal</div>
                      <div style="font-size: 16px; font-weight: 700">${esc(title)}</div>
                    </td>
                  </tr>
                  ${
                    dueDate
                      ? `<tr>
                    <td style="padding: 0 16px 16px 16px">
                      <table width="100%">
                        ${detailRow('Due Date', dueDate)}
                      </table>
                    </td>
                  </tr>`
                      : ''
                  }`)}`,
    cta: button(url, 'Update Progress'),
    footer: goalFooter(companyName),
  });

// ---------------------------------------------------------------------------
// Assignment
// ---------------------------------------------------------------------------

export interface GoalAssignmentHtmlProps {
  assignedBy: string;
  assignedTo: string;
  title: string;
  dueDate: string;
  description: string;
  progress: string;
  url: string;
}

export const goalAssignmentHtml = ({
  assignedBy,
  assignedTo,
  title,
  dueDate,
  description,
  progress,
  url,
}: GoalAssignmentHtmlProps): string =>
  layout({
    title: 'Goal Assignment',
    preheader: `${assignedBy} assigned you a new goal: ${title}`,
    heading: 'A new goal was assigned to you',
    subheading: `Hi <strong style="color: ${theme.text}">${esc(assignedTo)}</strong>,`,
    body: `<p style="margin: 0 0 14px 0">
                  <strong>${esc(assignedBy)}</strong> has assigned you a new
                  goal.
                </p>

                ${panel(`
                  <tr>
                    <td style="padding: 16px">
                      <div style="font-size: 13px; color: ${theme.muted}">Goal</div>
                      <div style="font-size: 16px; font-weight: 700">${esc(title)}</div>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 0 16px 16px 16px">
                      <table width="100%">
                        ${detailRow('Due Date', dueDate)}
                        ${detailRow('Progress', progress)}
                        ${detailRow('Description', description)}
                      </table>
                    </td>
                  </tr>`)}`,
    cta: button(url, 'View Goal'),
    footer: goalFooter(),
  });

// ---------------------------------------------------------------------------
// Update posted
// ---------------------------------------------------------------------------

export interface GoalUpdateHtmlProps {
  firstName: string;
  addedBy: string;
  title: string;
  url: string;
}

export const goalUpdateHtml = ({
  firstName,
  addedBy,
  title,
  url,
}: GoalUpdateHtmlProps): string =>
  layout({
    title: 'Goal Update',
    preheader: `${addedBy} posted an update on ${title}`,
    heading: 'New update on your goal',
    subheading: `Hi <strong style="color: ${theme.text}">${esc(firstName)}</strong>,`,
    body: `<p style="margin: 0 0 14px 0">
                  <strong>${esc(addedBy)}</strong> posted an update on the goal
                  <strong>${esc(title)}</strong>.
                </p>

                <p style="margin: 0">
                  Open the goal to see the latest progress and comments.
                </p>`,
    cta: button(url, 'View Update'),
    footer: goalFooter(),
  });

// ---------------------------------------------------------------------------
// Approval request
// ---------------------------------------------------------------------------

export interface GoalApprovalRequestHtmlProps {
  managerName: string;
  employeeName: string;
  title: string;
  dueDate: string;
  description: string;
  url: string;
}

export const goalApprovalRequestHtml = ({
  managerName,
  employeeName,
  title,
  dueDate,
  description,
  url,
}: GoalApprovalRequestHtmlProps): string =>
  layout({
    title: 'Goal Approval Required',
    preheader: `${employeeName} submitted a goal for your approval: ${title}`,
    heading: 'Goal approval required',
    subheading: `Hi <strong style="color: ${theme.text}">${esc(managerName)}</strong>,`,
    body: `<p style="margin: 0 0 14px 0">
                  <strong>${esc(employeeName)}</strong> has submitted a goal that
                  needs your review.
                </p>

                ${panel(`
                  <tr>
                    <td style="padding: 16px">
                      <div style="font-size: 13px; color: ${theme.muted}">Goal</div>
                      <div style="font-size: 16px; font-weight: 700">${esc(title)}</div>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 0 16px 16px 16px">
                      <table width="100%">
                        ${detailRow('Employee', employeeName)}
                        ${detailRow('Due Date', dueDate)}
                        ${detailRow('Description', description)}
                      </table>
                    </td>
                  </tr>`)}`,
    cta: button(url, 'Review Goal'),
    footer: goalFooter(),
  });
