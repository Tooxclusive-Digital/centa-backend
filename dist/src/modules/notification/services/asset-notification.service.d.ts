import { ConfigService } from '@nestjs/config';
import { ResendProvider } from '../resend.provider';
type AssetStatus = 'requested' | 'approved' | 'rejected';
export interface AssetStatusEmailPayload {
    toEmail: string;
    managerName: string;
    employeeName: string;
    assetType: string;
    purpose: string;
    urgency: string;
    notes?: string;
    companyName: string;
    status: AssetStatus;
    rejectionReason?: string;
    remarks?: string;
    actionUrl?: string;
    assetRequestId?: string;
    employeeId?: string;
    approverId?: string;
    meta?: Record<string, any>;
}
export declare class AssetNotificationService {
    private readonly config;
    private readonly resend;
    private readonly logger;
    constructor(config: ConfigService, resend: ResendProvider);
    private readonly logoUrl;
    private buildSubject;
    private buildStatusTitle;
    private buildStatusMessage;
    private buildActionUrl;
    sendAssetEmail(payload: AssetStatusEmailPayload): Promise<void>;
    sendAssetApprovalRequestEmail(payload: Omit<AssetStatusEmailPayload, 'status'>): Promise<void>;
    sendAssetDecisionEmail(payload: Omit<AssetStatusEmailPayload, 'status'> & {
        status: 'approved' | 'rejected';
    }): Promise<void>;
}
export {};
