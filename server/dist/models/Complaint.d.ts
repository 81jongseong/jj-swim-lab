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