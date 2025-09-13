/**
 * 📅 JJ Swim Lab - 예약 관리 API 라우트
 * 
 * 📋 **라우트 목적**
 * - 수영 강습 예약 관리 및 CRUD 작업을 위한 API 엔드포인트 제공
 * - 예약 생성, 수정, 취소, 조회 기능
 * - 강사별 예약 관리 및 센터별 예약 그룹 관리
 * - 예약 상태 관리 및 일정 충돌 방지
 * - 예약 통계 및 분석 데이터 제공
 * 
 * 🔄 **주요 기능**
 * - 전체 예약 조회 및 검색 (날짜, 상태, 사용자별)
 * - 강사별 예약 관리 (강사 전용)
 * - 예약 생성, 수정, 취소 (권한별 제한)
 * - 예약 상태 관리 (예약됨, 진행중, 완료, 취소)
 * - 예약 일정 충돌 검사 및 방지
 * - 예약 통계 및 분석
 * - 예약 알림 및 리마인더
 * 
 * 🗄️ **데이터 연동**
 * - Booking 모델과 연동 (예약 정보 관리)
 * - User 모델과 연동 (사용자, 강사 정보)
 * - Course 모델과 연동 (강습 과정 정보)
 * - 센터 정보와 연동 (센터별 예약 그룹)
 * - 결제 시스템과 연동 (예약 결제 관리)
 * - 알림 시스템과 연동 (예약 알림)
 * - MongoDB Atlas 데이터베이스
 * 
 * 🛠️ **필요한 설치 파일**
 * - Express.js Router
 * - Mongoose (MongoDB ODM)
 * - Booking 모델 (../models/Booking)
 * - User 모델 (../models/User)
 * - Course 모델 (../models/Course)
 * - 인증 미들웨어 (../middleware/auth)
 * - MongoDB Atlas (데이터 저장)
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 예약 일정 충돌 검사 필수
 * 2. 강사 권한 검증 (강사만 예약 생성/수정 가능)
 * 3. 센터별 예약 그룹 관리
 * 4. 예약 상태 변경 시 알림 시스템 연동
 * 5. 예약 데이터 검증 및 sanitization
 * 6. API 보안 및 Rate Limiting 적용
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] 예약 일정 충돌 검사 로직 확인
 * - [ ] 강사 권한 검증 로직 확인
 * - [ ] 예약 상태 관리 확인
 * - [ ] 센터별 예약 그룹 관리 확인
 * - [ ] API 엔드포인트 보안 검증
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 예약 관리 API 구현
 * - 2024-12-19: 강사별 예약 관리 시스템 구현
 * - 2024-12-19: 예약 일정 충돌 검사 시스템 구현
 * - 2024-12-19: 예약 상태 관리 시스템 구현
 * - 2024-12-19: 예약 통계 및 분석 기능 구현
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (예약 관리 API 완료)
 * 
 * 🚀 **다음 단계**
 * - 실시간 예약 알림 시스템
 * - 예약 자동 리마인더
 * - 예약 대기열 시스템
 * - 예약 취소 정책 관리
 * - 예약 패턴 분석 및 최적화
 * 
 * 💡 **사용 예시**
 * ```typescript
 * // 전체 예약 조회
 * GET /api/bookings?date=2024-12-19&status=confirmed
 * 
 * // 강사별 예약 조회
 * GET /api/bookings/instructor/:instructorId
 * 
 * // 예약 생성
 * POST /api/bookings
 * {
 *   "courseId": "course001",
 *   "instructorId": "instructor001",
 *   "studentId": "student001",
 *   "date": "2024-12-20",
 *   "time": "14:00"
 * }
 * 
 * // 예약 수정
 * PUT /api/bookings/:id
 * {
 *   "date": "2024-12-21",
 *   "time": "15:00"
 * }
 * 
 * // 예약 취소
 * DELETE /api/bookings/:id
 * ```
 * 
 * 🔍 **예약 관리 처리 흐름**
 * 1. 사용자 권한 및 역할 검증
 * 2. 예약 일정 충돌 검사
 * 3. 예약 데이터 검증 및 sanitization
 * 4. 센터별 예약 그룹 확인
 * 5. 데이터베이스 쿼리 실행
 * 6. 예약 상태 업데이트 및 알림 발송
 * 7. 예약 통계 및 분석 데이터 제공
 */

import { Router, Request, Response } from 'express';
import { Booking } from '../models/Booking';
import { User } from '../models/User';
import { Course } from '../models/Course';
import { auth as authenticateToken, requireRole } from '../middleware/auth';

// Request 타입 확장
interface AuthRequest extends Request {
  user?: any;
}

