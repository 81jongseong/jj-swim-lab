import mongoose, { Document } from 'mongoose';
export interface IQuizAttempt extends Document {
    quizId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    answers: Array<{
        questionIndex: number;
        selectedAnswer: string | number;
        isCorrect: boolean;
        pointsEarned: number;
        timeSpent: number;
    }>;
    totalScore: number;
    maxPossibleScore: number;
    percentage: number;
    passed: boolean;
    timeSpent: number;
    completedAt: Date;
    startedAt: Date;
}
export declare const QuizAttempt: mongoose.Model<IQuizAttempt, {}, {}, {}, mongoose.Document<unknown, {}, IQuizAttempt> & IQuizAttempt & {
    _id: mongoose.Types.ObjectId;
}, any>;
//# sourceMappingURL=QuizAttempt.d.ts.map