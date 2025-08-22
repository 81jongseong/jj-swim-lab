import mongoose, { Document } from 'mongoose';
export interface IMembershipPlan extends Document {
    name: string;
    description: string;
    price: number;
    duration: number;
    features: string[];
    maxClassesPerMonth?: number;
    maxVideoUploads?: number;
    prioritySupport: boolean;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface IUserMembership extends Document {
    userId: mongoose.Types.ObjectId;
    planId: mongoose.Types.ObjectId;
    startDate: Date;
    endDate: Date;
    status: 'active' | 'expired' | 'cancelled' | 'pending';
    autoRenew: boolean;
    paymentMethod?: string;
    lastPaymentDate?: Date;
    nextPaymentDate?: Date;
    totalPaid: number;
    createdAt: Date;
    updatedAt: Date;
}
export interface IMembershipPayment extends Document {
    membershipId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    amount: number;
    paymentMethod: string;
    paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
    transactionId?: string;
    paymentDate: Date;
    description: string;
    createdAt: Date;
}
export declare const MembershipPlan: mongoose.Model<IMembershipPlan, {}, {}, {}, mongoose.Document<unknown, {}, IMembershipPlan, {}, {}> & IMembershipPlan & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export declare const UserMembership: mongoose.Model<IUserMembership, {}, {}, {}, mongoose.Document<unknown, {}, IUserMembership, {}, {}> & IUserMembership & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export declare const MembershipPayment: mongoose.Model<IMembershipPayment, {}, {}, {}, mongoose.Document<unknown, {}, IMembershipPayment, {}, {}> & IMembershipPayment & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Membership.d.ts.map