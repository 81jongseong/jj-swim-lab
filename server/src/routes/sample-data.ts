/**
 * 📊 JJ Swim Lab - 샘플 데이터 생성 API
 * 
 * 📋 **API 목적**
 * - 브라우저에서 직접 호출하여 대시보드용 샘플 데이터 생성
 * - 예약, 강의, 결제, 운동 기록 등 모든 대시보드 데이터 포함
 * - 즉시 실행 가능한 웹 API 제공
 */

import express, { Response } from 'express';
import { User } from '../models/User';
import { Course } from '../models/Course';
import { Booking } from '../models/Booking';
import { Payment } from '../models/Payment';
import { ExerciseData } from '../models/ExerciseData';
import { HealthData } from '../models/HealthData';
import { authMiddleware, requireRole, AuthRequest } from '../middleware/auth';

const router = express.Router();

// 대시보드 샘플 데이터 생성 API
router.post('/generate-dashboard-data', authMiddleware, requireRole(['student', 'instructor', 'admin']), async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user._id;
    const centerId = req.user.centerId;
    const userType = req.user.userType;

    console.log(`📊 ${req.user.name} (${userType}) 샘플 데이터 생성 시작...`);

    let generatedData = {
      courses: 0,
      bookings: 0,
      payments: 0,
      exerciseRecords: 0,
      healthProfile: false
    };

    // 강사 찾기 (강의 생성용)
    let instructor = await User.findOne({ userType: 'instructor', centerId: centerId });
    if (!instructor) {
      instructor = await User.findOne({ userType: 'instructor' });
    }

    if (userType === 'student') {
      // 학생용 데이터 생성

      // 1. 강의 데이터 생성 (센터 전체용)
      const existingCourses = await Course.countDocuments({ centerId: centerId });
      if (existingCourses === 0 && instructor) {
        const courses = [
          {
            name: '수영 기초반',
            description: '초보자를 위한 기본 수영 강습',
            level: 'beginner',
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
            level: 'intermediate',
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
          const course = new Course(courseData);
          await course.save();
          generatedData.courses++;
        }
      }

      // 2. 예약 데이터 생성
      const existingBookings = await Booking.countDocuments({ studentId: userId });
      if (existingBookings === 0) {
        const allCourses = await Course.find({ centerId: centerId });
        
        for (let i = 0; i < 8; i++) {
          const course = allCourses[Math.floor(Math.random() * allCourses.length)];
          const bookingDate = new Date();
          bookingDate.setDate(bookingDate.getDate() + Math.floor(Math.random() * 30) - 15);

          const booking = new Booking({
            user: userId,
            studentId: userId, // centers.ts에서 사용하는 필드
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

      // 3. 결제 데이터 생성
      const existingPayments = await Payment.countDocuments({ userId: userId });
      if (existingPayments === 0) {
        const userBookings = await Booking.find({ studentId: userId }).populate('courseId');
        
        for (const booking of userBookings) {
          const payment = new Payment({
            userId: userId,
            bookingId: booking._id,
            courseId: booking.courseId._id,
            centerId: centerId,
            amount: booking.courseId.pricing?.discountPrice || 50000,
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

      // 4. 운동 기록 데이터 생성
      const existingExercise = await ExerciseData.countDocuments({ userId: userId });
      if (existingExercise === 0) {
        for (let i = 0; i < 12; i++) {
          const sessionDate = new Date(Date.now() - i * 2 * 24 * 60 * 60 * 1000);
          const exerciseData = new ExerciseData({
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

      // 5. 건강 프로필 생성
      const existingHealth = await HealthData.findOne({ userId: userId });
      if (!existingHealth) {
        const healthData = new HealthData({
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

  } catch (error) {
    console.error('❌ 샘플 데이터 생성 실패:', error);
    res.status(500).json({
      success: false,
      message: '샘플 데이터 생성 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

export default router;
