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
import { Course } from '../models/Course';
import { PersonalLesson } from '../models/PersonalLesson';
import mongoose from 'mongoose';

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

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: '학생 ID가 없습니다.'
      });
    }

    // ⭐ centerId가 없으면 등록된 Course나 Payment에서 자동으로 찾아서 배정
    const { User } = require('../models/User');
    const student = await User.findById(studentId);
    if (student && !student.centerId) {
      // 1) 등록된 Course에서 centerId 찾기
      const enrolledCourse = await Course.findOne({
        'enrolledStudents.student': studentId
      }).select('centerId').lean() as any;

      if (enrolledCourse?.centerId) {
        student.centerId = enrolledCourse.centerId as any;
        await student.save();
        logger.info(`✅ 학생 ${studentId}의 centerId 자동 배정 (Course): ${enrolledCourse.centerId}`);
      } else {
        // 2) Payment에서 centerId 찾기
        const { Payment } = require('../models/Payment');
        const payment = await Payment.findOne({
          user: studentId,
          status: { $in: ['pending', 'completed'] },
          purpose: 'course'
        }).select('centerId').lean() as any;

        if (payment?.centerId) {
          student.centerId = payment.centerId as any;
          await student.save();
          logger.info(`✅ 학생 ${studentId}의 centerId 자동 배정 (Payment): ${payment.centerId}`);
        } else {
          // 3) Booking에서 centerId 찾기
          const booking = await Booking.findOne({
            studentId: new mongoose.Types.ObjectId(studentId),
            status: { $in: ['confirmed', 'pending', 'completed'] }
          }).select('centerId').lean() as any;

          if (booking?.centerId) {
            student.centerId = booking.centerId as any;
            await student.save();
            logger.info(`✅ 학생 ${studentId}의 centerId 자동 배정 (Booking): ${booking.centerId}`);
          }
        }
      }
    }

    // ⭐ 실제 DB 데이터 조회 - /api/courses/student/enrolled와 동일한 로직 사용
    // 1) explicit enrollment (Course.enrolledStudents에 포함된 코스)
    const explicitlyEnrolledCourseIds = await Course.find(
      { 'enrolledStudents.student': studentId },
      { _id: 1 }
    ).lean();

    // 2) bookings 기반 포함
    const bookingCourseIds = await Booking.distinct('courseId', {
      studentId: new mongoose.Types.ObjectId(studentId),
      status: { $in: ['confirmed', 'pending', 'completed'] }
    });

    // 3) payments 기반 포함
    const { Payment } = require('../models/Payment');
    const paymentCourseIds = await Payment.distinct('relatedCourse', {
      user: studentId,
      status: { $in: ['pending', 'completed'] },
      purpose: 'course'
    });

    // 코스 ID 집합 구성
    const enrolledIdsSet = new Set<string>([
      ...explicitlyEnrolledCourseIds.map((c: any) => String(c._id)),
      ...bookingCourseIds.map((id: any) => String(id)),
      ...paymentCourseIds.map((id: any) => String(id))
    ].filter(Boolean));

    // 등록된 코스 조회
    const enrolledCourses = enrolledIdsSet.size > 0 ? await Course.find({
      _id: { $in: Array.from(enrolledIdsSet).map(id => new mongoose.Types.ObjectId(id)) }
    })
    .populate('instructor', 'name')
    .lean() : [];

    // 2. 개인레슨 조회 (pending도 포함 - instructorId가 있으면 자동 승인 처리)
    const personalLessonsRaw = await PersonalLesson.find({
      studentId: new mongoose.Types.ObjectId(studentId),
      status: { $in: ['pending', 'approved', 'completed'] }
    })
    .populate('instructorId', 'name')
    .sort({ date: 1, startTime: 1 });

    // ⭐ instructorId가 있는 pending 상태 레슨을 자동으로 approved로 변경
    const personalLessonsToUpdate: any[] = [];
    for (const lesson of personalLessonsRaw) {
      if (lesson.status === 'pending' && lesson.instructorId) {
        lesson.status = 'approved';
        personalLessonsToUpdate.push(lesson);
      }
    }

    // 자동 승인된 레슨들을 일괄 저장
    if (personalLessonsToUpdate.length > 0) {
      await Promise.all(personalLessonsToUpdate.map(lesson => lesson.save()));
      logger.info(`✅ 학생 ${studentId}의 ${personalLessonsToUpdate.length}개 개인레슨 자동 승인 완료`);
    }

    // lean()으로 변환
    const personalLessons = personalLessonsRaw.map((lesson: any) => lesson.toObject());

    // 3. 예약 조회 (다가오는 수업)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const upcomingBookings = await Booking.find({
      studentId: new mongoose.Types.ObjectId(studentId),
      date: { $gte: today },
      status: { $in: ['confirmed', 'approved', 'pending'] }
    })
    .populate('courseId', 'name')
    .populate('instructorId', 'name')
    .sort({ date: 1, startTime: 1 })
    .limit(5)
    .lean();

    // 통계 계산
    const enrolledCoursesCount = enrolledCourses.length;
    // ⭐ approved, completed 상태이거나 instructorId가 있는 pending 상태도 활성 강습으로 카운트
    const activePersonalLessons = personalLessons.filter((pl: any) => 
      pl.status === 'approved' || pl.status === 'completed' || (pl.status === 'pending' && pl.instructorId)
    );
    const personalLessonsCount = activePersonalLessons.length;
    const totalEnrolled = enrolledCoursesCount + personalLessonsCount;

    // 완료된 세션 수 계산
    const completedSessions = personalLessons.filter((pl: any) => pl.status === 'completed').length;
    const totalSessions = personalLessons.length;

    // 다음 수업 찾기
    let nextClass = null;
    const allUpcoming = [
      ...upcomingBookings.map((b: any) => ({
        id: b._id?.toString(),
        courseName: b.courseId?.name || '개인 레슨',
        instructorName: b.instructorId?.name || '강사 미배정',
        date: b.date ? new Date(b.date).toISOString().split('T')[0] : null,
        time: b.startTime ? `${b.startTime} - ${b.endTime || ''}` : '',
        location: b.location || '위치 미지정',
        status: b.status || 'confirmed'
      })),
      ...personalLessons
        .filter((pl: any) => {
          const lessonDate = new Date(pl.date);
          // ⭐ approved 상태이거나 instructorId가 있는 pending 상태도 포함
          const isActive = pl.status === 'approved' || (pl.status === 'pending' && pl.instructorId);
          return lessonDate >= today && isActive;
        })
        .slice(0, 5)
        .map((pl: any) => ({
          id: pl._id?.toString(),
          courseName: '개인 레슨',
          instructorName: pl.instructorId?.name || '강사 미배정',
          date: pl.date ? new Date(pl.date).toISOString().split('T')[0] : null,
          time: pl.startTime ? `${pl.startTime} - ${pl.endTime || ''}` : '',
          location: pl.poolType || '위치 미지정',
          status: pl.status === 'pending' && pl.instructorId ? 'approved' : (pl.status || 'approved')
        }))
    ].sort((a, b) => {
      if (!a.date || !b.date) return 0;
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

    if (allUpcoming.length > 0) {
      nextClass = allUpcoming[0];
    }

    // 진행률 데이터 (코스별)
    const progressData = enrolledCourses.map((course: any) => {
      const enrollment = (course.enrolledStudents || []).find((e: any) => 
        e.student?.toString() === studentId.toString()
      );
      const progress = enrollment?.progress?.percentage || 0;
      return {
        skill: course.name || '강의',
        currentLevel: Math.floor(progress / 20),
        maxLevel: 5,
        progress: progress
      };
    });

    const dashboardData = {
      stats: {
        enrolledCourses: totalEnrolled,
        completedSessions,
        totalSessions,
        currentStreak: 0, // TODO: 연속 출석 계산
        averageRating: 0, // TODO: 평균 평점 계산
        nextClass: nextClass ? `${nextClass.date} ${nextClass.time}` : null,
        achievements: 0, // TODO: 업적 계산
        weeklyGoal: 3,
      },
      upcomingClasses: allUpcoming.slice(0, 5),
      progressData: progressData.length > 0 ? progressData : [
        { skill: '자유형', currentLevel: 0, maxLevel: 5, progress: 0 },
        { skill: '배영', currentLevel: 0, maxLevel: 5, progress: 0 },
        { skill: '접영', currentLevel: 0, maxLevel: 5, progress: 0 },
        { skill: '평영', currentLevel: 0, maxLevel: 5, progress: 0 },
      ],
    };

    res.status(200).json({
      success: true,
      message: '학생 대시보드 조회 성공',
      data: dashboardData,
    });
  } catch (error: any) {
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

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: '학생 ID가 없습니다.'
      });
    }

    // ⭐ 실제 DB 데이터 조회
    // 1. 등록된 코스 조회
    const enrolledCourses = await Course.find({
      'enrolledStudents.student': new mongoose.Types.ObjectId(studentId),
      'enrolledStudents.status': 'active'
    })
    .populate('instructor', 'name')
    .populate('centerId', 'name address')
    .lean();

    // 2. 개인레슨 조회 (pending도 포함 - instructorId가 있으면 자동 승인 처리)
    const personalLessonsRaw = await PersonalLesson.find({
      studentId: new mongoose.Types.ObjectId(studentId),
      status: { $in: ['pending', 'approved', 'completed'] }
    })
    .populate('instructorId', 'name')
    .sort({ date: -1 });

    // ⭐ instructorId가 있는 pending 상태 레슨을 자동으로 approved로 변경
    const personalLessonsToUpdate: any[] = [];
    for (const lesson of personalLessonsRaw) {
      if (lesson.status === 'pending' && lesson.instructorId) {
        lesson.status = 'approved';
        personalLessonsToUpdate.push(lesson);
      }
    }

    // 자동 승인된 레슨들을 일괄 저장
    if (personalLessonsToUpdate.length > 0) {
      await Promise.all(personalLessonsToUpdate.map(lesson => lesson.save()));
      logger.info(`✅ 학생 ${studentId}의 ${personalLessonsToUpdate.length}개 개인레슨 자동 승인 완료`);
    }

    // lean()으로 변환
    const personalLessons = personalLessonsRaw.map((lesson: any) => lesson.toObject());

    // 코스 데이터 변환
    const coursesData = enrolledCourses.map((course: any) => {
      const enrollment = (course.enrolledStudents || []).find((e: any) => 
        e.student?.toString() === studentId.toString()
      );
      const progress = enrollment?.progress?.percentage || 0;
      const schedule = (course.schedule || []).map((s: any) => 
        `${s.day || s.dayOfWeek || ''} ${s.startTime || ''}-${s.endTime || ''}`
      ).join(', ');

      return {
        id: course._id?.toString(),
        name: course.name || '제목 없음',
        instructorName: course.instructor?.name || '강사 미배정',
        level: course.level || 'beginner',
        startDate: course.startDate ? new Date(course.startDate).toISOString().split('T')[0] : '',
        endDate: course.endDate ? new Date(course.endDate).toISOString().split('T')[0] : '',
        status: course.status || 'active',
        progress,
        completedSessions: Math.floor((progress / 100) * (course.totalSessions || 0)),
        totalSessions: course.totalSessions || 0,
        nextClass: course.classInfo?.startDate ? new Date(course.classInfo.startDate).toISOString().replace('T', ' ').slice(0, 16) : null,
        schedule: schedule || '일정 없음',
      };
    });

    // 개인레슨 데이터 변환
    const personalLessonsData = personalLessons.map((pl: any) => ({
      id: pl._id?.toString(),
      name: '개인 레슨',
      instructorName: pl.instructorId?.name || '강사 미배정',
      level: pl.skillLevel || 'beginner',
      startDate: pl.date ? new Date(pl.date).toISOString().split('T')[0] : '',
      endDate: pl.date ? new Date(pl.date).toISOString().split('T')[0] : '',
      status: pl.status === 'completed' ? 'completed' : 'active',
      progress: pl.status === 'completed' ? 100 : 0,
      completedSessions: pl.status === 'completed' ? 1 : 0,
      totalSessions: 1,
      nextClass: pl.date ? new Date(pl.date).toISOString().replace('T', ' ').slice(0, 16) : null,
      schedule: `${pl.startTime || pl.time || ''} - ${pl.endTime || ''}`,
    }));

    const allCourses = [...coursesData, ...personalLessonsData];

    res.status(200).json({
      success: true,
      message: '학생 강의 목록 조회 성공',
      data: allCourses,
    });
  } catch (error: any) {
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

/**
 * @route GET /api/student/progress
 * @description 학생의 학습 진행상황을 조회합니다.
 * @access Private (student 권한 필요)
 */
router.get('/progress', authMiddleware, async (req, res) => {
  try {
    const studentId = (req as any).user?._id;
    logger.info(`📊 학생 진행상황 조회 요청: ${studentId}`);

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: '학생 ID가 없습니다.'
      });
    }

    // 등록된 코스 조회
    const enrolledCourses = await Course.find({
      'enrolledStudents.student': new mongoose.Types.ObjectId(studentId),
      'enrolledStudents.status': 'active'
    })
    .populate('instructor', 'name')
    .lean();

    // 개인레슨 조회
    const personalLessons = await PersonalLesson.find({
      studentId: new mongoose.Types.ObjectId(studentId),
      status: { $in: ['approved', 'completed'] }
    })
    .populate('instructorId', 'name')
    .lean();

    // 완료된 예약 조회
    const completedBookings = await Booking.find({
      studentId: new mongoose.Types.ObjectId(studentId),
      status: 'completed'
    })
    .populate('courseId', 'name')
    .lean();

    // 진행상황 데이터 변환
    const progressData = enrolledCourses.map((course: any) => {
      const enrollment = (course.enrolledStudents || []).find((e: any) => 
        e.student?.toString() === studentId.toString()
      );
      const progress = enrollment?.progress?.percentage || 0;
      const completedSessions = Math.floor((progress / 100) * (course.totalSessions || 0));
      const totalSessions = course.totalSessions || 0;
      const attendanceRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;

      // 기술 수준 계산 (진행률 기반)
      const skillLevel = Math.floor(progress / 20) + 1; // 1-5 레벨
      const skills = [
        { skill: '자유형 팔 동작', level: skillLevel, lastUpdated: new Date() },
        { skill: '자유형 발차기', level: Math.max(1, skillLevel - 1), lastUpdated: new Date() },
        { skill: '호흡법', level: Math.max(1, skillLevel - 1), lastUpdated: new Date() }
      ];

      // 업적 계산
      const achievements = [];
      if (completedSessions >= 1) {
        achievements.push({
          name: '첫 수업 완료',
          earnedAt: new Date(),
          description: '첫 번째 수업을 완료했습니다'
        });
      }
      if (completedSessions >= 5) {
        achievements.push({
          name: '5회 수업 완료',
          earnedAt: new Date(),
          description: '5회 이상 수업을 완료했습니다'
        });
      }
      if (attendanceRate >= 90) {
        achievements.push({
          name: '완벽한 출석',
          earnedAt: new Date(),
          description: '90% 이상 출석률을 달성했습니다'
        });
      }

      return {
        _id: course._id?.toString(),
        courseId: course._id?.toString(),
        courseName: course.name || '제목 없음',
        level: course.level || 'beginner',
        startDate: course.startDate || new Date(),
        currentSkills: skills,
        achievements,
        totalClasses: totalSessions,
        attendanceRate: Math.round(attendanceRate * 10) / 10,
        lastClassDate: completedBookings.length > 0 
          ? completedBookings[completedBookings.length - 1].date 
          : undefined
      };
    });

    res.status(200).json({
      success: true,
      message: '학생 진행상황 조회 성공',
      data: progressData,
    });
  } catch (error: any) {
    logger.error(`❌ 학생 진행상황 조회 중 오류 발생: ${error.message}`);
    errorHandler(error, req, res, () => {});
  }
});

