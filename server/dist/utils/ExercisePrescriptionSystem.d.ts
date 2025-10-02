export interface HealthGrade {
    obesityGrade: 'normal' | 'overweight' | 'obesity1' | 'obesity2' | 'obesity3';
    cardiovascularGrade: 'low' | 'moderate' | 'high' | 'very_high';
    fitnessGrade: 'beginner' | 'intermediate' | 'advanced';
    ageGrade: 'young' | 'middle' | 'senior';
    metabolicGrade: 'normal' | 'prediabetes' | 'diabetes' | 'metabolic_syndrome';
    musculoskeletalGrade: 'normal' | 'mild_risk' | 'moderate_risk' | 'high_risk';
    respiratoryGrade: 'normal' | 'mild_impairment' | 'moderate_impairment' | 'severe_impairment';
    neurologicalGrade: 'normal' | 'mild_concern' | 'moderate_concern' | 'high_concern';
    lifestyleGrade: 'excellent' | 'good' | 'fair' | 'poor';
    stressGrade: 'low' | 'moderate' | 'high' | 'very_high';
    sleepGrade: 'excellent' | 'good' | 'fair' | 'poor';
    exerciseHistory: 'none' | 'beginner' | 'intermediate' | 'advanced' | 'elite';
    injuryHistory: 'none' | 'minor' | 'moderate' | 'major';
    flexibilityGrade: 'excellent' | 'good' | 'fair' | 'poor';
    overallGrade: 'A' | 'B' | 'C' | 'D' | 'E';
}
export type IntensityCalculationMethod = 'karvonen' | 'max_hr_percentage' | 'vo2_max_percentage' | 'rpe_based' | 'hybrid' | 'ai_adaptive';
export interface ExerciseIntensity {
    targetHeartRate: {
        min: number;
        max: number;
        optimal: number;
        method: IntensityCalculationMethod;
    };
    perceivedExertion: {
        scale: number;
        description: string;
        borgScale?: number;
    };
    swimmingPace: {
        metersPerMinute: number;
        strokeRate: number;
        strokeEfficiency: number;
    };
    vo2Intensity?: {
        percentage: number;
        estimatedVO2Max: number;
        targetVO2: number;
    };
    compositeIntensity: {
        score: number;
        factors: string[];
        confidence: number;
    };
}
export interface ExercisePrescription {
    sessionDuration: number;
    totalDistance: number;
    targetHeartRate: ExerciseIntensity['targetHeartRate'];
    recommendedExercises: {
        warmUp: {
            duration: number;
            intensity: string;
        };
        mainExercise: {
            duration: number;
            intensity: string;
            sets?: number;
        };
        coolDown: {
            duration: number;
            intensity: string;
        };
    };
    weeklyFrequency: number;
    progressionPlan: {
        currentWeek: number;
        totalWeeks: number;
        weeklyIncrease: number;
    };
    safetyGuidelines: string[];
    contraindications: string[];
}
export interface ExerciseHistory {
    sessionId: string;
    userId: string;
    date: Date;
    prescribedExercise: ExercisePrescription;
    actualPerformance: {
        duration: number;
        distance: number;
        averageHeartRate: number;
        maxHeartRate: number;
        perceivedExertion: number;
        completionRate: number;
    };
    feedback: {
        difficulty: 'too_easy' | 'appropriate' | 'too_hard';
        fatigue: 'low' | 'moderate' | 'high';
        enjoyment: 'low' | 'moderate' | 'high';
        instructorNotes?: string;
    };
    nextAdjustment: {
        intensityChange: number;
        durationChange: number;
        reason: string;
    };
}
export interface DynamicAdjustment {
    adjustmentType: 'increase' | 'maintain' | 'decrease';
    adjustmentAmount: number;
    newPrescription: ExercisePrescription;
    reasoning: string[];
    confidence: number;
}
export declare class ExercisePrescriptionSystem {
    static classifyHealthGrade(healthData: any, user: any): HealthGrade;
    private static calculateOverallGrade;
    static calculateExerciseIntensity(restingHR: number, maxHR: number, targetIntensity: number, healthGrade: HealthGrade, method?: IntensityCalculationMethod, additionalData?: {
        vo2Max?: number;
        age?: number;
        weight?: number;
        height?: number;
        gender?: string;
        exerciseHistory?: string;
    }): ExerciseIntensity;
    static generateExercisePrescription(healthGrade: HealthGrade, healthData: any, user: any, exerciseHistory?: ExerciseHistory[]): ExercisePrescription;
    static calculateHistoryBasedAdjustment(history: ExerciseHistory[]): DynamicAdjustment;
    private static calculateBMI;
    private static estimateVO2Max;
    private static convertVO2ToHeartRate;
    private static convertRPEToHeartRate;
    private static calculateAIAdaptiveIntensity;
    private static calculateHealthScore;
    private static calculateCompositeIntensityScore;
    private static calculateConfidenceScore;
    private static calculateHealthConsistency;
    private static calculateStrokeEfficiency;
    private static getExertionDescription;
    private static calculateSwimmingPace;
    private static calculateStrokeRate;
    private static generateSafetyGuidelines;
    private static generateContraindications;
}
//# sourceMappingURL=ExercisePrescriptionSystem.d.ts.map