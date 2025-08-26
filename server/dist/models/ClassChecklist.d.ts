import mongoose, { Document } from 'mongoose';
export interface IClassChecklistItem extends Document {
    stepName: string;
    stepOrder: number;
    category?: string;
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    tips?: string;
    teachingMethodId: mongoose.Types.ObjectId;
}
export interface IClassChecklist extends Document {
    classId: mongoose.Types.ObjectId;
    level: 'beginner' | 'intermediate' | 'advanced';
    items: IClassChecklistItem[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare const ClassChecklist: mongoose.Model<IClassChecklist, {}, {}, {}, mongoose.Document<unknown, {}, IClassChecklist, {}, {}> & IClassChecklist & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=ClassChecklist.d.ts.map