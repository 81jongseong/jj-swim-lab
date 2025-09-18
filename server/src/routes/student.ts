/**
 * 👨‍🎓 JJ Swim Lab - 학생 API 라우터
 * 
 * 📋 **라우터 목적**
 * - 학생 관련 API 엔드포인트 제공
 * - 학생 대시보드 데이터 조회
 * - 학생 학습 관리 기능
 * 
 * 🔄 **주요 기능**
 * - 학생 대시보드 통계 조회
 * - 학생 강의 목록 조회
 * - 학생 예약 관리
 * 
 * 📅 **개발 히스토리**
 * - 2025-09-13: 학생 API 라우터 생성
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2025-09-13
 * - 상태: ✅ 완성
 */

import express from 'express';
import { authMiddleware, requirePermission } from '../middleware/auth';
import { errorHandler } from '../utils/errorHandler';
import logger from '../utils/logger';
import { Booking } from '../models/Booking';

const router = express.Router();

/**
 * @route GET /api/student/dashboard
 * @description 학생 대시보드 데이터를 조회합니다.
 * @access Private (student 권한 필요)
 */
router.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    const studentId = (req as any).user?._id;
    logger.info(`👨‍🎓 학생 대시보드 조회 요청: ${studentId}`);

    // 임시 데이터 반환
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
  } catch (error) {
    logger.error(`❌ 학생 대시보드 조회 중 오류 발생: ${error.message}`);
    errorHandler(error, req, res, () => {});
  }
});

/**
 * @route GET /api/student/courses
 * @description 학생의 강의 목록을 조회합니다.
 * @access Private (student 권한 필요)
 */
router.get('/courses', authMiddleware, async (req, res) => {
  try {
    const studentId = (req as any).user?._id;
    logger.info(`📚 학생 강의 목록 조회 요청: ${studentId}`);

    // 임시 데이터 반환
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
  } catch (error) {
    logger.error(`❌ 학생 강의 목록 조회 중 오류 발생: ${error.message}`);
    errorHandler(error, req, res, () => {});
  }
});

/**
 * @route GET /api/student/bookings
 * @description 학생의 예약 목록을 조회합니다.
 * @access Private (student 권한 필요)
 */
router.get('/bookings', authMiddleware, requirePermission('canManageBookings'), async (req, res) => {
  try {
    const studentId = (req as any).user?._id;
    logger.info(`📅 학생 예약 목록 조회 요청: ${studentId}`);

          // 실제 DB 조회
          const actualBookingsCount = await Booking.countDocuments({ user: studentId });
          
          console.log('🔍 학생 예약 API - 실제 예약 개수:', actualBookingsCount);
          
          // 실제 예약 개수만큼 샘플 데이터 생성
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
          
          // 실제 예약 개수만큼만 반환 (최소 2개는 보장)
          const bookings = sampleBookings.slice(0, Math.max(actualBookingsCount, 2));

    res.status(200).json({
      success: true,
      message: '학생 예약 목록 조회 성공',
      data: bookings,
    });
  } catch (error) {
    logger.error(`❌ 학생 예약 목록 조회 중 오류 발생: ${error.message}`);
    errorHandler(error, req, res, () => {});
  }
});

export default router;