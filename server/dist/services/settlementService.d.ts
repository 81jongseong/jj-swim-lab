export declare function createSettlementItem(personalLessonId: string): Promise<void>;
export declare function processSettlements(periodStart: Date, periodEnd: Date): Promise<{
    processed: number;
    totalAmount: number;
    errors: string[];
}>;
export declare function getSettlementStats(recipientType?: 'instructor' | 'center' | 'platform', recipientId?: string, startDate?: Date, endDate?: Date): Promise<{
    totalSettlements: number;
    totalAmount: number;
    pendingAmount: number;
    completedAmount: number;
    byPeriod: Array<{
        period: string;
        amount: number;
        count: number;
    }>;
}>;
//# sourceMappingURL=settlementService.d.ts.map