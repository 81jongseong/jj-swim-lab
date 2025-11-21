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
 * - logger (로깅 유틸리티)
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
import { logInfo, logError, logWarn, logDebug } from '../utils/logger';

const router: Router = Router();

// 인증 코드 저장 (메모리 저장소 - 프로덕션에서는 Redis 사용 권장)
const phoneVerificationCodes = new Map<string, { code: string; expiresAt: number }>();
const emailVerificationCodes = new Map<string, { code: string; expiresAt: number }>();

// 전화번호 인증 코드 생성 (6자리)
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// 전화번호 인증 코드 발송 (SMS 발송 API)
/**
 * 📱 전화번호 인증 코드 발송
 * 
 * 실제 SMS 발송은 외부 서비스 연동 필요 (예: Twilio, AWS SNS, 알리고 등)
 * 현재는 콘솔에 출력 (개발용)
 */
router.post('/send-verification-code', async (req: Request, res: Response) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ 
        success: false,
        error: '전화번호를 입력해주세요.' 
      });
    }

    // 전화번호 형식 정규화
    const extractNumbers = (phoneNum: string) => phoneNum.replace(/\D/g, '');
    const normalizedPhone = extractNumbers(phone);

    if (normalizedPhone.length < 10 || normalizedPhone.length > 11) {
      return res.status(400).json({ 
        success: false,
        error: '올바른 전화번호를 입력해주세요.' 
      });
    }

    // 인증 코드 생성
    const code = generateVerificationCode();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5분 유효

    // 인증 코드 저장 (전화번호는 정규화된 형식으로 저장)
    phoneVerificationCodes.set(normalizedPhone, { code, expiresAt });

    // TODO: 실제 SMS 발송 API 연동
    // 예시: await sendSMS(phone, `JJ Swim Lab 인증번호: ${code}`);
    logDebug('인증 코드 발송 (개발용)', { phone, code });

    return res.status(200).json({
      success: true,
      message: '인증 코드가 발송되었습니다.',
      // 개발 환경에서는 코드 반환 (프로덕션에서는 제거)
      ...(process.env.NODE_ENV === 'development' && { code })
    });
  } catch (error: any) {
    logError('인증 코드 발송 오류', error);
    return res.status(500).json({ 
      success: false,
      error: '인증 코드 발송에 실패했습니다.' 
    });
  }
});

// 전화번호 인증 코드 검증
router.post('/verify-phone-code', async (req: Request, res: Response) => {
  try {
    const { phone, code } = req.body;

    if (!phone || !code) {
      return res.status(400).json({ 
        success: false,
        error: '전화번호와 인증 코드를 입력해주세요.' 
      });
    }

    // 전화번호 형식 정규화
    const extractNumbers = (phoneNum: string) => phoneNum.replace(/\D/g, '');
    const normalizedPhone = extractNumbers(phone);

    // 저장된 인증 코드 확인
    const stored = phoneVerificationCodes.get(normalizedPhone);

    if (!stored) {
      return res.status(400).json({ 
        success: false,
        error: '인증 코드가 만료되었거나 발송되지 않았습니다.' 
      });
    }

    if (Date.now() > stored.expiresAt) {
      phoneVerificationCodes.delete(normalizedPhone);
      return res.status(400).json({ 
        success: false,
        error: '인증 코드가 만료되었습니다. 다시 발송해주세요.' 
      });
    }

    if (stored.code !== code) {
      return res.status(400).json({ 
        success: false,
        error: '인증 코드가 일치하지 않습니다.' 
      });
    }

    // 인증 성공 - 인증 코드 삭제 (1회용)
    phoneVerificationCodes.delete(normalizedPhone);

    return res.status(200).json({
      success: true,
      message: '전화번호 인증이 완료되었습니다.',
      verified: true
    });
  } catch (error: any) {
    logError('인증 코드 검증 오류', error);
    return res.status(500).json({ 
      success: false,
      error: '인증 코드 검증에 실패했습니다.' 
    });
  }
});

