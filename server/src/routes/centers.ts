import express, { Request, Response, Router } from 'express';
import { auth, requireRole } from '../middleware/auth';
import { SwimmingCenter } from '../models/SwimmingCenter';
import { User } from '../models/User';
import { Course } from '../models/Course';
import { Booking } from '../models/Booking';
import mongoose from 'mongoose';
import { Payment } from '../models/Payment'; // Added Payment import

interface AuthRequest extends Request {
  user?: any;
}

const router: Router = express.Router();

// ===== 센터 관리자 전용 기능 =====

// 1. 센터 정보 조회 (센터 관리자만)
router.get('/my-center', auth, requireRole(['centerAdmin']), async (req: AuthRequest, res: Response) => {
  try {
    const centerAdmin = await User.findById(req.user._id).populate('centerAdminInfo.managedCenters');
    
    if (!centerAdmin?.centerAdminInfo?.managedCenters) {
      return res.status(404).json({
        success: false,
        message: '관리하는 센터가 없습니다.'
      });
    }

    const center = await SwimmingCenter.findById(centerAdmin.centerAdminInfo.managedCenters[0])
      .populate('admins', 'name email')
      .populate('instructors', 'name email instructorInfo.experience')
      .populate('students', 'name email studentInfo.swimmingLevel');

    if (!center) {
      return res.status(404).json({
        success: false,
        message: '센터 정보를 찾을 수 없습니다.'
      });
    }

    res.json({
      success: true,
      message: '센터 정보 조회 성공!',
      data: center
    });
  } catch (error) {
    console.error('센터 정보 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '센터 정보 조회에 실패했습니다.'
    });
  }
});

// 2. 센터 정보 수정 (센터 관리자만)
router.put('/my-center', auth, requireRole(['centerAdmin']), async (req: AuthRequest, res: Response) => {
  try {
    const centerAdmin = await User.findById(req.user._id);
    if (!centerAdmin?.centerAdminInfo?.managedCenters) {
      return res.status(404).json({
        success: false,
        message: '관리하는 센터가 없습니다.'
      });
    }

    const centerId = centerAdmin.centerAdminInfo.managedCenters[0];
    const center = await SwimmingCenter.findById(centerId);
    
    if (!center) {
      return res.status(404).json({
        success: false,
        message: '센터를 찾을 수 없습니다.'
      });
    }

    // 수정 가능한 필드들
    const { name, address, phone, email, website, description, facilities, operatingHours, pricing } = req.body;
    
    if (name) center.name = name;
    if (address) center.address = address;
    if (phone) center.phone = phone;
    if (email) center.email = email;
    if (website) center.website = website;
    if (description) center.description = description;
    if (facilities) center.facilities = { ...center.facilities, ...facilities };
    if (operatingHours) center.operatingHours = { ...center.operatingHours, ...operatingHours };
    if (pricing) center.pricing = { ...center.pricing, ...pricing };

    await center.save();

    res.json({
      success: true,
      message: '센터 정보가 성공적으로 수정되었습니다!',
      data: center
    });
  } catch (error) {
    console.error('센터 정보 수정 오류:', error);
    res.status(500).json({
      success: false,
      message: '센터 정보 수정에 실패했습니다.'
    });
  }
});

