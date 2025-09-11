import mongoose from 'mongoose';
export declare const ShopOrder: mongoose.Model<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    notes: string;
    status: "pending" | "cancelled" | "paid" | "refunded";
    items: mongoose.Types.DocumentArray<{
        name: string;
        price: number;
        productId: mongoose.Types.ObjectId;
        qty: number;
    }>;
    totalAmount: number;
    user: mongoose.Types.ObjectId;
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    notes: string;
    status: "pending" | "cancelled" | "paid" | "refunded";
    items: mongoose.Types.DocumentArray<{
        name: string;
        price: number;
        productId: mongoose.Types.ObjectId;
        qty: number;
    }>;
    totalAmount: number;
    user: mongoose.Types.ObjectId;
}> & {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    notes: string;
    status: "pending" | "cancelled" | "paid" | "refunded";
    items: mongoose.Types.DocumentArray<{
        name: string;
        price: number;
        productId: mongoose.Types.ObjectId;
        qty: number;
    }>;
    totalAmount: number;
    user: mongoose.Types.ObjectId;
} & {
    _id: mongoose.Types.ObjectId;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    notes: string;
    status: "pending" | "cancelled" | "paid" | "refunded";
    items: mongoose.Types.DocumentArray<{
        name: string;
        price: number;
        productId: mongoose.Types.ObjectId;
        qty: number;
    }>;
    totalAmount: number;
    user: mongoose.Types.ObjectId;
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    notes: string;
    status: "pending" | "cancelled" | "paid" | "refunded";
    items: mongoose.Types.DocumentArray<{
        name: string;
        price: number;
        productId: mongoose.Types.ObjectId;
        qty: number;
    }>;
    totalAmount: number;
    user: mongoose.Types.ObjectId;
}>> & mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    notes: string;
    status: "pending" | "cancelled" | "paid" | "refunded";
    items: mongoose.Types.DocumentArray<{
        name: string;
        price: number;
        productId: mongoose.Types.ObjectId;
        qty: number;
    }>;
    totalAmount: number;
    user: mongoose.Types.ObjectId;
}> & {
    _id: mongoose.Types.ObjectId;
}>>;
//# sourceMappingURL=ShopOrder.d.ts.map