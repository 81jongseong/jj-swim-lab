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
export interface ILessonPlanTemplate extends Document {
    templateName: string;
    description: string;
    category: 'freestyle' | 'backstroke' | 'breaststroke' | 'butterfly' | 'mixed' | 'basic' | 'advanced';
    level: 'beginner' | 'intermediate' | 'advanced';
    totalDuration: number;
    totalSessions: number;
    sessionDuration: number;
    stages: Array<{
        stageNumber: number;
        stageName: string;
        duration: number;
        sessions: number;
        objectives: string[];
        teachingMethods: string[];
        assessmentCriteria: string[];
        materials: string[];
        safetyNotes: string[];
        progressRequirements: string[];
    }>;
    specialStages?: Array<{
        stageName: string;
        description: string;
        isOptional: boolean;
        duration: number;
        prerequisites: string[];
        objectives: string[];
        teachingMethods: string[];
    }>;
    isActive: boolean;
    isPublic: boolean;
    createdBy: mongoose.Types.ObjectId;
    usageCount: number;
    rating: number;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
}
export declare const LessonPlanTemplate: mongoose.Model<ILessonPlanTemplate, {}, {}, {}, mongoose.Document<unknown, {}, ILessonPlanTemplate> & ILessonPlanTemplate & {
    _id: mongoose.Types.ObjectId;
}, any>;
//# sourceMappingURL=LessonPlanTemplate.d.ts.map