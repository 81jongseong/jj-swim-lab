import mongoose, { Document } from 'mongoose';
export interface ILessonPlan extends Document {
    instructorId: mongoose.Types.ObjectId;
    centerId: mongoose.Types.ObjectId;
    title: string;
    description: string;
    teachingMethods: mongoose.Types.ObjectId[];
    students: mongoose.Types.ObjectId[];
    duration: number;
    date: Date;
    time: string;
    location: string;
    objectives: string[];
    materials: string[];
    notes: string;
    status: 'draft' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
    actualDuration?: number;
    attendance: Array<{
        studentId: mongoose.Types.ObjectId;
        attended: boolean;
        notes?: string;
    }>;
    feedback: Array<{
        studentId: mongoose.Types.ObjectId;
        rating: number;
        comment?: string;
    }>;
    createdAt: Date;
    updatedAt: Date;
}
export declare const LessonPlan: mongoose.Model<ILessonPlan, {}, {}, {}, mongoose.Document<unknown, {}, ILessonPlan> & ILessonPlan & {
    _id: mongoose.Types.ObjectId;
}, any>;
//# sourceMappingURL=LessonPlan.d.ts.map