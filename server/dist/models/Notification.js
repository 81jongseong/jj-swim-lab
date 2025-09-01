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
exports.Notification = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const notificationSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
        maxlength: 100
    },
    message: {
        type: String,
        required: true,
        maxlength: 500
    },
    type: {
        type: String,
        enum: ['info', 'success', 'warning', 'error', 'course', 'booking', 'payment', 'system'],
        default: 'info'
    },
    category: {
        type: String,
        enum: ['general', 'course', 'booking', 'payment', 'membership', 'ai_analysis', 'system'],
        default: 'general'
    },
    isRead: {
        type: Boolean,
        default: false
    },
    isEmailSent: {
        type: Boolean,
        default: false
    },
    isPushSent: {
        type: Boolean,
        default: false
    },
    relatedId: {
        type: mongoose_1.Schema.Types.ObjectId
    },
    relatedType: {
        type: String
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    scheduledAt: {
        type: Date
    },
    expiresAt: {
        type: Date
    },
    metadata: {
        type: mongoose_1.Schema.Types.Mixed
    }
}, {
    timestamps: true
});
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, category: 1, createdAt: -1 });
notificationSchema.index({ scheduledAt: 1, isEmailSent: 1 });
notificationSchema.index({ expiresAt: 1 });
notificationSchema.virtual('isExpired').get(function () {
    if (!this.expiresAt)
        return false;
    return new Date() > this.expiresAt;
});
notificationSchema.virtual('isScheduled').get(function () {
    if (!this.scheduledAt)
        return false;
    return new Date() < this.scheduledAt;
});
notificationSchema.set('toJSON', { virtuals: true });
notificationSchema.set('toObject', { virtuals: true });
exports.Notification = mongoose_1.default.model('Notification', notificationSchema);
//# sourceMappingURL=Notification.js.map