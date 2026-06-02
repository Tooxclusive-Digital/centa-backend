import type { db } from 'src/drizzle/types/drizzle';
import type { User } from 'src/common/types/user.type';
import { GetGoalReportDto } from './dto/get-goal-report.dto';
import { GetFeedbackReportDto } from './dto/get-feedback-report.dto';
import { GetAssessmentReportDto } from './dto/get-assessment-report.dto';
import { GetTopEmployeesDto } from './dto/get-top-employees.dto';
export declare class ReportService {
    private readonly db;
    constructor(db: db);
    reportFilters(companyId: string): Promise<{
        cycles: {
            id: string;
            name: string;
        }[];
        employeesList: ({
            id: any;
            name: any;
        } | {
            id: any;
            name: any;
        })[];
        departmentsList: ({
            id: any;
            name: any;
        } | {
            id: any;
            name: any;
        })[];
    }>;
    getGoalReport(user: User, filters?: GetGoalReportDto): Promise<({
        goalId: any;
        employeeId: any;
        employeeName: any;
        jobRoleName: string | null;
        departmentName: any;
        title: any;
        description: any;
        type: any;
        status: any;
        weight: any;
        startDate: any;
        dueDate: any;
    } | {
        goalId: any;
        employeeId: any;
        employeeName: any;
        jobRoleName: string | null;
        departmentName: any;
        title: any;
        description: any;
        type: any;
        status: any;
        weight: any;
        startDate: any;
        dueDate: any;
    } | {
        goalId: any;
        employeeId: any;
        employeeName: any;
        jobRoleName: string | null;
        departmentName: any;
        title: any;
        description: any;
        type: any;
        status: any;
        weight: any;
        startDate: any;
        dueDate: any;
    } | {
        goalId: any;
        employeeId: any;
        employeeName: any;
        jobRoleName: string | null;
        departmentName: any;
        title: any;
        description: any;
        type: any;
        status: any;
        weight: any;
        startDate: any;
        dueDate: any;
    } | {
        goalId: any;
        employeeId: any;
        employeeName: any;
        jobRoleName: string | null;
        departmentName: any;
        title: any;
        description: any;
        type: any;
        status: any;
        weight: any;
        startDate: any;
        dueDate: any;
    } | {
        goalId: any;
        employeeId: any;
        employeeName: any;
        jobRoleName: string | null;
        departmentName: any;
        title: any;
        description: any;
        type: any;
        status: any;
        weight: any;
        startDate: any;
        dueDate: any;
    } | {
        goalId: any;
        employeeId: any;
        employeeName: any;
        jobRoleName: string | null;
        departmentName: any;
        title: any;
        description: any;
        type: any;
        status: any;
        weight: any;
        startDate: any;
        dueDate: any;
    } | {
        goalId: any;
        employeeId: any;
        employeeName: any;
        jobRoleName: string | null;
        departmentName: any;
        title: any;
        description: any;
        type: any;
        status: any;
        weight: any;
        startDate: any;
        dueDate: any;
    })[]>;
    getFeedbackReport(user: User, filters: GetFeedbackReportDto): Promise<({
        senderName: any;
        responses: {
            questionText: string;
            answer: string;
            order: number;
        }[];
        feedbackId: string;
        recipientId: string;
        isAnonymous: boolean | null;
        submittedAt: Date | null;
        senderId: string;
        employeeName: any;
    } | {
        senderName: any;
        responses: {
            questionText: string;
            answer: string;
            order: number;
        }[];
        feedbackId: string;
        recipientId: string;
        isAnonymous: boolean | null;
        submittedAt: Date | null;
        senderId: string;
        employeeName: any;
    })[]>;
    getAssessmentReportSummary(user: User, filters?: GetAssessmentReportDto): Promise<({
        id: string;
        employeeId: string;
        type: "manager" | "self" | "peer";
        status: "in_progress" | "submitted" | "not_started" | null;
        submittedAt: Date | null;
        createdAt: Date | null;
        reviewerId: string;
        revieweeName: any;
        reviewerName: any;
        departmentName: any;
        finalScore: number | null;
        promotionRecommendation: string | null;
        potentialFlag: boolean | null;
    } | {
        id: string;
        employeeId: string;
        type: "manager" | "self" | "peer";
        status: "in_progress" | "submitted" | "not_started" | null;
        submittedAt: Date | null;
        createdAt: Date | null;
        reviewerId: string;
        revieweeName: any;
        reviewerName: any;
        departmentName: any;
        finalScore: number | null;
        promotionRecommendation: string | null;
        potentialFlag: boolean | null;
    } | {
        id: string;
        employeeId: string;
        type: "manager" | "self" | "peer";
        status: "in_progress" | "submitted" | "not_started" | null;
        submittedAt: Date | null;
        createdAt: Date | null;
        reviewerId: string;
        revieweeName: any;
        reviewerName: any;
        departmentName: any;
        finalScore: number | null;
        promotionRecommendation: string | null;
        potentialFlag: boolean | null;
    })[]>;
    getTopEmployees(user: User, filter: GetTopEmployeesDto): Promise<({
        source: "performance";
        employeeId: any;
        employeeName: any;
        departmentName: any;
        jobRoleName: string | null;
        finalScore: number | null;
        promotionRecommendation: string | null;
        potentialFlag: boolean | null;
    } | {
        source: "performance";
        employeeId: any;
        employeeName: any;
        departmentName: any;
        jobRoleName: string | null;
        finalScore: number | null;
        promotionRecommendation: string | null;
        potentialFlag: boolean | null;
    } | {
        source: "performance";
        employeeId: any;
        employeeName: any;
        departmentName: any;
        jobRoleName: string | null;
        finalScore: number | null;
        promotionRecommendation: string | null;
        potentialFlag: boolean | null;
    } | {
        source: "performance";
        employeeId: any;
        employeeName: any;
        departmentName: any;
        jobRoleName: string | null;
        finalScore: number | null;
        promotionRecommendation: string | null;
        potentialFlag: boolean | null;
    })[]>;
    getPerformanceOverview(user: User): Promise<{
        performanceCycle: null;
        goalPerformance: {
            totalGoals: number;
            completedGoals: number;
            overdueGoals: number;
        };
        feedbackActivity: {
            peerCount: number;
            managerCount: number;
            selfCount: number;
            avgPerEmployee: number;
            anonymityRate: number;
        };
        assessmentActivity: {
            total: number;
            submitted: number;
            inProgress: number;
            notStarted: number;
            avgScore: number;
            recommendationCounts: {};
        };
        topEmployees: never[];
    } | {
        performanceCycle: {
            id: string;
            name: string;
            startDate: string;
            endDate: string;
            status: string | null;
        };
        goalPerformance: {
            totalGoals: number;
            completedGoals: number;
            overdueGoals: number;
        };
        feedbackActivity: {
            peerCount: number;
            managerCount: number;
            selfCount: number;
            avgPerEmployee: number;
            anonymityRate: number;
        };
        assessmentActivity: {
            total: number;
            submitted: number;
            inProgress: number;
            notStarted: number;
            avgScore: number;
            recommendationCounts: Record<string, number>;
        };
        topEmployees: ({
            source: "performance";
            employeeId: any;
            employeeName: any;
            departmentName: any;
            jobRoleName: string | null;
            finalScore: number | null;
            promotionRecommendation: string | null;
            potentialFlag: boolean | null;
        } | {
            source: "performance";
            employeeId: any;
            employeeName: any;
            departmentName: any;
            jobRoleName: string | null;
            finalScore: number | null;
            promotionRecommendation: string | null;
            potentialFlag: boolean | null;
        } | {
            source: "performance";
            employeeId: any;
            employeeName: any;
            departmentName: any;
            jobRoleName: string | null;
            finalScore: number | null;
            promotionRecommendation: string | null;
            potentialFlag: boolean | null;
        } | {
            source: "performance";
            employeeId: any;
            employeeName: any;
            departmentName: any;
            jobRoleName: string | null;
            finalScore: number | null;
            promotionRecommendation: string | null;
            potentialFlag: boolean | null;
        })[];
    }>;
}
