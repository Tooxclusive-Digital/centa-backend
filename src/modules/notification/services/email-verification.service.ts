import { Injectable, Logger } from '@nestjs/common';
import type { CreateEmailOptions } from 'resend';
import { ResendProvider } from '../resend.provider';
import { emailVerificationHtml } from '../templates/email-verification.html';
import { verifyLoginHtml } from '../templates/verify-login.html';

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function getStatusCode(err: any): number | undefined {
  return err?.statusCode ?? err?.code ?? err?.response?.statusCode;
}

/**
 * Resend surfaces failures as a typed `error` on the response rather than a
 * thrown exception, so match on its `name` as well as the HTTP status.
 */
function isRetryable(err: any): boolean {
  const name = err?.name;
  if (name === 'rate_limit_exceeded' || name === 'application_error') {
    return true;
  }
  if (name && name !== 'internal_server_error') {
    // validation / auth / not-found style errors won't succeed on retry
    return false;
  }

  const status = getStatusCode(err);
  if (!status) {
    // likely network/timeout/etc.
    return true;
  }
  return status === 429 || (status >= 500 && status <= 599);
}

function backoffMs(attempt: number, base = 250, cap = 5000) {
  // attempt starts at 1
  const exp = Math.min(cap, base * 2 ** (attempt - 1));
  const jitter = Math.floor(Math.random() * 200); // 0-199ms
  return exp + jitter;
}

@Injectable()
export class EmailVerificationService {
  private readonly logger = new Logger(EmailVerificationService.name);

  constructor(private readonly resend: ResendProvider) {}

  private async sendWithRetry(msg: CreateEmailOptions, maxAttempts = 4) {
    let lastErr: any;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const { error } = await Promise.race([
          this.resend.client.emails.send(msg),
          (async () => {
            await sleep(10_000);
            throw new Error('Resend send timeout after 10s');
          })(),
        ]);

        if (error) throw error;
        return; // success
      } catch (err) {
        lastErr = err;

        const status = getStatusCode(err);

        // log once per attempt
        this.logger.warn(
          `Resend send failed (attempt ${attempt}/${maxAttempts}) status=${status ?? 'n/a'} name=${(err as any)?.name ?? 'n/a'}`,
        );
        this.logger.debug(err);

        if (!isRetryable(err) || attempt === maxAttempts) break;

        await sleep(backoffMs(attempt));
      }
    }

    throw lastErr;
  }

  async sendVerifyEmail(email: string, token: string, companyName?: string) {
    await this.sendWithRetry({
      to: email,
      from: 'CentaHR <noreply@centahr.com>',
      subject: 'Verify your email address',
      html: emailVerificationHtml({
        verificationCode: token,
        companyName,
      }),
    });
  }

  async sendVerifyLogin(email: string, token: string) {
    await this.sendWithRetry({
      to: email,
      from: 'CentaHR <noreply@centahr.com>',
      subject: 'Confirm your sign-in',
      html: verifyLoginHtml({ verificationCode: token }),
    });
  }
}
