"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.birthdayTeamHtml = exports.birthdayHtml = void 0;
const _layout_1 = require("./_layout");
const birthdayHtml = ({ firstName, companyName, }) => (0, _layout_1.layout)({
    title: 'Happy Birthday',
    preheader: `Happy birthday, ${firstName}! Everyone at ${companyName} is celebrating you today.`,
    heading: `Happy Birthday, ${firstName}! 🎂`,
    subheading: `Wishing you a wonderful day from all of us.`,
    logoAlt: companyName,
    body: `<p style="margin: 0 0 14px 0">
                  Everyone at <strong>${(0, _layout_1.esc)(companyName)}</strong> wants to wish
                  you a very happy birthday.
                </p>

                <p style="margin: 0 0 14px 0">
                  Thank you for everything you bring to the team. We hope your
                  day is a great one — enjoy every moment of it.
                </p>

                <p style="margin: 0; font-size: 32px; line-height: 1.2">🎉 🎂 🎈</p>`,
    footer: `<p style="margin: 0">
                  Warmest wishes,<br />
                  <strong>${(0, _layout_1.esc)(companyName)}</strong><br />
                  HR &amp; Payroll Team
                </p>`,
});
exports.birthdayHtml = birthdayHtml;
const birthdayTeamHtml = ({ firstName, celebrantName, celebrantDepartment, companyName, }) => (0, _layout_1.layout)({
    title: 'Team Birthday',
    preheader: `It's ${celebrantName}'s birthday today.`,
    heading: `It's ${celebrantName}'s birthday! 🎂`,
    subheading: `Hi <strong style="color: ${_layout_1.theme.text}">${(0, _layout_1.esc)(firstName)}</strong>,`,
    logoAlt: companyName,
    body: `<p style="margin: 0 0 14px 0">
                  <strong>${(0, _layout_1.esc)(celebrantName)}</strong>${celebrantDepartment
        ? ` from ${(0, _layout_1.esc)(celebrantDepartment)}`
        : ''} is celebrating a birthday today.
                </p>

                <p style="margin: 0">
                  Take a moment to send them your best wishes.
                </p>`,
    footer: `<p style="margin: 0">
                  <strong>${(0, _layout_1.esc)(companyName)}</strong><br />
                  HR &amp; Payroll Team
                </p>`,
});
exports.birthdayTeamHtml = birthdayTeamHtml;
//# sourceMappingURL=birthday.html.js.map