import { ConfigService } from '@nestjs/config';
import { ResendProvider } from '../resend.provider';
type LeaveStatus = 'pending' | 'approved' | 'rejected';
export interface LeaveStatusEmailPayload {
    toEmail: string;
    managerName: string;
    employeeName: string;
    leaveType: string;
    startDate: string;
    endDate: string;
    totalDays: string;
    reason?: string;
    companyName: string;
    status: LeaveStatus;
    rejectionReason?: string;
    actionUrl?: string;
    leaveRequestId?: string;
    employeeId?: string;
    approverId?: string;
    meta?: Record<string, any>;
}
export declare class LeaveNotificationService {
    private readonly config;
    private readonly resend;
    private readonly logger;
    constructor(config: ConfigService, resend: ResendProvider);
    private readonly logoUrl;
    private buildSubject;
    private buildStatusTitle;
    private buildStatusMessage;
    private buildActionUrl;
    sendLeaveEmail(payload: LeaveStatusEmailPayload): Promise<void>;
    sendLeaveApprovalRequestEmail(payload: Omit<LeaveStatusEmailPayload, 'status'>): Promise<void>;
    sendLeaveDecisionEmail(payload: Omit<LeaveStatusEmailPayload, 'status'> & {
        status: 'approved' | 'rejected';
    }): Promise<void>;
}
export {};
