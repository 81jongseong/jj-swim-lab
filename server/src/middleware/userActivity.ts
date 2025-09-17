/**
 * 사용자 활동 추적 미들웨어
 * 모든 API 요청을 추적하고 사용자 활동을 기록합니다.
 */

import { Request, Response, NextFunction } from 'express';
import UserActivityService, { ActivityType, ResourceType } from '../services/userActivityService';

const activityService = UserActivityService.getInstance();

/**
 * 사용자 활동 추적 미들웨어
 */
export const trackUserActivity = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();
  
  // 응답 완료 시 활동 기록
  res.on('finish', () => {
    try {
      const user = (req as any).user;
      if (!user) return; // 인증되지 않은 사용자는 추적하지 않음
      
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
        sessionId: (req as any).sessionID
      }, req);
    } catch (error) {
      console.error('사용자 활동 추적 실패:', error);
    }
  });

  next();
};

/**
 * HTTP 메서드와 URL을 활동 타입으로 매핑
 */
function mapMethodToAction(method: string, url: string): ActivityType {
  // 인증 관련
  if (url.includes('/auth/login')) return ActivityType.LOGIN;
  if (url.includes('/auth/logout')) return ActivityType.LOGOUT;
  if (url.includes('/auth/signup')) return ActivityType.SIGNUP;
  if (url.includes('/auth/password')) return ActivityType.PASSWORD_CHANGE;
  
  // 대시보드 및 프로필
  if (url.includes('/dashboard')) return ActivityType.VIEW_DASHBOARD;
  if (url.includes('/profile')) return ActivityType.VIEW_PROFILE;
  
  // 데이터 조회
  if (method === 'GET') {
    if (url.includes('/courses')) return ActivityType.VIEW_COURSES;
    if (url.includes('/bookings')) return ActivityType.VIEW_BOOKINGS;
    if (url.includes('/reports')) return ActivityType.VIEW_REPORTS;
    if (url.includes('/users')) return ActivityType.VIEW_DASHBOARD;
    return ActivityType.VIEW_DASHBOARD;
  }
  
  // 데이터 생성
  if (method === 'POST') {
    if (url.includes('/courses')) return ActivityType.CREATE_COURSE;
    if (url.includes('/bookings')) return ActivityType.CREATE_BOOKING;
    if (url.includes('/users')) return ActivityType.CREATE_USER;
    if (url.includes('/centers')) return ActivityType.CREATE_CENTER;
    return ActivityType.CREATE_COURSE;
  }
  
  // 데이터 수정
  if (method === 'PUT' || method === 'PATCH') {
    if (url.includes('/profile')) return ActivityType.UPDATE_PROFILE;
    if (url.includes('/courses')) return ActivityType.UPDATE_COURSE;
    if (url.includes('/bookings')) return ActivityType.UPDATE_BOOKING;
    if (url.includes('/users')) return ActivityType.UPDATE_USER;
    return ActivityType.UPDATE_COURSE;
  }
  
  // 데이터 삭제
  if (method === 'DELETE') {
    if (url.includes('/courses')) return ActivityType.DELETE_COURSE;
    if (url.includes('/bookings')) return ActivityType.DELETE_BOOKING;
    if (url.includes('/users')) return ActivityType.DELETE_USER;
    return ActivityType.DELETE_COURSE;
  }
  
  return ActivityType.VIEW_DASHBOARD;
}

/**
 * URL을 리소스 타입으로 매핑
 */
function mapUrlToResource(url: string): ResourceType {
  if (url.includes('/users')) return ResourceType.USER;
  if (url.includes('/courses')) return ResourceType.COURSE;
  if (url.includes('/bookings')) return ResourceType.BOOKING;
  if (url.includes('/centers')) return ResourceType.CENTER;
  if (url.includes('/payments')) return ResourceType.PAYMENT;
  if (url.includes('/notices')) return ResourceType.NOTICE;
  if (url.includes('/reports')) return ResourceType.REPORT;
  if (url.includes('/dashboard')) return ResourceType.DASHBOARD;
  if (url.includes('/uploads') || url.includes('/files')) return ResourceType.FILE;
  if (url.includes('/system') || url.includes('/backup') || url.includes('/monitoring')) {
    return ResourceType.SYSTEM;
  }
  
  return ResourceType.DASHBOARD;
}

