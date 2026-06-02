import { LeaveReportService } from './report.service';
import type { User } from 'src/common/types/user.type';
import { BaseController } from 'src/common/interceptor/base.controller';
import { SearchLeaveReportsDto } from './dto/search-leave-report.dto';
export declare class ReportController extends BaseController {
    private readonly reportService;
    constructor(reportService: LeaveReportService);
    getLeaveManagement(user: User): Promise<{
        holidays: {
            name: string;
            date: string;
            type: string;
        }[];
        leaveRequests: ({
            employeeId: string;
            requestId: string;
            employeeName: any;
            leaveType: string;
            startDate: string;
            endDate: string;
            status: string;
            reason: string | null;
            department: any;
            jobRole: string | null;
            totalDays: string;
        } | {
            employeeId: string;
            requestId: string;
            employeeName: any;
            leaveType: string;
            startDate: string;
            endDate: string;
            status: string;
            reason: string | null;
            department: any;
            jobRole: string | null;
            totalDays: string;
        } | {
            employeeId: string;
            requestId: string;
            employeeName: any;
            leaveType: string;
            startDate: string;
            endDate: string;
            status: string;
            reason: string | null;
            department: any;
            jobRole: string | null;
            totalDays: string;
        } | {
            employeeId: string;
            requestId: string;
            employeeName: any;
            leaveType: string;
            startDate: string;
            endDate: string;
            status: string;
            reason: string | null;
            department: any;
            jobRole: string | null;
            totalDays: string;
        })[];
        leaveBalances: ({
            employeeId: string;
            companyId: any;
            name: any;
            department: any;
            jobRole: string | null;
            totalBalance: any;
        } | {
            employeeId: string;
            companyId: any;
            name: any;
            department: any;
            jobRole: string | null;
            totalBalance: any;
        } | {
            employeeId: string;
            companyId: any;
            name: any;
            department: any;
            jobRole: string | null;
            totalBalance: any;
        } | {
            employeeId: string;
            companyId: any;
            name: any;
            department: any;
            jobRole: string | null;
            totalBalance: any;
        })[];
    }>;
    getLeaveBalances(user: User): Promise<any>;
    getLeaveRequests(user: User, ip: string, status?: 'pending' | 'approved' | 'rejected'): Promise<any>;
    getPendingLeaveRequests(user: User): Promise<any>;
    getLeaveBalanceReport(user: User): Promise<{
        leaveBalances: ({
            employeeId: string;
            leaveTypeId: string;
            leaveTypeName: string;
            entitlement: string;
            used: string;
            balance: string;
            year: number;
            employeeName: any;
        } | {
            employeeId: string;
            leaveTypeId: string;
            leaveTypeName: string;
            entitlement: string;
            used: string;
            balance: string;
            year: number;
            employeeName: any;
        })[];
    }>;
    getLeaveUtilizationReport(user: User, dto: SearchLeaveReportsDto): Promise<{
        leaveUtilization: {
            leaveType: string;
            totalLeaveDays: any;
        }[];
        departmentUsage: ({
            departmentName: any;
            totalLeaveDays: any;
        } | {
            departmentName: any;
            totalLeaveDays: any;
        })[];
    }>;
    generateLeaveBalanceReportToS3(user: User, leaveTypeName?: string, year?: number): Promise<{
        url: {
            url: string;
            record: any;
        };
    }>;
}
