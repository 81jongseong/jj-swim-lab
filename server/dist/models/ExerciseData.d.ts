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
import mongoose from 'mongoose';
interface IExerciseData extends mongoose.Document {
    userId: mongoose.Types.ObjectId;
    sessionId: string;
    exerciseType: 'swimming' | 'pose_analysis' | 'intensity_training' | 'general_workout';
    startTime: Date;
    endTime?: Date;
    duration: number;
    intensityData: {
        averageIntensity: number;
        maxIntensity: number;
        intensityHistory: Array<{
            timestamp: Date;
            intensity: number;
            heartRate?: number;
            movementSpeed: number;
            calories: number;
        }>;
        totalCalories: number;
        averageHeartRate: number;
        maxHeartRate: number;
    };
    poseAnalysis?: {
        overallScore: number;
        poseType: string;
        quality: 'Poor' | 'Needs Improvement' | 'Fair' | 'Good' | 'Excellent';
        detailedAnalysis: {
            shoulderAlignment: number;
            hipAlignment: number;
            legPosition: number;
            armMovement: number;
            breathingPattern: number;
        };
        corrections: string[];
        improvements: string[];
        landmarks: Array<{
            timestamp: Date;
            landmarks: Array<{
                x: number;
                y: number;
                z: number;
                visibility: number;
            }>;
        }>;
    };
    swimmingData?: {
        stroke: 'freestyle' | 'butterfly' | 'breaststroke' | 'backstroke' | 'mixed';
        distance: number;
        laps: number;
        strokeCount: number;
        strokeRate: number;
        efficiency: number;
        techniqueScore: number;
        breathingPattern: string;
        turnEfficiency: number;
    };
    performanceMetrics: {
        goalAchievement: number;
        improvement: number;
        consistency: number;
        effort: number;
    };
    aiRecommendations: {
        nextWorkout: string;
        focusAreas: string[];
        restDays: number;
        intensityAdjustment: string;
        techniqueImprovements: string[];
        nutritionTips: string[];
    };
    notes?: string;
    tags?: string[];
    weather?: string;
    temperature?: number;
    humidity?: number;
    createdAt: Date;
    updatedAt: Date;
}
export declare const ExerciseData: mongoose.Model<IExerciseData, {}, {}, {}, mongoose.Document<unknown, {}, IExerciseData> & IExerciseData & {
    _id: mongoose.Types.ObjectId;
}, any>;
export {};
//# sourceMappingURL=ExerciseData.d.ts.map