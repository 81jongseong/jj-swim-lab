"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const User_1 = require("../models/User");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.get('/', auth_1.auth, (0, auth_1.requirePermission)('userManagement'), async (req, res) => {
    try {
        const { page = 1, limit = 10, userType, level, search, centerId } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        let query = {};
        if (req.user.userType === 'centerAdmin') {
            if (centerId) {
                query['$or'] = [
                    { 'instructorInfo.assignedCenters': centerId },
                    { 'studentInfo.enrolledCourses': { $in: await getCenterCourses(centerId) } }
                ];
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
        const users = await User_1.User.find(query)
            .select('-password')
            .skip(skip)
            .limit(Number(limit))
            .sort({ createdAt: -1 });
        const total = await User_1.User.countDocuments(query);
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
router.get('/stats/by-type', auth_1.auth, (0, auth_1.requirePermission)('reports'), async (req, res) => {
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
router.get('/stats/by-level', auth_1.auth, (0, auth_1.requirePermission)('reports'), async (req, res) => {
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
router.get('/:id', auth_1.auth, async (req, res) => {
    try {
        const user = await User_1.User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
        }
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
router.put('/:id', auth_1.auth, async (req, res) => {
    try {
        const { name, phone, address, userType, level, studentInfo, instructorInfo, centerAdminInfo, superAdminInfo, accessPermissions, featureSequence } = req.body;
        if (req.user.userType === 'centerAdmin') {
            const hasAccess = await checkCenterAdminAccess(req.user._id, { _id: req.params.id });
            if (!hasAccess) {
                return res.status(403).json({ error: '해당 사용자에 대한 수정 권한이 없습니다.' });
            }
        }
        const updateData = { name, phone, address };
        if (userType) {
            updateData.userType = userType;
            const user = new User_1.User({ userType });
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
router.patch('/:id/upgrade-level', auth_1.auth, (0, auth_1.requirePermission)('userManagement'), async (req, res) => {
    try {
        const { userType, newLevel } = req.body;
        if (!userType || !newLevel) {
            return res.status(400).json({ error: '사용자 유형과 새로운 레벨을 지정해주세요.' });
        }
        const user = await User_1.User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
        }
        let updateData = {};
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
router.delete('/:id', auth_1.auth, (0, auth_1.requirePermission)('userManagement'), async (req, res) => {
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
router.patch('/:id/toggle-status', auth_1.auth, (0, auth_1.requirePermission)('userManagement'), async (req, res) => {
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
exports.default = router;
//# sourceMappingURL=users.js.map