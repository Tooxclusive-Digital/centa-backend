import { layout, button, esc, theme } from './_layout';

export interface NewsletterHtmlProps {
  firstName: string;
  companyName?: string;
  ctaUrl: string;
  /**
   * Per-recipient unsubscribe link. SendGrid previously injected this via its
   * subscription-tracking settings; with Resend the footer link is ours to
   * render, so marketing mail stays CAN-SPAM/GDPR compliant.
   */
  unsubscribeUrl?: string;
}

export const newsletterHtml = ({
  firstName,
  companyName,
  ctaUrl,
  unsubscribeUrl,
}: NewsletterHtmlProps): string =>
  layout({
    title: 'CentaHR Newsletter',
    preheader: 'Cut HR admin by 40% with AI-driven efficiency.',
    heading: 'Cut HR admin by 40%',
    subheading: `Hi <strong style="color: ${theme.text}">${esc(firstName)}</strong>,`,
    body: `<p style="margin: 0 0 14px 0">
                  HR teams${companyName ? ` like the one at <strong>${esc(companyName)}</strong>` : ''}
                  lose hours every week to manual admin — onboarding paperwork,
                  leave approvals, payroll prep.
                </p>

                <p style="margin: 0 0 14px 0">
                  CentaHR automates the repetitive work so your team can focus on
                  people instead of process:
                </p>

                <ul style="margin: 0 0 14px 18px; padding: 0; color: ${theme.body}">
                  <li style="margin: 6px 0">Automated onboarding and document collection</li>
                  <li style="margin: 6px 0">Self-service leave and asset requests</li>
                  <li style="margin: 6px 0">Payroll prep with built-in approvals</li>
                  <li style="margin: 6px 0">Performance reviews that run themselves</li>
                </ul>

                <p style="margin: 0">
                  See how much time your team could get back.
                </p>`,
    cta: button(ctaUrl, 'Explore CentaHR'),
    footer: `<p style="margin: 0 0 16px 0">
                  You're receiving this because you signed up for updates from
                  CentaHR.
                </p>

                <p style="margin: 0">
                  <strong>The CentaHR Team</strong>
                </p>
                ${
                  unsubscribeUrl
                    ? `<p style="margin: 14px 0 0 0; font-size: 12px; color: ${theme.muted}">
                  <a href="${esc(unsubscribeUrl)}" style="color: ${theme.muted}">Unsubscribe</a>
                  from these emails.
                </p>`
                    : ''
                }`,
  });
