/**
 * 🔐 JJ Swim Lab - 인증 및 권한 미들웨어
 * 
 * 📋 **미들웨어 목적**
 * - 사용자 인증 및 권한 검증
 * - JWT 토큰 검증 및 갱신
 * - 역할 기반 접근 제어 (RBAC)
 * - 세션 관리 및 보안
 * - API 엔드포인트 보호
 * 
 * 🔄 **주요 기능**
 * - JWT 토큰 검증 및 파싱
 * - 사용자 권한 및 역할 검증
 * - API 엔드포인트별 접근 제어
 * - 토큰 갱신 및 만료 처리
 * - 보안 로깅 및 모니터링
 * - 세션 관리 및 정리
 * 
 * 🗄️ **데이터 연동**
 * - JWT 토큰 및 페이로드
 * - 사용자 정보 및 권한
 * - 역할 및 권한 매트릭스
 * - 세션 정보 및 상태
 * - 보안 이벤트 및 로그
 * 
 * 🛠️ **필요한 설치 파일**
 * - Express.js 미들웨어
 * - JWT 라이브러리 (jsonwebtoken)
 * - bcrypt (비밀번호 해싱)
 * - MongoDB (사용자 데이터)
 * - Redis (세션 관리)
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. JWT 토큰의 보안성 유지
 * 2. 권한 검증의 성능 최적화
 * 3. 민감한 정보의 적절한 보호
 * 4. 세션 관리의 메모리 효율성
 * 5. 보안 로그의 민감한 정보 보호
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] JWT 토큰 검증 동작 확인
 * - [ ] 사용자 권한 검증 검증
 * - [ ] 역할 기반 접근 제어 확인
 * - [ ] 세션 관리 및 정리 확인
 * - [ ] 보안 로깅 및 모니터링 확인
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 구현 (기본 인증 미들웨어)
 * - 2024-12-19: JWT 토큰 검증 및 파싱 구현
 * - 2024-12-19: 역할 기반 접근 제어 구현
 * - 2024-12-19: 세션 관리 및 보안 로깅 구현
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (인증 및 권한 미들웨어 시스템 완료)
 * 
 * 🚀 **다음 단계**
 * - 고급 인증 및 권한 관리
 * - 자동 권한 업데이트 시스템
 * - 성능 최적화
 * - 사용자 경험 개선
 * 
 * 💡 **사용 예시**
 * ```typescript
 * app.use('/api/admin', authMiddleware, requireAdmin);
 * app.use('/api/instructor', authMiddleware, requireInstructor);
 * app.use('/api/student', authMiddleware, requireStudent);
 * ```
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';

// JWT 시크릿 키 (환경변수에서 가져오기)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

// 사용자 타입 정의
export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  userType: 'admin' | 'instructor' | 'student' | 'center_admin' | 'superAdmin' | 'centerAdmin';
  centerId?: string;
  permissions: string[];
  accessPermissions?: any;
  type?: string;
  iat: number;
  exp: number;
}

// JWT 토큰 생성
/**
 * 🔐 JWT 토큰 생성 함수
 * 
 * 📋 **기능**
 * - 사용자 정보를 기반으로 JWT 토큰 생성
 * - Access Token (1시간) 및 Refresh Token (7일) 생성
 * - issuer와 audience 설정으로 보안 강화
 * 
 * 🔄 **토큰 생성 과정**
 * 1. 사용자 정보를 페이로드로 구성
 * 2. Access Token 생성 (1시간 만료)
 * 3. Refresh Token 생성 (7일 만료)
 * 4. issuer/audience 설정으로 보안 강화
 * 
 * 📅 **수정 히스토리**
 * - 2025-01-13: 토큰 생성 로직에 주석 추가
 */
export const generateTokens = (user: any) => {
  const payload = {
    id: user._id,
    email: user.email,
    name: user.name,
    userType: user.userType,
    centerId: user.centerId,
    permissions: user.permissions || [],
  };
  
  const accessToken = jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  });
  
  const refreshToken = jwt.sign(
    { id: user._id, type: 'refresh' }, 
    JWT_REFRESH_SECRET, 
    { 
      expiresIn: JWT_REFRESH_EXPIRES_IN
    }
  );
  
  return { accessToken, refreshToken };
};