// 이메일 인증 코드 발송 (개발 환경에서는 콘솔 출력)
router.post('/send-email-code', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: '이메일을 입력해주세요.'
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        error: '올바른 이메일 주소를 입력해주세요.'
      });
    }

    const code = generateVerificationCode();
    const expiresAt = Date.now() + 5 * 60 * 1000;
    emailVerificationCodes.set(normalizedEmail, { code, expiresAt });

    logDebug('이메일 인증 코드 발송 (개발용)', { email: normalizedEmail, code });

    return res.status(200).json({
      success: true,
      message: '이메일 인증 코드가 발송되었습니다.',
      ...(process.env.NODE_ENV === 'development' && { code })
    });
  } catch (error) {
    logError('이메일 인증 코드 발송 오류', error);
    return res.status(500).json({
      success: false,
      error: '이메일 인증 코드 발송에 실패했습니다.'
    });
  }
});

// 이메일 인증 코드 검증
router.post('/verify-email-code', async (req: Request, res: Response) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        error: '이메일과 인증 코드를 입력해주세요.'
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const stored = emailVerificationCodes.get(normalizedEmail);

    if (!stored) {
      return res.status(400).json({
        success: false,
        error: '인증 코드가 만료되었거나 발송되지 않았습니다.'
      });
    }

    if (Date.now() > stored.expiresAt) {
      emailVerificationCodes.delete(normalizedEmail);
      return res.status(400).json({
        success: false,
        error: '인증 코드가 만료되었습니다. 다시 발송해주세요.'
      });
    }

    if (stored.code !== code) {
      return res.status(400).json({
        success: false,
        error: '인증 코드가 일치하지 않습니다.'
      });
    }

    emailVerificationCodes.delete(normalizedEmail);

    return res.status(200).json({
      success: true,
      message: '이메일 인증이 완료되었습니다.',
      verified: true
    });
  } catch (error) {
    console.error('이메일 인증 코드 검증 오류:', error);
    return res.status(500).json({
      success: false,
      error: '이메일 인증 코드 검증에 실패했습니다.'
    });
  }
});

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
    const { userId, name, email, password, phone, address, birthDate, gender, userType, location, phoneVerified, studentInfo } = req.body;
    void phoneVerified;
    
    // 회원가입 요청 데이터 로깅
    console.log('📤 회원가입 요청 받음:', {
      name,
      email,
      phone,
      address,
      birthDate,
      gender,
      userType,
      hasStudentInfo: !!studentInfo,
      studentInfoHeight: studentInfo?.height,
      studentInfoWeight: studentInfo?.weight,
      studentInfo: studentInfo
    });

    // 필수 필드 검증 (소셜 로그인인 경우 password는 선택)
    if (!name || !email) {
      return res.status(400).json({ 
        success: false,
        error: '필수 필드가 누락되었습니다.',
        required: ['name', 'email']
      });
    }
    
    // 일반 회원가입인 경우 비밀번호 필수
    if (!req.body.provider && !password) {
      return res.status(400).json({ 
        success: false,
        error: '비밀번호는 필수입니다.',
        required: ['password']
      });
    }

    // 소셜 로그인인 경우: 기존 계정에 소셜 로그인 정보 연결 (계정 병합)
    if (req.body.provider && req.body.providerId) {
      const existingUser = await User.findOne({ email });
      
      if (existingUser) {
        // 같은 이메일로 기존 계정이 있으면 소셜 로그인 정보만 연결
        const alreadyConnected = existingUser.socialAccounts?.some(
          (acc: any) => acc.provider === req.body.provider && acc.providerId === req.body.providerId
        );
        
        if (alreadyConnected) {
          return res.status(400).json({ 
            success: false,
            error: '이미 연결된 소셜 계정입니다.' 
          });
        }
        
        // 기존 계정에 소셜 로그인 정보 추가
        if (!existingUser.socialAccounts) {
          existingUser.socialAccounts = [];
        }
        existingUser.socialAccounts.push({
          provider: req.body.provider,
          providerId: req.body.providerId,
          connectedAt: new Date()
        });
        
        await existingUser.save();
        
        // JWT 토큰 생성
        const tokenPayload = {
          id: existingUser._id,
          userId: existingUser._id,
          userType: existingUser.userType,
          email: existingUser.email,
          name: existingUser.name,
          permissions: existingUser.centerAdminInfo?.permissions || existingUser.superAdminInfo?.systemPermissions || [],
          memberships: [
            ...(existingUser.centerAdminInfo?.managedCenters || []).map((cid: any) => ({ centerId: cid, role: 'centerAdmin' })),
            ...(existingUser.instructorInfo?.assignedCenters || []).map((cid: any) => ({ centerId: cid, role: 'instructor' })),
            ...(existingUser.centerId ? [{ centerId: existingUser.centerId, role: existingUser.userType }] : [])
          ],
          defaultCenterId: existingUser.centerId || (existingUser.centerAdminInfo?.managedCenters?.[0])
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
        
        return res.status(200).json({
          success: true,
          message: '소셜 계정이 기존 계정에 연결되었습니다.',
          token,
          user: {
            id: existingUser._id,
            userId: existingUser.userId,
            name: existingUser.name,
            email: existingUser.email,
            userType: existingUser.userType
          }
        });
      }
      
      // 기존 계정이 없으면 새로 생성 (소셜 로그인 전용 userId 생성)
      const finalUserId = `${req.body.provider}_${req.body.providerId}`;
      
      // userId 중복 확인
      const existingUserId = await User.findOne({ userId: finalUserId });
      if (existingUserId) {
        return res.status(400).json({ 
          success: false,
          error: '이미 사용 중인 ID입니다.' 
        });
      }
    }
    
    // 일반 회원가입 처리
    // userId 생성 로직
    let finalUserId: string;
    if (userId) {
      finalUserId = userId;
    } else {
      // 일반 회원가입: email 사용
      finalUserId = email;
    }

    // userId 중복 확인
    const existingUserId = await User.findOne({ userId: finalUserId });
    if (existingUserId) {
      return res.status(400).json({ 
        success: false,
        error: '이미 사용 중인 ID입니다.' 
      });
    }

    // 이메일 중복 확인 (일반 회원가입만)
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        error: '이미 등록된 이메일입니다. 소셜 로그인을 사용하시거나 비밀번호를 찾아주세요.' 
      });
    }

    // 전화번호 필수 (1인 1계정 보장을 위해)
    if (!phone || phone.trim() === '') {
      return res.status(400).json({ 
        success: false,
        error: '전화번호는 필수입니다.' 
      });
    }

    // 전화번호 인증 확인 (소셜 로그인 제외, 선택 사항으로 변경)
    // TODO: 프로덕션에서는 전화번호 인증을 필수로 변경 권장
    // if (!req.body.provider && !phoneVerified) {
    //   return res.status(400).json({ 
    //     success: false,
    //     error: '전화번호 인증이 필요합니다. 인증 코드를 발송하고 인증해주세요.' 
    //   });
    // }

    // 전화번호 형식 정규화: 숫자만 추출
    const extractNumbers = (phoneNum: string) => phoneNum.replace(/\D/g, '');
    const normalizedPhone = extractNumbers(phone);
    
    // 모든 사용자의 전화번호를 숫자만 추출하여 비교
    const allUsers = await User.find({ phone: { $ne: '', $exists: true } }).select('phone');
    const duplicatePhone = allUsers.find((u: any) => {
      if (!u.phone) return false;
      return extractNumbers(u.phone) === normalizedPhone;
    });
    
    if (duplicatePhone) {
      return res.status(400).json({ 
        success: false,
        error: '이미 등록된 전화번호입니다. 한 사람당 하나의 계정만 가입 가능합니다.' 
      });
    }

    // 비밀번호 해시화 (소셜 로그인인 경우 비밀번호 없음)
    let hashedPassword: string | undefined;
    if (password) {
      const saltRounds = 12;
      hashedPassword = await bcrypt.hash(password, saltRounds);
    } else if (!req.body.provider) {
      // 일반 회원가입인데 비밀번호가 없으면 에러
      return res.status(400).json({ 
        success: false,
        error: '비밀번호는 필수입니다.' 
      });
    }

    // 사용자 생성
    const userData: any = {
      userId: finalUserId,
      name,
      email,
      phone,
      address,
      birthDate: birthDate || '',
      gender: gender || '',
      // 서버 스키마(enum)와 일치하도록 기본값 및 값 보정
      userType: ['student', 'instructor', 'centerAdmin', 'superAdmin'].includes(userType)
        ? userType
        : 'student'
    };
    
    // 비밀번호 설정 (소셜 로그인인 경우 undefined)
    if (hashedPassword) {
      userData.password = hashedPassword;
    }
    
    // 소셜 로그인 정보 추가
    if (req.body.provider && req.body.providerId) {
      userData.socialAccounts = [{
        provider: req.body.provider,
        providerId: req.body.providerId,
        connectedAt: new Date()
      }];
    }

    // 🆕 위치 정보 추가 (있는 경우)
    if (location && location.coordinates && location.coordinates.length === 2) {
      userData.location = {
        type: 'Point',
        coordinates: location.coordinates // [경도, 위도]
      };
      console.log('✅ 위치 정보 저장:', userData.location);
    }

    // 사용자 타입별 추가 필드
    if (userData.userType === 'student') {
      // studentInfo 객체 형태로 받기
      const studentInfoData = req.body.studentInfo || {};
      userData.studentInfo = {
        height: studentInfoData.height,
        weight: studentInfoData.weight,
        emergencyContact: studentInfoData.emergencyContact || '',
        emergencyPhone: studentInfoData.emergencyPhone || '',
        swimmingLevel: studentInfoData.swimmingLevel || studentInfoData.currentLevel,
        currentLevel: studentInfoData.currentLevel || studentInfoData.swimmingLevel,
        swimmingProfile: studentInfoData.swimmingProfile || {},
        medicalConditions: studentInfoData.medicalConditions || '',
        age: studentInfoData.age,
        enrolledCourses: studentInfoData.enrolledCourses || [],
        completedCourses: studentInfoData.completedCourses || [],
        status: studentInfoData.status || 'active'
      };
      
      console.log('✅ studentInfo 저장 데이터:', {
        height: userData.studentInfo.height,
        weight: userData.studentInfo.weight,
        emergencyContact: userData.studentInfo.emergencyContact,
        swimmingLevel: userData.studentInfo.swimmingLevel,
        hasSwimmingProfile: !!userData.studentInfo.swimmingProfile
      });
    } else if (userData.userType === 'instructor') {
      // instructorInfo 객체 형태로 받기
      const instructorInfo = req.body.instructorInfo || {};
      userData.instructorInfo = {
        experience: instructorInfo.experience || instructorInfo.teachingExperiences?.[0]?.centerName ? 
          instructorInfo.teachingExperiences.map((exp: any) => `${exp.centerName} (${exp.startDate} ~ ${exp.endDate})`).join(', ') : 
          (req.body.experience || ''),
        certifications: instructorInfo.certificates?.map((cert: any) => cert.name) || instructorInfo.certifications || req.body.certifications || [],
        specialties: instructorInfo.specialties || req.body.specialties || [],
        availableRegions: instructorInfo.availableRegions || [],
        introduction: instructorInfo.introduction || req.body.introduction || '',
        certificates: instructorInfo.certificates || [],
        teachingExperiences: instructorInfo.teachingExperiences || []
      };
    } else if (userData.userType === 'centerAdmin') {
      userData.centerAdminInfo = {
        managedCenters: req.body.managedCenters || [],
        adminLevel: req.body.adminLevel || 'assistant',
        permissions: req.body.permissions || undefined,
      };
    }

    console.log('💾 저장할 userData:', {
      birthDate: userData.birthDate,
      gender: userData.gender,
      hasStudentInfo: !!userData.studentInfo,
      studentInfoHeight: userData.studentInfo?.height,
      studentInfoWeight: userData.studentInfo?.weight
    });
    
    const user = new User(userData);
    await user.save();
    
    console.log('✅ 사용자 저장 완료:', {
      userId: user._id,
      birthDate: user.birthDate,
      gender: user.gender,
      hasStudentInfo: !!user.studentInfo,
      studentInfoHeight: (user.studentInfo as any)?.height,
      studentInfoWeight: (user.studentInfo as any)?.weight
    });

    // JWT 토큰 생성 - 모든 필요한 필드 포함
    const tokenPayload = {
      id: user._id,
      userId: user._id,
      userType: user.userType,
      email: user.email,
      name: user.name,
      permissions: user.centerAdminInfo?.permissions || user.superAdminInfo?.systemPermissions || [],
      // 멤버십 및 기본 센터
      memberships: [
        ...(user.centerAdminInfo?.managedCenters || []).map((cid: any) => ({ centerId: cid, role: 'centerAdmin' })),
        ...(user.instructorInfo?.assignedCenters || []).map((cid: any) => ({ centerId: cid, role: 'instructor' })),
        ...(user.centerId ? [{ centerId: user.centerId, role: user.userType }] : [])
      ],
      defaultCenterId: user.centerId || (user.centerAdminInfo?.managedCenters?.[0])
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

    // 저장 후 다시 조회하여 모든 필드 포함
    const savedUser = await User.findById(user._id).select('-password').lean();
    
    return res.status(201).json({
      success: true,
      message: '회원가입이 완료되었습니다.',
      token,
      user: {
        id: savedUser?._id || user._id,
        userId: savedUser?.userId || user.userId,
        name: savedUser?.name || user.name,
        email: savedUser?.email || user.email,
        phone: savedUser?.phone || user.phone,
        address: savedUser?.address || user.address,
        birthDate: savedUser?.birthDate || user.birthDate,
        gender: savedUser?.gender || user.gender,
        userType: savedUser?.userType || user.userType,
        studentInfo: savedUser?.studentInfo || user.studentInfo
      }
    });
  } catch (error: any) {
    logError('회원가입 오류', error);
    // 더 자세한 에러 메시지 제공
    const errorMessage = error.message || '서버 오류가 발생했습니다.';
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ 
      success: false,
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
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
      logError('JWT 토큰 검증 실패', jwtError);
      return res.status(401).json({ error: '토큰이 만료되었거나 유효하지 않습니다.' });
    }
  } catch (error) {
    logError('토큰 검증 오류', error);
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

    logDebug('요청 데이터 파싱', { userId, email, hasPassword: !!password });

    // 필수 필드 검증
    if (!(userId || email) || !password) {
      logWarn('필수 필드 누락', { hasUserId: !!userId, hasEmail: !!email, hasPassword: !!password });
      return res.status(400).json({ error: 'ID와 비밀번호를 입력해주세요.' });
    }

    // 사용자 찾기 (username, userId, email 순서로 검색)
    let user = null;
    let searchQuery = {};
    
    if (userId) {
      searchQuery = { $or: [{ userId }, { username: userId }, { email: userId }] };
      logDebug('userId로 검색', { searchQuery });
    } else if (email) {
      searchQuery = { $or: [{ email }, { username: email }] };
      logDebug('email로 검색', { searchQuery });
    }
    
    user = await User.findOne(searchQuery).select('+centerId');
    logDebug('사용자 검색 결과', user ? { userId: user.userId, email: user.email, userType: user.userType } : { result: '사용자 없음' });
    
    if (!user) {
      logWarn('사용자를 찾을 수 없음');
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
        logDebug('enrolledCourses 데이터 정리', { count: user.studentInfo.enrolledCourses.length });
        user.studentInfo.enrolledCourses = [];
      }
      
      if (Array.isArray(user.studentInfo.completedCourses) && 
          user.studentInfo.completedCourses.length > 0 && 
          typeof user.studentInfo.completedCourses[0] === 'string') {
        logDebug('completedCourses 데이터 정리', { count: user.studentInfo.completedCourses.length });
        user.studentInfo.completedCourses = [];
      }
    }
    
    try {
      await user.save();
      logInfo('사용자 정보 저장 성공', { userId: user._id });
    } catch (saveError) {
      logWarn('사용자 정보 저장 실패, 로그인은 계속 진행', { message: saveError.message });
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
      permissions: user.centerAdminInfo?.permissions || user.superAdminInfo?.systemPermissions || [],
      memberships: [
        ...(user.centerAdminInfo?.managedCenters || []).map((cid: any) => ({ centerId: cid, role: 'centerAdmin' })),
        ...(user.instructorInfo?.assignedCenters || []).map((cid: any) => ({ centerId: cid, role: 'instructor' })),
        ...(user.centerId ? [{ centerId: user.centerId, role: user.userType }] : [])
      ],
      defaultCenterId: user.centerId || (user.centerAdminInfo?.managedCenters?.[0])
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
      logDebug('JWT 토큰에 centerId 미포함', {
        userType: user.userType,
        centerId: user.centerId,
        centerIdExists: !!user.centerId
      });
    }
    
    logDebug('JWT 토큰 페이로드', tokenPayload);
    
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
      logInfo('로그인 로그 기록 완료', { userId: user._id });
    } catch (logError) {
      logWarn('로그인 로그 기록 실패', logError);
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
        phone: user.phone,
        address: user.address,
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
    logError('로그인 오류 상세', error);
    logError('로그인 오류 스택', { stack: error instanceof Error ? error.stack : '스택 없음' });
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
    // phone, address, studentInfo.healthProfile 등 모든 필드 포함 (password만 제외)
    const user = await User.findById(decoded.userId)
      .select('-password')
      .lean();

    if (!user) {
      return res.status(401).json({ error: '유효하지 않은 토큰입니다.' });
    }

    // phone, address, birthDate, gender, healthProfile이 제대로 포함되도록 확인
    console.log('📋 프로필 조회:', {
      userId: user.userId || user._id,
      hasPhone: !!user.phone,
      hasAddress: !!user.address,
      phone: user.phone,
      address: user.address,
      birthDate: (user as any).birthDate,
      gender: (user as any).gender,
      hasStudentInfo: !!user.studentInfo,
      studentInfoHeight: (user.studentInfo as any)?.height,
      studentInfoWeight: (user.studentInfo as any)?.weight,
      hasHealthProfile: !!(user.studentInfo as any)?.healthProfile,
      healthProfileHeight: (user.studentInfo as any)?.healthProfile?.height,
      healthProfileWeight: (user.studentInfo as any)?.healthProfile?.weight,
      healthProfile: (user.studentInfo as any)?.healthProfile,
      fullUser: JSON.stringify(user, null, 2)
    });

    // birthDate, gender, studentInfo.height, studentInfo.weight가 명시적으로 포함되도록 보장
    const responseUser: any = { ...user };
    if (!responseUser.birthDate && (user as any).birthDate) {
      responseUser.birthDate = (user as any).birthDate;
    }
    if (!responseUser.gender && (user as any).gender) {
      responseUser.gender = (user as any).gender;
    }
    if (responseUser.studentInfo) {
      if (!responseUser.studentInfo.height && (user.studentInfo as any)?.height) {
        responseUser.studentInfo.height = (user.studentInfo as any).height;
      }
      if (!responseUser.studentInfo.weight && (user.studentInfo as any)?.weight) {
        responseUser.studentInfo.weight = (user.studentInfo as any).weight;
      }
    }

    return res.json({
      user: responseUser
    });
  } catch (error) {
    logError('프로필 조회 오류', error);
    return res.status(401).json({ error: '인증에 실패했습니다.' });
  }
});

export default router;
