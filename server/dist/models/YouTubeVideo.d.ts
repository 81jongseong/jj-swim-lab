import mongoose, { Document } from 'mongoose';
export interface IYouTubeVideo extends Document {
    title: string;
    description: string;
    videoId: string;
    thumbnailUrl: string;
    duration: string;
    category: string;
    level: string;
    teachingMethodId?: mongoose.Types.ObjectId;
    createdBy?: mongoose.Types.ObjectId;
    isActive: boolean;
    viewCount?: number;
    likeCount?: number;
    tags?: string[];
    createdAt: Date;
    updatedAt: Date;
}
export declare const YouTubeVideo: mongoose.Model<IYouTubeVideo, {}, {}, {}, mongoose.Document<unknown, {}, IYouTubeVideo> & IYouTubeVideo & {
    _id: mongoose.Types.ObjectId;
}, any>;
//# sourceMappingURL=YouTubeVideo.d.ts.map