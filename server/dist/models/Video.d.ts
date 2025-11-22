import mongoose, { Document } from 'mongoose';
export interface IVideo extends Document {
    owner?: mongoose.Types.ObjectId;
    ownerCenterId?: mongoose.Types.ObjectId;
    youtubeUrl: string;
    title?: string;
    description?: string;
    visibility: {
        myCenterInstructors: boolean;
        allInstructors: boolean;
        myCenterMembers: boolean;
        allMembers: boolean;
    };
    analysisRequest: {
        type: 'public' | 'center' | 'specific';
        requestedInstructors?: mongoose.Types.ObjectId[];
        analysisFee?: number;
        paymentId?: mongoose.Types.ObjectId;
        paymentStatus?: 'pending' | 'completed' | 'failed';
    };
    feedbacks: {
        reviewer: mongoose.Types.ObjectId;
        reviewerType: 'instructor' | 'member';
        reviewerCenterId?: mongoose.Types.ObjectId;
        content: string;
        rating?: number;
        createdAt: Date;
    }[];
    status?: 'pending' | 'reviewed';
    analysisResult?: any;
    feedback?: string;
    reviewedBy?: mongoose.Types.ObjectId;
    reviewedAt?: Date;
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