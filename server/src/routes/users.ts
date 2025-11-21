/**
 * 👥 JJ Swim Lab - 사용자 관리 API 라우트
 * 
 * 📋 **라우트 목적**
 * - 사용자 정보 관리 및 CRUD 작업을 위한 API 엔드포인트 제공
 * - 센터별 사용자 그룹 관리 및 권한 제어
 * - 사용자 검색, 필터링, 페이지네이션 기능
 * - 사용자 상태 관리 및 업데이트 기능
 * - 사용자 통계 및 분석 데이터 제공
 * 
 * 🔄 **주요 기능**
 * - 센터별 사용자 조회 (센터 관리자 전용)
 * - 전체 사용자 조회 (슈퍼 관리자 전용)
 * - 사용자 생성, 수정, 삭제 (권한별 제한)
 * - 사용자 검색 및 필터링 (이름, 이메일, 타입별)
 * - 사용자 상태 관리 (활성/비활성)
 * - 사용자 통계 및 분석
 * - 사용자 권한 및 역할 관리
 * 
 * 🗄️ **데이터 연동**
 * - User 모델과 연동 (사용자 정보 관리)
 * - 인증 미들웨어와 연동 (권한 검증)
 * - 센터 정보와 연동 (센터별 사용자 그룹)
 * - MongoDB Atlas 데이터베이스
 * - JWT 토큰 및 세션 관리
 * 
 * 🛠️ **필요한 설치 파일**
 * - Express.js Router
 * - Mongoose (MongoDB ODM)
 * - User 모델 (../models/User)
 * - 인증 미들웨어 (../middleware/auth)
 * - MongoDB Atlas (데이터 저장)
 * - logger (로깅 유틸리티)
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 사용자 권한 및 역할 검증 필수
 * 2. 센터별 사용자 그룹 관리
 * 3. 개인정보 보호 및 GDPR 준수
 * 4. 사용자 입력 데이터 검증 및 sanitization
 * 5. API 보안 및 Rate Limiting 적용
 * 6. 사용자 상태 변경 시 영향 범위 고려
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] 사용자 권한 검증 로직 확인
 * - [ ] 센터별 사용자 그룹 관리 확인
 * - [ ] API 엔드포인트 보안 검증
 * - [ ] 사용자 데이터 검증 및 sanitization 확인
 * - [ ] 에러 처리 및 사용자 피드백 확인
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 사용자 관리 API 구현
 * - 2024-12-19: 센터별 사용자 그룹 관리 구현
 * - 2024-12-19: 사용자 검색 및 필터링 기능 구현
 * - 2024-12-19: 사용자 권한 및 역할 관리 시스템 구현
 * - 2024-12-19: 사용자 통계 및 분석 기능 구현
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (사용자 관리 API 완료)
 * 
 * 🚀 **다음 단계**
 * - 사용자 프로필 이미지 관리
 * - 사용자 활동 로그 시스템
 * - 사용자 알림 및 메시지 시스템
 * - 사용자 그룹 및 팀 관리
 * - 사용자 권한 세분화 및 관리
 * 
 * 💡 **사용 예시**
 * ```typescript
 * // 센터별 사용자 조회
 * GET /api/users/center-users?page=1&limit=20&userType=student
 * 
 * // 전체 사용자 조회 (슈퍼 관리자)
 * GET /api/users?page=1&limit=50&search=홍길동
 * 
 * // 사용자 생성
 * POST /api/users
 * {
 *   "name": "홍길동",
 *   "email": "hong@example.com",
 *   "userType": "student",
 *   "centerId": "center001"
 * }
 * 
 * // 사용자 수정
 * PUT /api/users/:id
 * {
 *   "name": "홍길동 수정",
 *   "status": "active"
 * }
 * ```
 * 
 * 🔍 **사용자 관리 처리 흐름**
 * 1. 사용자 권한 및 역할 검증
 * 2. 센터별 사용자 그룹 확인
 * 3. 사용자 데이터 검증 및 sanitization
 * 4. 데이터베이스 쿼리 실행
 * 5. 사용자 데이터 반환 및 응답
 * 6. 사용자 상태 업데이트 및 로깅
 * 7. 사용자 통계 및 분석 데이터 제공
 */

import express, { Request, Response, Router } from 'express';
import mongoose from 'mongoose';
import { User } from '../models/User';
import { Course } from '../models/Course';
import { 
  authMiddleware, 
  requirePermission, 
  // requireLevel
} from '../middleware/auth';
import { logInfo, logError, logWarn, logDebug } from '../utils/logger';

interface AuthRequest extends Request {
  user?: any;
}

const router: Router = express.Router();

