import mongoose from 'mongoose';
export declare const CommunityReport: mongoose.Model<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    status: "open" | "reviewed" | "dismissed";
    reason: string;
    targetType: "comment" | "post";
    targetId: mongoose.Types.ObjectId;
    reporter: mongoose.Types.ObjectId;
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    status: "open" | "reviewed" | "dismissed";
    reason: string;
    targetType: "comment" | "post";
    targetId: mongoose.Types.ObjectId;
    reporter: mongoose.Types.ObjectId;
}> & {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    status: "open" | "reviewed" | "dismissed";
    reason: string;
    targetType: "comment" | "post";
    targetId: mongoose.Types.ObjectId;
    reporter: mongoose.Types.ObjectId;
} & {
    _id: mongoose.Types.ObjectId;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    status: "open" | "reviewed" | "dismissed";
    reason: string;
    targetType: "comment" | "post";
    targetId: mongoose.Types.ObjectId;
    reporter: mongoose.Types.ObjectId;
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    status: "open" | "reviewed" | "dismissed";
    reason: string;
    targetType: "comment" | "post";
    targetId: mongoose.Types.ObjectId;
    reporter: mongoose.Types.ObjectId;
}>> & mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    status: "open" | "reviewed" | "dismissed";
    reason: string;
    targetType: "comment" | "post";
    targetId: mongoose.Types.ObjectId;
    reporter: mongoose.Types.ObjectId;
}> & {
    _id: mongoose.Types.ObjectId;
}>>;
//# sourceMappingURL=CommunityReport.d.ts.map