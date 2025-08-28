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
/// <reference types="mongoose/types/session" />
/// <reference types="mongoose/types/types" />
/// <reference types="mongoose/types/utility" />
/// <reference types="mongoose/types/validation" />
/// <reference types="mongoose/types/virtuals" />
/// <reference types="mongoose/types/schematypes" />
/// <reference types="mongoose/types/inferschematype" />
/// <reference types="mongoose/types/inferrawdoctype" />
import mongoose, { Document } from 'mongoose';
export interface IChecklistItem extends Document {
    teachingMethodId: mongoose.Types.ObjectId;
    stepName: string;
    stepOrder: number;
    isCompleted: boolean;
    completedAt?: Date;
    category?: string;
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    tips?: string;
    notes?: string;
    instructorNotes?: string;
}
export interface IChecklist extends Document {
    studentId: mongoose.Types.ObjectId;
    courseId: mongoose.Types.ObjectId;
    instructorId: mongoose.Types.ObjectId;
    items: IChecklistItem[];
    overallProgress: number;
    lastUpdated: Date;
    startDate: Date;
    targetCompletionDate?: Date;
    status: 'active' | 'completed' | 'paused';
    notes?: string;
}
export declare const Checklist: mongoose.Model<IChecklist, {}, {}, {}, mongoose.Document<unknown, {}, IChecklist, {}, {}> & IChecklist & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Checklist.d.ts.map