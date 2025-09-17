/**
 * 사용자 활동 추적 서비스
 * 사용자의 모든 활동을 기록하고 분석합니다.
 */

import UserActivity, { IUserActivity } from '../models/UserActivity';
import { Request } from 'express';

// 활동 타입 정의
export enum ActivityType {
  // 인증 관련
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  SIGNUP = 'SIGNUP',
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  
  // 데이터 조회
  VIEW_DASHBOARD = 'VIEW_DASHBOARD',
  VIEW_PROFILE = 'VIEW_PROFILE',
  VIEW_COURSES = 'VIEW_COURSES',
  VIEW_BOOKINGS = 'VIEW_BOOKINGS',
  VIEW_REPORTS = 'VIEW_REPORTS',
  
  // 데이터 생성
  CREATE_COURSE = 'CREATE_COURSE',
  CREATE_BOOKING = 'CREATE_BOOKING',
  CREATE_USER = 'CREATE_USER',
  CREATE_CENTER = 'CREATE_CENTER',
  
  // 데이터 수정
  UPDATE_PROFILE = 'UPDATE_PROFILE',
  UPDATE_COURSE = 'UPDATE_COURSE',
  UPDATE_BOOKING = 'UPDATE_BOOKING',
  UPDATE_USER = 'UPDATE_USER',
  
  // 데이터 삭제
  DELETE_COURSE = 'DELETE_COURSE',
  DELETE_BOOKING = 'DELETE_BOOKING',
  DELETE_USER = 'DELETE_USER',
  
  // 시스템 관리
  SYSTEM_BACKUP = 'SYSTEM_BACKUP',
  SYSTEM_RESTORE = 'SYSTEM_RESTORE',
  SYSTEM_CONFIG = 'SYSTEM_CONFIG',
  
  // 보안 관련
  SECURITY_VIOLATION = 'SECURITY_VIOLATION',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  
  // 기타
  FILE_UPLOAD = 'FILE_UPLOAD',
  FILE_DOWNLOAD = 'FILE_DOWNLOAD',
  EXPORT_DATA = 'EXPORT_DATA',
  IMPORT_DATA = 'IMPORT_DATA'
}

// 리소스 타입 정의
export enum ResourceType {
  USER = 'USER',
  COURSE = 'COURSE',
  BOOKING = 'BOOKING',
  CENTER = 'CENTER',
  PAYMENT = 'PAYMENT',
  NOTICE = 'NOTICE',
  SYSTEM = 'SYSTEM',
  FILE = 'FILE',
  REPORT = 'REPORT',
  DASHBOARD = 'DASHBOARD'
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

class UserActivityService {
  private static instance: UserActivityService;

  private constructor() {}

  public static getInstance(): UserActivityService {
    if (!UserActivityService.instance) {
      UserActivityService.instance = new UserActivityService();
    }
    return UserActivityService.instance;
  }

  /**
   * 사용자 활동 기록
   */
  public async logActivity(data: ActivityData, req?: Request): Promise<IUserActivity> {
    try {
      const activityData = {
        userId: data.userId,
        userType: data.userType as any,
        action: data.action,
        resource: data.resource,
        resourceId: data.resourceId,
        details: data.details || {},
        ip: req?.ip || req?.connection?.remoteAddress || 'unknown',
        userAgent: req?.get('User-Agent'),
        sessionId: data.sessionId || (req as any)?.sessionID,
        success: data.success !== false,
        errorMessage: data.errorMessage,
        duration: data.duration,
        metadata: this.extractMetadata(req)
      };

      const activity = new UserActivity(activityData);
      await activity.save();

      console.log(`📝 사용자 활동 기록: ${data.userId} - ${data.action} - ${data.resource}`);
      return activity;
    } catch (error) {
      console.error('사용자 활동 기록 실패:', error);
      throw error;
    }
  }

  /**
   * 요청에서 메타데이터 추출
   */
  private extractMetadata(req?: Request): any {
    if (!req) return {};

    const userAgent = req.get('User-Agent') || '';
    
    return {
      browser: this.parseBrowser(userAgent),
      os: this.parseOS(userAgent),
      device: this.parseDevice(userAgent),
      location: req.get('X-Forwarded-For') || req.ip
    };
  }

  /**
   * 브라우저 정보 파싱
   */
  private parseBrowser(userAgent: string): string {
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    if (userAgent.includes('Opera')) return 'Opera';
    return 'Unknown';
  }

