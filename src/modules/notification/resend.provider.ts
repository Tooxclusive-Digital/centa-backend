import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class ResendProvider {
  private readonly logger = new Logger(ResendProvider.name);
  public readonly client: Resend;

  /** When set, every outbound email is redirected here instead of the real recipient. */
  private readonly redirectTo?: string;

  constructor(private config: ConfigService) {
    const real = new Resend(this.config.get<string>('RESEND_API_KEY'));
    this.redirectTo = this.config
      .get<string>('EMAIL_TEST_REDIRECT')
      ?.trim();

    this.client = this.redirectTo ? this.wrap(real, this.redirectTo) : real;

    if (this.redirectTo) {
      this.logger.warn({
        op: 'resend.test_redirect.enabled',
        redirectTo: this.redirectTo,
        note: 'ALL outbound email is being redirected — unset EMAIL_TEST_REDIRECT for production',
      });
    }
  }

  /**
   * Intercept `emails.send` and `batch.send` so no real recipient is contacted
   * while testing.
   *
   * Applied at the transport rather than per-service: a per-call flag only
   * covers the code paths you remembered to change, whereas this catches every
   * email the app can send. The original recipient is preserved in the subject
   * and logged so a redirected run is still verifiable.
   */
  private wrap(real: Resend, redirectTo: string): Resend {
    const tag = (payload: any) => {
      const original = Array.isArray(payload.to)
        ? payload.to.join(', ')
        : payload.to;

      this.logger.log({
        op: 'resend.test_redirect.rewrite',
        originalTo: original,
        redirectedTo: redirectTo,
        subject: payload.subject,
      });

      return {
        ...payload,
        to: redirectTo,
        // Keep cc/bcc from leaking to real people.
        cc: undefined,
        bcc: undefined,
        subject: `[TEST → ${original}] ${payload.subject ?? ''}`,
      };
    };

    const proxy = Object.create(real) as Resend;

    Object.defineProperty(proxy, 'emails', {
      value: {
        ...real.emails,
        send: (payload: any, options?: any) =>
          real.emails.send(tag(payload), options),
      },
    });

    Object.defineProperty(proxy, 'batch', {
      value: {
        ...real.batch,
        // Only the first message is delivered: redirecting a 500-recipient
        // batch would otherwise send 500 identical copies to one inbox.
        send: (payloads: any[], options?: any) => {
          this.logger.log({
            op: 'resend.test_redirect.batch_collapsed',
            originalCount: payloads.length,
            redirectedTo: redirectTo,
          });
          return real.batch.send(payloads.slice(0, 1).map(tag), options);
        },
      },
    });

    return proxy;
  }
}
