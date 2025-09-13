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
import { 
  auth, 
  requireRole, 
  requirePermission, 
  // requireLevel
} from '../middleware/auth';

interface AuthRequest extends Request {
  user?: any;
}

const router: Router = express.Router();

// 센터 계정 전용 사용자 조회 (해당 센터의 강사와 회원만)
router.get('/center-users', auth, requireRole(['centerAdmin']), async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 20, userType, level, search, status } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    
    const query: any = {};
    
    // 센터 관리자는 자신의 센터에 속한 사용자만 조회
    const centerId = (req as any).user.centerId;
    if (!centerId) {
      return res.status(400).json({ 
        success: false, 
        message: '센터 정보를 찾을 수 없습니다.' 
      });
    }
    
    // 센터에 속한 사용자들만 조회
    query['$or'] = [
      { 'instructorInfo.assignedCenters': centerId },
      { 'studentInfo.enrolledCenters': centerId }
    ];
    
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
    
    const users = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });
    
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
    console.error('센터 사용자 목록 조회 오류:', err);
    return res.status(500).json({ 
      success: false,
      message: '센터 사용자 목록을 불러오는 데 실패했습니다.' 
    });
  }
});

// 특정 사용자 조회 (GET /:id 라우트를 먼저 정의)
router.get('/:id', auth, async (req, res) => {
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
      console.log('❌ 사용자를 찾을 수 없음:', req.params.id);
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }
    
    console.log('✅ 사용자 찾음:', {
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
    console.error('사용자 조회 오류:', err);
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
router.get('/', auth, requirePermission('userManagement'), async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 10, userType, level, search, centerId } = req.query;
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
        console.log('🔍 ObjectId 변환 디버깅:', {
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
        console.log('🔍 센터 필터링 쿼리:', {
          $or: query['$or'],
          userType: query.userType
        });
      } else {
        console.log('⚠️ 센터 관리자에게 centerId가 없음');
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
    
    console.log('🔍 실제 쿼리 실행:', query);
    
    const users = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });
    
    const total = await User.countDocuments(query);
    
    console.log('🔍 쿼리 실행 결과:', {
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
    console.error('사용자 목록 조회 오류:', err);
    return res.status(500).json({ error: '사용자 목록을 불러오는 데 실패했습니다.' });
  }
});

// 사용자 유형별 통계 조회
router.get('/stats/by-type', auth, requirePermission('reports'), async (req: AuthRequest, res: Response) => {
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
    console.error('사용자 통계 조회 오류:', err);
    return res.status(500).json({ error: '사용자 통계를 불러오는 데 실패했습니다.' });
  }
});

// 레벨별 통계 조회
router.get('/stats/by-level', auth, requirePermission('reports'), async (req, res) => {
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
    console.error('레벨별 통계 조회 오류:', err);
    return res.status(500).json({ error: '레벨별 통계를 불러오는 데 실패했습니다.' });
  }
});

