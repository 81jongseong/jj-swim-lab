import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Booking } from '../models/Booking';
import { User } from '../models/User';
import { Course } from '../models/Course';

// Request 타입 확장
interface AuthRequest extends Request {
  user?: any;
}

const router: Router = Router();

// 인증 미들웨어
const authenticateToken = (req: AuthRequest, res: Response, next: Function) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: '인증 토큰이 필요합니다.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    req.user = decoded;
    return next();
  } catch (error) {
    return res.status(401).json({ error: '유효하지 않은 토큰입니다.' });
  }
};

// 관리자 권한 확인
const requireAdmin = async (req: AuthRequest, res: Response, next: Function) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user || user.userType !== 'admin') {
      return res.status(403).json({ error: '관리자 권한이 필요합니다.' });
    }
    return next();
  } catch (error) {
    return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
};

// 모든 예약 조회
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { date, status, user } = req.query;
    const filter: any = {};
    
    if (date) {
      const startDate = new Date(date as string);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      filter.date = { $gte: startDate, $lt: endDate };
    }
    
    if (status) filter.status = status;
    
    // 일반 사용자는 본인 예약만 조회 가능
    const currentUser = await User.findById(req.user.userId);
    if (currentUser?.userType !== 'admin') {
      filter.user = req.user.userId;
    } else if (user) {
      filter.user = user;
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
    const currentUser = await User.findById(req.user.userId);
    if (currentUser?.userType !== 'admin' && booking.user.toString() !== req.user.userId) {
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
    const currentUser = await User.findById(req.user.userId);
    if (currentUser?.userType !== 'admin' && booking.user.toString() !== req.user.userId) {
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
    const currentUser = await User.findById(req.user.userId);
    if (currentUser?.userType !== 'admin' && booking.user.toString() !== req.user.userId) {
      return res.status(403).json({ error: '취소 권한이 없습니다.' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ error: '이미 취소된 예약입니다.' });
    }

    booking.status = 'cancelled';
    await booking.save();

    return res.json({ message: '예약이 취소되었습니다.' });
  } catch (error) {
    console.error('예약 취소 오류:', error);
    return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 예약 상태 변경 (관리자만)
router.patch('/:id/status', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
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
        const conflictingBooking = bookings.find(booking => 
          booking.startTime < nextTime && booking.endTime > time
        );
        
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

export default router; 