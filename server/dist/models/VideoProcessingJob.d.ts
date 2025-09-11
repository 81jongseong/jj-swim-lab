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