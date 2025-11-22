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