import mongoose, { Document } from 'mongoose';
export interface IReport extends Document {
    period: string;
    totalStudents: number;
    totalRevenue: number;
    totalClasses: number;
    averageRating: number;
    newStudents: number;
    retentionRate: number;
    centerId: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Report: mongoose.Model<IReport, {}, {}, {}, mongoose.Document<unknown, {}, IReport> & IReport & {
    _id: mongoose.Types.ObjectId;
}, any>;
//# sourceMappingURL=Report.d.ts.map