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
/// <reference types="mongoose/types/session" />
/// <reference types="mongoose/types/types" />
/// <reference types="mongoose/types/utility" />
/// <reference types="mongoose/types/validation" />
/// <reference types="mongoose/types/virtuals" />
/// <reference types="mongoose/types/schematypes" />
/// <reference types="mongoose/types/inferschematype" />
/// <reference types="mongoose/types/inferrawdoctype" />
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