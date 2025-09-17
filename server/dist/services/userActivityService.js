"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResourceType = exports.ActivityType = void 0;
const UserActivity_1 = __importDefault(require("../models/UserActivity"));
var ActivityType;
(function (ActivityType) {
    ActivityType["LOGIN"] = "LOGIN";
    ActivityType["LOGOUT"] = "LOGOUT";
    ActivityType["SIGNUP"] = "SIGNUP";
    ActivityType["PASSWORD_CHANGE"] = "PASSWORD_CHANGE";
    ActivityType["VIEW_DASHBOARD"] = "VIEW_DASHBOARD";
    ActivityType["VIEW_PROFILE"] = "VIEW_PROFILE";
    ActivityType["VIEW_COURSES"] = "VIEW_COURSES";
    ActivityType["VIEW_BOOKINGS"] = "VIEW_BOOKINGS";
    ActivityType["VIEW_REPORTS"] = "VIEW_REPORTS";
    ActivityType["CREATE_COURSE"] = "CREATE_COURSE";
    ActivityType["CREATE_BOOKING"] = "CREATE_BOOKING";
    ActivityType["CREATE_USER"] = "CREATE_USER";
    ActivityType["CREATE_CENTER"] = "CREATE_CENTER";
    ActivityType["UPDATE_PROFILE"] = "UPDATE_PROFILE";
    ActivityType["UPDATE_COURSE"] = "UPDATE_COURSE";
    ActivityType["UPDATE_BOOKING"] = "UPDATE_BOOKING";
    ActivityType["UPDATE_USER"] = "UPDATE_USER";
    ActivityType["DELETE_COURSE"] = "DELETE_COURSE";
    ActivityType["DELETE_BOOKING"] = "DELETE_BOOKING";
    ActivityType["DELETE_USER"] = "DELETE_USER";
    ActivityType["SYSTEM_BACKUP"] = "SYSTEM_BACKUP";
    ActivityType["SYSTEM_RESTORE"] = "SYSTEM_RESTORE";
    ActivityType["SYSTEM_CONFIG"] = "SYSTEM_CONFIG";
    ActivityType["SECURITY_VIOLATION"] = "SECURITY_VIOLATION";
    ActivityType["PERMISSION_DENIED"] = "PERMISSION_DENIED";
    ActivityType["FILE_UPLOAD"] = "FILE_UPLOAD";
    ActivityType["FILE_DOWNLOAD"] = "FILE_DOWNLOAD";
    ActivityType["EXPORT_DATA"] = "EXPORT_DATA";
    ActivityType["IMPORT_DATA"] = "IMPORT_DATA";
})(ActivityType || (exports.ActivityType = ActivityType = {}));
var ResourceType;
(function (ResourceType) {
    ResourceType["USER"] = "USER";
    ResourceType["COURSE"] = "COURSE";
    ResourceType["BOOKING"] = "BOOKING";
    ResourceType["CENTER"] = "CENTER";
    ResourceType["PAYMENT"] = "PAYMENT";
    ResourceType["NOTICE"] = "NOTICE";
    ResourceType["SYSTEM"] = "SYSTEM";
    ResourceType["FILE"] = "FILE";
    ResourceType["REPORT"] = "REPORT";
    ResourceType["DASHBOARD"] = "DASHBOARD";
})(ResourceType || (exports.ResourceType = ResourceType = {}));
class UserActivityService {
    constructor() { }
    static getInstance() {
        if (!UserActivityService.instance) {
            UserActivityService.instance = new UserActivityService();
        }
        return UserActivityService.instance;
    }
    async logActivity(data, req) {
        try {
            const activityData = {
                userId: data.userId,
                userType: data.userType,
                action: data.action,
                resource: data.resource,
                resourceId: data.resourceId,
                details: data.details || {},
                ip: req?.ip || req?.connection?.remoteAddress || 'unknown',
                userAgent: req?.get('User-Agent'),
                sessionId: data.sessionId || req?.sessionID,
                success: data.success !== false,
                errorMessage: data.errorMessage,
                duration: data.duration,
                metadata: this.extractMetadata(req)
            };
            const activity = new UserActivity_1.default(activityData);
            await activity.save();
            console.log(`📝 사용자 활동 기록: ${data.userId} - ${data.action} - ${data.resource}`);
            return activity;
        }
        catch (error) {
            console.error('사용자 활동 기록 실패:', error);
            throw error;
        }
    }
    extractMetadata(req) {
        if (!req)
            return {};
        const userAgent = req.get('User-Agent') || '';
        return {
            browser: this.parseBrowser(userAgent),
            os: this.parseOS(userAgent),
            device: this.parseDevice(userAgent),
            location: req.get('X-Forwarded-For') || req.ip
        };
    }
    parseBrowser(userAgent) {
        if (userAgent.includes('Chrome'))
            return 'Chrome';
        if (userAgent.includes('Firefox'))
            return 'Firefox';
        if (userAgent.includes('Safari'))
            return 'Safari';
        if (userAgent.includes('Edge'))
            return 'Edge';
        if (userAgent.includes('Opera'))
            return 'Opera';
        return 'Unknown';
    }
    parseOS(userAgent) {
        if (userAgent.includes('Windows'))
            return 'Windows';
        if (userAgent.includes('Mac'))
            return 'macOS';
        if (userAgent.includes('Linux'))
            return 'Linux';
        if (userAgent.includes('Android'))
            return 'Android';
        if (userAgent.includes('iOS'))
            return 'iOS';
        return 'Unknown';
    }
    parseDevice(userAgent) {
        if (userAgent.includes('Mobile'))
            return 'Mobile';
        if (userAgent.includes('Tablet'))
            return 'Tablet';
        return 'Desktop';
    }
    async getUserActivityStats(userId, days = 30) {
        try {
            const stats = await UserActivity_1.default.getUserActivityStats(userId, days);
            return stats;
        }
        catch (error) {
            console.error('사용자 활동 통계 조회 실패:', error);
            throw error;
        }
    }
    async getActivityTrends(days = 30) {
        try {
            const trends = await UserActivity_1.default.getActivityTrends(days);
            return trends;
        }
        catch (error) {
            console.error('활동 트렌드 조회 실패:', error);
            throw error;
        }
    }
    async getTopActions(limit = 10) {
        try {
            const topActions = await UserActivity_1.default.getTopActions(limit);
            return topActions;
        }
        catch (error) {
            console.error('상위 활동 조회 실패:', error);
            throw error;
        }
    }
    async getUserActivities(userId, page = 1, limit = 50, filters = {}) {
        try {
            const query = { userId };
            if (filters.action)
                query.action = filters.action;
            if (filters.resource)
                query.resource = filters.resource;
            if (filters.success !== undefined)
                query.success = filters.success;
            if (filters.startDate)
                query.timestamp = { $gte: filters.startDate };
            if (filters.endDate) {
                query.timestamp = { ...query.timestamp, $lte: filters.endDate };
            }
            const skip = (page - 1) * limit;
            const [activities, total] = await Promise.all([
                UserActivity_1.default.find(query)
                    .sort({ timestamp: -1 })
                    .skip(skip)
                    .limit(limit)
                    .populate('userId', 'name email userType'),
                UserActivity_1.default.countDocuments(query)
            ]);
            return {
                activities,
                total,
                pages: Math.ceil(total / limit)
            };
        }
        catch (error) {
            console.error('사용자 활동 조회 실패:', error);
            throw error;
        }
    }
    async logSecurityEvent(userId, userType, event, details, req) {
        return this.logActivity({
            userId,
            userType,
            action: ActivityType.SECURITY_VIOLATION,
            resource: ResourceType.SYSTEM,
            details: { event, ...details },
            success: false,
            errorMessage: event
        }, req);
    }
    async logPermissionDenied(userId, userType, resource, action, req) {
        return this.logActivity({
            userId,
            userType,
            action: ActivityType.PERMISSION_DENIED,
            resource,
            details: { attemptedAction: action },
            success: false,
            errorMessage: 'Permission denied'
        }, req);
    }
    async generateActivitySummary(userId, days = 7) {
        try {
            const stats = await this.getUserActivityStats(userId, days);
            const activities = await this.getUserActivities(userId, 1, 10);
            return {
                userId,
                period: `${days}일`,
                summary: {
                    totalActivities: stats.totalActivities,
                    successRate: Math.round(stats.successRate * 100) / 100,
                    averageDuration: Math.round(stats.averageDuration || 0),
                    uniqueActions: stats.uniqueActionCount,
                    uniqueResources: stats.uniqueResourceCount
                },
                recentActivities: activities.activities.slice(0, 5).map(activity => ({
                    action: activity.action,
                    resource: activity.resource,
                    timestamp: activity.timestamp,
                    success: activity.success
                }))
            };
        }
        catch (error) {
            console.error('활동 요약 생성 실패:', error);
            throw error;
        }
    }
    async detectSuspiciousActivity(userId, hours = 24) {
        try {
            const startTime = new Date();
            startTime.setHours(startTime.getHours() - hours);
            const activities = await UserActivity_1.default.find({
                userId,
                timestamp: { $gte: startTime }
            }).sort({ timestamp: -1 });
            const suspiciousActivities = [];
            const failedLogins = activities.filter(a => a.action === ActivityType.LOGIN && !a.success);
            if (failedLogins.length >= 5) {
                suspiciousActivities.push({
                    type: 'MULTIPLE_FAILED_LOGINS',
                    count: failedLogins.length,
                    severity: 'HIGH',
                    description: `${failedLogins.length}번의 실패한 로그인 시도`
                });
            }
            const permissionDenied = activities.filter(a => a.action === ActivityType.PERMISSION_DENIED);
            if (permissionDenied.length >= 10) {
                suspiciousActivities.push({
                    type: 'MULTIPLE_PERMISSION_DENIED',
                    count: permissionDenied.length,
                    severity: 'MEDIUM',
                    description: `${permissionDenied.length}번의 권한 거부`
                });
            }
            const nightActivities = activities.filter(a => {
                const hour = a.timestamp.getHours();
                return hour >= 22 || hour <= 6;
            });
            if (nightActivities.length >= 20) {
                suspiciousActivities.push({
                    type: 'NIGHTTIME_ACTIVITY',
                    count: nightActivities.length,
                    severity: 'LOW',
                    description: `야간 시간대 ${nightActivities.length}번의 활동`
                });
            }
            return suspiciousActivities;
        }
        catch (error) {
            console.error('의심스러운 활동 감지 실패:', error);
            throw error;
        }
    }
}
exports.default = UserActivityService;
//# sourceMappingURL=userActivityService.js.map