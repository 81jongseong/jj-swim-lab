import mongoose, { Document } from 'mongoose';
export interface ITeachingMethod extends Document {
    name: string;
    description: string;
    category: string;
    level: 'beginner' | 'intermediate' | 'advanced';
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
declare const _default: mongoose.Model<ITeachingMethod, {}, {}, {}, mongoose.Document<unknown, {}, ITeachingMethod, {}, {}> & ITeachingMethod & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=TeachingMethod.d.ts.map