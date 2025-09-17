import mongoose from 'mongoose';
export declare const CommunityComment: mongoose.Model<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    content: string;
    author: mongoose.Types.ObjectId;
    likes: number;
    postId: mongoose.Types.ObjectId;
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    content: string;
    author: mongoose.Types.ObjectId;
    likes: number;
    postId: mongoose.Types.ObjectId;
}> & {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    content: string;
    author: mongoose.Types.ObjectId;
    likes: number;
    postId: mongoose.Types.ObjectId;
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
    likes: number;
    postId: mongoose.Types.ObjectId;
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    content: string;
    author: mongoose.Types.ObjectId;
    likes: number;
    postId: mongoose.Types.ObjectId;
}>> & mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    content: string;
    author: mongoose.Types.ObjectId;
    likes: number;
    postId: mongoose.Types.ObjectId;
}> & {
    _id: mongoose.Types.ObjectId;
}>>;
//# sourceMappingURL=CommunityComment.d.ts.map