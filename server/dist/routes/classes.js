"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const logger_1 = require("../utils/logger");
const Course_1 = require("../models/Course");
const router = express_1.default.Router();
router.get('/', auth_1.authMiddleware, (0, auth_1.requireRole)(['instructor', 'centerAdmin']), async (req, res) => {
    try {
        const userId = req.user?._id;
        const userType = req.user?.userType;
        if (!userId) {
            return res.status(401).json({ error: '사용자 인증이 필요합니다.' });
        }
        const query = { isActive: true };
        if (userType === 'instructor') {
            query.$or = [
                { instructor: userId },
                { instructorId: userId }
            ];
        }
        else if (userType === 'centerAdmin') {
            const centerId = req.user?.centerAdminInfo?.managedCenters?.[0];
            if (centerId) {
                query.centerId = centerId;
            }
        }
        const courses = await Course_1.Course.find(query)
            .select('name level instructor instructorId instructorName centerId maxStudents enrolledStudents schedule classInfo isPersonalLesson')
            .populate('instructor', 'name email')
            .populate('instructorId', 'name email')
            .populate('centerId', 'name')
            .sort({ createdAt: -1 });
        const classes = courses.map(course => {
            const currentStudents = course.enrolledStudents?.filter((enrollment) => enrollment.status === 'enrolled' || enrollment.status === 'active').length || 0;
            const scheduleStr = course.schedule && course.schedule.length > 0
                ? course.schedule.map((s) => {
                    const dayMap = {
                        monday: '월', tuesday: '화', wednesday: '수', thursday: '목',
                        friday: '금', saturday: '토', sunday: '일'
                    };
                    return `${dayMap[s.day] || s.day} ${s.startTime}-${s.endTime}`;
                }).join(', ')
                : '일정 없음';
            return {
                _id: course._id.toString(),
                name: course.name,
                level: course.level,
                type: course.isPersonalLesson ? 'individual' : 'group',
                instructor: course.instructorId?.toString() || course.instructor?.toString() || userId,
                instructorName: course.instructorName || course.instructor?.name || '',
                maxStudents: course.maxStudents,
                currentStudents: currentStudents,
                schedule: scheduleStr,
                centerId: course.centerId?.toString() || '',
                className: course.classInfo?.className || course.name,
                classType: course.classInfo?.classType || (course.isPersonalLesson ? 'private' : 'regular')
            };
        });
        (0, logger_1.logInfo)('반 목록 조회', { userId, userType, classCount: classes.length });
        res.json({
            success: true,
            data: classes
        });
    }
    catch (error) {
        (0, logger_1.logError)('반 목록 조회 실패', error);
        res.status(500).json({ error: '반 목록을 불러오는데 실패했습니다.' });
    }
});
router.get('/:classId', auth_1.authMiddleware, (0, auth_1.requireRole)(['instructor', 'centerAdmin']), async (req, res) => {
    try {
        const { classId } = req.params;
        const mockClass = {
            _id: classId,
            name: '초급반 A',
            level: '초급',
            type: 'group',
            instructor: req.user?._id,
            maxStudents: 8,
            currentStudents: 6,
            schedule: '월,수,금 18:00-19:00',
            centerId: 'center001',
            students: [
                { _id: 'student1', name: '김학생', email: 'kim@example.com' },
                { _id: 'student2', name: '이학생', email: 'lee@example.com' }
            ]
        };
        (0, logger_1.logInfo)('반 상세 정보 조회', { classId });
        res.json({
            success: true,
            data: mockClass
        });
    }
    catch (error) {
        (0, logger_1.logError)('반 상세 정보 조회 실패', error);
        res.status(500).json({ error: '반 정보를 불러오는데 실패했습니다.' });
    }
});
exports.default = router;
//# sourceMappingURL=classes.js.map