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
    teachingMethodId: mongoose.Types.ObjectId;
    items: IChecklistItem[];
    overallProgress: number;
    lastUpdated: Date;
    startDate: Date;
    targetCompletionDate?: Date;
    status: 'active' | 'completed' | 'paused';
    notes?: string;
}
declare const _default: mongoose.Model<IChecklist, {}, {}, {}, mongoose.Document<unknown, {}, IChecklist, {}, {}> & IChecklist & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Checklist.d.ts.map