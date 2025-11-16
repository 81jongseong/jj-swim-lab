 /**
 * 📅 JJ Swim Lab - 예약관리 API 라우트
 * 
 * 📋 **API 목적**
 * - 예약 관리 (레인대여, 개인레슨) API 엔드포인트 제공
 * - 예약 신청, 수락, 취소, 완료 처리
 * - 강사 배정 및 스케줄 관리
 * - 예약 현황 및 통계 조회
 * 
 * 🔄 **주요 기능**
 * - 개인레슨 신청/수락/취소
 * - 레인대여 신청/승인/취소
 * - 강사 배정 및 스케줄 관리
 * - 예약 현황 대시보드
 * - 예약 통계 및 분석
 * 
 * 🗄️ **데이터 연동**
 * - PersonalLesson 모델과 연동
 * - LaneRental 모델과 연동
 * - User 모델과 연동 (강사, 학생)
 * - Center 모델과 연동
 * - MongoDB Atlas 데이터베이스
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 권한 검증 (센터 관리자만 접근 가능)
 * 2. 예약 시간 충돌 방지
 * 3. 강사 스케줄 검증
 * 4. 결제 상태 확인
 * 5. 알림 시스템 연동
 * 
 * 📅 **개발 히스토리**
 * - 2025-01-12: 초기 예약관리 API 구현
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2025-01-12
 * - 상태: ✅ 완성
 */

import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import { PersonalLesson } from '../models/PersonalLesson';
import { LaneRental } from '../models/LaneRental';
import { User } from '../models/User';
import { authMiddleware } from '../middleware/auth';
import { requireInstructorOrAdmin } from '../middleware/role';
import { LaneAllocationService } from '../services/laneAllocationService';

const router = express.Router();

// 모든 라우트에 인증 및 강사/관리자 권한 적용
router.use(authMiddleware);
router.use(requireInstructorOrAdmin);

// ⭐ 예약 목록 조회 (개인레슨 + 레인대여 통합)
router.get('/', async (req: any, res: Response) => {
  try {
    const user = req.user;
    const { status, date, type } = req.query;
    
    // 센터 ID 가져오기 (강사 또는 센터 관리자)
    let centerId = user.centerId;
    
    // 강사인 경우 instructorInfo에서 센터 ID 가져오기
    if (!centerId && user.userType === 'instructor') {
      const userDoc = await User.findById(user._id || user.id);
      centerId = userDoc?.centerId || userDoc?.instructorInfo?.assignedCenters?.[0];
    }
    
    if (!centerId) {
      return res.status(400).json({
        success: false,
        message: '센터 정보를 찾을 수 없습니다.'
      });
    }
    
    // 쿼리 조건 (centerId를 ObjectId로 변환)
    const centerIdObj = typeof centerId === 'string' ? new mongoose.Types.ObjectId(centerId) : centerId;
    const personalLessonQuery: any = { centerId: centerIdObj };
    const laneRentalQuery: any = { centerId: centerIdObj };
    
    if (status && status !== 'all') {
      personalLessonQuery.status = status;
      laneRentalQuery.status = status;
    }
    
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 1);
      personalLessonQuery.date = { $gte: startDate, $lt: endDate };
      laneRentalQuery.date = { $gte: startDate, $lt: endDate };
    }
    
    // ⭐ 강사인 경우 자신에게 배정된 개인레슨만 조회
    if (user.userType === 'instructor') {
      personalLessonQuery.instructorId = user._id || user.id;
    }
    
    // 개인레슨 조회 (startTime이 있는 데이터만)
    const personalLessons = type === 'lane-rental' ? [] : await PersonalLesson.find({
      ...personalLessonQuery,
      startTime: { $exists: true, $nin: [null, ''] }
    })
      .populate('studentId', 'name email phone')
      .populate('instructorId', 'name email phone')
      .sort({ date: -1, startTime: 1 });
    
    // ⭐ 강사인 경우 레인대여는 조회하지 않음 (센터 관리자만 처리)
    // 레인대여 조회 (startTime이 있는 데이터만, 강사는 제외)
    const laneRentals = (type === 'personal-lesson' || user.userType === 'instructor') ? [] : await LaneRental.find({
      ...laneRentalQuery,
      startTime: { $exists: true, $nin: [null, ''] }
    })
      .populate('userId', 'name email phone')
      .sort({ date: -1, startTime: 1 });
    
    // 통합 예약 목록 생성
    const bookings = [
      ...personalLessons.map((lesson: any) => ({
        _id: lesson._id,
        type: 'personal-lesson',
        student: lesson.studentId,
        instructor: lesson.instructorId,
        date: lesson.date,
        startTime: lesson.startTime || lesson.time,
        endTime: lesson.endTime,
        duration: lesson.duration,
        status: lesson.status,
        lessonType: lesson.lessonType,
        skillLevel: lesson.skillLevel,
        goals: lesson.goals,
        notes: lesson.notes,
        poolType: lesson.poolType || 'mainPool',
        laneNumber: lesson.assignedLane,
        createdAt: lesson.createdAt
      })),
      ...laneRentals.map((rental: any) => ({
        _id: rental._id,
        type: 'lane-rental',
        user: rental.userId,
        date: rental.date,
        startTime: rental.startTime,
        endTime: rental.endTime,
        duration: rental.duration,
        status: rental.status,
        laneNumber: rental.laneNumber,
        poolType: rental.poolType,
        purpose: rental.purpose,
        notes: rental.notes,
        price: rental.price,
        paymentStatus: rental.paymentStatus,
        createdAt: rental.createdAt
      }))
    ].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      if (dateA !== dateB) return dateB - dateA;
      return (a.startTime || '').localeCompare(b.startTime || '');
    });
    
    res.json({
      success: true,
      message: '예약 목록 조회 성공',
      data: {
        bookings,
        total: bookings.length,
        personalLessons: personalLessons.length,
        laneRentals: laneRentals.length
      }
    });
  } catch (error: any) {
    console.error('예약 목록 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: error.message || '서버 오류가 발생했습니다.'
    });
  }
});

