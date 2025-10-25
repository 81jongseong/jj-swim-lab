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
const mongoose_1 = __importStar(require("mongoose"));
const userActivitySchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    userType: {
        type: String,
        enum: ['superAdmin', 'centerAdmin', 'center-admin', 'instructor', 'student', 'guest'],
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
        type: mongoose_1.Schema.Types.Mixed,
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
userActivitySchema.index({ userId: 1, timestamp: -1 });
userActivitySchema.index({ action: 1, timestamp: -1 });
userActivitySchema.index({ resource: 1, timestamp: -1 });
userActivitySchema.index({ success: 1, timestamp: -1 });
userActivitySchema.index({ userType: 1, timestamp: -1 });
userActivitySchema.index({ userId: 1, action: 1, timestamp: -1 });
userActivitySchema.index({ userType: 1, action: 1, timestamp: -1 });
userActivitySchema.index({ timestamp: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });
userActivitySchema.virtual('isRecent').get(function () {
    const now = new Date();
    const diff = now.getTime() - this.timestamp.getTime();
    return diff < 24 * 60 * 60 * 1000;
});
userActivitySchema.statics.getUserActivityStats = async function (userId, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const stats = await this.aggregate([
        {
            $match: {
                userId: new mongoose_1.default.Types.ObjectId(userId),
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
userActivitySchema.statics.getActivityTrends = async function (days = 30) {
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
userActivitySchema.statics.getTopActions = async function (limit = 10) {
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
userActivitySchema.methods.getFormattedDetails = function () {
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
const UserActivity = mongoose_1.default.model('UserActivity', userActivitySchema);
exports.default = UserActivity;
//# sourceMappingURL=UserActivity.js.map