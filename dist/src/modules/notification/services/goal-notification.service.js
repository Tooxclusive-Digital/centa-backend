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
var GoalNotificationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoalNotificationService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const resend_provider_1 = require("../resend.provider");
const goal_html_1 = require("../templates/goal.html");
const _layout_1 = require("../templates/_layout");
let GoalNotificationService = GoalNotificationService_1 = class GoalNotificationService {
    constructor(config, resend) {
        this.config = config;
        this.resend = resend;
        this.logger = new common_1.Logger(GoalNotificationService_1.name);
    }
    goalPage(goalId) {
        const base = this.config.get('EMPLOYEE_PORTAL_URL') || '';
        return `${base}/ess/performance/goals/${goalId || ''}`;
    }
    async sendGoalCheckin(payload) {
        try {
            const { error } = await this.resend.client.emails.send({
                to: payload.toEmail,
                from: (0, _layout_1.fromHeader)('Goal Check-in', 'noreply@centahr.com'),
                subject: payload.subject,
                html: (0, goal_html_1.goalCheckinHtml)({
                    firstName: payload.firstName,
                    title: payload.title,
                    dueDate: payload.dueDate,
                    companyName: payload.companyName,
                    url: this.goalPage(payload.meta?.goalId),
                }),
            });
            if (error)
                throw error;
        }
        catch (error) {
            this.logger.error('sendGoalCheckin failed', error);
            throw error;
        }
    }
    async sendGoalAssignment(payload) {
        try {
            const { error } = await this.resend.client.emails.send({
                to: payload.toEmail,
                from: (0, _layout_1.fromHeader)('Goal Assignment', 'noreply@centahr.com'),
                subject: payload.subject,
                html: (0, goal_html_1.goalAssignmentHtml)({
                    assignedBy: payload.assignedBy,
                    assignedTo: payload.assignedTo,
                    title: payload.title,
                    dueDate: payload.dueDate,
                    description: payload.description,
                    progress: payload.progress,
                    url: this.goalPage(payload.meta?.goalId),
                }),
            });
            if (error)
                throw error;
        }
        catch (error) {
            this.logger.error('sendGoalAssignment failed', error);
            throw error;
        }
    }
    async sendGoalUpdates(payload) {
        try {
            const { error } = await this.resend.client.emails.send({
                to: payload.toEmail,
                from: (0, _layout_1.fromHeader)('Goal Updates', 'noreply@centahr.com'),
                subject: payload.subject,
                html: (0, goal_html_1.goalUpdateHtml)({
                    firstName: payload.firstName,
                    addedBy: payload.addedBy,
                    title: payload.title,
                    url: this.goalPage(payload.meta?.goalId),
                }),
            });
            if (error)
                throw error;
        }
        catch (error) {
            this.logger.error('sendGoalUpdates failed', error);
            throw error;
        }
    }
    async sendGoalApprovalRequest(payload) {
        const base = this.config.get('EMPLOYEE_PORTAL_URL') || '';
        try {
            const { error } = await this.resend.client.emails.send({
                to: payload.toEmail,
                from: (0, _layout_1.fromHeader)('Goal Approval Required', 'noreply@centahr.com'),
                subject: payload.subject,
                html: (0, goal_html_1.goalApprovalRequestHtml)({
                    managerName: payload.managerName,
                    employeeName: payload.employeeName,
                    title: payload.title,
                    dueDate: payload.dueDate,
                    description: payload.description,
                    url: `${base}/dashboard/performance/goals`,
                }),
            });
            if (error)
                throw error;
        }
        catch (error) {
            this.logger.error('sendGoalApprovalRequest failed', error);
            throw error;
        }
    }
};
exports.GoalNotificationService = GoalNotificationService;
exports.GoalNotificationService = GoalNotificationService = GoalNotificationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        resend_provider_1.ResendProvider])
], GoalNotificationService);
//# sourceMappingURL=goal-notification.service.js.map