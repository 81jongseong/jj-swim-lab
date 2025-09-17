import mongoose from 'mongoose';
export declare const Booking: mongoose.Model<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    centerId: mongoose.Types.ObjectId;
    startTime: string;
    endTime: string;
    notes: string;
    status: "pending" | "confirmed" | "cancelled" | "completed";
    date: Date;
    user: mongoose.Types.ObjectId;
    laneNumber: number;
    purpose: "practice" | "lesson" | "competition" | "other";
    instructor?: mongoose.Types.ObjectId;
    course?: mongoose.Types.ObjectId;
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    centerId: mongoose.Types.ObjectId;
    startTime: string;
    endTime: string;
    notes: string;
    status: "pending" | "confirmed" | "cancelled" | "completed";
    date: Date;
    user: mongoose.Types.ObjectId;
    laneNumber: number;
    purpose: "practice" | "lesson" | "competition" | "other";
    instructor?: mongoose.Types.ObjectId;
    course?: mongoose.Types.ObjectId;
}> & {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    centerId: mongoose.Types.ObjectId;
    startTime: string;
    endTime: string;
    notes: string;
    status: "pending" | "confirmed" | "cancelled" | "completed";
    date: Date;
    user: mongoose.Types.ObjectId;
    laneNumber: number;
    purpose: "practice" | "lesson" | "competition" | "other";
    instructor?: mongoose.Types.ObjectId;
    course?: mongoose.Types.ObjectId;
} & {
    _id: mongoose.Types.ObjectId;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    centerId: mongoose.Types.ObjectId;
    startTime: string;
    endTime: string;
    notes: string;
    status: "pending" | "confirmed" | "cancelled" | "completed";
    date: Date;
    user: mongoose.Types.ObjectId;
    laneNumber: number;
    purpose: "practice" | "lesson" | "competition" | "other";
    instructor?: mongoose.Types.ObjectId;
    course?: mongoose.Types.ObjectId;
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    centerId: mongoose.Types.ObjectId;
    startTime: string;
    endTime: string;
    notes: string;
    status: "pending" | "confirmed" | "cancelled" | "completed";
    date: Date;
    user: mongoose.Types.ObjectId;
    laneNumber: number;
    purpose: "practice" | "lesson" | "competition" | "other";
    instructor?: mongoose.Types.ObjectId;
    course?: mongoose.Types.ObjectId;
}>> & mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    centerId: mongoose.Types.ObjectId;
    startTime: string;
    endTime: string;
    notes: string;
    status: "pending" | "confirmed" | "cancelled" | "completed";
    date: Date;
    user: mongoose.Types.ObjectId;
    laneNumber: number;
    purpose: "practice" | "lesson" | "competition" | "other";
    instructor?: mongoose.Types.ObjectId;
    course?: mongoose.Types.ObjectId;
}> & {
    _id: mongoose.Types.ObjectId;
}>>;
//# sourceMappingURL=Booking.d.ts.map