import { Request, Response, NextFunction } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    _id: string;
    userType: string;
    email: string;
    name: string;
    centerId?: string;
  };
}

/**
 * 역할 기반 접근 제어 미들웨어
 * @param allowedRoles 허용된 사용자 역할 배열
 * @returns 미들웨어 함수
 */
export const roleMiddleware = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      // 사용자 정보 확인
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: '인증이 필요합니다.'
        });
      }

      // 역할 확인
      if (!allowedRoles.includes(req.user.userType)) {
        return res.status(403).json({
          success: false,
          message: '이 작업을 수행할 권한이 없습니다.',
          requiredRoles: allowedRoles,
          userRole: req.user.userType
        });
      }

      // 권한 확인 통과
      next();
    } catch (error) {
      console.error('역할 확인 중 오류 발생:', error);
      return res.status(500).json({
        success: false,
        message: '권한 확인 중 오류가 발생했습니다.'
      });
    }
  };
};

/**
 * 특정 역할만 허용하는 미들웨어 (단일 역할)
 * @param role 허용된 사용자 역할
 * @returns 미들웨어 함수
 */
export const requireRole = (role: string) => {
  return roleMiddleware([role]);
};

/**
 * 슈퍼 관리자 권한 확인 미들웨어
 */
export const requireSuperAdmin = roleMiddleware(['superAdmin']);

/**
 * 센터 관리자 권한 확인 미들웨어
 */
export const requireCenterAdmin = roleMiddleware(['centerAdmin']);

/**
 * 강사 권한 확인 미들웨어
 */
export const requireInstructor = roleMiddleware(['instructor']);

/**
 * 학생 권한 확인 미들웨어
 */
export const requireStudent = roleMiddleware(['student']);

/**
 * 관리자 권한 확인 미들웨어 (슈퍼 관리자 + 센터 관리자)
 */
export const requireAdmin = roleMiddleware(['superAdmin', 'centerAdmin']);

/**
 * 강사 또는 관리자 권한 확인 미들웨어
 */
export const requireInstructorOrAdmin = roleMiddleware(['instructor', 'superAdmin', 'centerAdmin']);

/**
 * 로그인된 사용자 권한 확인 미들웨어
 */
export const requireAuthenticated = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: '로그인이 필요합니다.'
    });
  }
  next();
};

/**
 * 센터별 접근 권한 확인 미들웨어
 * @param centerIdField 요청에서 센터 ID를 가져올 필드명
 */
export const requireCenterAccess = (centerIdField: string = 'centerId') => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: '인증이 필요합니다.'
        });
      }

      // 슈퍼 관리자는 모든 센터에 접근 가능
      if (req.user.userType === 'superAdmin') {
        return next();
      }

      // 센터 관리자와 강사는 자신의 센터에만 접근 가능
      const requestedCenterId = req.params[centerIdField] || req.body[centerIdField] || req.query[centerIdField];
      
      if (!requestedCenterId) {
        return res.status(400).json({
          success: false,
          message: '센터 ID가 필요합니다.'
        });
      }

      if (req.user.centerId !== requestedCenterId) {
        return res.status(403).json({
          success: false,
          message: '해당 센터에 접근할 권한이 없습니다.'
        });
      }

      next();
    } catch (error) {
      console.error('센터 접근 권한 확인 중 오류 발생:', error);
      return res.status(500).json({
        success: false,
        message: '권한 확인 중 오류가 발생했습니다.'
      });
    }
  };
};
