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
export interface IVideo extends Document {
    owner?: mongoose.Types.ObjectId;
    filename: string;
    originalName: string;
    mimetype: string;
    size: number;
    path: string;
    status: 'pending' | 'reviewed';
    analysisResult?: any;
    feedback?: string;
    reviewedBy?: mongoose.Types.ObjectId;
    reviewedAt?: Date;
    visibility?: 'private' | 'center' | 'public';
    reviews?: {
        reviewedBy: mongoose.Types.ObjectId;
        feedback?: string;
        analysisResult?: any;
        visibility?: 'private' | 'center' | 'public';
        reviewedAt: Date;
    }[];
    createdAt: Date;
    updatedAt: Date;
}
export declare const Video: mongoose.Model<IVideo, {}, {}, {}, mongoose.Document<unknown, {}, IVideo> & IVideo & {
    _id: mongoose.Types.ObjectId;
}, any>;
export default Video;
//# sourceMappingURL=Video.d.ts.map