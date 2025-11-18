import mongoose, { Document } from 'mongoose';
export interface IClassChecklistItem extends Document {
    stepName: string;
    stepOrder: number;
    category?: string;
    difficulty?: string;
    tips?: string;
    teachingMethodId: mongoose.Types.ObjectId;
    instructorMessage?: string;
    messageUpdatedAt?: Date;
    isCompleted?: boolean;
}
export interface IClassChecklist extends Document {
    classId: string | mongoose.Types.ObjectId;
    level?: string;
    templateId?: mongoose.Types.ObjectId;
    customLevel?: string;
    items: IClassChecklistItem[];
    hiddenItems: string[];
    customItems: IClassChecklistItem[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare const ClassChecklist: mongoose.Model<IClassChecklist, {}, {}, {}, mongoose.Document<unknown, {}, IClassChecklist> & IClassChecklist & {
    _id: mongoose.Types.ObjectId;
}, any>;
//# sourceMappingURL=ClassChecklist.d.ts.map