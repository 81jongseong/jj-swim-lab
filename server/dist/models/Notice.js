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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoticeView = exports.Notice = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const noticeSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    author: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    category: {
        type: String,
        enum: ['general', 'course', 'facility', 'maintenance', 'emergency', 'membership', 'quiz', 'system'],
        default: 'general',
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium',
    },
    targetUserTypes: [{
            type: String,
            enum: ['student', 'instructor', 'centerAdmin', 'superAdmin', 'guest'],
            required: true
        }],
    targetCenters: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'SwimmingCenter'
        }],
    isPublished: {
        type: Boolean,
        default: false,
    },
    isVisibleToGuest: {
        type: Boolean,
        default: false,
    },
    publishedAt: {
        type: Date,
    },
    expiresAt: {
        type: Date,
    },
    attachments: [{
            filename: { type: String, required: true },
            url: { type: String, required: true },
            size: { type: Number, required: true },
            type: { type: String, required: true }
        }],
    viewCount: {
        type: Number,
        default: 0,
    },
    tags: [String],
    isPinned: {
        type: Boolean,
        default: false,
    },
    allowComments: {
        type: Boolean,
        default: false,
    }
}, {
    timestamps: true
});
const noticeViewSchema = new mongoose_1.Schema({
    noticeId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Notice', required: true },
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    viewedAt: { type: Date, default: Date.now }
});
noticeSchema.index({ category: 1, isPublished: 1, createdAt: -1 });
noticeSchema.index({ priority: 1, isPublished: 1 });
noticeSchema.index({ targetUserTypes: 1, isPublished: 1 });
noticeSchema.index({ isPinned: 1, isPublished: 1 });
noticeViewSchema.index({ noticeId: 1, userId: 1 }, { unique: true });
noticeViewSchema.index({ userId: 1, viewedAt: -1 });
exports.Notice = mongoose_1.default.model('Notice', noticeSchema);
exports.NoticeView = mongoose_1.default.model('NoticeView', noticeViewSchema);
//# sourceMappingURL=Notice.js.map