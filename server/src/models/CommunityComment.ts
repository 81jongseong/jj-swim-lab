import mongoose from 'mongoose';

const communityCommentSchema = new mongoose.Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'CommunityPost', required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  likes: { type: Number, default: 0 },
}, { timestamps: true });

communityCommentSchema.index({ postId: 1, createdAt: -1 });

export const CommunityComment = mongoose.model('CommunityComment', communityCommentSchema);

































































