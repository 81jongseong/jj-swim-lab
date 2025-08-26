import mongoose, { Document } from 'mongoose';
export interface ICenterLevel extends Document {
    centerId: mongoose.Types.ObjectId;
    name: string;
    displayName: string;
    order: number;
    color: string;
    description?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare const CenterLevel: mongoose.Model<ICenterLevel, {}, {}, {}, mongoose.Document<unknown, {}, ICenterLevel, {}, {}> & ICenterLevel & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=CenterLevel.d.ts.map