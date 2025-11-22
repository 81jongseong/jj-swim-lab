import mongoose, { Document } from 'mongoose';
export interface ICenterLevel extends Document {
    centerId: string;
    levels: {
        name: string;
        order: number;
        description?: string;
        color?: string;
    }[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare const CenterLevel: mongoose.Model<ICenterLevel, {}, {}, {}, mongoose.Document<unknown, {}, ICenterLevel> & ICenterLevel & {
    _id: mongoose.Types.ObjectId;
}, any>;
//# sourceMappingURL=CenterLevel.d.ts.map