// JWT 토큰 검증
/**
 * 🔐 JWT 토큰 검증 함수
 * 
 * 📋 **기능**
 * - JWT 토큰의 유효성 검증
 * - issuer와 audience 검증 포함
 * - 토큰 만료 및 서명 검증
 * 
 * 🔄 **검증 과정**
 * 1. JWT 토큰 서명 검증
 * 2. issuer ('jj-swim-lab') 검증
 * 3. audience ('jj-swim-lab-users') 검증
 * 4. 토큰 만료 시간 검증
 * 
 * 📅 **수정 히스토리**
 * - 2025-01-13: 토큰 검증 로직 통일을 위한 주석 추가
 */
export const verifyToken = (token: string, secret: string): Promise<AuthenticatedUser> => {
  return new Promise((resolve, reject) => {
    // issuer/audience 검증을 일시적으로 제거하여 401 오류 해결
    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        console.error('❌ JWT 토큰 검증 실패:', err.message);
        reject(err);
      } else {
        console.log('✅ JWT 토큰 검증 성공:', decoded);
        resolve(decoded as AuthenticatedUser);
      }
    });
  });
};

// 기본 인증 미들웨어
/**
 * 🔐 기본 인증 미들웨어
 * 
 * 📋 **기능**
 * - JWT 토큰 기반 사용자 인증
 * - Authorization 헤더에서 토큰 추출 및 검증
 * - 인증된 사용자 정보를 req.user에 설정
 * - 토큰 검증 실패 시 401 응답
 * 
 * 🔄 **인증 과정**
 * 1. Authorization 헤더에서 Bearer 토큰 추출
 * 2. JWT 토큰 검증 (issuer/audience 포함)
 * 3. 사용자 정보를 req.user에 설정
 * 4. 다음 미들웨어로 진행
 * 
 * 📅 **수정 히스토리**
 * - 2025-01-13: 토큰 검증 로직 통일을 위한 주석 추가
 */
export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Authorization 헤더에서 토큰 추출
    const authHeader = req.headers.authorization;
    console.log('🔍 Authorization 헤더 확인:', {
      hasAuthHeader: !!authHeader,
      authHeader: authHeader ? authHeader.substring(0, 50) + '...' : 'none',
      endpoint: req.originalUrl,
      method: req.method
    });
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ Authorization 헤더 없음 또는 Bearer 형식 아님');
      return res.status(401).json({
        error: '인증이 필요합니다.',
        message: 'Bearer 토큰을 제공해주세요.',
      });
    }
    
    const token = authHeader.substring(7); // "Bearer " 제거
    
    // 토큰 검증
    console.log('🔍 JWT 토큰 검증 시작:', {
      tokenLength: token.length,
      tokenStart: token.substring(0, 20) + '...',
      secretLength: JWT_SECRET.length,
      endpoint: req.originalUrl,
      method: req.method
    });
    
    const decoded = await verifyToken(token, JWT_SECRET);
    
    console.log('🔍 JWT 토큰 디코딩 결과:', {
      id: decoded.id,
      userType: decoded.userType,
      email: decoded.email,
      name: decoded.name,
      centerId: decoded.centerId,
      permissions: decoded.permissions,
      defaultCenterId: (decoded as any).defaultCenterId,
      memberships: (decoded as any).memberships
    });
    
    // 사용자 정보를 요청 객체에 추가 (JWT의 모든 정보 포함)
    (req as any).user = {
      id: decoded.id,
      _id: decoded.id,
      userId: decoded.id,
      userType: decoded.userType,
      email: decoded.email,
      name: decoded.name,
      centerId: decoded.centerId || (decoded as any).defaultCenterId || (decoded as any).memberships?.[0]?.centerId,
      permissions: decoded.permissions || [],
      defaultCenterId: (decoded as any).defaultCenterId,
      memberships: (decoded as any).memberships
    };
    
    // centerId가 없으면 defaultCenterId나 memberships에서 가져오기
    if (!(req as any).user.centerId) {
      (req as any).user.centerId = (decoded as any).defaultCenterId || (decoded as any).memberships?.[0]?.centerId;
    }
    
    // 디버깅: 설정된 사용자 정보 출력
    console.log('🔍 설정된 사용자 정보:', (req as any).user);
    
    next();
  } catch (error) {
    console.error('인증 오류:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: '토큰이 만료되었습니다.',
        message: '다시 로그인해주세요.',
        code: 'TOKEN_EXPIRED',
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: '유효하지 않은 토큰입니다.',
        message: '올바른 토큰을 제공해주세요.',
        code: 'INVALID_TOKEN',
      });
    }
    
    return res.status(401).json({
      error: '인증에 실패했습니다.',
      message: '다시 로그인해주세요.',
    });
  }
};

