/**
 * 📊 JJ Swim Lab - 대시보드 API 라우트
 * 
 * 📋 **기능**
 * - 실시간 시스템 통계 데이터 제공
 * - 사용자, 과정, 예약, 결제, 승인 통계
 * - 데이터베이스 기반 실시간 계산
 * - 하드코딩된 더미 데이터 대체
 */

import { Router, Request, Response } from 'express';
import { User } from '../models/User';
import { Course } from '../models/Course';
import { Booking } from '../models/Booking';
import { Payment } from '../models/Payment';
import { Approval } from '../models/Approval';

const router = Router();

/**
 * GET /api/dashboard/stats
 * 대시보드 통계 데이터를 반환합니다
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    console.log('📊 대시보드 통계 요청 받음');

    // 전체 사용자 수 (활성 상태만)
    const totalUsers = await User.countDocuments({ isActive: true });
    
    // 활성 강습 과정 수
    const activeCourses = await Course.countDocuments({ isActive: true });
    
    // 총 매출액 (완료된 결제만)
    const totalRevenue = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const revenue = totalRevenue.length > 0 ? totalRevenue[0].total : 0;
    
    // 활성 예약 수 (확정된 예약만)
    const activeBookings = await Booking.countDocuments({ 
      status: { $in: ['confirmed', 'pending'] } 
    });
    
    // 승인 대기 건수
    const pendingApprovals = await Approval.countDocuments({ status: 'pending' });
    
    // 강사별 학생 수 통계 (현재는 기본값으로 설정)
    const instructorStats = await User.find({ 
      userType: 'instructor', 
      isActive: true 
    }).select('name instructorInfo.currentStudents').lean();
    
    const instructorStatsFormatted = instructorStats.map(instructor => ({
      name: instructor.name,
      studentCount: instructor.instructorInfo?.currentStudents || 0
    }));
    
    // 과정별 등록 현황
    const courseStats = await Course.find({ 
      isActive: true 
    }).select('name classInfo.currentEnrollment classInfo.maxCapacity').lean();
    
    const courseStatsFormatted = courseStats.map(course => ({
      name: course.name,
      enrollmentRate: course.classInfo?.maxCapacity > 0 ? 
        Math.round((course.classInfo?.currentEnrollment || 0) / course.classInfo.maxCapacity * 100) : 0
    }));

    const dashboardStats = {
      totalUsers,
      activeCourses,
      totalRevenue: revenue,
      activeBookings,
      pendingApprovals,
      instructorStats: instructorStatsFormatted,
      courseStats: courseStatsFormatted
    };

    console.log('✅ 대시보드 통계 생성 완료:', {
      totalUsers,
      activeCourses,
      totalRevenue: revenue,
      activeBookings,
      pendingApprovals
    });

    res.json(dashboardStats);

  } catch (error) {
    console.error('❌ 대시보드 통계 생성 중 오류 발생:', error);
    res.status(500).json({
      error: '대시보드 통계를 가져올 수 없습니다',
      details: error instanceof Error ? error.message : '알 수 없는 오류'
    });
  }
});

export default router; 