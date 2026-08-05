"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.offerHtml = void 0;
const _layout_1 = require("./_layout");
const offerHtml = ({ name, jobTitle, companyName, offerLink, companyLogo, }) => (0, _layout_1.layout)({
    title: 'Job Offer',
    preheader: `Your job offer for ${jobTitle} at ${companyName}.`,
    heading: `Your offer for ${jobTitle}`,
    subheading: `Hi <strong style="color: ${_layout_1.theme.text}">${(0, _layout_1.esc)(name)}</strong>,`,
    logoUrl: companyLogo,
    logoAlt: companyName,
    body: `<p style="margin: 0 0 14px 0">
                  Congratulations! <strong>${(0, _layout_1.esc)(companyName)}</strong> has
                  extended you an offer for the role of
                  <strong>${(0, _layout_1.esc)(jobTitle)}</strong>.
                </p>

                <p style="margin: 0">
                  Review the full details of your offer and respond using the
                  link below.
                </p>`,
    cta: `${(0, _layout_1.button)(offerLink, 'View Your Offer')}
                ${(0, _layout_1.linkFallback)(offerLink)}`,
    footer: `<p style="margin: 0 0 16px 0">
                  If you have any questions about this offer, please reach out to
                  the hiring team.
                </p>

                <p style="margin: 0">
                  Best regards,<br />
                  <strong>${(0, _layout_1.esc)(companyName)}</strong><br />
                  HR &amp; Payroll Team
                </p>`,
});
exports.offerHtml = offerHtml;
//# sourceMappingURL=offer.html.js.map