"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcrypt = __importStar(require("bcryptjs"));
const jwt = __importStar(require("jsonwebtoken"));
const User_1 = require("../models/User");
const router = (0, express_1.Router)();
router.post('/signup', async (req, res) => {
    try {
        const { userId, name, email, password, phone, address, userType } = req.body;
        if (!userId || !name || !email || !password) {
            return res.status(400).json({ error: '필수 필드가 누락되었습니다.' });
        }
        const existingUserId = await User_1.User.findOne({ userId });
        if (existingUserId) {
            return res.status(400).json({ error: '이미 사용 중인 ID입니다.' });
        }
        const existingUser = await User_1.User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: '이미 등록된 이메일입니다.' });
        }
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const userData = {
            userId,
            name,
            email,
            password: hashedPassword,
            phone,
            address,
            userType: ['student', 'instructor', 'centerAdmin', 'superAdmin'].includes(userType)
                ? userType
                : 'student'
        };
        if (userData.userType === 'instructor') {
            userData.experience = req.body.experience || '';
            userData.certifications = req.body.certifications || [];
            userData.specialties = req.body.specialties || [];
        }
        else if (userData.userType === 'centerAdmin') {
            userData.centerAdminInfo = {
                managedCenters: req.body.managedCenters || [],
                adminLevel: req.body.adminLevel || 'assistant',
                permissions: req.body.permissions || undefined,
            };
        }
        const user = new User_1.User(userData);
        await user.save();
        const tokenPayload = {
            id: user._id,
            userId: user._id,
            userType: user.userType,
            email: user.email,
            name: user.name,
            permissions: user.centerAdminInfo?.permissions || user.superAdminInfo?.systemPermissions || []
        };
        const token = jwt.sign(tokenPayload, process.env.JWT_SECRET || 'fallback-secret', {
            expiresIn: '24h',
            issuer: 'jj-swim-lab',
            audience: 'jj-swim-lab-users'
        });
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
    }
    catch (error) {
        console.error('회원가입 오류:', error);
        return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
});
router.get('/verify', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: '인증 토큰이 필요합니다.' });
        }
        const token = authHeader.substring(7);
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret', {
                issuer: 'jj-swim-lab',
                audience: 'jj-swim-lab-users'
            });
            const user = await User_1.User.findById(decoded.userId || decoded.id).select('-password');
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
        }
        catch (jwtError) {
            console.error('JWT 토큰 검증 실패:', jwtError);
            return res.status(401).json({ error: '토큰이 만료되었거나 유효하지 않습니다.' });
        }
    }
    catch (error) {
        console.error('토큰 검증 오류:', error);
        return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
});
router.post('/login', async (req, res) => {
    try {
        console.log('🔍 로그인 요청 받음:', { body: req.body });
        const { userId, email, password } = req.body;
        console.log('🔍 요청 데이터 파싱:', { userId, email, password: password ? '***' : 'undefined' });
        if (!(userId || email) || !password) {
            console.log('❌ 필수 필드 누락:', { userId: !!userId, email: !!email, password: !!password });
            return res.status(400).json({ error: 'ID와 비밀번호를 입력해주세요.' });
        }
        let user = null;
        let searchQuery = {};
        if (userId) {
            searchQuery = { $or: [{ userId }, { username: userId }, { email: userId }] };
            console.log('🔍 userId로 검색:', searchQuery);
        }
        else if (email) {
            searchQuery = { $or: [{ email }, { username: email }] };
            console.log('🔍 email로 검색:', searchQuery);
        }
        user = await User_1.User.findOne(searchQuery).select('+centerId');
        console.log('🔍 사용자 검색 결과:', user ? { userId: user.userId, email: user.email, userType: user.userType } : '사용자 없음');
        if (!user) {
            console.log('❌ 사용자를 찾을 수 없음');
            return res.status(401).json({ error: 'ID 또는 비밀번호가 올바르지 않습니다.' });
        }
        console.log('🔍 비밀번호 검증 디버깅:');
        console.log('  - 입력된 비밀번호:', password);
        console.log('  - 저장된 해시:', user.password);
        console.log('  - 사용자 정보:', { userId: user.userId, email: user.email });
        const isPasswordValid = await bcrypt.compare(password, user.password);
        console.log('  - bcrypt.compare 결과:', isPasswordValid);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'ID 또는 비밀번호가 올바르지 않습니다.' });
        }
        user.lastLoginAt = new Date();
        if (user.studentInfo) {
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
        }
        catch (saveError) {
            console.warn('⚠️ 사용자 정보 저장 실패, 로그인은 계속 진행:', saveError.message);
        }
        const tokenPayload = {
            id: user._id,
            userId: user._id,
            userType: user.userType,
            email: user.email,
            name: user.name,
            centerId: user.centerId,
            permissions: user.centerAdminInfo?.permissions || user.superAdminInfo?.systemPermissions || []
        };
        console.log('🔍 JWT 토큰 페이로드 생성:', {
            id: tokenPayload.id,
            userId: tokenPayload.userId,
            userType: tokenPayload.userType,
            email: tokenPayload.email,
            name: tokenPayload.name,
            permissions: tokenPayload.permissions
        });
        if (user.userType === 'centerAdmin' && user.centerId) {
            tokenPayload.centerId = user.centerId;
            console.log('🔍 JWT 토큰에 centerId 포함:', {
                centerId: user.centerId,
                centerIdType: typeof user.centerId,
                centerIdConstructor: user.centerId?.constructor?.name
            });
        }
        else {
            console.log('⚠️ JWT 토큰에 centerId 미포함:', {
                userType: user.userType,
                centerId: user.centerId,
                centerIdExists: !!user.centerId
            });
        }
        console.log('🔍 JWT 토큰 페이로드:', tokenPayload);
        const token = jwt.sign(tokenPayload, process.env.JWT_SECRET || 'fallback-secret', {
            expiresIn: '24h',
            issuer: 'jj-swim-lab',
            audience: 'jj-swim-lab-users'
        });
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
    }
    catch (error) {
        console.error('❌ 로그인 오류 상세:', error);
        console.error('❌ 오류 스택:', error instanceof Error ? error.stack : '스택 없음');
        return res.status(500).json({
            error: '서버 오류가 발생했습니다.',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});
router.get('/profile', async (req, res) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ error: '인증 토큰이 필요합니다.' });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
        const user = await User_1.User.findById(decoded.userId).select('-password');
        if (!user) {
            return res.status(401).json({ error: '유효하지 않은 토큰입니다.' });
        }
        return res.json({
            user
        });
    }
    catch (error) {
        console.error('프로필 조회 오류:', error);
        return res.status(401).json({ error: '인증에 실패했습니다.' });
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map