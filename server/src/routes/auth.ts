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
      userType: userType || 'member'
    };

    // 사용자 타입별 추가 필드
    if (userType === 'instructor') {
      userData.experience = req.body.experience || '';
      userData.certifications = req.body.certifications || [];
      userData.specialties = req.body.specialties || [];
    } else if (userType === 'admin') {
      userData.centerName = req.body.centerName || '';
      userData.centerAddress = req.body.centerAddress || '';
      userData.centerPhone = req.body.centerPhone || '';
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

// 로그인
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { userId, password } = req.body;

    // 필수 필드 검증
    if (!userId || !password) {
      return res.status(400).json({ error: 'ID와 비밀번호를 입력해주세요.' });
    }

    // 사용자 찾기 (userId로 검색)
    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(401).json({ error: 'ID 또는 비밀번호가 올바르지 않습니다.' });
    }

    // 비밀번호 확인
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'ID 또는 비밀번호가 올바르지 않습니다.' });
    }

    // 마지막 로그인 시간 업데이트
    user.lastLoginAt = new Date();
    await user.save();

    // JWT 토큰 생성
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );

    return res.json({
      message: '로그인이 완료되었습니다.',
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
    console.error('로그인 오류:', error);
    return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
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
