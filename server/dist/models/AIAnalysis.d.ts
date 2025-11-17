/// <reference types="mongoose/types/aggregate" />
/// <reference types="mongoose/types/callback" />
/// <reference types="mongoose/types/collection" />
/// <reference types="mongoose/types/connection" />
/// <reference types="mongoose/types/cursor" />
/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/error" />
/// <reference types="mongoose/types/expressions" />
/// <reference types="mongoose/types/helpers" />
/// <reference types="mongoose/types/middlewares" />
/// <reference types="mongoose/types/indexes" />
/// <reference types="mongoose/types/models" />
/// <reference types="mongoose/types/mongooseoptions" />
/// <reference types="mongoose/types/pipelinestage" />
/// <reference types="mongoose/types/populate" />
/// <reference types="mongoose/types/query" />
/// <reference types="mongoose/types/schemaoptions" />
/// <reference types="mongoose/types/schematypes" />
/// <reference types="mongoose/types/session" />
/// <reference types="mongoose/types/types" />
/// <reference types="mongoose/types/utility" />
/// <reference types="mongoose/types/validation" />
/// <reference types="mongoose/types/virtuals" />
/// <reference types="mongoose/types/inferschematype" />
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
        completionRate?: number;
    };
    progressPrediction?: {
        currentLevel: string;
        predictedNextLevel: string;
        estimatedWeeks: number;
        confidence: number;
        factors: string[];
        referenceEvaluationId?: mongoose.Types.ObjectId | null;
        focusCategories?: string[];
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