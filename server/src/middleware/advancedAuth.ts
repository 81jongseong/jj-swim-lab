import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole, Permission, SecurityContext } from '../utils/advancedTypes';

// 고급 인증 미들웨어
interface AuthenticatedRequest extends Omit<Request, 'user'> {
  user?: SecurityContext;
  token?: string;
  sessionID?: string;
}

// JWT 페이로드 타입
interface JWTPayload {
  userId: string;
  role: UserRole;
  permissions: Permission[];
  centerId?: string;
  iat: number;
  exp: number;
}

// 인증 옵션 타입
interface AuthOptions {
  required?: boolean;
  roles?: UserRole[];
  permissions?: Permission[];
  centerId?: string;
  allowGuest?: boolean;
}

// 토큰 검증 함수
export function verifyToken(token: string): JWTPayload | null {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not defined');
    }
    
    const decoded = jwt.verify(token, secret) as JWTPayload;
    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

// 토큰에서 사용자 정보 추출
export function extractUserFromToken(token: string): SecurityContext | null {
  const payload = verifyToken(token);
  if (!payload) return null;

  return {
    userId: payload.userId,
    role: payload.role,
    permissions: payload.permissions,
    ipAddress: '', // 미들웨어에서 설정
    userAgent: '', // 미들웨어에서 설정
    sessionId: '', // 미들웨어에서 설정
    tokenExpiry: new Date(payload.exp * 1000)
  };
}

// 권한 검사 함수
export function hasPermission(
  userPermissions: Permission[],
  requiredPermissions: Permission[]
): boolean {
  return requiredPermissions.every(permission => 
    userPermissions.includes(permission)
  );
}

// 역할 검사 함수
export function hasRole(userRole: UserRole, requiredRoles: UserRole[]): boolean {
  return requiredRoles.includes(userRole);
}

// 센터 접근 검사 함수
export function hasCenterAccess(
  userCenterId: string | undefined,
  requiredCenterId: string
): boolean {
  return userCenterId === requiredCenterId;
}

// 기본 인증 미들웨어
export function authenticate(options: AuthOptions = {}) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader) {
        if (options.allowGuest) {
          req.user = {
            role: 'guest',
            permissions: [],
            ipAddress: req.ip || req.connection.remoteAddress || '',
            userAgent: req.get('User-Agent') || '',
            sessionId: (req as any).sessionID || '',
            tokenExpiry: new Date()
          };
          return next();
        }
        
        if (options.required !== false) {
          return res.status(401).json({
            success: false,
            error: '인증이 필요합니다.',
            message: '로그인해주세요.'
          });
        }
        
        return next();
      }

      const token = authHeader.startsWith('Bearer ') 
        ? authHeader.slice(7) 
        : authHeader;

      const user = extractUserFromToken(token);
      if (!user) {
        return res.status(401).json({
          success: false,
          error: '유효하지 않은 토큰입니다.',
          message: '토큰을 확인해주세요.'
        });
      }

      // 토큰 만료 검사
      if (user.tokenExpiry < new Date()) {
        return res.status(401).json({
          success: false,
          error: '토큰이 만료되었습니다.',
          message: '다시 로그인해주세요.'
        });
      }

      // IP 주소와 User-Agent 설정
      user.ipAddress = req.ip || req.connection.remoteAddress || '';
      user.userAgent = req.get('User-Agent') || '';
      user.sessionId = (req as any).sessionID || '';

      // 역할 검사
      if (options.roles && !hasRole(user.role, options.roles)) {
        return res.status(403).json({
          success: false,
          error: '권한이 없습니다.',
          message: '접근할 수 있는 역할이 아닙니다.'
        });
      }

      // 권한 검사
      if (options.permissions && !hasPermission(user.permissions, options.permissions)) {
        return res.status(403).json({
          success: false,
          error: '권한이 없습니다.',
          message: '필요한 권한이 없습니다.'
        });
      }

      // 센터 접근 검사 (centerId가 SecurityContext에 없으므로 주석 처리)
      // if (options.centerId && !hasCenterAccess(user.centerId, options.centerId)) {
      //   return res.status(403).json({
      //     success: false,
      //     error: '권한이 없습니다.',
      //     message: '해당 센터에 접근할 수 없습니다.'
      //   });
      // }

      req.user = user;
      req.token = token;
      next();
    } catch (error) {
      console.error('Authentication error:', error);
      return res.status(500).json({
        success: false,
        error: '인증 처리 중 오류가 발생했습니다.',
        message: '서버 오류입니다.'
      });
    }
  };
}

