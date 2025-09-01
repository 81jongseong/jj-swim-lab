/// <reference types="mongoose/types/aggregate" />
/// <reference types="mongoose/types/callback" />
/// <reference types="mongoose/types/collection" />
/// <reference types="mongoose/types/connection" />
/// <reference types="mongoose/types/cursor" />
/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/error" />
/// <reference types="mongoose/types/expressions" />
/// <reference types="mongoose/types/helpers" />
/// <reference types="mongoose/types/middlewares" />
/// <reference types="mongoose/types/indexes" />
/// <reference types="mongoose/types/models" />
/// <reference types="mongoose/types/mongooseoptions" />
/// <reference types="mongoose/types/pipelinestage" />
/// <reference types="mongoose/types/populate" />
/// <reference types="mongoose/types/query" />
/// <reference types="mongoose/types/schemaoptions" />
/// <reference types="mongoose/types/schematypes" />
/// <reference types="mongoose/types/session" />
/// <reference types="mongoose/types/types" />
/// <reference types="mongoose/types/utility" />
/// <reference types="mongoose/types/validation" />
/// <reference types="mongoose/types/virtuals" />
/// <reference types="mongoose/types/inferschematype" />
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
export declare const MembershipPlan: mongoose.Model<IMembershipPlan, {}, {}, {}, mongoose.Document<unknown, {}, IMembershipPlan> & IMembershipPlan & {
    _id: mongoose.Types.ObjectId;
}, any>;
export declare const UserMembership: mongoose.Model<IUserMembership, {}, {}, {}, mongoose.Document<unknown, {}, IUserMembership> & IUserMembership & {
    _id: mongoose.Types.ObjectId;
}, any>;
export declare const MembershipPayment: mongoose.Model<IMembershipPayment, {}, {}, {}, mongoose.Document<unknown, {}, IMembershipPayment> & IMembershipPayment & {
    _id: mongoose.Types.ObjectId;
}, any>;
//# sourceMappingURL=Membership.d.ts.map