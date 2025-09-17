import mongoose, { Document } from 'mongoose';
export interface IReview extends Document {
    studentName: string;
    instructorName: string;
    courseName: string;
    rating: number;
    comment: string;
    status: 'approved' | 'pending' | 'rejected';
    date: Date;
    centerId: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Review: mongoose.Model<IReview, {}, {}, {}, mongoose.Document<unknown, {}, IReview> & IReview & {
    _id: mongoose.Types.ObjectId;
}, any>;
//# sourceMappingURL=Review.d.ts.map