/**
 * URL에서 리소스 ID 추출
 */
function extractResourceId(url: string): string | undefined {
  const segments = url.split('/');
  const lastSegment = segments[segments.length - 1];
  
  // MongoDB ObjectId 형식인지 확인
  if (/^[0-9a-fA-F]{24}$/.test(lastSegment)) {
    return lastSegment;
  }
  
  return undefined;
}

/**
 * 보안 이벤트 추적 미들웨어
 */
export const trackSecurityEvents = (req: Request, res: Response, next: NextFunction): void => {
  const originalSend = res.send;
  
  res.send = function(data) {
    const user = (req as any).user;
    
    // 보안 관련 상태 코드 추적
    if (res.statusCode === 401) {
      if (user) {
        activityService.logSecurityEvent(
          user.id,
          user.userType,
          'UNAUTHORIZED_ACCESS',
          {
            method: req.method,
            url: req.url,
            ip: req.ip,
            userAgent: req.get('User-Agent')
          },
          req
        );
      }
    } else if (res.statusCode === 403) {
      if (user) {
        activityService.logPermissionDenied(
          user.id,
          user.userType,
          mapUrlToResource(req.url),
          req.method,
          req
        );
      }
    } else if (res.statusCode >= 500) {
      if (user) {
        activityService.logSecurityEvent(
          user.id,
          user.userType,
          'SERVER_ERROR',
          {
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            error: data
          },
          req
        );
      }
    }
    
    return originalSend.call(this, data);
  };
  
  next();
};

/**
 * 특정 활동만 추적하는 미들웨어
 */
export const trackSpecificActivity = (action: ActivityType, resource: ResourceType) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const startTime = Date.now();
    
    res.on('finish', () => {
      try {
        const user = (req as any).user;
        if (!user) return;
        
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
          sessionId: (req as any).sessionID
        }, req);
      } catch (error) {
        console.error('특정 활동 추적 실패:', error);
      }
    });
    
    next();
  };
};

/**
 * 파일 업로드 활동 추적
 */
export const trackFileUpload = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    try {
      const user = (req as any).user;
      if (!user) return;
      
      const duration = Date.now() - startTime;
      const files = req.files as any[];
      
      activityService.logActivity({
        userId: user.id,
        userType: user.userType,
        action: ActivityType.FILE_UPLOAD,
        resource: ResourceType.FILE,
        details: {
          fileCount: files?.length || 0,
          fileNames: files?.map(f => f.originalname) || [],
          fileSizes: files?.map(f => f.size) || [],
          uploadPath: req.url
        },
        success: res.statusCode < 400,
        duration,
        sessionId: (req as any).sessionID
      }, req);
    } catch (error) {
      console.error('파일 업로드 추적 실패:', error);
    }
  });
  
  next();
};

/**
 * 데이터 내보내기 활동 추적
 */
export const trackDataExport = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    try {
      const user = (req as any).user;
      if (!user) return;
      
      const duration = Date.now() - startTime;
      
      activityService.logActivity({
        userId: user.id,
        userType: user.userType,
        action: ActivityType.EXPORT_DATA,
        resource: ResourceType.REPORT,
        details: {
          exportType: req.query.format || 'unknown',
          filters: req.query,
          url: req.url
        },
        success: res.statusCode < 400,
        duration,
        sessionId: (req as any).sessionID
      }, req);
    } catch (error) {
      console.error('데이터 내보내기 추적 실패:', error);
    }
  });
  
  next();
};
