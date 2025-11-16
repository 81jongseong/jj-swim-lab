/**
 * 📚 JJ Swim Lab - 코스 관리 API 라우트
 * 
 * 📋 **라우트 목적**
 * - 수영 강습 과정(코스) 관리 및 CRUD 작업을 위한 API 엔드포인트 제공
 * - 코스 생성, 수정, 삭제, 조회 기능
 * - 강사별 코스 관리 및 센터별 코스 그룹 관리
 * - 코스 등록 및 수강생 관리 기능
 * - 코스 통계 및 분석 데이터 제공
 * 
 * 🔄 **주요 기능**
 * - 전체 코스 조회 및 검색 (공개 코스)
 * - 강사별 코스 관리 (강사 전용)
 * - 코스 생성, 수정, 삭제 (권한별 제한)
 * - 코스 등록 및 수강생 관리
 * - 코스 통계 및 분석
 * - 코스 검색 및 필터링 (레벨별, 센터별)
 * - 코스 상태 관리 (활성/비활성)
 * 
 * 🗄️ **데이터 연동**
 * - Course 모델과 연동 (코스 정보 관리)
 * - User 모델과 연동 (강사, 수강생 정보)
 * - 센터 정보와 연동 (센터별 코스 그룹)
 * - 예약 시스템과 연동 (코스 예약 관리)
 * - 결제 시스템과 연동 (코스 결제 관리)
 * - MongoDB Atlas 데이터베이스
 * 
 * 🛠️ **필요한 설치 파일**
 * - Express.js Router
 * - Mongoose (MongoDB ODM)
 * - Course 모델 (../models/Course)
 * - User 모델 (../models/User)
 * - 인증 미들웨어 (../middleware/auth)
 * - MongoDB Atlas (데이터 저장)
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 강사 권한 검증 필수 (강사만 코스 생성/수정 가능)
 * 2. 센터별 코스 그룹 관리
 * 3. 코스 등록 시 수강생 수 제한 고려
 * 4. 코스 데이터 검증 및 sanitization
 * 5. 코스 상태 변경 시 예약 시스템 연동
 * 6. API 보안 및 Rate Limiting 적용
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] 강사 권한 검증 로직 확인
 * - [ ] 코스 데이터 검증 및 sanitization 확인
 * - [ ] 센터별 코스 그룹 관리 확인
 * - [ ] API 엔드포인트 보안 검증
 * - [ ] 에러 처리 및 사용자 피드백 확인
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 코스 관리 API 구현
 * - 2024-12-19: 강사별 코스 관리 시스템 구현
 * - 2024-12-19: 코스 검색 및 필터링 기능 구현
 * - 2024-12-19: 코스 등록 및 수강생 관리 시스템 구현
 * - 2024-12-19: 코스 통계 및 분석 기능 구현
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (코스 관리 API 완료)
 * 
 * 🚀 **다음 단계**
 * - 코스별 상세 통계 및 분석
 * - 코스 추천 시스템
 * - 코스별 리뷰 및 평점 시스템
 * - 코스 일정 관리 시스템
 * - 코스별 성과 분석 및 피드백
 * 
 * 💡 **사용 예시**
 * ```typescript
 * // 전체 코스 조회
 * GET /api/courses?page=1&limit=20&level=beginner
 * 
 * // 강사별 코스 조회
 * GET /api/courses/instructor/:instructorId
 * 
 * // 코스 생성 (강사만)
 * POST /api/courses
 * {
 *   "title": "초급 자유형",
 *   "description": "자유형 기초 강습",
 *   "level": "beginner",
 *   "maxStudents": 10,
 *   "duration": 60
 * }
 * 
 * // 코스 수정
 * PUT /api/courses/:id
 * {
 *   "title": "초급 자유형 (수정)",
 *   "maxStudents": 12
 * }
 * 
 * // 코스 등록
 * POST /api/courses/:id/register
 * {
 *   "studentId": "student001"
 * }
 * ```
 * 
 * 🔍 **코스 관리 처리 흐름**
 * 1. 사용자 권한 및 역할 검증 (강사/관리자)
 * 2. 코스 데이터 검증 및 sanitization
 * 3. 센터별 코스 그룹 확인
 * 4. 데이터베이스 쿼리 실행
 * 5. 코스 데이터 반환 및 응답
 * 6. 코스 상태 업데이트 및 로깅
 * 7. 코스 통계 및 분석 데이터 제공
 */

import { Router, Request, Response } from 'express';
import { Course } from '../models/Course';
import { User } from '../models/User';
import { Center } from '../models/Center'; // ⭐ Center 모델 추가
import { Payment } from '../models/Payment';
import { Booking } from '../models/Booking';
import mongoose from 'mongoose';
import { authMiddleware, requireRole } from '../middleware/auth';
import { requireInstructorOrAdmin } from '../middleware/role';

// Request 타입 확장
interface AuthRequest extends Request {
  user?: any;
}

const router: Router = Router();

import { auth as authenticateToken } from '../middleware/auth';

// 공개용 센터 강습 과정 조회
router.get('/public/center/:centerId', async (req: Request, res: Response) => {
  try {
    const { centerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(centerId)) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 센터 ID입니다.'
      });
    }

    const courses = await Course.find({
      centerId,
      status: { $ne: 'inactive' }
    })
      .select('name description level duration price maxStudents classInfo currentStudents instructorName schedule status')
      .sort({ 'classInfo.startDate': 1 });

    const normalized = courses.map(course => ({
      _id: course._id,
      name: course.name,
      description: course.description,
      level: course.level,
      duration: course.duration,
      price: course.price,
      maxStudents: course.maxStudents,
      currentStudents: course.classInfo?.currentEnrollment ?? course.currentStudents ?? 0,
      instructorName: course.instructorName || undefined,
      schedule: (course.schedule || []).map((item: any) => ({
        day: item.day || item.dayOfWeek || '',
        startTime: item.startTime,
        endTime: item.endTime
      })),
      status: course.status
    }));

    return res.json({
      success: true,
      message: '강습 과정 조회 성공!',
      data: normalized
    });
  } catch (error) {
    console.error('공개 강습 과정 조회 오류:', error);
    return res.status(500).json({
      success: false,
      message: '강습 정보를 조회할 수 없습니다.'
    });
  }
});

// 공개용 단일 강습 과정 조회
router.get('/public/:courseId', async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 강습 ID입니다.'
      });
    }

    const course = await Course.findById(courseId)
      .populate('instructor', 'name email phone')
      .lean<any>();

    if (!course || course.status === 'inactive' || course.isActive === false) {
      return res.status(404).json({
        success: false,
        message: '강습 정보를 찾을 수 없습니다.'
      });
    }

    const center = await Center.findById(course.centerId).lean<any>();

    const activeEnrollment = (course.enrolledStudents || []).filter((enrollment: any) => enrollment.status !== 'dropped').length;
    const currentEnrollment = course.classInfo?.currentEnrollment ?? activeEnrollment;

    const normalized = {
      _id: course._id,
      name: course.name,
      description: course.description,
      level: course.level,
      duration: course.duration,
      price: course.price,
      maxStudents: course.maxStudents,
      currentStudents: currentEnrollment,
      status: course.status,
      schedule: (course.schedule || []).map((item: any) => ({
        day: item.day || item.dayOfWeek || '',
        startTime: item.startTime,
        endTime: item.endTime
      })),
      instructor: {
        name: (course.instructor as any)?.name || course.instructorName || '',
        email: (course.instructor as any)?.email || '',
        phone: (course.instructor as any)?.phone || ''
      },
      center: center ? {
        _id: center._id,
        name: center.name,
        address: center.address,
        phone: center.phone,
        email: center.email,
        region: center.region,
        district: center.district,
        city: center.city,
        province: center.province
      } : null,
      tags: course.tags || [],
      classInfo: course.classInfo ? {
        className: course.classInfo.className,
        classType: course.classInfo.classType,
        startDate: course.classInfo.startDate,
        endDate: course.classInfo.endDate
      } : null,
      isPersonalLesson: course.isPersonalLesson,
      courseType: course.courseType
    };

    return res.json({
      success: true,
      message: '강습 과정 조회 성공!',
      data: normalized
    });
  } catch (error) {
    console.error('공개 강습 상세 조회 오류:', error);
    return res.status(500).json({
      success: false,
      message: '강습 정보를 조회할 수 없습니다.'
    });
  }
});

