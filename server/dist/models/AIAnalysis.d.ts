import mongoose, { Document } from 'mongoose';
export interface IAIAnalysis extends Document {
    studentId: mongoose.Types.ObjectId;
    instructorId: mongoose.Types.ObjectId;
    analysisType: 'posture' | 'progress' | 'recommendation' | 'performance';
    postureAnalysis?: {
        technique: string;
        score: number;
        strengths: string[];
        improvements: string[];
        detailedFeedback: string;
    };
    progressPrediction?: {
        currentLevel: string;
        predictedNextLevel: string;
        estimatedWeeks: number;
        confidence: number;
        factors: string[];
    };
    personalizedRecommendation?: {
        recommendedExercises: string[];
        focusAreas: string[];
        difficultyAdjustment: 'easier' | 'same' | 'harder';
        estimatedImprovement: string;
    };
    performanceAnalysis?: {
        overallScore: number;
        improvementRate: number;
        consistencyScore: number;
        recommendations: string[];
    };
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
}
export declare const AIAnalysis: mongoose.Model<IAIAnalysis, {}, {}, {}, mongoose.Document<unknown, {}, IAIAnalysis> & IAIAnalysis & {
    _id: mongoose.Types.ObjectId;
}, any>;
//# sourceMappingURL=AIAnalysis.d.ts.map