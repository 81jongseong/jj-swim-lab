import mongoose, { Document } from 'mongoose';
export interface IQuiz extends Document {
    title: string;
    description: string;
    category: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    type: 'multiple-choice' | 'essay';
    questions: Array<{
        question: string;
        type: 'multiple-choice' | 'essay';
        options?: string[];
        correctAnswer: string | string[];
        explanation?: string;
        points: number;
    }>;
    timeLimit?: number;
    passingScore: number;
    maxAttempts: number;
    isActive: boolean;
    createdBy: mongoose.Types.ObjectId;
    assignedTo?: mongoose.Types.ObjectId[];
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IQuiz, {}, {}, {}, mongoose.Document<unknown, {}, IQuiz, {}, {}> & IQuiz & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Quiz.d.ts.map