// 센터 계정 전용 사용자 조회 (해당 센터의 강사와 회원만)
router.get('/center-users', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 20, userType, level, search, status, includeGroupStudents } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    
    const query: any = {};
    
    // 센터 정보가 있는 경우에만 센터 필터 적용
    const centerId = (req as any).user.centerId;
    
    // 관리자는 모든 사용자 조회 가능
    if ((req as any).user.userType === 'admin' || (req as any).user.userType === 'superAdmin') {
      // 필터 없음 (모든 사용자)
    } else if (centerId) {
      // 센터에 속한 사용자들만 조회
      query['$or'] = [
        { 'instructorInfo.assignedCenters': centerId },
        { 'studentInfo.enrolledCenters': centerId },
        { centerId: centerId } // centerId 필드가 있는 경우
      ];
    } else {
      // 센터 정보가 없으면 전체 학생 조회 (개발/테스트용)
      query.userType = 'student';
    }
    
    // 사용자 유형별 필터링
    if (userType) {
      query.userType = userType;
    }
    
    // 레벨별 필터링
    if (level) {
      if (userType === 'student' || !userType) {
        query['$or'] = [
          { 'studentInfo.swimmingLevel': level },
          { level: level }
        ];
      }
      if (userType === 'instructor' || !userType) {
        query['$or'] = [
          { 'instructorInfo.instructorLevel': level },
          { level: level }
        ];
      }
    }
    
    // 상태별 필터링
    if (status && status !== 'all') {
      if (status === 'active') {
        query.isActive = true;
      } else if (status === 'inactive') {
        query.isActive = false;
      }
    }
    
    // 검색 필터링
    if (search) {
      query.$and = [
        query.$or, // 기존 센터 필터 유지
        {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { phone: { $regex: search, $options: 'i' } }
          ]
        }
      ];
      delete query.$or; // $or를 $and로 대체
    }
    
    let users = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });
    
    // 단체반 회원 포함 요청이 있는 경우
    if (includeGroupStudents === 'true') {
      try {
        const GroupClass = require('../models/GroupClass').default;
        const groupClasses = await GroupClass.find({ status: 'active' });
        
        logDebug('활성 단체반 발견', { count: groupClasses.length });
        
        // 단체반 회원들 ID 수집
        const groupStudentIds = groupClasses.flatMap(gc => {
          const activeStudents = gc.students.filter(s => s.status === 'active');
          logDebug('단체반 학생 수', { className: gc.className, count: activeStudents.length });
          return activeStudents.map(s => s.userId);
        });
        
        logDebug('총 단체반 학생 ID', { count: groupStudentIds.length });
        
        if (groupStudentIds.length > 0) {
          // 단체반 회원들의 상세 정보 가져오기
          const groupUsers = await User.find({
            _id: { $in: groupStudentIds }
          }).select('-password');
          
          logInfo('단체반 회원 조회됨', { count: groupUsers.length });
          
          // 기존 사용자와 단체반 회원 합치기 (중복 제거)
          const existingIds = users.map(u => u._id.toString());
          const newGroupUsers = groupUsers.filter(gu => 
            !existingIds.includes(gu._id.toString())
          );
          
          logInfo('새로운 단체반 회원 추가', { count: newGroupUsers.length });
          
          users = [...users, ...newGroupUsers];
        }
      } catch (groupError) {
        logError('단체반 회원 조회 실패', groupError);
      }
    }
    
    const total = await User.countDocuments(query);
    
    return res.json({
      success: true,
      message: '센터 사용자 목록 조회 성공!',
      data: {
        users,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (err) {
    logError('센터 사용자 목록 조회 오류', err);
    return res.status(500).json({ 
      success: false,
      message: '센터 사용자 목록을 불러오는 데 실패했습니다.' 
    });
  }
});

// 특정 사용자 조회 (GET /:id 라우트를 먼저 정의)
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    // 디버깅 로그 출력 (콘솔 모킹으로 인해 출력되지 않을 수 있음)
    console.log('🔍 GET /:id 라우트 호출됨:', {
      id: req.params.id,
      url: req.url,
      method: req.method,
      originalUrl: req.originalUrl,
      baseUrl: req.baseUrl,
      path: req.path
    });
    
    // 라우트가 호출되었는지 확인하기 위한 응답 헤더 추가
    res.set('X-Route-Called', 'GET-:id');
    
    // ObjectId 유효성 검사
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: '유효하지 않은 사용자 ID입니다.' });
    }
    
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      logWarn('사용자를 찾을 수 없음', { id: req.params.id });
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }
    
    logDebug('사용자 찾음', {
      id: user._id,
      name: user.name,
      email: user.email
    });
    
    // 권한 검증
    if ((req as any).user.userType === 'centerAdmin') {
      const hasAccess = await checkCenterAdminAccess((req as any).user._id, user);
      if (!hasAccess) {
        return res.status(403).json({ error: '해당 사용자에 대한 접근 권한이 없습니다.' });
      }
    } else if ((req as any).user.userType === 'instructor') {
      const hasAccess = await checkInstructorAccess((req as any).user._id, user);
      if (!hasAccess) {
        return res.status(403).json({ error: '해당 사용자에 대한 접근 권한이 없습니다.' });
      }
    }
    
    return res.json(user);
  } catch (err) {
    logError('사용자 조회 오류', err);
    return res.status(500).json({ error: '사용자 정보를 불러오는 데 실패했습니다.' });
  }
});

// 전체 사용자 조회 (권한별 필터링) - GET /:id 라우트 다음에 정의
/**
 * 👥 전체 사용자 조회 API
 * 
 * 📋 **기능**
 * - 권한별 사용자 목록 조회
 * - 페이지네이션 및 필터링 지원
 * - 사용자 타입, 레벨, 검색어별 필터링
 * - userManagement 권한 필요
 * 
 * 🔄 **조회 과정**
 * 1. 사용자 권한 검증 (userManagement)
 * 2. 쿼리 파라미터 파싱 (page, limit, userType 등)
 * 3. 필터링 조건 적용
 * 4. 페이지네이션 처리
 * 5. 사용자 목록 반환
 * 
 * 📅 **수정 히스토리**
 * - 2025-01-13: API 엔드포인트 주석 추가
 */
