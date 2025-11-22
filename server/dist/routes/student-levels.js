"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const User_1 = require("../models/User");
const logger_1 = require("../utils/logger");
const router = express_1.default.Router();
const englishToKoreanLevelMap = {
    beginner: '초급',
    intermediate: '중급',
    advanced: '고급',
    expert: '전문가',
    master: '마스터'
};
const koreanToEnglishLevelMap = {
    초급: 'beginner',
    중급: 'intermediate',
    고급: 'advanced',
    전문가: 'expert',
    마스터: 'master'
};
const resolveLevelPair = (rawLevel) => {
    if (!rawLevel) {
        return { english: 'beginner', korean: englishToKoreanLevelMap.beginner };
    }
    const normalized = rawLevel.toString().trim().toLowerCase();
    if (englishToKoreanLevelMap[normalized]) {
        return { english: normalized, korean: englishToKoreanLevelMap[normalized] };
    }
    const koreanCandidate = rawLevel.toString().trim();
    if (koreanToEnglishLevelMap[koreanCandidate]) {
        const english = koreanToEnglishLevelMap[koreanCandidate];
        return { english, korean: englishToKoreanLevelMap[english] };
    }
    return { english: normalized || 'beginner', korean: englishToKoreanLevelMap[normalized] || koreanCandidate };
};
router.put('/:studentId/level', auth_1.authMiddleware, (0, auth_1.requireRole)(['instructor', 'centerAdmin', 'superAdmin']), async (req, res) => {
    try {
        const { studentId } = req.params;
        const { newLevel, reason } = req.body;
        const { user } = req;
        if (!newLevel) {
            return res.status(400).json({
                success: false,
                message: '새로운 레벨이 필요합니다.'
            });
        }
        const student = await User_1.User.findById(studentId);
        if (!student) {
            return res.status(404).json({
                success: false,
                message: '학생을 찾을 수 없습니다.'
            });
        }
        if (student.userType !== 'student') {
            return res.status(400).json({
                success: false,
                message: '학생만 레벨을 변경할 수 있습니다.'
            });
        }
        let hasPermission = false;
        if (user.userType === 'superAdmin') {
            hasPermission = true;
        }
        else if (user.userType === 'centerAdmin') {
            if (student.centerId && student.centerId.toString() === user.centerId) {
                hasPermission = true;
            }
        }
        else if (user.userType === 'instructor') {
            if (student.instructorInfo?.assignedInstructor?.toString() === user._id.toString()) {
                hasPermission = true;
            }
        }
        if (!hasPermission) {
            return res.status(403).json({
                success: false,
                message: '이 학생의 레벨을 변경할 권한이 없습니다.'
            });
        }
        const oldLevelRaw = student.studentInfo?.currentLevel ||
            student.studentInfo?.swimmingLevel ||
            student.level ||
            'beginner';
        const { english: oldLevelEnglish, korean: oldLevelKorean } = resolveLevelPair(oldLevelRaw);
        const { english: englishLevel, korean: koreanLevel } = resolveLevelPair(newLevel);
        const levelChangeRecord = {
            fromLevel: oldLevelKorean,
            toLevel: koreanLevel,
            changedBy: user._id,
            changedByType: user.userType,
            reason: reason || '',
            changedAt: new Date()
        };
        const updateData = {
            'studentInfo.currentLevel': koreanLevel,
            'studentInfo.swimmingLevel': koreanLevel,
            'studentInfo.levelChangeHistory': student.studentInfo.levelChangeHistory,
            level: englishLevel
        };
        if (!student.studentInfo.levelChangeHistory) {
            student.studentInfo.levelChangeHistory = [];
        }
        student.studentInfo.levelChangeHistory.push(levelChangeRecord);
        if (student.studentInfo.levelChangeHistory.length > 10) {
            student.studentInfo.levelChangeHistory = student.studentInfo.levelChangeHistory.slice(-10);
        }
        const updatedStudent = await User_1.User.findByIdAndUpdate(studentId, updateData, {
            new: true,
            runValidators: true
        }).populate('studentInfo.levelChangeHistory.changedBy', 'name userId userType');
        res.json({
            success: true,
            message: '학생 레벨이 성공적으로 변경되었습니다.',
            data: {
                studentId: updatedStudent._id,
                oldLevel: oldLevelKorean,
                oldLevelEnglish,
                newLevel: koreanLevel,
                newLevelEnglish: englishLevel,
                changedBy: {
                    userId: user.userId,
                    name: user.name,
                    userType: user.userType
                },
                changedAt: levelChangeRecord.changedAt,
                reason: levelChangeRecord.reason
            }
        });
    }
    catch (error) {
        (0, logger_1.logError)('학생 레벨 변경 오류', error);
        res.status(500).json({
            success: false,
            message: '학생 레벨 변경에 실패했습니다.'
        });
    }
});
router.get('/:studentId/level-history', auth_1.authMiddleware, (0, auth_1.requireRole)(['instructor', 'centerAdmin', 'superAdmin']), async (req, res) => {
    try {
        const { studentId } = req.params;
        const { user } = req;
        const student = await User_1.User.findById(studentId)
            .populate('studentInfo.levelChangeHistory.changedBy', 'name userId userType')
            .select('studentInfo.levelChangeHistory studentInfo.currentLevel name');
        if (!student) {
            return res.status(404).json({
                success: false,
                message: '학생을 찾을 수 없습니다.'
            });
        }
        let hasPermission = false;
        if (user.userType === 'superAdmin') {
            hasPermission = true;
        }
        else if (user.userType === 'centerAdmin') {
            if (student.centerId && student.centerId.toString() === user.centerId) {
                hasPermission = true;
            }
        }
        else if (user.userType === 'instructor') {
            if (student.instructorInfo?.assignedInstructor?.toString() === user._id.toString()) {
                hasPermission = true;
            }
        }
        if (!hasPermission) {
            return res.status(403).json({
                success: false,
                message: '이 학생의 레벨 변경 이력을 조회할 권한이 없습니다.'
            });
        }
        const levelHistory = student.studentInfo?.levelChangeHistory || [];
        const currentLevel = student.studentInfo?.currentLevel || 'beginner';
        res.json({
            success: true,
            message: '학생 레벨 변경 이력 조회 성공!',
            data: {
                studentId: student._id,
                studentName: student.name,
                currentLevel,
                levelHistory: levelHistory.sort((a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime())
            }
        });
    }
    catch (error) {
        (0, logger_1.logError)('학생 레벨 변경 이력 조회 오류', error);
        res.status(500).json({
            success: false,
            message: '학생 레벨 변경 이력을 조회하는 데 실패했습니다.'
        });
    }
});
router.get('/center/:centerId/levels', auth_1.authMiddleware, (0, auth_1.requireRole)(['centerAdmin', 'superAdmin']), async (req, res) => {
    try {
        const { centerId } = req.params;
        const { user } = req;
        if (user.userType === 'centerAdmin' && user.centerId?.toString() !== centerId) {
            return res.status(403).json({
                success: false,
                message: '다른 센터의 학생 레벨 현황을 조회할 수 없습니다.'
            });
        }
        const students = await User_1.User.find({
            userType: 'student',
            centerId: centerId
        }).select('name studentInfo.currentLevel studentInfo.swimmingLevel createdAt');
        const levelStats = students.reduce((acc, student) => {
            const level = student.studentInfo?.currentLevel || student.studentInfo?.swimmingLevel || 'beginner';
            acc[level] = (acc[level] || 0) + 1;
            return acc;
        }, {});
        res.json({
            success: true,
            message: '센터별 학생 레벨 현황 조회 성공!',
            data: {
                centerId,
                totalStudents: students.length,
                levelStats,
                students: students.map(student => ({
                    id: student._id,
                    name: student.name,
                    currentLevel: student.studentInfo?.currentLevel || student.studentInfo?.swimmingLevel || 'beginner',
                    enrolledAt: student.createdAt
                }))
            }
        });
    }
    catch (error) {
        (0, logger_1.logError)('센터별 학생 레벨 현황 조회 오류', error);
        res.status(500).json({
            success: false,
            message: '센터별 학생 레벨 현황을 조회하는 데 실패했습니다.'
        });
    }
});
exports.default = router;
//# sourceMappingURL=student-levels.js.map