"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommunityComment = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const communityCommentSchema = new mongoose_1.default.Schema({
    postId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'CommunityPost', required: true },
    author: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    likes: { type: Number, default: 0 },
}, { timestamps: true });
communityCommentSchema.index({ postId: 1, createdAt: -1 });
exports.CommunityComment = mongoose_1.default.model('CommunityComment', communityCommentSchema);
//# sourceMappingURL=CommunityComment.js.map