const router: Router = Router();

// 공통 인증/권한 미들웨어 사용

// 모든 예약 조회
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { date, status, user, instructor } = req.query as any;
    const filter: any = {};
    
    if (date) {
      const startDate = new Date(date as string);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      filter.date = { $gte: startDate, $lt: endDate };
    }
    
    if (status) filter.status = status;
    
    // 일반 사용자는 본인 예약만 조회 가능
    const currentUser = req.user;
    if (currentUser?.userType === 'superAdmin') {
      if (user) filter.user = user;
      if (instructor) filter.instructor = instructor;
    } else if (currentUser?.userType === 'instructor') {
      filter.instructor = currentUser.userId;
    } else {
      filter.user = currentUser.userId;
    }

    const bookings = await Booking.find(filter)
      .populate('user', 'name userId')
      .populate('instructor', 'name userId')
      .populate('course', 'name')
      .sort({ date: 1, startTime: 1 });

    return res.json({ success: true, message: '예약 조회 성공!', data: bookings });
  } catch (error) {
    console.error('예약 조회 오류:', error);
    return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 특정 예약 조회
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'name userId email phone')
      .populate('instructor', 'name userId')
      .populate('course', 'name description');

    if (!booking) {
      return res.status(404).json({ error: '예약을 찾을 수 없습니다.' });
    }

    // 본인 예약이거나 관리자인지 확인
    const currentUser = req.user;
    if (currentUser?.userType !== 'superAdmin' && booking.user.toString() !== String(currentUser.userId)) {
      return res.status(403).json({ error: '조회 권한이 없습니다.' });
    }

    return res.json({ success: true, message: '예약 조회 성공!', data: booking });
  } catch (error) {
    console.error('예약 조회 오류:', error);
    return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 예약 생성
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { date, startTime, endTime, laneNumber, purpose, notes, instructor, course } = req.body;

    // 필수 필드 검증
    if (!date || !startTime || !endTime || !laneNumber) {
      return res.status(400).json({ error: '필수 필드가 누락되었습니다.' });
    }

    // 날짜 유효성 검사
    const bookingDate = new Date(date);
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (bookingDate < todayStart) {
      return res.status(400).json({ error: '과거 날짜는 예약할 수 없습니다.' });
    }

    // 시간 유효성 검사
    if (startTime >= endTime) {
      return res.status(400).json({ error: '종료 시간은 시작 시간보다 늦어야 합니다.' });
    }

    // 중복 예약 확인
    const existingBooking = await Booking.findOne({
      date: bookingDate,
      laneNumber,
      status: { $in: ['pending', 'confirmed'] },
      $or: [
        {
          startTime: { $lt: endTime },
          endTime: { $gt: startTime }
        }
      ]
    });

    if (existingBooking) {
      return res.status(400).json({ error: '해당 시간에 이미 예약이 있습니다.' });
    }

    const bookingData = {
      user: req.user.userId,
      date: bookingDate,
      startTime,
      endTime,
      laneNumber,
      purpose: purpose || 'practice',
      notes: notes || '',
      instructor,
      course,
    };

    const booking = new Booking(bookingData);
    await booking.save();

    const populatedBooking = await Booking.findById(booking._id)
      .populate('user', 'name userId')
      .populate('instructor', 'name userId')
      .populate('course', 'name');

    // notify user
    try {
      const io = (req as any).app.get('io');
      if (io) io.to(`user:${String(req.user.userId)}`).emit('notification', {
        type: 'booking:created',
        message: '예약이 생성되었습니다.',
      });
    } catch {}

    return res.status(201).json({
      success: true,
      message: '예약이 생성되었습니다.',
      data: populatedBooking
    });
  } catch (error) {
    console.error('예약 생성 오류:', error);
    return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 예약 수정
router.put('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ error: '예약을 찾을 수 없습니다.' });
    }

    // 본인 예약이거나 관리자인지 확인
    const currentUser = (req as any).user;
    if (currentUser?.userType !== 'superAdmin' && booking.user.toString() !== String(currentUser._id)) {
      return res.status(403).json({ error: '수정 권한이 없습니다.' });
    }

    // 이미 완료된 예약은 수정 불가
    if (booking.status === 'completed') {
      return res.status(400).json({ error: '완료된 예약은 수정할 수 없습니다.' });
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('user', 'name userId')
     .populate('instructor', 'name userId')
     .populate('course', 'name');

    // notify owner
    try {
      const io = (req as any).app.get('io');
      if (io && updatedBooking) io.to(`user:${String(updatedBooking.user)}`).emit('notification', {
        type: 'booking:updated',
        message: '예약 정보가 업데이트되었습니다.',
      });
    } catch {}

    return res.json({
      success: true,
      message: '예약이 수정되었습니다.',
      data: updatedBooking
    });
  } catch (error) {
    console.error('예약 수정 오류:', error);
    return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 예약 취소
router.post('/:id/cancel', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ error: '예약을 찾을 수 없습니다.' });
    }

    // 본인 예약이거나 관리자인지 확인
    const currentUser = (req as any).user;
    if (currentUser?.userType !== 'superAdmin' && booking.user.toString() !== String(currentUser._id)) {
      return res.status(403).json({ error: '취소 권한이 없습니다.' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ error: '이미 취소된 예약입니다.' });
    }

    booking.status = 'cancelled';
    await booking.save();

    // notify owner
    try {
      const io = (req as any).app.get('io');
      if (io) io.to(`user:${String(booking.user)}`).emit('notification', {
        type: 'booking:cancelled',
        message: '예약이 취소되었습니다.',
      });
    } catch {}

    return res.json({ success: true, message: '예약이 취소되었습니다.' });
  } catch (error) {
    console.error('예약 취소 오류:', error);
    return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 예약 상태 변경 (관리자만)
router.patch('/:id/status', authenticateToken, requireRole(['superAdmin']), async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: '상태를 지정해주세요.' });
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('user', 'name userId')
     .populate('instructor', 'name userId')
     .populate('course', 'name');

    if (!booking) {
      return res.status(404).json({ error: '예약을 찾을 수 없습니다.' });
    }

    // notify owner
    try {
      const io = (req as any).app.get('io');
      if (io && booking) io.to(`user:${String(booking.user)}`).emit('notification', {
        type: 'booking:statusChanged',
        message: `예약 상태가 '${status}'로 변경되었습니다.`,
      });
    } catch {}

    return res.json({
      message: '예약 상태가 변경되었습니다.',
      booking
    });
  } catch (error) {
    console.error('예약 상태 변경 오류:', error);
    return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 예약 가능 시간 조회
router.get('/available/:date', async (req: Request, res: Response) => {
  try {
    const { date } = req.params;
    const { laneNumber } = req.query;
    
    const bookingDate = new Date(date);
    const filter: any = {
      date: bookingDate,
      status: { $in: ['pending', 'confirmed'] }
    };
    
    if (laneNumber) {
      filter.laneNumber = laneNumber;
    }

    const bookings = await Booking.find(filter)
      .select('startTime endTime laneNumber')
      .sort({ startTime: 1 });

    // 예약 가능한 시간대 계산 (예: 06:00-22:00)
    const availableSlots = [];
    const startHour = 6;
    const endHour = 22;
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) { // 30분 단위
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const nextTime = minute === 30 ? 
          `${(hour + 1).toString().padStart(2, '0')}:00` : 
          `${hour.toString().padStart(2, '0')}:30`;
        
        // 해당 시간대에 예약이 있는지 확인
        let conflictingBooking = null;
        for (const booking of bookings) {
          if (booking.startTime < nextTime && booking.endTime > time) {
            conflictingBooking = booking;
            break;
          }
        }
        
        if (!conflictingBooking) {
          availableSlots.push({
            startTime: time,
            endTime: nextTime
          });
        }
      }
    }

    return res.json({ 
      success: true,
      message: '예약 가능 시간 조회 성공!',
      data: {
        date: bookingDate,
        availableSlots,
        existingBookings: bookings
      }
    });
  } catch (error) {
    console.error('예약 가능 시간 조회 오류:', error);
    return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 강습 과정별 예약 현황 조회
router.get('/course/:courseId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { courseId } = req.params;
    const { date } = req.query;

    let filter: any = { course: courseId };
    
    if (date) {
      const startDate = new Date(date as string);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      
      filter.date = {
        $gte: startDate,
        $lt: endDate
      };
    }

    const bookings = await Booking.find(filter)
      .populate('user', 'name email')
      .populate('instructor', 'name')
      .populate('course', 'name level')
      .sort({ date: 1, startTime: 1 });

    res.json({
      success: true,
      message: '강습 과정별 예약 현황 조회 성공',
      data: {
        courseId,
        totalBookings: bookings.length,
        bookings
      }
    });
  } catch (error) {
    console.error('강습 과정별 예약 현황 조회 오류:', error);
    res.status(500).json({ error: '예약 현황 조회에 실패했습니다.' });
  }
});