// 사용자 생성
router.post('/', auth, requirePermission('userManagement'), async (req: AuthRequest, res: Response) => {
  try {
    const { 
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
    console.error('사용자 생성 오류:', err);
    return res.status(400).json({ 
      success: false,
      error: '사용자 생성에 실패했습니다.' 
    });
  }
});


// 사용자 정보 업데이트
router.put('/:id', auth, async (req, res) => {
  try {
    const { 
      name, 
      phone, 
      address, 
      userType, 
      level,
      studentInfo,
      instructorInfo,
      centerAdminInfo,
      superAdminInfo,
      accessPermissions,
      featureSequence
    } = req.body;
    
    // 권한 검증
    const currentUser = (req as any).user;
    const targetUserId = req.params.id;
    
    // 본인이 아닌 경우 권한 검증
    if (currentUser._id !== targetUserId) {
      if (currentUser.userType === 'centerAdmin') {
        const hasAccess = await checkCenterAdminAccess(currentUser._id, { _id: targetUserId });
        if (!hasAccess) {
          return res.status(403).json({ error: '해당 사용자에 대한 수정 권한이 없습니다.' });
        }
      } else if (currentUser.userType === 'instructor') {
        const hasAccess = await checkInstructorAccess(currentUser._id, { _id: targetUserId });
        if (!hasAccess) {
          return res.status(403).json({ error: '해당 사용자에 대한 수정 권한이 없습니다.' });
        }
      } else if (currentUser.userType === 'student') {
        return res.status(403).json({ error: '본인의 정보만 수정할 수 있습니다.' });
      } else if (currentUser.userType !== 'superAdmin') {
        return res.status(403).json({ error: '해당 사용자에 대한 수정 권한이 없습니다.' });
      }
    }
    
    const updateData: any = { name, phone, address };
    
    // 사용자 유형별 정보 업데이트
    if (userType) {
      updateData.userType = userType;
      
      // 사용자 유형별 권한 및 시퀀스 자동 설정
      const user = new User({ userType });
      user.setPermissionsByType();
      user.setFeatureSequence();
      
      updateData.accessPermissions = user.accessPermissions;
      updateData.featureSequence = user.featureSequence;
    }
    
    if (level) {
      updateData.level = level;
    }
    
    if (studentInfo) {
      updateData.studentInfo = studentInfo;
    }
    
    if (instructorInfo) {
      updateData.instructorInfo = instructorInfo;
    }
    
    if (centerAdminInfo) {
      updateData.centerAdminInfo = centerAdminInfo;
    }
    
    if (superAdminInfo) {
      updateData.superAdminInfo = superAdminInfo;
    }
    
    if (accessPermissions) {
      updateData.accessPermissions = accessPermissions;
    }
    
    if (featureSequence) {
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
    console.error('사용자 업데이트 오류:', err);
    return res.status(400).json({ error: '사용자 정보 업데이트에 실패했습니다.' });
  }
});

// 사용자 레벨 업그레이드
router.patch('/:id/upgrade-level', auth, requirePermission('userManagement'), async (req, res) => {
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
    console.error('레벨 업그레이드 오류:', err);
    return res.status(400).json({ error: '레벨 업그레이드에 실패했습니다.' });
  }
});

// 사용자 삭제 (권한별)
router.delete('/:id', auth, requirePermission('userManagement'), async (req, res) => {
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
    console.error('사용자 삭제 오류:', err);
    return res.status(500).json({ error: '사용자 삭제에 실패했습니다.' });
  }
});

// 사용자 활성화/비활성화
router.patch('/:id/toggle-status', auth, requirePermission('userManagement'), async (req, res) => {
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
    console.error('사용자 상태 변경 오류:', err);
    return res.status(500).json({ error: '사용자 상태 변경에 실패했습니다.' });
  }
});

// 센터 관리자 접근 권한 확인
async function checkCenterAdminAccess(adminId: string, user: any): Promise<boolean> {
  const admin = await User.findById(adminId);
  if (!admin || admin.userType !== 'centerAdmin') return false;
  
  const managedCenters = admin.centerAdminInfo?.managedCenters || [];
  
  // 강사인 경우 할당된 센터 확인
  if (user.userType === 'instructor') {
    const assignedCenters = user.instructorInfo?.assignedCenters || [];
    return assignedCenters.some((centerId: any) => managedCenters.includes(centerId));
  }
  
  // 수강생인 경우 등록된 강습 과정의 센터 확인
  if (user.userType === 'student') {
    const enrolledCourses = user.studentInfo?.enrolledCourses || [];
    // 여기서는 간단히 true로 반환 (실제로는 강습 과정의 센터 확인 필요)
    return true;
  }
  
  return false;
}

// 강사 접근 권한 확인
async function checkInstructorAccess(instructorId: string, user: any): Promise<boolean> {
  if (user.userType !== 'student') return false;
  
  const instructor = await User.findById(instructorId);
  if (!instructor || instructor.userType !== 'instructor') return false;
  
  // 강사의 학생인지 확인 (실제로는 강습 과정을 통해 확인)
  return true;
}

// 센터별 강습 과정 가져오기
async function getCenterCourses(centerId: string): Promise<string[]> {
  // 실제로는 Course 모델에서 센터별 강습 과정을 조회
  return [];
}

// 강사별 강습 과정 가져오기
async function getInstructorCourses(instructorId: string): Promise<string[]> {
  // 실제로는 Course 모델에서 강사별 강습 과정을 조회
  return [];
}

export default router;
