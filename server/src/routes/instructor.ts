/**
 * 🏊‍♂️ JJ Swim Lab - 강사 API 라우터
 * 
 * 📋 **라우터 목적**
 * - 강사 관련 API 엔드포인트 제공
 * - 강사 대시보드 데이터 조회
 * - 강사 강의 관리 기능
 * 
 * 🔄 **주요 기능**
 * - 강사 대시보드 통계 조회
 * - 강사 강의 목록 조회
 * - 강사 예약 관리
 * 
 * 📅 **개발 히스토리**
 * - 2025-09-13: 강사 API 라우터 생성
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
import { User } from '../models/User';
import { Course } from '../models/Course';
import { Booking } from '../models/Booking';
import mongoose from 'mongoose';

const router = express.Router();

/**
 * @route GET /api/instructor/dashboard
 * @description 강사 대시보드 데이터를 조회합니다.
 * @access Private (instructor 권한 필요)
 */
router.get('/dashboard', authMiddleware, requirePermission('canManageCourses'), async (req, res) => {
  try {
    const instructorId = (req as any).user?._id;
    logger.info(`🏊‍♂️ 강사 대시보드 조회 요청: ${instructorId}`);

    if (!instructorId) {
      return res.status(400).json({
        success: false,
        message: '강사 ID가 없습니다.'
      });
    }

    // 실제 DB에서 강사 정보 조회
    const instructor = await User.findById(instructorId).lean();
    if (!instructor) {
      return res.status(404).json({
        success: false,
        message: '강사를 찾을 수 없습니다.'
      });
    }

    const instructorInfo = (instructor as any).instructorInfo || {};
    const centerId = instructor.centerId || instructorInfo.assignedCenters?.[0];

    // 강사가 담당하는 과정 목록 조회
    const courses = await Course.find({
      $or: [
        { instructorId: new mongoose.Types.ObjectId(instructorId) },
        { instructor: new mongoose.Types.ObjectId(instructorId) }
      ],
      ...(centerId ? { centerId: new mongoose.Types.ObjectId(centerId) } : {})
    })
    .populate('enrolledStudents.student', 'name email')
    .lean();

    const activeCourses = courses.filter(c => c.status === 'active' || !c.status);
    
    // 총 학생 수 계산 (중복 제거)
    const allStudentIds = new Set<string>();
    courses.forEach(course => {
      if (course.enrolledStudents) {
        course.enrolledStudents.forEach((enrollment: any) => {
          const studentId = enrollment.student?._id?.toString() || enrollment.student?.toString() || enrollment.studentId?.toString();
          if (studentId) {
            allStudentIds.add(studentId);
          }
        });
      }
      if (course.students) {
        course.students.forEach((studentId: any) => {
          const id = studentId?._id?.toString() || studentId?.toString();
          if (id) {
            allStudentIds.add(id);
          }
        });
      }
    });

    // 오늘의 예약 조회
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayBookings = await Booking.find({
      instructorId: new mongoose.Types.ObjectId(instructorId),
      date: {
        $gte: today,
        $lt: tomorrow
      }
    })
    .populate('studentId', 'name email')
    .populate('courseId', 'name')
    .lean()
    .sort({ startTime: 1 });

    // 실제 DB 데이터 반환
    const dashboardData = {
      stats: {
        totalStudents: allStudentIds.size || instructorInfo.currentStudents || 0,
        activeCourses: activeCourses.length || 0,
        todayBookings: todayBookings.length || 0,
        averageRating: instructorInfo.rating || 0,
        totalHours: instructorInfo.totalClasses ? instructorInfo.totalClasses * 1 : 0, // 가정: 수업당 1시간
        monthlyRevenue: instructorInfo.salaryInfo?.amount ? (instructorInfo.salaryInfo.amount / 4) : 0, // 월급을 4주로 나눈 값
      },
      upcomingBookings: todayBookings.slice(0, 10).map((booking: any) => ({
        id: booking._id?.toString() || booking.id,
        studentName: booking.studentId?.name || '학생 이름 없음',
        courseName: booking.courseId?.name || booking.courseName || '수업 이름 없음',
        time: booking.startTime || booking.time || '',
        status: booking.status || 'pending',
      })),
    };

    res.status(200).json({
      success: true,
      message: '강사 대시보드 조회 성공',
      data: dashboardData,
    });
  } catch (error: any) {
    logger.error(`❌ 강사 대시보드 조회 중 오류 발생: ${error.message}`);
    errorHandler(error, req, res, () => {});
  }
});

