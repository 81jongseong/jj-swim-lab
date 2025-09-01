"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const logger_1 = require("../utils/logger");
const router = express_1.default.Router();
router.get('/students', auth_1.auth, (0, auth_1.requireRole)(['instructor']), async (req, res) => {
    try {
        const instructorId = req.user?._id;
        if (!instructorId) {
            return res.status(401).json({ error: '사용자 인증이 필요합니다.' });
        }
        const mockStudents = [
            {
                _id: 'student1',
                name: '김학생',
                email: 'kim@example.com',
                phone: '010-1234-5678',
                level: '초급',
                progress: 75,
                lastLesson: '2024-12-19',
                nextLesson: '2024-12-21',
                attendance: 8,
                totalLessons: 10,
                notes: '수영에 재능이 있어 보입니다.'
            },
            {
                _id: 'student2',
                name: '이학생',
                email: 'lee@example.com',
                phone: '010-2345-6789',
                level: '중급',
                progress: 60,
                lastLesson: '2024-12-18',
                nextLesson: '2024-12-20',
                attendance: 6,
                totalLessons: 10,
                notes: '기본기가 탄탄합니다.'
            }
        ];
        (0, logger_1.logInfo)('강사별 학생 목록 조회', { instructorId, studentCount: mockStudents.length });
        res.json({
            success: true,
            data: mockStudents
        });
    }
    catch (error) {
        (0, logger_1.logError)('강사별 학생 목록 조회 실패', error);
        res.status(500).json({ error: '학생 목록을 불러오는데 실패했습니다.' });
    }
});
router.get('/classes', auth_1.auth, (0, auth_1.requireRole)(['instructor']), async (req, res) => {
    try {
        const instructorId = req.user?._id;
        if (!instructorId) {
            return res.status(401).json({ error: '사용자 인증이 필요합니다.' });
        }
        const mockClasses = [
            {
                _id: 'class1',
                name: '초급반 A',
                level: '초급',
                type: 'group',
                instructor: instructorId,
                maxStudents: 8,
                currentStudents: 6,
                schedule: '월,수,금 18:00-19:00'
            },
            {
                _id: 'class2',
                name: '중급반 B',
                level: '중급',
                type: 'group',
                instructor: instructorId,
                maxStudents: 6,
                currentStudents: 4,
                schedule: '화,목 19:00-20:00'
            }
        ];
        (0, logger_1.logInfo)('강사별 반 목록 조회', { instructorId, classCount: mockClasses.length });
        res.json({
            success: true,
            data: mockClasses
        });
    }
    catch (error) {
        (0, logger_1.logError)('강사별 반 목록 조회 실패', error);
        res.status(500).json({ error: '반 목록을 불러오는데 실패했습니다.' });
    }
});
router.get('/schedule', auth_1.auth, (0, auth_1.requireRole)(['instructor']), async (req, res) => {
    try {
        const instructorId = req.user?._id;
        if (!instructorId) {
            return res.status(401).json({ error: '사용자 인증이 필요합니다.' });
        }
        const mockSchedule = [
            {
                _id: 'schedule1',
                date: '2024-12-20',
                time: '18:00-19:00',
                classId: 'class1',
                className: '초급반 A',
                studentCount: 6
            },
            {
                _id: 'schedule2',
                date: '2024-12-21',
                time: '19:00-20:00',
                classId: 'class2',
                className: '중급반 B',
                studentCount: 4
            }
        ];
        (0, logger_1.logInfo)('강사별 일정 조회', { instructorId, scheduleCount: mockSchedule.length });
        res.json({
            success: true,
            data: mockSchedule
        });
    }
    catch (error) {
        (0, logger_1.logError)('강사별 일정 조회 실패', error);
        res.status(500).json({ error: '일정을 불러오는데 실패했습니다.' });
    }
});
exports.default = router;
//# sourceMappingURL=instructor.js.map