"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommunityPost = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const communityPostSchema = new mongoose_1.default.Schema({
    author: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    tags: { type: [String], default: [] },
    isPublished: { type: Boolean, default: true },
    likes: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
}, { timestamps: true });
communityPostSchema.index({ title: 'text', content: 'text', tags: 1 });
exports.CommunityPost = mongoose_1.default.models.CommunityPost || mongoose_1.default.model('CommunityPost', communityPostSchema);
//# sourceMappingURL=CommunityPost.js.map