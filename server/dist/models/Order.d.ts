import mongoose, { Document } from 'mongoose';
export interface IOrderItem {
    productId: mongoose.Types.ObjectId;
    productName: string;
    quantity: number;
    price: number;
    totalPrice: number;
}
export interface IOrder extends Document {
    orderNumber: string;
    customerId: mongoose.Types.ObjectId;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    items: IOrderItem[];
    totalAmount: number;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
    paymentMethod?: 'card' | 'bank' | 'cash' | 'point';
    shippingAddress?: {
        address: string;
        city: string;
        postalCode: string;
        country: string;
    };
    notes?: string;
    centerId: mongoose.Types.ObjectId;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IOrder, {}, {}, {}, mongoose.Document<unknown, {}, IOrder> & IOrder & {
    _id: mongoose.Types.ObjectId;
}, any>;
export default _default;
//# sourceMappingURL=Order.d.ts.map