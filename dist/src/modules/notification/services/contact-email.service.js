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
var ContactEmailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactEmailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const resend_provider_1 = require("../resend.provider");
const contact_message_html_1 = require("../templates/contact-message.html");
let ContactEmailService = ContactEmailService_1 = class ContactEmailService {
    constructor(config, resend) {
        this.config = config;
        this.resend = resend;
        this.logger = new common_1.Logger(ContactEmailService_1.name);
    }
    async sendContactEmail(dto) {
        const { email, name, message, phone, website } = dto;
        const to = this.config.get('NOTIFY_EMAIL_TO');
        if (!to) {
            this.logger.error('NOTIFY_EMAIL_TO is not configured; dropping message');
            return;
        }
        try {
            const { error } = await this.resend.client.emails.send({
                to,
                from: 'CentaHR <noreply@centahr.com>',
                replyTo: email,
                subject: `New Contact Us Message from ${name}`,
                html: (0, contact_message_html_1.contactMessageHtml)({ name, email, message, phone, website }),
            });
            if (error)
                throw error;
        }
        catch (error) {
            this.logger.error('sendContactEmail failed', error);
            throw error;
        }
    }
};
exports.ContactEmailService = ContactEmailService;
exports.ContactEmailService = ContactEmailService = ContactEmailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        resend_provider_1.ResendProvider])
], ContactEmailService);
//# sourceMappingURL=contact-email.service.js.map