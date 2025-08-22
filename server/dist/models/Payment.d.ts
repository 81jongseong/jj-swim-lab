import mongoose from 'mongoose';
export declare const Payment: mongoose.Model<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    status: "completed" | "pending" | "failed" | "refunded";
    user: mongoose.Types.ObjectId;
    notes: string;
    purpose: "other" | "course" | "booking" | "membership";
    amount: number;
    currency: string;
    paymentMethod: "card" | "cash" | "transfer" | "online";
    relatedCourse?: mongoose.Types.ObjectId;
    relatedBooking?: mongoose.Types.ObjectId;
    transactionId?: string;
    receiptUrl?: string;
    processedAt?: NativeDate;
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    status: "completed" | "pending" | "failed" | "refunded";
    user: mongoose.Types.ObjectId;
    notes: string;
    purpose: "other" | "course" | "booking" | "membership";
    amount: number;
    currency: string;
    paymentMethod: "card" | "cash" | "transfer" | "online";
    relatedCourse?: mongoose.Types.ObjectId;
    relatedBooking?: mongoose.Types.ObjectId;
    transactionId?: string;
    receiptUrl?: string;
    processedAt?: NativeDate;
}, {}, {
    timestamps: true;
}> & {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    status: "completed" | "pending" | "failed" | "refunded";
    user: mongoose.Types.ObjectId;
    notes: string;
    purpose: "other" | "course" | "booking" | "membership";
    amount: number;
    currency: string;
    paymentMethod: "card" | "cash" | "transfer" | "online";
    relatedCourse?: mongoose.Types.ObjectId;
    relatedBooking?: mongoose.Types.ObjectId;
    transactionId?: string;
    receiptUrl?: string;
    processedAt?: NativeDate;
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
    status: "completed" | "pending" | "failed" | "refunded";
    user: mongoose.Types.ObjectId;
    notes: string;
    purpose: "other" | "course" | "booking" | "membership";
    amount: number;
    currency: string;
    paymentMethod: "card" | "cash" | "transfer" | "online";
    relatedCourse?: mongoose.Types.ObjectId;
    relatedBooking?: mongoose.Types.ObjectId;
    transactionId?: string;
    receiptUrl?: string;
    processedAt?: NativeDate;
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    status: "completed" | "pending" | "failed" | "refunded";
    user: mongoose.Types.ObjectId;
    notes: string;
    purpose: "other" | "course" | "booking" | "membership";
    amount: number;
    currency: string;
    paymentMethod: "card" | "cash" | "transfer" | "online";
    relatedCourse?: mongoose.Types.ObjectId;
    relatedBooking?: mongoose.Types.ObjectId;
    transactionId?: string;
    receiptUrl?: string;
    processedAt?: NativeDate;
}>, {}, mongoose.ResolveSchemaOptions<{
    timestamps: true;
}>> & mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    status: "completed" | "pending" | "failed" | "refunded";
    user: mongoose.Types.ObjectId;
    notes: string;
    purpose: "other" | "course" | "booking" | "membership";
    amount: number;
    currency: string;
    paymentMethod: "card" | "cash" | "transfer" | "online";
    relatedCourse?: mongoose.Types.ObjectId;
    relatedBooking?: mongoose.Types.ObjectId;
    transactionId?: string;
    receiptUrl?: string;
    processedAt?: NativeDate;
}> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
//# sourceMappingURL=Payment.d.ts.map