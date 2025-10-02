export interface EvidenceBasedWeights {
    cardiovascular: {
        weight: number;
        evidence: string;
        studies: string[];
        confidence: number;
    };
    metabolic: {
        weight: number;
        evidence: string;
        studies: string[];
        confidence: number;
    };
    musculoskeletal: {
        weight: number;
        evidence: string;
        studies: string[];
        confidence: number;
    };
    age: {
        weight: number;
        evidence: string;
        studies: string[];
        confidence: number;
    };
    fitness: {
        weight: number;
        evidence: string;
        studies: string[];
        confidence: number;
    };
}
export declare class EvidenceBasedWeightSystem {
    static getCardiovascularWeights(): EvidenceBasedWeights['cardiovascular'];
    static getMetabolicWeights(): EvidenceBasedWeights['metabolic'];
    static getMusculoskeletalWeights(): EvidenceBasedWeights['musculoskeletal'];
    static getAgeWeights(): EvidenceBasedWeights['age'];
    static getFitnessWeights(): EvidenceBasedWeights['fitness'];
    static generateEvidenceBasedWeights(): EvidenceBasedWeights;
    static validateWeights(weights: EvidenceBasedWeights): {
        isValid: boolean;
        totalWeight: number;
        issues: string[];
    };
    static getAlgorithmEvidence(): {
        [algorithm: string]: {
            evidenceLevel: 'A' | 'B' | 'C' | 'D';
            description: string;
            studies: string[];
            recommendation: string;
        };
    };
    static canModifyWeights(adminLevel: 'superAdmin' | 'centerAdmin' | 'instructor', modificationReason: string, evidenceProvided: boolean): {
        allowed: boolean;
        reason: string;
        requiredApproval: string[];
    };
}
//# sourceMappingURL=EvidenceBasedWeights.d.ts.map