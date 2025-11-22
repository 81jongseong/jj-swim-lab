import mongoose, { Document } from 'mongoose';
export interface ITeachingMethod extends Document {
    name: string;
    description: string;
    category: string;
    level: string;
    steps: string[];
    tips: string[];
    checklist: string[];
    videoUrl?: string;
    imageUrl?: string;
    createdBy?: mongoose.Types.ObjectId;
    createdByRole?: string;
    isActive: boolean;
    order?: number;
    instructorComments?: string;
    overridesSuperAdminMethod?: boolean;
    originalSuperAdminMethodId?: mongoose.Types.ObjectId;
    levelChangeHistory?: Array<{
        fromLevel: string;
        toLevel: string;
        changedBy: mongoose.Types.ObjectId;
        changedAt: Date;
        reason?: string;
    }>;
    createdAt: Date;
    updatedAt: Date;
}
export declare const TeachingMethod: mongoose.Model<ITeachingMethod, {}, {}, {}, mongoose.Document<unknown, {}, ITeachingMethod> & ITeachingMethod & {
    _id: mongoose.Types.ObjectId;
}, any>;
//# sourceMappingURL=TeachingMethod.d.ts.map