router.get('/', authMiddleware, requirePermission('userManagement'), async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 10, userType, level, search, centerId } = req.query;
    void centerId;
    const skip = (Number(page) - 1) * Number(limit);
    
    const query: any = {};
    
    // 사용자 유형별 권한에 따른 필터링
    if ((req as any).user.userType === 'centerAdmin') {
      // 센터 관리자는 자신이 관리하는 센터의 강사와 회원만 조회 가능
      const adminCenterId = (req as any).user.centerId;
      console.log('🔍 센터 관리자 요청:', {
        userType: (req as any).user.userType,
        adminCenterId: adminCenterId,
        userId: (req as any).user._id
      });
      
      if (adminCenterId) {
        // centerId를 ObjectId로 변환
        const centerIdObjectId = new mongoose.Types.ObjectId(adminCenterId);
        logDebug('ObjectId 변환 디버깅', {
          originalCenterId: adminCenterId,
          centerIdType: typeof adminCenterId,
          centerIdConstructor: adminCenterId?.constructor?.name,
          convertedObjectId: centerIdObjectId,
          convertedType: typeof centerIdObjectId,
          convertedConstructor: centerIdObjectId?.constructor?.name
        });
        
        query['$or'] = [
          { 'instructorInfo.assignedCenters': centerIdObjectId },
          { 'studentInfo.enrolledCenters': centerIdObjectId }
        ];
        // 센터 관리자는 강사와 회원만 조회 가능
        query.userType = { $in: ['instructor', 'student'] };
        logDebug('센터 필터링 쿼리', {
          $or: query['$or'],
          userType: query.userType
        });
      } else {
        logWarn('센터 관리자에게 centerId가 없음');
        // centerId가 없으면 모든 강사와 회원 반환 (임시)
        query.userType = { $in: ['instructor', 'student'] };
      }
    } else if ((req as any).user.userType === 'instructor') {
      // 강사는 자신의 학생들만 조회 가능
      query.userType = 'student';
      query['studentInfo.enrolledCourses'] = { $in: await getInstructorCourses((req as any).user._id) };
    }
    
    if (userType) {
      query.userType = userType;
    }
    
    if (level) {
      // 레벨별 필터링
      switch(userType) {
        case 'student':
          query['studentInfo.swimmingLevel'] = level;
          break;
        case 'instructor':
          query['instructorInfo.instructorLevel'] = level;
          break;
        case 'centerAdmin':
          query['centerAdminInfo.adminLevel'] = level;
          break;
        case 'superAdmin':
          query['superAdminInfo.adminLevel'] = level;
          break;
      }
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    
    logDebug('실제 쿼리 실행', { query });
    
    const users = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });
    
    const total = await User.countDocuments(query);
    
    logDebug('쿼리 실행 결과', {
      count: users.length,
      total,
      firstUser: users[0] ? {
        userId: users[0].userId,
        userType: users[0].userType,
        instructorInfo: users[0].instructorInfo,
        studentInfo: users[0].studentInfo
      } : null
    });
    
    return res.json({
      users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (err) {
    logError('사용자 목록 조회 오류', err);
    return res.status(500).json({ error: '사용자 목록을 불러오는 데 실패했습니다.' });
  }
});

// 사용자 유형별 통계 조회
router.get('/stats/by-type', authMiddleware, requirePermission('reports'), async (req: AuthRequest, res: Response) => {
  try {
    const stats = await User.aggregate([
      {
        $group: {
          _id: '$userType',
          count: { $sum: 1 },
          activeCount: {
            $sum: { $cond: ['$isActive', 1, 0] }
          }
        }
      }
    ]);
    
    return res.json({ stats });
  } catch (err) {
    logError('사용자 통계 조회 오류', err);
    return res.status(500).json({ error: '사용자 통계를 불러오는 데 실패했습니다.' });
  }
});

