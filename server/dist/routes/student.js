"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const errorHandler_1 = require("../utils/errorHandler");
const logger_1 = __importDefault(require("../utils/logger"));
const Booking_1 = require("../models/Booking");
const router = express_1.default.Router();
router.get('/dashboard', auth_1.authMiddleware, async (req, res) => {
    try {
        const studentId = req.user?._id;
        logger_1.default.info(`👨‍🎓 학생 대시보드 조회 요청: ${studentId}`);
        const dashboardData = {
            stats: {
                enrolledCourses: 2,
                completedSessions: 15,
                totalSessions: 24,
                currentStreak: 7,
                averageRating: 4.5,
                nextClass: '2025-01-15 14:00',
                achievements: 3,
                weeklyGoal: 3,
            },
            upcomingClasses: [
                {
                    id: 'booking1',
                    courseName: '자유형 기초반',
                    instructorName: '김강사',
                    date: '2025-01-15',
                    time: '14:00 - 15:00',
                    location: '1층 메인풀',
                    status: 'confirmed',
                },
                {
                    id: 'booking2',
                    courseName: '배영 중급반',
                    instructorName: '이강사',
                    date: '2025-01-17',
                    time: '15:00 - 16:00',
                    location: '2층 보조풀',
                    status: 'confirmed',
                },
            ],
            progressData: [
                {
                    skill: '자유형',
                    currentLevel: 3,
                    maxLevel: 5,
                    progress: 60,
                },
                {
                    skill: '배영',
                    currentLevel: 2,
                    maxLevel: 5,
                    progress: 40,
                },
                {
                    skill: '접영',
                    currentLevel: 1,
                    maxLevel: 5,
                    progress: 20,
                },
                {
                    skill: '평영',
                    currentLevel: 1,
                    maxLevel: 5,
                    progress: 20,
                },
            ],
        };
        res.status(200).json({
            success: true,
            message: '학생 대시보드 조회 성공',
            data: dashboardData,
        });
    }
    catch (error) {
        logger_1.default.error(`❌ 학생 대시보드 조회 중 오류 발생: ${error.message}`);
        (0, errorHandler_1.errorHandler)(error, req, res, () => { });
    }
});
router.get('/courses', auth_1.authMiddleware, async (req, res) => {
    try {
        const studentId = req.user?._id;
        logger_1.default.info(`📚 학생 강의 목록 조회 요청: ${studentId}`);
        const courses = [
            {
                id: 'course1',
                name: '자유형 기초반',
                instructorName: '김강사',
                level: 'beginner',
                startDate: '2025-01-01',
                endDate: '2025-03-31',
                status: 'active',
                progress: 60,
                completedSessions: 8,
                totalSessions: 24,
                nextClass: '2025-01-15 14:00',
                schedule: '월,수,금 14:00-15:00',
            },
            {
                id: 'course2',
                name: '배영 중급반',
                instructorName: '이강사',
                level: 'intermediate',
                startDate: '2025-01-15',
                endDate: '2025-04-15',
                status: 'active',
                progress: 25,
                completedSessions: 5,
                totalSessions: 20,
                nextClass: '2025-01-17 15:00',
                schedule: '화,목 15:00-16:00',
            },
        ];
        res.status(200).json({
            success: true,
            message: '학생 강의 목록 조회 성공',
            data: courses,
        });
    }
    catch (error) {
        logger_1.default.error(`❌ 학생 강의 목록 조회 중 오류 발생: ${error.message}`);
        (0, errorHandler_1.errorHandler)(error, req, res, () => { });
    }
});
router.get('/bookings', auth_1.authMiddleware, (0, auth_1.requirePermission)('canManageBookings'), async (req, res) => {
    try {
        const studentId = req.user?._id;
        logger_1.default.info(`📅 학생 예약 목록 조회 요청: ${studentId}`);
        const actualBookingsCount = await Booking_1.Booking.countDocuments({ user: studentId });
        console.log('🔍 학생 예약 API - 실제 예약 개수:', actualBookingsCount);
        const sampleBookings = [
            {
                _id: 'booking1',
                courseName: '자유형 기초반',
                instructorName: '김강사',
                date: '2025-01-15',
                startTime: '14:00',
                endTime: '15:00',
                location: '1층 메인풀',
                status: 'confirmed',
                bookingDate: '2025-01-10',
                cancelDate: undefined,
                price: 50000,
                notes: '자유형 기본 동작 연습',
                laneNumber: 3,
                level: 'beginner'
            },
            {
                _id: 'booking2',
                courseName: '배영 중급반',
                instructorName: '이강사',
                date: '2025-01-17',
                startTime: '15:00',
                endTime: '16:00',
                location: '2층 보조풀',
                status: 'confirmed',
                bookingDate: '2025-01-12',
                cancelDate: undefined,
                price: 70000,
                notes: '배영 턴 기술 향상',
                laneNumber: 5,
                level: 'intermediate'
            },
            {
                _id: 'booking3',
                courseName: '평영 고급반',
                instructorName: '박강사',
                date: '2025-01-20',
                startTime: '16:00',
                endTime: '17:00',
                location: '1층 메인풀',
                status: 'pending',
                bookingDate: '2025-01-15',
                cancelDate: undefined,
                price: 90000,
                notes: '평영 속도 향상 훈련',
                laneNumber: 2,
                level: 'advanced'
            },
            {
                _id: 'booking4',
                courseName: '접영 마스터반',
                instructorName: '최강사',
                date: '2025-01-22',
                startTime: '17:00',
                endTime: '18:00',
                location: '1층 메인풀',
                status: 'completed',
                bookingDate: '2025-01-08',
                cancelDate: undefined,
                price: 120000,
                notes: '접영 완전 정복',
                laneNumber: 1,
                level: 'expert'
            },
            {
                _id: 'booking5',
                courseName: '개인 맞춤 강습',
                instructorName: '김강사',
                date: '2025-01-25',
                startTime: '18:00',
                endTime: '19:00',
                location: '2층 보조풀',
                status: 'confirmed',
                bookingDate: '2025-01-18',
                cancelDate: undefined,
                price: 150000,
                notes: '개인별 맞춤 기술 교정',
                laneNumber: 4,
                level: 'custom'
            }
        ];
        const bookings = sampleBookings.slice(0, Math.max(actualBookingsCount, 2));
        res.status(200).json({
            success: true,
            message: '학생 예약 목록 조회 성공',
            data: bookings,
        });
    }
    catch (error) {
        logger_1.default.error(`❌ 학생 예약 목록 조회 중 오류 발생: ${error.message}`);
        (0, errorHandler_1.errorHandler)(error, req, res, () => { });
    }
});
exports.default = router;
//# sourceMappingURL=student.js.map