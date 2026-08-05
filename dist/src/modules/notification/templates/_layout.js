"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_LOGO_URL = exports.theme = void 0;
exports.esc = esc;
exports.escUrl = escUrl;
exports.fromHeader = fromHeader;
exports.button = button;
exports.linkFallback = linkFallback;
exports.detailRow = detailRow;
exports.panel = panel;
exports.layout = layout;
exports.theme = {
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
};
exports.DEFAULT_LOGO_URL = 'https://centa-hr.s3.eu-west-3.amazonaws.com/company-files/7beedcd5-66c3-4351-8955-ddcab3528652/5cf61059-52be-4c46-9d4e-9817f2b9257b/1769600186954-1768990436384-logo-CqG_6WrI.png';
function esc(value) {
    if (value === null || value === undefined)
        return '';
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
function escUrl(value) {
    if (value === null || value === undefined)
        return '';
    const raw = String(value).trim();
    if (!/^(https?:|mailto:)/i.test(raw))
        return '';
    return esc(raw);
}
function fromHeader(displayName, address) {
    const safe = displayName.replace(/[<>"\r\n]/g, '').trim();
    return safe ? `${safe} <${address}>` : address;
}
function button(href, label) {
    const safeHref = escUrl(href);
    if (!safeHref)
        return '';
    return `
              <a
                href="${safeHref}"
                style="
                  background-color: ${exports.theme.brand};
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
function linkFallback(href, lead = "If the button doesn't work, copy and paste this link into your browser:") {
    const safeHref = escUrl(href);
    if (!safeHref)
        return '';
    return `
              <div style="margin-top: 10px; font-size: 12px; color: ${exports.theme.muted}; line-height: 1.6">
                ${esc(lead)}<br />
                <span style="word-break: break-all; color: ${exports.theme.brand}">${safeHref}</span>
              </div>`;
}
function detailRow(label, value) {
    return `
                      <tr>
                        <td style="padding: 10px 0; border-top: 1px solid ${exports.theme.panelBorder}">
                          <strong>${esc(label)}:</strong> ${esc(value)}
                        </td>
                      </tr>`;
}
function panel(inner) {
    return `
                <table
                  width="100%"
                  cellpadding="0"
                  cellspacing="0"
                  style="
                    background-color: ${exports.theme.panelBg};
                    border: 1px solid ${exports.theme.panelBorder};
                    border-radius: 12px;
                  "
                >
                  ${inner}
                </table>`;
}
function layout({ title, preheader, heading, subheading, body, cta, footer, logoUrl = exports.DEFAULT_LOGO_URL, logoAlt = 'CentaHR', }) {
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
      background-color: ${exports.theme.pageBg};
      font-family: ${exports.theme.font};
      color: ${exports.theme.text};
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
              background-color: ${exports.theme.cardBg};
              border-radius: 14px;
              overflow: hidden;
              border: 1px solid ${exports.theme.cardBorder};
              box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
            "
          >
            <!-- Brand bar -->
            <tr>
              <td style="height: 6px; background-color: ${exports.theme.brand}"></td>
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
                    <td align="right" valign="middle" style="font-size: 12px; color: ${exports.theme.muted}">
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
                ${subheading
        ? `<div style="margin-top: 6px; font-size: 13px; color: ${exports.theme.muted}; line-height: 1.6">
                  ${subheading}
                </div>`
        : ''}
              </td>
            </tr>

            <!-- Divider -->
            <tr>
              <td style="padding: 18px 26px 0 26px">
                <div style="height: 1px; background-color: ${exports.theme.cardBorder}"></div>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding: 18px 26px 0 26px; font-size: 13px; color: ${exports.theme.body}; line-height: 1.7">
                ${body}
              </td>
            </tr>
            ${cta
        ? `
            <!-- CTA -->
            <tr>
              <td align="center" style="padding: 18px 26px 0 26px">
                ${cta}
              </td>
            </tr>`
        : ''}

            <!-- Footer -->
            <tr>
              <td style="padding: 22px 26px 26px 26px; font-size: 13px; line-height: 1.7; color: ${exports.theme.body}">
                <div style="height: 1px; background-color: ${exports.theme.cardBorder}; margin-bottom: 18px"></div>
                ${footer ??
        `<p style="margin: 0 0 16px 0">
                  If you have any questions, feel free to reach out to your HR or
                  company administrator.
                </p>`}
                <p style="margin: 16px 0 0 0; font-size: 12px; color: ${exports.theme.muted}">
                  Powered by <strong style="color: ${exports.theme.text}">CentaHR</strong>
                </p>
              </td>
            </tr>
          </table>

          <!-- Footer note -->
          <table width="640" cellpadding="0" cellspacing="0" style="width: 100%; max-width: 640px">
            <tr>
              <td style="padding: 14px 6px 0 6px; text-align: center; font-size: 12px; color: ${exports.theme.faint}">
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
//# sourceMappingURL=_layout.js.map