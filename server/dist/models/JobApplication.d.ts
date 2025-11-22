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