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