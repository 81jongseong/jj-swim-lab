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
}, {}, {
    timestamps: true;
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
} & {
    __v: number;
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
}>, {}, mongoose.ResolveSchemaOptions<{
    timestamps: true;
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
} & {
    __v: number;
}>>;
//# sourceMappingURL=CommunityReport.d.ts.map