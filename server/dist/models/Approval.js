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
exports.Approval = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const ApprovalSchema = new mongoose_1.Schema({
    type: {
        type: String,
        enum: ['course_enrollment', 'instructor_registration', 'payment_approval', 'schedule_change', 'refund_request'],
        required: true,
        index: true
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    courseId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Course',
        index: true
    },
    instructorId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        index: true
    },
    paymentId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Payment',
        index: true
    },
    title: {
        type: String,
        required: true,
        maxlength: 200
    },
    description: {
        type: String,
        required: true,
        maxlength: 1000
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
        index: true
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium',
        index: true
    },
    estimatedAmount: {
        type: Number,
        min: 0
    },
    requestDate: {
        type: Date,
        default: Date.now,
        index: true
    },
    processedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User'
    },
    processedAt: {
        type: Date
    },
    reason: {
        type: String,
        maxlength: 500
    },
    centerId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Center',
        index: true
    },
    attachments: [{
            type: String
        }]
}, {
    timestamps: true,
    collection: 'approvals'
});
ApprovalSchema.index({ userId: 1, type: 1, status: 1 });
ApprovalSchema.index({ centerId: 1, status: 1, requestDate: -1 });
ApprovalSchema.index({ status: 1, priority: 1, requestDate: -1 });
ApprovalSchema.virtual('waitingDays').get(function () {
    if (this.status === 'pending') {
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - this.requestDate.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    return 0;
});
ApprovalSchema.virtual('processingDays').get(function () {
    if (this.processedAt && this.requestDate) {
        const diffTime = Math.abs(this.processedAt.getTime() - this.requestDate.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    return 0;
});
ApprovalSchema.set('toJSON', { virtuals: true });
ApprovalSchema.set('toObject', { virtuals: true });
ApprovalSchema.pre('save', function (next) {
    if (this.isModified('status') && this.status !== 'pending') {
        this.processedAt = new Date();
    }
    next();
});
ApprovalSchema.statics.getPendingCount = function (centerId) {
    const query = { status: 'pending' };
    if (centerId) {
        query.centerId = centerId;
    }
    return this.countDocuments(query);
};
ApprovalSchema.statics.getPriorityCounts = function (centerId) {
    const query = { status: 'pending' };
    if (centerId) {
        query.centerId = centerId;
    }
    return this.aggregate([
        { $match: query },
        {
            $group: {
                _id: '$priority',
                count: { $sum: 1 }
            }
        }
    ]);
};
ApprovalSchema.methods.approve = function (processedBy, reason) {
    this.status = 'approved';
    this.processedBy = processedBy;
    this.processedAt = new Date();
    if (reason) {
        this.reason = reason;
    }
    return this.save();
};
ApprovalSchema.methods.reject = function (processedBy, reason) {
    this.status = 'rejected';
    this.processedBy = processedBy;
    this.processedAt = new Date();
    this.reason = reason;
    return this.save();
};
exports.Approval = mongoose_1.default.model('Approval', ApprovalSchema);
exports.default = exports.Approval;
//# sourceMappingURL=Approval.js.map