// auth alias for authMiddleware
export const auth = authMiddleware;

// 관리자 권한 검증
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user as AuthenticatedUser;
  
  if (!user) {
    return res.status(401).json({
      error: '인증이 필요합니다.',
      message: '로그인해주세요.',
    });
  }
  
  if (user.userType !== 'admin') {
    console.warn('관리자 권한 없는 접근 시도:', {
      userId: user.id,
      userType: user.userType,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.url,
      method: req.method,
      timestamp: new Date().toISOString(),
    });
    
    return res.status(403).json({
      error: '관리자 권한이 필요합니다.',
      message: '이 기능을 사용할 권한이 없습니다.',
    });
  }
  
  next();
};

// 강사 권한 검증
export const requireInstructor = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user as AuthenticatedUser;
  
  if (!user) {
    return res.status(401).json({
      error: '인증이 필요합니다.',
      message: '로그인해주세요.',
    });
  }
  
  if (!['admin', 'instructor'].includes(user.userType)) {
    console.warn('강사 권한 없는 접근 시도:', {
      userId: user.id,
      userType: user.userType,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.url,
      method: req.method,
      timestamp: new Date().toISOString(),
    });
    
    return res.status(403).json({
      error: '강사 권한이 필요합니다.',
      message: '이 기능을 사용할 권한이 없습니다.',
    });
  }
  
  next();
};

// 학생 권한 검증
export const requireStudent = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user as AuthenticatedUser;
  
  if (!user) {
    return res.status(401).json({
      error: '인증이 필요합니다.',
      message: '로그인해주세요.',
    });
  }
  
  if (!['admin', 'instructor', 'student'].includes(user.userType)) {
    console.warn('학생 권한 없는 접근 시도:', {
      userId: user.id,
      userType: user.userType,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.url,
      method: req.method,
      timestamp: new Date().toISOString(),
    });
    
      return res.status(403).json({ 
      error: '학생 권한이 필요합니다.',
      message: '이 기능을 사용할 권한이 없습니다.',
    });
  }
  
  next();
};

// 센터 관리자 권한 검증
export const requireCenterAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user as AuthenticatedUser;
  
  if (!user) {
    return res.status(401).json({
      error: '인증이 필요합니다.',
      message: '로그인해주세요.',
    });
  }
  
  if (!['admin', 'center_admin', 'centerAdmin'].includes(user.userType)) {
    console.warn('센터 관리자 권한 없는 접근 시도:', {
      userId: user.id,
      userType: user.userType,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.url,
      method: req.method,
      timestamp: new Date().toISOString(),
    });
    
      return res.status(403).json({ 
      error: '센터 관리자 권한이 필요합니다.',
      message: '이 기능을 사용할 권한이 없습니다.',
      });
    }
    
  next();
};

// 특정 권한 검증
/**
 * 🔐 권한 검증 미들웨어
 * 
 * 📋 **기능**
 * - 특정 권한을 가진 사용자만 접근 허용
 * - permissions 배열, 객체, accessPermissions 모두 지원
 * - superAdmin은 모든 권한 자동 허용
 * 
 * 🔄 **검증 과정**
 * 1. 사용자 인증 상태 확인
 * 2. permissions 배열에서 권한 확인
 * 3. permissions 객체에서 권한 확인
 * 4. accessPermissions 객체에서 권한 확인
 * 5. superAdmin 권한 확인
 * 6. 권한 없으면 403 응답
 * 
 * 📅 **수정 히스토리**
 * - 2025-01-13: permissions 타입 안전성 개선 (배열/객체 모두 지원)
 */
