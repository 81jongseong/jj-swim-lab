import mongoose from 'mongoose';
export declare const ShopProduct: mongoose.Model<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    name: string;
    isActive: boolean;
    description: string;
    price: number;
    currency: string;
    category: string;
    images: string[];
    stock: number;
    createdBy?: mongoose.Types.ObjectId;
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    name: string;
    isActive: boolean;
    description: string;
    price: number;
    currency: string;
    category: string;
    images: string[];
    stock: number;
    createdBy?: mongoose.Types.ObjectId;
}, {}, {
    timestamps: true;
}> & {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    name: string;
    isActive: boolean;
    description: string;
    price: number;
    currency: string;
    category: string;
    images: string[];
    stock: number;
    createdBy?: mongoose.Types.ObjectId;
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
    name: string;
    isActive: boolean;
    description: string;
    price: number;
    currency: string;
    category: string;
    images: string[];
    stock: number;
    createdBy?: mongoose.Types.ObjectId;
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    name: string;
    isActive: boolean;
    description: string;
    price: number;
    currency: string;
    category: string;
    images: string[];
    stock: number;
    createdBy?: mongoose.Types.ObjectId;
}>, {}, mongoose.ResolveSchemaOptions<{
    timestamps: true;
}>> & mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    name: string;
    isActive: boolean;
    description: string;
    price: number;
    currency: string;
    category: string;
    images: string[];
    stock: number;
    createdBy?: mongoose.Types.ObjectId;
}> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
//# sourceMappingURL=ShopProduct.d.ts.map