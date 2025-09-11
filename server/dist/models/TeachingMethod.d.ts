import mongoose, { Document } from 'mongoose';
export interface ITeachingMethod extends Document {
    name: string;
    description: string;
    category: string;
    level: string;
    steps: string[];
    tips: string[];
    videoUrl?: string;
    imageUrl?: string;
    createdBy?: mongoose.Types.ObjectId;
    isActive: boolean;
    order?: number;
    createdAt: Date;
    updatedAt: Date;
}
export declare const TeachingMethod: mongoose.Model<ITeachingMethod, {}, {}, {}, mongoose.Document<unknown, {}, ITeachingMethod> & ITeachingMethod & {
    _id: mongoose.Types.ObjectId;
}, any>;
//# sourceMappingURL=TeachingMethod.d.ts.map