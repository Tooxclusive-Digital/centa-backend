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
var PayrollApprovalEmailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayrollApprovalEmailService = void 0;
const common_1 = require("@nestjs/common");
const resend_provider_1 = require("../resend.provider");
const payroll_approval_html_1 = require("../templates/payroll-approval.html");
let PayrollApprovalEmailService = PayrollApprovalEmailService_1 = class PayrollApprovalEmailService {
    constructor(resend) {
        this.resend = resend;
        this.logger = new common_1.Logger(PayrollApprovalEmailService_1.name);
    }
    async sendApprovalEmail(email, name, url, month, companyName) {
        try {
            const { error } = await this.resend.client.emails.send({
                to: email,
                from: 'CentaHR <noreply@centahr.com>',
                subject: `Action Required: Approve Payroll for ${month}`,
                html: (0, payroll_approval_html_1.payrollApprovalHtml)({ name, month, companyName, url }),
            });
            if (error)
                throw error;
        }
        catch (error) {
            this.logger.error('sendApprovalEmail failed', error);
            throw error;
        }
    }
};
exports.PayrollApprovalEmailService = PayrollApprovalEmailService;
exports.PayrollApprovalEmailService = PayrollApprovalEmailService = PayrollApprovalEmailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [resend_provider_1.ResendProvider])
], PayrollApprovalEmailService);
//# sourceMappingURL=payroll-approval.service.js.map