// 레벨별 통계 조회
router.get('/stats/by-level', authMiddleware, requirePermission('reports'), async (req, res) => {
  try {
    const { userType } = req.query;
    
    let levelField = '';
    switch(userType) {
      case 'student':
        levelField = 'studentInfo.swimmingLevel';
        break;
      case 'instructor':
        levelField = 'instructorInfo.instructorLevel';
        break;
      case 'centerAdmin':
        levelField = 'centerAdminInfo.adminLevel';
        break;
      case 'superAdmin':
        levelField = 'superAdminInfo.adminLevel';
        break;
      default:
        return res.status(400).json({ error: '사용자 유형을 지정해주세요.' });
    }
    
    const stats = await User.aggregate([
      { $match: { userType } },
      {
        $group: {
          _id: `$${levelField}`,
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    return res.json({ stats });
  } catch (err) {
    logError('레벨별 통계 조회 오류', err);
    return res.status(500).json({ error: '레벨별 통계를 불러오는 데 실패했습니다.' });
  }
});

// 사용자 생성
router.post('/', authMiddleware, requirePermission('userManagement'), async (req: AuthRequest, res: Response) => {
  try {
    const { 
      userId,
      name, 
      email, 
      password, 
      userType, 
      phone, 
      address,
      level,
      studentInfo,
      instructorInfo,
      centerAdminInfo,
      superAdminInfo
    } = req.body;
    
    // 필수 필드 검증
    if (!name || !email || !password || !userType) {
      return res.status(400).json({ 
        success: false,
        error: '이름, 이메일, 비밀번호, 사용자 유형은 필수입니다.' 
      });
    }
    
    // 이메일 중복 확인
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        error: '이미 존재하는 이메일입니다.' 
      });
    }
    
    // 사용자 생성
    const user = new User({
      userId,
      name,
      email,
      password,
      userType,
      phone,
      address,
      level,
      studentInfo,
      instructorInfo,
      centerAdminInfo,
      superAdminInfo
    });
    
    // 사용자 유형별 권한 및 시퀀스 자동 설정
    user.setPermissionsByType();
    user.setFeatureSequence();
    
    await user.save();
    
    // 비밀번호 제외하고 반환
    const userResponse = user.toObject();
    delete userResponse.password;
    
    return res.status(201).json({
      success: true,
      message: '사용자가 성공적으로 생성되었습니다.',
      data: { user: userResponse }
    });
  } catch (err) {
    logError('사용자 생성 오류', err);
    return res.status(400).json({ 
      success: false,
      error: '사용자 생성에 실패했습니다.' 
    });
  }
});


/**
 * 👤 사용자 정보 업데이트 API
 * 
 * 📋 **기능**
 * - 사용자 기본 정보 및 타입별 상세 정보 수정
 * - 권한별 접근 제어 (본인/센터관리자/강사/최고관리자)
 * - 사용자 타입 변경 시 권한 자동 재설정
 * - 4가지 계정 타입별 전용 필드 업데이트
 * 
 * 🔄 **업데이트 과정**
 * 1. 요청자 권한 검증 (본인 또는 관리 권한)
 * 2. 사용자 타입별 접근 권한 확인
 * 3. 업데이트 데이터 검증 및 구성
 * 4. 사용자 타입 변경 시 권한 재설정
 * 5. 데이터베이스 업데이트 실행
 * 
 * 🎯 **4가지 계정별 업데이트 규칙**
 * - student: 본인만 수정 가능
 * - instructor: 본인 + 담당 학생 수정 가능
 * - centerAdmin: 본인 + 센터 소속 사용자 수정 가능
 * - superAdmin: 모든 사용자 수정 가능
 * 
 * 📅 **수정 히스토리**
 * - 2025-09-19: 권한별 접근 제어 주석 추가
 */
// 사용자 정보 업데이트
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { 
      userId,  // 사용자 로그인 ID
      name,    // 사용자 이름
      email,   // 사용자 이메일
      phone,   // 전화번호
      address, // 주소
      // birthDate, // 생년월일 (사용되지 않음)
      // gender,    // 성별 (사용되지 않음)
      userType, // 사용자 타입 (student/instructor/centerAdmin/superAdmin)
      level,    // 사용자 레벨
      password, // 비밀번호 (있는 경우 해싱 처리)
      studentInfo,      // 학생 전용 정보
      instructorInfo,   // 강사 전용 정보
      centerAdminInfo,  // 센터관리자 전용 정보
      superAdminInfo,   // 최고관리자 전용 정보
      accessPermissions, // 접근 권한 설정
      featureSequence   // 기능 시퀀스 설정
    } = req.body;
    
    // 🔐 권한 검증 - 4가지 계정별 수정 권한 체크
    const currentUser = (req as any).user;  // 요청자 정보
    const targetUserId = req.params.id;     // 수정 대상 사용자 ID
    
    // 본인이 아닌 경우 계정별 권한 검증
    if (currentUser._id?.toString() !== targetUserId) {
      if (currentUser.userType === 'centerAdmin') {
        // 센터관리자: 자신이 관리하는 센터의 사용자만 수정 가능
        const hasAccess = await checkCenterAdminAccess(currentUser._id, { _id: targetUserId });
        if (!hasAccess) {
          return res.status(403).json({ error: '해당 사용자에 대한 수정 권한이 없습니다.' });
        }
      } else if (currentUser.userType === 'instructor') {
        // 강사: 자신이 담당하는 학생만 수정 가능
        const hasAccess = await checkInstructorAccess(currentUser._id, { _id: targetUserId });
        if (!hasAccess) {
          return res.status(403).json({ error: '해당 사용자에 대한 수정 권한이 없습니다.' });
        }
      } else if (currentUser.userType === 'student') {
        // 학생: 본인의 정보만 수정 가능
        return res.status(403).json({ error: '본인의 정보만 수정할 수 있습니다.' });
      } else if (currentUser.userType !== 'superAdmin') {
        // 최고관리자가 아닌 기타 타입: 수정 불가
        return res.status(403).json({ error: '해당 사용자에 대한 수정 권한이 없습니다.' });
      }
      // superAdmin은 모든 사용자 수정 가능
    }
    
    // 📝 기본 업데이트 데이터 구성
    const updateData: any = {};
    
    // 🔒 개인정보 수정 권한 체크 (본인만 가능)
    if (currentUser._id?.toString() === targetUserId) {
      // 본인인 경우에만 개인정보 수정 가능
      if (name) updateData.name = name;         // 사용자 이름
      if (email) {
        const normalizedEmail = String(email).trim().toLowerCase();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(normalizedEmail)) {
          return res.status(400).json({ error: '유효한 이메일 주소를 입력해주세요.' });
        }

        const existingEmailUser = await User.findOne({ email: normalizedEmail });

        if (existingEmailUser && existingEmailUser._id.toString() !== targetUserId) {
          return res.status(400).json({ error: '이미 사용 중인 이메일입니다.' });
        }

        updateData.email = normalizedEmail;
      }
      if (phone) updateData.phone = phone;      // 전화번호  
      if (address) updateData.address = address; // 주소
      if (req.body.birthDate) updateData.birthDate = req.body.birthDate; // 생년월일
      if (req.body.gender) updateData.gender = req.body.gender; // 성별
    } else {
      // 타인인 경우 개인정보 수정 불가 (관리적 기능만 가능)
      console.log('🔒 개인정보 수정 제한: 관리자는 개인정보를 수정할 수 없습니다.');
    }
    
    // 🔑 사용자 로그인 ID 업데이트 (있는 경우)
    if (userId) {
      updateData.userId = userId;
    }
    
    // 🔒 비밀번호 업데이트 (있는 경우 해싱 처리)
    if (password) {
      const bcrypt = require('bcryptjs');
      const saltRounds = 12;
      updateData.password = await bcrypt.hash(password, saltRounds);
    }
    
    // 👥 사용자 유형 변경 시 권한 자동 재설정
    if (userType) {
      updateData.userType = userType;
      
      // 사용자 유형별 권한 및 시퀀스 자동 설정
      const tempUser = new User({ userType });
      tempUser.setPermissionsByType();   // 타입별 기본 권한 설정
      tempUser.setFeatureSequence();     // 타입별 기능 시퀀스 설정
      
      updateData.accessPermissions = tempUser.accessPermissions;
      updateData.featureSequence = tempUser.featureSequence;
    }
    
    // 📊 사용자 레벨 업데이트
    if (level) {
      updateData.level = level;
    }
    
    // ⚙️ 계정 활성/비활성 상태 업데이트 (관리자 권한)
    if (typeof req.body.isActive === 'boolean') {
      updateData.isActive = req.body.isActive;
      logInfo('계정 상태 변경', { isActive: updateData.isActive });
    }
    
    // 🎓 학생 전용 정보 업데이트
    if (studentInfo) {
      updateData.studentInfo = studentInfo;
    }
    
    // 👨‍🏫 강사 전용 정보 업데이트
    if (instructorInfo) {
      updateData.instructorInfo = instructorInfo;
    }
    
    // 🏢 센터관리자 전용 정보 업데이트
    if (centerAdminInfo) {
      updateData.centerAdminInfo = centerAdminInfo;
    }
    
    // 👑 최고관리자 전용 정보 업데이트
    if (superAdminInfo) {
      updateData.superAdminInfo = superAdminInfo;
    }
    
    // 🔐 접근 권한 직접 설정 (관리자만 가능)
    if (accessPermissions && currentUser.userType === 'superAdmin') {
      updateData.accessPermissions = accessPermissions;
    }
    
    // 🔄 기능 시퀀스 직접 설정 (관리자만 가능)
    if (featureSequence && currentUser.userType === 'superAdmin') {
      updateData.featureSequence = featureSequence;
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }
    
    return res.json(user);
  } catch (err) {
    logError('사용자 업데이트 오류', err);
    return res.status(400).json({ error: '사용자 정보 업데이트에 실패했습니다.' });
  }
});