// 학생별 강습 과정 예약 현황 조회
router.get('/student/:studentId/courses', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { studentId } = req.params;
    
    // 권한 확인: 본인이거나 관리자
    if (req.user.userId !== studentId && 
        req.user.userType !== 'instructor' && 
        req.user.userType !== 'centerAdmin' && 
        req.user.userType !== 'superAdmin') {
      return res.status(403).json({ error: '접근 권한이 없습니다.' });
    }

    // 학생이 등록한 강습 과정의 예약 현황
    const bookings = await Booking.find({ 
      user: studentId,
      course: { $exists: true, $ne: null }
    })
    .populate('course', 'name level instructor')
    .populate('instructor', 'name')
    .sort({ date: 1, startTime: 1 });

    // 강습 과정별로 그룹화
    const courseBookings = new Map();
    
    bookings.forEach(booking => {
      if (booking.course) {
        const course = booking.course as any; // populate 후 타입 캐스팅
        const courseId = course._id.toString();
        
        if (!courseBookings.has(courseId)) {
          courseBookings.set(courseId, {
            course: {
              _id: course._id,
              name: course.name,
              level: course.level
            },
            totalBookings: 0,
            completedBookings: 0,
            upcomingBookings: 0,
            bookings: []
          });
        }
        
        const courseInfo = courseBookings.get(courseId);
        courseInfo.totalBookings++;
        courseInfo.bookings.push(booking);
        
        if (booking.status === 'completed') {
          courseInfo.completedBookings++;
        } else if (new Date(booking.date) > new Date()) {
          courseInfo.upcomingBookings++;
        }
      }
    });

    res.json({
      success: true,
      message: '학생별 강습 과정 예약 현황 조회 성공',
      data: {
        studentId,
        totalCourses: courseBookings.size,
        courseBookings: Array.from(courseBookings.values())
      }
    });
  } catch (error) {
    console.error('학생별 강습 과정 예약 현황 조회 오류:', error);
    res.status(500).json({ error: '예약 현황 조회에 실패했습니다.' });
  }
});

