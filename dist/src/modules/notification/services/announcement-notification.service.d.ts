import { ConfigService } from '@nestjs/config';
import { ResendProvider } from '../resend.provider';
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
    meta?: Record<string, any>;
}
export declare class AnnouncementNotificationService {
    private readonly config;
    private readonly resend;
    private readonly logger;
    constructor(config: ConfigService, resend: ResendProvider);
    sendNewAnnouncement(payload: AnnouncementPayload): Promise<void>;
    sendAssessmentReminder(payload: AssessmentReminderPayload): Promise<void>;
}