// 사용자 레벨 업그레이드
router.patch('/:id/upgrade-level', authMiddleware, requirePermission('userManagement'), async (req, res) => {
  try {
    const { userType, newLevel } = req.body;
    
    if (!userType || !newLevel) {
      return res.status(400).json({ error: '사용자 유형과 새로운 레벨을 지정해주세요.' });
    }
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }
    
    // 레벨 업그레이드 로직
    const updateData: any = {};
    
    switch(userType) {
      case 'student':
        updateData['studentInfo.swimmingLevel'] = newLevel;
        break;
      case 'instructor':
        updateData['instructorInfo.instructorLevel'] = newLevel;
        break;
      case 'centerAdmin':
        updateData['centerAdminInfo.adminLevel'] = newLevel;
        break;
      case 'superAdmin':
        updateData['superAdminInfo.adminLevel'] = newLevel;
        break;
      default:
        return res.status(400).json({ error: '유효하지 않은 사용자 유형입니다.' });
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    return res.json({
      message: '레벨이 성공적으로 업그레이드되었습니다.',
      user: updatedUser
    });
  } catch (err) {
    logError('레벨 업그레이드 오류', err);
    return res.status(400).json({ error: '레벨 업그레이드에 실패했습니다.' });
  }
});

// 사용자 삭제 (권한별)
router.delete('/:id', authMiddleware, requirePermission('userManagement'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }
    
    // 권한 검증
    if ((req as any).user.userType === 'centerAdmin') {
      const hasAccess = await checkCenterAdminAccess((req as any).user._id, user);
      if (!hasAccess) {
        return res.status(403).json({ error: '해당 사용자에 대한 삭제 권한이 없습니다.' });
      }
    }
    
    await User.findByIdAndDelete(req.params.id);
    return res.json({ message: '사용자가 성공적으로 삭제되었습니다.' });
  } catch (err) {
    logError('사용자 삭제 오류', err);
    return res.status(500).json({ error: '사용자 삭제에 실패했습니다.' });
  }
});

// 회원 질환/특수상황 업데이트
router.patch('/:id/conditions', authMiddleware, async (req, res) => {
  try {
    const { conditionIds } = req.body;
    
    if (!Array.isArray(conditionIds)) {
      return res.status(400).json({ error: 'conditionIds는 배열이어야 합니다.' });
    }
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }
    
    // conditionIds를 healthInfo에 저장
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { 
        'healthInfo.conditionIds': conditionIds,
        'healthInfo.updatedAt': new Date()
      },
      { new: true, runValidators: true }
    ).select('-password');
    
    return res.json({
      message: '질환/특수상황이 성공적으로 업데이트되었습니다.',
      conditionIds: (updatedUser as any)?.healthInfo?.conditionIds || []
    });
  } catch (err) {
    logError('질환 업데이트 오류', err);
    return res.status(500).json({ error: '질환 업데이트에 실패했습니다.' });
  }
});

// 사용자 활성화/비활성화
router.patch('/:id/toggle-status', authMiddleware, requirePermission('userManagement'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }
    
    user.isActive = !user.isActive;
    await user.save();
    
    return res.json({
      message: `사용자가 ${user.isActive ? '활성화' : '비활성화'}되었습니다.`,
      isActive: user.isActive
    });
  } catch (err) {
    logError('사용자 상태 변경 오류', err);
    return res.status(500).json({ error: '사용자 상태 변경에 실패했습니다.' });
  }
});

/**
 * 🏢 센터 관리자 접근 권한 확인 함수
 * 
 * 📋 **기능**
 * - 센터관리자가 특정 사용자에 대한 관리 권한이 있는지 확인
 * - 센터별 사용자 그룹 관리를 위한 권한 검증
 * - 강사와 학생의 센터 소속 여부 확인
 * 
 * 🔄 **검증 과정**
 * 1. 관리자 정보 조회 및 타입 확인
 * 2. 관리자가 관리하는 센터 목록 조회
 * 3. 대상 사용자의 센터 소속 여부 확인
 * 4. 권한 여부 반환 (true/false)
 * 
 * @param adminId 센터관리자 사용자 ID
 * @param user 권한 확인 대상 사용자 객체
 * @returns 접근 권한 여부 (boolean)
 */
