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
var NewsletterEmailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewsletterEmailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const resend_provider_1 = require("../resend.provider");
const newsletter_html_1 = require("../templates/newsletter.html");
const BATCH_LIMIT = 100;
const SUBJECT = 'Cut HR admin by 40% with AI-driven efficiency';
let NewsletterEmailService = NewsletterEmailService_1 = class NewsletterEmailService {
    constructor(config, resend) {
        this.config = config;
        this.resend = resend;
        this.logger = new common_1.Logger(NewsletterEmailService_1.name);
    }
    async sendNewsletter(recipients, opts) {
        if (!recipients?.length)
            return;
        const ctaUrl = this.config.get('CLIENT_URL') || 'https://centahr.com';
        const unsubscribeBase = this.config.get('NEWSLETTER_UNSUBSCRIBE_URL');
        const messages = recipients.map((r) => {
            const unsubscribeUrl = unsubscribeBase
                ? `${unsubscribeBase}?email=${encodeURIComponent(r.email)}`
                : undefined;
            return {
                to: r.email,
                from: 'CentaHR <marketing@centahr.com>',
                subject: SUBJECT,
                html: (0, newsletter_html_1.newsletterHtml)({
                    firstName: r.name || 'there',
                    companyName: r.companyName,
                    ctaUrl,
                    unsubscribeUrl,
                }),
                tags: [
                    { name: 'type', value: 'newsletter' },
                    ...(opts?.campaignName
                        ? [{ name: 'campaign', value: this.tagValue(opts.campaignName) }]
                        : []),
                    ...(opts?.categories || []).map((c) => ({
                        name: 'category',
                        value: this.tagValue(c),
                    })),
                ],
                ...(unsubscribeUrl
                    ? { headers: { 'List-Unsubscribe': `<${unsubscribeUrl}>` } }
                    : {}),
            };
        });
        let sent = 0;
        for (let i = 0; i < messages.length; i += BATCH_LIMIT) {
            const chunk = messages.slice(i, i + BATCH_LIMIT);
            try {
                const { error } = await this.resend.client.batch.send(chunk);
                if (error)
                    throw error;
                sent += chunk.length;
            }
            catch (error) {
                this.logger.error(`Newsletter batch failed (recipients ${i + 1}-${i + chunk.length})`, error);
                throw error;
            }
        }
        this.logger.log(`Newsletter sent: ${sent} recipients.`);
    }
    tagValue(raw) {
        return raw.replace(/[^A-Za-z0-9_-]/g, '_').slice(0, 256);
    }
};
exports.NewsletterEmailService = NewsletterEmailService;
exports.NewsletterEmailService = NewsletterEmailService = NewsletterEmailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        resend_provider_1.ResendProvider])
], NewsletterEmailService);
//# sourceMappingURL=newsletter-email.service.js.map