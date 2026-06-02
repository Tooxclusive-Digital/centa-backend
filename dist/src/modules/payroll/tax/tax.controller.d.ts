import { TaxService } from './tax.service';
import { FastifyReply } from 'fastify';
import type { User } from 'src/common/types/user.type';
import { BaseController } from 'src/common/interceptor/base.controller';
export declare class TaxController extends BaseController {
    private readonly taxService;
    constructor(taxService: TaxService);
    downloadExcel(tax_filing_id: string, reply: FastifyReply): Promise<undefined>;
    downloadVoluntary(type: string, month: string, reply: FastifyReply): Promise<undefined>;
    getCompanyTaxFilings(user: User): Promise<({
        id: string;
        tax_type: string;
        total_deductions: any;
        status: string | null;
        month: string;
    } | {
        id: any;
        tax_type: string;
        total_deductions: any;
        status: string;
        month: string;
    })[]>;
    updateCompanyTaxFilings(id: string, status: string): Promise<{
        success: boolean;
    }>;
    createCompanyTaxFiling(user: User): Promise<{
        message: string;
    }>;
}
