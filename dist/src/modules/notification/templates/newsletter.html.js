"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.newsletterHtml = void 0;
const _layout_1 = require("./_layout");
const newsletterHtml = ({ firstName, companyName, ctaUrl, unsubscribeUrl, }) => (0, _layout_1.layout)({
    title: 'CentaHR Newsletter',
    preheader: 'Cut HR admin by 40% with AI-driven efficiency.',
    heading: 'Cut HR admin by 40%',
    subheading: `Hi <strong style="color: ${_layout_1.theme.text}">${(0, _layout_1.esc)(firstName)}</strong>,`,
    body: `<p style="margin: 0 0 14px 0">
                  HR teams${companyName ? ` like the one at <strong>${(0, _layout_1.esc)(companyName)}</strong>` : ''}
                  lose hours every week to manual admin — onboarding paperwork,
                  leave approvals, payroll prep.
                </p>

                <p style="margin: 0 0 14px 0">
                  CentaHR automates the repetitive work so your team can focus on
                  people instead of process:
                </p>

                <ul style="margin: 0 0 14px 18px; padding: 0; color: ${_layout_1.theme.body}">
                  <li style="margin: 6px 0">Automated onboarding and document collection</li>
                  <li style="margin: 6px 0">Self-service leave and asset requests</li>
                  <li style="margin: 6px 0">Payroll prep with built-in approvals</li>
                  <li style="margin: 6px 0">Performance reviews that run themselves</li>
                </ul>

                <p style="margin: 0">
                  See how much time your team could get back.
                </p>`,
    cta: (0, _layout_1.button)(ctaUrl, 'Explore CentaHR'),
    footer: `<p style="margin: 0 0 16px 0">
                  You're receiving this because you signed up for updates from
                  CentaHR.
                </p>

                <p style="margin: 0">
                  <strong>The CentaHR Team</strong>
                </p>
                ${unsubscribeUrl
        ? `<p style="margin: 14px 0 0 0; font-size: 12px; color: ${_layout_1.theme.muted}">
                  <a href="${(0, _layout_1.esc)(unsubscribeUrl)}" style="color: ${_layout_1.theme.muted}">Unsubscribe</a>
                  from these emails.
                </p>`
        : ''}`,
});
exports.newsletterHtml = newsletterHtml;
//# sourceMappingURL=newsletter.html.js.map