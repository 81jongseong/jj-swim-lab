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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemConfig = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const SystemConfigSchema = new mongoose_1.Schema({
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
                    validator: function (email) {
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
            max: 168
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
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    updatedBy: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});
SystemConfigSchema.index({ isActive: 1 });
SystemConfigSchema.index({ createdAt: -1 });
exports.SystemConfig = mongoose_1.default.model('SystemConfig', SystemConfigSchema);
//# sourceMappingURL=SystemConfig.js.map