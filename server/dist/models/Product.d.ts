import mongoose, { Document } from 'mongoose';
export interface IProduct extends Document {
    name: string;
    description: string;
    price: number;
    originalPrice?: number;
    category: string;
    subCategory?: string;
    brand?: string;
    sku: string;
    stock: number;
    minStock: number;
    maxStock: number;
    status: 'active' | 'inactive' | 'out_of_stock' | 'discontinued';
    images: string[];
    tags: string[];
    specifications: {
        weight?: number;
        dimensions?: {
            length: number;
            width: number;
            height: number;
        };
        material?: string;
        color?: string;
        size?: string;
    };
    isDigital: boolean;
    isPhysical: boolean;
    shippingRequired: boolean;
    centerId: mongoose.Types.ObjectId;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IProduct, {}, {}, {}, mongoose.Document<unknown, {}, IProduct> & IProduct & {
    _id: mongoose.Types.ObjectId;
}, any>;
export default _default;
//# sourceMappingURL=Product.d.ts.map