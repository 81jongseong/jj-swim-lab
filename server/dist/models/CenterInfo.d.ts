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
export interface ICenterInfo extends Document {
    centerId: string;
    name: string;
    shortDescription: string;
    description: string;
    address: string;
    phone: string;
    email: string;
    website?: string;
    businessHours: {
        monday: string;
        tuesday: string;
        wednesday: string;
        thursday: string;
        friday: string;
        saturday: string;
        sunday: string;
    };
    facilities: string[];
    features: string[];
    images: {
        mainImage?: string;
        gallery: string[];
    };
    instructors: Array<{
        name: string;
        specialty: string;
        experience: string;
        image?: string;
    }>;
    courses: Array<{
        name: string;
        description: string;
        level: string;
        duration: string;
        price: string;
    }>;
    createdAt: Date;
    updatedAt: Date;
}
export declare const CenterInfo: mongoose.Model<ICenterInfo, {}, {}, {}, mongoose.Document<unknown, {}, ICenterInfo> & ICenterInfo & {
    _id: mongoose.Types.ObjectId;
}, any>;
//# sourceMappingURL=CenterInfo.d.ts.map