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
export interface IHealthField {
    id: string;
    name: string;
    type: 'number' | 'string' | 'select' | 'boolean' | 'date';
    unit?: string;
    required: boolean;
    category: 'basic' | 'vital' | 'medical' | 'fitness' | 'custom';
    description?: string;
    isActive: boolean;
    displayOrder: number;
}
export interface INormalRange {
    fieldId: string;
    ageGroups: Array<{
        minAge: number;
        maxAge: number;
        gender: 'male' | 'female' | 'all';
        normalRange: {
            min?: number;
            max?: number;
            recommended?: string[];
        };
        riskLevels: Array<{
            level: 'low' | 'normal' | 'high' | 'critical';
            range: {
                min?: number;
                max?: number;
            };
            description: string;
            recommendations: string[];
        }>;
    }>;
}
export interface IExerciseRule {
    id: string;
    name: string;
    conditions: Array<{
        fieldId: string;
        operator: 'eq' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'between';
        value: any;
    }>;
    recommendations: Array<{
        type: 'swimming' | 'fitness' | 'cardio' | 'strength' | 'flexibility';
        exercise: string;
        duration: number;
        frequency: number;
        intensity: 'low' | 'moderate' | 'high';
        description: string;
        precautions?: string[];
    }>;
    priority: number;
    isActive: boolean;
}
export interface IAIConfig {
    modelVersion: string;
    parameters: {
        learningRate: number;
        confidence: number;
        accuracy: number;
        maxRecommendations: number;
        updateFrequency: number;
    };
    features: {
        personalizedRecommendations: boolean;
        riskAssessment: boolean;
        progressTracking: boolean;
        goalSetting: boolean;
        socialComparison: boolean;
    };
    thresholds: {
        riskAlert: number;
        progressAlert: number;
        goalAchievement: number;
    };
    lastUpdated: Date;
    lastTrainedAt: Date;
}
export interface IHealthConfig extends Document {
    version: string;
    healthFields: IHealthField[];
    normalRanges: INormalRange[];
    exerciseRules: IExerciseRule[];
    aiConfig: IAIConfig;
    privacySettings: {
        defaultVisibility: 'public' | 'center' | 'instructor' | 'private';
        allowUserControl: boolean;
        dataRetentionDays: number;
        anonymizeAfterDays: number;
    };
    permissions: {
        superAdmin: string[];
        centerAdmin: string[];
        instructor: string[];
        student: string[];
    };
    isActive: boolean;
    createdBy: mongoose.Types.ObjectId;
    updatedBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export declare const HealthConfig: mongoose.Model<IHealthConfig, {}, {}, {}, mongoose.Document<unknown, {}, IHealthConfig> & IHealthConfig & {
    _id: mongoose.Types.ObjectId;
}, any>;
//# sourceMappingURL=HealthConfig.d.ts.map