"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MembershipPayment = exports.UserMembership = exports.MembershipPlan = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const membershipPlanSchema = new mongoose_1.Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    duration: { type: Number, required: true, min: 1 },
    features: [{ type: String }],
    maxClassesPerMonth: { type: Number, min: 0 },
    maxVideoUploads: { type: Number, min: 0 },
    prioritySupport: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true
});
const userMembershipSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    planId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'MembershipPlan', required: true },
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
const membershipPaymentSchema = new mongoose_1.Schema({
    membershipId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'UserMembership', required: true },
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
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
membershipPlanSchema.index({ isActive: 1 });
userMembershipSchema.index({ userId: 1, status: 1 });
userMembershipSchema.index({ endDate: 1, status: 1 });
membershipPaymentSchema.index({ userId: 1, paymentDate: -1 });
membershipPaymentSchema.index({ paymentStatus: 1 });
exports.MembershipPlan = mongoose_1.default.model('MembershipPlan', membershipPlanSchema);
exports.UserMembership = mongoose_1.default.model('UserMembership', userMembershipSchema);
exports.MembershipPayment = mongoose_1.default.model('MembershipPayment', membershipPaymentSchema);
//# sourceMappingURL=Membership.js.map