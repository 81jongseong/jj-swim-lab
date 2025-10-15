"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Payment = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const paymentSchema = new mongoose_1.default.Schema({
    user: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    currency: {
        type: String,
        default: 'KRW',
    },
    pricingInfo: {
        userType: {
            type: String,
            enum: ['student', 'instructor', 'centerAdmin', 'superAdmin'],
            required: true,
        },
        pricingTier: {
            type: String,
            enum: ['standard', 'instructor_discount', 'center_managed', 'free'],
            default: 'standard',
        },
        baseAmount: {
            type: Number,
            required: true,
        },
        discountAmount: {
            type: Number,
            default: 0,
        },
        discountReason: {
            type: String,
            default: '',
        },
        centerId: {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'SwimmingCenter',
            default: null,
        },
        isCenterSponsored: {
            type: Boolean,
            default: false,
        },
    },
    paymentMethod: {
        type: String,
        enum: ['card', 'cash', 'transfer', 'online'],
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending',
    },
    purpose: {
        type: String,
        enum: ['course', 'booking', 'membership', 'other'],
        required: true,
    },
    relatedCourse: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Course',
    },
    relatedBooking: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Booking',
    },
    transactionId: {
        type: String,
        unique: true,
    },
    receiptUrl: {
        type: String,
    },
    notes: {
        type: String,
        default: '',
    },
    centerId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Center',
        required: true,
    },
    processedAt: {
        type: Date,
    },
}, {
    timestamps: true
});
paymentSchema.index({ user: 1, createdAt: -1 });
paymentSchema.index({ status: 1, createdAt: -1 });
exports.Payment = mongoose_1.default.models.Payment || mongoose_1.default.model('Payment', paymentSchema);
//# sourceMappingURL=Payment.js.map