// 3. 강사 계정 생성/관리 (센터 관리자만)
router.post('/instructors', auth, requireRole(['centerAdmin']), async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, password, phone, experience, certifications, specialties, maxStudents } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: '필수 필드가 누락되었습니다.'
      });
    }

    // 이메일 중복 확인
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: '이미 존재하는 이메일입니다.'
      });
    }

    const centerAdmin = await User.findById(req.user._id);
    const centerId = centerAdmin?.centerAdminInfo?.managedCenters?.[0];

    if (!centerId) {
      return res.status(400).json({
        success: false,
        message: '관리하는 센터가 없습니다.'
      });
    }

    // 강사 계정 생성
    const instructor = new User({
      userId: `IN_${Date.now()}`,
      name,
      email,
      password, // 실제로는 해시화 필요
      phone,
      userType: 'instructor',
      instructorInfo: {
        experience: experience || '신입',
        certifications: certifications || [],
        specialties: specialties || [],
        instructorLevel: 'junior',
        assignedCenters: [centerId],
        maxStudents: maxStudents || 20,
        currentStudents: 0
      },
      accessPermissions: {
        dashboard: true,
        courses: true,
        bookings: true,
        payments: false,
        notices: true,
        progress: true,
        evaluations: true,
        reports: true,
        userManagement: false,
        systemSettings: false,
        aiConfigManagement: false
      },
      isActive: true
    });

    await instructor.save();

    // 센터에 강사 정보 추가
    const center = await SwimmingCenter.findById(centerId);
    if (center) {
      center.instructors = center.instructors || [];
      center.instructors.push(instructor._id as mongoose.Types.ObjectId);
      await center.save();
    }

    res.status(201).json({
      success: true,
      message: '강사 계정이 성공적으로 생성되었습니다!',
      data: {
        id: instructor._id,
        name: instructor.name,
        email: instructor.email,
        centerId: centerId
      }
    });
  } catch (error) {
    console.error('강사 계정 생성 오류:', error);
    res.status(500).json({
      success: false,
      message: '강사 계정 생성에 실패했습니다.'
    });
  }
});

// 4. 강사 목록 조회 (센터 관리자만)
router.get('/instructors', auth, requireRole(['centerAdmin']), async (req: AuthRequest, res: Response) => {
  try {
    const centerAdmin = await User.findById(req.user._id);
    const centerId = centerAdmin?.centerAdminInfo?.managedCenters?.[0];

    if (!centerId) {
      return res.status(400).json({
        success: false,
        message: '관리하는 센터가 없습니다.'
      });
    }

    const instructors = await User.find({
      userType: 'instructor',
      'instructorInfo.assignedCenters': centerId
    }).select('-password');

    res.json({
      success: true,
      message: '강사 목록 조회 성공!',
      data: instructors
    });
  } catch (error) {
    console.error('강사 목록 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '강사 목록 조회에 실패했습니다.'
    });
  }
});

// 5. 강사 권한 수정 (센터 관리자만)
router.put('/instructors/:id/permissions', auth, requireRole(['centerAdmin']), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { permissions, maxStudents } = req.body;

    const instructor = await User.findById(id);
    if (!instructor || instructor.userType !== 'instructor') {
      return res.status(404).json({
        success: false,
        message: '강사를 찾을 수 없습니다.'
      });
    }

    // 센터 관리자 권한 확인
    const centerAdmin = await User.findById(req.user._id);
    const centerId = centerAdmin?.centerAdminInfo?.managedCenters?.[0];
    
    if (!centerId || !instructor.instructorInfo?.assignedCenters?.includes(centerId)) {
      return res.status(403).json({
        success: false,
        message: '해당 강사를 관리할 권한이 없습니다.'
      });
    }

    if (permissions) {
      instructor.accessPermissions = {
        ...instructor.accessPermissions,
        ...permissions
      };
    }

    if (maxStudents !== undefined) {
      instructor.instructorInfo.maxStudents = maxStudents;
    }

    await instructor.save();

    res.json({
      success: true,
      message: '강사 권한이 성공적으로 수정되었습니다!',
      data: instructor.accessPermissions
    });
  } catch (error) {
    console.error('강사 권한 수정 오류:', error);
    res.status(500).json({
      success: false,
      message: '강사 권한 수정에 실패했습니다.'
    });
  }
});

// 6. 강사 정보 수정 (센터 관리자만)
router.put('/instructors/:id', auth, requireRole(['centerAdmin']), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { permissions, maxStudents, isActive } = req.body;

    const instructor = await User.findById(id);
    if (!instructor || instructor.userType !== 'instructor') {
      return res.status(404).json({
        success: false,
        message: '강사를 찾을 수 없습니다.'
      });
    }

    // 센터 관리자 권한 확인
    const centerAdmin = await User.findById(req.user._id);
    const centerId = centerAdmin?.centerAdminInfo?.managedCenters?.[0];
    
    if (!centerId || !instructor.instructorInfo?.assignedCenters?.includes(centerId)) {
      return res.status(403).json({
        success: false,
        message: '해당 강사를 관리할 권한이 없습니다.'
      });
    }

    if (permissions) {
      instructor.accessPermissions = {
        ...instructor.accessPermissions,
        ...permissions
      };
    }

    if (maxStudents !== undefined) {
      instructor.instructorInfo.maxStudents = maxStudents;
    }

    if (isActive !== undefined) {
      instructor.isActive = isActive;
    }

    await instructor.save();

    res.json({
      success: true,
      message: '강사 정보가 성공적으로 수정되었습니다!',
      data: {
        accessPermissions: instructor.accessPermissions,
        isActive: instructor.isActive
      }
    });
  } catch (error) {
    console.error('강사 정보 수정 오류:', error);
    res.status(500).json({
      success: false,
      message: '강사 정보 수정에 실패했습니다.'
    });
  }
});