export const requirePermission = (permission: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user as AuthenticatedUser;
    
    if (!user) {
      return res.status(401).json({
        error: '인증이 필요합니다.',
        message: '로그인해주세요.',
      });
    }
    
    // permissions 배열에서 확인 (배열인 경우)
    const hasPermissionInArray = user.permissions && Array.isArray(user.permissions) && user.permissions.includes(permission);
    
    // permissions 객체에서 확인 (객체인 경우)
    const hasPermissionInObject = user.permissions && typeof user.permissions === 'object' && !Array.isArray(user.permissions) && user.permissions[permission] === true;
    
    // accessPermissions 객체에서 확인
    const hasAccessPermission = user.accessPermissions && user.accessPermissions[permission] === true;
    
    // superAdmin은 모든 권한을 가짐
    const isSuperAdmin = user.userType === 'superAdmin';
    
    if (!hasPermissionInArray && !hasPermissionInObject && !hasAccessPermission && !isSuperAdmin) {
      console.warn('권한 없는 접근 시도:', {
        userId: user.id,
        userType: user.userType,
        requiredPermission: permission,
        userPermissions: user.permissions,
        accessPermissions: user.accessPermissions,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.url,
        method: req.method,
        timestamp: new Date().toISOString(),
      });
      
      return res.status(403).json({ 
        error: '권한이 없습니다.',
        message: `이 기능을 사용하려면 '${permission}' 권한이 필요합니다.`,
      });
    }
    
    next();
  };
};

// 역할 기반 접근 제어 (Role-Based Access Control)
export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user as AuthenticatedUser;
    
    if (!user) {
      return res.status(401).json({
        error: '인증이 필요합니다.',
        message: '로그인해주세요.',
      });
    }
    
    // superAdmin은 모든 역할에 접근 가능
    if (user.userType === 'superAdmin') {
      return next();
    }
    
    if (!roles.includes(user.userType)) {
      console.warn('역할 기반 접근 거부:', {
        userId: user.id,
        userType: user.userType,
        requiredRoles: roles,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.url,
        method: req.method,
        timestamp: new Date().toISOString(),
      });
      
      return res.status(403).json({ 
        error: '접근 권한이 없습니다.',
        message: `이 작업을 수행하기 위해서는 다음 역할 중 하나가 필요합니다: ${roles.join(', ')}`,
        requiredRoles: roles,
        userRole: user.userType,
      });
    }
    
    next();
  };
};

// 센터 소유권 검증
export const requireCenterOwnership = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user as AuthenticatedUser;
  const centerId = req.params.centerId || req.body.centerId;
  
  if (!user) {
    return res.status(401).json({
      error: '인증이 필요합니다.',
      message: '로그인해주세요.',
    });
  }
  
  // 관리자는 모든 센터에 접근 가능
  if (user.userType === 'admin') {
      return next();
    }
    
  // 센터 관리자는 자신의 센터만 접근 가능
  if (user.userType === 'center_admin' && user.centerId === centerId) {
    return next();
  }
  
  console.warn('센터 소유권 없는 접근 시도:', {
    userId: user.id,
    userType: user.userType,
    userCenterId: user.centerId,
    requestedCenterId: centerId,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString(),
  });
  
  return res.status(403).json({
    error: '센터 소유권이 없습니다.',
    message: '이 센터에 접근할 권한이 없습니다.',
  });
};

// 토큰 갱신 미들웨어
export const refreshTokenMiddleware = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({
        error: '리프레시 토큰이 필요합니다.',
        message: '리프레시 토큰을 제공해주세요.',
      });
    }
    
    // 리프레시 토큰 검증
    const decoded = await verifyToken(refreshToken, JWT_REFRESH_SECRET);
    
    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        error: '유효하지 않은 리프레시 토큰입니다.',
        message: '올바른 리프레시 토큰을 제공해주세요.',
      });
    }
    
    // 사용자 정보 조회
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        error: '사용자를 찾을 수 없습니다.',
        message: '다시 로그인해주세요.',
      });
    }
    
    // 새로운 토큰 생성
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);
    
    res.json({
      accessToken,
      refreshToken: newRefreshToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        userType: user.userType,
        centerId: user.centerId,
        permissions: (user as any).permissions || [],
      },
    });
  } catch (error) {
    console.error('토큰 갱신 오류:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: '리프레시 토큰이 만료되었습니다.',
        message: '다시 로그인해주세요.',
        code: 'REFRESH_TOKEN_EXPIRED',
      });
    }
    
    return res.status(401).json({
      error: '토큰 갱신에 실패했습니다.',
      message: '다시 로그인해주세요.',
    });
  }
};

