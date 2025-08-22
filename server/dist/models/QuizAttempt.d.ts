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
declare const _default: mongoose.Model<IQuizAttempt, {}, {}, {}, mongoose.Document<unknown, {}, IQuizAttempt, {}, {}> & IQuizAttempt & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=QuizAttempt.d.ts.map