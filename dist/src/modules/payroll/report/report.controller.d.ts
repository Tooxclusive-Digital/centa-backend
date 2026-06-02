import { ReportService } from './report.service';
import type { User } from 'src/common/types/user.type';
import { GenerateReportService } from './generate-report.service';
import { BaseController } from 'src/common/interceptor/base.controller';
export declare class ReportController extends BaseController {
    private readonly reportService;
    private readonly generateReportService;
    constructor(reportService: ReportService, generateReportService: GenerateReportService);
    getGlSummary(user: User, month: string): Promise<{
        rows: never[];
        columns: never[];
        empty: boolean;
    } | {
        rows: {
            glAccountCode: string;
            yearMonth: string;
            label: string;
            debit: string;
            credit: string;
        }[];
        columns: {
            field: string;
            title: string;
        }[];
        empty?: undefined;
    }>;
    getPayrollVariance(user: User): Promise<{
        current: null;
        variance: null;
    } | {
        current: {
            payroll_run_id: string;
            payroll_date: string;
            total_gross_salary: any;
            total_netSalary: any;
            total_deductions: any;
            employee_count: any;
            totalPayrollCost: any;
        };
        variance: {
            gross_salary_variance: number;
            netSalary_variance: number;
            deductions_variance: number;
            payroll_cost_variance: number;
            employee_count_variance: number;
        };
    }>;
    getEmployeeVariance(user: User): Promise<{
        payrollRunId: string;
        payrollDate: string;
        previousPayrollDate: string;
        varianceList: {
            employeeId: string;
            fullName: string;
            previous: {
                grossSalary: import("decimal.js").Decimal;
                netSalary: import("decimal.js").Decimal;
                paye: import("decimal.js").Decimal;
                pension: import("decimal.js").Decimal;
                nhf: import("decimal.js").Decimal;
                employerPension: import("decimal.js").Decimal;
            };
            current: {
                grossSalary: import("decimal.js").Decimal;
                netSalary: import("decimal.js").Decimal;
                paye: import("decimal.js").Decimal;
                pension: import("decimal.js").Decimal;
                nhf: import("decimal.js").Decimal;
                employerPension: import("decimal.js").Decimal;
            };
            variance: {
                grossSalaryDiff: import("decimal.js").Decimal;
                netSalaryDiff: import("decimal.js").Decimal;
                payeDiff: import("decimal.js").Decimal;
                pensionDiff: import("decimal.js").Decimal;
                nhfDiff: import("decimal.js").Decimal;
                employerPensionDiff: import("decimal.js").Decimal;
            };
        }[];
    } | null>;
    getPayrollSummary(user: User, month: string): Promise<{
        runSummaries: {
            payrollRunId: string;
            payrollDate: string;
            payrollMonth: string;
            approvalStatus: string;
            paymentStatus: string | null;
            totalGross: any;
            totalDeductions: any;
            totalBonuses: any;
            totalNet: any;
            employeeCount: any;
            costPerRun: any;
        }[];
        yearToDate: {
            year: string;
            totalGrossYTD: any;
            totalDeductionsYTD: any;
            totalBonusesYTD: any;
            totalNetYTD: any;
            employeeCountYTD: any;
        };
        headcount: any;
        totalCurrentSalary: any;
        costTrend: {
            monthCost: any;
            deltaCost: number;
            pctChange: number;
            month: string;
            monthGross: any;
            monthDeductions: any;
            monthBonuses: any;
            monthNet: any;
        }[];
        onboardingCompleted: any;
    }>;
    getCombinedPayroll(user: User): Promise<{
        payrollSummary: {
            voluntaryDeductions: number;
            totalDeductions: number;
            payrollRunId: string;
            payrollDate: string;
            payrollMonth: string;
            approvalStatus: string;
            paymentStatus: string | null;
            totalGrossSalary: any;
            employeeCount: any;
            totalNetSalary: any;
            totalPayrollCost: any;
        }[];
        nextPayDate: Date | null;
    }>;
    getPayrollAnalyticsReport(user: User, month?: string): Promise<{
        month: string;
        summary: {
            voluntaryDeductions: number;
            totalDeductions: number;
            payrollRunId: string;
            payrollDate: string;
            payrollMonth: string;
            approvalStatus: string;
            paymentStatus: string | null;
            totalGrossSalary: any;
            employeeCount: any;
            totalNetSalary: any;
            totalPayrollCost: any;
        }[];
        salaryInsights: {
            breakdown: ({
                payrollMonth: string;
                employeeId: string;
                employeeName: any;
                grossSalary: any;
                netSalary: any;
                deductions: any;
                bonuses: any;
                paymentStatus: string | null;
            } | {
                payrollMonth: string;
                employeeId: string;
                employeeName: any;
                grossSalary: any;
                netSalary: any;
                deductions: any;
                bonuses: any;
                paymentStatus: string | null;
            })[];
            stats: {
                avgSalary: any;
                highestPaid: any;
                lowestPaid: any;
            };
            distribution: {
                salaryRange: any;
                count: any;
            }[];
            byDepartment: ({
                departmentName: any;
                totalNetSalary: any;
            } | {
                departmentName: any;
                totalNetSalary: any;
            })[];
        };
        ytdData: {
            totals: {
                gross_salary_ytd: any;
                net_salary_ytd: any;
                paye_tax_ytd: any;
                pension_contribution_ytd: any;
                employer_pension_contribution_ytd: any;
                nhf_contribution_ytd: any;
            };
            employees: ({
                employeeId: string;
                firstName: any;
                lastName: any;
                employeeNumber: any;
                gross_salary_ytd: any;
                net_salary_ytd: any;
                paye_tax_ytd: any;
                pension_contribution_ytd: any;
                employer_pension_contribution_ytd: any;
                nhf_contribution_ytd: any;
            } | {
                employeeId: string;
                firstName: any;
                lastName: any;
                employeeNumber: any;
                gross_salary_ytd: any;
                net_salary_ytd: any;
                paye_tax_ytd: any;
                pension_contribution_ytd: any;
                employer_pension_contribution_ytd: any;
                nhf_contribution_ytd: any;
            })[];
        };
    }>;
    getCostByPayGroup(user: User, month: string): Promise<{
        payGroupCost: ({
            totalGross: any;
            totalNet: any;
            headcount: any;
            payGroupId: string;
            payGroupName: string;
        } | {
            totalGross: any;
            totalNet: any;
            headcount: any;
            payGroupId: string;
            payGroupName: string;
        })[];
        departmentCost: ({
            totalGross: any;
            totalNet: any;
            headcount: any;
            departmentName: any;
        } | {
            totalGross: any;
            totalNet: any;
            headcount: any;
            departmentName: any;
        })[];
    }>;
    getTopBonusRecipients(user: User, month: string, limit?: number): Promise<({
        employeeId: string;
        fullName: any;
        bonus: any;
    } | {
        employeeId: string;
        fullName: any;
        bonus: any;
    })[]>;
    getVarianceReport(user: User): Promise<{
        company: {
            rows: never[];
            columns: never[];
            payrollDate: null;
            previousPayrollDate: null;
            empty: boolean;
        } | {
            payrollDate: string;
            previousPayrollDate: string;
            rows: {
                [x: string]: string;
                metric: string;
                variance: string;
            }[];
            columns: {
                field: string;
                title: string;
            }[];
            empty?: undefined;
        };
        employees: {
            rows: never[];
            columns: never[];
            payrollDate: null;
            previousPayrollDate: null;
            empty: boolean;
        } | {
            payrollDate: string;
            previousPayrollDate: string;
            rows: any[];
            columns: {
                field: string;
                title: string;
            }[];
            empty?: undefined;
        };
    }>;
    getLoanSummaryReport(user: User): Promise<{
        outstandingSummary: ({
            employeeId: string;
            employeeName: any;
            totalLoanAmount: string;
            totalRepaid: string;
            outstanding: any;
            status: string;
        } | {
            employeeId: string;
            employeeName: any;
            totalLoanAmount: string;
            totalRepaid: string;
            outstanding: any;
            status: string;
        })[];
        monthlySummary: {
            year: any;
            month: any;
            status: string;
            totalLoanAmount: any;
            totalRepaid: any;
            totalOutstanding: any;
        }[];
    }>;
    getLoanRepaymentReport(user: User): Promise<({
        employeeId: any;
        employeeName: any;
        totalRepaid: any;
        repaymentCount: any;
        firstRepayment: any;
        lastRepayment: any;
    } | {
        employeeId: any;
        employeeName: any;
        totalRepaid: any;
        repaymentCount: any;
        firstRepayment: any;
        lastRepayment: any;
    })[]>;
    getDeductionsSummary(user: User, month?: string): Promise<{
        deductionBreakdown: {
            payrollMonth: string;
            paye: any;
            pension: any;
            nhf: any;
            custom: any;
        }[];
        employerCostBreakdown: {
            payrollMonth: string;
            gross: any;
            employerPension: any;
            totalCost: any;
        }[];
        deductionByEmployee: {
            employeeId: string;
            employeeName: any;
            paye: string;
            pension: string;
            nhf: string | null;
            salaryAdvance: string | null;
            voluntary: any;
            total: any;
        }[];
    }>;
    downloadPaymentAdvice(user: User, id: string, format?: 'internal' | 'bank'): Promise<{
        url: {
            url: string;
            record: any;
        } | null;
    }>;
    generateGLSummary(user: User, month: string): Promise<{
        url: {
            url: string;
            record: any;
        };
    }>;
    downloadYTD(user: User, format?: 'csv' | 'excel'): Promise<{
        url: {
            url: string;
            record: any;
        };
    }>;
    downloadCompanyVariance(user: User): Promise<{
        url: {
            url: string;
            record: any;
        };
    }>;
    downloadEmployeeVariance(user: User): Promise<{
        url: {
            url: string;
            record: any;
        };
    }>;
    downloadPayrollDashboard(user: User): Promise<{
        url: {
            url: string;
            record: any;
        };
    }>;
    downloadRunSummaries(user: User, month?: string): Promise<{
        url: {
            url: string;
            record: any;
        };
    }>;
    downloadEmployeeDeductions(user: User, month: string, format?: 'csv' | 'excel'): Promise<{
        url: {
            url: string;
            record: any;
        };
    }>;
    downloadCostByPayGroup(user: User, month: string): Promise<{
        url: {
            url: string;
            record: any;
        };
    }>;
    downloadCostByDepartment(user: User, month: string, format?: 'csv' | 'excel'): Promise<{
        url: {
            url: string;
            record: any;
        };
    }>;
    downloadTopBonusRecipients(user: User, month: string, limit?: string): Promise<{
        url: {
            url: string;
            record: any;
        };
    }>;
    downloadLoanSummaryReport(user: User): Promise<{
        url: {
            url: string;
            record: any;
        };
    }>;
    downloadLoanRepaymentReport(user: User, month?: string, format?: 'csv' | 'excel'): Promise<{
        url: {
            url: string;
            record: any;
        };
    }>;
}
