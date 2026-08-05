export interface GoalCheckinHtmlProps {
    firstName: string;
    title: string;
    dueDate?: string;
    companyName?: string;
    url: string;
}
export declare const goalCheckinHtml: ({ firstName, title, dueDate, companyName, url, }: GoalCheckinHtmlProps) => string;
export interface GoalAssignmentHtmlProps {
    assignedBy: string;
    assignedTo: string;
    title: string;
    dueDate: string;
    description: string;
    progress: string;
    url: string;
}
export declare const goalAssignmentHtml: ({ assignedBy, assignedTo, title, dueDate, description, progress, url, }: GoalAssignmentHtmlProps) => string;
export interface GoalUpdateHtmlProps {
    firstName: string;
    addedBy: string;
    title: string;
    url: string;
}
export declare const goalUpdateHtml: ({ firstName, addedBy, title, url, }: GoalUpdateHtmlProps) => string;
export interface GoalApprovalRequestHtmlProps {
    managerName: string;
    employeeName: string;
    title: string;
    dueDate: string;
    description: string;
    url: string;
}
export declare const goalApprovalRequestHtml: ({ managerName, employeeName, title, dueDate, description, url, }: GoalApprovalRequestHtmlProps) => string;