// 공개 강습 수강 신청 및 결제 생성
router.post('/public/:courseId/apply', authMiddleware, requireRole(['student']), async (req: AuthRequest, res: Response) => {
  try {
    const { courseId } = req.params;
    const { paymentMethod = 'card', notes = '' } = req.body || {};
    const allowedMethods = new Set(['card', 'cash', 'transfer', 'online']);
    const normalizedMethod = allowedMethods.has(paymentMethod) ? paymentMethod : 'card';

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 강습 ID입니다.'
      });
    }

    const course = await Course.findById(courseId);

    if (!course || course.status === 'inactive' || course.isActive === false) {
      return res.status(404).json({
        success: false,
        message: '강습 정보를 찾을 수 없습니다.'
      });
    }

    // 이미 등록된 경우 방지
    const isAlreadyEnrolled = (course.enrolledStudents || []).some((enrollment: any) =>
      enrollment.student && enrollment.student.toString() === req.user.userId.toString()
    );

    if (isAlreadyEnrolled) {
      return res.status(400).json({
        success: false,
        message: '이미 해당 강습에 등록되어 있습니다.'
      });
    }

    // 기존 결제 요청 확인 (대기/완료 상태)
    const existingPayment = await Payment.findOne({
      user: req.user.userId,
      relatedCourse: course._id,
      status: { $in: ['pending', 'completed'] }
    });

    if (existingPayment) {
      return res.status(400).json({
        success: false,
        message: existingPayment.status === 'completed'
          ? '이미 결제가 완료된 강습입니다.'
          : '이미 결제가 진행 중입니다. 결제 내역을 확인해주세요.'
      });
    }

    const activeEnrollment = (course.enrolledStudents || []).filter((enrollment: any) => enrollment.status !== 'dropped').length;
    const currentEnrollment = course.classInfo?.currentEnrollment ?? activeEnrollment;

    if (currentEnrollment >= course.maxStudents || course.status === 'full') {
      return res.status(400).json({
        success: false,
        message: '이미 정원이 가득 찬 강습입니다.'
      });
    }

    const transactionId = `COURSE-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    const payment = new Payment({
      user: req.user.userId,
      amount: course.price,
      currency: 'KRW',
      pricingInfo: {
        userType: req.user.userType || 'student',
        pricingTier: 'standard',
        baseAmount: course.price,
        discountAmount: 0,
        discountReason: '',
        centerId: course.centerId,
        isCenterSponsored: false
      },
      paymentMethod: normalizedMethod,
      status: 'pending',
      purpose: 'course',
      relatedCourse: course._id,
      transactionId,
      notes: notes || '',
      centerId: course.centerId
    });

    await payment.save();

    return res.status(201).json({
      success: true,
      message: '수강 신청이 접수되었습니다. 결제 승인을 기다려주세요.',
      data: {
        paymentId: payment._id,
        status: payment.status,
        amount: payment.amount,
        paymentMethod: payment.paymentMethod,
        transactionId: payment.transactionId,
        course: {
          _id: course._id,
          name: course.name,
          price: course.price
        }
      }
    });
  } catch (error) {
    console.error('공개 강습 신청 오류:', error);
    return res.status(500).json({
      success: false,
      message: '수강 신청 처리 중 오류가 발생했습니다.'
    });
  }
});

// 학생 본인 강습 목록 조회
router.get('/student/enrolled', authMiddleware, requireRole(['student']), async (req: AuthRequest, res: Response) => {
  try {
    // 파일 연동 주석: 이 엔드포인트는 학생의 “내 강의” 리스트를 반환합니다.
    // 연동 모델: Course, Booking, Payment
    // 연동 규칙:
    //  - Course.enrolledStudents.student 에 포함된 코스
    //  - Booking(confirmed|pending|completed) 으로 학생이 예약한 코스
    //  - Payment(pending|completed) 의 relatedCourse 로 결제를 진행/완료한 코스
    // 주의: 결제만 있고 관리자가 최종 배정(enrolledStudents 반영)을 안 한 상태도 표시되도록 합니다.
    const studentId = req.user.userId;

    // 1) explicit enrollment (기존 방식)
    const explicitlyEnrolledCourseIds = await Course.find(
      { 'enrolledStudents.student': studentId },
      { _id: 1 }
    ).lean();

    // 2) bookings 기반 포함
    const bookingCourseIds = await Booking.distinct('courseId', {
      studentId,
      status: { $in: ['confirmed', 'pending', 'completed'] }
    });

    // 3) payments 기반 포함
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

    // 집합이 비어 있으면 바로 빈 배열 반환
    if (enrolledIdsSet.size === 0) {
      return res.json({ success: true, message: '등록/예약/결제된 강습이 없습니다.', data: [] });
    }

    const enrolledIds = Array.from(enrolledIdsSet);

    const courses = await Course.find({
      _id: { $in: enrolledIds }
    })
      .populate('instructor', 'name userId email phone')
      .populate('centerId', 'name address phone email region district city province')
      .sort({ 'classInfo.startDate': 1, createdAt: -1 })
      .lean<any>();

    const normalized = courses.map((course: any) => {
      const enrollment = (course.enrolledStudents || []).find((enrollmentItem: any) => {
        if (!enrollmentItem) return false;
        if (typeof enrollmentItem.student === 'string') {
          return enrollmentItem.student === String(studentId);
        }
        if (typeof enrollmentItem.student === 'object') {
          return (enrollmentItem.student?._id || enrollmentItem.student)?.toString() === String(studentId);
        }
        return false;
      });

      const instructor = course.instructor || {};
      const center = course.centerId || {};

      return {
        _id: course._id,
        name: course.name,
        description: course.description,
        level: course.level,
        duration: course.duration,
        price: course.price,
        maxStudents: course.maxStudents,
        currentStudents: course.classInfo?.currentEnrollment ?? 0,
        status: course.status,
        schedule: (course.schedule || []).map((item: any) => ({
          day: item.day || item.dayOfWeek || '',
          startTime: item.startTime,
          endTime: item.endTime
        })),
        instructor: instructor
          ? {
              _id: instructor._id,
              name: instructor.name,
              email: instructor.email,
              phone: instructor.phone
            }
          : null,
        center: center
          ? {
              _id: center._id,
              name: center.name,
              address: center.address,
              phone: center.phone,
              email: center.email,
              region: center.region,
              district: center.district,
              city: center.city,
              province: center.province
            }
          : null,
        enrollmentStatus: enrollment?.status ?? 'pending',
        enrolledAt: enrollment?.enrolledAt ?? null,
        nextClassStart: course.classInfo?.startDate ?? null,
        nextClassEnd: course.classInfo?.endDate ?? null
      };
    });

    return res.json({
      success: true,
      message: '내 강습 목록을 불러왔습니다.',
      data: normalized
    });
  } catch (error) {
    console.error('학생 강습 목록 조회 오류:', error);
    return res.status(500).json({
      success: false,
      message: '내 강습 정보를 가져오는 중 오류가 발생했습니다.'
    });
  }
});

// 모든 강습 과정 조회
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { level, instructor, isActive, centerId: centerIdQuery } = req.query as any;
    const filter: any = {};
    
    if (level) filter.level = level;
    if (instructor) filter.instructor = instructor;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    // 테넌트 가드: centerId 우선순위 = query.centerId > req.user.centerId > req.user.centerAdminInfo.managedCenters[0]
    const user = req.user;
    const resolvedCenterId = centerIdQuery || user?.centerId || user?.centerAdminInfo?.managedCenters?.[0];
    if (resolvedCenterId) filter.centerId = resolvedCenterId;

    const courses = await Course.find(filter)
      .populate('instructor', 'name userId')
      .populate('enrolledStudents.student', 'name userId')
      .sort({ createdAt: -1 });

    // 🔍 강습 과정 조회 응답 디버깅
    console.log('📚 강습 과정 조회 응답:', {
      totalCourses: courses.length,
      coursesWithLaneInfo: courses.filter(c => c.poolType || c.lanes || c.laneInfo).length,
      sampleCourse: courses[0] ? {
        name: courses[0].name,
        poolType: courses[0].poolType,
        lanes: courses[0].lanes,
        laneInfo: courses[0].laneInfo
      } : null
    });

    return res.json({ success: true, message: '강습 과정 조회 성공!', data: courses });
  } catch (error) {
    console.error('강습 과정 조회 오류:', error);
    return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 특정 강습 과정 조회
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name userId experience certifications specialties')
      .populate('enrolledStudents.student', 'name userId email phone');

    if (!course) {
      return res.status(404).json({ error: '강습 과정을 찾을 수 없습니다.' });
    }

    return res.json({ course });
  } catch (error) {
    console.error('강습 과정 조회 오류:', error);
    return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 강습 과정 생성 (강사/센터관리자/관리자만)
router.post('/', authenticateToken, requireInstructorOrAdmin, async (req: AuthRequest, res: Response) => {
  try {
    console.log('📥 강습 과정 생성 요청:', {
      body: req.body,
      userId: req.user?.userId,
      userType: req.user?.userType
    });

    const { 
      name, 
      description, 
      level, 
      duration, 
      price, 
      maxStudents, 
      schedule, 
      instructorId, 
      instructorName, 
      tags,
      poolType,
      lanes,
      laneInfo,
      courseType,
      isPersonalLesson,
      personalLessonSettings, // ⭐ 개인레슨 설정 추가
      startDate,
      endDate
    } = req.body;

    // 필수 필드 검증 (description은 선택사항)
    if (!name || !level || !duration || price === undefined || !maxStudents) {
      console.error('❌ 필수 필드 누락:', { name, level, duration, price, maxStudents });
      return res.status(400).json({ error: '필수 필드가 누락되었습니다.' });
    }

    // 사용자 정보 조회
    const user = await User.findById(req.user.userId);
    if (!user) {
      console.error('❌ 사용자를 찾을 수 없음:', req.user.userId);
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }

    console.log('👤 사용자 정보:', {
      userType: user.userType,
      managedCenters: user.centerAdminInfo?.managedCenters,
      assignedCenters: user.instructorInfo?.assignedCenters
    });

    // centerId 자동 설정
    let centerId = req.body.centerId;
    if (!centerId) {
      // 센터 관리자: managedCenters에서 첫 번째 센터 가져오기
      if (['centerAdmin', 'center-admin'].includes(user.userType) && user.centerAdminInfo?.managedCenters && user.centerAdminInfo.managedCenters.length > 0) {
        centerId = user.centerAdminInfo.managedCenters[0];
      }
      // 강사: assignedCenters에서 첫 번째 센터 가져오기
      else if (user.userType === 'instructor' && user.instructorInfo?.assignedCenters && user.instructorInfo.assignedCenters.length > 0) {
        centerId = user.instructorInfo.assignedCenters[0];
      }
      // center-admin 사용자는 centerId 필드에서 가져오기
      else if (['centerAdmin', 'center-admin'].includes(user.userType) && user.centerId) {
        centerId = user.centerId;
      }
    }

    console.log('🏢 centerId:', centerId, 'userType:', user.userType, 'hasCenterId:', !!user.centerId, 'hasManagedCenters:', !!user.centerAdminInfo?.managedCenters);

    if (!centerId) {
      console.error('❌ centerId를 찾을 수 없음 - 사용자 정보:', {
        userType: user.userType,
        centerId: user.centerId,
        managedCenters: user.centerAdminInfo?.managedCenters,
        assignedCenters: user.instructorInfo?.assignedCenters
      });
      return res.status(400).json({ error: '센터 ID가 필요합니다. 센터 관리자는 관리하는 센터가 있어야 합니다.' });
    }

    // ⭐ 시간 변환 헬퍼 함수
    function timeToMinutes(timeStr: string): number {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + (minutes || 0);
    }

    // ⭐ 개인레슨인 경우 센터 운영시간 검증
    if (isPersonalLesson && schedule && schedule.length > 0) {
      const center = await Center.findById(centerId);
      if (!center) {
        return res.status(404).json({ error: '센터 정보를 찾을 수 없습니다.' });
      }

      const personalLessonSettings = center.availabilitySettings?.personalLesson;
      if (!personalLessonSettings?.enabled) {
        return res.status(400).json({ error: '개인레슨 운영이 비활성화되어 있습니다. 센터 관리자에게 문의하세요.' });
      }

      const dayTimeSlots = personalLessonSettings.dayTimeSlots || [];
      if (dayTimeSlots.length === 0) {
        return res.status(400).json({ error: '개인레슨 운영시간이 설정되지 않았습니다. 센터 정보 관리 페이지에서 먼저 운영시간을 설정하세요.' });
      }

      // 요일 매핑
      const dayMap: { [key: string]: string } = {
        'monday': 'monday',
        'tuesday': 'tuesday',
        'wednesday': 'wednesday',
        'thursday': 'thursday',
        'friday': 'friday',
        'saturday': 'saturday',
        'sunday': 'sunday',
        '월': 'monday',
        '화': 'tuesday',
        '수': 'wednesday',
        '목': 'thursday',
        '금': 'friday',
        '토': 'saturday',
        '일': 'sunday'
      };

      // 각 스케줄 검증
      const invalidDays: string[] = []; // 운영시간이 설정되지 않은 요일들
      
      for (const scheduleItem of schedule) {
        const startTime = scheduleItem.startTime || '';
        const endTime = scheduleItem.endTime || startTime;
        
        // dayOfWeek가 쉼표로 구분된 경우 처리 (예: "월,화,수,목")
        const dayOfWeekStr = scheduleItem.day || scheduleItem.dayOfWeek || '';
        const days = dayOfWeekStr.split(',').map(d => d.trim()).filter(d => d);
        
        console.log('🔍 POST 검증할 스케줄:', {
          dayOfWeekStr,
          days,
          startTime,
          endTime
        });
        
        // 각 요일별로 검증
        for (const day of days) {
          const dayLower = day.toLowerCase();
          const englishDay = dayMap[dayLower] || dayLower;

          // 해당 요일의 운영시간 찾기
          const daySlot = dayTimeSlots.find((ds: any) => ds.day === englishDay);
          if (!daySlot || !daySlot.timeSlots || daySlot.timeSlots.length === 0) {
            // 한글 요일로 변환하여 추가
            const koreanDaysMap: { [key: string]: string } = {
              'monday': '월요일',
              'tuesday': '화요일',
              'wednesday': '수요일',
              'thursday': '목요일',
              'friday': '금요일',
              'saturday': '토요일',
              'sunday': '일요일',
              '월': '월요일',
              '화': '화요일',
              '수': '수요일',
              '목': '목요일',
              '금': '금요일',
              '토': '토요일',
              '일': '일요일'
            };
            const koreanDay = koreanDaysMap[dayLower] || `${day}요일`;
            invalidDays.push(koreanDay);
            continue; // 다음 요일로 계속 검증
          }

          // 시간이 운영시간 내에 있는지 확인
          const scheduleStartMinutes = timeToMinutes(startTime);
          const scheduleEndMinutes = timeToMinutes(endTime);
          
          let isWithinOperatingHours = false;
          for (const timeSlot of daySlot.timeSlots) {
            const slotStartMinutes = timeToMinutes(timeSlot.startTime);
            const slotEndMinutes = timeToMinutes(timeSlot.endTime);
            
            // 스케줄이 운영시간 슬롯 내에 완전히 포함되는지 확인
            if (scheduleStartMinutes >= slotStartMinutes && scheduleEndMinutes <= slotEndMinutes) {
              isWithinOperatingHours = true;
              break;
            }
          }

          if (!isWithinOperatingHours) {
            const availableTimes = daySlot.timeSlots.map((ts: any) => `${ts.startTime}~${ts.endTime}`).join(', ');
            return res.status(400).json({ 
              error: `${day}요일 ${startTime}는 개인레슨 운영시간이 아닙니다. 운영시간: ${availableTimes}` 
            });
          }
        }
      }
      
      // 운영시간이 설정되지 않은 요일이 있으면 에러 반환
      if (invalidDays.length > 0) {
        const invalidDaysStr = invalidDays.length === 1 
          ? invalidDays[0] 
          : invalidDays.slice(0, -1).join(', ') + ', ' + invalidDays[invalidDays.length - 1];
        return res.status(400).json({ 
          error: `${invalidDaysStr}은 개인레슨 운영시간이 설정되지 않았습니다. 센터 운영시간 설정을 확인하세요.` 
        });
      }
    }

    // classInfo 기본값 설정
    const classInfo = req.body.classInfo || {
      className: name, // 과정명을 클래스명으로 사용
      classType: 'regular',
      startDate: new Date(),
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 3개월 후
      maxCapacity: maxStudents,
      currentEnrollment: 0
    };

    // 강사 이름 가져오기
    let finalInstructorName = instructorName;
    if (!finalInstructorName && instructorId) {
      try {
        const instructor = await User.findById(instructorId).select('name');
        finalInstructorName = instructor?.name || '';
      } catch (error) {
        console.error('강사 이름 조회 실패:', error);
      }
    }

    // 개인레슨인 경우 personalLessonSettings 기본값 설정
    let finalPersonalLessonSettings = personalLessonSettings;
    if (isPersonalLesson && !personalLessonSettings) {
      finalPersonalLessonSettings = { timeSlots: [], lessonTypes: [], frequencyOptions: [] };
    }

    const courseData: any = {
      name,
      description,
      level,
      duration,
      price,
      maxStudents,
      centerId,
      classInfo,
      // 총관리자는 강사를 지정할 수 있게 허용
      instructor: instructorId || req.user.userId,
      instructorId: instructorId || req.user.userId, // ⭐ 강사 ID 추가
      instructorName: finalInstructorName, // ⭐ 강사 이름 추가 (가져온 이름 사용)
      schedule: schedule || [],
      tags: tags || [], // ⭐ 태그 추가
      poolType: poolType || 'mainPool', // ⭐ 풀 타입 추가
      lanes: lanes || [], // ⭐ 레인 배열 추가
      laneInfo: laneInfo || {}, // ⭐ 레인 정보 추가
      courseType: courseType || 'group', // ⭐ 과정 타입 추가
      isPersonalLesson: isPersonalLesson === true || name?.includes('개인 레슨') || name?.includes('개인레슨'), // ⭐ 개인레슨 여부 추가 (명시적 또는 이름 기반 판단)
      personalLessonSettings: finalPersonalLessonSettings, // ⭐ 개인레슨 설정 추가
      startDate: startDate || new Date(), // ⭐ 시작일 추가
      endDate: endDate || new Date(new Date().setMonth(new Date().getMonth() + 1)) // ⭐ 종료일 추가
    };
    
    console.log('🎯 isPersonalLesson 판단:', {
      isPersonalLesson,
      name,
      finalValue: courseData.isPersonalLesson
    });

    // ⭐ 스케줄별 레인 정보가 포함되어 있는지 확인하고 처리
    if (schedule && schedule.length > 0) {
      // 요일 변환 맵 (한글 → 영문)
      const dayNameMap: { [key: string]: string } = {
        '월': 'monday', '화': 'tuesday', '수': 'wednesday', '목': 'thursday',
        '금': 'friday', '토': 'saturday', '일': 'sunday',
        '월요일': 'monday', '화요일': 'tuesday', '수요일': 'wednesday', '목요일': 'thursday',
        '금요일': 'friday', '토요일': 'saturday', '일요일': 'sunday',
        'monday': 'monday', 'tuesday': 'tuesday', 'wednesday': 'wednesday', 'thursday': 'thursday',
        'friday': 'friday', 'saturday': 'saturday', 'sunday': 'sunday'
      };
      
      courseData.schedule = schedule
        .map((sched: any) => {
          // day 또는 dayOfWeek 중 하나를 사용, 한글이면 영문으로 변환
          const day = sched.day || sched.dayOfWeek || '';
          
          // 쉼표로 구분된 요일 처리 (예: "월,수,금" 또는 "monday,wednesday,friday")
          const dayArray = day.split(',').map((d: string) => d.trim()).filter((d: string) => d);
          const englishDay = dayArray.map((d: string) => dayNameMap[d.toLowerCase()] || d).join(',');
          
          // 스케줄에 lanes 정보가 이미 포함되어 있으면 사용, 아니면 생성
          const scheduleItem = {
            ...sched,
            day: englishDay, // 영문 요일로 통일
            lanes: sched.lanes && sched.lanes.assignedLanes ? sched.lanes : {
              assignedLanes: sched.lanes?.assignedLanes || lanes || [],
              originalAssignedLanes: sched.lanes?.originalAssignedLanes || lanes || [],
              isAdjusted: sched.lanes?.isAdjusted || false
            }
          };
          
          console.log(`📅 스케줄 변환: ${day} → ${englishDay}`);
          
          return scheduleItem;
        })
        .filter((sched: any) => {
          // day가 빈 문자열이거나 undefined인 스케줄 제외
          const hasValidDay = sched.day && sched.day.trim() !== '';
          if (!hasValidDay) {
            console.log(`⚠️ 유효하지 않은 스케줄 제외: day=${sched.day}, startTime=${sched.startTime}`);
          }
          return hasValidDay;
        });
      
      console.log(`📊 최종 schedule 항목 수: ${courseData.schedule.length}`);
    }
    
    console.log('📚 강습 과정 생성 데이터:', courseData);
    console.log('💾 저장할 데이터:', courseData);
    console.log('🏷️ 태그:', tags);

    const course = new Course(courseData);
    await course.save();

    console.log('✅ 저장 성공:', course._id);

    // ⭐ 레인 자동 조정 로직은 클라이언트에서 처리하도록 변경
    // DB에는 단체반의 원래 레인만 저장하고, UI에서 개인레슨 레인을 기준으로 계산

    const populatedCourse = await Course.findById(course._id)
      .populate('instructor', 'name userId');

    console.log('📋 생성된 강습 과정 정보:', {
      id: populatedCourse?._id,
      name: populatedCourse?.name,
      instructor: populatedCourse?.instructor,
      instructorId: populatedCourse?.instructorId,
      instructorName: populatedCourse?.instructorName
    });

    return res.status(201).json({
      success: true,
      message: '강습 과정이 생성되었습니다.',
      data: populatedCourse
    });
  } catch (error) {
    console.error('💥 강습 과정 생성 오류:', error);
    if (error instanceof Error) {
      console.error('💥 에러 메시지:', error.message);
      console.error('💥 에러 스택:', error.stack);
    }
    return res.status(500).json({ 
      error: '서버 오류가 발생했습니다.',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// 강습 과정 수정 (강사/관리자만)
router.put('/:id', authenticateToken, requireInstructorOrAdmin, async (req: AuthRequest, res: Response) => {
  try {
    console.log('📝 강습 과정 수정 요청 시작');
    console.log('📋 courseId:', req.params.id);
    console.log('🏊 body.lanes:', req.body.lanes);
    console.log('🏊 body.poolType:', req.body.poolType);
    console.log('🏊 body.laneInfo:', req.body.laneInfo);
    console.log('🏊 body.personalLessonSettings:', req.body.personalLessonSettings);
    console.log('📦 전체 body:', req.body);

    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ error: '강습 과정을 찾을 수 없습니다.' });
    }
    
    console.log('🔍 기존 코스 정보:', {
      isPersonalLesson: course.isPersonalLesson,
      name: course.name,
      schedule: course.schedule
    });

    // 강사 본인의 과정만 수정 가능 (센터관리자/슈퍼관리자는 모든 과정 수정 가능)
    const user = await User.findById(req.user.userId);
    const isSuperAdmin = user?.userType === 'superAdmin';
    const isCenterAdmin = user?.userType === 'centerAdmin' || user?.userType === 'center-admin';
    const isOwnCourse = course.instructor ? course.instructor.toString() === String(req.user.userId) : false;
    
    console.log('🔐 권한 확인:', {
      userType: user?.userType,
      isSuperAdmin,
      isCenterAdmin,
      isOwnCourse,
      courseInstructor: course.instructor ? course.instructor.toString() : 'undefined',
      currentUser: req.user.userId
    });
    
    if (!isSuperAdmin && !isCenterAdmin && !isOwnCourse) {
      console.error('❌ 권한 없음:', { userType: user?.userType, userId: req.user.userId });
      return res.status(403).json({ error: '수정 권한이 없습니다.' });
    }
    
    console.log('✅ 권한 확인 통과');

    // 기본적인 데이터 검증
    const { name, description, level, duration, price, maxStudents, instructorId } = req.body;
    void instructorId;
    if (name && typeof name !== 'string') {
      return res.status(400).json({ error: '강습 과정명은 문자열이어야 합니다.' });
    }
    if (description && typeof description !== 'string') {
      return res.status(400).json({ error: '강습 과정 설명은 문자열이어야 합니다.' });
    }
    // ⭐ 커스텀 레벨 허용 (level2, level3 등)
    if (level && typeof level !== 'string') {
      return res.status(400).json({ error: '레벨은 문자열이어야 합니다.' });
    }
    if (duration && (typeof duration !== 'number' || duration <= 0)) {
      return res.status(400).json({ error: '강습 시간은 양수여야 합니다.' });
    }
    if (price && (typeof price !== 'number' || price < 0)) {
      return res.status(400).json({ error: '가격은 0 이상이어야 합니다.' });
    }
    if (maxStudents && (typeof maxStudents !== 'number' || maxStudents <= 0)) {
      return res.status(400).json({ error: '최대 수강생 수는 양수여야 합니다.' });
    }

    // instructorId → instructor 필드명 변환 및 강사 이름 업데이트
    const updateData: any = { ...req.body };
    if (updateData.instructorId) {
      updateData.instructor = updateData.instructorId;
      
      // 강사 이름 가져오기
      let instructorName = updateData.instructorName;
      if (!instructorName) {
        try {
          const instructor = await User.findById(updateData.instructorId).select('name');
          instructorName = instructor?.name || '';
          updateData.instructorName = instructorName;
        } catch (error) {
          console.error('강사 이름 조회 실패:', error);
        }
      }
      
      console.log('👨‍🏫 강사 정보 업데이트:', {
        원본: req.body.instructorId,
        instructorId: updateData.instructorId,
        instructor: updateData.instructor,
        instructorName: updateData.instructorName
      });
    }
    
    // tags가 undefined일 경우 빈 배열로 처리
    if (!updateData.tags) {
      updateData.tags = [];
    }
    console.log('🏷️ 태그 처리:', updateData.tags);

    // lanes가 undefined일 경우 빈 배열로 처리
    if (!updateData.lanes) {
      updateData.lanes = [];
    }
    console.log('🏊 레인 처리:', updateData.lanes);

    // laneInfo가 undefined일 경우 기본값으로 처리
    if (!updateData.laneInfo) {
      updateData.laneInfo = {
        assignedLanes: [],
        maxLanes: 0,
        minLanes: 0
      };
    }
    console.log('🏊 레인 정보 처리:', updateData.laneInfo);

    // ⭐ 개인레슨 여부 판단 (검증 전에 설정)
    // 개인레슨 판단 기준:
    // 1. updateData에 isPersonalLesson이 true인 경우
    // 2. updateData에 personalLessonSettings가 있는 경우
    // 3. 기존 코스의 isPersonalLesson이 true인 경우
    // 4. 코스 이름이 "개인 레슨" 또는 "개인레슨"인 경우 (추가)
    const isPersonalLessonFromUpdateData = updateData.isPersonalLesson === true;
    const hasPersonalLessonSettings = !!updateData.personalLessonSettings;
    const isPersonalLessonFromCourse = course.isPersonalLesson === true;
    const isPersonalLessonByName = course.name && (course.name.includes('개인 레슨') || course.name.includes('개인레슨'));
    
    if (isPersonalLessonFromUpdateData || hasPersonalLessonSettings || isPersonalLessonFromCourse || isPersonalLessonByName) {
      updateData.isPersonalLesson = true;
      console.log('⏰ 개인레슨 설정 업데이트:', {
        fromUpdateData: isPersonalLessonFromUpdateData,
        fromSettings: hasPersonalLessonSettings,
        fromCourse: isPersonalLessonFromCourse,
        fromName: isPersonalLessonByName,
        isPersonalLesson: updateData.isPersonalLesson,
        schedule: JSON.stringify(updateData.schedule)
      });
    }

    // ⭐ 개인레슨인 경우 센터 운영시간 검증 (수정 시에도)
    console.log('🔍 검증 체크:', {
      isPersonalLesson: updateData.isPersonalLesson,
      hasSchedule: !!updateData.schedule,
      scheduleLength: updateData.schedule?.length
    });
    
    if (updateData.isPersonalLesson && updateData.schedule && updateData.schedule.length > 0) {
      console.log('🔍 개인레슨 운영시간 검증 시작');
      const center = await Center.findById(course.centerId);
      if (!center) {
        return res.status(404).json({ error: '센터 정보를 찾을 수 없습니다.' });
      }

      const personalLessonSettings = center.availabilitySettings?.personalLesson;
      if (!personalLessonSettings?.enabled) {
        return res.status(400).json({ error: '개인레슨 운영이 비활성화되어 있습니다. 센터 관리자에게 문의하세요.' });
      }

      const dayTimeSlots = personalLessonSettings.dayTimeSlots || [];
      if (dayTimeSlots.length === 0) {
        return res.status(400).json({ error: '개인레슨 운영시간이 설정되지 않았습니다. 센터 정보 관리 페이지에서 먼저 운영시간을 설정하세요.' });
      }

      // 요일 매핑
      const dayMap: { [key: string]: string } = {
        'monday': 'monday',
        'tuesday': 'tuesday',
        'wednesday': 'wednesday',
        'thursday': 'thursday',
        'friday': 'friday',
        'saturday': 'saturday',
        'sunday': 'sunday',
        '월': 'monday',
        '화': 'tuesday',
        '수': 'wednesday',
        '목': 'thursday',
        '금': 'friday',
        '토': 'saturday',
        '일': 'sunday'
      };

      // 시간 변환 헬퍼 함수
      function timeToMinutes(timeStr: string): number {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + (minutes || 0);
      }

      // 각 스케줄 검증
      const invalidDays: string[] = []; // 운영시간이 설정되지 않은 요일들
      
      for (const scheduleItem of updateData.schedule) {
        const startTime = scheduleItem.startTime || '';
        const endTime = scheduleItem.endTime || startTime;
        
        // dayOfWeek가 쉼표로 구분된 경우 처리 (예: "월,화,수,목")
        const dayOfWeekStr = scheduleItem.day || scheduleItem.dayOfWeek || '';
        const days = dayOfWeekStr.split(',').map(d => d.trim()).filter(d => d);
        
        console.log('🔍 검증할 스케줄:', {
          dayOfWeekStr,
          days,
          startTime,
          endTime
        });
        
        // 각 요일별로 검증
        for (const day of days) {
          const dayLower = day.toLowerCase();
          const englishDay = dayMap[dayLower] || dayLower;

          // 해당 요일의 운영시간 찾기
          const daySlot = dayTimeSlots.find((ds: any) => ds.day === englishDay);
          if (!daySlot || !daySlot.timeSlots || daySlot.timeSlots.length === 0) {
            // 한글 요일로 변환하여 추가
            const koreanDaysMap: { [key: string]: string } = {
              'monday': '월요일',
              'tuesday': '화요일',
              'wednesday': '수요일',
              'thursday': '목요일',
              'friday': '금요일',
              'saturday': '토요일',
              'sunday': '일요일',
              '월': '월요일',
              '화': '화요일',
              '수': '수요일',
              '목': '목요일',
              '금': '금요일',
              '토': '토요일',
              '일': '일요일'
            };
            const koreanDay = koreanDaysMap[dayLower] || `${day}요일`;
            invalidDays.push(koreanDay);
            continue; // 다음 요일로 계속 검증
          }

          // 시간이 운영시간 내에 있는지 확인
          const scheduleStartMinutes = timeToMinutes(startTime);
          const scheduleEndMinutes = timeToMinutes(endTime);
          
          let isWithinOperatingHours = false;
          for (const timeSlot of daySlot.timeSlots) {
            const slotStartMinutes = timeToMinutes(timeSlot.startTime);
            const slotEndMinutes = timeToMinutes(timeSlot.endTime);
            
            // 스케줄이 운영시간 슬롯 내에 완전히 포함되는지 확인
            if (scheduleStartMinutes >= slotStartMinutes && scheduleEndMinutes <= slotEndMinutes) {
              isWithinOperatingHours = true;
              break;
            }
          }

          if (!isWithinOperatingHours) {
            const availableTimes = daySlot.timeSlots.map((ts: any) => `${ts.startTime}~${ts.endTime}`).join(', ');
            return res.status(400).json({ 
              error: `${day}요일 ${startTime}는 개인레슨 운영시간이 아닙니다. 운영시간: ${availableTimes}` 
            });
          }
        }
      }
      
      // 운영시간이 설정되지 않은 요일이 있으면 에러 반환
      if (invalidDays.length > 0) {
        const invalidDaysStr = invalidDays.length === 1 
          ? invalidDays[0] 
          : invalidDays.slice(0, -1).join(', ') + ', ' + invalidDays[invalidDays.length - 1];
        return res.status(400).json({ 
          error: `${invalidDaysStr}은 개인레슨 운영시간이 설정되지 않았습니다. 센터 운영시간 설정을 확인하세요.` 
        });
      }
    }

    // ⭐ 스케줄별 레인 정보 처리
    if (updateData.schedule && updateData.schedule.length > 0) {
      updateData.schedule = updateData.schedule.map((sched: any) => {
        // 스케줄에 lanes 정보가 이미 포함되어 있으면 사용, 아니면 생성
        if (sched.lanes && sched.lanes.assignedLanes) {
          return sched; // 이미 레인 정보가 있으면 그대로 사용
        }
        
        // 레인 정보가 없으면 생성
        return {
          ...sched,
          lanes: {
            assignedLanes: sched.lanes?.assignedLanes || updateData.lanes || [],
            originalAssignedLanes: sched.lanes?.originalAssignedLanes || updateData.lanes || [],
            isAdjusted: sched.lanes?.isAdjusted || false
          }
        };
      });
    }
    
    console.log('💾 업데이트할 updateData:');
    console.log('  - lanes:', updateData.lanes);
    console.log('  - poolType:', updateData.poolType);
    console.log('  - laneInfo:', updateData.laneInfo);
    console.log('  - schedule:', JSON.stringify(updateData.schedule, null, 2));
    console.log('💾 전체 updateData:', updateData);
    
    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('instructor', 'name userId');
    
    console.log('✅ DB 업데이트 완료');
    console.log('🏊 업데이트된 lanes:', updatedCourse?.lanes);
    console.log('🏊 업데이트된 poolType:', updatedCourse?.poolType);
    console.log('🏊 업데이트된 laneInfo:', updatedCourse?.laneInfo);
    
    console.log('🔍 업데이트 후 강습 과정:', {
      _id: updatedCourse?._id,
      name: updatedCourse?.name,
      instructor: updatedCourse?.instructor,
      instructorId: updatedCourse?.instructorId,
      instructorName: updatedCourse?.instructorName
    });

    console.log('✅ 강습 과정 수정 완료:', {
      courseId: updatedCourse?._id,
      courseName: updatedCourse?.name,
      instructor: updatedCourse?.instructor,
      instructorId: updatedCourse?.instructorId,
      instructorName: updatedCourse?.instructorName,
      tags: updatedCourse?.tags,
      poolType: updatedCourse?.poolType,
      lanes: updatedCourse?.lanes,
      laneInfo: updatedCourse?.laneInfo
    });

    return res.json({
      success: true,
      message: '강습 과정이 수정되었습니다.',
      data: updatedCourse
    });
  } catch (error) {
    console.error('💥 강습 과정 수정 오류:', error);
    if (error instanceof Error) {
      console.error('💥 에러 메시지:', error.message);
      console.error('💥 에러 스택:', error.stack);
    }
    return res.status(500).json({ 
      error: '서버 오류가 발생했습니다.',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// 강습 과정 삭제 (강사/관리자만)
router.delete('/:id', authenticateToken, requireInstructorOrAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ error: '강습 과정을 찾을 수 없습니다.' });
    }

    // 강사 본인의 과정만 삭제 가능 (센터관리자/슈퍼관리자는 모든 과정 삭제 가능)
    const user = await User.findById(req.user.userId);
    const isSuperAdmin = user?.userType === 'superAdmin';
    const isCenterAdmin = ['centerAdmin', 'center-admin'].includes(user?.userType || '');
    const isOwnCourse = course.instructor.toString() === String(req.user.userId);
    
    console.log('🔐 삭제 권한 확인:', {
      userType: user?.userType,
      isSuperAdmin,
      isCenterAdmin,
      isOwnCourse
    });
    
    if (!isSuperAdmin && !isCenterAdmin && !isOwnCourse) {
      console.error('❌ 삭제 권한 없음:', { userType: user?.userType, userId: req.user.userId });
      return res.status(403).json({ error: '삭제 권한이 없습니다.' });
    }

    // ⭐ 코스 정보 디버그 로그
    console.log('🔍 삭제할 코스 정보:', {
      name: course.name,
      isPersonalLesson: course.isPersonalLesson,
      schedule: course.schedule
    });

    // ⭐ 개인레슨 판단: 명시적 플래그 또는 이름 기반
    const isPersonalLesson = course.isPersonalLesson === true || 
                              (course.name && (course.name.includes('개인 레슨') || course.name.includes('개인레슨')));
    
    console.log('🎯 개인레슨 판단:', {
      isPersonalLessonFlag: course.isPersonalLesson,
      courseName: course.name,
      finalIsPersonalLesson: isPersonalLesson
    });

    // ⭐ 개인레슨인 경우 레인 복원 로직 실행
    if (isPersonalLesson) {
      console.log('🔄 개인레슨 삭제 - 레인 복원 시작...');
      console.log('📅 개인레슨 스케줄:', course.schedule);
      
      // 개인레슨의 모든 스케줄에 대해 레인 복원
      for (const scheduleItem of course.schedule) {
        const dayName = scheduleItem.day;
        const time = scheduleItem.startTime;
        
        console.log(`🔍 복원 대상 요일/시간: ${dayName} ${time}`);
        
        // ⭐ dayName 처리: 쉼표로 구분된 경우 첫 번째 요일만 사용
        const actualDayName = Array.isArray(dayName) 
          ? dayName[0] 
          : dayName.split(',')[0].trim();
        
        console.log(`🔍 실제 날짜: ${actualDayName}`);
        
        // 해당 요일과 시간에 진행되는 다른 강습과정 찾기
        // ⭐ schedule.day가 쉼표로 구분된 문자열일 수 있으므로 $regex 사용
        const otherCourses = await Course.find({
          _id: { $ne: course._id },
          centerId: course.centerId,
          isActive: true,
          $or: [
            { 'schedule.day': actualDayName },
            { 'schedule.day': { $regex: actualDayName, $options: 'i' } }
          ],
          'schedule.startTime': time
        });
        
        console.log(`🔍 발견된 다른 강습과정 수: ${otherCourses.length}`);
        
        // 각 강습과정의 레인을 원래대로 복원
        for (const otherCourse of otherCourses) {
          console.log(`🔍 처리 중인 강습과정: ${otherCourse.name}`);
          
          // 해당 스케줄 항목 찾기
          // ⭐ day가 쉼표로 구분된 경우도 처리
          const otherScheduleItem = otherCourse.schedule.find((s: any) => {
            const sDay = s.day || '';
            const sDays = Array.isArray(sDay) 
              ? sDay 
              : sDay.split(',').map((d: string) => d.trim());
            return sDays.includes(actualDayName) && s.startTime === time;
          });
          
          if (otherScheduleItem) {
            console.log(`📊 스케줄 항목 발견:`, {
              day: otherScheduleItem.day,
              time: otherScheduleItem.startTime,
              lanes: otherScheduleItem.lanes
            });
            
            if (otherScheduleItem.lanes?.originalAssignedLanes && otherScheduleItem.lanes.originalAssignedLanes.length > 0) {
              const originalLanes = otherScheduleItem.lanes.originalAssignedLanes;
              const currentLanes = otherScheduleItem.lanes.assignedLanes;
              
              console.log(`🔧 ${otherCourse.name} ${actualDayName} ${time} 레인 복원:`, {
                current: currentLanes,
                original: originalLanes
              });
              
              // 레인 복원
              // ⭐ day가 쉼표로 구분된 경우도 처리
              const updatedSchedule = otherCourse.schedule.map((s: any) => {
                const sDay = s.day || '';
                const sDays = Array.isArray(sDay) 
                  ? sDay 
                  : sDay.split(',').map((d: string) => d.trim());
                const isMatchingDay = sDays.includes(actualDayName);
                
                if (isMatchingDay && s.startTime === time) {
                  return {
                    ...s,
                    lanes: {
                      assignedLanes: originalLanes,
                      originalAssignedLanes: originalLanes, // ⭐ originalAssignedLanes도 유지 (빈 배열로 초기화하지 않음)
                      isAdjusted: false
                    }
                  };
                }
                return s;
              });
              
              await Course.findByIdAndUpdate(otherCourse._id, {
                schedule: updatedSchedule
              });
              
              console.log(`✅ ${otherCourse.name} 레인 복원 완료: [${currentLanes.join(',')}] → [${originalLanes.join(',')}]`);
            } else {
              console.log(`⚠️  ${otherCourse.name} ${actualDayName} ${time} 복원할 원본 레인이 없음`);
            }
          } else {
            console.log(`⚠️  ${otherCourse.name} ${actualDayName} ${time} 스케줄 항목을 찾을 수 없음`);
          }
        }
      }
    }

    await Course.findByIdAndDelete(req.params.id);
    console.log('✅ 강습 과정 삭제 완료:', req.params.id);

    return res.json({ success: true, message: '강습 과정이 삭제되었습니다.' });
  } catch (error) {
    console.error('강습 과정 삭제 오류:', error);
    return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});


// 강습 과정 등록
router.post('/:id/enroll', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ error: '강습 과정을 찾을 수 없습니다.' });
    }

    if (!course.isActive) {
      return res.status(400).json({ error: '비활성화된 강습 과정입니다.' });
    }

    // 이미 등록된 학생인지 확인
    const alreadyEnrolled = course.enrolledStudents.some(
      enrollment => enrollment.student && enrollment.student.toString() === String((req as any).user._id)
    );

    if (alreadyEnrolled) {
      return res.status(400).json({ error: '이미 등록된 강습 과정입니다.' });
    }

    // 최대 학생 수 확인
    let activeStudents = 0;
    for (const enrollment of course.enrolledStudents) {
      if (enrollment.status === 'active') {
        activeStudents++;
      }
    }

    if (activeStudents >= course.maxStudents) {
      return res.status(400).json({ error: '강습 과정이 가득 찼습니다.' });
    }

    course.enrolledStudents.push({
      student: (req as any).user._id,
      status: 'active',
      enrolledAt: new Date()
    });

    await course.save();

    return res.json({ message: '강습 과정에 등록되었습니다.' });
  } catch (error) {
    console.error('강습 과정 등록 오류:', error);
    return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 강습 과정 취소
router.post('/:id/cancel', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ error: '강습 과정을 찾을 수 없습니다.' });
    }

    const enrollmentIndex = course.enrolledStudents.findIndex(
      enrollment => enrollment.student && enrollment.student.toString() === req.user.userId
    );

    if (enrollmentIndex === -1) {
      return res.status(400).json({ error: '등록되지 않은 강습 과정입니다.' });
    }

    course.enrolledStudents[enrollmentIndex].status = 'dropped';
    await course.save();

    return res.json({ message: '강습 과정이 취소되었습니다.' });
  } catch (error) {
    console.error('강습 과정 취소 오류:', error);
    return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 학생 강습 과정 등록
router.post('/:courseId/enroll', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user.userId;

    // 강습 과정 확인
    const course = await Course.findById(courseId);
    if (!course || !course.isActive) {
      return res.status(404).json({ error: '강습 과정을 찾을 수 없습니다.' });
    }

    // 이미 등록되어 있는지 확인
    let existingEnrollment = null;
    for (const enrollment of course.enrolledStudents) {
      if (enrollment.student && enrollment.student.toString() === studentId.toString()) {
        existingEnrollment = enrollment;
        break;
      }
    }

    if (existingEnrollment) {
      return res.status(400).json({ error: '이미 등록된 강습 과정입니다.' });
    }

    // 정원 확인
    if (course.enrolledStudents.length >= course.maxStudents) {
      return res.status(400).json({ error: '강습 과정 정원이 가득 찼습니다.' });
    }

    // 학생 등록
    course.enrolledStudents.push({
      student: studentId,
      enrolledAt: new Date(),
      status: 'active'
    });

    await course.save();

    // 사용자 정보 업데이트
    await User.findByIdAndUpdate(studentId, {
      $push: { 'studentInfo.enrolledCourses': courseId }
    });

    res.json({
      success: true,
      message: '강습 과정에 성공적으로 등록되었습니다.',
      data: course
    });
  } catch (error) {
    console.error('강습 과정 등록 오류:', error);
    res.status(500).json({ error: '강습 과정 등록에 실패했습니다.' });
  }
});

// 학생 강습 과정 해제
router.post('/:courseId/unenroll', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user.userId;

    // 강습 과정 확인
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: '강습 과정을 찾을 수 없습니다.' });
    }

    // 등록 상태 확인
    const enrollmentIndex = course.enrolledStudents.findIndex(
      enrollment => enrollment.student && enrollment.student.toString() === studentId.toString()
    );

    if (enrollmentIndex === -1) {
      return res.status(400).json({ error: '등록되지 않은 강습 과정입니다.' });
    }

    // 학생 제거
    course.enrolledStudents.splice(enrollmentIndex, 1);
    await course.save();

    // 사용자 정보 업데이트
    await User.findByIdAndUpdate(studentId, {
      $pull: { 'studentInfo.enrolledCourses': courseId }
    });

    res.json({
      success: true,
      message: '강습 과정에서 성공적으로 해제되었습니다.',
      data: course
    });
  } catch (error) {
    console.error('강습 과정 해제 오류:', error);
    res.status(500).json({ error: '강습 과정 해제에 실패했습니다.' });
  }
});

// 학생별 강습 과정 진도율 업데이트
router.put('/:courseId/progress/:studentId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { courseId, studentId } = req.params;
    const { progress, completedSteps, notes } = req.body;

    // 강습 과정 확인
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: '강습 과정을 찾을 수 없습니다.' });
    }

    // 학생 등록 상태 확인
    let enrollment = null;
    for (const e of course.enrolledStudents) {
      if (e.student && e.student.toString() === studentId) {
        enrollment = e;
        break;
      }
    }

    if (!enrollment) {
      return res.status(400).json({ error: '등록되지 않은 학생입니다.' });
    }

    // 진도율 정보 추가
    if (!enrollment.progress) {
      enrollment.progress = {
        percentage: 0,
        completedSteps: [] as any,
        lastUpdated: new Date(),
        notes: ''
      };
    }

    enrollment.progress.percentage = progress || enrollment.progress.percentage || 0;
    enrollment.progress.completedSteps = completedSteps || enrollment.progress.completedSteps || [];
    enrollment.progress.lastUpdated = new Date();
    enrollment.progress.notes = notes || enrollment.progress.notes || '';

    await course.save();

    res.json({
      success: true,
      message: '진도율이 성공적으로 업데이트되었습니다.',
      data: enrollment.progress
    });
  } catch (error) {
    console.error('진도율 업데이트 오류:', error);
    res.status(500).json({ error: '진도율 업데이트에 실패했습니다.' });
  }
});

// 학생별 강습 과정 상세 정보 조회
router.get('/:courseId/student/:studentId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { courseId, studentId } = req.params;

    // 강습 과정과 학생 정보 함께 조회
    const course = await Course.findById(courseId)
      .populate('instructor', 'name email')
      .populate('enrolledStudents.student', 'name email studentInfo');

    if (!course) {
      return res.status(404).json({ error: '강습 과정을 찾을 수 없습니다.' });
    }

    // 해당 학생 정보 찾기
    let studentEnrollment = null;
    for (const e of course.enrolledStudents) {
      if (e.student && e.student._id.toString() === studentId) {
        studentEnrollment = e;
        break;
      }
    }

    if (!studentEnrollment || !studentEnrollment.student) {
      return res.status(404).json({ error: '등록되지 않은 학생입니다.' });
    }

    res.json({
      success: true,
      message: '학생 정보 조회 성공',
      data: {
        course: {
          _id: course._id,
          name: course.name,
          level: course.level,
          instructor: course.instructor
        },
        student: studentEnrollment.student,
        enrollment: {
          enrolledAt: studentEnrollment.enrolledAt,
          status: studentEnrollment.status,
          progress: studentEnrollment.progress || {}
        }
      }
    });
  } catch (error) {
    console.error('학생 정보 조회 오류:', error);
    res.status(500).json({ error: '학생 정보 조회에 실패했습니다.' });
  }
});

// 강사별 담당 학생 목록 조회
router.get('/instructor/:instructorId/students', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { instructorId } = req.params;
    
    // 권한 확인: 본인이거나 관리자
    if (req.user.userId !== instructorId && 
        req.user.userType !== 'centerAdmin' && 
        req.user.userType !== 'superAdmin') {
      return res.status(403).json({ error: '접근 권한이 없습니다.' });
    }

    // 강사가 담당하는 강습 과정 조회
    const courses = await Course.find({ 
      instructor: instructorId,
      isActive: true 
    }).populate('enrolledStudents.student', 'name email studentInfo');

    // 학생별 정보 정리
    const studentMap = new Map();
    
    courses.forEach(course => {
      course.enrolledStudents.forEach(enrollment => {
        if (enrollment.student && enrollment.status === 'active') {
          const student = enrollment.student as any; // populate 후 타입 캐스팅
          const studentId = student._id.toString();
          
          if (!studentMap.has(studentId)) {
            studentMap.set(studentId, {
              _id: student._id,
              name: student.name,
              email: student.email,
              swimmingLevel: student.studentInfo?.swimmingLevel || 'beginner',
              courses: [],
              totalProgress: 0,
              averageProgress: 0
            });
          }
          
          const studentInfo = studentMap.get(studentId);
          const progress = enrollment.progress?.percentage || 0;
          
          studentInfo.courses.push({
            courseId: course._id,
            courseName: course.name,
            level: course.level,
            enrolledAt: enrollment.enrolledAt,
            progress: progress,
            status: enrollment.status
          });
          
          studentInfo.totalProgress += progress;
        }
      });
    });

    // 평균 진도율 계산
    const students = Array.from(studentMap.values()).map(student => ({
      ...student,
      averageProgress: student.courses.length > 0 ? Math.round(student.totalProgress / student.courses.length) : 0
    }));

    // 진도율 기준으로 정렬
    students.sort((a, b) => b.averageProgress - a.averageProgress);

    res.json({
      success: true,
      message: '강사별 담당 학생 목록 조회 성공',
      data: {
        instructorId,
        totalStudents: students.length,
        students
      }
    });
  } catch (error) {
    console.error('강사별 학생 목록 조회 오류:', error);
    res.status(500).json({ error: '학생 목록 조회에 실패했습니다.' });
  }
});

// 강사별 강습 과정 통계
router.get('/instructor/:instructorId/stats', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { instructorId } = req.params;
    
    // 권한 확인: 본인이거나 관리자
    if (req.user.userId !== instructorId && 
        req.user.userType !== 'centerAdmin' && 
        req.user.userType !== 'superAdmin') {
      return res.status(403).json({ error: '접근 권한이 없습니다.' });
    }

    // 강사가 담당하는 강습 과정 통계
    const stats = await Course.aggregate([
      { $match: { instructor: new mongoose.Types.ObjectId(instructorId), isActive: true } },
      {
        $group: {
          _id: null,
          totalCourses: { $sum: 1 },
          totalStudents: { $sum: { $size: '$enrolledStudents' } },
          activeStudents: {
            $sum: {
              $size: {
                $filter: {
                  input: '$enrolledStudents',
                  cond: { $eq: ['$$this.status', 'active'] }
                }
              }
            }
          },
          averageProgress: {
            $avg: {
              $avg: '$enrolledStudents.progress.percentage'
            }
          }
        }
      }
    ]);

    // 강습 과정별 상세 통계
    const courseStats = await Course.aggregate([
      { $match: { instructor: new mongoose.Types.ObjectId(instructorId), isActive: true } },
      {
        $project: {
          name: 1,
          level: 1,
          enrolledCount: { $size: '$enrolledStudents' },
          averageProgress: { $avg: '$enrolledStudents.progress.percentage' },
          completionRate: {
            $divide: [
              { $size: { $filter: { input: '$enrolledStudents', cond: { $eq: ['$$this.status', 'completed'] } } } },
              { $size: '$enrolledStudents' }
            ]
          }
        }
      }
    ]);

    res.json({
      success: true,
      message: '강사별 통계 조회 성공',
      data: {
        instructorId,
        overview: stats[0] || {
          totalCourses: 0,
          totalStudents: 0,
          activeStudents: 0,
          averageProgress: 0
        },
        courseStats
      }
    });
  } catch (error) {
    console.error('강사별 통계 조회 오류:', error);
    res.status(500).json({ error: '통계 조회에 실패했습니다.' });
  }
});

// 강사가 관리하는 반 목록 가져오기
router.get('/instructor/:instructorId/classes', async (req, res) => {
  try {
    const { instructorId } = req.params;
    
    const classes = await Course.find({ 
      instructor: instructorId
      // isActive 필드 체크 제거 - 모든 과정 반환
    })
    .populate('instructor', 'name userId')
    .populate('enrolledStudents.student', 'name userId email')
    .populate('teachingMethods.methodId')
    .sort({ 'classInfo.startDate': 1 });
    
    const classesData: any[] = [];
    for (const course of classes) {
      classesData.push({
        _id: course._id,
        name: course.name, // 기존 name 필드 사용
        level: course.level,
        classInfo: course.classInfo,
        instructor: course.instructor,
        enrolledStudents: course.enrolledStudents,
        teachingMethods: course.teachingMethods,
        schedule: course.schedule,
        isActive: course.isActive !== false // isActive가 false가 아니면 true로 처리
      });
    }
    
    res.json({
      success: true,
      data: {
        classes: classesData
      }
    });
  } catch (error) {
    console.error('강사 반 목록 조회 실패:', error);
    res.status(500).json({ success: false, message: '강사 반 목록 조회에 실패했습니다.' });
  }
});

// 특정 반의 회원 진도 관리
router.get('/class/:classId/students/progress', async (req, res) => {
  try {
    const { classId } = req.params;
    
    const course = await Course.findById(classId)
      .populate('enrolledStudents.student', 'name userId email')
      .populate('teachingMethods.methodId')
      .populate('enrolledStudents.progress.completedSteps.methodId');
    
    if (!course) {
      return res.status(404).json({ success: false, message: '반을 찾을 수 없습니다.' });
    }
    
    // 각 회원의 체크리스트 진행 상황 계산
    const studentsProgress: any[] = [];
    for (const enrollment of course.enrolledStudents) {
      const student = enrollment.student as any;
      // progress는 항상 존재함 (모델에서 default 설정)
      const progress = enrollment.progress || {
        percentage: 0,
        completedSteps: [],
        lastUpdated: new Date(),
        notes: ''
      };
      
      // 전체 체크리스트 단계 수 계산
      let totalSteps = 0;
      for (const tm of course.teachingMethods) {
        const method = tm.methodId as any;
        totalSteps += (method?.steps?.length || 0);
      }
      
      // 완료된 단계 수 계산
      const completedSteps = (progress.completedSteps as any[]).length;
      
      // 진행률 계산
      const percentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
      
      studentsProgress.push({
        student: {
          _id: student._id,
          name: student.name || student.userId,
          userId: student.userId,
          email: student.email
        },
        enrollment: {
          enrolledAt: enrollment.enrolledAt,
          status: enrollment.status,
          progress: {
            ...progress,
            percentage,
            totalSteps,
            completedSteps: completedSteps
          }
        },
        teachingMethods: (() => {
          const methodsData: any[] = [];
          for (const tm of course.teachingMethods) {
            const method = tm.methodId as any;
            let methodCompletedSteps = 0;
            for (const step of progress.completedSteps as any[]) {
              if (step.methodId?.toString() === method._id.toString()) {
                methodCompletedSteps++;
              }
            }
            
            methodsData.push({
              _id: method._id,
              name: method.name,
              description: method.description,
              steps: method.steps || [],
              tips: method.tips || [],
              order: tm.order,
              isRequired: tm.isRequired,
              progress: {
                totalSteps: method.steps?.length || 0,
                completedSteps: methodCompletedSteps,
                percentage: method.steps?.length > 0 
                  ? Math.round((methodCompletedSteps / method.steps.length) * 100) 
                  : 0
              }
            });
          }
          return methodsData;
        })()
      });
    }
    
    res.json({
      success: true,
      data: {
        classInfo: {
          _id: course._id,
          name: course.name,
          level: course.level,
          classInfo: course.classInfo
        },
        studentsProgress
      }
    });
  } catch (error) {
    console.error('반 회원 진도 조회 실패:', error);
    res.status(500).json({ success: false, message: '반 회원 진도 조회에 실패했습니다.' });
  }
});

// 회원 체크리스트 단계 완료 처리
router.post('/class/:classId/student/:studentId/complete-step', async (req, res) => {
  try {
    const { classId, studentId } = req.params;
    const { methodId, stepName, notes } = req.body;
    
    const course = await Course.findById(classId);
    if (!course) {
      return res.status(404).json({ success: false, message: '반을 찾을 수 없습니다.' });
    }
    
    // 해당 회원의 등록 정보 찾기
    let enrollment = null;
    for (const e of course.enrolledStudents) {
      if (e.student && e.student.toString() === studentId) {
        enrollment = e;
        break;
      }
    }
    
    if (!enrollment) {
      return res.status(404).json({ success: false, message: '해당 회원이 이 반에 등록되어 있지 않습니다.' });
    }
    
    // progress는 항상 존재함 (모델에서 default 설정)
    const progress = enrollment.progress;
    
    // 이미 완료된 단계인지 확인
    const existingStep = (progress.completedSteps as any[]).find(
      step => step.methodId && step.methodId.toString() === methodId && step.stepName === stepName
    );
    
    if (existingStep) {
      return res.status(400).json({ success: false, message: '이미 완료된 단계입니다.' });
    }
    
    // 새로운 완료 단계 추가
    (progress.completedSteps as any[]).push({
      methodId,
      stepName,
      completedAt: new Date(),
      notes: notes || ''
    });
    
    // 진행률 업데이트
    let totalSteps = 0;
    for (const tm of course.teachingMethods) {
      if (tm.methodId.toString() === methodId) {
        totalSteps++;
      }
    }
    
    progress.percentage = Math.round(
      ((progress.completedSteps as any[]).length / totalSteps) * 100
    );
    progress.lastUpdated = new Date();
    
    await course.save();
    
    res.json({
      success: true,
      message: '체크리스트 단계가 완료되었습니다.',
      data: {
        completedSteps: progress.completedSteps,
        percentage: progress.percentage
      }
    });
  } catch (error) {
    console.error('체크리스트 단계 완료 처리 실패:', error);
    res.status(500).json({ success: false, message: '체크리스트 단계 완료 처리에 실패했습니다.' });
  }
});

// 학생 강습 과정 등록
router.post('/:courseId/enroll', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user.userId;

    // 강습 과정 확인
    const course = await Course.findById(courseId);
    if (!course || !course.isActive) {
      return res.status(404).json({ error: '강습 과정을 찾을 수 없습니다.' });
    }

    // 이미 등록되어 있는지 확인
    let existingEnrollment = null;
    for (const enrollment of course.enrolledStudents) {
      if (enrollment.student && enrollment.student.toString() === studentId.toString()) {
        existingEnrollment = enrollment;
        break;
      }
    }

    if (existingEnrollment) {
      return res.status(400).json({ error: '이미 등록된 강습 과정입니다.' });
    }

    // 정원 확인
    if (course.enrolledStudents.length >= course.maxStudents) {
      return res.status(400).json({ error: '강습 과정 정원이 가득 찼습니다.' });
    }

    // 학생 등록
    course.enrolledStudents.push({
      student: studentId,
      enrolledAt: new Date(),
      status: 'active'
    });

    await course.save();

    // 사용자 정보 업데이트
    await User.findByIdAndUpdate(studentId, {
      $push: { 'studentInfo.enrolledCourses': courseId }
    });

    res.json({
      success: true,
      message: '강습 과정에 성공적으로 등록되었습니다.',
      data: course
    });
  } catch (error) {
    console.error('강습 과정 등록 오류:', error);
    res.status(500).json({ error: '강습 과정 등록에 실패했습니다.' });
  }
});

// 학생 강습 과정 해제
router.post('/:courseId/unenroll', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user.userId;

    // 강습 과정 확인
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: '강습 과정을 찾을 수 없습니다.' });
    }

    // 등록 상태 확인
    const enrollmentIndex = course.enrolledStudents.findIndex(
      enrollment => enrollment.student && enrollment.student.toString() === studentId.toString()
    );

    if (enrollmentIndex === -1) {
      return res.status(400).json({ error: '등록되지 않은 강습 과정입니다.' });
    }

    // 학생 제거
    course.enrolledStudents.splice(enrollmentIndex, 1);
    await course.save();

    // 사용자 정보 업데이트
    await User.findByIdAndUpdate(studentId, {
      $pull: { 'studentInfo.enrolledCourses': courseId }
    });

    res.json({
      success: true,
      message: '강습 과정에서 성공적으로 해제되었습니다.',
      data: course
    });
  } catch (error) {
    console.error('강습 과정 해제 오류:', error);
    res.status(500).json({ error: '강습 과정 해제에 실패했습니다.' });
  }
});

// 학생별 강습 과정 진도율 업데이트
router.put('/:courseId/progress/:studentId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { courseId, studentId } = req.params;
    const { progress, completedSteps, notes } = req.body;

    // 강습 과정 확인
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: '강습 과정을 찾을 수 없습니다.' });
    }

    // 학생 등록 상태 확인
    let enrollment = null;
    for (const e of course.enrolledStudents) {
      if (e.student && e.student.toString() === studentId) {
        enrollment = e;
        break;
      }
    }

    if (!enrollment) {
      return res.status(400).json({ error: '등록되지 않은 학생입니다.' });
    }

    // 진도율 정보 추가
    if (!enrollment.progress) {
      enrollment.progress = {
        percentage: 0,
        completedSteps: [] as any,
        lastUpdated: new Date(),
        notes: ''
      };
    }

    enrollment.progress.percentage = progress || enrollment.progress.percentage || 0;
    enrollment.progress.completedSteps = completedSteps || enrollment.progress.completedSteps || [];
    enrollment.progress.lastUpdated = new Date();
    enrollment.progress.notes = notes || enrollment.progress.notes || '';

    await course.save();

    res.json({
      success: true,
      message: '진도율이 성공적으로 업데이트되었습니다.',
      data: enrollment.progress
    });
  } catch (error) {
    console.error('진도율 업데이트 오류:', error);
    res.status(500).json({ error: '진도율 업데이트에 실패했습니다.' });
  }
});

// 학생별 강습 과정 상세 정보 조회
router.get('/:courseId/student/:studentId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { courseId, studentId } = req.params;

    // 강습 과정과 학생 정보 함께 조회
    const course = await Course.findById(courseId)
      .populate('instructor', 'name email')
      .populate('enrolledStudents.student', 'name email studentInfo');

    if (!course) {
      return res.status(404).json({ error: '강습 과정을 찾을 수 없습니다.' });
    }

    // 해당 학생 정보 찾기
    let studentEnrollment = null;
    for (const e of course.enrolledStudents) {
      if (e.student && e.student._id.toString() === studentId) {
        studentEnrollment = e;
        break;
      }
    }

    if (!studentEnrollment || !studentEnrollment.student) {
      return res.status(404).json({ error: '등록되지 않은 학생입니다.' });
    }

    res.json({
      success: true,
      message: '학생 정보 조회 성공',
      data: {
        course: {
          _id: course._id,
          name: course.name,
          level: course.level,
          instructor: course.instructor
        },
        student: studentEnrollment.student,
        enrollment: {
          enrolledAt: studentEnrollment.enrolledAt,
          status: studentEnrollment.status,
          progress: studentEnrollment.progress || {}
        }
      }
    });
  } catch (error) {
    console.error('학생 정보 조회 오류:', error);
    res.status(500).json({ error: '학생 정보 조회에 실패했습니다.' });
  }
});

// 강사별 담당 학생 목록 조회
router.get('/instructor/:instructorId/students', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { instructorId } = req.params;
    
    // 권한 확인: 본인이거나 관리자
    if (req.user.userId !== instructorId && 
        req.user.userType !== 'centerAdmin' && 
        req.user.userType !== 'superAdmin') {
      return res.status(403).json({ error: '접근 권한이 없습니다.' });
    }

    // 강사가 담당하는 강습 과정 조회
    const courses = await Course.find({ 
      instructor: instructorId,
      isActive: true 
    }).populate('enrolledStudents.student', 'name email studentInfo');

    // 학생별 정보 정리
    const studentMap = new Map();
    
    courses.forEach(course => {
      course.enrolledStudents.forEach(enrollment => {
        if (enrollment.student && enrollment.status === 'active') {
          const student = enrollment.student as any; // populate 후 타입 캐스팅
          const studentId = student._id.toString();
          
          if (!studentMap.has(studentId)) {
            studentMap.set(studentId, {
              _id: student._id,
              name: student.name,
              email: student.email,
              swimmingLevel: student.studentInfo?.swimmingLevel || 'beginner',
              courses: [],
              totalProgress: 0,
              averageProgress: 0
            });
          }
          
          const studentInfo = studentMap.get(studentId);
          const progress = enrollment.progress?.percentage || 0;
          
          studentInfo.courses.push({
            courseId: course._id,
            courseName: course.name,
            level: course.level,
            enrolledAt: enrollment.enrolledAt,
            progress: progress,
            status: enrollment.status
          });
          
          studentInfo.totalProgress += progress;
        }
      });
    });

    // 평균 진도율 계산
    const students = Array.from(studentMap.values()).map(student => ({
      ...student,
      averageProgress: student.courses.length > 0 ? Math.round(student.totalProgress / student.courses.length) : 0
    }));

    // 진도율 기준으로 정렬
    students.sort((a, b) => b.averageProgress - a.averageProgress);

    res.json({
      success: true,
      message: '강사별 담당 학생 목록 조회 성공',
      data: {
        instructorId,
        totalStudents: students.length,
        students
      }
    });
  } catch (error) {
    console.error('강사별 학생 목록 조회 오류:', error);
    res.status(500).json({ error: '학생 목록 조회에 실패했습니다.' });
  }
});

// 강사별 강습 과정 통계
router.get('/instructor/:instructorId/stats', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { instructorId } = req.params;
    
    // 권한 확인: 본인이거나 관리자
    if (req.user.userId !== instructorId && 
        req.user.userType !== 'centerAdmin' && 
        req.user.userType !== 'superAdmin') {
      return res.status(403).json({ error: '접근 권한이 없습니다.' });
    }

    // 강사가 담당하는 강습 과정 통계
    const stats = await Course.aggregate([
      { $match: { instructor: new mongoose.Types.ObjectId(instructorId), isActive: true } },
      {
        $group: {
          _id: null,
          totalCourses: { $sum: 1 },
          totalStudents: { $sum: { $size: '$enrolledStudents' } },
          activeStudents: {
            $sum: {
              $size: {
                $filter: {
                  input: '$enrolledStudents',
                  cond: { $eq: ['$$this.status', 'active'] }
                }
              }
            }
          },
          averageProgress: {
            $avg: {
              $avg: '$enrolledStudents.progress.percentage'
            }
          }
        }
      }
    ]);

    // 강습 과정별 상세 통계
    const courseStats = await Course.aggregate([
      { $match: { instructor: new mongoose.Types.ObjectId(instructorId), isActive: true } },
      {
        $project: {
          name: 1,
          level: 1,
          enrolledCount: { $size: '$enrolledStudents' },
          averageProgress: { $avg: '$enrolledStudents.progress.percentage' },
          completionRate: {
            $divide: [
              { $size: { $filter: { input: '$enrolledStudents', cond: { $eq: ['$$this.status', 'completed'] } } } },
              { $size: '$enrolledStudents' }
            ]
          }
        }
      }
    ]);

    res.json({
      success: true,
      message: '강사별 통계 조회 성공',
      data: {
        instructorId,
        overview: stats[0] || {
          totalCourses: 0,
          totalStudents: 0,
          activeStudents: 0,
          averageProgress: 0
        },
        courseStats
      }
    });
  } catch (error) {
    console.error('강사별 통계 조회 오류:', error);
    res.status(500).json({ error: '통계 조회에 실패했습니다.' });
  }
});

// 강사가 관리하는 반 목록 가져오기
router.get('/instructor/:instructorId/classes', async (req, res) => {
  try {
    const { instructorId } = req.params;
    
    const classes = await Course.find({ 
      instructor: instructorId
      // isActive 필드 체크 제거 - 모든 과정 반환
    })
    .populate('instructor', 'name userId')
    .populate('enrolledStudents.student', 'name userId email')
    .populate('teachingMethods.methodId')
    .sort({ 'classInfo.startDate': 1 });
    
    const classesData: any[] = [];
    for (const course of classes) {
      classesData.push({
        _id: course._id,
        name: course.name, // 기존 name 필드 사용
        level: course.level,
        classInfo: course.classInfo,
        instructor: course.instructor,
        enrolledStudents: course.enrolledStudents,
        teachingMethods: course.teachingMethods,
        schedule: course.schedule,
        isActive: course.isActive !== false // isActive가 false가 아니면 true로 처리
      });
    }
    
    res.json({
      success: true,
      data: {
        classes: classesData
      }
    });
  } catch (error) {
    console.error('강사 반 목록 조회 실패:', error);
    res.status(500).json({ success: false, message: '강사 반 목록 조회에 실패했습니다.' });
  }
});

// 특정 반의 회원 진도 관리
router.get('/class/:classId/students/progress', async (req, res) => {
  try {
    const { classId } = req.params;
    
    const course = await Course.findById(classId)
      .populate('enrolledStudents.student', 'name userId email')
      .populate('teachingMethods.methodId')
      .populate('enrolledStudents.progress.completedSteps.methodId');
    
    if (!course) {
      return res.status(404).json({ success: false, message: '반을 찾을 수 없습니다.' });
    }
    
    // 각 회원의 체크리스트 진행 상황 계산
    const studentsProgress: any[] = [];
    for (const enrollment of course.enrolledStudents) {
      const student = enrollment.student as any;
      // progress는 항상 존재함 (모델에서 default 설정)
      const progress = enrollment.progress || {
        percentage: 0,
        completedSteps: [],
        lastUpdated: new Date(),
        notes: ''
      };
      
      // 전체 체크리스트 단계 수 계산
      let totalSteps = 0;
      for (const tm of course.teachingMethods) {
        const method = tm.methodId as any;
        totalSteps += (method?.steps?.length || 0);
      }
      
      // 완료된 단계 수 계산
      const completedSteps = (progress.completedSteps as any[]).length;
      
      // 진행률 계산
      const percentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
      
      studentsProgress.push({
        student: {
          _id: student._id,
          name: student.name || student.userId,
          userId: student.userId,
          email: student.email
        },
        enrollment: {
          enrolledAt: enrollment.enrolledAt,
          status: enrollment.status,
          progress: {
            ...progress,
            percentage,
            totalSteps,
            completedSteps: completedSteps
          }
        },
        teachingMethods: (() => {
          const methodsData: any[] = [];
          for (const tm of course.teachingMethods) {
            const method = tm.methodId as any;
            let methodCompletedSteps = 0;
            for (const step of progress.completedSteps as any[]) {
              if (step.methodId?.toString() === method._id.toString()) {
                methodCompletedSteps++;
              }
            }
            
            methodsData.push({
              _id: method._id,
              name: method.name,
              description: method.description,
              steps: method.steps || [],
              tips: method.tips || [],
              order: tm.order,
              isRequired: tm.isRequired,
              progress: {
                totalSteps: method.steps?.length || 0,
                completedSteps: methodCompletedSteps,
                percentage: method.steps?.length > 0 
                  ? Math.round((methodCompletedSteps / method.steps.length) * 100) 
                  : 0
              }
            });
          }
          return methodsData;
        })()
      });
    }
    
    res.json({
      success: true,
      data: {
        classInfo: {
          _id: course._id,
          name: course.name,
          level: course.level,
          classInfo: course.classInfo
        },
        studentsProgress
      }
    });
  } catch (error) {
    console.error('반 회원 진도 조회 실패:', error);
    res.status(500).json({ success: false, message: '반 회원 진도 조회에 실패했습니다.' });
  }
});

// 회원 체크리스트 단계 완료 처리
router.post('/class/:classId/student/:studentId/complete-step', async (req, res) => {
  try {
    const { classId, studentId } = req.params;
    const { methodId, stepName, notes } = req.body;
    
    const course = await Course.findById(classId);
    if (!course) {
      return res.status(404).json({ success: false, message: '반을 찾을 수 없습니다.' });
    }
    
    // 해당 회원의 등록 정보 찾기
    let enrollment = null;
    for (const e of course.enrolledStudents) {
      if (e.student && e.student.toString() === studentId) {
        enrollment = e;
        break;
      }
    }
    
    if (!enrollment) {
      return res.status(404).json({ success: false, message: '해당 회원이 이 반에 등록되어 있지 않습니다.' });
    }
    
    // progress는 항상 존재함 (모델에서 default 설정)
    const progress = enrollment.progress;
    
    // 이미 완료된 단계인지 확인
    const existingStep = (progress.completedSteps as any[]).find(
      step => step.methodId && step.methodId.toString() === methodId && step.stepName === stepName
    );
    
    if (existingStep) {
      return res.status(400).json({ success: false, message: '이미 완료된 단계입니다.' });
    }
    
    // 새로운 완료 단계 추가
    (progress.completedSteps as any[]).push({
      methodId,
      stepName,
      completedAt: new Date(),
      notes: notes || ''
    });
    
    // 진행률 업데이트
    let totalSteps = 0;
    for (const tm of course.teachingMethods) {
      if (tm.methodId.toString() === methodId) {
        totalSteps++;
      }
    }
    
    progress.percentage = Math.round(
      ((progress.completedSteps as any[]).length / totalSteps) * 100
    );
    progress.lastUpdated = new Date();
    
    await course.save();
    
    res.json({
      success: true,
      message: '체크리스트 단계가 완료되었습니다.',
      data: {
        completedSteps: progress.completedSteps,
        percentage: progress.percentage
      }
    });
  } catch (error) {
    console.error('체크리스트 단계 완료 처리 실패:', error);
    res.status(500).json({ success: false, message: '체크리스트 단계 완료 처리에 실패했습니다.' });
  }
});

// 강사별 강습 과정 조회 (강사 전용)
router.get('/my-courses', authMiddleware, requireRole(['instructor']), async (req: AuthRequest, res: Response) => {
  try {
    const instructorId = req.user.userId;
    
    // 페이지네이션 파라미터
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    
    // 강사의 강습 과정 조회
    const courses = await Course.find({ instructor: instructorId })
      .populate('enrolledStudents.student', 'name email')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    
    const totalCourses = await Course.countDocuments({ instructor: instructorId });

    res.json({
      success: true,
      message: '강사 강습 과정 조회 성공!',
      data: courses,
      pagination: {
        page,
        limit,
        total: totalCourses,
        pages: Math.ceil(totalCourses / limit)
      }
    });
  } catch (error) {
    console.error('강사 강습 과정 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '강사 강습 과정 조회에 실패했습니다.'
    });
  }
});

/**
 * 👁️ 최고관리자용 강습 과정 감독 API
 * GET /api/courses/oversight
 * - 전체 센터의 강습 과정 현황 조회
 * - 승인 상태별 필터링 지원
 */
router.get('/oversight', authMiddleware, requireRole(['superAdmin']), async (req: AuthRequest, res: Response) => {
  try {
    // 간단한 더미 데이터로 우선 응답 (실제 구현은 추후)
    const dummyOversightData = [
      {
        _id: '1',
        title: '초급 자유형 기초반',
        description: '수영 초보자를 위한 자유형 기초 강습',
        level: 'beginner',
        duration: 60,
        maxStudents: 8,
        price: 80000,
        centerId: 'center1',
        centerName: 'JJ 수영장 강남점',
        centerRegion: '서울 강남구',
        instructor: { _id: 'inst1', name: '김강사', rating: 4.5 },
        enrollmentCount: 6,
        revenue: 480000,
        satisfaction: 4.3,
        status: 'active',
        approvalStatus: 'approved',
        createdAt: '2025-01-15',
        lastUpdated: '2025-01-18'
      },
      {
        _id: '2',
        title: '중급 4영법 마스터반',
        description: '4가지 영법을 모두 배우는 중급 과정',
        level: 'intermediate',
        duration: 75,
        maxStudents: 6,
        price: 120000,
        centerId: 'center2',
        centerName: 'JJ 수영장 홍대점',
        centerRegion: '서울 마포구',
        instructor: { _id: 'inst2', name: '이강사', rating: 4.7 },
        enrollmentCount: 4,
        revenue: 480000,
        satisfaction: 4.6,
        status: 'active',
        approvalStatus: 'pending',
        createdAt: '2025-01-10',
        lastUpdated: '2025-01-17'
      },
      {
        _id: '3',
        title: '고급 접영 마스터반',
        description: '접영 마스터 및 경기 준비 과정',
        level: 'advanced',
        duration: 90,
        maxStudents: 4,
        price: 180000,
        centerId: 'center1',
        centerName: 'JJ 수영장 강남점',
        centerRegion: '서울 강남구',
        instructor: { _id: 'inst3', name: '박강사', rating: 4.8 },
        enrollmentCount: 3,
        revenue: 540000,
        satisfaction: 4.9,
        status: 'active',
        approvalStatus: 'approved',
        createdAt: '2025-01-12',
        lastUpdated: '2025-01-16'
      }
    ];
    
    res.json({
      success: true,
      data: dummyOversightData,
      pagination: {
        current: 1,
        limit: 10,
        total: dummyOversightData.length,
        pages: 1
      }
    });
    
  } catch (error) {
    console.error('강습 과정 감독 데이터 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '강습 과정 감독 데이터 조회 중 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    });
  }
});

/**
 * 📊 센터별 강습 과정 통계 API
 * GET /api/courses/center-stats
 * - 센터별 강습 과정 운영 현황 통계
 * - 수익, 만족도, 승인률 등 종합 분석
 */
router.get('/center-stats', authMiddleware, requireRole(['superAdmin']), async (req: AuthRequest, res: Response) => {
  try {
    // 간단한 더미 통계 데이터로 우선 응답
    const dummyCenterStats = [
      {
        centerId: 'center1',
        centerName: 'JJ 수영장 강남점',
        region: '서울 강남구',
        totalCourses: 8,
        activeCourses: 7,
        totalEnrollments: 45,
        totalRevenue: 3600000,
        averageSatisfaction: 4.4,
        approvalRate: 87.5
      },
      {
        centerId: 'center2',
        centerName: 'JJ 수영장 홍대점',
        region: '서울 마포구',
        totalCourses: 6,
        activeCourses: 5,
        totalEnrollments: 32,
        totalRevenue: 2400000,
        averageSatisfaction: 4.2,
        approvalRate: 83.3
      },
      {
        centerId: 'center3',
        centerName: 'JJ 수영장 잠실점',
        region: '서울 송파구',
        totalCourses: 10,
        activeCourses: 9,
        totalEnrollments: 58,
        totalRevenue: 4200000,
        averageSatisfaction: 4.6,
        approvalRate: 90.0
      }
    ];
    
    res.json({
      success: true,
      data: dummyCenterStats
    });
    
  } catch (error) {
    console.error('센터별 강습 통계 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '센터별 강습 통계 조회 중 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    });
  }
});

/**
 * ✅ 강습 과정 승인/거부 API
 * PUT /api/courses/:id/approval
 * - 최고관리자가 강습 과정 승인/거부
 */
router.put('/:id/approval', authMiddleware, requireRole(['superAdmin']), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { action, reason } = req.body;
    void reason;
    
    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 액션입니다. (approve 또는 reject)'
      });
    }
    
    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: '강습 과정을 찾을 수 없습니다.'
      });
    }
    
    // 승인 상태 업데이트
    // 승인/거부 대신 활성/비활성 상태로 관리
    course.isActive = action === 'approve';
    
    await course.save();
    
    res.json({
      success: true,
      message: `강습 과정이 성공적으로 ${action === 'approve' ? '승인' : '거부'}되었습니다.`,
      data: course
    });
    
  } catch (error) {
    console.error('강습 과정 승인 처리 오류:', error);
    res.status(500).json({
      success: false,
      message: '강습 과정 승인 처리 중 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    });
  }
});

/**
 * 강좌별 강습법 지정 및 순서 관리 API
 * PUT /api/courses/:id/teaching-methods
 * - 강사나 센터 관리자가 초급/중급/상급 강좌의 강습법을 지정하고 순서를 설정
 */
router.put('/:id/teaching-methods', authMiddleware, requireRole(['instructor', 'centerAdmin', 'superAdmin']), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { teachingMethods } = req.body;

    if (!Array.isArray(teachingMethods)) {
      return res.status(400).json({
        success: false,
        message: 'teachingMethods는 배열이어야 합니다.'
      });
    }

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: '강좌를 찾을 수 없습니다.'
      });
    }

    // 권한 확인: 강사는 자신의 강좌만, 센터 관리자는 자신의 센터 강좌만 수정 가능
    if (req.user.userType === 'instructor') {
      if (course.instructor.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: '자신의 강좌만 수정할 수 있습니다.'
        });
      }
    } else if (req.user.userType === 'centerAdmin') {
      const userCenterId = req.user.centerId || req.user.centerAdminInfo?.managedCenters?.[0];
      if (!userCenterId || course.centerId.toString() !== userCenterId.toString()) {
        return res.status(403).json({
          success: false,
          message: '자신의 센터 강좌만 수정할 수 있습니다.'
        });
      }
    }

    // 강습법 유효성 검증
    const TeachingMethod = (await import('../models/TeachingMethod')).TeachingMethod;
    for (const tm of teachingMethods) {
      if (!tm.methodId || typeof tm.order !== 'number') {
        return res.status(400).json({
          success: false,
          message: '각 강습법에는 methodId와 order가 필요합니다.'
        });
      }

      // 강습법 존재 확인
      const method = await TeachingMethod.findById(tm.methodId);
      if (!method) {
        return res.status(404).json({
          success: false,
          message: `강습법을 찾을 수 없습니다: ${tm.methodId}`
        });
      }

      // 강사가 자신의 강습법 또는 최고 관리자 강습법만 사용할 수 있도록 검증
      if (req.user.userType === 'instructor') {
        const isMyMethod = method.createdBy && method.createdBy.toString() === req.user._id.toString();
        const isSuperAdminMethod = method.createdByRole === 'superAdmin';
        if (!isMyMethod && !isSuperAdminMethod) {
          return res.status(403).json({
            success: false,
            message: `다른 강사의 강습법은 사용할 수 없습니다: ${method.name}`
          });
        }
      }
    }

    // 강좌의 teachingMethods 업데이트
    course.teachingMethods = teachingMethods.map((tm: any) => ({
      methodId: new mongoose.Types.ObjectId(tm.methodId),
      order: tm.order,
      isRequired: tm.isRequired !== undefined ? tm.isRequired : true
    }));

    await course.save();

    // 업데이트된 강좌 정보 반환 (강습법 정보 포함)
    const updatedCourse = await Course.findById(id)
      .populate('teachingMethods.methodId')
      .populate('instructor', 'name userId')
      .populate('centerId', 'name');

    res.json({
      success: true,
      message: '강좌별 강습법이 성공적으로 지정되었습니다.',
      data: updatedCourse
    });
  } catch (error) {
    console.error('강좌별 강습법 지정 오류:', error);
    res.status(500).json({
      success: false,
      message: '강좌별 강습법 지정 중 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    });
  }
});

/**
 * 강좌별 강습법 조회 API
 * GET /api/courses/:id/teaching-methods
 * - 특정 강좌에 지정된 강습법 목록 조회
 */
router.get('/:id/teaching-methods', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const course = await Course.findById(id)
      .populate('teachingMethods.methodId')
      .select('teachingMethods level name');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: '강좌를 찾을 수 없습니다.'
      });
    }

    // 강습법을 order 순서대로 정렬
    const sortedMethods = (course.teachingMethods || []).sort((a: any, b: any) => {
      return (a.order || 0) - (b.order || 0);
    });

    res.json({
      success: true,
      message: '강좌별 강습법 조회 성공',
      data: {
        courseId: course._id,
        courseName: course.name,
        level: course.level,
        teachingMethods: sortedMethods.map((tm: any) => ({
          methodId: tm.methodId?._id || tm.methodId,
          methodName: tm.methodId?.name,
          methodDescription: tm.methodId?.description,
          methodCategory: tm.methodId?.category,
          methodLevel: tm.methodId?.level,
          order: tm.order,
          isRequired: tm.isRequired,
          steps: tm.methodId?.steps || [],
          tips: tm.methodId?.tips || [],
          checklist: tm.methodId?.checklist || []
        }))
      }
    });
  } catch (error) {
    console.error('강좌별 강습법 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '강좌별 강습법 조회 중 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    });
  }
});

export default router; 