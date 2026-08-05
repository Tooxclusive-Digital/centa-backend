"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailVerificationHtml = void 0;
const _layout_1 = require("./_layout");
const VERIFY_URL = 'https://app.centahr.com/auth/verify-email';
const emailVerificationHtml = ({ verificationCode, companyName, }) => (0, _layout_1.layout)({
    title: 'Email Verification',
    preheader: 'Verify your email to get started with CentaHR.',
    heading: 'Verify your email address',
    subheading: `Hello <strong style="color: ${_layout_1.theme.text}">${(0, _layout_1.esc)(companyName)}</strong>,`,
    body: `<p style="margin: 0 0 14px 0">
                  Thank you for choosing <strong>CentaHR</strong> — your
                  all-in-one, AI-powered HR platform for smarter hiring,
                  onboarding, and team management.
                </p>

                <p style="margin: 0 0 14px 0">
                  We've opened the verification page in your browser to help you
                  get started right away. If it didn't open automatically or
                  you've closed the tab, you can continue using the details
                  below.
                </p>

                ${(0, _layout_1.panel)(`
                  <tr>
                    <td style="padding: 16px; text-align: center">
                      <div style="font-size: 12px; color: ${_layout_1.theme.muted}; margin-bottom: 6px">
                        Verification Code
                      </div>
                      <div style="font-size: 22px; font-weight: 700; letter-spacing: 2px; color: ${_layout_1.theme.text}">
                        ${(0, _layout_1.esc)(verificationCode)}
                      </div>
                    </td>
                  </tr>`)}`,
    cta: `${(0, _layout_1.button)(VERIFY_URL, 'Click to Verify')}
                ${(0, _layout_1.linkFallback)(VERIFY_URL, 'Or copy and paste this link into your browser:')}`,
    footer: `<p style="margin: 0 0 14px 0">
                  If you did not initiate this request, please ignore this
                  email.
                </p>

                <p style="margin: 0">
                  Welcome to smarter hiring,<br />
                  <strong>The CentaHR Team</strong>
                </p>`,
});
exports.emailVerificationHtml = emailVerificationHtml;
//# sourceMappingURL=email-verification.html.js.map