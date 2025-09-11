import mongoose from 'mongoose';
export declare const Payment: mongoose.Model<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    notes: string;
    status: "pending" | "completed" | "failed" | "refunded";
    paymentMethod: "card" | "cash" | "transfer" | "online";
    user: mongoose.Types.ObjectId;
    purpose: "other" | "course" | "booking" | "membership";
    amount: number;
    currency: string;
    relatedCourse?: mongoose.Types.ObjectId;
    relatedBooking?: mongoose.Types.ObjectId;
    transactionId?: string;
    receiptUrl?: string;
    processedAt?: Date;
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    notes: string;
    status: "pending" | "completed" | "failed" | "refunded";
    paymentMethod: "card" | "cash" | "transfer" | "online";
    user: mongoose.Types.ObjectId;
    purpose: "other" | "course" | "booking" | "membership";
    amount: number;
    currency: string;
    relatedCourse?: mongoose.Types.ObjectId;
    relatedBooking?: mongoose.Types.ObjectId;
    transactionId?: string;
    receiptUrl?: string;
    processedAt?: Date;
}> & {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    notes: string;
    status: "pending" | "completed" | "failed" | "refunded";
    paymentMethod: "card" | "cash" | "transfer" | "online";
    user: mongoose.Types.ObjectId;
    purpose: "other" | "course" | "booking" | "membership";
    amount: number;
    currency: string;
    relatedCourse?: mongoose.Types.ObjectId;
    relatedBooking?: mongoose.Types.ObjectId;
    transactionId?: string;
    receiptUrl?: string;
    processedAt?: Date;
} & {
    _id: mongoose.Types.ObjectId;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    notes: string;
    status: "pending" | "completed" | "failed" | "refunded";
    paymentMethod: "card" | "cash" | "transfer" | "online";
    user: mongoose.Types.ObjectId;
    purpose: "other" | "course" | "booking" | "membership";
    amount: number;
    currency: string;
    relatedCourse?: mongoose.Types.ObjectId;
    relatedBooking?: mongoose.Types.ObjectId;
    transactionId?: string;
    receiptUrl?: string;
    processedAt?: Date;
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    notes: string;
    status: "pending" | "completed" | "failed" | "refunded";
    paymentMethod: "card" | "cash" | "transfer" | "online";
    user: mongoose.Types.ObjectId;
    purpose: "other" | "course" | "booking" | "membership";
    amount: number;
    currency: string;
    relatedCourse?: mongoose.Types.ObjectId;
    relatedBooking?: mongoose.Types.ObjectId;
    transactionId?: string;
    receiptUrl?: string;
    processedAt?: Date;
}>> & mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    notes: string;
    status: "pending" | "completed" | "failed" | "refunded";
    paymentMethod: "card" | "cash" | "transfer" | "online";
    user: mongoose.Types.ObjectId;
    purpose: "other" | "course" | "booking" | "membership";
    amount: number;
    currency: string;
    relatedCourse?: mongoose.Types.ObjectId;
    relatedBooking?: mongoose.Types.ObjectId;
    transactionId?: string;
    receiptUrl?: string;
    processedAt?: Date;
}> & {
    _id: mongoose.Types.ObjectId;
}>>;
//# sourceMappingURL=Payment.d.ts.map