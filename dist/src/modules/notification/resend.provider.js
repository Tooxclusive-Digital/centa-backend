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
var ResendProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResendProvider = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const resend_1 = require("resend");
let ResendProvider = ResendProvider_1 = class ResendProvider {
    constructor(config) {
        this.config = config;
        this.logger = new common_1.Logger(ResendProvider_1.name);
        const real = new resend_1.Resend(this.config.get('RESEND_API_KEY'));
        this.redirectTo = this.config
            .get('EMAIL_TEST_REDIRECT')
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
    wrap(real, redirectTo) {
        const tag = (payload) => {
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
                cc: undefined,
                bcc: undefined,
                subject: `[TEST → ${original}] ${payload.subject ?? ''}`,
            };
        };
        const proxy = Object.create(real);
        Object.defineProperty(proxy, 'emails', {
            value: {
                ...real.emails,
                send: (payload, options) => real.emails.send(tag(payload), options),
            },
        });
        Object.defineProperty(proxy, 'batch', {
            value: {
                ...real.batch,
                send: (payloads, options) => {
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
};
exports.ResendProvider = ResendProvider;
exports.ResendProvider = ResendProvider = ResendProvider_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], ResendProvider);
//# sourceMappingURL=resend.provider.js.map