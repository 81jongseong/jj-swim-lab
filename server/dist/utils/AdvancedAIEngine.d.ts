export interface ComprehensiveEvaluationInput {
    studentId: string;
    instructorId: string;
    technique: string;
    level: string;
    performanceMetrics: {
        speed?: number;
        endurance?: number;
        strokeCount?: number;
        heartRate?: number;
        distance?: number;
    };
    instructorObservations: {
        posture: number;
        breathing: number;
        movement: number;
        efficiency: number;
    };
}
export interface IAIEvaluationResult {
    overallScore: number;
    categoryScores: {
        posture: number;
        breathing: number;
        movement: number;
        efficiency: number;
    };
    levelAssessment: string;
    strengths: string[];
    weaknesses: string[];
    improvementAreas: string[];
    recommendations: {
        exercises: {
            name: string;
            priority: 'high' | 'medium' | 'low';
            reason: string;
            duration: number;
        }[];
        workoutPlan: {
            name: string;
            description: string;
            duration: number;
            frequency: number | string;
        };
        nextEvaluationDate: Date;
    };
    feedback: {
        summary: string;
        detailedFeedback: string;
        encouragement: string;
        goals: string[];
    };
    historicalContext?: {
        averageProgress: number;
        sessionsAnalyzed: number;
        latestChecklistDate: Date | null;
    };
}
export declare class AdvancedAIEngine {
    static performComprehensiveEvaluation(input: ComprehensiveEvaluationInput): Promise<{
        success: boolean;
        data: IAIEvaluationResult | null;
        message?: string;
    }>;
    private static analyzePerformanceMetrics;
    private static analyzeInstructorObservations;
    private static calculateOverallScore;
    private static calculateCategoryScores;
    private static assessLevel;
    private static analyzeStrengthsAndWeaknesses;
    private static generateExerciseRecommendations;
    private static generateFeedback;
    private static saveEvaluationResult;
    private static normalizeMetricScore;
    private static getCategoryKoreanName;
    private static getCategoryEnglishName;
    private static getLevelKoreanName;
    private static determinePriority;
    private static calculateNextEvaluationDate;
    private static generateEncouragement;
    private static generateGoals;
    private static getSubCategoryKoreanName;
    private static calculateHistoricalTrend;
}
//# sourceMappingURL=AdvancedAIEngine.d.ts.map