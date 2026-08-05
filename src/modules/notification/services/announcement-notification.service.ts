// src/modules/notification/announcement-notification.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ResendProvider } from '../resend.provider';
import { announcementHtml } from '../templates/announcement.html';
import { assessmentReminderHtml } from '../templates/assessment-reminder.html';
import { fromHeader } from '../templates/_layout';

export interface AnnouncementPayload {
  toEmail: string;
  subject: string;
  firstName: string;
  title: string;
  body: string;
  publishedAt?: string;
  expiresAt?: string;
  companyName: string;
  meta?: Record<string, any>;
}

export interface AssessmentReminderPayload {
  toEmail: string;
  subject?: string;
  firstName: string;

  employeeName: string;
  reviewerName?: string;

  cycleName: string;
  dueDate?: string;

  companyName: string;

  meta?: Record<string, any>; // assessmentId etc
}

@Injectable()
export class AnnouncementNotificationService {
  private readonly logger = new Logger(AnnouncementNotificationService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly resend: ResendProvider,
  ) {}

  // ---------------------------------------------------------------------------
  // Announcement
  // ---------------------------------------------------------------------------
  async sendNewAnnouncement(payload: AnnouncementPayload) {
    const base = this.config.get<string>('EMPLOYEE_PORTAL_URL') || '';
    const url = `${base}/ess/announcement/${payload.meta?.announcementId || ''}`;

    try {
      const { error } = await this.resend.client.emails.send({
        to: payload.toEmail,
        from: fromHeader(
          payload.companyName || 'Announcements',
          'noreply@centahr.com',
        ),
        subject: payload.subject,
        html: announcementHtml({
          firstName: payload.firstName,
          title: payload.title,
          body: payload.body,
          publishedAt: payload.publishedAt,
          expiresAt: payload.expiresAt,
          companyName: payload.companyName,
          url,
        }),
      });

      if (error) throw error;
    } catch (error) {
      this.logger.error('sendNewAnnouncement failed', error);
      // Rethrow so the queue retries: swallowing here marked rate-limited
      // (429) jobs as successful and silently dropped the email.
      throw error;
    }
  }

  // ---------------------------------------------------------------------------
  // ✅ Assessment Reminder
  // ---------------------------------------------------------------------------
  async sendAssessmentReminder(payload: AssessmentReminderPayload) {
    const base = this.config.get<string>('EMPLOYEE_PORTAL_URL') || '';
    const url = `${base}/ess/performance/reviews/${payload.meta?.assessmentId || ''}`;

    try {
      const { error } = await this.resend.client.emails.send({
        to: payload.toEmail,
        from: fromHeader(
          payload.companyName || 'Performance Team',
          'noreply@centahr.com',
        ),
        subject: payload.subject || `Reminder: ${payload.cycleName} review`,
        html: assessmentReminderHtml({
          firstName: payload.firstName,
          employeeName: payload.employeeName,
          reviewerName: payload.reviewerName,
          cycleName: payload.cycleName,
          dueDate: payload.dueDate,
          companyName: payload.companyName,
          url,
        }),
      });

      if (error) throw error;
    } catch (error) {
      this.logger.error('sendAssessmentReminder failed', error);
      // Rethrow so the queue retries rate-limited/transient failures.
      throw error;
    }
  }
}
