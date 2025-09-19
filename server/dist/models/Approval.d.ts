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
export interface IApproval extends Document {
    type: 'course_enrollment' | 'instructor_registration' | 'payment_approval' | 'schedule_change' | 'refund_request';
    userId: mongoose.Types.ObjectId;
    courseId?: mongoose.Types.ObjectId;
    instructorId?: mongoose.Types.ObjectId;
    paymentId?: mongoose.Types.ObjectId;
    title: string;
    description: string;
    status: 'pending' | 'approved' | 'rejected';
    priority: 'low' | 'medium' | 'high';
    estimatedAmount?: number;
    requestDate: Date;
    processedBy?: mongoose.Types.ObjectId;
    processedAt?: Date;
    reason?: string;
    centerId?: mongoose.Types.ObjectId;
    attachments?: string[];
    createdAt: Date;
    updatedAt: Date;
}
export declare const Approval: mongoose.Model<IApproval, {}, {}, {}, mongoose.Document<unknown, {}, IApproval> & IApproval & {
    _id: mongoose.Types.ObjectId;
}, any>;
export default Approval;
//# sourceMappingURL=Approval.d.ts.map