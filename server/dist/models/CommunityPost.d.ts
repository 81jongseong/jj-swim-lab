import mongoose from 'mongoose';
export declare const CommunityPost: mongoose.Model<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    title: string;
    content: string;
    author: mongoose.Types.ObjectId;
    isPublished: boolean;
    tags: string[];
    likes: number;
    commentsCount: number;
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    title: string;
    content: string;
    author: mongoose.Types.ObjectId;
    isPublished: boolean;
    tags: string[];
    likes: number;
    commentsCount: number;
}, {}, {
    timestamps: true;
}> & {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    title: string;
    content: string;
    author: mongoose.Types.ObjectId;
    isPublished: boolean;
    tags: string[];
    likes: number;
    commentsCount: number;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    title: string;
    content: string;
    author: mongoose.Types.ObjectId;
    isPublished: boolean;
    tags: string[];
    likes: number;
    commentsCount: number;
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    title: string;
    content: string;
    author: mongoose.Types.ObjectId;
    isPublished: boolean;
    tags: string[];
    likes: number;
    commentsCount: number;
}>, {}, mongoose.ResolveSchemaOptions<{
    timestamps: true;
}>> & mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    title: string;
    content: string;
    author: mongoose.Types.ObjectId;
    isPublished: boolean;
    tags: string[];
    likes: number;
    commentsCount: number;
}> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
//# sourceMappingURL=CommunityPost.d.ts.map