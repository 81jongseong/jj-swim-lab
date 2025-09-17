import mongoose, { Document } from 'mongoose';
export interface IRecommendation extends Document {
    studentId: mongoose.Types.ObjectId;
    type: 'next_lesson' | 'review' | 'challenge' | 'foundation';
    title: string;
    description: string;
    teachingMethodId: mongoose.Types.ObjectId;
    reason: string;
    priority: 'high' | 'medium' | 'low';
    estimatedTime: number;
    difficulty: 'easy' | 'medium' | 'hard';
    status: 'active' | 'completed' | 'dismissed' | 'expired';
    completedAt?: Date;
    dismissedAt?: Date;
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Recommendation: mongoose.Model<IRecommendation, {}, {}, {}, mongoose.Document<unknown, {}, IRecommendation> & IRecommendation & {
    _id: mongoose.Types.ObjectId;
}, any>;
//# sourceMappingURL=Recommendation.d.ts.map