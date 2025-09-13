"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const errorHandler_1 = require("../utils/errorHandler");
const logger_1 = __importDefault(require("../utils/logger"));
const router = express_1.default.Router();
router.get('/dashboard', auth_1.authMiddleware, (0, auth_1.requirePermission)('canManageCourses'), async (req, res) => {
    try {
        const instructorId = req.user?._id;
        logger_1.default.info(`🏊‍♂️ 강사 대시보드 조회 요청: ${instructorId}`);
        const dashboardData = {
            stats: {
                totalStudents: 25,
                activeCourses: 3,
                todayBookings: 5,
                averageRating: 4.8,
                totalHours: 120,
                monthlyRevenue: 2400000,
            },
            upcomingBookings: [
                {
                    id: 'booking1',
                    studentName: '김학생',
                    courseName: '자유형 기초반',
                    time: '14:00',
                    status: 'confirmed',
                },
                {
                    id: 'booking2',
                    studentName: '이학생',
                    courseName: '배영 중급반',
                    time: '15:00',
                    status: 'confirmed',
                },
            ],
        };
        res.status(200).json({
            success: true,
            message: '강사 대시보드 조회 성공',
            data: dashboardData,
        });
    }
    catch (error) {
        logger_1.default.error(`❌ 강사 대시보드 조회 중 오류 발생: ${error.message}`);
        (0, errorHandler_1.errorHandler)(error, req, res, () => { });
    }
});
router.get('/courses', auth_1.authMiddleware, (0, auth_1.requirePermission)('canManageCourses'), async (req, res) => {
    try {
        const instructorId = req.user?._id;
        logger_1.default.info(`📚 강사 강의 목록 조회 요청: ${instructorId}`);
        const courses = [
            {
                id: 'course1',
                name: '자유형 기초반',
                level: 'beginner',
                currentStudents: 8,
                maxStudents: 10,
                startDate: '2025-01-01',
                endDate: '2025-03-31',
                status: 'active',
                totalSessions: 24,
                completedSessions: 8,
                progress: 33,
                location: '1층 메인풀',
            },
            {
                id: 'course2',
                name: '배영 중급반',
                level: 'intermediate',
                currentStudents: 6,
                maxStudents: 8,
                startDate: '2025-01-15',
                endDate: '2025-04-15',
                status: 'active',
                totalSessions: 20,
                completedSessions: 5,
                progress: 25,
                location: '2층 보조풀',
            },
        ];
        res.status(200).json({
            success: true,
            message: '강사 강의 목록 조회 성공',
            data: courses,
        });
    }
    catch (error) {
        logger_1.default.error(`❌ 강사 강의 목록 조회 중 오류 발생: ${error.message}`);
        (0, errorHandler_1.errorHandler)(error, req, res, () => { });
    }
});
exports.default = router;
//# sourceMappingURL=instructor.js.map