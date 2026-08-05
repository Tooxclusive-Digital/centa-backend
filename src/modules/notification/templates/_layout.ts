// Shared shell for every transactional email. The SendGrid dynamic templates
// these replaced all rendered the same card; keeping that shell in one place
// means brand changes land in one file instead of twenty.

/** Brand tokens lifted from the original SendGrid templates. */
export const theme = {
  brand: '#00626F',
  pageBg: '#f5f7f9',
  cardBg: '#ffffff',
  cardBorder: '#eef2f6',
  panelBg: '#f8fafc',
  panelBorder: '#e8eef4',
  text: '#0f172a',
  body: '#334155',
  muted: '#64748b',
  faint: '#94a3b8',
  font: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, Helvetica, sans-serif`,
} as const;

export const DEFAULT_LOGO_URL =
  'https://centa-hr.s3.eu-west-3.amazonaws.com/company-files/7beedcd5-66c3-4351-8955-ddcab3528652/5cf61059-52be-4c46-9d4e-9817f2b9257b/1769600186954-1768990436384-logo-CqG_6WrI.png';

/**
 * Escape text before interpolating it into HTML.
 *
 * SendGrid's handlebars auto-escaped `{{var}}`; template literals do not, so
 * every caller-supplied string has to go through this. Values here are
 * user-controlled (employee names, rejection reasons, company names), so
 * skipping it would be an HTML injection hole.
 */
export function esc(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Escape a URL for use in an href/src attribute.
 *
 * Beyond entity-escaping, this drops anything that isn't http(s) or mailto so
 * a stored `javascript:` value can't become a live link in a mail client.
 */
export function escUrl(value: unknown): string {
  if (value === null || value === undefined) return '';
  const raw = String(value).trim();
  if (!/^(https?:|mailto:)/i.test(raw)) return '';
  return esc(raw);
}

/**
 * Build a `From` header with a display name.
 *
 * Several senders interpolate user data (company name, role) into the display
 * name; strip the characters that would let that break out of the header.
 */
export function fromHeader(displayName: string, address: string): string {
  const safe = displayName.replace(/[<>"\r\n]/g, '').trim();
  return safe ? `${safe} <${address}>` : address;
}

/** Primary call-to-action button. */
export function button(href: string, label: string): string {
  const safeHref = escUrl(href);
  if (!safeHref) return '';
  return `
              <a
                href="${safeHref}"
                style="
                  background-color: ${theme.brand};
                  color: #ffffff;
                  padding: 12px 22px;
                  text-decoration: none;
                  border-radius: 10px;
                  font-weight: 700;
                  font-size: 14px;
                  display: inline-block;
                "
              >
                ${esc(label)}
              </a>`;
}

/** "If the button doesn't work, paste this link" fallback under a CTA. */
export function linkFallback(
  href: string,
  lead = "If the button doesn't work, copy and paste this link into your browser:",
): string {
  const safeHref = escUrl(href);
  if (!safeHref) return '';
  return `
              <div style="margin-top: 10px; font-size: 12px; color: ${theme.muted}; line-height: 1.6">
                ${esc(lead)}<br />
                <span style="word-break: break-all; color: ${theme.brand}">${safeHref}</span>
              </div>`;
}

/** A bordered detail row inside a `panel()`. */
export function detailRow(label: string, value: unknown): string {
  return `
                      <tr>
                        <td style="padding: 10px 0; border-top: 1px solid ${theme.panelBorder}">
                          <strong>${esc(label)}:</strong> ${esc(value)}
                        </td>
                      </tr>`;
}

/** Grey rounded panel used for detail blocks and codes. */
export function panel(inner: string): string {
  return `
                <table
                  width="100%"
                  cellpadding="0"
                  cellspacing="0"
                  style="
                    background-color: ${theme.panelBg};
                    border: 1px solid ${theme.panelBorder};
                    border-radius: 12px;
                  "
                >
                  ${inner}
                </table>`;
}

export interface LayoutOptions {
  /** Browser/tab title and the small right-aligned eyebrow in the header. */
  title: string;
  /** Hidden inbox-preview line. */
  preheader: string;
  /** Large heading at the top of the card. */
  heading: string;
  /** Optional line under the heading — usually the greeting. Raw HTML. */
  subheading?: string;
  /** Main content. Raw HTML — callers escape their own interpolations. */
  body: string;
  /** Centred CTA block, typically `button()` + `linkFallback()`. */
  cta?: string;
  /** Sign-off above "Powered by CentaHR". Raw HTML. */
  footer?: string;
  /** Header logo. Defaults to the CentaHR mark. */
  logoUrl?: string;
  /** Alt text for the logo. */
  logoAlt?: string;
}

/**
 * Render a full email document.
 *
 * `body`, `subheading`, `cta` and `footer` are inserted as raw HTML so callers
 * can build rich markup — each is responsible for running its own
 * interpolations through `esc()`.
 */
export function layout({
  title,
  preheader,
  heading,
  subheading,
  body,
  cta,
  footer,
  logoUrl = DEFAULT_LOGO_URL,
  logoAlt = 'CentaHR',
}: LayoutOptions): string {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${esc(title)}</title>
  </head>

  <body
    style="
      margin: 0;
      padding: 0;
      background-color: ${theme.pageBg};
      font-family: ${theme.font};
      color: ${theme.text};
    "
  >
    <!-- Preheader -->
    <div style="display: none; max-height: 0; overflow: hidden; opacity: 0; color: transparent">
      ${esc(preheader)}
    </div>

    <table width="100%" cellpadding="0" cellspacing="0" style="padding: 28px 16px">
      <tr>
        <td align="center">
          <!-- Container -->
          <table
            width="640"
            cellpadding="0"
            cellspacing="0"
            style="
              width: 100%;
              max-width: 640px;
              background-color: ${theme.cardBg};
              border-radius: 14px;
              overflow: hidden;
              border: 1px solid ${theme.cardBorder};
              box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
            "
          >
            <!-- Brand bar -->
            <tr>
              <td style="height: 6px; background-color: ${theme.brand}"></td>
            </tr>

            <!-- Header -->
            <tr>
              <td style="padding: 22px 26px 10px 26px">
                <table width="100%">
                  <tr>
                    <td align="left" valign="middle">
                      <img
                        src="${escUrl(logoUrl)}"
                        alt="${esc(logoAlt)}"
                        height="34"
                        style="display: block; height: 34px; width: auto"
                      />
                    </td>
                    <td align="right" valign="middle" style="font-size: 12px; color: ${theme.muted}">
                      ${esc(title)}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Title -->
            <tr>
              <td style="padding: 6px 26px 0 26px">
                <div style="font-size: 20px; font-weight: 700; letter-spacing: -0.2px">
                  ${esc(heading)}
                </div>
                ${
                  subheading
                    ? `<div style="margin-top: 6px; font-size: 13px; color: ${theme.muted}; line-height: 1.6">
                  ${subheading}
                </div>`
                    : ''
                }
              </td>
            </tr>

            <!-- Divider -->
            <tr>
              <td style="padding: 18px 26px 0 26px">
                <div style="height: 1px; background-color: ${theme.cardBorder}"></div>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding: 18px 26px 0 26px; font-size: 13px; color: ${theme.body}; line-height: 1.7">
                ${body}
              </td>
            </tr>
            ${
              cta
                ? `
            <!-- CTA -->
            <tr>
              <td align="center" style="padding: 18px 26px 0 26px">
                ${cta}
              </td>
            </tr>`
                : ''
            }

            <!-- Footer -->
            <tr>
              <td style="padding: 22px 26px 26px 26px; font-size: 13px; line-height: 1.7; color: ${theme.body}">
                <div style="height: 1px; background-color: ${theme.cardBorder}; margin-bottom: 18px"></div>
                ${
                  footer ??
                  `<p style="margin: 0 0 16px 0">
                  If you have any questions, feel free to reach out to your HR or
                  company administrator.
                </p>`
                }
                <p style="margin: 16px 0 0 0; font-size: 12px; color: ${theme.muted}">
                  Powered by <strong style="color: ${theme.text}">CentaHR</strong>
                </p>
              </td>
            </tr>
          </table>

          <!-- Footer note -->
          <table width="640" cellpadding="0" cellspacing="0" style="width: 100%; max-width: 640px">
            <tr>
              <td style="padding: 14px 6px 0 6px; text-align: center; font-size: 12px; color: ${theme.faint}">
                This email was sent automatically. Please do not reply.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
