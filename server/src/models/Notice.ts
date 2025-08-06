import mongoose from 'mongoose';

const noticeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  category: {
    type: String,
    enum: ['general', 'course', 'facility', 'maintenance', 'emergency'],
    default: 'general',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  },
  isPublished: {
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
    filename: String,
    url: String,
    size: Number,
  }],
  viewCount: {
    type: Number,
    default: 0,
  },
  tags: [String],
}, { 
  timestamps: true 
});

// 카테고리별 조회를 위한 인덱스
noticeSchema.index({ category: 1, isPublished: 1, createdAt: -1 });
noticeSchema.index({ priority: 1, isPublished: 1 });

export const Notice = mongoose.model('Notice', noticeSchema); 