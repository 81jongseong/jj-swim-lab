import mongoose, { Document } from 'mongoose';
export interface IAdminReport extends Document {
    title: string;
    description: string;
    type: 'bug' | 'feature' | 'complaint' | 'suggestion';
    status: 'open' | 'in_progress' | 'resolved' | 'closed';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    reportedBy: mongoose.Types.ObjectId;
    assignedTo?: mongoose.Types.ObjectId;
    centerId?: mongoose.Types.ObjectId;
    category?: string;
    tags?: string[];
    attachments?: string[];
    resolution?: string;
    resolvedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare const AdminReport: mongoose.Model<IAdminReport, {}, {}, {}, mongoose.Document<unknown, {}, IAdminReport> & IAdminReport & {
    _id: mongoose.Types.ObjectId;
}, any>;
//# sourceMappingURL=AdminReport.d.ts.map