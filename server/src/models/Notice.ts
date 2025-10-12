import mongoose, { Schema, Document } from 'mongoose';

export interface INotice extends Document {
  title: string;
  content: string;
  author: mongoose.Types.ObjectId;
  category: 'general' | 'course' | 'facility' | 'maintenance' | 'emergency' | 'membership' | 'quiz' | 'system';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  targetUserTypes: ('student' | 'instructor' | 'centerAdmin' | 'superAdmin' | 'guest')[];
  targetCenters?: mongoose.Types.ObjectId[];
  isPublished: boolean;
  isVisibleToGuest: boolean;
  publishedAt?: Date;
  expiresAt?: Date;
  attachments: {
    filename: string;
    url: string;
    size: number;
    type: string;
  }[];
  viewCount: number;
  tags: string[];
  isPinned: boolean;
  allowComments: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface INoticeView extends Document {
  noticeId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  viewedAt: Date;
}

const noticeSchema = new Schema<INotice>({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  author: {
    type: Schema.Types.ObjectId,
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
    type: Schema.Types.ObjectId,
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

const noticeViewSchema = new Schema<INoticeView>({
  noticeId: { type: Schema.Types.ObjectId, ref: 'Notice', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  viewedAt: { type: Date, default: Date.now }
});

// 인덱스 추가
noticeSchema.index({ category: 1, isPublished: 1, createdAt: -1 });
noticeSchema.index({ priority: 1, isPublished: 1 });
noticeSchema.index({ targetUserTypes: 1, isPublished: 1 });
noticeSchema.index({ isPinned: 1, isPublished: 1 });
noticeViewSchema.index({ noticeId: 1, userId: 1 }, { unique: true });
noticeViewSchema.index({ userId: 1, viewedAt: -1 });

export const Notice = mongoose.model<INotice>('Notice', noticeSchema);
export const NoticeView = mongoose.model<INoticeView>('NoticeView', noticeViewSchema); 