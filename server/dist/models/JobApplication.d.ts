import mongoose, { Document } from 'mongoose';
export interface IJobApplication extends Document {
    postId: mongoose.Types.ObjectId;
    applicantId: mongoose.Types.ObjectId;
    centerId?: mongoose.Types.ObjectId;
    status: 'applied' | 'document_passed' | 'document_failed' | 'interview_scheduled' | 'interview_passed' | 'interview_failed' | 'final_passed' | 'final_failed' | 'withdrawn';
    coverLetter?: string;
    resume?: string;
    interviewDate?: Date;
    interviewTime?: string;
    interviewLocation?: string;
    interviewNotes?: string;
    documentScore?: number;
    interviewScore?: number;
    totalScore?: number;
    evaluationNotes?: string;
    notificationSent?: boolean;
    notificationSentAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare const JobApplication: mongoose.Model<any, {}, {}, {}, any, any>;
//# sourceMappingURL=JobApplication.d.ts.map