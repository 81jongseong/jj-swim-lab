/**
 * 사용자 활동 로그 모델
 * 사용자의 모든 활동을 추적하고 기록합니다.
 */

import mongoose, { Document, Schema } from 'mongoose';

// 사용자 활동 인터페이스
export interface IUserActivity extends Document {
  userId: mongoose.Types.ObjectId;
  userType: 'superAdmin' | 'centerAdmin' | 'instructor' | 'student' | 'guest';
  action: string;
  resource: string;
  resourceId?: string;
  details: any;
  ip: string;
  userAgent?: string;
  timestamp: Date;
  sessionId?: string;
  success: boolean;
  errorMessage?: string;
  duration?: number; // 액션 수행 시간 (ms)
  metadata?: {
    browser?: string;
    os?: string;
    device?: string;
    location?: string;
  };
}

// 사용자 활동 스키마
const userActivitySchema = new Schema<IUserActivity>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  userType: {
    type: String,
    enum: ['superAdmin', 'centerAdmin', 'instructor', 'student', 'guest'],
    required: true,
    index: true
  },
  action: {
    type: String,
    required: true,
    index: true
  },
  resource: {
    type: String,
    required: true,
    index: true
  },
  resourceId: {
    type: String,
    index: true
  },
  details: {
    type: Schema.Types.Mixed,
    default: {}
  },
  ip: {
    type: String,
    required: true,
    index: true
  },
  userAgent: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  sessionId: {
    type: String,
    index: true
  },
  success: {
    type: Boolean,
    required: true,
    default: true,
    index: true
  },
  errorMessage: {
    type: String
  },
  duration: {
    type: Number
  },
  metadata: {
    browser: String,
    os: String,
    device: String,
    location: String
  }
}, {
  timestamps: true,
  collection: 'useractivities'
});

// 인덱스 설정
userActivitySchema.index({ userId: 1, timestamp: -1 });
userActivitySchema.index({ action: 1, timestamp: -1 });
userActivitySchema.index({ resource: 1, timestamp: -1 });
userActivitySchema.index({ success: 1, timestamp: -1 });
userActivitySchema.index({ userType: 1, timestamp: -1 });

// 복합 인덱스
userActivitySchema.index({ userId: 1, action: 1, timestamp: -1 });
userActivitySchema.index({ userType: 1, action: 1, timestamp: -1 });

// TTL 인덱스 (90일 후 자동 삭제)
userActivitySchema.index({ timestamp: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

// 가상 필드
userActivitySchema.virtual('isRecent').get(function() {
  const now = new Date();
  const diff = now.getTime() - this.timestamp.getTime();
  return diff < 24 * 60 * 60 * 1000; // 24시간 이내
});

// 정적 메서드
userActivitySchema.statics.getUserActivityStats = async function(userId: string, days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const stats = await this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        timestamp: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: null,
        totalActivities: { $sum: 1 },
        successfulActivities: {
          $sum: { $cond: ['$success', 1, 0] }
        },
        failedActivities: {
          $sum: { $cond: ['$success', 0, 1] }
        },
        averageDuration: { $avg: '$duration' },
        uniqueActions: { $addToSet: '$action' },
        uniqueResources: { $addToSet: '$resource' }
      }
    },
    {
      $project: {
        _id: 0,
        totalActivities: 1,
        successfulActivities: 1,
        failedActivities: 1,
        successRate: {
          $multiply: [
            { $divide: ['$successfulActivities', '$totalActivities'] },
            100
          ]
        },
        averageDuration: 1,
        uniqueActionCount: { $size: '$uniqueActions' },
        uniqueResourceCount: { $size: '$uniqueResources' }
      }
    }
  ]);
  
  return stats[0] || {
    totalActivities: 0,
    successfulActivities: 0,
    failedActivities: 0,
    successRate: 0,
    averageDuration: 0,
    uniqueActionCount: 0,
    uniqueResourceCount: 0
  };
};

userActivitySchema.statics.getActivityTrends = async function(days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const trends = await this.aggregate([
    {
      $match: {
        timestamp: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$timestamp' },
          month: { $month: '$timestamp' },
          day: { $dayOfMonth: '$timestamp' }
        },
        count: { $sum: 1 },
        successCount: {
          $sum: { $cond: ['$success', 1, 0] }
        },
        uniqueUsers: { $addToSet: '$userId' }
      }
    },
    {
      $project: {
        _id: 0,
        date: {
          $dateFromParts: {
            year: '$_id.year',
            month: '$_id.month',
            day: '$_id.day'
          }
        },
        count: 1,
        successCount: 1,
        uniqueUserCount: { $size: '$uniqueUsers' }
      }
    },
    {
      $sort: { date: 1 }
    }
  ]);
  
  return trends;
};

userActivitySchema.statics.getTopActions = async function(limit: number = 10) {
  const topActions = await this.aggregate([
    {
      $group: {
        _id: '$action',
        count: { $sum: 1 },
        successCount: {
          $sum: { $cond: ['$success', 1, 0] }
        }
      }
    },
    {
      $project: {
        _id: 0,
        action: '$_id',
        count: 1,
        successCount: 1,
        successRate: {
          $multiply: [
            { $divide: ['$successCount', '$count'] },
            100
          ]
        }
      }
    },
    {
      $sort: { count: -1 }
    },
    {
      $limit: limit
    }
  ]);
  
  return topActions;
};

// 인스턴스 메서드
userActivitySchema.methods.getFormattedDetails = function() {
  return {
    id: this._id,
    userId: this.userId,
    userType: this.userType,
    action: this.action,
    resource: this.resource,
    resourceId: this.resourceId,
    timestamp: this.timestamp,
    success: this.success,
    duration: this.duration,
    metadata: this.metadata,
    isRecent: this.isRecent
  };
};

// 모델 생성 및 내보내기
const UserActivity = mongoose.model<IUserActivity>('UserActivity', userActivitySchema);

export default UserActivity;
