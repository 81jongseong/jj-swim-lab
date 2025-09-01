export interface IntegratedAnalysisInput {
    studentId: string;
    technique: string;
    smartWatchData?: any;
    videoAnalysisData?: any;
    instructorObservations: {
        posture: number;
        breathing: number;
        movement: number;
        efficiency: number;
    };
    manualMetrics?: {
        speed?: number;
        endurance?: number;
        strokeCount?: number;
        heartRate?: number;
        distance?: number;
    };
}
export interface IntegratedAnalysisResult {
    overallScore: number;
    dataSources: {
        smartWatch: {
            available: boolean;
            score: number;
            confidence: number;
        };
        videoAnalysis: {
            available: boolean;
            score: number;
            confidence: number;
        };
        instructorObservation: {
            score: number;
            confidence: number;
        };
    };
    categoryScores: {
        posture: number;
        breathing: number;
        movement: number;
        efficiency: number;
    };
    detailedAnalysis: {
        smartWatchInsights: any;
        videoAnalysisInsights: any;
        instructorInsights: any;
    };
    recommendations: {
        immediate: string[];
        shortTerm: string[];
        longTerm: string[];
    };
    exercisePlan: any;
    progressPrediction: any;
}
export declare class IntegratedAIEngine {
    static performIntegratedAnalysis(input: IntegratedAnalysisInput): Promise<IntegratedAnalysisResult>;
    private static analyzeSmartWatchData;
    private static analyzeVideoData;
    private static analyzeInstructorObservations;
    private static calculateDataSourceWeights;
    private static calculateOverallScore;
    private static calculateCategoryScores;
    private static generateDetailedAnalysis;
    private static generateRecommendations;
    private static generateExercisePlan;
    private static predictProgress;
    private static analyzeHeartRateData;
    private static analyzeStrokeData;
    private static analyzeEfficiencyData;
    private static analyzePostureFromVideo;
    private static analyzeMovementFromVideo;
    private static analyzeTimingFromVideo;
    private static getTechniqueSpecificExercises;
}
//# sourceMappingURL=IntegratedAIEngine.d.ts.map