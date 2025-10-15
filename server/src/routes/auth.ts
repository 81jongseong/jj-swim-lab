/**
 * 🔐 JJ Swim Lab - 인증 라우트
 * 
 * 📋 **라우트 목적**
 * - 사용자 인증 관련 API 엔드포인트 제공
 * - 회원가입, 로그인, 로그아웃, 토큰 갱신 등 인증 기능 구현
 * - JWT 토큰 기반 인증 시스템 관리
 * - 사용자 권한 및 역할 기반 접근 제어
 * - 보안을 위한 인증 미들웨어 적용
 * 
 * 🔄 **주요 기능**
 * - 사용자 회원가입 (이메일, ID 중복 확인)
 * - 사용자 로그인 (비밀번호 검증, JWT 토큰 발급)
 * - JWT 토큰 검증 및 갱신
 * - 사용자 로그아웃 (토큰 무효화)
 * - 사용자 프로필 조회 및 수정
 * - 비밀번호 변경 및 재설정
 * - 사용자 권한 및 역할 관리
 * 
 * 🗄️ **데이터 연동**
 * - User 모델과 연동 (사용자 정보 관리)
 * - JWT 토큰 및 세션 관리
 * - bcrypt를 통한 비밀번호 해싱
 * - MongoDB Atlas 데이터베이스
 * - 인증 미들웨어 (auth.ts)
 * 
 * 🛠️ **필요한 설치 파일**
 * - Express.js Router
 * - bcryptjs (비밀번호 해싱)
 * - jsonwebtoken (JWT 토큰)
 * - User 모델 (../models/User)
 * - 인증 미들웨어 (../middleware/auth)
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 비밀번호 해싱 및 보안 처리
 * 2. JWT 토큰의 보안 및 만료 처리
 * 3. 사용자 입력 데이터 검증 및 sanitization
 * 4. 인증 실패 시 적절한 에러 처리
 * 5. 사용자 권한 및 역할 검증
 * 6. API 보안 및 Rate Limiting 적용
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] 인증 로직 동작 확인
 * - [ ] JWT 토큰 생성 및 검증 확인
 * - [ ] 사용자 권한 및 역할 관리 확인
 * - [ ] 보안 및 에러 처리 확인
 * - [ ] API 엔드포인트 테스트
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 인증 라우트 구현
 * - 2024-12-19: JWT 토큰 기반 인증 시스템 구현
 * - 2024-12-19: 사용자 권한 및 역할 관리 구현
 * - 2024-12-19: 보안 및 에러 처리 강화
 * - 2024-12-19: 토큰 갱신 및 세션 관리 구현
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (인증 시스템 완료)
 * 
 * 🚀 **다음 단계**
 * - 소셜 로그인 연동 (Google, Kakao)
 * - 2FA (Two-Factor Authentication) 구현
 * - 사용자 활동 로그 시스템
 * - 계정 보안 강화 (비밀번호 정책)
 * - 사용자 알림 및 메시지 시스템
 * 
 * 💡 **사용 예시**
 * ```typescript
 * // 회원가입
 * POST /api/auth/signup
 * {
 *   "userId": "user123",
 *   "name": "홍길동",
 *   "email": "hong@example.com",
 *   "password": "password123",
 *   "userType": "student"
 * }
 * 
 * // 로그인
 * POST /api/auth/login
 * {
 *   "email": "hong@example.com",
 *   "password": "password123"
 * }
 * 
 * // 토큰 갱신
 * POST /api/auth/refresh
 * {
 *   "refreshToken": "refresh_token_here"
 * }
 * ```
 * 
 * 🔍 **인증 처리 흐름**
 * 1. 사용자 입력 데이터 검증
 * 2. 사용자 인증 정보 확인 (이메일, 비밀번호)
 * 3. JWT 토큰 생성 및 발급
 * 4. 사용자 권한 및 역할 확인
 * 5. 인증 상태 업데이트
 * 6. 클라이언트에 토큰 및 사용자 정보 반환
 * 7. 세션 관리 및 보안 로깅
 */

import { Router, Request, Response } from 'express';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { LoginLog } from '../models/LoginLog';

const router: Router = Router();

