export interface MedicalRiskFactors {
    age: number;
    gender: 'male' | 'female';
    bmi: number;
    systolicBP: number;
    diastolicBP: number;
    restingHR: number;
    bloodSugar: number;
    cholesterol?: number;
    smokingStatus: 'never' | 'former' | 'current';
    familyHistory: string[];
    medications: string[];
    medicalConditions: string[];
}
export interface ExerciseRiskClassification {
    riskLevel: 'low' | 'moderate' | 'high' | 'very_high';
    riskScore: number;
    primaryRiskFactors: string[];
    exerciseRestrictions: string[];
    recommendedIntensity: 'light' | 'moderate' | 'vigorous';
    medicalClearanceRequired: boolean;
    supervisionRequired: boolean;
}
export interface MedicalWeightingSystem {
    cardiovascularWeight: number;
    metabolicWeight: number;
    musculoskeletalWeight: number;
    overallRiskModifier: number;
}
export declare class MedicalGuidelineWeights {
    static assessCardiovascularRisk(factors: MedicalRiskFactors): {
        riskLevel: 'low' | 'moderate' | 'high';
        riskScore: number;
        riskFactors: string[];
    };
    static assessMetabolicRisk(factors: MedicalRiskFactors): {
        riskLevel: 'low' | 'moderate' | 'high';
        riskScore: number;
        riskFactors: string[];
    };
    static assessMusculoskeletalRisk(factors: MedicalRiskFactors): {
        riskLevel: 'low' | 'moderate' | 'high';
        riskScore: number;
        riskFactors: string[];
    };
    static calculateMedicalWeights(factors: MedicalRiskFactors): {
        classification: ExerciseRiskClassification;
        weighting: MedicalWeightingSystem;
        recommendations: string[];
    };
    static assessSwimmingSpecificRisks(factors: MedicalRiskFactors): {
        swimmingRestrictions: string[];
        swimmingBenefits: string[];
        specialConsiderations: string[];
    };
}
//# sourceMappingURL=MedicalGuidelineWeights.d.ts.map