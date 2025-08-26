import mongoose, { Document } from 'mongoose';
export interface IChecklistTemplateItem {
    stepName: string;
    stepOrder: number;
    category?: string;
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    tips?: string;
    estimatedTime?: number;
    required?: boolean;
}
export interface IChecklistTemplate extends Document {
    name: string;
    description: string;
    level: 'beginner' | 'intermediate' | 'advanced';
    category: string;
    items: IChecklistTemplateItem[];
    isActive: boolean;
    createdBy: mongoose.Types.ObjectId;
    version: number;
    tags: string[];
}
export declare const ChecklistTemplate: mongoose.Model<IChecklistTemplate, {}, {}, {}, mongoose.Document<unknown, {}, IChecklistTemplate, {}, {}> & IChecklistTemplate & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=ChecklistTemplate.d.ts.map