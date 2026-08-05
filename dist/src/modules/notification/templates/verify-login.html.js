"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyLoginHtml = void 0;
const _layout_1 = require("./_layout");
const verifyLoginHtml = ({ verificationCode, }) => (0, _layout_1.layout)({
    title: 'Login Verification',
    preheader: 'Your CentaHR login verification code.',
    heading: 'Confirm your sign-in',
    subheading: 'Use the code below to finish signing in to your CentaHR account.',
    body: `<p style="margin: 0 0 14px 0">
                  We received a sign-in attempt for your account. Enter this
                  code to complete it.
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
                  </tr>`)}

                <p style="margin: 16px 0 0 0">
                  This code will expire shortly. Do not share it with anyone.
                </p>`,
    footer: `<p style="margin: 0 0 14px 0">
                  If you did not attempt to sign in, please ignore this email
                  and consider changing your password.
                </p>

                <p style="margin: 0">
                  <strong>The CentaHR Team</strong>
                </p>`,
});
exports.verifyLoginHtml = verifyLoginHtml;
//# sourceMappingURL=verify-login.html.js.map