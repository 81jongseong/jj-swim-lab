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
/// <reference types="mongoose/types/session" />
/// <reference types="mongoose/types/types" />
/// <reference types="mongoose/types/utility" />
/// <reference types="mongoose/types/validation" />
/// <reference types="mongoose/types/virtuals" />
/// <reference types="mongoose/types/schematypes" />
/// <reference types="mongoose/types/inferschematype" />
/// <reference types="mongoose/types/inferrawdoctype" />
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