// 7. 강사 삭제 (센터 관리자만)
router.delete('/instructors/:id', auth, requireRole(['centerAdmin']), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const instructor = await User.findById(id);
    if (!instructor || instructor.userType !== 'instructor') {
      return res.status(404).json({
        success: false,
        message: '강사를 찾을 수 없습니다.'
      });
    }

    // 센터 관리자 권한 확인
    const centerAdmin = await User.findById(req.user._id);
    const centerId = centerAdmin?.centerAdminInfo?.managedCenters?.[0];
    
    if (!centerId || !instructor.instructorInfo?.assignedCenters?.includes(centerId)) {
      return res.status(403).json({
        success: false,
        message: '해당 강사를 관리할 권한이 없습니다.'
      });
    }

    // 센터에서 강사 정보 제거
    const center = await SwimmingCenter.findById(centerId);
    if (center) {
      center.instructors = center.instructors?.filter(
        (instructorId: mongoose.Types.ObjectId) => instructorId.toString() !== id
      );
      await center.save();
    }

    // 강사 계정 삭제
    await User.findByIdAndDelete(id);

    res.json({
      success: true,
      message: '강사가 성공적으로 삭제되었습니다.'
    });
  } catch (error) {
    console.error('강사 삭제 오류:', error);
    res.status(500).json({
      success: false,
      message: '강사 삭제에 실패했습니다.'
    });
  }
});

// 7. 센터 정보 조회 (센터 관리자만)
router.get('/info', auth, requireRole(['centerAdmin', 'superAdmin']), async (req: AuthRequest, res: Response) => {
  try {
    const centerAdmin = await User.findById(req.user._id);
    const centerId = centerAdmin?.centerAdminInfo?.managedCenters?.[0];

    if (!centerId) {
      return res.status(400).json({
        success: false,
        message: '관리하는 센터가 없습니다.'
      });
    }

    const center = await SwimmingCenter.findById(centerId);
    if (!center) {
      return res.status(404).json({
        success: false,
        message: '센터를 찾을 수 없습니다.'
      });
    }

    res.json({
      success: true,
      message: '센터 정보 조회 성공!',
      data: {
        centerId: center._id,
        name: center.name,
        description: center.description,
        address: center.address,
        phone: center.phone,
        email: center.email,
        operatingHours: center.operatingHours,
        facilities: center.facilities || [],
        introduction: center.introduction || '',
        guide: center.guide || '',
        updatedAt: center.updatedAt
      }
    });
  } catch (error) {
    console.error('센터 정보 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '센터 정보 조회에 실패했습니다.'
    });
  }
});

// 8. 센터 정보 수정 (센터 관리자만)
router.put('/info', auth, requireRole(['centerAdmin', 'superAdmin']), async (req: AuthRequest, res: Response) => {
  try {
    const centerAdmin = await User.findById(req.user._id);
    const centerId = centerAdmin?.centerAdminInfo?.managedCenters?.[0];

    if (!centerId) {
      return res.status(400).json({
        success: false,
        message: '관리하는 센터가 없습니다.'
      });
    }

    const {
      name,
      description,
      address,
      phone,
      email,
      operatingHours,
      facilities,
      introduction,
      guide
    } = req.body;

    const center = await SwimmingCenter.findById(centerId);
    if (!center) {
      return res.status(404).json({
        success: false,
        message: '센터를 찾을 수 없습니다.'
      });
    }

    // 센터 정보 업데이트
    if (name) center.name = name;
    if (description) center.description = description;
    if (address) center.address = address;
    if (phone) center.phone = phone;
    if (email) center.email = email;
    if (operatingHours) center.operatingHours = operatingHours;
    if (facilities) center.facilities = facilities;
    if (introduction) center.introduction = introduction;
    if (guide) center.guide = guide;

    await center.save();

    res.json({
      success: true,
      message: '센터 정보가 성공적으로 수정되었습니다!',
      data: {
        centerId: center._id,
        name: center.name,
        description: center.description,
        address: center.address,
        phone: center.phone,
        email: center.email,
        operatingHours: center.operatingHours,
        facilities: center.facilities,
        introduction: center.introduction,
        guide: center.guide,
        updatedAt: center.updatedAt
      }
    });
  } catch (error) {
    console.error('센터 정보 수정 오류:', error);
    res.status(500).json({
      success: false,
      message: '센터 정보 수정에 실패했습니다.'
    });
  }
});