/**
 * @route GET /api/instructor/courses
 * @description 강사의 강의 목록을 조회합니다.
 * @access Private (instructor 권한 필요)
 */
router.get('/courses', authMiddleware, requirePermission('canManageCourses'), async (req, res) => {
  try {
    const instructorId = (req as any).user?._id;
    logger.info(`📚 강사 강의 목록 조회 요청: ${instructorId}`);

    if (!instructorId) {
      return res.status(400).json({
        success: false,
        message: '강사 ID가 없습니다.'
      });
    }

    // 실제 DB에서 강사가 담당하는 과정 조회
    const instructor = await User.findById(instructorId).lean();
    const centerId = instructor?.centerId || instructor?.instructorInfo?.assignedCenters?.[0];

    const dbCourses = await Course.find({
      $or: [
        { instructorId: new mongoose.Types.ObjectId(instructorId) },
        { instructor: new mongoose.Types.ObjectId(instructorId) }
      ],
      ...(centerId ? { centerId: new mongoose.Types.ObjectId(centerId) } : {})
    })
    .populate('enrolledStudents.student', 'name email')
    .lean()
    .sort({ createdAt: -1 });

    // 데이터 변환
    const courses = dbCourses.map((course: any) => {
      const enrolledStudents = course.enrolledStudents || [];
      const students = course.students || [];
      const currentStudents = enrolledStudents.length || students.length || 0;

      // ⭐ 실제 수강생 정보 변환
      const enrolledStudentsData = enrolledStudents.map((enrollment: any) => ({
        studentId: enrollment.student?._id?.toString() || enrollment.student?.toString() || '',
        studentName: enrollment.student?.name || '이름 없음',
        status: enrollment.status || 'active',
        enrolledAt: enrollment.enrolledAt || null,
        completedAt: enrollment.completedAt || null
      }));

      // ⭐ courseType 결정: isPersonalLesson이면 'personal', category가 '자유수영'이면 'freeSwim', 그 외는 'group'
      let courseType: 'group' | 'personal' | 'freeSwim' = 'group';
      if (course.isPersonalLesson) {
        courseType = 'personal';
      } else if (course.category === '자유수영' || course.category === 'freeSwim' || course.courseType === 'freeSwim') {
        courseType = 'freeSwim';
      } else if (course.courseType) {
        courseType = course.courseType;
      }

      return {
        id: course._id?.toString() || course.id,
        name: course.name || course.title || '수업 이름 없음',
        description: course.description || '',
        level: course.level || 'beginner',
        category: course.category || course.tags?.[0] || '자유형',
        duration: course.duration || 60,
        price: course.price || 0,
        currentStudents,
        maxStudents: course.maxStudents || course.maxEnrollment || 10,
        startDate: course.startDate ? new Date(course.startDate).toISOString().split('T')[0] : '',
        endDate: course.endDate ? new Date(course.endDate).toISOString().split('T')[0] : '',
        status: course.status || 'active',
        totalSessions: course.totalSessions || course.sessions?.length || 0,
        completedSessions: course.completedSessions || 0,
        progress: course.totalSessions ? Math.round((course.completedSessions || 0) / course.totalSessions * 100) : 0,
        location: course.location || course.poolType || '위치 미지정',
        schedule: course.schedule || [], // ⭐ schedule 정보 추가
        tags: course.tags || [], // ⭐ tags 정보 추가 (DB에서 가져온 실제 태그)
        rating: course.rating || 0,
        enrolledStudents: enrolledStudentsData, // ⭐ 실제 수강생 정보 추가
        isPersonalLesson: course.isPersonalLesson || false, // ⭐ 개인레슨 여부 추가
        courseType: courseType, // ⭐ 강의 타입 추가 (group, personal, freeSwim)
        createdAt: course.createdAt,
        updatedAt: course.updatedAt,
      };
    });

    res.status(200).json({
      success: true,
      message: '강사 강의 목록 조회 성공',
      data: courses,
    });
  } catch (error: any) {
    logger.error(`❌ 강사 강의 목록 조회 중 오류 발생: ${error.message}`);
    errorHandler(error, req, res, () => {});
  }
});

export default router;