"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const User_1 = require("../models/User");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.get('/center-users', auth_1.authMiddleware, async (req, res) => {
    try {
        const { page = 1, limit = 20, userType, level, search, status, includeGroupStudents } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const query = {};
        const centerId = req.user.centerId;
        if (req.user.userType === 'admin' || req.user.userType === 'superAdmin') {
        }
        else if (centerId) {
            query['$or'] = [
                { 'instructorInfo.assignedCenters': centerId },
                { 'studentInfo.enrolledCenters': centerId },
                { centerId: centerId }
            ];
        }
        else {
            query.userType = 'student';
        }
        if (userType) {
            query.userType = userType;
        }
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
        if (status && status !== 'all') {
            if (status === 'active') {
                query.isActive = true;
            }
            else if (status === 'inactive') {
                query.isActive = false;
            }
        }
        if (search) {
            query.$and = [
                query.$or,
                {
                    $or: [
                        { name: { $regex: search, $options: 'i' } },
                        { email: { $regex: search, $options: 'i' } },
                        { phone: { $regex: search, $options: 'i' } }
                    ]
                }
            ];
            delete query.$or;
        }
        let users = await User_1.User.find(query)
            .select('-password')
            .skip(skip)
            .limit(Number(limit))
            .sort({ createdAt: -1 });
        if (includeGroupStudents === 'true') {
            try {
                const GroupClass = require('../models/GroupClass').default;
                const groupClasses = await GroupClass.find({ status: 'active' });
                console.log(`📚 활성 단체반 ${groupClasses.length}개 발견`);
                const groupStudentIds = groupClasses.flatMap(gc => {
                    const activeStudents = gc.students.filter(s => s.status === 'active');
                    console.log(`  - ${gc.className}: ${activeStudents.length}명`);
                    return activeStudents.map(s => s.userId);
                });
                console.log(`📝 총 단체반 학생 ID: ${groupStudentIds.length}개`);
                if (groupStudentIds.length > 0) {
                    const groupUsers = await User_1.User.find({
                        _id: { $in: groupStudentIds }
                    }).select('-password');
                    console.log(`✅ 단체반 회원 ${groupUsers.length}명 조회됨`);
                    const existingIds = users.map(u => u._id.toString());
                    const newGroupUsers = groupUsers.filter(gu => !existingIds.includes(gu._id.toString()));
                    console.log(`➕ 새로운 단체반 회원 ${newGroupUsers.length}명 추가`);
                    users = [...users, ...newGroupUsers];
                }
            }
            catch (groupError) {
                console.error('❌ 단체반 회원 조회 실패:', groupError);
            }
        }
        const total = await User_1.User.countDocuments(query);
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
    }
    catch (err) {
        console.error('센터 사용자 목록 조회 오류:', err);
        return res.status(500).json({
            success: false,
            message: '센터 사용자 목록을 불러오는 데 실패했습니다.'
        });
    }
});
router.get('/:id', auth_1.authMiddleware, async (req, res) => {
    try {
        console.log('🔍 GET /:id 라우트 호출됨:', {
            id: req.params.id,
            url: req.url,
            method: req.method,
            originalUrl: req.originalUrl,
            baseUrl: req.baseUrl,
            path: req.path
        });
        res.set('X-Route-Called', 'GET-:id');
        if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ error: '유효하지 않은 사용자 ID입니다.' });
        }
        const user = await User_1.User.findById(req.params.id).select('-password');
        if (!user) {
            console.log('❌ 사용자를 찾을 수 없음:', req.params.id);
            return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
        }
        console.log('✅ 사용자 찾음:', {
            id: user._id,
            name: user.name,
            email: user.email
        });
        if (req.user.userType === 'centerAdmin') {
            const hasAccess = await checkCenterAdminAccess(req.user._id, user);
            if (!hasAccess) {
                return res.status(403).json({ error: '해당 사용자에 대한 접근 권한이 없습니다.' });
            }
        }
        else if (req.user.userType === 'instructor') {
            const hasAccess = await checkInstructorAccess(req.user._id, user);
            if (!hasAccess) {
                return res.status(403).json({ error: '해당 사용자에 대한 접근 권한이 없습니다.' });
            }
        }
        return res.json(user);
    }
    catch (err) {
        console.error('사용자 조회 오류:', err);
        return res.status(500).json({ error: '사용자 정보를 불러오는 데 실패했습니다.' });
    }
});
router.get('/', auth_1.authMiddleware, (0, auth_1.requirePermission)('userManagement'), async (req, res) => {
    try {
        const { page = 1, limit = 10, userType, level, search, centerId } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const query = {};
        if (req.user.userType === 'centerAdmin') {
            const adminCenterId = req.user.centerId;
            console.log('🔍 센터 관리자 요청:', {
                userType: req.user.userType,
                adminCenterId: adminCenterId,
                userId: req.user._id
            });
            if (adminCenterId) {
                const centerIdObjectId = new mongoose_1.default.Types.ObjectId(adminCenterId);
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
                query.userType = { $in: ['instructor', 'student'] };
                console.log('🔍 센터 필터링 쿼리:', {
                    $or: query['$or'],
                    userType: query.userType
                });
            }
            else {
                console.log('⚠️ 센터 관리자에게 centerId가 없음');
                query.userType = { $in: ['instructor', 'student'] };
            }
        }
        else if (req.user.userType === 'instructor') {
            query.userType = 'student';
            query['studentInfo.enrolledCourses'] = { $in: await getInstructorCourses(req.user._id) };
        }
        if (userType) {
            query.userType = userType;
        }
        if (level) {
            switch (userType) {
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
        const users = await User_1.User.find(query)
            .select('-password')
            .skip(skip)
            .limit(Number(limit))
            .sort({ createdAt: -1 });
        const total = await User_1.User.countDocuments(query);
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
    }
    catch (err) {
        console.error('사용자 목록 조회 오류:', err);
        return res.status(500).json({ error: '사용자 목록을 불러오는 데 실패했습니다.' });
    }
});
router.get('/stats/by-type', auth_1.authMiddleware, (0, auth_1.requirePermission)('reports'), async (req, res) => {
    try {
        const stats = await User_1.User.aggregate([
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
    }
    catch (err) {
        console.error('사용자 통계 조회 오류:', err);
        return res.status(500).json({ error: '사용자 통계를 불러오는 데 실패했습니다.' });
    }
});
router.get('/stats/by-level', auth_1.authMiddleware, (0, auth_1.requirePermission)('reports'), async (req, res) => {
    try {
        const { userType } = req.query;
        let levelField = '';
        switch (userType) {
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
        const stats = await User_1.User.aggregate([
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
    }
    catch (err) {
        console.error('레벨별 통계 조회 오류:', err);
        return res.status(500).json({ error: '레벨별 통계를 불러오는 데 실패했습니다.' });
    }
});
router.post('/', auth_1.authMiddleware, (0, auth_1.requirePermission)('userManagement'), async (req, res) => {
    try {
        const { userId, name, email, password, userType, phone, address, level, studentInfo, instructorInfo, centerAdminInfo, superAdminInfo } = req.body;
        if (!name || !email || !password || !userType) {
            return res.status(400).json({
                success: false,
                error: '이름, 이메일, 비밀번호, 사용자 유형은 필수입니다.'
            });
        }
        const existingUser = await User_1.User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                error: '이미 존재하는 이메일입니다.'
            });
        }
        const user = new User_1.User({
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
        user.setPermissionsByType();
        user.setFeatureSequence();
        await user.save();
        const userResponse = user.toObject();
        delete userResponse.password;
        return res.status(201).json({
            success: true,
            message: '사용자가 성공적으로 생성되었습니다.',
            data: { user: userResponse }
        });
    }
    catch (err) {
        console.error('사용자 생성 오류:', err);
        return res.status(400).json({
            success: false,
            error: '사용자 생성에 실패했습니다.'
        });
    }
});
router.put('/:id', auth_1.authMiddleware, async (req, res) => {
    try {
        const { userId, name, phone, address, userType, level, password, studentInfo, instructorInfo, centerAdminInfo, superAdminInfo, accessPermissions, featureSequence } = req.body;
        const currentUser = req.user;
        const targetUserId = req.params.id;
        if (currentUser._id !== targetUserId) {
            if (currentUser.userType === 'centerAdmin') {
                const hasAccess = await checkCenterAdminAccess(currentUser._id, { _id: targetUserId });
                if (!hasAccess) {
                    return res.status(403).json({ error: '해당 사용자에 대한 수정 권한이 없습니다.' });
                }
            }
            else if (currentUser.userType === 'instructor') {
                const hasAccess = await checkInstructorAccess(currentUser._id, { _id: targetUserId });
                if (!hasAccess) {
                    return res.status(403).json({ error: '해당 사용자에 대한 수정 권한이 없습니다.' });
                }
            }
            else if (currentUser.userType === 'student') {
                return res.status(403).json({ error: '본인의 정보만 수정할 수 있습니다.' });
            }
            else if (currentUser.userType !== 'superAdmin') {
                return res.status(403).json({ error: '해당 사용자에 대한 수정 권한이 없습니다.' });
            }
        }
        const updateData = {};
        if (currentUser._id === targetUserId) {
            if (name)
                updateData.name = name;
            if (phone)
                updateData.phone = phone;
            if (address)
                updateData.address = address;
        }
        else {
            console.log('🔒 개인정보 수정 제한: 관리자는 개인정보를 수정할 수 없습니다.');
        }
        if (userId) {
            updateData.userId = userId;
        }
        if (password) {
            const bcrypt = require('bcryptjs');
            const saltRounds = 12;
            updateData.password = await bcrypt.hash(password, saltRounds);
        }
        if (userType) {
            updateData.userType = userType;
            const tempUser = new User_1.User({ userType });
            tempUser.setPermissionsByType();
            tempUser.setFeatureSequence();
            updateData.accessPermissions = tempUser.accessPermissions;
            updateData.featureSequence = tempUser.featureSequence;
        }
        if (level) {
            updateData.level = level;
        }
        if (typeof req.body.isActive === 'boolean') {
            updateData.isActive = req.body.isActive;
            console.log(`🔒 계정 상태 변경: ${updateData.isActive ? '활성' : '비활성'}`);
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
        if (accessPermissions && currentUser.userType === 'superAdmin') {
            updateData.accessPermissions = accessPermissions;
        }
        if (featureSequence && currentUser.userType === 'superAdmin') {
            updateData.featureSequence = featureSequence;
        }
        const user = await User_1.User.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true }).select('-password');
        if (!user) {
            return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
        }
        return res.json(user);
    }
    catch (err) {
        console.error('사용자 업데이트 오류:', err);
        return res.status(400).json({ error: '사용자 정보 업데이트에 실패했습니다.' });
    }
});
router.patch('/:id/upgrade-level', auth_1.authMiddleware, (0, auth_1.requirePermission)('userManagement'), async (req, res) => {
    try {
        const { userType, newLevel } = req.body;
        if (!userType || !newLevel) {
            return res.status(400).json({ error: '사용자 유형과 새로운 레벨을 지정해주세요.' });
        }
        const user = await User_1.User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
        }
        const updateData = {};
        switch (userType) {
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
        const updatedUser = await User_1.User.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true }).select('-password');
        return res.json({
            message: '레벨이 성공적으로 업그레이드되었습니다.',
            user: updatedUser
        });
    }
    catch (err) {
        console.error('레벨 업그레이드 오류:', err);
        return res.status(400).json({ error: '레벨 업그레이드에 실패했습니다.' });
    }
});
router.delete('/:id', auth_1.authMiddleware, (0, auth_1.requirePermission)('userManagement'), async (req, res) => {
    try {
        const user = await User_1.User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
        }
        if (req.user.userType === 'centerAdmin') {
            const hasAccess = await checkCenterAdminAccess(req.user._id, user);
            if (!hasAccess) {
                return res.status(403).json({ error: '해당 사용자에 대한 삭제 권한이 없습니다.' });
            }
        }
        await User_1.User.findByIdAndDelete(req.params.id);
        return res.json({ message: '사용자가 성공적으로 삭제되었습니다.' });
    }
    catch (err) {
        console.error('사용자 삭제 오류:', err);
        return res.status(500).json({ error: '사용자 삭제에 실패했습니다.' });
    }
});
router.patch('/:id/conditions', auth_1.authMiddleware, async (req, res) => {
    try {
        const { conditionIds } = req.body;
        if (!Array.isArray(conditionIds)) {
            return res.status(400).json({ error: 'conditionIds는 배열이어야 합니다.' });
        }
        const user = await User_1.User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
        }
        const updatedUser = await User_1.User.findByIdAndUpdate(req.params.id, {
            'healthInfo.conditionIds': conditionIds,
            'healthInfo.updatedAt': new Date()
        }, { new: true, runValidators: true }).select('-password');
        return res.json({
            message: '질환/특수상황이 성공적으로 업데이트되었습니다.',
            conditionIds: updatedUser?.healthInfo?.conditionIds || []
        });
    }
    catch (err) {
        console.error('질환 업데이트 오류:', err);
        return res.status(500).json({ error: '질환 업데이트에 실패했습니다.' });
    }
});
router.patch('/:id/toggle-status', auth_1.authMiddleware, (0, auth_1.requirePermission)('userManagement'), async (req, res) => {
    try {
        const user = await User_1.User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
        }
        user.isActive = !user.isActive;
        await user.save();
        return res.json({
            message: `사용자가 ${user.isActive ? '활성화' : '비활성화'}되었습니다.`,
            isActive: user.isActive
        });
    }
    catch (err) {
        console.error('사용자 상태 변경 오류:', err);
        return res.status(500).json({ error: '사용자 상태 변경에 실패했습니다.' });
    }
});
async function checkCenterAdminAccess(adminId, user) {
    const admin = await User_1.User.findById(adminId);
    if (!admin || admin.userType !== 'centerAdmin')
        return false;
    const managedCenters = admin.centerAdminInfo?.managedCenters || [];
    if (user.userType === 'instructor') {
        const assignedCenters = user.instructorInfo?.assignedCenters || [];
        return assignedCenters.some((centerId) => managedCenters.includes(centerId));
    }
    if (user.userType === 'student') {
        const enrolledCourses = user.studentInfo?.enrolledCourses || [];
        return true;
    }
    return false;
}
async function checkInstructorAccess(instructorId, user) {
    if (user.userType !== 'student')
        return false;
    const instructor = await User_1.User.findById(instructorId);
    if (!instructor || instructor.userType !== 'instructor')
        return false;
    return true;
}
async function getCenterCourses(centerId) {
    return [];
}
async function getInstructorCourses(instructorId) {
    return [];
}
router.put('/:userId/swimming-profile/css', auth_1.authMiddleware, async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUser = req.user;
        const { css, updatedByRole, reason } = req.body;
        console.log('🔍 CSS 수정 권한 체크:', {
            currentUserId: currentUser._id.toString(),
            targetUserId: userId.toString(),
            currentUserType: currentUser.userType,
            isSelf: currentUser._id.toString() === userId.toString()
        });
        if (currentUser._id.toString() !== userId.toString() &&
            currentUser.userType !== 'instructor' &&
            currentUser.userType !== 'centerAdmin' &&
            currentUser.userType !== 'superAdmin' &&
            !currentUser.instructorInfo) {
            return res.status(403).json({
                error: 'CSS 수정 권한이 없습니다.',
                debug: {
                    userType: currentUser.userType,
                    hasInstructorInfo: !!currentUser.instructorInfo
                }
            });
        }
        const user = await User_1.User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
        }
        if (!user.studentInfo) {
            user.studentInfo = {};
        }
        if (!user.studentInfo.swimmingProfile) {
            user.studentInfo.swimmingProfile = {};
        }
        const isSelf = currentUser._id.toString() === userId.toString();
        if (isSelf) {
            user.studentInfo.swimmingProfile.css = {
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
                    css: user.studentInfo.swimmingProfile.css,
                    updatedBy: currentUser.name,
                    updatedByRole: 'self'
                }
            });
        }
        if (!(user.studentInfo.swimmingProfile.pendingChanges)) {
            user.studentInfo.swimmingProfile.pendingChanges = {};
        }
        user.studentInfo.swimmingProfile.pendingChanges.css = css;
        user.studentInfo.swimmingProfile.pendingChanges.proposedBy = currentUser._id;
        user.studentInfo.swimmingProfile.pendingChanges.proposedAt = new Date();
        user.studentInfo.swimmingProfile.pendingChanges.reason = reason || '강사가 CSS를 재측정했습니다.';
        await user.save();
        return res.json({
            success: true,
            message: 'CSS 변경 제안이 전송되었습니다. 회원의 승인을 기다리고 있습니다.',
            data: {
                pendingChanges: user.studentInfo.swimmingProfile.pendingChanges,
                needsApproval: true
            }
        });
    }
    catch (err) {
        console.error('CSS 업데이트 오류:', err);
        return res.status(500).json({ error: 'CSS 업데이트에 실패했습니다.' });
    }
});
router.put('/:userId/swimming-profile', auth_1.authMiddleware, async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUser = req.user;
        const { mainStrokes, preferredStrokes, excludedStrokes, trainingDays, sessionsPerWeek, sessionDuration, currentGoal, conditionIds, reason } = req.body;
        console.log('🔍 프로필 수정 권한 체크:', {
            currentUserId: currentUser._id.toString(),
            targetUserId: userId.toString(),
            currentUserType: currentUser.userType,
            isSelf: currentUser._id.toString() === userId.toString()
        });
        if (currentUser._id.toString() !== userId.toString() &&
            currentUser.userType !== 'instructor' &&
            currentUser.userType !== 'centerAdmin' &&
            currentUser.userType !== 'superAdmin' &&
            !currentUser.instructorInfo) {
            return res.status(403).json({
                error: '수영 프로필 수정 권한이 없습니다.',
                debug: {
                    userType: currentUser.userType,
                    hasInstructorInfo: !!currentUser.instructorInfo
                }
            });
        }
        const user = await User_1.User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
        }
        if (!user.studentInfo) {
            user.studentInfo = {};
        }
        if (!user.studentInfo.swimmingProfile) {
            user.studentInfo.swimmingProfile = {};
        }
        const isSelf = currentUser._id.toString() === userId.toString();
        if (isSelf) {
            if (mainStrokes)
                user.studentInfo.swimmingProfile.mainStrokes = mainStrokes;
            if (preferredStrokes)
                user.studentInfo.swimmingProfile.preferredStrokes = preferredStrokes;
            if (excludedStrokes)
                user.studentInfo.swimmingProfile.excludedStrokes = excludedStrokes;
            if (trainingDays)
                user.studentInfo.swimmingProfile.trainingDays = trainingDays;
            if (sessionsPerWeek)
                user.studentInfo.swimmingProfile.sessionsPerWeek = sessionsPerWeek;
            if (sessionDuration)
                user.studentInfo.swimmingProfile.sessionDuration = sessionDuration;
            if (currentGoal)
                user.studentInfo.swimmingProfile.currentGoal = currentGoal;
            if (conditionIds)
                user.studentInfo.swimmingProfile.conditionIds = conditionIds;
            await user.save();
            return res.json({
                success: true,
                message: '수영 프로필이 성공적으로 업데이트되었습니다.',
                data: user.studentInfo.swimmingProfile
            });
        }
        if (!(user.studentInfo.swimmingProfile.pendingChanges)) {
            user.studentInfo.swimmingProfile.pendingChanges = {};
        }
        if (mainStrokes)
            user.studentInfo.swimmingProfile.pendingChanges.mainStrokes = mainStrokes;
        if (preferredStrokes)
            user.studentInfo.swimmingProfile.pendingChanges.preferredStrokes = preferredStrokes;
        if (excludedStrokes)
            user.studentInfo.swimmingProfile.pendingChanges.excludedStrokes = excludedStrokes;
        if (trainingDays)
            user.studentInfo.swimmingProfile.pendingChanges.trainingDays = trainingDays;
        if (sessionsPerWeek)
            user.studentInfo.swimmingProfile.pendingChanges.sessionsPerWeek = sessionsPerWeek;
        if (conditionIds)
            user.studentInfo.swimmingProfile.pendingChanges.conditionIds = conditionIds;
        if (sessionDuration)
            user.studentInfo.swimmingProfile.pendingChanges.sessionDuration = sessionDuration;
        if (currentGoal)
            user.studentInfo.swimmingProfile.pendingChanges.currentGoal = currentGoal;
        user.studentInfo.swimmingProfile.pendingChanges.proposedBy = currentUser._id;
        user.studentInfo.swimmingProfile.pendingChanges.proposedAt = new Date();
        user.studentInfo.swimmingProfile.pendingChanges.reason = reason || '강사가 프로필 변경을 제안했습니다.';
        await user.save();
        return res.json({
            success: true,
            message: '프로필 변경 제안이 전송되었습니다. 회원의 승인을 기다리고 있습니다.',
            data: {
                pendingChanges: user.studentInfo.swimmingProfile.pendingChanges,
                needsApproval: true
            }
        });
    }
    catch (err) {
        console.error('수영 프로필 업데이트 오류:', err);
        return res.status(500).json({ error: '수영 프로필 업데이트에 실패했습니다.' });
    }
});
router.post('/:userId/swimming-profile/approve-changes', auth_1.authMiddleware, async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUser = req.user;
        if (currentUser._id.toString() !== userId.toString()) {
            return res.status(403).json({ error: '본인의 변경사항만 승인할 수 있습니다.' });
        }
        const user = await User_1.User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
        }
        const pendingChanges = user.studentInfo?.swimmingProfile?.pendingChanges;
        if (!pendingChanges) {
            return res.status(404).json({ error: '대기 중인 변경사항이 없습니다.' });
        }
        const profile = user.studentInfo.swimmingProfile;
        if (pendingChanges.css) {
            profile.css = {
                ...pendingChanges.css,
                lastUpdated: new Date(),
                updatedBy: pendingChanges.proposedBy,
                updatedByRole: 'instructor'
            };
        }
        if (pendingChanges.mainStrokes)
            profile.mainStrokes = pendingChanges.mainStrokes;
        if (pendingChanges.preferredStrokes)
            profile.preferredStrokes = pendingChanges.preferredStrokes;
        if (pendingChanges.excludedStrokes)
            profile.excludedStrokes = pendingChanges.excludedStrokes;
        if (pendingChanges.trainingDays)
            profile.trainingDays = pendingChanges.trainingDays;
        if (pendingChanges.sessionsPerWeek)
            profile.sessionsPerWeek = pendingChanges.sessionsPerWeek;
        if (pendingChanges.sessionDuration)
            profile.sessionDuration = pendingChanges.sessionDuration;
        if (pendingChanges.currentGoal)
            profile.currentGoal = pendingChanges.currentGoal;
        if (pendingChanges.conditionIds)
            profile.conditionIds = pendingChanges.conditionIds;
        profile.pendingChanges = undefined;
        await user.save();
        return res.json({
            success: true,
            message: '변경사항이 승인되어 적용되었습니다.',
            data: profile
        });
    }
    catch (err) {
        console.error('변경사항 승인 오류:', err);
        return res.status(500).json({ error: '변경사항 승인에 실패했습니다.' });
    }
});
router.post('/:userId/swimming-profile/reject-changes', auth_1.authMiddleware, async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUser = req.user;
        if (currentUser._id !== userId) {
            return res.status(403).json({ error: '본인의 변경사항만 거부할 수 있습니다.' });
        }
        const user = await User_1.User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
        }
        const pendingChanges = user.studentInfo?.swimmingProfile?.pendingChanges;
        if (!pendingChanges) {
            return res.status(404).json({ error: '대기 중인 변경사항이 없습니다.' });
        }
        user.studentInfo.swimmingProfile.pendingChanges = undefined;
        await user.save();
        return res.json({
            success: true,
            message: '변경사항이 거부되었습니다.'
        });
    }
    catch (err) {
        console.error('변경사항 거부 오류:', err);
        return res.status(500).json({ error: '변경사항 거부에 실패했습니다.' });
    }
});
exports.default = router;
//# sourceMappingURL=users.js.map