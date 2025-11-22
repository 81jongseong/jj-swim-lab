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
const LoginLog_1 = require("../models/LoginLog");
const logger_1 = require("../utils/logger");
const router = (0, express_1.Router)();
const phoneVerificationCodes = new Map();
const emailVerificationCodes = new Map();
function generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}
router.post('/send-verification-code', async (req, res) => {
    try {
        const { phone } = req.body;
        if (!phone) {
            return res.status(400).json({
                success: false,
                error: '전화번호를 입력해주세요.'
            });
        }
        const extractNumbers = (phoneNum) => phoneNum.replace(/\D/g, '');
        const normalizedPhone = extractNumbers(phone);
        if (normalizedPhone.length < 10 || normalizedPhone.length > 11) {
            return res.status(400).json({
                success: false,
                error: '올바른 전화번호를 입력해주세요.'
            });
        }
        const code = generateVerificationCode();
        const expiresAt = Date.now() + 5 * 60 * 1000;
        phoneVerificationCodes.set(normalizedPhone, { code, expiresAt });
        (0, logger_1.logDebug)('인증 코드 발송 (개발용)', { phone, code });
        return res.status(200).json({
            success: true,
            message: '인증 코드가 발송되었습니다.',
            ...(process.env.NODE_ENV === 'development' && { code })
        });
    }
    catch (error) {
        (0, logger_1.logError)('인증 코드 발송 오류', error);
        return res.status(500).json({
            success: false,
            error: '인증 코드 발송에 실패했습니다.'
        });
    }
});
router.post('/verify-phone-code', async (req, res) => {
    try {
        const { phone, code } = req.body;
        if (!phone || !code) {
            return res.status(400).json({
                success: false,
                error: '전화번호와 인증 코드를 입력해주세요.'
            });
        }
        const extractNumbers = (phoneNum) => phoneNum.replace(/\D/g, '');
        const normalizedPhone = extractNumbers(phone);
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
        phoneVerificationCodes.delete(normalizedPhone);
        return res.status(200).json({
            success: true,
            message: '전화번호 인증이 완료되었습니다.',
            verified: true
        });
    }
    catch (error) {
        (0, logger_1.logError)('인증 코드 검증 오류', error);
        return res.status(500).json({
            success: false,
            error: '인증 코드 검증에 실패했습니다.'
        });
    }
});
router.post('/send-email-code', async (req, res) => {
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
        (0, logger_1.logDebug)('이메일 인증 코드 발송 (개발용)', { email: normalizedEmail, code });
        return res.status(200).json({
            success: true,
            message: '이메일 인증 코드가 발송되었습니다.',
            ...(process.env.NODE_ENV === 'development' && { code })
        });
    }
    catch (error) {
        (0, logger_1.logError)('이메일 인증 코드 발송 오류', error);
        return res.status(500).json({
            success: false,
            error: '이메일 인증 코드 발송에 실패했습니다.'
        });
    }
});
router.post('/verify-email-code', async (req, res) => {
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
    }
    catch (error) {
        (0, logger_1.logError)('이메일 인증 코드 검증 오류', error);
        return res.status(500).json({
            success: false,
            error: '이메일 인증 코드 검증에 실패했습니다.'
        });
    }
});
router.post('/signup', async (req, res) => {
    try {
        const { userId, name, email, password, phone, address, birthDate, gender, userType, location, phoneVerified, studentInfo } = req.body;
        void phoneVerified;
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
        if (!name || !email) {
            return res.status(400).json({
                success: false,
                error: '필수 필드가 누락되었습니다.',
                required: ['name', 'email']
            });
        }
        if (!req.body.provider && !password) {
            return res.status(400).json({
                success: false,
                error: '비밀번호는 필수입니다.',
                required: ['password']
            });
        }
        if (req.body.provider && req.body.providerId) {
            const existingUser = await User_1.User.findOne({ email });
            if (existingUser) {
                const alreadyConnected = existingUser.socialAccounts?.some((acc) => acc.provider === req.body.provider && acc.providerId === req.body.providerId);
                if (alreadyConnected) {
                    return res.status(400).json({
                        success: false,
                        error: '이미 연결된 소셜 계정입니다.'
                    });
                }
                if (!existingUser.socialAccounts) {
                    existingUser.socialAccounts = [];
                }
                existingUser.socialAccounts.push({
                    provider: req.body.provider,
                    providerId: req.body.providerId,
                    connectedAt: new Date()
                });
                await existingUser.save();
                const tokenPayload = {
                    id: existingUser._id,
                    userId: existingUser._id,
                    userType: existingUser.userType,
                    email: existingUser.email,
                    name: existingUser.name,
                    permissions: existingUser.centerAdminInfo?.permissions || existingUser.superAdminInfo?.systemPermissions || [],
                    memberships: [
                        ...(existingUser.centerAdminInfo?.managedCenters || []).map((cid) => ({ centerId: cid, role: 'centerAdmin' })),
                        ...(existingUser.instructorInfo?.assignedCenters || []).map((cid) => ({ centerId: cid, role: 'instructor' })),
                        ...(existingUser.centerId ? [{ centerId: existingUser.centerId, role: existingUser.userType }] : [])
                    ],
                    defaultCenterId: existingUser.centerId || (existingUser.centerAdminInfo?.managedCenters?.[0])
                };
                const token = jwt.sign(tokenPayload, process.env.JWT_SECRET || 'fallback-secret', {
                    expiresIn: '24h',
                    issuer: 'jj-swim-lab',
                    audience: 'jj-swim-lab-users'
                });
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
            const finalUserId = `${req.body.provider}_${req.body.providerId}`;
            const existingUserId = await User_1.User.findOne({ userId: finalUserId });
            if (existingUserId) {
                return res.status(400).json({
                    success: false,
                    error: '이미 사용 중인 ID입니다.'
                });
            }
        }
        let finalUserId;
        if (userId) {
            finalUserId = userId;
        }
        else {
            finalUserId = email;
        }
        const existingUserId = await User_1.User.findOne({ userId: finalUserId });
        if (existingUserId) {
            return res.status(400).json({
                success: false,
                error: '이미 사용 중인 ID입니다.'
            });
        }
        const existingUser = await User_1.User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                error: '이미 등록된 이메일입니다. 소셜 로그인을 사용하시거나 비밀번호를 찾아주세요.'
            });
        }
        if (!phone || phone.trim() === '') {
            return res.status(400).json({
                success: false,
                error: '전화번호는 필수입니다.'
            });
        }
        const extractNumbers = (phoneNum) => phoneNum.replace(/\D/g, '');
        const normalizedPhone = extractNumbers(phone);
        const allUsers = await User_1.User.find({ phone: { $ne: '', $exists: true } }).select('phone');
        const duplicatePhone = allUsers.find((u) => {
            if (!u.phone)
                return false;
            return extractNumbers(u.phone) === normalizedPhone;
        });
        if (duplicatePhone) {
            return res.status(400).json({
                success: false,
                error: '이미 등록된 전화번호입니다. 한 사람당 하나의 계정만 가입 가능합니다.'
            });
        }
        let hashedPassword;
        if (password) {
            const saltRounds = 12;
            hashedPassword = await bcrypt.hash(password, saltRounds);
        }
        else if (!req.body.provider) {
            return res.status(400).json({
                success: false,
                error: '비밀번호는 필수입니다.'
            });
        }
        const userData = {
            userId: finalUserId,
            name,
            email,
            phone,
            address,
            birthDate: birthDate || '',
            gender: gender || '',
            userType: ['student', 'instructor', 'centerAdmin', 'superAdmin'].includes(userType)
                ? userType
                : 'student'
        };
        if (hashedPassword) {
            userData.password = hashedPassword;
        }
        if (req.body.provider && req.body.providerId) {
            userData.socialAccounts = [{
                    provider: req.body.provider,
                    providerId: req.body.providerId,
                    connectedAt: new Date()
                }];
        }
        if (location && location.coordinates && location.coordinates.length === 2) {
            userData.location = {
                type: 'Point',
                coordinates: location.coordinates
            };
            console.log('✅ 위치 정보 저장:', userData.location);
        }
        if (userData.userType === 'student') {
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
        }
        else if (userData.userType === 'instructor') {
            const instructorInfo = req.body.instructorInfo || {};
            userData.instructorInfo = {
                experience: instructorInfo.experience || instructorInfo.teachingExperiences?.[0]?.centerName ?
                    instructorInfo.teachingExperiences.map((exp) => `${exp.centerName} (${exp.startDate} ~ ${exp.endDate})`).join(', ') :
                    (req.body.experience || ''),
                certifications: instructorInfo.certificates?.map((cert) => cert.name) || instructorInfo.certifications || req.body.certifications || [],
                specialties: instructorInfo.specialties || req.body.specialties || [],
                availableRegions: instructorInfo.availableRegions || [],
                introduction: instructorInfo.introduction || req.body.introduction || '',
                certificates: instructorInfo.certificates || [],
                teachingExperiences: instructorInfo.teachingExperiences || []
            };
        }
        else if (userData.userType === 'centerAdmin') {
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
        const user = new User_1.User(userData);
        await user.save();
        console.log('✅ 사용자 저장 완료:', {
            userId: user._id,
            birthDate: user.birthDate,
            gender: user.gender,
            hasStudentInfo: !!user.studentInfo,
            studentInfoHeight: user.studentInfo?.height,
            studentInfoWeight: user.studentInfo?.weight
        });
        const tokenPayload = {
            id: user._id,
            userId: user._id,
            userType: user.userType,
            email: user.email,
            name: user.name,
            permissions: user.centerAdminInfo?.permissions || user.superAdminInfo?.systemPermissions || [],
            memberships: [
                ...(user.centerAdminInfo?.managedCenters || []).map((cid) => ({ centerId: cid, role: 'centerAdmin' })),
                ...(user.instructorInfo?.assignedCenters || []).map((cid) => ({ centerId: cid, role: 'instructor' })),
                ...(user.centerId ? [{ centerId: user.centerId, role: user.userType }] : [])
            ],
            defaultCenterId: user.centerId || (user.centerAdminInfo?.managedCenters?.[0])
        };
        const token = jwt.sign(tokenPayload, process.env.JWT_SECRET || 'fallback-secret', {
            expiresIn: '24h',
            issuer: 'jj-swim-lab',
            audience: 'jj-swim-lab-users'
        });
        const savedUser = await User_1.User.findById(user._id).select('-password').lean();
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
    }
    catch (error) {
        (0, logger_1.logError)('회원가입 오류', error);
        const errorMessage = error.message || '서버 오류가 발생했습니다.';
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({
            success: false,
            error: errorMessage,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
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
            (0, logger_1.logError)('JWT 토큰 검증 실패', jwtError);
            return res.status(401).json({ error: '토큰이 만료되었거나 유효하지 않습니다.' });
        }
    }
    catch (error) {
        (0, logger_1.logError)('토큰 검증 오류', error);
        return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
});
router.post('/login', async (req, res) => {
    try {
        console.log('🔍 로그인 요청 받음:', { body: req.body });
        const { userId, email, password } = req.body;
        (0, logger_1.logDebug)('요청 데이터 파싱', { userId, email, hasPassword: !!password });
        if (!(userId || email) || !password) {
            (0, logger_1.logWarn)('필수 필드 누락', { hasUserId: !!userId, hasEmail: !!email, hasPassword: !!password });
            return res.status(400).json({ error: 'ID와 비밀번호를 입력해주세요.' });
        }
        let user = null;
        let searchQuery = {};
        if (userId) {
            searchQuery = { $or: [{ userId }, { username: userId }, { email: userId }] };
            (0, logger_1.logDebug)('userId로 검색', { searchQuery });
        }
        else if (email) {
            searchQuery = { $or: [{ email }, { username: email }] };
            (0, logger_1.logDebug)('email로 검색', { searchQuery });
        }
        user = await User_1.User.findOne(searchQuery).select('+centerId');
        (0, logger_1.logDebug)('사용자 검색 결과', user ? { userId: user.userId, email: user.email, userType: user.userType } : { result: '사용자 없음' });
        if (!user) {
            (0, logger_1.logWarn)('사용자를 찾을 수 없음');
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
                (0, logger_1.logDebug)('enrolledCourses 데이터 정리', { count: user.studentInfo.enrolledCourses.length });
                user.studentInfo.enrolledCourses = [];
            }
            if (Array.isArray(user.studentInfo.completedCourses) &&
                user.studentInfo.completedCourses.length > 0 &&
                typeof user.studentInfo.completedCourses[0] === 'string') {
                (0, logger_1.logDebug)('completedCourses 데이터 정리', { count: user.studentInfo.completedCourses.length });
                user.studentInfo.completedCourses = [];
            }
        }
        try {
            await user.save();
            (0, logger_1.logInfo)('사용자 정보 저장 성공', { userId: user._id });
        }
        catch (saveError) {
            (0, logger_1.logWarn)('사용자 정보 저장 실패, 로그인은 계속 진행', { message: saveError.message });
        }
        const tokenPayload = {
            id: user._id,
            userId: user._id,
            userType: user.userType,
            email: user.email,
            name: user.name,
            centerId: user.centerId,
            permissions: user.centerAdminInfo?.permissions || user.superAdminInfo?.systemPermissions || [],
            memberships: [
                ...(user.centerAdminInfo?.managedCenters || []).map((cid) => ({ centerId: cid, role: 'centerAdmin' })),
                ...(user.instructorInfo?.assignedCenters || []).map((cid) => ({ centerId: cid, role: 'instructor' })),
                ...(user.centerId ? [{ centerId: user.centerId, role: user.userType }] : [])
            ],
            defaultCenterId: user.centerId || (user.centerAdminInfo?.managedCenters?.[0])
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
            (0, logger_1.logDebug)('JWT 토큰에 centerId 미포함', {
                userType: user.userType,
                centerId: user.centerId,
                centerIdExists: !!user.centerId
            });
        }
        (0, logger_1.logDebug)('JWT 토큰 페이로드', tokenPayload);
        const token = jwt.sign(tokenPayload, process.env.JWT_SECRET || 'fallback-secret', {
            expiresIn: '24h',
            issuer: 'jj-swim-lab',
            audience: 'jj-swim-lab-users'
        });
        try {
            const loginLog = new LoginLog_1.LoginLog({
                userId: user._id,
                userType: user.userType,
                loginTime: new Date(),
                ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
                userAgent: req.get('User-Agent') || 'unknown',
                isActive: true
            });
            await loginLog.save();
            (0, logger_1.logInfo)('로그인 로그 기록 완료', { userId: user._id });
        }
        catch (logError) {
            (0, logger_1.logWarn)('로그인 로그 기록 실패', logError);
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
    }
    catch (error) {
        (0, logger_1.logError)('로그인 오류 상세', error);
        (0, logger_1.logError)('로그인 오류 스택', { stack: error instanceof Error ? error.stack : '스택 없음' });
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
        const user = await User_1.User.findById(decoded.userId)
            .select('-password')
            .lean();
        if (!user) {
            return res.status(401).json({ error: '유효하지 않은 토큰입니다.' });
        }
        console.log('📋 프로필 조회:', {
            userId: user.userId || user._id,
            hasPhone: !!user.phone,
            hasAddress: !!user.address,
            phone: user.phone,
            address: user.address,
            birthDate: user.birthDate,
            gender: user.gender,
            hasStudentInfo: !!user.studentInfo,
            studentInfoHeight: user.studentInfo?.height,
            studentInfoWeight: user.studentInfo?.weight,
            hasHealthProfile: !!user.studentInfo?.healthProfile,
            healthProfileHeight: user.studentInfo?.healthProfile?.height,
            healthProfileWeight: user.studentInfo?.healthProfile?.weight,
            healthProfile: user.studentInfo?.healthProfile,
            fullUser: JSON.stringify(user, null, 2)
        });
        const responseUser = { ...user };
        if (!responseUser.birthDate && user.birthDate) {
            responseUser.birthDate = user.birthDate;
        }
        if (!responseUser.gender && user.gender) {
            responseUser.gender = user.gender;
        }
        if (responseUser.studentInfo) {
            if (!responseUser.studentInfo.height && user.studentInfo?.height) {
                responseUser.studentInfo.height = user.studentInfo.height;
            }
            if (!responseUser.studentInfo.weight && user.studentInfo?.weight) {
                responseUser.studentInfo.weight = user.studentInfo.weight;
            }
        }
        return res.json({
            user: responseUser
        });
    }
    catch (error) {
        (0, logger_1.logError)('프로필 조회 오류', error);
        return res.status(401).json({ error: '인증에 실패했습니다.' });
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map