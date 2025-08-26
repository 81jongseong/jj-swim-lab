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
export declare const Video: mongoose.Model<IVideo, {}, {}, {}, mongoose.Document<unknown, {}, IVideo, {}, {}> & IVideo & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default Video;
//# sourceMappingURL=Video.d.ts.map