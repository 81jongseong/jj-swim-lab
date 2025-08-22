import mongoose, { Document } from 'mongoose';
export interface INotice extends Document {
    title: string;
    content: string;
    author: mongoose.Types.ObjectId;
    category: 'general' | 'course' | 'facility' | 'maintenance' | 'emergency' | 'membership' | 'quiz' | 'system';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    targetUserTypes: ('student' | 'instructor' | 'centerAdmin' | 'superAdmin')[];
    targetCenters?: mongoose.Types.ObjectId[];
    isPublished: boolean;
    publishedAt?: Date;
    expiresAt?: Date;
    attachments: {
        filename: string;
        url: string;
        size: number;
        type: string;
    }[];
    viewCount: number;
    tags: string[];
    isPinned: boolean;
    allowComments: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface INoticeView extends Document {
    noticeId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    viewedAt: Date;
}
export declare const Notice: mongoose.Model<INotice, {}, {}, {}, mongoose.Document<unknown, {}, INotice, {}, {}> & INotice & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export declare const NoticeView: mongoose.Model<INoticeView, {}, {}, {}, mongoose.Document<unknown, {}, INoticeView, {}, {}> & INoticeView & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Notice.d.ts.map