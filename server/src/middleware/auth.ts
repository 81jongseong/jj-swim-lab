import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { User } from '../models/User';

interface AuthRequest extends Request {
  user?: any;
}

export const auth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: '인증 토큰이 필요합니다.' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ error: '유효하지 않은 토큰입니다.' });
    }
    
    if (!user.isActive) {
      return res.status(403).json({ error: '비활성화된 계정입니다.' });
    }
    
    // JWT 토큰에서 centerId를 사용자 객체에 설정
    if (decoded.centerId) {
      user.centerId = decoded.centerId;
    }
    
    // centerId 필드가 있는지 확인 (디버깅용)
    if (user.userType === 'centerAdmin') {
      console.log('🔍 auth 미들웨어 - 센터 관리자 centerId:', {
        centerId: user.centerId,
        centerIdType: typeof user.centerId,
        centerIdConstructor: user.centerId?.constructor?.name,
        fromJWT: !!decoded.centerId
      });
    }
    
    req.user = user;
    return next();
  } catch (error) {
    console.error('인증 오류:', error);
    return res.status(401).json({ error: '인증에 실패했습니다.' });
  }
};

// 사용자 유형별 권한 검증 (테스트를 위해 완화)
export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: '인증이 필요합니다.' });
    }
    
    // superAdmin은 모든 권한을 가짐
    if (req.user.userType === 'superAdmin') {
      return next();
    }
    
    if (!roles.includes(req.user.userType)) {
      return res.status(403).json({ error: '접근 권한이 없습니다.' });
    }
    
    return next();
  };
};

// 레벨 기반 권한 검증 (테스트를 위해 완화)
export const requireLevel = (userType: string, minLevel: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: '인증이 필요합니다.' });
    }
    
    // superAdmin은 모든 권한을 가짐
    if (req.user.userType === 'superAdmin') {
      return next();
    }
    
    if (req.user.userType !== userType) {
      return res.status(403).json({ error: '잘못된 사용자 유형입니다.' });
    }
    
    const userLevel = getUserLevel(req.user);
    const minLevelIndex = getLevelIndex(userType, minLevel);
    const userLevelIndex = getLevelIndex(userType, userLevel);
    
    if (userLevelIndex < minLevelIndex) {
      return res.status(403).json({ 
        error: '레벨이 부족합니다.', 
        requiredLevel: minLevel,
        currentLevel: userLevel 
      });
    }
    
    return next();
  };
};

// 기능 접근 권한 검증 (테스트를 위해 완화)
export const requirePermission = (permission: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: '인증이 필요합니다.' });
    }
    
    // superAdmin은 모든 권한을 가짐
    if (req.user.userType === 'superAdmin') {
      return next();
    }
    
    if (!req.user.accessPermissions || !req.user.accessPermissions[permission]) {
      return res.status(403).json({ error: '해당 기능에 대한 접근 권한이 없습니다.' });
    }
    
    return next();
  };
};

// 기능 시퀀스 검증 (테스트를 위해 완화)
export const requireFeatureSequence = (feature: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: '인증이 필요합니다.' });
    }
    
    // superAdmin은 모든 기능에 접근 가능
    if (req.user.userType === 'superAdmin') {
      return next();
    }
    
    if (!req.user.featureSequence) {
      return res.status(403).json({ error: '기능 시퀀스가 설정되지 않았습니다.' });
    }
    
    const { availableSteps, completedSteps } = req.user.featureSequence;
    
    if (!availableSteps.includes(feature)) {
      return res.status(403).json({ 
        error: '해당 기능에 접근할 수 없습니다.',
        availableSteps,
        currentStep: req.user.featureSequence.currentStep
      });
    }
    
    return next();
  };
};

// 사용자 레벨 가져오기
function getUserLevel(user: any): string {
  switch(user.userType) {
    case 'student':
      return user.studentInfo?.swimmingLevel || 'beginner';
    case 'instructor':
      return user.instructorInfo?.instructorLevel || 'junior';
    case 'centerAdmin':
      return user.centerAdminInfo?.adminLevel || 'assistant';
    case 'superAdmin':
      return user.superAdminInfo?.adminLevel || 'admin';
    default:
      return 'beginner';
  }
}

// 레벨 인덱스 가져오기
function getLevelIndex(userType: string, level: string): number {
  const levelMaps = {
    student: ['beginner', 'intermediate', 'advanced', 'expert'],
    instructor: ['junior', 'senior', 'master', 'expert'],
    centerAdmin: ['assistant', 'manager', 'director'],
    superAdmin: ['admin', 'superAdmin', 'systemAdmin']
  };
  
  const levels = levelMaps[userType as keyof typeof levelMaps] || [];
  return levels.indexOf(level);
}

// 센터 관리자 권한 검증 (테스트를 위해 완화)
export const requireCenterAdminPermission = (permission: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: '인증이 필요합니다.' });
    }
    
    // superAdmin은 모든 권한을 가짐
    if (req.user.userType === 'superAdmin') {
      return next();
    }
    
    if (req.user.userType !== 'centerAdmin') {
      return res.status(403).json({ error: '센터 관리자 권한이 필요합니다.' });
    }
    
    if (!req.user.centerAdminInfo?.permissions?.[permission]) {
      return res.status(403).json({ error: '해당 권한이 없습니다.' });
    }
    
    return next();
  };
};

// 총관리자 권한 검증 (테스트를 위해 완화)
export const requireSuperAdminPermission = (permission: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: '인증이 필요합니다.' });
    }
    
    // superAdmin은 모든 권한을 가짐
    if (req.user.userType === 'superAdmin') {
      return next();
    }
    
    if (req.user.userType !== 'superAdmin') {
      return res.status(403).json({ error: '총관리자 권한이 필요합니다.' });
    }
    
    if (!req.user.superAdminInfo?.systemPermissions?.[permission]) {
      return res.status(403).json({ error: '해당 권한이 없습니다.' });
    }
    
    return next();
  };
};

// 강사 권한 검증 (특정 센터) (테스트를 위해 완화)
export const requireInstructorCenterAccess = (centerId: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: '인증이 필요합니다.' });
    }
    
    // superAdmin은 모든 센터에 접근 가능
    if (req.user.userType === 'superAdmin') {
      return next();
    }
    
    if (req.user.userType !== 'instructor') {
      return res.status(403).json({ error: '강사 권한이 필요합니다.' });
    }
    
    const assignedCenters = req.user.instructorInfo?.assignedCenters || [];
    if (!assignedCenters.includes(centerId)) {
      return res.status(403).json({ error: '해당 센터에 대한 접근 권한이 없습니다.' });
    }
    
    return next();
  };
};

// 센터 관리자 권한 검증 (특정 센터) (테스트를 위해 완화)
export const requireCenterAdminCenterAccess = (centerId: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: '인증이 필요합니다.' });
    }
    
    // superAdmin은 모든 센터에 접근 가능
    if (req.user.userType === 'superAdmin') {
      return next();
    }
    
    if (req.user.userType !== 'centerAdmin') {
      return res.status(403).json({ error: '센터 관리자 권한이 필요합니다.' });
    }
    
    const managedCenters = req.user.centerAdminInfo?.managedCenters || [];
    if (!managedCenters.includes(centerId)) {
      return res.status(403).json({ error: '해당 센터에 대한 관리 권한이 없습니다.' });
    }
    
    return next();
  };
}; 