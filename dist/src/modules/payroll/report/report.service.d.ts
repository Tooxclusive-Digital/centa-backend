import type { db } from 'src/drizzle/types/drizzle';
import { PaySchedulesService } from '../pay-schedules/pay-schedules.service';
import Decimal from 'decimal.js';
import { CompanySettingsService } from 'src/company-settings/company-settings.service';
export declare class ReportService {
    private readonly db;
    private readonly paySchedulesService;
    private readonly companySettings;
    constructor(db: db, paySchedulesService: PaySchedulesService, companySettings: CompanySettingsService);
    getLatestPayrollSummaryWithVariance(companyId: string): Promise<{
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
    getEmployeePayrollVariance(companyId: string): Promise<{
        payrollRunId: string;
        payrollDate: string;
        previousPayrollDate: string;
        varianceList: {
            employeeId: string;
            fullName: string;
            previous: {
                grossSalary: Decimal;
                netSalary: Decimal;
                paye: Decimal;
                pension: Decimal;
                nhf: Decimal;
                employerPension: Decimal;
            };
            current: {
                grossSalary: Decimal;
                netSalary: Decimal;
                paye: Decimal;
                pension: Decimal;
                nhf: Decimal;
                employerPension: Decimal;
            };
            variance: {
                grossSalaryDiff: Decimal;
                netSalaryDiff: Decimal;
                payeDiff: Decimal;
                pensionDiff: Decimal;
                nhfDiff: Decimal;
                employerPensionDiff: Decimal;
            };
        }[];
    } | null>;
    getVoluntaryDeductionTotals(companyId: string): Promise<Map<string, number>>;
    getPayrollSummary(companyId: string): Promise<{
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
    }[]>;
    getCombinedPayroll(companyId: string): Promise<{
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
    getPayrollDashboard(companyId: string, month?: string): Promise<{
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
    getPayrollCostReport(companyId: string, month: string): Promise<{
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
    getCostByPayGroup(companyId: string, month: string): Promise<({
        payGroupId: string;
        payGroupName: string;
        totalGross: any;
        totalNet: any;
        headcount: any;
    } | {
        payGroupId: string;
        payGroupName: string;
        totalGross: any;
        totalNet: any;
        headcount: any;
    })[]>;
    getCostByDepartment(companyId: string, month: string): Promise<({
        departmentName: any;
        totalGross: any;
        totalNet: any;
        headcount: any;
    } | {
        departmentName: any;
        totalGross: any;
        totalNet: any;
        headcount: any;
    })[]>;
    getTopBonusRecipients(companyId: string, month: string, limit?: number): Promise<({
        employeeId: string;
        fullName: any;
        bonus: any;
    } | {
        employeeId: string;
        fullName: any;
        bonus: any;
    })[]>;
    private getSalaryInsights;
    YtdReport(companyId: string): Promise<{
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
    }>;
    getPayrollAnalyticsReport(companyId: string, month?: string): Promise<{
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
    private getDeductionBreakdownByMonth;
    private getEmployerCostBreakdownByMonth;
    getDeductionsByEmployee(companyId: string, month: string): Promise<{
        employeeId: string;
        employeeName: any;
        paye: string;
        pension: string;
        nhf: string | null;
        salaryAdvance: string | null;
        voluntary: any;
        total: any;
    }[]>;
    getDeductionsSummary(companyId: string, month?: string): Promise<{
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
    getLoanFullReport(companyId: string): Promise<{
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
    getLoanRepaymentReport(companyId: string): Promise<({
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
}
