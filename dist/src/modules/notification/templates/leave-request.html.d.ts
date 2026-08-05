export interface LeaveRequestHtmlProps {
    employeeName: string;
    companyName: string;
    statusTitle: string;
    statusMessage: string;
    leaveType: string;
    startDate: string;
    endDate: string;
    totalDays: string;
    rejectionReason?: string;
    actionUrl?: string;
    actionText?: string;
    logoUrl?: string;
}
export declare const leaveRequestHtml: ({ employeeName, companyName, statusTitle, statusMessage, leaveType, startDate, endDate, totalDays, rejectionReason, actionUrl, actionText, logoUrl, }: LeaveRequestHtmlProps) => string;
