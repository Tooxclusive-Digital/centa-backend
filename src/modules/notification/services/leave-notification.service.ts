// src/modules/notification/leave-notification.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ResendProvider } from '../resend.provider';
import { leaveRequestHtml } from '../templates/leave-request.html';

type LeaveStatus = 'pending' | 'approved' | 'rejected';

export interface LeaveStatusEmailPayload {
  toEmail: string;

  // template data (camelCase)
  managerName: string;
  employeeName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  totalDays: string;
  reason?: string;
  companyName: string;

  // status driver
  status: LeaveStatus;
  rejectionReason?: string;

  // link
  actionUrl?: string;

  // ids
  leaveRequestId?: string;
  employeeId?: string;
  approverId?: string;

  meta?: Record<string, any>;
}

@Injectable()
export class LeaveNotificationService {
  private readonly logger = new Logger(LeaveNotificationService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly resend: ResendProvider,
  ) {}

  private readonly logoUrl =
    'https://centa-hr.s3.eu-west-3.amazonaws.com/company-files/7beedcd5-66c3-4351-8955-ddcab3528652/5cf61059-52be-4c46-9d4e-9817f2b9257b/1769600186954-1768990436384-logo-CqG_6WrI.png';

  private buildSubject(status: LeaveStatus) {
    if (status === 'pending') return 'Approval Needed: Leave Request';
    if (status === 'approved') return 'Leave Request Approved';
    return 'Leave Request Rejected';
  }

  private buildStatusTitle(status: LeaveStatus) {
    if (status === 'pending') return 'Pending';
    if (status === 'approved') return 'Approved';
    return 'Rejected';
  }

  private buildStatusMessage(status: LeaveStatus) {
    if (status === 'pending')
      return 'a leave request has been submitted and is awaiting your review.';
    if (status === 'approved') return 'the leave request has been approved.';
    return 'the leave request has been rejected.';
  }

  private buildActionUrl(payload: LeaveStatusEmailPayload) {
    if (payload.actionUrl) return payload.actionUrl;

    const base = this.config.get<string>('EMPLOYEE_PORTAL_URL') || '';
    if (!base) return undefined;

    // pending -> manager approval page
    if (payload.status === 'pending') {
      return `${base}/dashboard/leave`;
    }

    // approved/rejected -> employee history/details page
    return `${base}/ess/leave`;
  }

  /**
   * Core sender. The two SendGrid templates (request vs. status) collapse into
   * one function here — the status wording already varies through
   * statusTitle/statusMessage.
   *
   * Deliberately does not rethrow: callers are request paths (submitting or
   * approving leave) that must not fail because mail delivery did.
   */
  async sendLeaveEmail(payload: LeaveStatusEmailPayload) {
    const actionUrl = this.buildActionUrl(payload);

    try {
      const { error } = await this.resend.client.emails.send({
        to: payload.toEmail,
        from: 'CentaHR <noreply@centahr.com>',
        subject: this.buildSubject(payload.status),
        html: leaveRequestHtml({
          employeeName: payload.employeeName,
          companyName: payload.companyName,
          statusTitle: this.buildStatusTitle(payload.status),
          statusMessage: this.buildStatusMessage(payload.status),
          leaveType: payload.leaveType,
          startDate: payload.startDate,
          endDate: payload.endDate,
          totalDays: payload.totalDays,
          rejectionReason: payload.rejectionReason,
          actionUrl,
          actionText: 'View Request',
          logoUrl: this.logoUrl,
        }),
      });

      if (error) throw error;
    } catch (error) {
      this.logger.error('sendLeaveEmail failed', error);
    }
  }

  /** Manager request email (pending) */
  async sendLeaveApprovalRequestEmail(
    payload: Omit<LeaveStatusEmailPayload, 'status'>,
  ) {
    return this.sendLeaveEmail({ ...payload, status: 'pending' });
  }

  /** Employee status email (approved/rejected) */
  async sendLeaveDecisionEmail(
    payload: Omit<LeaveStatusEmailPayload, 'status'> & {
      status: 'approved' | 'rejected';
    },
  ) {
    return this.sendLeaveEmail(payload);
  }
}
