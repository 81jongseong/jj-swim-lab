import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

const router: Router = Router();

// 회원가입
router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { userId, name, email, password, phone, address, userType } = req.body;

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

    // JWT 토큰 생성
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
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

// 토큰 검증
router.get('/verify', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: '인증 토큰이 필요합니다.' });
    }

    const token = authHeader.substring(7);
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
      const user = await User.findById(decoded.userId).select('-password');
      
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
      return res.status(401).json({ error: '토큰이 만료되었거나 유효하지 않습니다.' });
    }
  } catch (error) {
    console.error('토큰 검증 오류:', error);
    return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 로그인
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

    // JWT 토큰 생성
    const tokenPayload: any = { userId: user._id };
    
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
      { expiresIn: '24h' }
    );

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
