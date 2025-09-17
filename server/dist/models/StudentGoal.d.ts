import mongoose, { Document } from 'mongoose';
export interface IStudentGoal extends Document {
    studentId: mongoose.Types.ObjectId;
    title: string;
    description: string;
    targetDate: Date;
    teachingMethods: mongoose.Types.ObjectId[];
    priority: 'high' | 'medium' | 'low';
    status: 'active' | 'completed' | 'paused' | 'cancelled';
    progress: number;
    milestones: Array<{
        title: string;
        description: string;
        targetDate: Date;
        completed: boolean;
        completedAt?: Date;
    }>;
    notes: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const StudentGoal: mongoose.Model<IStudentGoal, {}, {}, {}, mongoose.Document<unknown, {}, IStudentGoal> & IStudentGoal & {
    _id: mongoose.Types.ObjectId;
}, any>;
//# sourceMappingURL=StudentGoal.d.ts.map