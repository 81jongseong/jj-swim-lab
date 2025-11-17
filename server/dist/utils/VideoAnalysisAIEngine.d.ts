export interface VideoAnalysisResultData {
    overallScore: number;
    categoryScores: {
        posture: number;
        breathing: number;
        movement: number;
        efficiency: number;
    };
    detailedAnalysis: any;
    keyFrames: any[];
    strengths: string[];
    weaknesses: string[];
    improvementAreas: string[];
}
export interface VideoAnalysisInput {
    studentId: string;
    instructorId: string;
    videoId: string;
    technique: string;
    level: string;
    videoMetadata: {
        duration: number;
        frameRate: number;
        resolution: {
            width: number;
            height: number;
        };
        fileSize: number;
        uploadDate: Date;
    };
}
export declare class VideoAnalysisAIEngine {
    static analyzeVideo(input: VideoAnalysisInput): Promise<{
        success: boolean;
        data?: VideoAnalysisResultData;
        message?: string;
    }>;
    private static getAnalysisCriteria;
    private static analyzeVideoFrames;
    private static analyzePosture;
    private static analyzeBreathing;
    private static analyzeMovement;
    private static analyzeEfficiency;
    private static calculateOverallScore;
    private static identifyStrengths;
    private static identifyWeaknesses;
    private static extractKeyFrames;
    private static buildFeedback;
    private static buildRecommendations;
    private static persistAnalysisResult;
    private static generateSimulatedBodyLandmarks;
    private static generateSimulatedPoseData;
    private static generateSimulatedMovementData;
}
//# sourceMappingURL=VideoAnalysisAIEngine.d.ts.map