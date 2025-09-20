/**
 * @file 시스템 설정 모델
 * @description 전역 시스템 설정을 저장하고 관리하는 모델입니다.
 * @date 2025-09-19
 * @author JJ Swim Lab
 */

import mongoose, { Document, Schema } from 'mongoose';

export interface ISystemConfig extends Document {
  maintenance: {
    enabled: boolean;
    message: string;
    scheduledAt?: Date;
  };
  security: {
    rateLimitEnabled: boolean;
    maxRequestsPerMinute: number;
    bruteForceProtection: boolean;
    requireTwoFactor: boolean;
  };
  notifications: {
    systemAlerts: boolean;
    errorNotifications: boolean;
    performanceAlerts: boolean;
    emailRecipients: string[];
  };
  backup: {
    autoBackup: boolean;
    backupInterval: number; // hours
    retentionDays: number;
    lastBackup?: Date;
  };
  performance: {
    cacheEnabled: boolean;
    compressionEnabled: boolean;
    logLevel: 'error' | 'warn' | 'info' | 'debug';
    maxLogSize: number; // MB
  };
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SystemConfigSchema: Schema = new Schema({
  maintenance: {
    enabled: {
      type: Boolean,
      default: false
    },
    message: {
      type: String,
      default: '시스템 점검 중입니다. 잠시 후 다시 시도해주세요.',
      maxlength: 500
    },
    scheduledAt: {
      type: Date
    }
  },
  security: {
    rateLimitEnabled: {
      type: Boolean,
      default: true
    },
    maxRequestsPerMinute: {
      type: Number,
      default: 100,
      min: 1,
      max: 1000
    },
    bruteForceProtection: {
      type: Boolean,
      default: true
    },
    requireTwoFactor: {
      type: Boolean,
      default: false
    }
  },
  notifications: {
    systemAlerts: {
      type: Boolean,
      default: true
    },
    errorNotifications: {
      type: Boolean,
      default: true
    },
    performanceAlerts: {
      type: Boolean,
      default: true
    },
    emailRecipients: [{
      type: String,
      validate: {
        validator: function(email: string) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        },
        message: '유효한 이메일 주소를 입력해주세요.'
      }
    }]
  },
  backup: {
    autoBackup: {
      type: Boolean,
      default: true
    },
    backupInterval: {
      type: Number,
      default: 24,
      min: 1,
      max: 168 // 1주일
    },
    retentionDays: {
      type: Number,
      default: 30,
      min: 1,
      max: 365
    },
    lastBackup: {
      type: Date
    }
  },
  performance: {
    cacheEnabled: {
      type: Boolean,
      default: true
    },
    compressionEnabled: {
      type: Boolean,
      default: true
    },
    logLevel: {
      type: String,
      enum: ['error', 'warn', 'info', 'debug'],
      default: 'info'
    },
    maxLogSize: {
      type: Number,
      default: 100,
      min: 1,
      max: 1000
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// 인덱스 설정
SystemConfigSchema.index({ isActive: 1 });
SystemConfigSchema.index({ createdAt: -1 });

export const SystemConfig = mongoose.model<ISystemConfig>('SystemConfig', SystemConfigSchema);
