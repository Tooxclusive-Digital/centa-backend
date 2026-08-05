import { layout, button, linkFallback, esc, theme } from './_layout';

export interface PasswordResetHtmlProps {
  name: string;
  verifyLink: string;
}

export const passwordResetHtml = ({
  name,
  verifyLink,
}: PasswordResetHtmlProps): string =>
  layout({
    title: 'Password Reset',
    preheader: 'Reset your CentaHR password.',
    heading: 'Reset your password',
    subheading: `Hi <strong style="color: ${theme.text}">${esc(name)}</strong>,`,
    body: `<p style="margin: 0 0 14px 0">
                  We received a request to reset the password on your CentaHR
                  account. Click the button below to choose a new one.
                </p>

                <p style="margin: 0">
                  If you didn't request this, you can safely ignore this email —
                  your password will stay unchanged.
                </p>`,
    cta: `${button(verifyLink, 'Reset Password')}
                ${linkFallback(verifyLink)}`,
    footer: `<p style="margin: 0 0 16px 0">
                  For your security, this link will expire after a short period.
                </p>

                <p style="margin: 0">
                  Best regards,<br />
                  <strong>The CentaHR Team</strong>
                </p>`,
  });
