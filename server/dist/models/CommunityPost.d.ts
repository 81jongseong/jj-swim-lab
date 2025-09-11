import mongoose from 'mongoose';
export declare const CommunityPost: mongoose.Model<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    title: string;
    tags: string[];
    content: string;
    author: mongoose.Types.ObjectId;
    isPublished: boolean;
    likes: number;
    commentsCount: number;
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    title: string;
    tags: string[];
    content: string;
    author: mongoose.Types.ObjectId;
    isPublished: boolean;
    likes: number;
    commentsCount: number;
}> & {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    title: string;
    tags: string[];
    content: string;
    author: mongoose.Types.ObjectId;
    isPublished: boolean;
    likes: number;
    commentsCount: number;
} & {
    _id: mongoose.Types.ObjectId;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    title: string;
    tags: string[];
    content: string;
    author: mongoose.Types.ObjectId;
    isPublished: boolean;
    likes: number;
    commentsCount: number;
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    title: string;
    tags: string[];
    content: string;
    author: mongoose.Types.ObjectId;
    isPublished: boolean;
    likes: number;
    commentsCount: number;
}>> & mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    title: string;
    tags: string[];
    content: string;
    author: mongoose.Types.ObjectId;
    isPublished: boolean;
    likes: number;
    commentsCount: number;
}> & {
    _id: mongoose.Types.ObjectId;
}>>;
//# sourceMappingURL=CommunityPost.d.ts.map