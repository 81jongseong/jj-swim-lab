export interface PostureAnalysisResult {
    technique: string;
    score: number;
    strengths: string[];
    improvements: string[];
    detailedFeedback: string;
    completionRate: number;
}
export interface ProgressPredictionResult {
    currentLevel: string;
    predictedNextLevel: string;
    estimatedWeeks: number;
    confidence: number;
    factors: string[];
    referenceEvaluationId?: string | null;
    focusCategories?: string[];
}
export interface PersonalizedRecommendationResult {
    recommendedExercises: string[];
    focusAreas: string[];
    difficultyAdjustment: 'easier' | 'same' | 'harder';
    estimatedImprovement: string;
}
export interface PerformanceAnalysisResult {
    overallScore: number;
    improvementRate: number;
    consistencyScore: number;
    recommendations: string[];
}
export declare class AIEngine {
    static analyzePosture(studentId: string, technique: string, checklistData: any[]): Promise<PostureAnalysisResult>;
    static predictProgress(studentId: string, instructorId: string): Promise<ProgressPredictionResult>;
    static generatePersonalizedRecommendation(studentId: string, instructorId: string, options?: {
        persist?: boolean;
    }): Promise<PersonalizedRecommendationResult>;
    static analyzePerformance(studentId: string, instructorId: string, options?: {
        persist?: boolean;
    }): Promise<PerformanceAnalysisResult>;
    private static generateDetailedFeedback;
    private static analyzeProgressPattern;
    private static determineCurrentLevel;
    private static predictNextLevel;
    private static estimateWeeksToNextLevel;
    private static calculateConfidence;
    private static identifyProgressFactors;
    private static identifyWeaknesses;
    private static identifyStrengths;
    private static generateExerciseRecommendations;
    private static determineFocusAreas;
    private static suggestDifficultyAdjustment;
    private static estimateImprovement;
    private static calculateOverallScore;
    private static calculateImprovementRate;
    private static calculateConsistencyScore;
    private static generatePerformanceRecommendations;
    private static calculateTrend;
    private static calculateConsistency;
}
//# sourceMappingURL=AIEngine.d.ts.map