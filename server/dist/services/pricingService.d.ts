interface PricingPolicy {
    student: {
        monthly: number;
        annual: number;
        features: string[];
    };
    instructorPersonal: {
        monthly: number;
        annual: number;
        discountRate: number;
        features: string[];
    };
    instructorBusiness: {
        monthly: number;
        annual: number;
        discountRate: number;
        features: string[];
    };
    centerManaged: {
        monthly: number;
        annual: number;
        discountRate: number;
        features: string[];
    };
}
export interface PricingResult {
    userType: string;
    pricingTier: string;
    baseAmount: number;
    discountAmount: number;
    finalAmount: number;
    discountReason: string;
    centerId?: string;
    isCenterSponsored: boolean;
    features: string[];
}
export declare function checkUserCenterAffiliation(userId: string): Promise<{
    hasCenterAffiliation: boolean;
    centerId?: string;
    isCenterSponsored: boolean;
}>;
export declare function calculatePricing(userId: string, billingPeriod?: 'monthly' | 'annual'): Promise<PricingResult>;
export declare function updatePricingPolicy(newPolicy: Partial<PricingPolicy>): void;
export declare function getCurrentPricingPolicy(): PricingPolicy;
export declare function getUserDiscountRate(userId: string): Promise<{
    discountRate: number;
    reason: string;
}>;
export {};
//# sourceMappingURL=pricingService.d.ts.map