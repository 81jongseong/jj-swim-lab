import { ExerciseRiskClassification, MedicalWeightingSystem } from './MedicalGuidelineWeights';
export interface HealthBasedExerciseInput {
    userId: string;
    healthData: any;
    currentFitnessLevel: 'beginner' | 'intermediate' | 'advanced';
    exerciseGoals: string[];
    medicalConditions?: string[];
    currentExerciseCapacity?: number;
}
export interface ExerciseRecommendation {
    exerciseType: string;
    intensity: 'low' | 'moderate' | 'high';
    duration: number;
    frequency: number;
    calorieTarget: number;
    heartRateRange: {
        min: number;
        max: number;
    };
    precautions: string[];
    modifications: string[];
}
export interface HealthRiskAssessment {
    overallRisk: 'low' | 'moderate' | 'high' | 'critical';
    riskFactors: string[];
    recommendations: string[];
    exerciseLimitations: string[];
    monitoringRequired: boolean;
}
export interface HealthBasedExerciseResult {
    exerciseRecommendation: ExerciseRecommendation;
    riskAssessment: HealthRiskAssessment;
    medicalClassification: ExerciseRiskClassification;
    medicalWeighting: MedicalWeightingSystem;
    healthWeights: {
        [key: string]: number;
    };
    adjustmentFactors: {
        [key: string]: number;
    };
    medicalRecommendations: string[];
    swimmingSpecificGuidance: {
        restrictions: string[];
        benefits: string[];
        considerations: string[];
    };
    nextReviewDate: Date;
}
export declare class HealthBasedExerciseAI {
    static calculateHealthBasedExercise(input: HealthBasedExerciseInput): Promise<{
        success: boolean;
        data?: HealthBasedExerciseResult;
        message?: string;
    }>;
    private static convertToMedicalFactors;
    private static calculateBMI;
    private static calculateHealthWeights;
    private static assessHealthRisks;
    private static calculateAdjustmentFactors;
    private static generateExerciseRecommendation;
    private static calculateNextReviewDate;
    static adjustExerciseInRealTime(userId: string, currentHeartRate: number, currentIntensity: number, exerciseRecommendation: ExerciseRecommendation): Promise<{
        adjustedIntensity: number;
        warning?: string;
        shouldStop?: boolean;
    }>;
}
//# sourceMappingURL=HealthBasedExerciseAI.d.ts.map