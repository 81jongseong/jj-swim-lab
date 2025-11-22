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
exports.LessonTicket = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const lessonTicketSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    centerId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'SwimmingCenter',
        required: true,
        index: true
    },
    type: {
        type: String,
        enum: ['group', 'personal', 'unlimited'],
        required: true
    },
    name: {
        type: String,
        required: true
    },
    totalSessions: {
        type: Number,
        required: true,
        min: 0
    },
    remainingSessions: {
        type: Number,
        required: true,
        min: 0
    },
    usedSessions: {
        type: Number,
        default: 0,
        min: 0
    },
    purchaseDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    startDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    expiryDate: {
        type: Date,
        required: true,
        index: true
    },
    status: {
        type: String,
        enum: ['active', 'expired', 'exhausted', 'suspended'],
        default: 'active',
        index: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    allowedCourseTypes: [{ type: String }],
    assignedInstructor: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User'
    },
    notes: { type: String },
    centerMemo: { type: String },
    isRefunded: {
        type: Boolean,
        default: false
    },
    refundDate: { type: Date },
    refundAmount: { type: Number, min: 0 }
}, {
    timestamps: true
});
lessonTicketSchema.index({ userId: 1, centerId: 1, status: 1 });
lessonTicketSchema.index({ centerId: 1, expiryDate: 1, status: 1 });
lessonTicketSchema.index({ userId: 1, status: 1, expiryDate: 1 });
lessonTicketSchema.virtual('isExpiringSoon').get(function () {
    const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    return this.expiryDate <= sevenDaysFromNow && this.status === 'active';
});
lessonTicketSchema.virtual('usageRate').get(function () {
    if (this.totalSessions === 0)
        return 0;
    return Math.round((this.usedSessions / this.totalSessions) * 100);
});
lessonTicketSchema.methods.useSession = async function () {
    if (this.remainingSessions <= 0) {
        throw new Error('남은 수업 횟수가 없습니다.');
    }
    if (this.status !== 'active') {
        throw new Error('활성 상태가 아닌 수강권입니다.');
    }
    if (this.expiryDate < new Date()) {
        this.status = 'expired';
        await this.save();
        throw new Error('만료된 수강권입니다.');
    }
    this.remainingSessions -= 1;
    this.usedSessions += 1;
    if (this.remainingSessions === 0) {
        this.status = 'exhausted';
    }
    return await this.save();
};
lessonTicketSchema.methods.cancelSession = async function () {
    if (this.usedSessions <= 0) {
        throw new Error('취소할 수업이 없습니다.');
    }
    this.remainingSessions += 1;
    this.usedSessions -= 1;
    if (this.status === 'exhausted' && this.remainingSessions > 0) {
        this.status = 'active';
    }
    return await this.save();
};
lessonTicketSchema.statics.updateExpiredTickets = async function () {
    const now = new Date();
    return await this.updateMany({
        expiryDate: { $lt: now },
        status: 'active'
    }, {
        $set: { status: 'expired' }
    });
};
lessonTicketSchema.statics.getExpiringSoonTickets = async function (centerId) {
    const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const query = {
        status: 'active',
        expiryDate: { $lte: sevenDaysFromNow, $gte: new Date() }
    };
    if (centerId) {
        query.centerId = centerId;
    }
    return await this.find(query)
        .populate('userId', 'name email phone')
        .sort({ expiryDate: 1 });
};
exports.LessonTicket = mongoose_1.default.model('LessonTicket', lessonTicketSchema);
//# sourceMappingURL=LessonTicket.js.map