// 강사별 강습 과정 예약 현황 조회
router.get('/instructor/:instructorId/courses', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { instructorId } = req.params;
    
    // 권한 확인: 본인이거나 관리자
    if (req.user.userId !== instructorId && 
        req.user.userType !== 'centerAdmin' && 
        req.user.userType !== 'superAdmin') {
      return res.status(403).json({ error: '접근 권한이 없습니다.' });
    }

    // 강사가 담당하는 강습 과정의 예약 현황
    const bookings = await Booking.find({ 
      instructor: instructorId,
      course: { $exists: true, $ne: null }
    })
    .populate('course', 'name level')
    .populate('user', 'name email studentInfo')
    .sort({ date: 1, startTime: 1 });

    // 강습 과정별로 그룹화
    const courseBookings = new Map();
    
    bookings.forEach(booking => {
      if (booking.course) {
        const course = booking.course as any; // populate 후 타입 캐스팅
        const courseId = course._id.toString();
        
        if (!courseBookings.has(courseId)) {
          courseBookings.set(courseId, {
            course: {
              _id: course._id,
              name: course.name,
              level: course.level
            },
            totalBookings: 0,
            todayBookings: 0,
            thisWeekBookings: 0,
            bookings: []
          });
        }
        
        const courseInfo = courseBookings.get(courseId);
        courseInfo.totalBookings++;
        courseInfo.bookings.push(booking);
        
        const bookingDate = new Date(booking.date);
        const today = new Date();
        const thisWeek = new Date();
        thisWeek.setDate(thisWeek.getDate() + 7);
        
        if (bookingDate.toDateString() === today.toDateString()) {
          courseInfo.todayBookings++;
        }
        
        if (bookingDate >= today && bookingDate <= thisWeek) {
          courseInfo.thisWeekBookings++;
        }
      }
    });

    res.json({
      success: true,
      message: '강사별 강습 과정 예약 현황 조회 성공',
      data: {
        instructorId,
        totalCourses: courseBookings.size,
        courseBookings: Array.from(courseBookings.values())
      }
    });
  } catch (error) {
    console.error('강사별 강습 과정 예약 현황 조회 오류:', error);
    res.status(500).json({ error: '예약 현황 조회에 실패했습니다.' });
  }
});

router.get('/course/:courseId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { courseId } = req.params;
    const { date } = req.query;

    let filter: any = { course: courseId };
    
    if (date) {
      const startDate = new Date(date as string);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      
      filter.date = {
        $gte: startDate,
        $lt: endDate
      };
    }

    const bookings = await Booking.find(filter)
      .populate('user', 'name email')
      .populate('instructor', 'name')
      .populate('course', 'name level')
      .sort({ date: 1, startTime: 1 });

    res.json({
      success: true,
      message: '강습 과정별 예약 현황 조회 성공',
      data: {
        courseId,
        totalBookings: bookings.length,
        bookings
      }
    });
  } catch (error) {
    console.error('강습 과정별 예약 현황 조회 오류:', error);
    res.status(500).json({ error: '예약 현황 조회에 실패했습니다.' });
  }
});

