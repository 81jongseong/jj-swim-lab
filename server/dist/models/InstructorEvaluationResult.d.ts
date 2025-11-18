import mongoose, { Document } from 'mongoose';
export interface IEvaluationScore {
    score: number;
    comment?: string;
    evidence?: string[];
}
export interface IEvaluatorAssessment {
    evaluatorId: mongoose.Types.ObjectId;
    evaluatorType: 'student' | 'peer' | 'management' | 'self';
    evaluatedAt: Date;
    scores: {
        studentFeedback: IEvaluationScore;
        teachingSkill: IEvaluationScore;
        communication: IEvaluationScore;
        punctuality: IEvaluationScore;
        improvement: IEvaluationScore;
        safety: IEvaluationScore;
        professionalism?: IEvaluationScore;
    };
    overallComment?: string;
    recommendations?: string[];
    strengths?: string[];
    improvements?: string[];
    isAnonymous: boolean;
}
export interface IInstructorEvaluationResult extends Document {
    instructorId: mongoose.Types.ObjectId;
    centerId: mongoose.Types.ObjectId;
    criteriaId: mongoose.Types.ObjectId;
    evaluationPeriod: {
        startDate: Date;
        endDate: Date;
        quarter?: string;
        year: number;
    };
    assessments: IEvaluatorAssessment[];
    calculatedResults: {
        averageScores: {
            studentFeedback: number;
            teachingSkill: number;
            communication: number;
            punctuality: number;
            improvement: number;
            safety: number;
            professionalism?: number;
        };
        weightedScores: {
            studentFeedback: number;
            teachingSkill: number;
            communication: number;
            punctuality: number;
            improvement: number;
            safety: number;
            professionalism?: number;
        };
        totalScore: number;
        grade: 'S' | 'A' | 'B' | 'C' | 'D';
        averageByEvaluatorType: {
            student?: number;
            peer?: number;
            management?: number;
            self?: number;
        };
    };
    statistics: {
        totalEvaluators: number;
        completionRate: number;
        responseRate: {
            students: {
                responded: number;
                total: number;
                rate: number;
            };
            peers: {
                responded: number;
                total: number;
                rate: number;
            };
            management: {
                responded: number;
                total: number;
                rate: number;
            };
        };
    };
    analysis: {
        strengths: string[];
        improvements: string[];
        trends: string[];
        recommendations: string[];
    };
    status: 'draft' | 'in_progress' | 'completed' | 'reviewed' | 'archived';
    reviewInfo?: {
        reviewedBy: mongoose.Types.ObjectId;
        reviewedAt: Date;
        reviewComments: string;
        approved: boolean;
    };
    visibility: {
        toInstructor: boolean;
        toStudents: boolean;
        toPeers: boolean;
        toManagement: boolean;
    };
    createdBy: mongoose.Types.ObjectId;
    updatedBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export declare const InstructorEvaluationResult: mongoose.Model<IInstructorEvaluationResult, {}, {}, {}, mongoose.Document<unknown, {}, IInstructorEvaluationResult> & IInstructorEvaluationResult & {
    _id: mongoose.Types.ObjectId;
}, any>;
export default InstructorEvaluationResult;
//# sourceMappingURL=InstructorEvaluationResult.d.ts.map