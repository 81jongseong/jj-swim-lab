import mongoose, { Document } from 'mongoose';
export interface IChecklistTemplateItem extends Document {
    stepName: string;
    stepOrder: number;
    category: string;
    difficulty: string;
    tips: string;
    teachingMethodId: mongoose.Types.ObjectId;
    isRequired: boolean;
    prerequisites: string[];
    healthRestrictions: string[];
    alternativeSteps: string[];
}
export interface IChecklistTemplate extends Document {
    name: string;
    creatorId: mongoose.Types.ObjectId;
    creatorType: 'center' | 'instructor';
    centerId?: mongoose.Types.ObjectId;
    levels: string[];
    items: IChecklistTemplateItem[];
    isActive: boolean;
    isPublic: boolean;
    description: string;
    tags: string[];
}
export declare const ChecklistTemplate: mongoose.Model<IChecklistTemplate, {}, {}, {}, mongoose.Document<unknown, {}, IChecklistTemplate> & IChecklistTemplate & {
    _id: mongoose.Types.ObjectId;
}, any>;
//# sourceMappingURL=ChecklistTemplate.d.ts.map