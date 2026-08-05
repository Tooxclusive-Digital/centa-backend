import { layout, esc, theme } from './_layout';

// ---------------------------------------------------------------------------
// To the birthday person
// ---------------------------------------------------------------------------

export interface BirthdayHtmlProps {
  firstName: string;
  companyName: string;
}

export const birthdayHtml = ({
  firstName,
  companyName,
}: BirthdayHtmlProps): string =>
  layout({
    title: 'Happy Birthday',
    preheader: `Happy birthday, ${firstName}! Everyone at ${companyName} is celebrating you today.`,
    heading: `Happy Birthday, ${firstName}! 🎂`,
    subheading: `Wishing you a wonderful day from all of us.`,
    logoAlt: companyName,
    body: `<p style="margin: 0 0 14px 0">
                  Everyone at <strong>${esc(companyName)}</strong> wants to wish
                  you a very happy birthday.
                </p>

                <p style="margin: 0 0 14px 0">
                  Thank you for everything you bring to the team. We hope your
                  day is a great one — enjoy every moment of it.
                </p>

                <p style="margin: 0; font-size: 32px; line-height: 1.2">🎉 🎂 🎈</p>`,
    footer: `<p style="margin: 0">
                  Warmest wishes,<br />
                  <strong>${esc(companyName)}</strong><br />
                  HR &amp; Payroll Team
                </p>`,
  });

// ---------------------------------------------------------------------------
// To colleagues
// ---------------------------------------------------------------------------

export interface BirthdayTeamHtmlProps {
  /** Recipient's first name. */
  firstName: string;
  /** Whose birthday it is. */
  celebrantName: string;
  celebrantDepartment?: string | null;
  companyName: string;
}

export const birthdayTeamHtml = ({
  firstName,
  celebrantName,
  celebrantDepartment,
  companyName,
}: BirthdayTeamHtmlProps): string =>
  layout({
    title: 'Team Birthday',
    preheader: `It's ${celebrantName}'s birthday today.`,
    heading: `It's ${celebrantName}'s birthday! 🎂`,
    subheading: `Hi <strong style="color: ${theme.text}">${esc(firstName)}</strong>,`,
    logoAlt: companyName,
    body: `<p style="margin: 0 0 14px 0">
                  <strong>${esc(celebrantName)}</strong>${
                    celebrantDepartment
                      ? ` from ${esc(celebrantDepartment)}`
                      : ''
                  } is celebrating a birthday today.
                </p>

                <p style="margin: 0">
                  Take a moment to send them your best wishes.
                </p>`,
    footer: `<p style="margin: 0">
                  <strong>${esc(companyName)}</strong><br />
                  HR &amp; Payroll Team
                </p>`,
  });
