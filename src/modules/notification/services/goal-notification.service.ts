// src/modules/notification/notification.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ResendProvider } from '../resend.provider';
import {
  goalCheckinHtml,
  goalAssignmentHtml,
  goalUpdateHtml,
  goalApprovalRequestHtml,
} from '../templates/goal.html';
import { fromHeader } from '../templates/_layout';

export interface GoalCheckinPayload {
  toEmail: string;
  firstName: string;
  employeeName: string;
  subject: string;

  title: string;
  dueDate?: string;

  body?: string;
  companyName?: string;

  meta?: {
    goalId?: string;
    employeeId?: string;
    bucket?: 't7' | 't2' | 'today' | 'overdue' | string;
    [k: string]: any;
  };
}

interface GoalAssignmentPayload {
  toEmail: string;
  subject: string;
  assignedBy: string;
  assignedTo: string;
  title: string;
  dueDate: string; // format: YYYY-MM-DD or formatted string
  description: string;
  progress: string; // e.g. "Not started", "In progress"
  meta?: Record<string, any>; // e.g. goalId
}

interface GoalUpdatePayload {
  toEmail: string;
  subject: string;
  firstName: string;
  addedBy: string;
  title: string;
  meta?: Record<string, any>; // e.g. goalId
}

interface GoalApprovalRequestPayload {
  toEmail: string; // manager email
  subject: string;
  employeeName: string;
  managerName: string;
  title: string;
  dueDate: string;
  description: string;
  meta?: Record<string, any>; // goalId, employeeId, etc.
}

@Injectable()
export class GoalNotificationService {
  private readonly logger = new Logger(GoalNotificationService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly resend: ResendProvider,
  ) {}

  /** Deep-link to a goal in the employee portal. */
  private goalPage(goalId?: string) {
    const base = this.config.get<string>('EMPLOYEE_PORTAL_URL') || '';
    return `${base}/ess/performance/goals/${goalId || ''}`;
  }

  async sendGoalCheckin(payload: GoalCheckinPayload) {
    try {
      const { error } = await this.resend.client.emails.send({
        to: payload.toEmail,
        from: fromHeader('Goal Check-in', 'noreply@centahr.com'),
        subject: payload.subject,
        html: goalCheckinHtml({
          firstName: payload.firstName,
          title: payload.title,
          dueDate: payload.dueDate,
          companyName: payload.companyName,
          url: this.goalPage(payload.meta?.goalId),
        }),
      });

      if (error) throw error;
    } catch (error) {
      this.logger.error('sendGoalCheckin failed', error);
      // Rethrow so the queue retries rate-limited/transient failures.
      throw error;
    }
  }

  async sendGoalAssignment(payload: GoalAssignmentPayload) {
    try {
      const { error } = await this.resend.client.emails.send({
        to: payload.toEmail,
        from: fromHeader('Goal Assignment', 'noreply@centahr.com'),
        subject: payload.subject,
        html: goalAssignmentHtml({
          assignedBy: payload.assignedBy,
          assignedTo: payload.assignedTo,
          title: payload.title,
          dueDate: payload.dueDate,
          description: payload.description,
          progress: payload.progress,
          url: this.goalPage(payload.meta?.goalId),
        }),
      });

      if (error) throw error;
    } catch (error) {
      this.logger.error('sendGoalAssignment failed', error);
      // Rethrow so the queue retries rate-limited/transient failures.
      throw error;
    }
  }

  async sendGoalUpdates(payload: GoalUpdatePayload) {
    try {
      const { error } = await this.resend.client.emails.send({
        to: payload.toEmail,
        from: fromHeader('Goal Updates', 'noreply@centahr.com'),
        subject: payload.subject,
        html: goalUpdateHtml({
          firstName: payload.firstName,
          addedBy: payload.addedBy,
          title: payload.title,
          url: this.goalPage(payload.meta?.goalId),
        }),
      });

      if (error) throw error;
    } catch (error) {
      this.logger.error('sendGoalUpdates failed', error);
      // Rethrow so the queue retries rate-limited/transient failures.
      throw error;
    }
  }

  async sendGoalApprovalRequest(payload: GoalApprovalRequestPayload) {
    const base = this.config.get<string>('EMPLOYEE_PORTAL_URL') || '';

    try {
      const { error } = await this.resend.client.emails.send({
        to: payload.toEmail,
        from: fromHeader('Goal Approval Required', 'noreply@centahr.com'),
        subject: payload.subject,
        html: goalApprovalRequestHtml({
          managerName: payload.managerName,
          employeeName: payload.employeeName,
          title: payload.title,
          dueDate: payload.dueDate,
          description: payload.description,
          url: `${base}/dashboard/performance/goals`,
        }),
      });

      if (error) throw error;
    } catch (error) {
      this.logger.error('sendGoalApprovalRequest failed', error);
      // Rethrow so the queue retries rate-limited/transient failures.
      throw error;
    }
  }
}
