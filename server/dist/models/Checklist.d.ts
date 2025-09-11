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
    completedAt?: Date;
    notes?: string;
}
export declare const Checklist: mongoose.Model<IChecklist, {}, {}, {}, mongoose.Document<unknown, {}, IChecklist> & IChecklist & {
    _id: mongoose.Types.ObjectId;
}, any>;
//# sourceMappingURL=Checklist.d.ts.map