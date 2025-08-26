import mongoose from 'mongoose';
export declare const Booking: mongoose.Model<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    date: NativeDate;
    status: "completed" | "pending" | "confirmed" | "cancelled";
    user: mongoose.Types.ObjectId;
    startTime: string;
    endTime: string;
    notes: string;
    laneNumber: number;
    purpose: "practice" | "lesson" | "competition" | "other";
    instructor?: mongoose.Types.ObjectId;
    course?: mongoose.Types.ObjectId;
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    date: NativeDate;
    status: "completed" | "pending" | "confirmed" | "cancelled";
    user: mongoose.Types.ObjectId;
    startTime: string;
    endTime: string;
    notes: string;
    laneNumber: number;
    purpose: "practice" | "lesson" | "competition" | "other";
    instructor?: mongoose.Types.ObjectId;
    course?: mongoose.Types.ObjectId;
}, {}, {
    timestamps: true;
}> & {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    date: NativeDate;
    status: "completed" | "pending" | "confirmed" | "cancelled";
    user: mongoose.Types.ObjectId;
    startTime: string;
    endTime: string;
    notes: string;
    laneNumber: number;
    purpose: "practice" | "lesson" | "competition" | "other";
    instructor?: mongoose.Types.ObjectId;
    course?: mongoose.Types.ObjectId;
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
    date: NativeDate;
    status: "completed" | "pending" | "confirmed" | "cancelled";
    user: mongoose.Types.ObjectId;
    startTime: string;
    endTime: string;
    notes: string;
    laneNumber: number;
    purpose: "practice" | "lesson" | "competition" | "other";
    instructor?: mongoose.Types.ObjectId;
    course?: mongoose.Types.ObjectId;
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    date: NativeDate;
    status: "completed" | "pending" | "confirmed" | "cancelled";
    user: mongoose.Types.ObjectId;
    startTime: string;
    endTime: string;
    notes: string;
    laneNumber: number;
    purpose: "practice" | "lesson" | "competition" | "other";
    instructor?: mongoose.Types.ObjectId;
    course?: mongoose.Types.ObjectId;
}>, {}, mongoose.ResolveSchemaOptions<{
    timestamps: true;
}>> & mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    date: NativeDate;
    status: "completed" | "pending" | "confirmed" | "cancelled";
    user: mongoose.Types.ObjectId;
    startTime: string;
    endTime: string;
    notes: string;
    laneNumber: number;
    purpose: "practice" | "lesson" | "competition" | "other";
    instructor?: mongoose.Types.ObjectId;
    course?: mongoose.Types.ObjectId;
}> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
//# sourceMappingURL=Booking.d.ts.map