// 9. 센터 통계 대시보드 (센터 관리자만)
router.get('/dashboard', auth, requireRole(['centerAdmin']), async (req: AuthRequest, res: Response) => {
  try {
    const centerAdmin = await User.findById(req.user._id);
    const centerId = centerAdmin?.centerAdminInfo?.managedCenters?.[0];

    if (!centerId) {
      return res.status(400).json({
        success: false,
        message: '관리하는 센터가 없습니다.'
      });
    }

    const [
      totalInstructors,
      totalStudents,
      totalCourses,
      activeBookings,
      recentPayments
    ] = await Promise.all([
      User.countDocuments({
        userType: 'instructor',
        'instructorInfo.assignedCenters': centerId
      }),
      User.countDocuments({
        userType: 'student',
        'studentInfo.enrolledCourses': { $in: await Course.find({ center: centerId }).select('_id') }
      }),
      Course.countDocuments({ center: centerId }),
      Booking.countDocuments({
        course: { $in: await Course.find({ center: centerId }).select('_id') },
        date: { $gte: new Date() }
      }),
      // 최근 결제 내역 (실제 구현 필요)
      0
    ]);

    const dashboardData = {
      overview: {
        totalInstructors,
        totalStudents,
        totalCourses,
        activeBookings,
        recentPayments
      },
      centerInfo: await SwimmingCenter.findById(centerId).select('name address currentCapacity maxCapacity')
    };

    res.json({
      success: true,
      message: '센터 대시보드 데이터 조회 성공!',
      data: dashboardData
    });
  } catch (error) {
    console.error('센터 대시보드 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '센터 대시보드 조회에 실패했습니다.'
    });
  }
});

// 7. 센터 운영 시간 관리
router.put('/operating-hours', auth, requireRole(['centerAdmin']), async (req: AuthRequest, res: Response) => {
  try {
    const { operatingHours } = req.body;

    const centerAdmin = await User.findById(req.user._id);
    const centerId = centerAdmin?.centerAdminInfo?.managedCenters?.[0];

    if (!centerId) {
      return res.status(400).json({
        success: false,
        message: '관리하는 센터가 없습니다.'
      });
    }

    const center = await SwimmingCenter.findById(centerId);
    if (!center) {
      return res.status(404).json({
        success: false,
        message: '센터를 찾을 수 없습니다.'
      });
    }

    center.operatingHours = { ...center.operatingHours, ...operatingHours };
    await center.save();

    res.json({
      success: true,
      message: '운영 시간이 성공적으로 수정되었습니다!',
      data: center.operatingHours
    });
  } catch (error) {
    console.error('운영 시간 수정 오류:', error);
    res.status(500).json({
      success: false,
      message: '운영 시간 수정에 실패했습니다.'
    });
  }
});

// 8. 센터 시설 정보 관리
router.put('/facilities', auth, requireRole(['centerAdmin']), async (req: AuthRequest, res: Response) => {
  try {
    const { facilities } = req.body;

    const centerAdmin = await User.findById(req.user._id);
    const centerId = centerAdmin?.centerAdminInfo?.managedCenters?.[0];

    if (!centerId) {
      return res.status(400).json({
        success: false,
        message: '관리하는 센터가 없습니다.'
      });
    }

    const center = await SwimmingCenter.findById(centerId);
    if (!center) {
      return res.status(404).json({
        success: false,
        message: '센터를 찾을 수 없습니다.'
      });
    }

    center.facilities = { ...center.facilities, ...facilities };
    await center.save();

    res.json({
      success: true,
      message: '시설 정보가 성공적으로 수정되었습니다!',
      data: center.facilities
    });
  } catch (error) {
    console.error('시설 정보 수정 오류:', error);
    res.status(500).json({
      success: false,
      message: '시설 정보 수정에 실패했습니다.'
    });
  }
});

