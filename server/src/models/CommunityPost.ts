import mongoose from 'mongoose';

const communityPostSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  tags: { type: [String], default: [] },
  isPublished: { type: Boolean, default: true },
  likes: { type: Number, default: 0 },
  commentsCount: { type: Number, default: 0 },
}, { timestamps: true });

communityPostSchema.index({ title: 'text', content: 'text', tags: 1 });

export const CommunityPost = mongoose.model('CommunityPost', communityPostSchema);



































