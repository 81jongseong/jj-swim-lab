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
export interface IVideoProcessingJob extends Document {
    videoId: string;
    originalVideoPath: string;
    outputDir: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress?: number;
    error?: string;
    createdAt: Date;
    updatedAt: Date;
    completedAt?: Date;
    motionDataPath?: string;
    glbPath?: string;
    fbxPath?: string;
    previewImagePath?: string;
    originalFileName?: string;
    videoDuration?: number;
    frameCount?: number;
    resolution?: {
        width: number;
        height: number;
    };
}
export declare const VideoProcessingJob: mongoose.Model<IVideoProcessingJob, {}, {}, {}, mongoose.Document<unknown, {}, IVideoProcessingJob> & IVideoProcessingJob & {
    _id: mongoose.Types.ObjectId;
}, any>;
//# sourceMappingURL=VideoProcessingJob.d.ts.map