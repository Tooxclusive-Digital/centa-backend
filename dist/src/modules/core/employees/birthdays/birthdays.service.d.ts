import type { db } from 'src/drizzle/types/drizzle';
import { CacheService } from 'src/common/cache/cache.service';
export interface BirthdayEntry {
    employeeId: string;
    firstName: string;
    lastName: string;
    email: string;
    department: string | null;
    birthdayMonthDay: string;
    nextOccurrence: string;
    daysAway: number;
}
export declare class BirthdaysService {
    private readonly db;
    private readonly cache;
    private readonly logger;
    private readonly ttlSeconds;
    constructor(db: db, cache: CacheService);
    getUpcomingBirthdays(companyId: string, windowDays?: number): Promise<BirthdayEntry[]>;
    getTodaysBirthdays(companyId: string): Promise<BirthdayEntry[]>;
}
