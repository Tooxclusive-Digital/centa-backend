"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var EmailVerificationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailVerificationService = void 0;
const common_1 = require("@nestjs/common");
const resend_provider_1 = require("../resend.provider");
const email_verification_html_1 = require("../templates/email-verification.html");
const verify_login_html_1 = require("../templates/verify-login.html");
function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}
function getStatusCode(err) {
    return err?.statusCode ?? err?.code ?? err?.response?.statusCode;
}
function isRetryable(err) {
    const name = err?.name;
    if (name === 'rate_limit_exceeded' || name === 'application_error') {
        return true;
    }
    if (name && name !== 'internal_server_error') {
        return false;
    }
    const status = getStatusCode(err);
    if (!status) {
        return true;
    }
    return status === 429 || (status >= 500 && status <= 599);
}
function backoffMs(attempt, base = 250, cap = 5000) {
    const exp = Math.min(cap, base * 2 ** (attempt - 1));
    const jitter = Math.floor(Math.random() * 200);
    return exp + jitter;
}
let EmailVerificationService = EmailVerificationService_1 = class EmailVerificationService {
    constructor(resend) {
        this.resend = resend;
        this.logger = new common_1.Logger(EmailVerificationService_1.name);
    }
    async sendWithRetry(msg, maxAttempts = 4) {
        let lastErr;
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                const { error } = await Promise.race([
                    this.resend.client.emails.send(msg),
                    (async () => {
                        await sleep(10_000);
                        throw new Error('Resend send timeout after 10s');
                    })(),
                ]);
                if (error)
                    throw error;
                return;
            }
            catch (err) {
                lastErr = err;
                const status = getStatusCode(err);
                this.logger.warn(`Resend send failed (attempt ${attempt}/${maxAttempts}) status=${status ?? 'n/a'} name=${err?.name ?? 'n/a'}`);
                this.logger.debug(err);
                if (!isRetryable(err) || attempt === maxAttempts)
                    break;
                await sleep(backoffMs(attempt));
            }
        }
        throw lastErr;
    }
    async sendVerifyEmail(email, token, companyName) {
        await this.sendWithRetry({
            to: email,
            from: 'CentaHR <noreply@centahr.com>',
            subject: 'Verify your email address',
            html: (0, email_verification_html_1.emailVerificationHtml)({
                verificationCode: token,
                companyName,
            }),
        });
    }
    async sendVerifyLogin(email, token) {
        await this.sendWithRetry({
            to: email,
            from: 'CentaHR <noreply@centahr.com>',
            subject: 'Confirm your sign-in',
            html: (0, verify_login_html_1.verifyLoginHtml)({ verificationCode: token }),
        });
    }
};
exports.EmailVerificationService = EmailVerificationService;
exports.EmailVerificationService = EmailVerificationService = EmailVerificationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [resend_provider_1.ResendProvider])
], EmailVerificationService);
//# sourceMappingURL=email-verification.service.js.map