  /**
   * 운영체제 정보 파싱
   */
  private parseOS(userAgent: string): string {
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac')) return 'macOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iOS')) return 'iOS';
    return 'Unknown';
  }

  /**
   * 디바이스 정보 파싱
   */
  private parseDevice(userAgent: string): string {
    if (userAgent.includes('Mobile')) return 'Mobile';
    if (userAgent.includes('Tablet')) return 'Tablet';
    return 'Desktop';
  }

  /**
   * 사용자 활동 통계 조회
   */
  public async getUserActivityStats(userId: string, days: number = 30): Promise<any> {
    try {
      const stats = await (UserActivity as any).getUserActivityStats(userId, days);
      return stats;
    } catch (error) {
      console.error('사용자 활동 통계 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 활동 트렌드 조회
   */
  public async getActivityTrends(days: number = 30): Promise<any[]> {
    try {
      const trends = await (UserActivity as any).getActivityTrends(days);
      return trends;
    } catch (error) {
      console.error('활동 트렌드 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 상위 활동 조회
   */
  public async getTopActions(limit: number = 10): Promise<any[]> {
    try {
      const topActions = await (UserActivity as any).getTopActions(limit);
      return topActions;
    } catch (error) {
      console.error('상위 활동 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 사용자별 활동 조회
   */
  public async getUserActivities(
    userId: string,
    page: number = 1,
    limit: number = 50,
    filters: any = {}
  ): Promise<{ activities: IUserActivity[]; total: number; pages: number }> {
    try {
      const query: any = { userId };
      
      // 필터 적용
      if (filters.action) query.action = filters.action;
      if (filters.resource) query.resource = filters.resource;
      if (filters.success !== undefined) query.success = filters.success;
      if (filters.startDate) query.timestamp = { $gte: filters.startDate };
      if (filters.endDate) {
        query.timestamp = { ...query.timestamp, $lte: filters.endDate };
      }

      const skip = (page - 1) * limit;
      
      const [activities, total] = await Promise.all([
        UserActivity.find(query)
          .sort({ timestamp: -1 })
          .skip(skip)
          .limit(limit)
          .populate('userId', 'name email userType'),
        UserActivity.countDocuments(query)
      ]);

      return {
        activities,
        total,
        pages: Math.ceil(total / limit)
      };
    } catch (error) {
      console.error('사용자 활동 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 보안 이벤트 기록
   */
  public async logSecurityEvent(
    userId: string,
    userType: string,
    event: string,
    details: any,
    req?: Request
  ): Promise<IUserActivity> {
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

  /**
   * 권한 거부 이벤트 기록
   */
  public async logPermissionDenied(
    userId: string,
    userType: string,
    resource: ResourceType,
    action: string,
    req?: Request
  ): Promise<IUserActivity> {
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

  /**
   * 활동 요약 생성
   */
  public async generateActivitySummary(userId: string, days: number = 7): Promise<any> {
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
    } catch (error) {
      console.error('활동 요약 생성 실패:', error);
      throw error;
    }
  }

  /**
   * 의심스러운 활동 감지
   */
  public async detectSuspiciousActivity(userId: string, hours: number = 24): Promise<any[]> {
    try {
      const startTime = new Date();
      startTime.setHours(startTime.getHours() - hours);
      
      const activities = await UserActivity.find({
        userId,
        timestamp: { $gte: startTime }
      }).sort({ timestamp: -1 });

      const suspiciousActivities: any[] = [];
      
      // 실패한 로그인 시도가 많은 경우
      const failedLogins = activities.filter(a => 
        a.action === ActivityType.LOGIN && !a.success
      );
      
      if (failedLogins.length >= 5) {
        suspiciousActivities.push({
          type: 'MULTIPLE_FAILED_LOGINS',
          count: failedLogins.length,
          severity: 'HIGH',
          description: `${failedLogins.length}번의 실패한 로그인 시도`
        });
      }
      
      // 권한 거부가 많은 경우
      const permissionDenied = activities.filter(a => 
        a.action === ActivityType.PERMISSION_DENIED
      );
      
      if (permissionDenied.length >= 10) {
        suspiciousActivities.push({
          type: 'MULTIPLE_PERMISSION_DENIED',
          count: permissionDenied.length,
          severity: 'MEDIUM',
          description: `${permissionDenied.length}번의 권한 거부`
        });
      }
      
      // 비정상적인 시간대 활동
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
    } catch (error) {
      console.error('의심스러운 활동 감지 실패:', error);
      throw error;
    }
  }
}

export default UserActivityService;