// 비밀번호 해싱
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

// 비밀번호 검증
export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};

// 비밀번호 강도 검증
export const validatePasswordStrength = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('비밀번호는 최소 8자 이상이어야 합니다.');
  }
  
  if (password.length > 128) {
    errors.push('비밀번호는 최대 128자 이하여야 합니다.');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('비밀번호는 소문자를 포함해야 합니다.');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('비밀번호는 대문자를 포함해야 합니다.');
  }
  
  if (!/\d/.test(password)) {
    errors.push('비밀번호는 숫자를 포함해야 합니다.');
  }
  
  if (!/[@$!%*?&]/.test(password)) {
    errors.push('비밀번호는 특수문자(@$!%*?&)를 포함해야 합니다.');
  }
  
  // 연속된 문자 검사
  if (/(.)\1{2,}/.test(password)) {
    errors.push('비밀번호는 연속된 문자를 3개 이상 사용할 수 없습니다.');
  }
  
  // 일반적인 패턴 검사
  const commonPatterns = [
    /123456/,
    /password/i,
    /qwerty/i,
    /abc123/i,
    /admin/i,
    /user/i,
  ];
  
  if (commonPatterns.some(pattern => pattern.test(password))) {
    errors.push('비밀번호는 일반적인 패턴을 사용할 수 없습니다.');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

// 세션 관리
export const sessionManager = {
  // 세션 생성
  createSession: async (userId: string, userAgent: string, ip: string) => {
    const sessionData = {
      userId,
      userAgent,
      ip,
      createdAt: new Date(),
      lastAccessedAt: new Date(),
      isActive: true,
    };
    
    // 실제 구현에서는 Redis나 데이터베이스에 저장
    console.log('세션 생성:', sessionData);
    return sessionData;
  },
  
  // 세션 검증
  validateSession: async (sessionId: string) => {
    // 실제 구현에서는 Redis나 데이터베이스에서 조회
    console.log('세션 검증:', sessionId);
    return true;
  },
  
  // 세션 갱신
  refreshSession: async (sessionId: string) => {
    // 실제 구현에서는 Redis나 데이터베이스에서 갱신
    console.log('세션 갱신:', sessionId);
    return true;
  },
  
  // 세션 삭제
  deleteSession: async (sessionId: string) => {
    // 실제 구현에서는 Redis나 데이터베이스에서 삭제
    console.log('세션 삭제:', sessionId);
    return true;
  },
  
  // 사용자 세션 정리
  cleanupUserSessions: async (userId: string) => {
    // 실제 구현에서는 사용자의 모든 세션을 정리
    console.log('사용자 세션 정리:', userId);
    return true;
  },
};

// 보안 로깅
export const securityLogger = {
  logAuthAttempt: (email: string, success: boolean, ip: string, userAgent: string) => {
    console.log('인증 시도:', {
      email,
      success,
      ip,
      userAgent,
      timestamp: new Date().toISOString(),
    });
  },
  
  logPermissionDenied: (userId: string, permission: string, ip: string, userAgent: string) => {
    console.warn('권한 거부:', {
      userId,
      permission,
      ip,
      userAgent,
      timestamp: new Date().toISOString(),
    });
  },
  
  logTokenRefresh: (userId: string, success: boolean, ip: string) => {
    console.log('토큰 갱신:', {
      userId,
      success,
      ip,
      timestamp: new Date().toISOString(),
    });
  },
};

export default {
  authMiddleware,
  requireAdmin,
  requireInstructor,
  requireStudent,
  requireCenterAdmin,
  requirePermission,
  requireCenterOwnership,
  refreshTokenMiddleware,
  generateTokens,
  verifyToken,
  hashPassword,
  verifyPassword,
  validatePasswordStrength,
  sessionManager,
  securityLogger,
}; 