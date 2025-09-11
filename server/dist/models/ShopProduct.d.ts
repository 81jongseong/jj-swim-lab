import mongoose from 'mongoose';
export declare const ShopProduct: mongoose.Model<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    name: string;
    isActive: boolean;
    description: string;
    price: number;
    category: string;
    stock: number;
    images: string[];
    currency: string;
    createdBy?: mongoose.Types.ObjectId;
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    name: string;
    isActive: boolean;
    description: string;
    price: number;
    category: string;
    stock: number;
    images: string[];
    currency: string;
    createdBy?: mongoose.Types.ObjectId;
}> & {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    name: string;
    isActive: boolean;
    description: string;
    price: number;
    category: string;
    stock: number;
    images: string[];
    currency: string;
    createdBy?: mongoose.Types.ObjectId;
} & {
    _id: mongoose.Types.ObjectId;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    name: string;
    isActive: boolean;
    description: string;
    price: number;
    category: string;
    stock: number;
    images: string[];
    currency: string;
    createdBy?: mongoose.Types.ObjectId;
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    name: string;
    isActive: boolean;
    description: string;
    price: number;
    category: string;
    stock: number;
    images: string[];
    currency: string;
    createdBy?: mongoose.Types.ObjectId;
}>> & mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    name: string;
    isActive: boolean;
    description: string;
    price: number;
    category: string;
    stock: number;
    images: string[];
    currency: string;
    createdBy?: mongoose.Types.ObjectId;
}> & {
    _id: mongoose.Types.ObjectId;
}>>;
//# sourceMappingURL=ShopProduct.d.ts.map