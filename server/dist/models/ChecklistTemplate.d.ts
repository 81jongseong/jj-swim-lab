/// <reference types="mongoose/types/aggregate" />
/// <reference types="mongoose/types/callback" />
/// <reference types="mongoose/types/collection" />
/// <reference types="mongoose/types/connection" />
/// <reference types="mongoose/types/cursor" />
/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/error" />
/// <reference types="mongoose/types/expressions" />
/// <reference types="mongoose/types/helpers" />
/// <reference types="mongoose/types/middlewares" />
/// <reference types="mongoose/types/indexes" />
/// <reference types="mongoose/types/models" />
/// <reference types="mongoose/types/mongooseoptions" />
/// <reference types="mongoose/types/pipelinestage" />
/// <reference types="mongoose/types/populate" />
/// <reference types="mongoose/types/query" />
/// <reference types="mongoose/types/schemaoptions" />
/// <reference types="mongoose/types/schematypes" />
/// <reference types="mongoose/types/session" />
/// <reference types="mongoose/types/types" />
/// <reference types="mongoose/types/utility" />
/// <reference types="mongoose/types/validation" />
/// <reference types="mongoose/types/virtuals" />
/// <reference types="mongoose/types/inferschematype" />
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