import mongoose from 'mongoose';
export declare const CommunityComment: mongoose.Model<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    content: string;
    author: mongoose.Types.ObjectId;
    postId: mongoose.Types.ObjectId;
    likes: number;
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    content: string;
    author: mongoose.Types.ObjectId;
    postId: mongoose.Types.ObjectId;
    likes: number;
}> & {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    content: string;
    author: mongoose.Types.ObjectId;
    postId: mongoose.Types.ObjectId;
    likes: number;
} & {
    _id: mongoose.Types.ObjectId;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    content: string;
    author: mongoose.Types.ObjectId;
    postId: mongoose.Types.ObjectId;
    likes: number;
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    content: string;
    author: mongoose.Types.ObjectId;
    postId: mongoose.Types.ObjectId;
    likes: number;
}>> & mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    content: string;
    author: mongoose.Types.ObjectId;
    postId: mongoose.Types.ObjectId;
    likes: number;
}> & {
    _id: mongoose.Types.ObjectId;
}>>;
//# sourceMappingURL=CommunityComment.d.ts.map