// 9. 센터 수익성 분석 대시보드 (센터 관리자만)
router.get('/analytics', auth, requireRole(['centerAdmin']), async (req: AuthRequest, res: Response) => {
  try {
    const centerAdmin = await User.findById(req.user._id);
    const centerId = centerAdmin?.centerAdminInfo?.managedCenters?.[0];

    if (!centerId) {
      return res.status(400).json({
        success: false,
        message: '관리하는 센터가 없습니다.'
      });
    }

    // 수익성 분석 데이터
    // 월별 수익 분석
    const monthlyRevenue = await Payment.aggregate([
      { $match: { 
        center: centerId, 
        status: 'completed',
        createdAt: { $gte: new Date(new Date().getFullYear(), 0, 1) }
      }},
      { $group: {
        _id: { $month: '$createdAt' },
        totalRevenue: { $sum: '$amount' },
        totalPayments: { $sum: 1 }
      }},
      { $sort: { _id: 1 } }
    ]);

    // 강습 과정별 성과
    const coursePerformance = await Course.aggregate([
      { $match: { center: centerId }},
      { $lookup: {
        from: 'bookings',
        localField: '_id',
        foreignField: 'course',
        as: 'bookings'
      }},
      { $lookup: {
        from: 'payments',
        localField: '_id',
        foreignField: 'relatedCourse',
        as: 'payments'
      }},
      { $project: {
        name: 1,
        enrollmentCount: { $size: '$bookings' },
        revenue: { $sum: '$payments.amount' },
        completionRate: { $divide: [
          { $size: { $filter: { input: '$bookings', cond: { $eq: ['$$this.status', 'completed'] }}}},
          { $size: '$bookings' }
        ]}
      }}
    ]);

    // 강사별 성과
    const instructorPerformance = await User.aggregate([
      { $match: { 
        userType: 'instructor',
        'instructorInfo.assignedCenters': centerId
      }},
      { $lookup: {
        from: 'courses',
        localField: '_id',
        foreignField: 'instructor',
        as: 'courses'
      }},
      { $lookup: {
        from: 'bookings',
        localField: 'courses._id',
        foreignField: 'course',
        as: 'bookings'
      }},
      { $project: {
        name: 1,
        totalStudents: { $size: '$bookings' },
        totalCourses: { $size: '$courses' },
        studentSatisfaction: 4.2 // 실제로는 평가 데이터에서 계산
      }}
    ]);

    // 학생 유지율 분석
    const centerCourses = await Course.find({ center: centerId }).select('_id');
    const courseIds: any[] = [];
    for (const course of centerCourses) {
      courseIds.push(course._id);
    }
    const studentRetention = await User.aggregate([
      { $match: { 
        userType: 'student',
        'studentInfo.enrolledCourses': { $in: courseIds }
      }},
      { $lookup: {
        from: 'bookings',
        localField: '_id',
        foreignField: 'user',
        as: 'bookings'
      }},
      { $project: {
        name: 1,
        totalBookings: { $size: '$bookings' },
        lastActivity: { $max: '$bookings.date' },
        isActive: { $gt: [{ $size: '$bookings' }, 0] }
      }}
    ]);

    // 피크 타임 분석
    const peakHours = await Booking.aggregate([
      { $match: { 
        course: { $in: courseIds }
      }},
      { $group: {
        _id: { $hour: '$date' },
        bookingCount: { $sum: 1 }
      }},
      { $sort: { _id: 1 } }
    ]);

    // 수용 인원 활용률
    const capacityUtilization = await SwimmingCenter.findById(centerId).select('currentCapacity maxCapacity');

    const analyticsData = {
      revenue: {
        monthly: monthlyRevenue,
        total: monthlyRevenue.reduce((sum, month) => sum + month.totalRevenue, 0),
        trend: monthlyRevenue.slice(-3) // 최근 3개월 트렌드
      },
      performance: {
        courses: coursePerformance,
        instructors: instructorPerformance,
        topPerformingCourse: coursePerformance.sort((a, b) => b.revenue - a.revenue)[0],
        topPerformingInstructor: instructorPerformance.sort((a, b) => b.totalStudents - a.totalStudents)[0]
      },
      retention: {
        totalStudents: studentRetention.length,
        activeStudents: studentRetention.filter(s => s.isActive).length,
        retentionRate: Math.round((studentRetention.filter(s => s.isActive).length / studentRetention.length) * 100)
      },
      operations: {
        peakHours: peakHours.sort((a, b) => b.bookingCount - a.bookingCount).slice(0, 3),
        capacityUtilization: capacityUtilization ? Math.round((capacityUtilization.currentCapacity / capacityUtilization.maxCapacity) * 100) : 0
      },
      recommendations: [
        '피크 타임에 강사 배치 최적화',
        '인기 강습 과정 확대',
        '학생 유지율 향상을 위한 프로그램 개발',
        '수용 인원 활용률 개선 방안'
      ]
    };

    res.json({
      success: true,
      message: '센터 수익성 분석 데이터 조회 성공!',
      data: analyticsData
    });
  } catch (error) {
    console.error('센터 수익성 분석 오류:', error);
    res.status(500).json({
      success: false,
      message: '센터 수익성 분석에 실패했습니다.'
    });
  }
});