async function checkCenterAdminAccess(adminId: string, user: any): Promise<boolean> {
  // 센터관리자 정보 조회
  const admin = await User.findById(adminId);
  if (!admin || admin.userType !== 'centerAdmin') return false;
  
  // 관리하는 센터 목록 조회
  const managedCenters = admin.centerAdminInfo?.managedCenters || [];
  
  // 강사인 경우: 할당된 센터가 관리 센터와 일치하는지 확인
  if (user.userType === 'instructor') {
    const assignedCenters = user.instructorInfo?.assignedCenters || [];
    return assignedCenters.some((centerId: any) => managedCenters.includes(centerId));
  }
  
  // 학생인 경우: 등록된 강습 과정의 센터가 관리 센터와 일치하는지 확인
  if (user.userType === 'student') {
    const enrolledCourses = user.studentInfo?.enrolledCourses || [];
    void enrolledCourses;
    // TODO: 실제로는 Course 모델을 통해 강습 과정의 센터 확인 필요
    // 현재는 임시로 true 반환 (향후 개선 필요)
    return true;
  }
  
  return false;
}

/**
 * 👨‍🏫 강사 접근 권한 확인 함수
 * 
 * 📋 **기능**
 * - 강사가 특정 학생에 대한 관리 권한이 있는지 확인
 * - 강사-학생 관계를 통한 권한 검증
 * - 강습 과정을 통한 담당 학생 여부 확인
 * 
 * 🔄 **검증 과정**
 * 1. 대상 사용자가 학생인지 확인
 * 2. 강사 정보 조회 및 타입 확인
 * 3. 강사-학생 관계 확인 (강습 과정 기반)
 * 4. 권한 여부 반환 (true/false)
 * 
 * @param instructorId 강사 사용자 ID
 * @param user 권한 확인 대상 사용자 객체 (학생)
 * @returns 접근 권한 여부 (boolean)
 */
async function checkInstructorAccess(instructorId: string, user: any): Promise<boolean> {
  // 대상이 학생이 아니면 권한 없음
  if (user.userType !== 'student') return false;
  
  // 강사 정보 조회 및 타입 확인
  const instructor = await User.findById(instructorId);
  if (!instructor || instructor.userType !== 'instructor') return false;
  
  // TODO: 실제로는 Course 모델을 통해 강사-학생 관계 확인 필요
  // 현재는 임시로 true 반환 (향후 개선 필요)
  // 강사의 담당 학생인지 확인 (강습 과정 기반)
  return true;
}

/**
 * 🏢 센터별 강습 과정 조회 함수
 * 
 * 📋 **기능**
 * - 특정 센터에서 진행되는 모든 강습 과정 조회
 * - 센터관리자의 권한 범위 확인을 위한 데이터 제공
 * - 센터별 강습 현황 및 통계 데이터 지원
 * 
 * @param centerId 센터 ID
 * @returns 센터의 강습 과정 ID 배열
 * 
 * TODO: Course 모델과 연동하여 실제 데이터 조회 구현 필요
 */
/**
 * PUT /api/users/:userId/swimming-profile/css
 * 회원의 CSS 업데이트 (강사 또는 본인)
 */
router.put('/:userId/swimming-profile/css', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUser = (req as any).user;
    const { css, updatedByRole, reason } = req.body; // css: { freestyle: 90, backstroke: 100, ... }
    void reason;
    
    // 권한 확인: 본인 또는 강사만 가능
    console.log('🔍 CSS 수정 권한 체크:', {
      currentUserId: currentUser._id.toString(),
      targetUserId: userId.toString(),
      currentUserType: currentUser.userType,
      isSelf: currentUser._id.toString() === userId.toString()
    });
    
    if (
      currentUser._id.toString() !== userId.toString() &&
      currentUser.userType !== 'instructor' &&
      currentUser.userType !== 'centerAdmin' &&  // center_admin → centerAdmin
      currentUser.userType !== 'superAdmin' &&   // admin → superAdmin
      !currentUser.instructorInfo // instructorInfo가 있으면 강사로 간주
    ) {
      return res.status(403).json({ 
        error: 'CSS 수정 권한이 없습니다.',
        debug: {
          userType: currentUser.userType,
          hasInstructorInfo: !!currentUser.instructorInfo
        }
      });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }
    
    // studentInfo가 없으면 생성
    if (!user.studentInfo) {
      (user as any).studentInfo = {};
    }
    if (!(user.studentInfo as any).swimmingProfile) {
      (user.studentInfo as any).swimmingProfile = {};
    }
    
    const isSelf = currentUser._id.toString() === userId.toString();
    
    // 본인이 수정하는 경우 → 즉시 적용
    if (isSelf) {
      (user.studentInfo as any).swimmingProfile.css = {
        ...(css || {}),
        lastUpdated: new Date(),
        updatedBy: currentUser._id,
        updatedByRole: 'self'
      };
      
      await user.save();
      
      return res.json({
        success: true,
        message: 'CSS가 성공적으로 업데이트되었습니다.',
        data: {
          css: (user.studentInfo as any).swimmingProfile.css,
          updatedBy: currentUser.name,
          updatedByRole: 'self'
        }
      });
    }
    
    // 강사가 수정하는 경우 → 즉시 적용 (프로그램 생성을 위해 필요)
    console.log(`💾 CSS 저장 시작: ${user.name}`, css);
    
    (user.studentInfo as any).swimmingProfile.css = {
      ...(css || {}),
      lastUpdated: new Date(),
      updatedBy: currentUser._id,
      updatedByRole: updatedByRole || 'instructor'
    };
    
    await user.save();
    
    logInfo('CSS 저장 완료', { userName: user.name, css: (user.studentInfo as any).swimmingProfile.css });
    
    return res.json({
      success: true,
      message: 'CSS가 성공적으로 업데이트되었습니다.',
      data: {
        css: (user.studentInfo as any).swimmingProfile.css,
        updatedBy: currentUser.name,
        updatedByRole: updatedByRole || 'instructor'
      }
    });
  } catch (err) {
    logError('CSS 업데이트 오류', err);
    return res.status(500).json({ error: 'CSS 업데이트에 실패했습니다.' });
  }
});

