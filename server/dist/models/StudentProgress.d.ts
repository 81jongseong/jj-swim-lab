import mongoose, { Document } from 'mongoose';
export interface IStudentProgressItem extends Document {
    stepName: string;
    stepOrder: number;
    isCompleted: boolean;
    completedAt?: Date;
    instructorNotes?: string;
    studentNotes?: string;
    category?: string;
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    tips?: string;
}
export interface IStudentProgress extends Document {
    studentId: mongoose.Types.ObjectId;
    classId: mongoose.Types.ObjectId;
    classChecklistId: mongoose.Types.ObjectId;
    items: IStudentProgressItem[];
    overallProgress: number;
    lastUpdated: Date;
    startDate: Date;
    targetCompletionDate?: Date;
    status: 'active' | 'completed' | 'paused';
    notes?: string;
}
export declare const StudentProgress: mongoose.Model<IStudentProgress, {}, {}, {}, mongoose.Document<unknown, {}, IStudentProgress> & IStudentProgress & {
    _id: mongoose.Types.ObjectId;
}, any>;
//# sourceMappingURL=StudentProgress.d.ts.map