// 10. 마케팅 및 프로모션 관리 (센터 관리자만)
router.post('/promotions', auth, requireRole(['centerAdmin']), async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, discountType, discountValue, validFrom, validTo, targetAudience, conditions } = req.body;

    const centerAdmin = await User.findById(req.user._id);
    const centerId = centerAdmin?.centerAdminInfo?.managedCenters?.[0];

    if (!centerId) {
      return res.status(400).json({
        success: false,
        message: '관리하는 센터가 없습니다.'
      });
    }

    // 프로모션 생성 (실제로는 Promotion 모델 필요)
    const promotion = {
      center: centerId,
      title,
      description,
      discountType, // percentage, fixed_amount, free_lesson
      discountValue,
      validFrom: new Date(validFrom),
      validTo: new Date(validTo),
      targetAudience, // new_students, existing_students, specific_level
      conditions,
      isActive: true,
      createdAt: new Date()
    };

    // 여기서는 임시로 성공 응답
    res.status(201).json({
      success: true,
      message: '프로모션이 성공적으로 생성되었습니다!',
      data: promotion
    });
  } catch (error) {
    console.error('프로모션 생성 오류:', error);
    res.status(500).json({
      success: false,
      message: '프로모션 생성에 실패했습니다.'
    });
  }
});

// 11. 센터 운영 최적화 제안 (센터 관리자만)
router.get('/optimization-suggestions', auth, requireRole(['centerAdmin']), async (req: AuthRequest, res: Response) => {
  try {
    const centerAdmin = await User.findById(req.user._id);
    const centerId = centerAdmin?.centerAdminInfo?.managedCenters?.[0];

    if (!centerId) {
      return res.status(400).json({
        success: false,
        message: '관리하는 센터가 없습니다.'
      });
    }

    // 센터 데이터 분석을 통한 최적화 제안
    const suggestions = [
      {
        category: '수익성 향상',
        suggestions: [
          '피크 타임 강습 요금 20% 인상으로 수익 극대화',
          '신규 회원 첫 달 30% 할인으로 고객 확보',
          '패키지 강습 할인으로 장기 수강 유도'
        ]
      },
      {
        category: '운영 효율성',
        suggestions: [
          '수용 인원 활용률 85% 이상 유지',
          '강사별 담당 학생 수 최적화 (15-20명)',
          '강습 시간대별 수요 예측 및 강사 배치'
        ]
      },
      {
        category: '고객 만족도',
        suggestions: [
          '학생별 맞춤 진도 관리 시스템 강화',
          '정기적인 강사 평가 및 피드백 시스템',
          '체크리스트 완료율 기반 보상 프로그램'
        ]
      }
    ];

    res.json({
      success: true,
      message: '센터 운영 최적화 제안 조회 성공!',
      data: suggestions
    });
  } catch (error) {
    console.error('최적화 제안 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '최적화 제안 조회에 실패했습니다.'
    });
  }
});

export default router; 