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
export interface ICourseAction extends Document {
    courseId: mongoose.Types.ObjectId;
    centerId: mongoose.Types.ObjectId;
    actionType: 'activate' | 'deactivate' | 'suspend' | 'warning';
    actionBy: mongoose.Types.ObjectId;
    reason: {
        category: 'safety' | 'quality' | 'policy' | 'financial' | 'certification' | 'facility' | 'other';
        description: string;
        evidence?: string[];
    };
    warningLevel?: 1 | 2 | 3;
    improvementPeriod?: {
        startDate: Date;
        endDate: Date;
        requirements: string[];
    };
    automaticTrigger?: {
        condition: 'satisfaction_low' | 'safety_incident' | 'document_missing' | 'payment_overdue' | 'certification_expired';
        value: number | string;
        threshold: number | string;
    };
    appeal?: {
        submitted: boolean;
        submittedAt?: Date;
        submittedBy: mongoose.Types.ObjectId;
        reason: string;
        evidence?: string[];
        status: 'pending' | 'under_review' | 'approved' | 'rejected';
        reviewedAt?: Date;
        reviewedBy?: mongoose.Types.ObjectId;
        reviewResult?: string;
    };
    reactivationConditions?: {
        requirements: string[];
        deadline?: Date;
        completed: boolean;
        completedAt?: Date;
    };
    isActive: boolean;
    effectiveDate: Date;
    expiryDate?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare const CourseAction: mongoose.Model<ICourseAction, {}, {}, {}, mongoose.Document<unknown, {}, ICourseAction> & ICourseAction & {
    _id: mongoose.Types.ObjectId;
}, any>;
//# sourceMappingURL=CourseAction.d.ts.map