// 예약 현황 대시보드 조회
router.get('/dashboard', async (req: any, res: Response) => {
  try {
    console.log('📊 대시보드 요청 받음:', {
      userId: req.user?.id,
      userType: req.user?.userType,
      centerId: req.user?.centerId,
      hasToken: !!req.headers.authorization
    });
    
    const centerId = req.user.centerId;
    
    // 오늘 날짜
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // 이번 주 시작일
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    
    // 이번 주 종료일
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    
    // 개인레슨 통계
    const personalLessonStats = await PersonalLesson.aggregate([
      { $match: { centerId: centerId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // 레인대여 통계
    const laneRentalStats = await LaneRental.aggregate([
      { $match: { centerId: centerId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // 오늘 예약 현황
    const todayBookings = await PersonalLesson.find({
      centerId: centerId,
      scheduledDate: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    }).populate('student instructor', 'name email phone');
    
    const todayRentals = await LaneRental.find({
      centerId: centerId,
      rentalDate: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    }).populate('renter', 'name email phone');
    
    // 이번 주 예약 현황
    const weekBookings = await PersonalLesson.find({
      centerId: centerId,
      scheduledDate: {
        $gte: weekStart,
        $lte: weekEnd
      }
    }).populate('student instructor', 'name email phone');
    
    const weekRentals = await LaneRental.find({
      centerId: centerId,
      rentalDate: {
        $gte: weekStart,
        $lte: weekEnd
      }
    }).populate('renter', 'name email phone');
    
    res.json({
      success: true,
      data: {
        personalLessonStats,
        laneRentalStats,
        todayBookings,
        todayRentals,
        weekBookings,
        weekRentals
      }
    });
  } catch (error) {
    console.error('예약 현황 조회 오류:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 개인레슨 목록 조회
router.get('/personal-lessons', async (req: any, res: Response) => {
  try {
    const centerId = req.user.centerId;
    const { status, date, instructor } = req.query;
    
    const query: any = { centerId };
    
    if (status) {
      query.status = status;
    }
    
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 1);
      query.scheduledDate = { $gte: startDate, $lt: endDate };
    }
    
    if (instructor) {
      query.instructor = instructor;
    }
    
    const personalLessons = await PersonalLesson.find(query)
      .populate('student', 'name email phone')
      .populate('instructor', 'name email phone')
      .sort({ scheduledDate: -1, startTime: 1 });
    
    res.json({
      success: true,
      data: personalLessons
    });
  } catch (error) {
    console.error('개인레슨 조회 오류:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// ⭐ 예약 상태 변경 (통합 엔드포인트)
router.put('/:id', async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    let { status } = req.body;
    
    // status 값 변환 (confirmed -> approved)
    if (status === 'confirmed') {
      status = 'approved';
    }
    
    // 유효한 status 값 확인
    const validStatuses = ['pending', 'approved', 'rejected', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `유효하지 않은 상태 값입니다: ${status}`
      });
    }
    
    // 개인레슨인지 레인대여인지 확인
    const personalLesson = await PersonalLesson.findById(id);
    if (personalLesson) {
      personalLesson.status = status;
      await personalLesson.save();
      return res.json({
        success: true,
        message: '예약 상태가 변경되었습니다.',
        data: personalLesson
      });
    }
    
    const laneRental = await LaneRental.findById(id);
    if (laneRental) {
      laneRental.status = status;
      await laneRental.save();
      return res.json({
        success: true,
        message: '예약 상태가 변경되었습니다.',
        data: laneRental
      });
    }
    
    return res.status(404).json({
      success: false,
      message: '예약을 찾을 수 없습니다.'
    });
  } catch (error: any) {
    console.error('예약 상태 변경 오류:', error);
    res.status(500).json({
      success: false,
      message: error.message || '서버 오류가 발생했습니다.'
    });
  }
});

// 개인레슨 수락/거절
router.patch('/personal-lessons/:id/status', async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { status, instructorId, notes } = req.body;
    
    const personalLesson = await PersonalLesson.findById(id);
    if (!personalLesson) {
      return res.status(404).json({ success: false, message: '개인레슨을 찾을 수 없습니다.' });
    }
    
    // 상태에 따른 처리
    if (status === 'accepted') {
      if (!instructorId) {
        return res.status(400).json({ success: false, message: '강사 ID가 필요합니다.' });
      }
      
      // 강사 스케줄 충돌 확인
      const conflict = await PersonalLesson.findOne({
        instructorId: instructorId,
        date: personalLesson.date,
        time: personalLesson.time,
        status: { $in: ['pending', 'approved', 'completed'] }
      });
      
      if (conflict) {
        return res.status(400).json({ success: false, message: '강사 스케줄이 충돌합니다.' });
      }
      
      personalLesson.instructorId = instructorId;
    }
    
    personalLesson.status = status;
    if (notes) {
      personalLesson.specialRequests = notes;
    }
    
    await personalLesson.save();
    
    res.json({
      success: true,
      message: '개인레슨 상태가 변경되었습니다.',
      data: personalLesson
    });
  } catch (error) {
    console.error('개인레슨 상태 변경 오류:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 레인대여 목록 조회
router.get('/lane-rentals', async (req: any, res: Response) => {
  try {
    const centerId = req.user.centerId;
    const { status, date } = req.query;
    
    const query: any = { centerId };
    
    if (status) {
      query.status = status;
    }
    
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 1);
      query.rentalDate = { $gte: startDate, $lt: endDate };
    }
    
    const laneRentals = await LaneRental.find(query)
      .populate('renter', 'name email phone')
      .populate('approval.approvedBy', 'name email')
      .sort({ rentalDate: -1, startTime: 1 });
    
    res.json({
      success: true,
      data: laneRentals
    });
  } catch (error) {
    console.error('레인대여 조회 오류:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 레인대여 승인/거절
router.patch('/lane-rentals/:id/status', async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    void notes;
    
    const laneRental = await LaneRental.findById(id);
    if (!laneRental) {
      return res.status(404).json({ success: false, message: '레인대여를 찾을 수 없습니다.' });
    }
    
    if (status === 'approved') {
      // 레인 사용 시간 충돌 확인
      const conflict = await LaneRental.findOne({
        centerId: laneRental.centerId,
        date: laneRental.date,
        startTime: laneRental.startTime,
        endTime: laneRental.endTime,
        laneNumber: laneRental.laneNumber,
        status: { $in: ['pending', 'approved', 'completed'] }
      });
      
      if (conflict) {
        return res.status(400).json({ success: false, message: '레인 사용 시간이 충돌합니다.' });
      }
    }
    
    laneRental.status = status;
    await laneRental.save();
    
    res.json({
      success: true,
      message: '레인대여 상태가 변경되었습니다.',
      data: laneRental
    });
  } catch (error) {
    console.error('레인대여 상태 변경 오류:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 레인대여 레인 번호 변경
router.patch('/lane-rentals/:id/lane', async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { laneNumber } = req.body;
    const laneRental = await LaneRental.findById(id);
    if (!laneRental) {
      return res.status(404).json({ success: false, message: '레인대여를 찾을 수 없습니다.' });
    }
    const newLane = Number(laneNumber);
    if (!newLane || isNaN(newLane) || newLane <= 0) {
      return res.status(400).json({ success: false, message: '올바르지 않은 레인 번호입니다.' });
    }
    // 충돌 검사
    const conflict = await LaneRental.findOne({
      centerId: laneRental.centerId,
      date: laneRental.date,
      startTime: laneRental.startTime,
      endTime: laneRental.endTime,
      laneNumber: newLane,
      _id: { $ne: laneRental._id },
      status: { $in: ['pending', 'approved', 'completed'] }
    });
    if (conflict) {
      return res.status(400).json({ success: false, message: '해당 시간대에 선택한 레인이 이미 사용 중입니다.' });
    }
    laneRental.laneNumber = newLane;
    await laneRental.save();
    return res.json({ success: true, message: '레인 번호가 변경되었습니다.', data: laneRental });
  } catch (error) {
    console.error('레인 번호 변경 오류:', error);
    return res.status(500).json({ success: false, message: '레인 번호 변경 중 오류가 발생했습니다.' });
  }
});

// 강사 목록 조회 (배정용)
router.get('/instructors', async (req: any, res: Response) => {
  try {
    console.log('👨‍🏫 강사 목록 요청 받음:', {
      userId: req.user?.id,
      userType: req.user?.userType,
      centerId: req.user?.centerId,
      hasToken: !!req.headers.authorization
    });
    
    const centerId = req.user.centerId;
    
    const instructors = await User.find({
      userType: 'instructor',
      centerId: centerId
    }).select('name email phone instructorInfo');

    res.json({
      success: true,
      data: instructors
    });
  } catch (error) {
    console.error('강사 목록 조회 오류:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 예약 통계 조회
router.get('/statistics', async (req: any, res: Response) => {
  try {
    const centerId = req.user.centerId;
    const { period = 'week' } = req.query;
    
    let startDate: Date;
    const endDate: Date = new Date();
    
    switch (period) {
      case 'week':
        startDate = new Date();
        startDate.setDate(endDate.getDate() - 7);
        break;
      case 'month':
        startDate = new Date();
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case 'year':
        startDate = new Date();
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default:
        startDate = new Date();
        startDate.setDate(endDate.getDate() - 7);
    }
    
    // 개인레슨 통계
    const personalLessonStats = await PersonalLesson.aggregate([
      {
        $match: {
          centerId: centerId,
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$payment.amount' }
        }
      }
    ]);
    
    // 레인대여 통계
    const laneRentalStats = await LaneRental.aggregate([
      {
        $match: {
          centerId: centerId,
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$pricing.finalAmount' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        personalLessonStats,
        laneRentalStats,
        period,
        startDate,
        endDate
      }
    });
  } catch (error) {
    console.error('예약 통계 조회 오류:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 회원 개인레슨 신청
router.post('/personal-lessons/request', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { 
      instructorId, 
      studentId: requestedStudentId,
      scheduledDate, 
      startTime, 
      endTime, 
      poolType, 
      laneNumber, 
      lessonType, 
      level, 
      lessonContent, 
      specialRequests 
    } = req.body;

    console.log('📝 개인레슨 신청:', {
      userId,
      instructorId,
      scheduledDate,
      startTime,
      endTime,
      poolType,
      laneNumber,
      lessonType,
      level
    });

    // 센터 ID 가져오기 (사용자 정보에서) - 학생/센터관리자 모두 지원
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ success: false, message: '사용자 정보를 찾을 수 없습니다.' });
    }
    // 신청자(student) 결정: center-admin이 전달한 studentId가 있으면 그 학생으로 대체
    let applicantId = userId;
    if (requestedStudentId) {
      const student = await User.findById(requestedStudentId);
      if (!student || student.userType !== 'student') {
        return res.status(400).json({ success: false, message: '신청자(회원) 정보가 올바르지 않습니다.' });
      }
      applicantId = student._id.toString();
    }

    // 센터 결정: 학생의 centerId 우선, 없으면 관리자 정보에서
    const applicant = await User.findById(applicantId);
    const centerId = (applicant as any)?.centerId || (user as any).centerAdminInfo?.managedCenters?.[0];
    if (!centerId) {
      return res.status(400).json({ success: false, message: '센터 정보를 찾을 수 없습니다.' });
    }

    // 강사 배정은 신청 후 관리에서 가능하도록 instructorId는 선택 사항
    let instructor: any = null;
    if (instructorId) {
      instructor = await User.findById(instructorId);
      if (!instructor || instructor.userType !== 'instructor') {
        return res.status(400).json({ success: false, message: '유효하지 않은 강사입니다.' });
      }
    }

    // 중복 예약 확인
    const existingQuery: any = {
      scheduledDate: new Date(scheduledDate),
      startTime,
      endTime,
      status: { $in: ['requested', 'accepted', 'in_progress'] }
    };
    if (instructorId) existingQuery.instructor = instructorId;
    const existingLesson = await PersonalLesson.findOne(existingQuery);

    if (existingLesson) {
      return res.status(400).json({
        success: false,
        message: '해당 시간대에 이미 예약이 있습니다.'
      });
    }

    // 레인 자동 조정 및 레인 배정
    let adjustmentResult;
    let assignedLane = 1;
    try {
      adjustmentResult = await LaneAllocationService.adjustLanesForPersonalLesson({
        date: scheduledDate,
        time: startTime,
        centerId: user.centerId
      });
      assignedLane = adjustmentResult.personalLessonLane || 1;
      console.log('✅ 레인 자동 조정 완료:', adjustmentResult);
    } catch (adjustmentError) {
      console.error('⚠️ 레인 자동 조정 실패:', adjustmentError);
      // 레인 조정 실패해도 개인레슨 신청은 진행됨
    }

    // 개인레슨 생성 (모델 구조에 맞게 수정)
    const personalLesson = new PersonalLesson({
      studentId: applicantId,
      instructorId: instructorId || undefined,
      centerId: centerId,
      date: new Date(scheduledDate),
      time: startTime,
      duration: 60, // 분 단위
      lessonType: lessonType || 'freestyle',
      skillLevel: level || 'beginner',
      goals: '개인 맞춤 레슨',
      notes: lessonContent || '',
      price: 50000,
      specialRequests: specialRequests || '',
      paymentStatus: 'pending',
      status: 'pending',
      assignedLane: assignedLane
    });

    await personalLesson.save();

    // 강사별 예약 수 증가
    await updateInstructorBookingCount(instructorId, startTime, '', 1);

    res.json({
      success: true,
      message: '개인레슨 신청이 완료되었습니다.',
      data: personalLesson
    });

  } catch (error) {
    console.error('개인레슨 신청 실패:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

// 강사별 예약 수 업데이트 헬퍼 함수
async function updateInstructorBookingCount(instructorId: string, startTime: string, endTime: string, increment: number) {
  try {
    const { CenterSchedule } = await import('../models/CenterSchedule');
    
    // 모든 센터의 스케줄에서 해당 강사 찾기
    const schedules = await CenterSchedule.find({
      'instructorAvailability.instructorId': instructorId
    });

    for (const schedule of schedules) {
      const instructorIndex = schedule.instructorAvailability.findIndex(
        (instructor: any) => instructor.instructorId.toString() === instructorId
      );

      if (instructorIndex >= 0) {
        const timeSlotIndex = schedule.instructorAvailability[instructorIndex].timeSlots.findIndex(
          (slot: any) => slot.startTime === startTime && slot.endTime === endTime
        );

        if (timeSlotIndex >= 0) {
          schedule.instructorAvailability[instructorIndex].timeSlots[timeSlotIndex].currentBookings += increment;
          schedule.instructorAvailability[instructorIndex].timeSlots[timeSlotIndex].currentBookings = Math.max(0, 
            schedule.instructorAvailability[instructorIndex].timeSlots[timeSlotIndex].currentBookings
          );
          await schedule.save();
        }
      }
    }
  } catch (error) {
    console.error('강사별 예약 수 업데이트 실패:', error);
  }
}

// 회원 레인대여 신청
router.post('/lane-rentals/request', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { 
      rentalDate, 
      startTime, 
      endTime, 
      laneNumbers, 
      poolType, 
      purpose, 
      notes 
    } = req.body;

    console.log('🏊 레인대여 신청:', {
      userId,
      rentalDate,
      startTime,
      endTime,
      laneNumbers,
      poolType,
      purpose
    });

    // 센터 ID 가져오기
    const user = await User.findById(userId);
    if (!user || !user.centerId) {
      return res.status(400).json({
        success: false,
        message: '센터 정보를 찾을 수 없습니다.'
      });
    }

    // 중복 예약 확인
    const existingRental = await LaneRental.findOne({
      rentalDate: new Date(rentalDate),
      startTime,
      endTime,
      laneNumbers: { $in: laneNumbers },
      poolType,
      status: { $in: ['requested', 'approved', 'in_progress'] }
    });

    if (existingRental) {
      return res.status(400).json({
        success: false,
        message: '해당 시간대에 이미 레인 대여가 있습니다.'
      });
    }

    // 대여 시간 계산
    const start = new Date(`2000-01-01T${startTime}:00`);
    const end = new Date(`2000-01-01T${endTime}:00`);
    const totalHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

    // 레인대여 생성
    const laneRental = new LaneRental({
      renter: userId,
      centerId: user.centerId,
      rentalDate: new Date(rentalDate),
      startTime,
      endTime,
      laneNumbers,
      poolType: poolType || 'mainPool',
      purpose: purpose || 'practice',
      status: 'requested',
      notes: notes || '',
      pricing: {
        hourlyRate: 20000, // 기본 시간당 요금
        totalHours,
        totalAmount: totalHours * 20000 * laneNumbers.length,
        finalAmount: totalHours * 20000 * laneNumbers.length
      },
      payment: {
        status: 'pending',
        paymentMethod: 'card'
      }
    });

    await laneRental.save();

    res.json({
      success: true,
      message: '레인대여 신청이 완료되었습니다.',
      data: laneRental
    });

  } catch (error) {
    console.error('레인대여 신청 실패:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

// 회원 예약 내역 조회
router.get('/my-bookings', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { type, status } = req.query;

    console.log('📋 회원 예약 내역 조회:', {
      userId,
      type,
      status
    });

    let personalLessons = [];
    let laneRentals = [];

    // 개인레슨 조회
    if (!type || type === 'personal-lessons') {
      const query: any = { student: userId };
      if (status && status !== 'all') {
        query.status = status;
      }

      personalLessons = await PersonalLesson.find(query)
        .populate('instructor', 'name email phone')
        .sort({ scheduledDate: -1, startTime: -1 });
    }

    // 레인대여 조회
    if (!type || type === 'lane-rentals') {
      const query: any = { renter: userId };
      if (status && status !== 'all') {
        query.status = status;
      }

      laneRentals = await LaneRental.find(query)
        .sort({ rentalDate: -1, startTime: -1 });
    }

    res.json({
      success: true,
      data: {
        personalLessons,
        laneRentals
      }
    });

  } catch (error) {
    console.error('회원 예약 내역 조회 실패:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

export default router; 