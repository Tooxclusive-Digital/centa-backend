import { layout, button, linkFallback, esc, theme } from './_layout';

export interface OfferHtmlProps {
  name: string;
  jobTitle: string;
  companyName: string;
  offerLink: string;
  /** Optional company logo override — falls back to the CentaHR mark. */
  companyLogo?: string;
}

export const offerHtml = ({
  name,
  jobTitle,
  companyName,
  offerLink,
  companyLogo,
}: OfferHtmlProps): string =>
  layout({
    title: 'Job Offer',
    preheader: `Your job offer for ${jobTitle} at ${companyName}.`,
    heading: `Your offer for ${jobTitle}`,
    subheading: `Hi <strong style="color: ${theme.text}">${esc(name)}</strong>,`,
    logoUrl: companyLogo,
    logoAlt: companyName,
    body: `<p style="margin: 0 0 14px 0">
                  Congratulations! <strong>${esc(companyName)}</strong> has
                  extended you an offer for the role of
                  <strong>${esc(jobTitle)}</strong>.
                </p>

                <p style="margin: 0">
                  Review the full details of your offer and respond using the
                  link below.
                </p>`,
    cta: `${button(offerLink, 'View Your Offer')}
                ${linkFallback(offerLink)}`,
    footer: `<p style="margin: 0 0 16px 0">
                  If you have any questions about this offer, please reach out to
                  the hiring team.
                </p>

                <p style="margin: 0">
                  Best regards,<br />
                  <strong>${esc(companyName)}</strong><br />
                  HR &amp; Payroll Team
                </p>`,
  });
