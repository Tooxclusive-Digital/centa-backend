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
var AssetNotificationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetNotificationService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const resend_provider_1 = require("../resend.provider");
const asset_request_html_1 = require("../templates/asset-request.html");
let AssetNotificationService = AssetNotificationService_1 = class AssetNotificationService {
    constructor(config, resend) {
        this.config = config;
        this.resend = resend;
        this.logger = new common_1.Logger(AssetNotificationService_1.name);
        this.logoUrl = 'https://centa-hr.s3.eu-west-3.amazonaws.com/company-files/7beedcd5-66c3-4351-8955-ddcab3528652/5cf61059-52be-4c46-9d4e-9817f2b9257b/1769600186954-1768990436384-logo-CqG_6WrI.png';
    }
    buildSubject(status, assetType) {
        const type = assetType ? ` – ${assetType}` : '';
        if (status === 'requested')
            return `Approval Needed: Asset Request${type}`;
        if (status === 'approved')
            return `Asset Request Approved${type}`;
        return `Asset Request Rejected${type}`;
    }
    buildStatusTitle(status) {
        if (status === 'requested')
            return 'Requested';
        if (status === 'approved')
            return 'Approved';
        return 'Rejected';
    }
    buildStatusMessage(status) {
        if (status === 'requested')
            return 'an asset request has been submitted and is awaiting your review.';
        if (status === 'approved')
            return 'your asset request has been approved.';
        return 'your asset request has been rejected.';
    }
    buildActionUrl(payload) {
        if (payload.actionUrl)
            return payload.actionUrl;
        const base = this.config.get('EMPLOYEE_PORTAL_URL') || '';
        if (!base)
            return undefined;
        if (payload.status === 'requested') {
            return `${base}/dashboard/assets`;
        }
        return `${base}/ess/assets`;
    }
    async sendAssetEmail(payload) {
        const actionUrl = this.buildActionUrl(payload);
        try {
            const { error } = await this.resend.client.emails.send({
                to: payload.toEmail,
                from: 'CentaHR <noreply@centahr.com>',
                subject: this.buildSubject(payload.status, payload.assetType),
                html: (0, asset_request_html_1.assetRequestHtml)({
                    employeeName: payload.employeeName,
                    companyName: payload.companyName,
                    statusTitle: this.buildStatusTitle(payload.status),
                    statusMessage: this.buildStatusMessage(payload.status),
                    assetType: payload.assetType,
                    purpose: payload.purpose,
                    urgency: payload.urgency,
                    notes: payload.notes,
                    rejectionReason: payload.rejectionReason,
                    remarks: payload.remarks,
                    actionUrl,
                    actionText: payload.status === 'requested' ? 'Review Request' : 'View Request',
                    logoUrl: this.logoUrl,
                }),
            });
            if (error)
                throw error;
        }
        catch (error) {
            this.logger.error('sendAssetEmail failed', error);
        }
    }
    async sendAssetApprovalRequestEmail(payload) {
        return this.sendAssetEmail({ ...payload, status: 'requested' });
    }
    async sendAssetDecisionEmail(payload) {
        return this.sendAssetEmail(payload);
    }
};
exports.AssetNotificationService = AssetNotificationService;
exports.AssetNotificationService = AssetNotificationService = AssetNotificationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        resend_provider_1.ResendProvider])
], AssetNotificationService);
//# sourceMappingURL=asset-notification.service.js.map