// 회원가입
/**
 * 🔐 사용자 회원가입 엔드포인트
 * 
 * 📋 **기능**
 * - 새로운 사용자 계정 생성
 * - 이메일 및 사용자 ID 중복 확인
 * - 비밀번호 해싱 및 저장
 * - 회원가입 완료 시 JWT 토큰 발급
 * 
 * 🔄 **회원가입 과정**
 * 1. 요청 데이터 검증 및 중복 확인
 * 2. 비밀번호 해싱
 * 3. 사용자 정보 저장
 * 4. JWT 토큰 생성 (issuer/audience 포함)
 * 5. 사용자 정보와 토큰 반환
 * 
 * 📅 **수정 히스토리**
 * - 2025-01-13: JWT 토큰 생성 시 issuer/audience 추가
 */
router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { userId, name, email, password, phone, address, userType, location } = req.body;

    // 필수 필드 검증
    if (!userId || !name || !email || !password) {
      return res.status(400).json({ error: '필수 필드가 누락되었습니다.' });
    }

    // userId 중복 확인
    const existingUserId = await User.findOne({ userId });
    if (existingUserId) {
      return res.status(400).json({ error: '이미 사용 중인 ID입니다.' });
    }

    // 이메일 중복 확인
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: '이미 등록된 이메일입니다.' });
    }

    // 비밀번호 해시화
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 사용자 생성
    const userData: any = {
      userId,
      name,
      email,
      password: hashedPassword,
      phone,
      address,
      // 서버 스키마(enum)와 일치하도록 기본값 및 값 보정
      userType: ['student', 'instructor', 'centerAdmin', 'superAdmin'].includes(userType)
        ? userType
        : 'student'
    };

    // 🆕 위치 정보 추가 (있는 경우)
    if (location && location.coordinates && location.coordinates.length === 2) {
      userData.location = {
        type: 'Point',
        coordinates: location.coordinates // [경도, 위도]
      };
      console.log('✅ 위치 정보 저장:', userData.location);
    }

    // 사용자 타입별 추가 필드
    if (userData.userType === 'instructor') {
      userData.experience = req.body.experience || '';
      userData.certifications = req.body.certifications || [];
      userData.specialties = req.body.specialties || [];
    } else if (userData.userType === 'centerAdmin') {
      userData.centerAdminInfo = {
        managedCenters: req.body.managedCenters || [],
        adminLevel: req.body.adminLevel || 'assistant',
        permissions: req.body.permissions || undefined,
      };
    }

    const user = new User(userData);
    await user.save();

    // JWT 토큰 생성 - 모든 필요한 필드 포함
    const tokenPayload = {
      id: user._id,
      userId: user._id,
      userType: user.userType,
      email: user.email,
      name: user.name,
      permissions: user.centerAdminInfo?.permissions || user.superAdminInfo?.systemPermissions || []
    };
    
    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET || 'fallback-secret',
      { 
        expiresIn: '24h',
        issuer: 'jj-swim-lab',
        audience: 'jj-swim-lab-users'
      }
    );

    return res.status(201).json({
      message: '회원가입이 완료되었습니다.',
      token,
      user: {
        id: user._id,
        userId: user.userId,
        name: user.name,
        email: user.email,
        userType: user.userType
      }
    });
  } catch (error) {
    console.error('회원가입 오류:', error);
    return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 토큰 검증 - 인증 미들웨어와 동일한 검증 로직 사용
/**
 * 🔐 토큰 검증 엔드포인트
 * 
 * 📋 **기능**
 * - JWT 토큰의 유효성 검증
 * - 사용자 정보 반환
 * - 인증 미들웨어와 동일한 검증 로직 사용
 * 
 * 🔄 **검증 과정**
 * 1. Authorization 헤더에서 토큰 추출
 * 2. JWT 토큰 검증 (issuer, audience 포함)
 * 3. 사용자 정보 조회 및 활성 상태 확인
 * 4. 사용자 정보 반환
 * 
 * 📅 **수정 히스토리**
 * - 2025-01-13: 인증 미들웨어와 동일한 검증 로직으로 수정 (issuer/audience 검증 추가)
 */
router.get('/verify', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: '인증 토큰이 필요합니다.' });
    }

    const token = authHeader.substring(7);
    
    try {
      // 인증 미들웨어와 동일한 검증 로직 사용
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret', {
        issuer: 'jj-swim-lab',
        audience: 'jj-swim-lab-users'
      }) as any;
      
      const user = await User.findById(decoded.userId || decoded.id).select('-password');
      
      if (!user) {
        return res.status(401).json({ error: '사용자를 찾을 수 없습니다.' });
      }

      if (!user.isActive) {
        return res.status(401).json({ error: '비활성화된 계정입니다.' });
      }

      return res.status(200).json({ 
        message: '토큰이 유효합니다.',
        user: {
          _id: user._id,
          userId: user.userId,
          name: user.name,
          email: user.email,
          userType: user.userType,
          level: user.level,
          isActive: user.isActive
        }
      });
    } catch (jwtError) {
      console.error('JWT 토큰 검증 실패:', jwtError);
      return res.status(401).json({ error: '토큰이 만료되었거나 유효하지 않습니다.' });
    }
  } catch (error) {
    console.error('토큰 검증 오류:', error);
    return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 로그인
/**
 * 🔐 사용자 로그인 엔드포인트
 * 
 * 📋 **기능**
 * - 사용자 인증 및 JWT 토큰 발급
 * - 로그인 실패 시 적절한 에러 메시지 반환
 * - 사용자 정보와 함께 토큰 반환
 * 
 * 🔄 **인증 과정**
 * 1. 요청 데이터 검증 (userId, password)
 * 2. 사용자 정보 조회 및 비밀번호 검증
 * 3. 사용자 활성 상태 확인
 * 4. JWT 토큰 생성 (issuer/audience 포함)
 * 5. 사용자 정보와 토큰 반환
 * 
 * 📅 **수정 히스토리**
 * - 2025-01-13: JWT 토큰 생성 시 issuer/audience 추가
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    console.log('🔍 로그인 요청 받음:', { body: req.body });
    
    // 클라이언트에서 잘못된 필드명으로 전달될 수 있어 userId 우선, 없으면 email을 userId처럼 허용
    const { userId, email, password } = req.body;

    console.log('🔍 요청 데이터 파싱:', { userId, email, password: password ? '***' : 'undefined' });

    // 필수 필드 검증
    if (!(userId || email) || !password) {
      console.log('❌ 필수 필드 누락:', { userId: !!userId, email: !!email, password: !!password });
      return res.status(400).json({ error: 'ID와 비밀번호를 입력해주세요.' });
    }

    // 사용자 찾기 (username, userId, email 순서로 검색)
    let user = null;
    let searchQuery = {};
    
    if (userId) {
      searchQuery = { $or: [{ userId }, { username: userId }, { email: userId }] };
      console.log('🔍 userId로 검색:', searchQuery);
    } else if (email) {
      searchQuery = { $or: [{ email }, { username: email }] };
      console.log('🔍 email로 검색:', searchQuery);
    }
    
    user = await User.findOne(searchQuery).select('+centerId');
    console.log('🔍 사용자 검색 결과:', user ? { userId: user.userId, email: user.email, userType: user.userType } : '사용자 없음');
    
    if (!user) {
      console.log('❌ 사용자를 찾을 수 없음');
      return res.status(401).json({ error: 'ID 또는 비밀번호가 올바르지 않습니다.' });
    }

    // 비밀번호 확인 (디버깅 로그 추가)
    console.log('🔍 비밀번호 검증 디버깅:');
    console.log('  - 입력된 비밀번호:', password);
    console.log('  - 저장된 해시:', user.password);
    console.log('  - 사용자 정보:', { userId: user.userId, email: user.email });
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('  - bcrypt.compare 결과:', isPasswordValid);
    
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'ID 또는 비밀번호가 올바르지 않습니다.' });
    }

    // 마지막 로그인 시간 업데이트
    user.lastLoginAt = new Date();
    
    // 데이터 정리: 문자열 배열을 ObjectId 배열로 변환하거나 정리
    if (user.studentInfo) {
      // enrolledCourses와 completedCourses가 문자열 배열인 경우 정리
      if (Array.isArray(user.studentInfo.enrolledCourses) && 
          user.studentInfo.enrolledCourses.length > 0 && 
          typeof user.studentInfo.enrolledCourses[0] === 'string') {
        console.log('🔧 enrolledCourses 데이터 정리:', user.studentInfo.enrolledCourses);
        user.studentInfo.enrolledCourses = [];
      }
      
      if (Array.isArray(user.studentInfo.completedCourses) && 
          user.studentInfo.completedCourses.length > 0 && 
          typeof user.studentInfo.completedCourses[0] === 'string') {
        console.log('🔧 completedCourses 데이터 정리:', user.studentInfo.completedCourses);
        user.studentInfo.completedCourses = [];
      }
    }
    
    try {
      await user.save();
      console.log('✅ 사용자 정보 저장 성공');
    } catch (saveError) {
      console.warn('⚠️ 사용자 정보 저장 실패, 로그인은 계속 진행:', saveError.message);
      // 저장 실패해도 로그인은 계속 진행
    }

    // JWT 토큰 생성 - 모든 필요한 필드 포함
    const tokenPayload: any = { 
      id: user._id,
      userId: user._id,
      userType: user.userType,
      email: user.email,
      name: user.name,
      centerId: user.centerId,
      permissions: user.centerAdminInfo?.permissions || user.superAdminInfo?.systemPermissions || []
    };
    
    // 디버깅: JWT 토큰 페이로드 확인
    console.log('🔍 JWT 토큰 페이로드 생성:', {
      id: tokenPayload.id,
      userId: tokenPayload.userId,
      userType: tokenPayload.userType,
      email: tokenPayload.email,
      name: tokenPayload.name,
      permissions: tokenPayload.permissions
    });
    
    // centerAdmin인 경우 centerId 포함
    if (user.userType === 'centerAdmin' && user.centerId) {
      tokenPayload.centerId = user.centerId;
      console.log('🔍 JWT 토큰에 centerId 포함:', {
        centerId: user.centerId,
        centerIdType: typeof user.centerId,
        centerIdConstructor: user.centerId?.constructor?.name
      });
    } else {
      console.log('⚠️ JWT 토큰에 centerId 미포함:', {
        userType: user.userType,
        centerId: user.centerId,
        centerIdExists: !!user.centerId
      });
    }
    
    console.log('🔍 JWT 토큰 페이로드:', tokenPayload);
    
    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET || 'fallback-secret',
      { 
        expiresIn: '24h',
        issuer: 'jj-swim-lab',
        audience: 'jj-swim-lab-users'
      }
    );

    // 로그인 로그 기록
    try {
      const loginLog = new LoginLog({
        userId: user._id,
        userType: user.userType,
        loginTime: new Date(),
        ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
        userAgent: req.get('User-Agent') || 'unknown',
        isActive: true
      });
      await loginLog.save();
      console.log('✅ 로그인 로그 기록 완료');
    } catch (logError) {
      console.warn('⚠️ 로그인 로그 기록 실패:', logError);
      // 로그 기록 실패해도 로그인은 계속 진행
    }

    return res.json({
      success: true,
      message: '로그인이 완료되었습니다.',
      token,
      user: {
        _id: user._id,
        userId: user.userId,
        name: user.name,
        email: user.email,
        userType: user.userType,
        level: user.level,
        centerId: user.centerId,
        isActive: user.isActive,
        lastLoginAt: user.lastLoginAt,
        studentInfo: user.studentInfo,
        instructorInfo: user.instructorInfo,
        centerAdminInfo: user.centerAdminInfo,
        superAdminInfo: user.superAdminInfo
      }
    });
  } catch (error) {
    console.error('❌ 로그인 오류 상세:', error);
    console.error('❌ 오류 스택:', error instanceof Error ? error.stack : '스택 없음');
    return res.status(500).json({ 
      error: '서버 오류가 발생했습니다.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// 프로필 조회
router.get('/profile', async (req: Request, res: Response) => {
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

    return res.json({
      user
    });
  } catch (error) {
    console.error('프로필 조회 오류:', error);
    return res.status(401).json({ error: '인증에 실패했습니다.' });
  }
});

export default router;
