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
    const currentUser = (req as any).user;
    if (currentUser?.userType === 'superAdmin') {
      if (user) filter.user = user;
      if (instructor) filter.instructor = instructor;
    } else if (currentUser?.userType === 'instructor') {
      filter.instructor = currentUser._id;
    } else {
      filter.user = currentUser._id;
    }

    const bookings = await Booking.find(filter)
      .populate('user', 'name userId')
      .populate('instructor', 'name userId')
      .populate('course', 'name')
      .sort({ date: 1, startTime: 1 });

    return res.json({ bookings });
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
    const currentUser = (req as any).user;
    if (currentUser?.userType !== 'superAdmin' && booking.user.toString() !== String(currentUser._id)) {
      return res.status(403).json({ error: '조회 권한이 없습니다.' });
    }

    return res.json({ booking });
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
      user: (req as any).user._id,
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
      if (io) io.to(`user:${String((req as any).user._id)}`).emit('notification', {
        type: 'booking:created',
        message: '예약이 생성되었습니다.',
      });
    } catch {}

    return res.status(201).json({
      message: '예약이 생성되었습니다.',
      booking: populatedBooking
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
      message: '예약이 수정되었습니다.',
      booking: updatedBooking
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

    return res.json({ message: '예약이 취소되었습니다.' });
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
      date: bookingDate,
      availableSlots,
      existingBookings: bookings
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
    if (req.user._id !== studentId && 
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
    if (req.user._id !== instructorId && 
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
    if (req.user._id !== studentId && 
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
    if (req.user._id !== instructorId && 
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