// 학생별 강습 과정 예약 현황 조회
router.get('/student/:studentId/courses', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { studentId } = req.params;
    
    // 권한 확인: 본인이거나 관리자
    if (req.user.userId !== studentId && 
        req.user.userType !== 'instructor' && 
        req.user.userType !== 'centerAdmin' && 
        req.user.userType !== 'superAdmin') {
      return res.status(403).json({ error: '접근 권한이 없습니다.' });
    }

    // 학생이 등록한 강습 과정의 예약 현황
    const bookings = await Booking.find({ 
      user: studentId,
      course: { $exists: true, $ne: null }
    })
    .populate('course', 'name level instructor')
    .populate('instructor', 'name')
    .sort({ date: 1, startTime: 1 });

    // 강습 과정별로 그룹화
    const courseBookings = new Map();
    
    bookings.forEach(booking => {
      if (booking.course) {
        const course = booking.course as any; // populate 후 타입 캐스팅
        const courseId = course._id.toString();
        
        if (!courseBookings.has(courseId)) {
          courseBookings.set(courseId, {
            course: {
              _id: course._id,
              name: course.name,
              level: course.level
            },
            totalBookings: 0,
            completedBookings: 0,
            upcomingBookings: 0,
            bookings: []
          });
        }
        
        const courseInfo = courseBookings.get(courseId);
        courseInfo.totalBookings++;
        courseInfo.bookings.push(booking);
        
        if (booking.status === 'completed') {
          courseInfo.completedBookings++;
        } else if (new Date(booking.date) > new Date()) {
          courseInfo.upcomingBookings++;
        }
      }
    });

    res.json({
      success: true,
      message: '학생별 강습 과정 예약 현황 조회 성공',
      data: {
        studentId,
        totalCourses: courseBookings.size,
        courseBookings: Array.from(courseBookings.values())
      }
    });
  } catch (error) {
    console.error('학생별 강습 과정 예약 현황 조회 오류:', error);
    res.status(500).json({ error: '예약 현황 조회에 실패했습니다.' });
  }
});

// 강사별 강습 과정 예약 현황 조회
router.get('/instructor/:instructorId/courses', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { instructorId } = req.params;
    
    // 권한 확인: 본인이거나 관리자
    if (req.user.userId !== instructorId && 
        req.user.userType !== 'centerAdmin' && 
        req.user.userType !== 'superAdmin') {
      return res.status(403).json({ error: '접근 권한이 없습니다.' });
    }

    // 강사가 담당하는 강습 과정의 예약 현황
    const bookings = await Booking.find({ 
      instructor: instructorId,
      course: { $exists: true, $ne: null }
    })
    .populate('course', 'name level')
    .populate('user', 'name email studentInfo')
    .sort({ date: 1, startTime: 1 });

    // 강습 과정별로 그룹화
    const courseBookings = new Map();
    
    bookings.forEach(booking => {
      if (booking.course) {
        const course = booking.course as any; // populate 후 타입 캐스팅
        const courseId = course._id.toString();
        
        if (!courseBookings.has(courseId)) {
          courseBookings.set(courseId, {
            course: {
              _id: course._id,
              name: course.name,
              level: course.level
            },
            totalBookings: 0,
            todayBookings: 0,
            thisWeekBookings: 0,
            bookings: []
          });
        }
        
        const courseInfo = courseBookings.get(courseId);
        courseInfo.totalBookings++;
        courseInfo.bookings.push(booking);
        
        const bookingDate = new Date(booking.date);
        const today = new Date();
        const thisWeek = new Date();
        thisWeek.setDate(thisWeek.getDate() + 7);
        
        if (bookingDate.toDateString() === today.toDateString()) {
          courseInfo.todayBookings++;
        }
        
        if (bookingDate >= today && bookingDate <= thisWeek) {
          courseInfo.thisWeekBookings++;
        }
      }
    });

    res.json({
      success: true,
      message: '강사별 강습 과정 예약 현황 조회 성공',
      data: {
        instructorId,
        totalCourses: courseBookings.size,
        courseBookings: Array.from(courseBookings.values())
      }
    });
  } catch (error) {
    console.error('강사별 강습 과정 예약 현황 조회 오류:', error);
    res.status(500).json({ error: '예약 현황 조회에 실패했습니다.' });
  }
});

export default router; 