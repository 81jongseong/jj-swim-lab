import { IUserActivity } from '../models/UserActivity';
import { Request } from 'express';
export declare enum ActivityType {
    LOGIN = "LOGIN",
    LOGOUT = "LOGOUT",
    SIGNUP = "SIGNUP",
    PASSWORD_CHANGE = "PASSWORD_CHANGE",
    VIEW_DASHBOARD = "VIEW_DASHBOARD",
    VIEW_PROFILE = "VIEW_PROFILE",
    VIEW_COURSES = "VIEW_COURSES",
    VIEW_BOOKINGS = "VIEW_BOOKINGS",
    VIEW_REPORTS = "VIEW_REPORTS",
    CREATE_COURSE = "CREATE_COURSE",
    CREATE_BOOKING = "CREATE_BOOKING",
    CREATE_USER = "CREATE_USER",
    CREATE_CENTER = "CREATE_CENTER",
    UPDATE_PROFILE = "UPDATE_PROFILE",
    UPDATE_COURSE = "UPDATE_COURSE",
    UPDATE_BOOKING = "UPDATE_BOOKING",
    UPDATE_USER = "UPDATE_USER",
    DELETE_COURSE = "DELETE_COURSE",
    DELETE_BOOKING = "DELETE_BOOKING",
    DELETE_USER = "DELETE_USER",
    SYSTEM_BACKUP = "SYSTEM_BACKUP",
    SYSTEM_RESTORE = "SYSTEM_RESTORE",
    SYSTEM_CONFIG = "SYSTEM_CONFIG",
    SECURITY_VIOLATION = "SECURITY_VIOLATION",
    PERMISSION_DENIED = "PERMISSION_DENIED",
    FILE_UPLOAD = "FILE_UPLOAD",
    FILE_DOWNLOAD = "FILE_DOWNLOAD",
    EXPORT_DATA = "EXPORT_DATA",
    IMPORT_DATA = "IMPORT_DATA"
}
export declare enum ResourceType {
    USER = "USER",
    COURSE = "COURSE",
    BOOKING = "BOOKING",
    CENTER = "CENTER",
    PAYMENT = "PAYMENT",
    NOTICE = "NOTICE",
    SYSTEM = "SYSTEM",
    FILE = "FILE",
    REPORT = "REPORT",
    DASHBOARD = "DASHBOARD"
}
interface ActivityData {
    userId: string;
    userType: string;
    action: ActivityType;
    resource: ResourceType;
    resourceId?: string;
    details?: any;
    success?: boolean;
    errorMessage?: string;
    duration?: number;
    sessionId?: string;
}
declare class UserActivityService {
    private static instance;
    private constructor();
    static getInstance(): UserActivityService;
    logActivity(data: ActivityData, req?: Request): Promise<IUserActivity>;
    private extractMetadata;
    private parseBrowser;
    private parseOS;
    private parseDevice;
    getUserActivityStats(userId: string, days?: number): Promise<any>;
    getActivityTrends(days?: number): Promise<any[]>;
    getTopActions(limit?: number): Promise<any[]>;
    getUserActivities(userId: string, page?: number, limit?: number, filters?: any): Promise<{
        activities: IUserActivity[];
        total: number;
        pages: number;
    }>;
    logSecurityEvent(userId: string, userType: string, event: string, details: any, req?: Request): Promise<IUserActivity>;
    logPermissionDenied(userId: string, userType: string, resource: ResourceType, action: string, req?: Request): Promise<IUserActivity>;
    generateActivitySummary(userId: string, days?: number): Promise<any>;
    detectSuspiciousActivity(userId: string, hours?: number): Promise<any[]>;
}
export default UserActivityService;
//# sourceMappingURL=userActivityService.d.ts.map