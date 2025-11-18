import mongoose, { Document } from 'mongoose';
export interface ILearningProgress extends Document {
    studentId: mongoose.Types.ObjectId;
    teachingMethodId: mongoose.Types.ObjectId;
    completedSteps: number[];
    totalSteps: number;
    progress: number;
    lastStudied: Date;
    notes?: string;
    rating?: number;
    studyTime: number;
    difficulty: 'easy' | 'medium' | 'hard';
    masteryLevel: 'learning' | 'practicing' | 'mastered';
    createdAt: Date;
    updatedAt: Date;
}
export declare const LearningProgress: mongoose.Model<ILearningProgress, {}, {}, {}, mongoose.Document<unknown, {}, ILearningProgress> & ILearningProgress & {
    _id: mongoose.Types.ObjectId;
}, any>;
//# sourceMappingURL=LearningProgress.d.ts.map