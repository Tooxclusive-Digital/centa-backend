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
var AnnouncementNotificationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnnouncementNotificationService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const resend_provider_1 = require("../resend.provider");
const announcement_html_1 = require("../templates/announcement.html");
const assessment_reminder_html_1 = require("../templates/assessment-reminder.html");
const _layout_1 = require("../templates/_layout");
let AnnouncementNotificationService = AnnouncementNotificationService_1 = class AnnouncementNotificationService {
    constructor(config, resend) {
        this.config = config;
        this.resend = resend;
        this.logger = new common_1.Logger(AnnouncementNotificationService_1.name);
    }
    async sendNewAnnouncement(payload) {
        const base = this.config.get('EMPLOYEE_PORTAL_URL') || '';
        const url = `${base}/ess/announcement/${payload.meta?.announcementId || ''}`;
        try {
            const { error } = await this.resend.client.emails.send({
                to: payload.toEmail,
                from: (0, _layout_1.fromHeader)(payload.companyName || 'Announcements', 'noreply@centahr.com'),
                subject: payload.subject,
                html: (0, announcement_html_1.announcementHtml)({
                    firstName: payload.firstName,
                    title: payload.title,
                    body: payload.body,
                    publishedAt: payload.publishedAt,
                    expiresAt: payload.expiresAt,
                    companyName: payload.companyName,
                    url,
                }),
            });
            if (error)
                throw error;
        }
        catch (error) {
            this.logger.error('sendNewAnnouncement failed', error);
            throw error;
        }
    }
    async sendAssessmentReminder(payload) {
        const base = this.config.get('EMPLOYEE_PORTAL_URL') || '';
        const url = `${base}/ess/performance/reviews/${payload.meta?.assessmentId || ''}`;
        try {
            const { error } = await this.resend.client.emails.send({
                to: payload.toEmail,
                from: (0, _layout_1.fromHeader)(payload.companyName || 'Performance Team', 'noreply@centahr.com'),
                subject: payload.subject || `Reminder: ${payload.cycleName} review`,
                html: (0, assessment_reminder_html_1.assessmentReminderHtml)({
                    firstName: payload.firstName,
                    employeeName: payload.employeeName,
                    reviewerName: payload.reviewerName,
                    cycleName: payload.cycleName,
                    dueDate: payload.dueDate,
                    companyName: payload.companyName,
                    url,
                }),
            });
            if (error)
                throw error;
        }
        catch (error) {
            this.logger.error('sendAssessmentReminder failed', error);
            throw error;
        }
    }
};
exports.AnnouncementNotificationService = AnnouncementNotificationService;
exports.AnnouncementNotificationService = AnnouncementNotificationService = AnnouncementNotificationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        resend_provider_1.ResendProvider])
], AnnouncementNotificationService);
//# sourceMappingURL=announcement-notification.service.js.map