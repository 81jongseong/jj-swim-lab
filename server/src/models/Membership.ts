import mongoose, { Schema, Document } from 'mongoose';

export interface IMembershipPlan extends Document {
  name: string;
  description: string;
  price: number;
  duration: number; // 일 단위
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

const membershipPlanSchema = new Schema<IMembershipPlan>({
  name: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  duration: { type: Number, required: true, min: 1 }, // 일 단위
  features: [{ type: String }],
  maxClassesPerMonth: { type: Number, min: 0 },
  maxVideoUploads: { type: Number, min: 0 },
  prioritySupport: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

const userMembershipSchema = new Schema<IUserMembership>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  planId: { type: Schema.Types.ObjectId, ref: 'MembershipPlan', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['active', 'expired', 'cancelled', 'pending'], 
    required: true 
  },
  autoRenew: { type: Boolean, default: true },
  paymentMethod: { type: String },
  lastPaymentDate: { type: Date },
  nextPaymentDate: { type: Date },
  totalPaid: { type: Number, required: true, min: 0 }
}, {
  timestamps: true
});

const membershipPaymentSchema = new Schema<IMembershipPayment>({
  membershipId: { type: Schema.Types.ObjectId, ref: 'UserMembership', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true, min: 0 },
  paymentMethod: { type: String, required: true },
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'completed', 'failed', 'refunded'], 
    required: true 
  },
  transactionId: { type: String },
  paymentDate: { type: Date, required: true },
  description: { type: String, required: true }
}, {
  timestamps: true
});

// 인덱스 추가
membershipPlanSchema.index({ isActive: 1 });
userMembershipSchema.index({ userId: 1, status: 1 });
userMembershipSchema.index({ endDate: 1, status: 1 });
membershipPaymentSchema.index({ userId: 1, paymentDate: -1 });
membershipPaymentSchema.index({ paymentStatus: 1 });

export const MembershipPlan = mongoose.model<IMembershipPlan>('MembershipPlan', membershipPlanSchema);
export const UserMembership = mongoose.model<IUserMembership>('UserMembership', userMembershipSchema);
export const MembershipPayment = mongoose.model<IMembershipPayment>('MembershipPayment', membershipPaymentSchema); 