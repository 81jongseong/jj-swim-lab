/**
 * @file 점검 모드 미들웨어
 * @description 시스템 점검 모드 시 사용자 접근을 제한하는 미들웨어입니다.
 * @date 2025-09-19
 * @author JJ Swim Lab
 */

import { Request, Response, NextFunction } from 'express';
import { SystemConfig } from '../models/SystemConfig';

interface AuthenticatedRequest extends Request {
  user?: {
    _id: string;
    userType: 'student' | 'instructor' | 'centerAdmin' | 'superAdmin';
  };
}

// 점검 모드 체크 캐시 (성능 최적화)
let maintenanceCache: {
  enabled: boolean;
  message: string;
  lastChecked: number;
} = {
  enabled: false,
  message: '',
  lastChecked: 0
};

const CACHE_DURATION = 30 * 1000; // 30초 캐시

export const maintenanceModeMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const now = Date.now();
    
    // 캐시된 데이터가 유효한지 확인
    if (now - maintenanceCache.lastChecked < CACHE_DURATION) {
      if (maintenanceCache.enabled) {
        return handleMaintenanceMode(req, res, maintenanceCache.message);
      }
      return next();
    }

    // 데이터베이스에서 점검 모드 설정 조회
    const systemConfig = await SystemConfig.findOne({ isActive: true });
    
    if (systemConfig && systemConfig.maintenance.enabled) {
      // 캐시 업데이트
      maintenanceCache = {
        enabled: true,
        message: systemConfig.maintenance.message,
        lastChecked: now
      };
      
      return handleMaintenanceMode(req, res, systemConfig.maintenance.message);
    } else {
      // 캐시 업데이트
      maintenanceCache = {
        enabled: false,
        message: '',
        lastChecked: now
      };
      
      return next();
    }
  } catch (error) {
    console.error('점검 모드 확인 오류:', error);
    // 오류 시 정상 진행 (안전 우선)
    return next();
  }
};

function handleMaintenanceMode(req: AuthenticatedRequest, res: Response, message: string) {
  // 최고관리자는 점검 모드 중에도 접근 가능
  if (req.user?.userType === 'superAdmin') {
    return; // next() 제거
  }

  // 시스템 API는 점검 모드 중에도 접근 가능 (모니터링 목적)
  if (req.path.startsWith('/api/system/') || req.path.startsWith('/api/auth/')) {
    return; // next() 제거
  }

  // 점검 모드 응답
  return res.status(503).json({
    success: false,
    error: 'MAINTENANCE_MODE',
    message: message || '시스템 점검 중입니다. 잠시 후 다시 시도해주세요.',
    maintenanceMode: true,
    retryAfter: '1시간 후'
  });
}

// 점검 모드 캐시 강제 새로고침
export const refreshMaintenanceCache = () => {
  maintenanceCache.lastChecked = 0;
};
