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
export declare const QuizAttempt: mongoose.Model<IQuizAttempt, {}, {}, {}, mongoose.Document<unknown, {}, IQuizAttempt, {}, {}> & IQuizAttempt & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=QuizAttempt.d.ts.map