import { layout, panel, esc, theme } from './_layout';

/**
 * Login verification code.
 *
 * NOTE: drafted in the shared shell rather than ported from the original
 * VERIFY_LOGIN_TEMPLATE_ID SendGrid template — copy is not a byte-for-byte
 * match and is worth a review pass.
 */
export interface VerifyLoginHtmlProps {
  verificationCode: string;
}

export const verifyLoginHtml = ({
  verificationCode,
}: VerifyLoginHtmlProps): string =>
  layout({
    title: 'Login Verification',
    preheader: 'Your CentaHR login verification code.',
    heading: 'Confirm your sign-in',
    subheading:
      'Use the code below to finish signing in to your CentaHR account.',
    body: `<p style="margin: 0 0 14px 0">
                  We received a sign-in attempt for your account. Enter this
                  code to complete it.
                </p>

                ${panel(`
                  <tr>
                    <td style="padding: 16px; text-align: center">
                      <div style="font-size: 12px; color: ${theme.muted}; margin-bottom: 6px">
                        Verification Code
                      </div>
                      <div style="font-size: 22px; font-weight: 700; letter-spacing: 2px; color: ${theme.text}">
                        ${esc(verificationCode)}
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
