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