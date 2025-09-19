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
exports.trackDataExport = exports.trackFileUpload = exports.trackSpecificActivity = exports.trackSecurityEvents = exports.trackUserActivity = void 0;
const userActivityService_1 = __importStar(require("../services/userActivityService"));
const activityService = userActivityService_1.default.getInstance();
const trackUserActivity = (req, res, next) => {
    const startTime = Date.now();
    res.on('finish', () => {
        try {
            const user = req.user;
            if (!user)
                return;
            const duration = Date.now() - startTime;
            const action = mapMethodToAction(req.method, req.url);
            const resource = mapUrlToResource(req.url);
            activityService.logActivity({
                userId: user.id,
                userType: user.userType,
                action,
                resource,
                resourceId: extractResourceId(req.url),
                details: {
                    method: req.method,
                    url: req.url,
                    statusCode: res.statusCode,
                    query: req.query,
                    params: req.params
                },
                success: res.statusCode < 400,
                errorMessage: res.statusCode >= 400 ? `HTTP ${res.statusCode}` : undefined,
                duration,
                sessionId: req.sessionID
            }, req);
        }
        catch (error) {
            console.error('사용자 활동 추적 실패:', error);
        }
    });
    next();
};
exports.trackUserActivity = trackUserActivity;
function mapMethodToAction(method, url) {
    if (url.includes('/auth/login'))
        return userActivityService_1.ActivityType.LOGIN;
    if (url.includes('/auth/logout'))
        return userActivityService_1.ActivityType.LOGOUT;
    if (url.includes('/auth/signup'))
        return userActivityService_1.ActivityType.SIGNUP;
    if (url.includes('/auth/password'))
        return userActivityService_1.ActivityType.PASSWORD_CHANGE;
    if (url.includes('/dashboard'))
        return userActivityService_1.ActivityType.VIEW_DASHBOARD;
    if (url.includes('/profile'))
        return userActivityService_1.ActivityType.VIEW_PROFILE;
    if (method === 'GET') {
        if (url.includes('/courses'))
            return userActivityService_1.ActivityType.VIEW_COURSES;
        if (url.includes('/bookings'))
            return userActivityService_1.ActivityType.VIEW_BOOKINGS;
        if (url.includes('/reports'))
            return userActivityService_1.ActivityType.VIEW_REPORTS;
        if (url.includes('/users'))
            return userActivityService_1.ActivityType.VIEW_DASHBOARD;
        return userActivityService_1.ActivityType.VIEW_DASHBOARD;
    }
    if (method === 'POST') {
        if (url.includes('/courses'))
            return userActivityService_1.ActivityType.CREATE_COURSE;
        if (url.includes('/bookings'))
            return userActivityService_1.ActivityType.CREATE_BOOKING;
        if (url.includes('/users'))
            return userActivityService_1.ActivityType.CREATE_USER;
        if (url.includes('/centers'))
            return userActivityService_1.ActivityType.CREATE_CENTER;
        return userActivityService_1.ActivityType.CREATE_COURSE;
    }
    if (method === 'PUT' || method === 'PATCH') {
        if (url.includes('/profile'))
            return userActivityService_1.ActivityType.UPDATE_PROFILE;
        if (url.includes('/courses'))
            return userActivityService_1.ActivityType.UPDATE_COURSE;
        if (url.includes('/bookings'))
            return userActivityService_1.ActivityType.UPDATE_BOOKING;
        if (url.includes('/users'))
            return userActivityService_1.ActivityType.UPDATE_USER;
        return userActivityService_1.ActivityType.UPDATE_COURSE;
    }
    if (method === 'DELETE') {
        if (url.includes('/courses'))
            return userActivityService_1.ActivityType.DELETE_COURSE;
        if (url.includes('/bookings'))
            return userActivityService_1.ActivityType.DELETE_BOOKING;
        if (url.includes('/users'))
            return userActivityService_1.ActivityType.DELETE_USER;
        return userActivityService_1.ActivityType.DELETE_COURSE;
    }
    return userActivityService_1.ActivityType.VIEW_DASHBOARD;
}
function mapUrlToResource(url) {
    if (url.includes('/users'))
        return userActivityService_1.ResourceType.USER;
    if (url.includes('/courses'))
        return userActivityService_1.ResourceType.COURSE;
    if (url.includes('/bookings'))
        return userActivityService_1.ResourceType.BOOKING;
    if (url.includes('/centers'))
        return userActivityService_1.ResourceType.CENTER;
    if (url.includes('/payments'))
        return userActivityService_1.ResourceType.PAYMENT;
    if (url.includes('/notices'))
        return userActivityService_1.ResourceType.NOTICE;
    if (url.includes('/reports'))
        return userActivityService_1.ResourceType.REPORT;
    if (url.includes('/dashboard'))
        return userActivityService_1.ResourceType.DASHBOARD;
    if (url.includes('/uploads') || url.includes('/files'))
        return userActivityService_1.ResourceType.FILE;
    if (url.includes('/system') || url.includes('/backup') || url.includes('/monitoring')) {
        return userActivityService_1.ResourceType.SYSTEM;
    }
    return userActivityService_1.ResourceType.DASHBOARD;
}
function extractResourceId(url) {
    const segments = url.split('/');
    const lastSegment = segments[segments.length - 1];
    if (/^[0-9a-fA-F]{24}$/.test(lastSegment)) {
        return lastSegment;
    }
    return undefined;
}
const trackSecurityEvents = (req, res, next) => {
    const originalSend = res.send;
    res.send = function (data) {
        const user = req.user;
        if (res.statusCode === 401) {
            if (user) {
                activityService.logSecurityEvent(user.id, user.userType, 'UNAUTHORIZED_ACCESS', {
                    method: req.method,
                    url: req.url,
                    ip: req.ip,
                    userAgent: req.get('User-Agent')
                }, req);
            }
        }
        else if (res.statusCode === 403) {
            if (user) {
                activityService.logPermissionDenied(user.id, user.userType, mapUrlToResource(req.url), req.method, req);
            }
        }
        else if (res.statusCode >= 500) {
            if (user) {
                activityService.logSecurityEvent(user.id, user.userType, 'SERVER_ERROR', {
                    method: req.method,
                    url: req.url,
                    statusCode: res.statusCode,
                    error: data
                }, req);
            }
        }
        return originalSend.call(this, data);
    };
    next();
};
exports.trackSecurityEvents = trackSecurityEvents;
const trackSpecificActivity = (action, resource) => {
    return (req, res, next) => {
        const startTime = Date.now();
        res.on('finish', () => {
            try {
                const user = req.user;
                if (!user)
                    return;
                const duration = Date.now() - startTime;
                activityService.logActivity({
                    userId: user.id,
                    userType: user.userType,
                    action,
                    resource,
                    resourceId: extractResourceId(req.url),
                    details: {
                        method: req.method,
                        url: req.url,
                        statusCode: res.statusCode,
                        body: req.body
                    },
                    success: res.statusCode < 400,
                    duration,
                    sessionId: req.sessionID
                }, req);
            }
            catch (error) {
                console.error('특정 활동 추적 실패:', error);
            }
        });
        next();
    };
};
exports.trackSpecificActivity = trackSpecificActivity;
const trackFileUpload = (req, res, next) => {
    const startTime = Date.now();
    res.on('finish', () => {
        try {
            const user = req.user;
            if (!user)
                return;
            const duration = Date.now() - startTime;
            const files = req.files;
            activityService.logActivity({
                userId: user.id,
                userType: user.userType,
                action: userActivityService_1.ActivityType.FILE_UPLOAD,
                resource: userActivityService_1.ResourceType.FILE,
                details: {
                    fileCount: files?.length || 0,
                    fileNames: files?.map(f => f.originalname) || [],
                    fileSizes: files?.map(f => f.size) || [],
                    uploadPath: req.url
                },
                success: res.statusCode < 400,
                duration,
                sessionId: req.sessionID
            }, req);
        }
        catch (error) {
            console.error('파일 업로드 추적 실패:', error);
        }
    });
    next();
};
exports.trackFileUpload = trackFileUpload;
const trackDataExport = (req, res, next) => {
    const startTime = Date.now();
    res.on('finish', () => {
        try {
            const user = req.user;
            if (!user)
                return;
            const duration = Date.now() - startTime;
            activityService.logActivity({
                userId: user.id,
                userType: user.userType,
                action: userActivityService_1.ActivityType.EXPORT_DATA,
                resource: userActivityService_1.ResourceType.REPORT,
                details: {
                    exportType: req.query.format || 'unknown',
                    filters: req.query,
                    url: req.url
                },
                success: res.statusCode < 400,
                duration,
                sessionId: req.sessionID
            }, req);
        }
        catch (error) {
            console.error('데이터 내보내기 추적 실패:', error);
        }
    });
    next();
};
exports.trackDataExport = trackDataExport;
//# sourceMappingURL=userActivity.js.map