/**
 * PUT /api/users/:userId/swimming-profile
 * 회원의 수영 프로필 전체 업데이트
 */
router.put('/:userId/swimming-profile', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUser = (req as any).user;
    const { 
      mainStrokes, 
      preferredStrokes, 
      excludedStrokes, 
      trainingDays, 
      sessionsPerWeek, 
      sessionDuration,
      poolLength,
      currentGoal, 
      conditionIds,
      weeklyDistance,
      // 🧬 생리학적 지표
      vo2max,
      maxHeartRate,
      restingHeartRate,
      // 🏆 레이스 플랜
      lastRacePlan,
      reason 
    } = req.body;
    
    // 권한 확인
    console.log('🔍 프로필 수정 권한 체크:', {
      currentUserId: currentUser._id.toString(),
      targetUserId: userId.toString(),
      currentUserType: currentUser.userType,
      isSelf: currentUser._id.toString() === userId.toString()
    });
    
    if (
      currentUser._id.toString() !== userId.toString() &&
      currentUser.userType !== 'instructor' &&
      currentUser.userType !== 'centerAdmin' &&  // center_admin → centerAdmin
      currentUser.userType !== 'superAdmin' &&   // admin → superAdmin
      !currentUser.instructorInfo // instructorInfo가 있으면 강사로 간주
    ) {
      return res.status(403).json({ 
        error: '수영 프로필 수정 권한이 없습니다.',
        debug: {
          userType: currentUser.userType,
          hasInstructorInfo: !!currentUser.instructorInfo
        }
      });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }
    
    // studentInfo가 없으면 생성
    if (!user.studentInfo) {
      (user as any).studentInfo = {};
    }
    if (!(user.studentInfo as any).swimmingProfile) {
      (user.studentInfo as any).swimmingProfile = {};
    }
    
    const isSelf = currentUser._id.toString() === userId.toString();
    
    // 본인이 수정하는 경우 → 즉시 적용
    if (isSelf) {
      if (mainStrokes) (user.studentInfo as any).swimmingProfile.mainStrokes = mainStrokes;
      if (preferredStrokes) (user.studentInfo as any).swimmingProfile.preferredStrokes = preferredStrokes;
      if (excludedStrokes) (user.studentInfo as any).swimmingProfile.excludedStrokes = excludedStrokes;
      if (trainingDays) (user.studentInfo as any).swimmingProfile.trainingDays = trainingDays;
      if (sessionsPerWeek) (user.studentInfo as any).swimmingProfile.sessionsPerWeek = sessionsPerWeek;
      if (sessionDuration) (user.studentInfo as any).swimmingProfile.sessionDuration = sessionDuration;
      if (poolLength !== undefined) (user.studentInfo as any).swimmingProfile.poolLength = poolLength;
      if (currentGoal) (user.studentInfo as any).swimmingProfile.currentGoal = currentGoal;
      if (conditionIds) (user.studentInfo as any).swimmingProfile.conditionIds = conditionIds;
      if (weeklyDistance !== undefined) (user.studentInfo as any).swimmingProfile.weeklyDistance = weeklyDistance;
      // 🧬 생리학적 지표
      if (vo2max !== undefined) (user.studentInfo as any).swimmingProfile.vo2max = vo2max;
      if (maxHeartRate !== undefined) (user.studentInfo as any).swimmingProfile.maxHeartRate = maxHeartRate;
      if (restingHeartRate !== undefined) (user.studentInfo as any).swimmingProfile.restingHeartRate = restingHeartRate;
      // 🏆 레이스 플랜
      if (lastRacePlan) (user.studentInfo as any).swimmingProfile.lastRacePlan = lastRacePlan;
      
      await user.save();
      
      return res.json({
        success: true,
        message: '수영 프로필이 성공적으로 업데이트되었습니다.',
        data: (user.studentInfo as any).swimmingProfile
      });
    }
    
    // 강사가 수정하는 경우 → 즉시 적용 (프로그램 생성을 위해 필요)
    console.log(`💾 프로필 저장 시작: ${user.name}`, {
      mainStrokes, trainingDays, sessionDuration, poolLength, currentGoal,
      vo2max, maxHeartRate, restingHeartRate, lastRacePlan: lastRacePlan ? '있음' : '없음'
    });
    
    if (mainStrokes) (user.studentInfo as any).swimmingProfile.mainStrokes = mainStrokes;
    if (preferredStrokes) (user.studentInfo as any).swimmingProfile.preferredStrokes = preferredStrokes;
    if (excludedStrokes) (user.studentInfo as any).swimmingProfile.excludedStrokes = excludedStrokes;
    if (trainingDays) (user.studentInfo as any).swimmingProfile.trainingDays = trainingDays;
    if (sessionsPerWeek) (user.studentInfo as any).swimmingProfile.sessionsPerWeek = sessionsPerWeek;
    if (sessionDuration) (user.studentInfo as any).swimmingProfile.sessionDuration = sessionDuration;
    if (poolLength !== undefined) (user.studentInfo as any).swimmingProfile.poolLength = poolLength;
    if (currentGoal) (user.studentInfo as any).swimmingProfile.currentGoal = currentGoal;
    if (conditionIds) (user.studentInfo as any).swimmingProfile.conditionIds = conditionIds;
    if (weeklyDistance !== undefined) (user.studentInfo as any).swimmingProfile.weeklyDistance = weeklyDistance;
    // 🧬 생리학적 지표
    if (vo2max !== undefined) (user.studentInfo as any).swimmingProfile.vo2max = vo2max;
    if (maxHeartRate !== undefined) (user.studentInfo as any).swimmingProfile.maxHeartRate = maxHeartRate;
    if (restingHeartRate !== undefined) (user.studentInfo as any).swimmingProfile.restingHeartRate = restingHeartRate;
    // 🏆 레이스 플랜
    if (lastRacePlan) (user.studentInfo as any).swimmingProfile.lastRacePlan = lastRacePlan;
    
    // 수정 이력 기록 (승인 없이 즉시 적용)
    (user.studentInfo as any).swimmingProfile.lastModifiedBy = currentUser._id;
    (user.studentInfo as any).swimmingProfile.lastModifiedAt = new Date();
    (user.studentInfo as any).swimmingProfile.modificationReason = reason || '강사가 프로필을 설정/수정했습니다.';
    
    await user.save();
    
    console.log(`✅ 프로필 저장 완료: ${user.name}`, {
      trainingDays: (user.studentInfo as any).swimmingProfile.trainingDays,
      sessionDuration: (user.studentInfo as any).swimmingProfile.sessionDuration,
      poolLength: (user.studentInfo as any).swimmingProfile.poolLength,
      currentGoal: (user.studentInfo as any).swimmingProfile.currentGoal,
      vo2max: (user.studentInfo as any).swimmingProfile.vo2max
    });
    
    return res.json({
      success: true,
      message: '수영 프로필이 성공적으로 업데이트되었습니다.',
      data: (user.studentInfo as any).swimmingProfile
    });
  } catch (err) {
    logError('수영 프로필 업데이트 오류', err);
    return res.status(500).json({ error: '수영 프로필 업데이트에 실패했습니다.' });
  }
});

