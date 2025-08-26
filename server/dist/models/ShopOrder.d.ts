import mongoose from 'mongoose';
export declare const ShopOrder: mongoose.Model<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    status: "pending" | "cancelled" | "refunded" | "paid";
    user: mongoose.Types.ObjectId;
    notes: string;
    totalAmount: number;
    items: mongoose.Types.DocumentArray<{
        name: string;
        price: number;
        productId: mongoose.Types.ObjectId;
        qty: number;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        name: string;
        price: number;
        productId: mongoose.Types.ObjectId;
        qty: number;
    }> & {
        name: string;
        price: number;
        productId: mongoose.Types.ObjectId;
        qty: number;
    }>;
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    status: "pending" | "cancelled" | "refunded" | "paid";
    user: mongoose.Types.ObjectId;
    notes: string;
    totalAmount: number;
    items: mongoose.Types.DocumentArray<{
        name: string;
        price: number;
        productId: mongoose.Types.ObjectId;
        qty: number;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        name: string;
        price: number;
        productId: mongoose.Types.ObjectId;
        qty: number;
    }> & {
        name: string;
        price: number;
        productId: mongoose.Types.ObjectId;
        qty: number;
    }>;
}, {}, {
    timestamps: true;
}> & {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    status: "pending" | "cancelled" | "refunded" | "paid";
    user: mongoose.Types.ObjectId;
    notes: string;
    totalAmount: number;
    items: mongoose.Types.DocumentArray<{
        name: string;
        price: number;
        productId: mongoose.Types.ObjectId;
        qty: number;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        name: string;
        price: number;
        productId: mongoose.Types.ObjectId;
        qty: number;
    }> & {
        name: string;
        price: number;
        productId: mongoose.Types.ObjectId;
        qty: number;
    }>;
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
    status: "pending" | "cancelled" | "refunded" | "paid";
    user: mongoose.Types.ObjectId;
    notes: string;
    totalAmount: number;
    items: mongoose.Types.DocumentArray<{
        name: string;
        price: number;
        productId: mongoose.Types.ObjectId;
        qty: number;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        name: string;
        price: number;
        productId: mongoose.Types.ObjectId;
        qty: number;
    }> & {
        name: string;
        price: number;
        productId: mongoose.Types.ObjectId;
        qty: number;
    }>;
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    status: "pending" | "cancelled" | "refunded" | "paid";
    user: mongoose.Types.ObjectId;
    notes: string;
    totalAmount: number;
    items: mongoose.Types.DocumentArray<{
        name: string;
        price: number;
        productId: mongoose.Types.ObjectId;
        qty: number;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        name: string;
        price: number;
        productId: mongoose.Types.ObjectId;
        qty: number;
    }> & {
        name: string;
        price: number;
        productId: mongoose.Types.ObjectId;
        qty: number;
    }>;
}>, {}, mongoose.ResolveSchemaOptions<{
    timestamps: true;
}>> & mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    status: "pending" | "cancelled" | "refunded" | "paid";
    user: mongoose.Types.ObjectId;
    notes: string;
    totalAmount: number;
    items: mongoose.Types.DocumentArray<{
        name: string;
        price: number;
        productId: mongoose.Types.ObjectId;
        qty: number;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        name: string;
        price: number;
        productId: mongoose.Types.ObjectId;
        qty: number;
    }> & {
        name: string;
        price: number;
        productId: mongoose.Types.ObjectId;
        qty: number;
    }>;
}> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
//# sourceMappingURL=ShopOrder.d.ts.map