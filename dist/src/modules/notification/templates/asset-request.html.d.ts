export interface AssetRequestHtmlProps {
    employeeName: string;
    companyName: string;
    statusTitle: string;
    statusMessage: string;
    assetType: string;
    purpose: string;
    urgency: string;
    notes?: string;
    rejectionReason?: string;
    remarks?: string;
    actionUrl?: string;
    actionText?: string;
    logoUrl?: string;
}
export declare const assetRequestHtml: ({ employeeName, companyName, statusTitle, statusMessage, assetType, purpose, urgency, notes, rejectionReason, remarks, actionUrl, actionText, logoUrl, }: AssetRequestHtmlProps) => string;
