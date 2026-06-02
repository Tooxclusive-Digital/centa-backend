import type { db } from 'src/drizzle/types/drizzle';
export declare class OffCycleReportService {
    private db;
    constructor(db: db);
    getOffCycleSummary(companyId: string, fromDate: string, toDate: string): Promise<({
        employeeId: string;
        name: any;
        payrollDate: string;
        type: string;
        amount: string;
        taxable: boolean;
    } | {
        employeeId: string;
        name: any;
        payrollDate: string;
        type: string;
        amount: string;
        taxable: boolean;
    })[]>;
    getOffCycleVsRegular(companyId: string, month: string): Promise<{
        regular: {
            gross: any;
            tax: any;
            net: any;
        };
        offCycle: {
            gross: any;
            tax: any;
            net: any;
        };
        offPercent: number;
    }>;
    getOffCycleByEmployee(companyId: string, employeeId: string): Promise<{
        payrollDate: string;
        type: string;
        amount: string;
        taxable: boolean;
        remarks: string | null;
        netPaid: string;
    }[]>;
    getOffCycleTypeBreakdown(companyId: string, month?: string): Promise<{
        type: string;
        total: any;
    }[]>;
    getOffCycleTaxImpact(companyId: string, month?: string): Promise<{
        lines: {
            payrollDate: string;
            gross: string;
            pension: string;
            nhf: string | null;
            paye: string;
            net: string;
            type: string;
        }[];
        totalRegularTax: any;
    }>;
    getOffCycleDashboard(companyId: string, options?: {
        month?: string;
        fromDate?: string;
        toDate?: string;
        employeeId?: string;
    }): Promise<{
        summary: ({
            employeeId: string;
            name: any;
            payrollDate: string;
            type: string;
            amount: string;
            taxable: boolean;
        } | {
            employeeId: string;
            name: any;
            payrollDate: string;
            type: string;
            amount: string;
            taxable: boolean;
        })[];
        vsRegular: {
            regular: {
                gross: any;
                tax: any;
                net: any;
            };
            offCycle: {
                gross: any;
                tax: any;
                net: any;
            };
            offPercent: number;
        };
        byEmployee: {
            payrollDate: string;
            type: string;
            amount: string;
            taxable: boolean;
            remarks: string | null;
            netPaid: string;
        }[];
        typeBreakdown: {
            type: string;
            total: any;
        }[];
        taxImpact: {
            lines: {
                payrollDate: string;
                gross: string;
                pension: string;
                nhf: string | null;
                paye: string;
                net: string;
                type: string;
            }[];
            totalRegularTax: any;
        };
    }>;
    getOffCyclePayrollSummary(companyId: string): Promise<{
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
}
