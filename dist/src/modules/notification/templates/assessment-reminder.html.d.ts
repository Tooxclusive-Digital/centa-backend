export interface AssessmentReminderHtmlProps {
    firstName: string;
    employeeName: string;
    reviewerName?: string;
    cycleName: string;
    dueDate?: string;
    companyName: string;
    url: string;
}
export declare const assessmentReminderHtml: ({ firstName, employeeName, reviewerName, cycleName, dueDate, companyName, url, }: AssessmentReminderHtmlProps) => string;
