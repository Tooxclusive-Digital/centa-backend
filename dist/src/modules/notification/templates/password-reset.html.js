"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.passwordResetHtml = void 0;
const _layout_1 = require("./_layout");
const passwordResetHtml = ({ name, verifyLink, }) => (0, _layout_1.layout)({
    title: 'Password Reset',
    preheader: 'Reset your CentaHR password.',
    heading: 'Reset your password',
    subheading: `Hi <strong style="color: ${_layout_1.theme.text}">${(0, _layout_1.esc)(name)}</strong>,`,
    body: `<p style="margin: 0 0 14px 0">
                  We received a request to reset the password on your CentaHR
                  account. Click the button below to choose a new one.
                </p>

                <p style="margin: 0">
                  If you didn't request this, you can safely ignore this email —
                  your password will stay unchanged.
                </p>`,
    cta: `${(0, _layout_1.button)(verifyLink, 'Reset Password')}
                ${(0, _layout_1.linkFallback)(verifyLink)}`,
    footer: `<p style="margin: 0 0 16px 0">
                  For your security, this link will expire after a short period.
                </p>

                <p style="margin: 0">
                  Best regards,<br />
                  <strong>The CentaHR Team</strong>
                </p>`,
});
exports.passwordResetHtml = passwordResetHtml;
//# sourceMappingURL=password-reset.html.js.map