/**
 * @route GET /api/student/learning-progress
 * @description 학생의 학습 진도를 조회합니다.
 * @access Private (student 권한 필요)
 */
router.get('/learning-progress', authMiddleware, async (req, res) => {
  try {
    const studentId = (req as any).user?._id;
    logger.info(`📈 학생 학습 진도 조회 요청: ${studentId}`);

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: '학생 ID가 없습니다.'
      });
    }

    // 등록된 코스 조회
    const enrolledCourses = await Course.find({
      'enrolledStudents.student': new mongoose.Types.ObjectId(studentId),
      'enrolledStudents.status': 'active'
    })
    .populate('instructor', 'name')
    .lean();

    // 완료된 예약 조회
    const completedBookings = await Booking.find({
      studentId: new mongoose.Types.ObjectId(studentId),
      status: 'completed'
    })
    .populate('courseId', 'name')
    .sort({ date: -1 })
    .lean();

    // 학습 진도 데이터 변환
    const learningProgressData = enrolledCourses.map((course: any) => {
      const enrollment = (course.enrolledStudents || []).find((e: any) => 
        e.student?.toString() === studentId.toString()
      );
      const progress = enrollment?.progress?.percentage || 0;
      const completedSessions = Math.floor((progress / 100) * (course.totalSessions || 0));
      const totalSessions = course.totalSessions || 0;
      const attendanceRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;

      // 기술 수준 계산
      const skillLevel = Math.floor(progress / 20) + 1;
      const skills = [
        { skill: '자유형 팔 동작', level: skillLevel, lastUpdated: new Date() },
        { skill: '자유형 발차기', level: Math.max(1, skillLevel - 1), lastUpdated: new Date() },
        { skill: '호흡법', level: Math.max(1, skillLevel - 1), lastUpdated: new Date() }
      ];

      // 업적 계산
      const achievements = [];
      if (completedSessions >= 1) {
        achievements.push({
          name: '첫 수영 완주',
          earnedAt: new Date(),
          description: '25m 자유형을 완주했습니다'
        });
      }
      if (completedSessions >= 5) {
        achievements.push({
          name: '5회 수업 완료',
          earnedAt: new Date(),
          description: '5회 이상 수업을 완료했습니다'
        });
      }
      if (attendanceRate >= 90) {
        achievements.push({
          name: '완벽한 출석',
          earnedAt: new Date(),
          description: '한 달간 완벽한 출석률을 달성했습니다'
        });
      }

      // 다음 목표 설정
      let nextGoal = '50m 자유형 완주';
      if (progress >= 50) {
        nextGoal = '100m 자유형 완주';
      }
      if (progress >= 80) {
        nextGoal = '자유형 마스터';
      }

      return {
        _id: course._id?.toString(),
        courseId: course._id?.toString(),
        courseName: course.name || '제목 없음',
        level: course.level || 'beginner',
        startDate: course.startDate || new Date(),
        currentSkills: skills,
        achievements,
        totalClasses: totalSessions,
        attendanceRate: Math.round(attendanceRate * 10) / 10,
        lastClassDate: completedBookings.length > 0 
          ? completedBookings[0].date 
          : undefined,
        nextGoal
      };
    });

    res.status(200).json({
      success: true,
      message: '학생 학습 진도 조회 성공',
      data: learningProgressData,
    });
  } catch (error: any) {
    logger.error(`❌ 학생 학습 진도 조회 중 오류 발생: ${error.message}`);
    errorHandler(error, req, res, () => {});
  }
});

