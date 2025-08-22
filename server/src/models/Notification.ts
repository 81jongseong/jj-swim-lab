import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'course' | 'booking' | 'payment' | 'system';
  category: 'general' | 'course' | 'booking' | 'payment' | 'membership' | 'ai_analysis' | 'system';
  isRead: boolean;
  isEmailSent: boolean;
  isPushSent: boolean;
  relatedId?: mongoose.Types.ObjectId; // 관련 데이터 ID (수업, 예약 등)
  relatedType?: string; // 관련 데이터 타입
  priority: 'low' | 'medium' | 'high' | 'urgent';
  scheduledAt?: Date; // 예약 발송 시간
  expiresAt?: Date; // 만료 시간
  metadata?: Record<string, any>; // 추가 데이터
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true
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
    default: false,
    index: true
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
    type: Schema.Types.ObjectId 
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
    type: Schema.Types.Mixed 
  }
}, {
  timestamps: true
});

// 인덱스 추가
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, category: 1, createdAt: -1 });
notificationSchema.index({ scheduledAt: 1, isEmailSent: 1 });
notificationSchema.index({ expiresAt: 1 });

// 가상 필드: 만료 여부
notificationSchema.virtual('isExpired').get(function() {
  if (!this.expiresAt) return false;
  return new Date() > this.expiresAt;
});

// 가상 필드: 발송 예정 여부
notificationSchema.virtual('isScheduled').get(function() {
  if (!this.scheduledAt) return false;
  return new Date() < this.scheduledAt;
});

// JSON 변환 시 가상 필드 포함
notificationSchema.set('toJSON', { virtuals: true });
notificationSchema.set('toObject', { virtuals: true });

export const Notification = mongoose.model<INotification>('Notification', notificationSchema);





