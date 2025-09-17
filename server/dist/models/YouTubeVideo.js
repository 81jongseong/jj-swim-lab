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
exports.YouTubeVideo = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const YouTubeVideoSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    videoId: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    thumbnailUrl: {
        type: String,
        required: true,
        trim: true
    },
    duration: {
        type: String,
        trim: true
    },
    category: {
        type: String,
        required: true,
        trim: true,
        enum: ['자유형', '배영', '평영', '접영', '혼영', '기초기술', '호흡법', '발차기', '손짓', '턴', '스타트', '안전수칙', '체력향상', '기타']
    },
    level: {
        type: String,
        required: true,
        trim: true,
        enum: ['beginner', 'intermediate', 'advanced', '초급', '중급', '고급']
    },
    teachingMethodId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'TeachingMethod',
        required: false
    },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    viewCount: {
        type: Number,
        default: 0
    },
    likeCount: {
        type: Number,
        default: 0
    },
    tags: [{
            type: String,
            trim: true
        }]
}, {
    timestamps: true
});
YouTubeVideoSchema.index({ videoId: 1 });
YouTubeVideoSchema.index({ category: 1 });
YouTubeVideoSchema.index({ level: 1 });
YouTubeVideoSchema.index({ teachingMethodId: 1 });
YouTubeVideoSchema.index({ isActive: 1 });
YouTubeVideoSchema.index({ createdAt: -1 });
exports.YouTubeVideo = mongoose_1.default.model('YouTubeVideo', YouTubeVideoSchema);
//# sourceMappingURL=YouTubeVideo.js.map