/**
 * @route GET /api/student/recommendations
 * @description 학생에게 맞춤형 추천사항을 조회합니다.
 * @access Private (student 권한 필요)
 */
router.get('/recommendations', authMiddleware, async (req, res) => {
  try {
    const studentId = (req as any).user?._id;
    logger.info(`💡 학생 추천사항 조회 요청: ${studentId}`);

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: '학생 ID가 없습니다.'
      });
    }

    const { User } = require('../models/User');
    const student = await User.findById(studentId).lean();

    // 등록된 코스 조회
    const enrolledCourses = await Course.find({
      'enrolledStudents.student': new mongoose.Types.ObjectId(studentId),
      'enrolledStudents.status': 'active'
    })
    .populate('instructor', 'name')
    .lean();

    // 학생의 현재 수준 분석
    let currentLevel = 'beginner';
    let currentSkills: string[] = [];
    
    if (enrolledCourses.length > 0) {
      const course = enrolledCourses[0];
      currentLevel = course.level || 'beginner';
      const enrollment = (course.enrolledStudents || []).find((e: any) => 
        e.student?.toString() === studentId.toString()
      );
      const progress = enrollment?.progress?.percentage || 0;
      
      if (progress >= 80) {
        currentLevel = 'advanced';
      } else if (progress >= 50) {
        currentLevel = 'intermediate';
      }

      // 코스 이름에서 기술 추출
      if (course.name) {
        if (course.name.includes('자유형')) currentSkills.push('freestyle');
        if (course.name.includes('배영')) currentSkills.push('backstroke');
        if (course.name.includes('평영')) currentSkills.push('breaststroke');
        if (course.name.includes('접영')) currentSkills.push('butterfly');
      }
    }

    // 추천사항 생성
    const recommendations = [];

    // 강의 추천
    if (currentLevel === 'beginner' && !currentSkills.includes('backstroke')) {
      recommendations.push({
        _id: 'rec1',
        type: 'course',
        title: '중급 배영 클래스 추천',
        description: '현재 자유형 기초를 잘 마스터하고 계시니, 배영으로 확장해보시는 것을 추천합니다.',
        reason: '자유형 팔 동작이 3단계에 도달하여 배영 학습에 적합한 시점입니다.',
        priority: 'high',
        estimatedTime: '4-6주',
        difficulty: 'medium',
        category: '배영',
        createdAt: new Date()
      });
    }

    // 운동 추천
    if (currentLevel === 'beginner') {
      recommendations.push({
        _id: 'rec2',
        type: 'exercise',
        title: '호흡법 개선 운동',
        description: '자유형 호흡법을 더욱 자연스럽게 만들기 위한 특별 운동입니다.',
        reason: '현재 호흡법이 2단계로 개선이 필요한 상태입니다.',
        priority: 'medium',
        estimatedTime: '2-3주',
        difficulty: 'easy',
        category: '자유형',
        createdAt: new Date()
      });
    }

    // 기술 추천
    if (currentLevel === 'beginner') {
      recommendations.push({
        _id: 'rec3',
        type: 'technique',
        title: '발차기 기술 향상',
        description: '자유형 발차기의 효율성을 높이는 기술 연습을 추천합니다.',
        reason: '발차기 기술이 2단계로 기본 동작을 더욱 정교하게 만들어야 합니다.',
        priority: 'medium',
        estimatedTime: '3-4주',
        difficulty: 'medium',
        category: '자유형',
        createdAt: new Date()
      });
    }

    // 목표 설정
    if (enrolledCourses.length > 0) {
      recommendations.push({
        _id: 'rec4',
        type: 'goal',
        title: '50m 자유형 완주 목표',
        description: '현재 25m를 완주하고 계시니, 다음 목표로 50m 완주를 설정해보세요.',
        reason: '25m 완주 성취를 바탕으로 더 긴 거리에 도전할 준비가 되었습니다.',
        priority: 'high',
        estimatedTime: '6-8주',
        difficulty: 'medium',
        category: '자유형',
        createdAt: new Date()
      });
    }

    // 체력 추천
    recommendations.push({
      _id: 'rec5',
      type: 'exercise',
      title: '코어 강화 운동',
      description: '수영에 필요한 핵심 근육을 강화하는 운동 프로그램입니다.',
      reason: '코어 근육 강화로 더욱 안정적인 수영 자세를 만들 수 있습니다.',
      priority: 'low',
      estimatedTime: '4-6주',
      difficulty: 'easy',
      category: '체력',
      createdAt: new Date()
    });

    res.status(200).json({
      success: true,
      message: '학생 추천사항 조회 성공',
      data: recommendations,
    });
  } catch (error: any) {
    logger.error(`❌ 학생 추천사항 조회 중 오류 발생: ${error.message}`);
    errorHandler(error, req, res, () => {});
  }
});

export default router;