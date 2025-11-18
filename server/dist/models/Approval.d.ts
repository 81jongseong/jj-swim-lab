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