// src/modules/notification/asset-notification.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ResendProvider } from '../resend.provider';
import { assetRequestHtml } from '../templates/asset-request.html';

type AssetStatus = 'requested' | 'approved' | 'rejected';

export interface AssetStatusEmailPayload {
  toEmail: string;

  // template data (camelCase)
  managerName: string; // approver / line manager name (for "requested")
  employeeName: string; // requester name
  assetType: string;
  purpose: string;
  urgency: string;
  notes?: string;
  companyName: string;

  // status driver
  status: AssetStatus;
  rejectionReason?: string; // optional (for rejected)
  remarks?: string; // optional (approved/rejected comments)

  // link (you said: use request action url here)
  actionUrl?: string;

  // ids (optional)
  assetRequestId?: string;
  employeeId?: string;
  approverId?: string;

  meta?: Record<string, any>;
}

@Injectable()
export class AssetNotificationService {
  private readonly logger = new Logger(AssetNotificationService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly resend: ResendProvider,
  ) {}

  private readonly logoUrl =
    'https://centa-hr.s3.eu-west-3.amazonaws.com/company-files/7beedcd5-66c3-4351-8955-ddcab3528652/5cf61059-52be-4c46-9d4e-9817f2b9257b/1769600186954-1768990436384-logo-CqG_6WrI.png';

  private buildSubject(status: AssetStatus, assetType?: string) {
    const type = assetType ? ` – ${assetType}` : '';
    if (status === 'requested') return `Approval Needed: Asset Request${type}`;
    if (status === 'approved') return `Asset Request Approved${type}`;
    return `Asset Request Rejected${type}`;
  }

  private buildStatusTitle(status: AssetStatus) {
    if (status === 'requested') return 'Requested';
    if (status === 'approved') return 'Approved';
    return 'Rejected';
  }

  private buildStatusMessage(status: AssetStatus) {
    if (status === 'requested')
      return 'an asset request has been submitted and is awaiting your review.';
    if (status === 'approved') return 'your asset request has been approved.';
    return 'your asset request has been rejected.';
  }

  /**
   * You asked:
   * - request email (requested) should go to dashboard
   * - status emails (approved/rejected) should go to ESS
   * - but we can use payload.actionUrl if provided (preferred)
   */
  private buildActionUrl(payload: AssetStatusEmailPayload) {
    if (payload.actionUrl) return payload.actionUrl;

    const base = this.config.get<string>('EMPLOYEE_PORTAL_URL') || '';
    if (!base) return undefined;

    // requested -> manager approval dashboard
    if (payload.status === 'requested') {
      return `${base}/dashboard/assets`;
    }

    // approved/rejected -> employee ESS history/details
    return `${base}/ess/assets`;
  }

  /**
   * Core sender. The request/status split that used two SendGrid templates is
   * one function here — the wording already varies via statusTitle/statusMessage.
   *
   * Deliberately does not rethrow: callers are request paths (submitting or
   * approving an asset request) that must not fail because mail delivery did.
   */
  async sendAssetEmail(payload: AssetStatusEmailPayload) {
    const actionUrl = this.buildActionUrl(payload);

    try {
      const { error } = await this.resend.client.emails.send({
        to: payload.toEmail,
        from: 'CentaHR <noreply@centahr.com>',
        subject: this.buildSubject(payload.status, payload.assetType),
        html: assetRequestHtml({
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
          actionText:
            payload.status === 'requested' ? 'Review Request' : 'View Request',
          logoUrl: this.logoUrl,
        }),
      });

      if (error) throw error;
    } catch (error) {
      this.logger.error('sendAssetEmail failed', error);
    }
  }

  /** Manager request email (requested) */
  async sendAssetApprovalRequestEmail(
    payload: Omit<AssetStatusEmailPayload, 'status'>,
  ) {
    return this.sendAssetEmail({ ...payload, status: 'requested' });
  }

  /** Employee status email (approved/rejected) */
  async sendAssetDecisionEmail(
    payload: Omit<AssetStatusEmailPayload, 'status'> & {
      status: 'approved' | 'rejected';
    },
  ) {
    return this.sendAssetEmail(payload);
  }
}
