"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const User_1 = require("../models/User");
const Course_1 = require("../models/Course");
const Booking_1 = require("../models/Booking");
const Payment_1 = require("../models/Payment");
const ExerciseData_1 = require("../models/ExerciseData");
const HealthData_1 = require("../models/HealthData");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.post('/generate-dashboard-data', auth_1.authMiddleware, (0, auth_1.requireRole)(['student', 'instructor', 'admin']), async (req, res) => {
    try {
        const userId = req.user._id;
        const centerId = req.user.centerId;
        const userType = req.user.userType;
        console.log(`📊 ${req.user.name} (${userType}) 샘플 데이터 생성 시작...`);
        const generatedData = {
            courses: 0,
            bookings: 0,
            payments: 0,
            exerciseRecords: 0,
            healthProfile: false
        };
        let instructor = await User_1.User.findOne({ userType: 'instructor', centerId: centerId });
        if (!instructor) {
            instructor = await User_1.User.findOne({ userType: 'instructor' });
        }
        if (userType === 'student') {
            const existingCourses = await Course_1.Course.countDocuments({ centerId: centerId });
            if (existingCourses === 0 && instructor) {
                const courses = [
                    {
                        name: '수영 기초반',
                        description: '초보자를 위한 기본 수영 강습',
                        level: '초급',
                        duration: 60,
                        price: 50000,
                        maxStudents: 8,
                        instructor: instructor._id,
                        centerId: centerId,
                        classInfo: {
                            className: '수영 기초반 A',
                            classType: 'regular',
                            startDate: new Date(),
                            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                            maxCapacity: 8,
                            currentEnrollment: 5
                        },
                        teachingMethods: [],
                        isActive: true
                    },
                    {
                        name: '자유형 중급반',
                        description: '자유형 기술 향상 강습',
                        level: '중급',
                        duration: 60,
                        price: 70000,
                        maxStudents: 6,
                        instructor: instructor._id,
                        centerId: centerId,
                        classInfo: {
                            className: '자유형 중급반 B',
                            classType: 'regular',
                            startDate: new Date(),
                            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                            maxCapacity: 6,
                            currentEnrollment: 4
                        },
                        teachingMethods: [],
                        isActive: true
                    }
                ];
                for (const courseData of courses) {
                    const course = new Course_1.Course(courseData);
                    await course.save();
                    generatedData.courses++;
                }
            }
            const existingBookings = await Booking_1.Booking.countDocuments({ studentId: userId });
            if (existingBookings === 0) {
                const allCourses = await Course_1.Course.find({ centerId: centerId });
                for (let i = 0; i < 8; i++) {
                    const course = allCourses[Math.floor(Math.random() * allCourses.length)];
                    const bookingDate = new Date();
                    bookingDate.setDate(bookingDate.getDate() + Math.floor(Math.random() * 30) - 15);
                    const booking = new Booking_1.Booking({
                        user: userId,
                        studentId: userId,
                        courseId: course._id,
                        instructorId: course.instructor,
                        centerId: centerId,
                        date: bookingDate,
                        startTime: '14:00',
                        endTime: '15:00',
                        laneNumber: Math.floor(Math.random() * 8) + 1,
                        purpose: 'lesson',
                        status: i < 5 ? 'completed' : 'confirmed',
                        paymentStatus: 'paid',
                        notes: `${course.name} 예약`
                    });
                    await booking.save();
                    generatedData.bookings++;
                }
            }
            const existingPayments = await Payment_1.Payment.countDocuments({ userId: userId });
            if (existingPayments === 0) {
                const userBookings = await Booking_1.Booking.find({ studentId: userId }).populate('course');
                for (const booking of userBookings) {
                    const payment = new Payment_1.Payment({
                        userId: userId,
                        bookingId: booking._id,
                        courseId: booking.course._id,
                        centerId: centerId,
                        amount: booking.course.pricing?.discountPrice || 50000,
                        paymentMethod: ['card', 'transfer'][Math.floor(Math.random() * 2)],
                        status: 'completed',
                        transactionId: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                        paidAt: booking.createdAt,
                        createdAt: booking.createdAt
                    });
                    await payment.save();
                    generatedData.payments++;
                }
            }
            const existingExercise = await ExerciseData_1.ExerciseData.countDocuments({ userId: userId });
            if (existingExercise === 0) {
                for (let i = 0; i < 12; i++) {
                    const sessionDate = new Date(Date.now() - i * 2 * 24 * 60 * 60 * 1000);
                    const exerciseData = new ExerciseData_1.ExerciseData({
                        userId: userId,
                        sessionId: `session_${userId}_${i}`,
                        sessionInfo: {
                            date: sessionDate,
                            startTime: new Date(sessionDate.getTime() + 14 * 60 * 60 * 1000),
                            endTime: new Date(sessionDate.getTime() + 15 * 60 * 60 * 1000),
                            duration: 60,
                            technique: ['freestyle', 'backstroke', 'breaststroke', 'butterfly'][Math.floor(Math.random() * 4)],
                            poolLength: 25,
                            totalDistance: 800 + Math.floor(Math.random() * 400)
                        },
                        performanceMetrics: {
                            averageSpeed: 1.0 + Math.random() * 0.5,
                            maxSpeed: 1.2 + Math.random() * 0.6,
                            totalCalories: 250 + Math.floor(Math.random() * 200),
                            averageHeartRate: 130 + Math.floor(Math.random() * 30),
                            maxHeartRate: 150 + Math.floor(Math.random() * 30),
                            strokeCount: 600 + Math.floor(Math.random() * 400),
                            efficiency: 70 + Math.floor(Math.random() * 30)
                        },
                        poseAnalysis: {
                            overallScore: 70 + Math.floor(Math.random() * 30),
                            headPosition: 75 + Math.floor(Math.random() * 20),
                            bodyAlignment: 70 + Math.floor(Math.random() * 25),
                            armMovement: 80 + Math.floor(Math.random() * 15),
                            legKick: 75 + Math.floor(Math.random() * 20),
                            breathing: 70 + Math.floor(Math.random() * 25),
                            recommendations: [
                                '머리 위치를 더 안정적으로 유지하세요',
                                '팔 동작의 일관성을 높여보세요',
                                '호흡 타이밍을 개선해보세요'
                            ]
                        }
                    });
                    await exerciseData.save();
                    generatedData.exerciseRecords++;
                }
            }
            const existingHealth = await HealthData_1.HealthData.findOne({ userId: userId });
            if (!existingHealth) {
                const healthData = new HealthData_1.HealthData({
                    userId: userId,
                    basicInfo: {
                        age: 25,
                        height: 175,
                        weight: 70,
                        gender: 'male'
                    },
                    swimmingInfo: {
                        experienceLevel: 'intermediate',
                        preferredStrokes: ['freestyle', 'backstroke'],
                        goals: ['체력 향상', '기술 개선'],
                        currentLevel: 3
                    },
                    healthConditions: {
                        medicalHistory: [],
                        currentMedications: [],
                        injuries: [],
                        allergies: []
                    },
                    fitnessGoals: {
                        targetWeight: 68,
                        targetBodyFat: 15,
                        weeklyExerciseGoal: 4,
                        specificGoals: ['근력 향상', '지구력 증진']
                    }
                });
                await healthData.save();
                generatedData.healthProfile = true;
            }
        }
        console.log(`✅ ${req.user.name} 샘플 데이터 생성 완료:`, generatedData);
        res.json({
            success: true,
            message: '샘플 데이터가 성공적으로 생성되었습니다!',
            data: generatedData
        });
    }
    catch (error) {
        console.error('❌ 샘플 데이터 생성 실패:', error);
        res.status(500).json({
            success: false,
            message: '샘플 데이터 생성 중 오류가 발생했습니다.',
            error: error.message
        });
    }
});
exports.default = router;
//# sourceMappingURL=sample-data.js.map