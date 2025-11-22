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
export interface ISwimCondition extends Document {
    id: string;
    name: string;
    label?: string;
    category: string;
    group: string;
    description?: string;
    swimmingGuidance?: string;
    recommendedStrokes?: string[];
    avoidStrokes?: string[];
    recommendedMethods?: string[];
    avoidMethods?: string[];
    recommendedDrills?: string[];
    avoidDrills?: string[];
    rationale?: string;
    evidence?: Array<{
        label: string;
        url: string;
    }>;
    keywords?: string[];
    severity?: string;
    isMSK28?: boolean;
    isActive: boolean;
    order?: number;
    centerId?: mongoose.Types.ObjectId;
    createdBy?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export declare const SwimCondition: mongoose.Model<any, {}, {}, {}, any, any>;
//# sourceMappingURL=SwimCondition.d.ts.map