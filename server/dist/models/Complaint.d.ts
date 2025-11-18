import mongoose, { Document } from 'mongoose';
export interface IComplaint extends Document {
    centerId: mongoose.Types.ObjectId;
    isAnonymous: boolean;
    reporterId?: mongoose.Types.ObjectId;
    reporterName?: string;
    reporterEmail?: string;
    reporterPhone?: string;
    title: string;
    content: string;
    category: 'facility' | 'instructor' | 'service' | 'schedule' | 'payment' | 'safety' | 'other';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'pending' | 'reviewing' | 'assigned' | 'in_progress' | 'resolved' | 'closed';
    assignedTo?: mongoose.Types.ObjectId;
    assignedToName?: string;
    assignedAt?: Date;
    progressNotes: Array<{
        content: string;
        createdBy: mongoose.Types.ObjectId;
        createdByName: string;
        createdAt: Date;
        status: 'pending' | 'reviewing' | 'assigned' | 'in_progress' | 'resolved' | 'closed';
    }>;
    checklist: Array<{
        task: string;
        isCompleted: boolean;
        completedBy?: mongoose.Types.ObjectId;
        completedByName?: string;
        completedAt?: Date;
    }>;
    resolution?: string;
    resolvedAt?: Date;
    resolvedBy?: mongoose.Types.ObjectId;
    resolvedByName?: string;
    satisfactionRating?: 1 | 2 | 3 | 4 | 5;
    satisfactionComment?: string;
    attachments?: Array<{
        fileName: string;
        fileUrl: string;
        fileType: string;
        uploadedAt: Date;
    }>;
    createdAt: Date;
    updatedAt: Date;
    closedAt?: Date;
}
export declare const Complaint: mongoose.Model<IComplaint, {}, {}, {}, mongoose.Document<unknown, {}, IComplaint> & IComplaint & {
    _id: mongoose.Types.ObjectId;
}, any>;
//# sourceMappingURL=Complaint.d.ts.map