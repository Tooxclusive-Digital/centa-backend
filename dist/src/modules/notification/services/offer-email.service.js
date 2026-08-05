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
var OfferEmailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OfferEmailService = void 0;
const common_1 = require("@nestjs/common");
const resend_provider_1 = require("../resend.provider");
const offer_html_1 = require("../templates/offer.html");
const _layout_1 = require("../templates/_layout");
let OfferEmailService = OfferEmailService_1 = class OfferEmailService {
    constructor(resend) {
        this.resend = resend;
        this.logger = new common_1.Logger(OfferEmailService_1.name);
    }
    async sendOfferEmail(email, candidateName, jobTitle, companyName, offerUrl, companyLogo) {
        try {
            const { error } = await this.resend.client.emails.send({
                to: email,
                from: (0, _layout_1.fromHeader)(`${companyName} HR`, 'noreply@centahr.com'),
                subject: `Your Job Offer for ${jobTitle} at ${companyName}`,
                html: (0, offer_html_1.offerHtml)({
                    name: candidateName,
                    jobTitle,
                    companyName,
                    offerLink: offerUrl,
                    companyLogo,
                }),
            });
            if (error)
                throw error;
        }
        catch (error) {
            this.logger.error('sendOfferEmail failed', error);
            throw error;
        }
    }
};
exports.OfferEmailService = OfferEmailService;
exports.OfferEmailService = OfferEmailService = OfferEmailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [resend_provider_1.ResendProvider])
], OfferEmailService);
//# sourceMappingURL=offer-email.service.js.map