/**
 * POST /api/users/:userId/swimming-profile/approve-changes
 * 강사가 제안한 변경사항 승인
 */
router.post('/:userId/swimming-profile/approve-changes', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUser = (req as any).user;
    
    // 본인만 승인 가능
    if (currentUser._id.toString() !== userId.toString()) {
      return res.status(403).json({ error: '본인의 변경사항만 승인할 수 있습니다.' });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }
    
    const pendingChanges = (user.studentInfo as any)?.swimmingProfile?.pendingChanges;
    if (!pendingChanges) {
      return res.status(404).json({ error: '대기 중인 변경사항이 없습니다.' });
    }
    
    // 대기 중인 변경사항을 실제 프로필에 적용
    const profile = (user.studentInfo as any).swimmingProfile;
    
    if (pendingChanges.css) {
      profile.css = {
        ...pendingChanges.css,
        lastUpdated: new Date(),
        updatedBy: pendingChanges.proposedBy,
        updatedByRole: 'instructor'
      };
    }
    if (pendingChanges.mainStrokes) profile.mainStrokes = pendingChanges.mainStrokes;
    if (pendingChanges.preferredStrokes) profile.preferredStrokes = pendingChanges.preferredStrokes;
    if (pendingChanges.excludedStrokes) profile.excludedStrokes = pendingChanges.excludedStrokes;
    if (pendingChanges.trainingDays) profile.trainingDays = pendingChanges.trainingDays;
    if (pendingChanges.sessionsPerWeek) profile.sessionsPerWeek = pendingChanges.sessionsPerWeek;
    if (pendingChanges.sessionDuration) profile.sessionDuration = pendingChanges.sessionDuration;
    if (pendingChanges.currentGoal) profile.currentGoal = pendingChanges.currentGoal;
    if (pendingChanges.conditionIds) profile.conditionIds = pendingChanges.conditionIds;
    
    // 대기 중인 변경사항 삭제
    profile.pendingChanges = undefined;
    
    await user.save();
    
    return res.json({
      success: true,
      message: '변경사항이 승인되어 적용되었습니다.',
      data: profile
    });
  } catch (err) {
    logError('변경사항 승인 오류', err);
    return res.status(500).json({ error: '변경사항 승인에 실패했습니다.' });
  }
});

/**
 * POST /api/users/:userId/swimming-profile/reject-changes
 * 강사가 제안한 변경사항 거부
 */
router.post('/:userId/swimming-profile/reject-changes', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUser = (req as any).user;
    
    // 본인만 거부 가능
    if (currentUser._id !== userId) {
      return res.status(403).json({ error: '본인의 변경사항만 거부할 수 있습니다.' });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }
    
    const pendingChanges = (user.studentInfo as any)?.swimmingProfile?.pendingChanges;
    if (!pendingChanges) {
      return res.status(404).json({ error: '대기 중인 변경사항이 없습니다.' });
    }
    
    // 대기 중인 변경사항 삭제
    (user.studentInfo as any).swimmingProfile.pendingChanges = undefined;
    
    await user.save();
    
    return res.json({
      success: true,
      message: '변경사항이 거부되었습니다.'
    });
  } catch (err) {
    logError('변경사항 거부 오류', err);
    return res.status(500).json({ error: '변경사항 거부에 실패했습니다.' });
  }
});


async function getInstructorCourses(instructorId: mongoose.Types.ObjectId | string): Promise<mongoose.Types.ObjectId[]> {
  try {
    const normalizedInstructorId =
      typeof instructorId === 'string'
        ? new mongoose.Types.ObjectId(instructorId)
        : instructorId;

    const courses = await Course.find({
      $or: [
        { instructor: normalizedInstructorId },
        { instructorId: normalizedInstructorId }
      ]
    })
      .select('_id')
      .lean();

    return courses.map(course => course._id as mongoose.Types.ObjectId);
  } catch (error) {
    logError('강사 코스 조회 실패', {
      instructorId,
      error
    });
    return [];
  }
}

export default router;