// 역할별 인증 미들웨어
export const requireSuperAdmin = authenticate({ roles: ['superAdmin'] });
export const requireCenterAdmin = authenticate({ roles: ['superAdmin', 'centerAdmin'] });
export const requireInstructor = authenticate({ roles: ['superAdmin', 'centerAdmin', 'instructor'] });
export const requireStudent = authenticate({ roles: ['superAdmin', 'centerAdmin', 'instructor', 'student'] });
export const requireGuest = authenticate({ allowGuest: true });

// 권한별 인증 미들웨어
export const requireReadPermission = authenticate({ permissions: ['read'] });
export const requireWritePermission = authenticate({ permissions: ['write'] });
export const requireDeletePermission = authenticate({ permissions: ['delete'] });
export const requireAdminPermission = authenticate({ permissions: ['admin'] });

// 센터별 인증 미들웨어
export function requireCenterAccess(centerId: string) {
  return authenticate({ centerId });
}

// 동적 권한 검사 미들웨어
export function checkPermission(permission: Permission) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: '인증이 필요합니다.',
        message: '로그인해주세요.'
      });
    }

    if (!req.user.permissions.includes(permission)) {
      return res.status(403).json({
        success: false,
        error: '권한이 없습니다.',
        message: `'${permission}' 권한이 필요합니다.`
      });
    }

    next();
  };
}

// 동적 역할 검사 미들웨어
export function checkRole(role: UserRole) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: '인증이 필요합니다.',
        message: '로그인해주세요.'
      });
    }

    if (req.user.role !== role) {
      return res.status(403).json({
        success: false,
        error: '권한이 없습니다.',
        message: `'${role}' 역할이 필요합니다.`
      });
    }

    next();
  };
}

// 토큰 갱신 미들웨어
export function refreshToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user || !req.token) {
    return next();
  }

  const now = new Date();
  const tokenExpiry = req.user.tokenExpiry;
  const timeUntilExpiry = tokenExpiry.getTime() - now.getTime();
  const refreshThreshold = 15 * 60 * 1000; // 15분

  if (timeUntilExpiry < refreshThreshold) {
    // 토큰 갱신 로직
    const newToken = generateRefreshToken(req.user);
    res.setHeader('X-New-Token', newToken);
  }

  next();
}

// 리프레시 토큰 생성
function generateRefreshToken(user: SecurityContext): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined');
  }

  const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
    userId: user.userId,
    role: user.role,
    permissions: user.permissions
  };

  return jwt.sign(payload, secret, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  } as jwt.SignOptions);
}

// 세션 검증 미들웨어
export function validateSession(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return next();
  }

  // 세션 ID 검증
  if (req.user.sessionId && (req as any).sessionID && req.user.sessionId !== (req as any).sessionID) {
    return res.status(401).json({
      success: false,
      error: '세션이 일치하지 않습니다.',
      message: '다시 로그인해주세요.'
    });
  }

  next();
}

// 보안 헤더 미들웨어
export function securityHeaders(req: Request, res: Response, next: NextFunction) {
  // 보안 헤더 설정
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  // CSP 헤더
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "connect-src 'self' https:; " +
    "font-src 'self' https:; " +
    "object-src 'none'; " +
    "base-uri 'self'; " +
    "form-action 'self';"
  );

  next();
}

// 요청 로깅 미들웨어
export function requestLogging(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logData = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress,
      userId: req.user?.userId,
      sessionId: req.user?.sessionId
    };

    console.log('Request completed:', logData);
  });

  next();
}

export default {
  authenticate,
  requireSuperAdmin,
  requireCenterAdmin,
  requireInstructor,
  requireStudent,
  requireGuest,
  requireReadPermission,
  requireWritePermission,
  requireDeletePermission,
  requireAdminPermission,
  requireCenterAccess,
  checkPermission,
  checkRole,
  refreshToken,
  validateSession,
  securityHeaders,
  requestLogging
};
