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
export interface IEvaluationCriterion {
    name: string;
    description: string;
    weight: number;
    maxScore: number;
    guidelines: {
        excellent: string;
        good: string;
        average: string;
        poor: string;
    };
}
export interface IGradeThreshold {
    grade: 'S' | 'A' | 'B' | 'C' | 'D';
    minScore: number;
    maxScore: number;
    description: string;
    color: string;
    benefits?: string[];
}
export interface IInstructorEvaluationCriteria extends Document {
    centerId?: mongoose.Types.ObjectId;
    title: string;
    description: string;
    version: string;
    isActive: boolean;
    criteria: {
        studentFeedback: IEvaluationCriterion;
        teachingSkill: IEvaluationCriterion;
        communication: IEvaluationCriterion;
        punctuality: IEvaluationCriterion;
        improvement: IEvaluationCriterion;
        safety: IEvaluationCriterion;
        professionalism: IEvaluationCriterion;
    };
    gradeThresholds: IGradeThreshold[];
    evaluationCycle: {
        frequency: 'monthly' | 'quarterly' | 'biannual' | 'annual';
        duration: number;
        reminderDays: number;
    };
    evaluators: {
        students: boolean;
        peers: boolean;
        management: boolean;
        selfEvaluation: boolean;
    };
    guidelines: {
        general: string;
        forEvaluators: string;
        forInstructors: string;
        scoringRules: string[];
    };
    createdBy: mongoose.Types.ObjectId;
    updatedBy: mongoose.Types.ObjectId;
    effectiveDate: Date;
    expiryDate?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare const InstructorEvaluationCriteria: mongoose.Model<IInstructorEvaluationCriteria, {}, {}, {}, mongoose.Document<unknown, {}, IInstructorEvaluationCriteria> & IInstructorEvaluationCriteria & {
    _id: mongoose.Types.ObjectId;
}, any>;
export default InstructorEvaluationCriteria;
//# sourceMappingURL=InstructorEvaluationCriteria.d.ts.map