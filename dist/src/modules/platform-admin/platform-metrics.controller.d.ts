import { PlatformMetricsService } from './services/platform-metrics.service';
export declare class PlatformMetricsController {
    private readonly metrics;
    constructor(metrics: PlatformMetricsService);
    getOverview(): Promise<{
        companies: {
            total: any;
            active: any;
            addedThisMonth: any;
            addedLastMonth: any;
            everRanPayroll: any;
        };
        employees: {
            total: any;
            live: any;
            addedThisMonth: any;
            addedLastMonth: any;
        };
        payroll: {
            totalRuns: any;
            byCurrency: {
                currency: "NGN" | "USD" | "EUR" | "GBP";
                grossVolume: any;
                netVolume: any;
                payslipCount: any;
            }[];
            recent: {
                period: any;
                gross: any;
                previousGross: any;
                runs: any;
                companies: any;
            };
            approval: {
                pending: any;
                approved: any;
                completed: any;
            };
            payment: {
                pending: any;
                inProgress: any;
                paid: any;
            };
        };
    }>;
    getCompanyGrowth(interval?: string, since?: string): Promise<{
        period: any;
        added: number;
        cumulative: number;
    }[]>;
    getEmployeeGrowth(interval?: string, since?: string): Promise<{
        series: {
            period: any;
            added: number;
            cumulative: number;
        }[];
        statusBreakdown: ({
            status: any;
            total: any;
        } | {
            status: any;
            total: any;
        })[];
    }>;
    getPayrollVolume(interval?: string, since?: string): Promise<{
        period: any;
        currency: "NGN" | "USD" | "EUR" | "GBP";
        gross: any;
        net: any;
        payslips: any;
        runs: any;
        companiesRun: any;
    }[]>;
    getExceptions(): Promise<any>;
    getStatutorySummary(): Promise<{
        currency: "NGN" | "USD" | "EUR" | "GBP";
        gross: any;
        net: any;
        taxableIncome: any;
        payeTax: any;
        pensionEmployee: any;
        pensionEmployer: any;
        nhf: any;
        bonuses: any;
        salaryAdvance: any;
        customDeductions: any;
        totalDeductions: any;
        payslips: any;
        employeesPaid: any;
        companiesPaying: any;
    }[]>;
    getStatutoryTrend(interval?: string, since?: string): Promise<{
        period: any;
        currency: "NGN" | "USD" | "EUR" | "GBP";
        payeTax: any;
        pension: any;
        nhf: any;
    }[]>;
    getRemittances(): Promise<{
        byTypeStatus: {
            taxType: string;
            status: string | null;
            filings: any;
        }[];
        recent: {
            id: string;
            taxType: string;
            status: string | null;
            payrollMonth: string;
            referenceNumber: string | null;
            submittedAt: Date | null;
            approvedAt: Date | null;
            companyName: string;
        }[];
    }>;
    getRemittanceCoverage(): Promise<any>;
    getAdoptionFunnel(): Promise<{
        signedUp: number;
        activated: number;
        currentlyActive: number;
        medianDaysToActivate: number | null;
        instrumented: {
            processingTime: boolean;
            errorRate: boolean;
        };
    }>;
    getTopCompanies(limit?: string): Promise<{
        id: string;
        name: string;
        currency: "NGN" | "USD" | "EUR" | "GBP";
        gross: any;
        payslips: any;
        runs: any;
    }[]>;
    getCompanyList(limit?: string, offset?: string): Promise<{
        total: any;
        limit: number;
        offset: number;
        rows: {
            id: string;
            name: string;
            domain: string;
            country: string;
            currency: "NGN" | "USD" | "EUR" | "GBP";
            plan: "free" | "pro" | "enterprise";
            isActive: boolean;
            createdAt: Date;
            trialEndsAt: Date | null;
            liveEmployees: any;
            lastPayrollDate: any;
        }[];
    }>;
}
