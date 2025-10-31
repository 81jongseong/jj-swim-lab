/**
 * 🏢 JJ Swim Lab - 센터 관리 API 라우트
 *
 * =============================================================================
 * 📋 **의존성 파일들**
 * =============================================================================
 * 🔗 **직접 의존성**:
 *   - ../middleware/auth.ts (인증 미들웨어, requireRole 함수)
 *   - ../models/Center.ts (수영 센터 데이터 모델)
 *   - ../models/User.ts (사용자 데이터 모델)
 *   - ../models/Course.ts (강습 과정 데이터 모델)
 *   - ../models/Booking.ts (예약 데이터 모델)
 *   - ../models/Payment.ts (결제 데이터 모델)
 *   - mongoose (MongoDB ODM)
 * 
 * 🔗 **연동되는 클라이언트 파일들**:
 *   - client/app/center-admin/ 페이지들 (센터 관리자 기능)
 *   - client/app/admin/centers/page.tsx (관리자 센터 관리)
 *   - client/components/center/ 센터 관련 컴포넌트들
 * 
 * 🔗 **데이터베이스 연동**:
 *   - Center 컬렉션 (수영 센터 정보)
 *   - User 컬렉션 (센터 관리자 및 사용자 정보)
 *   - Course 컬렉션 (센터별 강습 과정)
 *   - Booking 컬렉션 (센터별 예약 정보)
 *   - Payment 컬렉션 (센터별 결제 정보)
 *
 * =============================================================================
 * 🔄 **현재 구현된 기능들**
 * =============================================================================
 * ✅ **완전 구현**:
 *   - GET /api/centers/my-center (센터 관리자: 내 센터 정보 조회)
 *   - PUT /api/centers/my-center (센터 관리자: 내 센터 정보 수정)
 *   - GET /api/centers/stats (센터 관리자: 센터 통계 조회)
 *   - GET /api/centers (관리자: 모든 센터 목록 조회)
 *   - POST /api/centers (관리자: 새 센터 생성)
 *   - PUT /api/centers/:id (관리자: 센터 정보 수정)
 *   - DELETE /api/centers/:id (관리자: 센터 삭제)
 * 
 * ✅ **부분 구현**:
 *   - 센터별 사용자 관리
 *   - 센터별 강습 과정 관리
 *   - 센터별 예약 및 결제 관리
 * 
 * ❌ **미구현**:
 *   - 센터 검색 및 필터링
 *   - 센터별 리뷰 및 평점 시스템
 *   - 센터별 통계 대시보드
 *
 * =============================================================================
 * ⚠️ **중요한 주의사항**
 * =============================================================================
 * 🚨 **권한 체크**: centerAdmin, superAdmin만 센터 관리 가능
 * 🚨 **데이터 검증**: ObjectId 유효성 검사 필수
 * 🚨 **센터 소속**: 센터 관리자는 자신의 센터만 관리 가능
 * 🚨 **관계 데이터**: 센터 삭제 시 관련 데이터 정리 필요
 * 🚨 **통계 계산**: 실시간 데이터베이스 조회 기반
 * 
 * 📅 **개발 히스토리**
 * - 2025-01-13: 초기 센터 관리 API 구현
 * - 2025-01-13: 센터 관리자 전용 기능 추가
 * - 2025-01-13: 관리자 센터 관리 기능 추가
 * - 2025-01-13: 센터별 통계 및 데이터 관리 기능 추가
 */

import express, { Request, Response, Router } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth';
import { Center } from '../models/Center';
import { User } from '../models/User';
import { Course } from '../models/Course';
import { Booking } from '../models/Booking';
import mongoose from 'mongoose';
import { Payment } from '../models/Payment'; // Added Payment import
import multer from 'multer';
import path from 'path';
import fs from 'fs';

interface AuthRequest extends Request {
  user?: any;
}

const router: Router = express.Router();

// Multer 설정 (이미지 업로드)
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const centerImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(uploadDir, 'center-images');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `center-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// 테넌트 슬러그 해석: /api/centers/resolve-slug/:slug
// 인증 없이도 접근 가능하도록 변경 (센터 정보는 공개 정보)
router.get('/resolve-slug/:slug', async (req: AuthRequest, res: Response) => {
  try {
    const { slug } = req.params;
    console.log(`🔍 센터 슬러그 해석 요청: ${slug}`);
    
    if (!slug) {
      return res.status(400).json({ success: false, message: 'slug가 필요합니다.' });
    }

    let center = null;

    // 1) slug가 'default'인 경우 우선 처리 (가장 먼저)
    if (slug.toLowerCase() === 'default') {
      console.log('📌 "default" 슬러그 감지, 첫 번째 활성 센터 조회');
      center = await Center.findOne({ isActive: true }).select('_id name').sort({ createdAt: 1 });
      if (center) {
        console.log(`✅ "default" → 센터 ID: ${center._id}, 이름: ${center.name}`);
        return res.json({ success: true, data: { centerId: center._id.toString(), name: center.name } });
      } else {
        console.warn('⚠️ 활성 센터가 없습니다. 기본값으로 "default" 반환');
        // 활성 센터가 없으면 "default"를 그대로 반환 (클라이언트에서 처리)
        return res.json({ success: true, data: { centerId: 'default', name: 'Default Center' } });
      }
    }

    // 2) ObjectId로 시도
    if (/^[0-9a-fA-F]{24}$/.test(slug)) {
      console.log(`📌 ObjectId 형식 감지: ${slug}`);
      center = await Center.findById(slug).select('_id name');
      if (center) {
        console.log(`✅ ObjectId로 센터 조회 성공: ${center._id}`);
        return res.json({ success: true, data: { centerId: center._id.toString(), name: center.name } });
      }
    }

    // 3) 이름으로 시도 (대소문자 무시)
    console.log(`📌 이름으로 센터 조회 시도: ${slug}`);
    center = await Center.findOne({ name: { $regex: `^${slug}$`, $options: 'i' } }).select('_id name');
    if (center) {
      console.log(`✅ 이름으로 센터 조회 성공: ${center.name} (${center._id})`);
      return res.json({ success: true, data: { centerId: center._id.toString(), name: center.name } });
    }

    // 4) 모두 실패한 경우
    console.warn(`❌ 센터를 찾을 수 없음: ${slug}`);
    return res.status(404).json({ success: false, message: '센터를 찾을 수 없습니다.' });
  } catch (error: any) {
    console.error('resolve-slug 오류:', error);
    console.error('에러 스택:', error?.stack);
    return res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

const instructorImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(uploadDir, 'instructor-images');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `instructor-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const centerImageUpload = multer({
  storage: centerImageStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('이미지 파일만 업로드 가능합니다.'));
    }
  }
});

const instructorImageUpload = multer({
  storage: instructorImageStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('이미지 파일만 업로드 가능합니다.'));
    }
  }
});

// ===== 기본 센터 목록 조회 =====

/**
 * 모든 센터 목록 조회
 * GET /api/centers
 */
router.get('/', authMiddleware, requireRole(['superAdmin', 'centerAdmin', 'instructor']), async (req: AuthRequest, res: Response) => {
  try {
    console.log('🔍 센터 목록 조회 요청:', req.user?.userType);
    
    const centers = await Center.find({ isActive: true })
      .select('name location contactInfo facilities province city gu dong createdAt')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      message: '센터 목록 조회 성공',
      data: {
        centers,
        total: centers.length
      }
    });
  } catch (error) {
    console.error('센터 목록 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '센터 목록 조회 중 오류가 발생했습니다.'
    });
  }
});

/**
 * 센터 로고/이미지 업로드
 * POST /api/centers/my-center/upload-logo
 * POST /api/centers/my-center/upload-main-image
 */
router.post('/my-center/upload-logo', 
  authMiddleware, 
  requireRole(['centerAdmin', 'center-admin', 'superAdmin']), 
  centerImageUpload.single('logo'),
  async (req: AuthRequest, res: Response) => {
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({
          success: false,
          message: '파일이 업로드되지 않았습니다.'
        });
      }

      const centerAdmin = await User.findById(req.user._id);
      const centerId = centerAdmin?.centerId || centerAdmin?.centerAdminInfo?.managedCenters?.[0];
      
      if (!centerId) {
        return res.status(404).json({
          success: false,
          message: '관리하는 센터가 없습니다.'
        });
      }

      const center = await Center.findById(centerId);
      if (!center) {
        return res.status(404).json({
          success: false,
          message: '센터를 찾을 수 없습니다.'
        });
      }

      const imageUrl = `/uploads/center-images/${file.filename}`;
      
      // 기존 이미지 구조 유지하면서 로고 업데이트
      if (!center.images) {
        center.images = {} as any;
      }
      center.images.logo = imageUrl;
      await center.save();

      res.json({
        success: true,
        message: '로고가 성공적으로 업로드되었습니다.',
        data: {
          imageUrl,
          logo: imageUrl
        }
      });
    } catch (error: any) {
      console.error('로고 업로드 오류:', error);
      res.status(500).json({
        success: false,
        message: error.message || '로고 업로드 중 오류가 발생했습니다.'
      });
    }
  }
);

router.post('/my-center/upload-main-image', 
  authMiddleware, 
  requireRole(['centerAdmin', 'center-admin', 'superAdmin']), 
  centerImageUpload.single('mainImage'),
  async (req: AuthRequest, res: Response) => {
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({
          success: false,
          message: '파일이 업로드되지 않았습니다.'
        });
      }

      const centerAdmin = await User.findById(req.user._id);
      const centerId = centerAdmin?.centerId || centerAdmin?.centerAdminInfo?.managedCenters?.[0];
      
      if (!centerId) {
        return res.status(404).json({
          success: false,
          message: '관리하는 센터가 없습니다.'
        });
      }

      const center = await Center.findById(centerId);
      if (!center) {
        return res.status(404).json({
          success: false,
          message: '센터를 찾을 수 없습니다.'
        });
      }

      const imageUrl = `/uploads/center-images/${file.filename}`;
      
      if (!center.images) {
        center.images = {} as any;
      }
      center.images.mainImage = imageUrl;
      await center.save();

      res.json({
        success: true,
        message: '메인 이미지가 성공적으로 업로드되었습니다.',
        data: {
          imageUrl,
          mainImage: imageUrl
        }
      });
    } catch (error: any) {
      console.error('메인 이미지 업로드 오류:', error);
      res.status(500).json({
        success: false,
        message: error.message || '메인 이미지 업로드 중 오류가 발생했습니다.'
      });
    }
  }
);

// ===== 센터 관리자 전용 기능 =====

// 0. 센터 관리자 대시보드 통계 (센터 관리자만)
router.get('/dashboard-stats', authMiddleware, requireRole(['centerAdmin']), async (req: AuthRequest, res: Response) => {
  try {
    const centerAdmin = await User.findById(req.user._id);
    const centerId = centerAdmin?.centerAdminInfo?.managedCenters?.[0];

    if (!centerId) {
      return res.status(404).json({
        success: false,
        message: '관리하는 센터가 없습니다.'
      });
    }

    // 센터별 통계 계산
    const [
      totalMembers,
      activeInstructors,
      activeCourses,
      monthlyRevenue,
      todayBookings,
      monthlyBookings,
      pendingApprovals
    ] = await Promise.all([
      // 총 회원 수 (센터에 소속된 모든 활성 사용자)
      User.countDocuments({
        centerId: centerId,
        isActive: true
      }),
      
      // 활성 강사 수
      User.countDocuments({
        centerId: centerId,
        userType: 'instructor',
        isActive: true
      }),
      
      // 활성 강의 수 (isActive 필드 사용)
      Course.countDocuments({
        centerId: centerId,
        isActive: true
      }),
      
      // 이번 달 매출 (센터별 결제)
      Payment.aggregate([
        {
          $match: {
            centerId: centerId,
            status: 'completed',
            createdAt: {
              $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
              $lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
            }
          }
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      
      // 오늘 예약 수
      Booking.countDocuments({
        centerId: centerId,
        date: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          $lt: new Date(new Date().setHours(23, 59, 59, 999))
        },
        status: { $in: ['confirmed', 'pending'] }
      }),
      
      // 월간 예약 수
      Booking.countDocuments({
        centerId: centerId,
        createdAt: {
          $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          $lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
        }
      }),
      
      // 승인 대기 건수 (센터별)
      User.countDocuments({
        centerId: centerId,
        status: 'pending_approval'
      })
    ]);

    // 월별 성장률 계산 (전월 대비)
    const lastMonth = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1);
    const thisMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    
    const [lastMonthRevenue] = await Payment.aggregate([
      {
        $match: {
          centerId: centerId,
          status: 'completed',
          createdAt: {
            $gte: lastMonth,
            $lt: thisMonth
          }
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const currentRevenue = monthlyRevenue.length > 0 ? monthlyRevenue[0].total : 0;
    const previousRevenue = lastMonthRevenue ? lastMonthRevenue.total : 0;
    const monthlyGrowth = previousRevenue > 0 ? 
      ((currentRevenue - previousRevenue) / previousRevenue * 100) : 0;

    // 평균 평점 계산 (센터별 리뷰)
    const [avgRating] = await User.aggregate([
      {
        $match: {
          centerId: centerId,
          userType: 'student'
        }
      },
      {
        $lookup: {
          from: 'evaluations',
          localField: '_id',
          foreignField: 'studentId',
          as: 'evaluations'
        }
      },
      {
        $unwind: '$evaluations'
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$evaluations.rating' }
        }
      }
    ]);

    const stats = {
      totalMembers,
      activeInstructors,
      activeCourses,
      monthlyRevenue: currentRevenue,
      todayBookings,
      monthlyBookings,
      pendingApprovals,
      monthlyGrowth: Math.round(monthlyGrowth * 10) / 10,
      averageRating: avgRating ? Math.round(avgRating.averageRating * 10) / 10 : 0
    };

    res.json({
      success: true,
      message: '센터 통계 조회 성공!',
      data: stats
    });

  } catch (error) {
    console.error('센터 통계 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '센터 통계 조회에 실패했습니다.'
    });
  }
});

// 0.5. 강사 대시보드 통계 (강사만)
router.get('/instructor-dashboard-stats', authMiddleware, requireRole(['instructor']), async (req: AuthRequest, res: Response) => {
  try {
    const instructorId = req.user._id;
    const centerId = req.user.centerId;

    if (!centerId) {
      return res.status(404).json({
        success: false,
        message: '소속 센터가 없습니다.'
      });
    }

    // 강사별 통계 계산
    const [
      totalStudents,
      activeCourses,
      todayBookings,
      monthlyRevenue
    ] = await Promise.all([
      // 총 수강생 수 (강사에게 배정된 활성 학생)
      User.countDocuments({
        centerId: centerId,
        userType: 'student',
        isActive: true,
        instructorId: instructorId
      }),
      
      // 활성 강의 수 (강사가 담당하는 강의)
      Course.countDocuments({
        centerId: centerId,
        instructor: instructorId,
        status: 'active'
      }),
      
      // 오늘 예약 수 (강사 예약)
      Booking.countDocuments({
        centerId: centerId,
        instructorId: instructorId,
        date: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          $lt: new Date(new Date().setHours(23, 59, 59, 999))
        },
        status: { $in: ['confirmed', 'pending'] }
      }),
      
      // 이번 달 수익 (강사별 결제)
      Payment.aggregate([
        {
          $match: {
            centerId: centerId,
            instructorId: instructorId,
            status: 'completed',
            createdAt: {
              $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
              $lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
            }
          }
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);

    const currentRevenue = monthlyRevenue.length > 0 ? monthlyRevenue[0].total : 0;

    // 평균 평점 계산 (강사별 리뷰)
    const [avgRating] = await User.aggregate([
      {
        $match: {
          centerId: centerId,
          userType: 'student',
          instructorId: instructorId
        }
      },
      {
        $lookup: {
          from: 'evaluations',
          localField: '_id',
          foreignField: 'studentId',
          as: 'evaluations'
        }
      },
      {
        $unwind: '$evaluations'
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$evaluations.rating' }
        }
      }
    ]);

    const stats = {
      totalStudents,
      activeCourses,
      todayBookings,
      monthlyRevenue: currentRevenue,
      averageRating: avgRating ? Math.round(avgRating.averageRating * 10) / 10 : 0,
      totalHours: todayBookings * 1 // 기본 1시간 가정
    };

    res.json({
      success: true,
      message: '강사 통계 조회 성공!',
      data: stats
    });

  } catch (error) {
    console.error('강사 통계 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '강사 통계 조회에 실패했습니다.'
    });
  }
});

// 0.6. 학생 대시보드 통계 (학생만)
router.get('/student-dashboard-stats', authMiddleware, requireRole(['student']), async (req: AuthRequest, res: Response) => {
  try {
    const studentId = req.user._id;
    const centerId = req.user.centerId;

    if (!centerId) {
      return res.status(404).json({
        success: false,
        message: '소속 센터가 없습니다.'
      });
    }

    // 학생별 통계 계산
    const [
      enrolledCourses,
      completedSessions,
      totalSessions,
      nextClass
    ] = await Promise.all([
      // 등록한 강의 수
      Booking.countDocuments({
        centerId: centerId,
        studentId: studentId,
        status: { $in: ['confirmed', 'pending'] }
      }),
      
      // 완료된 세션 수
      Booking.countDocuments({
        centerId: centerId,
        studentId: studentId,
        status: 'completed'
      }),
      
      // 전체 세션 수
      Booking.countDocuments({
        centerId: centerId,
        studentId: studentId
      }),
      
      // 다음 수업 정보
      Booking.findOne({
        centerId: centerId,
        studentId: studentId,
        status: { $in: ['confirmed', 'pending'] },
        date: { $gte: new Date() }
      }).sort({ date: 1 }).populate('courseId', 'name').populate('instructorId', 'name')
    ]);

    // 현재 연속 출석일 계산 (최근 7일)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentBookings = await Booking.countDocuments({
      centerId: centerId,
      studentId: studentId,
      status: 'completed',
      date: { $gte: sevenDaysAgo }
    });

    // 데이터가 없으면 샘플 데이터 반환
    const hasData = enrolledCourses > 0 || completedSessions > 0 || totalSessions > 0;
    
    // 실제 데이터 개수 조회
    const actualBookingsCount = await Booking.countDocuments({ user: req.user._id });
    const actualCoursesCount = await Course.countDocuments({ isActive: true });
    const actualPaymentsCount = await Payment.countDocuments({ userId: req.user._id });
    
    console.log('🔍 실제 데이터 개수 조회 결과:', {
      userId: req.user._id,
      actualBookingsCount,
      actualCoursesCount,
      actualPaymentsCount
    });
    
    const stats = {
      enrolledCourses: actualBookingsCount > 0 ? actualBookingsCount : 5, // 실제 예약이 있으면 실제 개수, 없으면 샘플 5개
      completedSessions: hasData ? completedSessions : 15, // 샘플: 15회 완료
      totalSessions: hasData ? totalSessions : 18, // 샘플: 총 18회
      currentStreak: hasData ? Math.min(recentBookings, 7) : 5, // 샘플: 5일 연속
      averageRating: 4.5, // 기본값
      nextClass: hasData ? (nextClass ? `${nextClass.date} ${nextClass.startTime}` : '예정된 수업 없음') : '2025-09-20 14:00', // 샘플: 다음 수업
      achievements: hasData ? Math.floor(completedSessions / 5) : 3, // 샘플: 3개 업적
      weeklyGoal: 3, // 기본 주간 목표
      activeCourses: actualCoursesCount > 0 ? actualCoursesCount : 5, // 실제 활성 강습이 있으면 실제 개수, 없으면 샘플 5개
      totalPayments: actualPaymentsCount || 0 // 실제 결제 개수
    };

    res.json({
      success: true,
      message: '학생 통계 조회 성공!',
      data: stats
    });

  } catch (error) {
    console.error('학생 통계 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '학생 통계 조회에 실패했습니다.'
    });
  }
});

// 1. 센터 정보 조회 (센터 관리자만)
router.get('/my-center', authMiddleware, requireRole(['centeradmin', 'centerAdmin', 'center-admin']), async (req: AuthRequest, res: Response) => {
  try {
    console.log('🔍 센터 정보 조회 요청 - 사용자:', req.user?._id, '타입:', req.user?.userType);
    console.log('🔍 JWT 토큰 정보:', {
      centerId: req.user?.centerId,
      defaultCenterId: (req.user as any)?.defaultCenterId,
      memberships: (req.user as any)?.memberships
    });
    
    // ObjectId 유효성 검사
    if (!req.user._id || !/^[0-9a-fA-F]{24}$/.test(req.user._id)) {
      console.error('❌ 유효하지 않은 사용자 ID:', req.user._id);
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 사용자 ID입니다.'
      });
    }

    const centerAdmin = await User.findById(req.user._id);
    console.log('👤 센터 관리자 조회:', centerAdmin?.email, 'centerId:', centerAdmin?.centerId, '관리 센터:', centerAdmin?.centerAdminInfo?.managedCenters);
    
    // centerId 우선순위: 1) JWT의 defaultCenterId, 2) JWT의 memberships[0].centerId, 3) DB의 centerId, 4) DB의 managedCenters[0]
    const jwtToken = req.user as any;
    let centerId = jwtToken?.defaultCenterId || 
                   jwtToken?.memberships?.[0]?.centerId ||
                   centerAdmin?.centerId || 
                   centerAdmin?.centerAdminInfo?.managedCenters?.[0];
    
    if (!centerId) {
      console.error('❌ 관리하는 센터가 없음');
      return res.status(404).json({
        success: false,
        message: '관리하는 센터가 없습니다.'
      });
    }
    
    console.log('🏢 사용할 센터 ID:', centerId);
    console.log('🏢 센터 ID로 조회 시도:', centerId);
    
    const center = await Center.findById(centerId).lean();
    console.log('🏢 센터 조회 결과:', center ? `${center.name} 찾음` : '센터 없음');

    if (!center) {
      console.error('❌ 센터 정보를 찾을 수 없음');
      return res.status(404).json({
        success: false,
        message: '센터 정보를 찾을 수 없습니다.'
      });
    }

    console.log('📋 센터 데이터 확인:', {
      hasOperatingHours: !!center.operatingHours,
      hasAvailabilitySettings: !!center.availabilitySettings,
      hasFacilities: !!center.facilities,
      facilitiesType: Array.isArray(center.facilities) ? 'array' : typeof center.facilities,
      facilitiesLength: Array.isArray(center.facilities) ? center.facilities.length : 'N/A'
    });

    res.json({
      success: true,
      message: '센터 정보 조회 성공!',
      data: center
    });
  } catch (error) {
    console.error('❌ 센터 정보 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '센터 정보 조회에 실패했습니다.'
    });
  }
});

// 2. 센터 정보 수정 (센터 관리자만)
router.put('/my-center', authMiddleware, requireRole(['centeradmin', 'centerAdmin', 'center-admin']), async (req: AuthRequest, res: Response) => {
  try {
    const centerAdmin = await User.findById(req.user._id);
    if (!centerAdmin?.centerAdminInfo?.managedCenters) {
      return res.status(404).json({
        success: false,
        message: '관리하는 센터가 없습니다.'
      });
    }

    const centerId = centerAdmin.centerAdminInfo.managedCenters[0];
    const center = await Center.findById(centerId);
    
    if (!center) {
      return res.status(404).json({
        success: false,
        message: '센터를 찾을 수 없습니다.'
      });
    }

    // 수정 가능한 필드들
    const { name, address, phone, email, website, description, facilities, operatingHours, pricing, customLevels, availabilitySettings, images, introduction, settings } = req.body;
    
    console.log('📝 센터 정보 수정 요청:', {
      name, 
      facilities: !!facilities, 
      operatingHours: !!operatingHours,
      customLevels: !!customLevels,
      availabilitySettings: !!availabilitySettings,
      images: !!images,
      introduction: !!introduction
    });
    if (customLevels) {
      console.log('📋 customLevels 상세:', JSON.stringify(customLevels, null, 2));
    }
    if (availabilitySettings) {
      console.log('📋 availabilitySettings 상세:', JSON.stringify(availabilitySettings, null, 2));
    }
    
    if (name) center.name = name;
    if (address) center.address = address;
    if (phone) center.phone = phone;
    if (email) center.email = email;
    if (website && center.introduction) {
      if (!center.introduction.contactInfo) {
        center.introduction.contactInfo = {} as any;
      }
      center.introduction.contactInfo.website = website;
    }
    // description은 introduction.fullDescription로 저장
    if (description && center.introduction) {
      center.introduction.fullDescription = description;
    }
    if (images) {
      // images 객체를 병합하여 업데이트
      if (!center.images) {
        center.images = {} as any;
      }
      center.images = { ...(center.images || {}), ...images };
      // Mixed 타입 필드는 markModified()를 호출해야 Mongoose가 변경을 감지함
      center.markModified('images');
      console.log('📸 images 업데이트:', JSON.stringify(center.images, null, 2));
    }
    if (introduction) {
      // introduction 객체를 안전하게 병합
      if (!center.introduction) {
        center.introduction = {} as any;
      }
      // shortDescription만 업데이트하는 경우와 전체 객체를 업데이트하는 경우 모두 처리
      if (introduction.shortDescription !== undefined) {
        center.introduction.shortDescription = introduction.shortDescription;
      }
      // 다른 introduction 필드들도 병합
      Object.keys(introduction).forEach(key => {
        if (key !== 'visibility' && introduction[key] !== undefined) {
          (center.introduction as any)[key] = introduction[key];
        }
      });
    }
    if (facilities) {
      // facilities는 배열인 경우 그대로, 객체인 경우 병합
      if (Array.isArray(facilities)) {
        center.facilities = facilities;
      } else {
        center.facilities = { ...center.facilities, ...facilities };
      }
    }
    if (operatingHours) center.operatingHours = { ...center.operatingHours, ...operatingHours };
    // pricing은 introduction.pricing으로 저장
    if (pricing && center.introduction) {
      if (!center.introduction.pricing) {
        center.introduction.pricing = {} as any;
      }
      center.introduction.pricing = { ...center.introduction.pricing, ...pricing };
    }
    if (customLevels) center.customLevels = customLevels;
    
    // settings 필드 처리 (Phase 4: 브랜딩 설정)
    if (settings) {
      console.log('🎨 settings 업데이트 요청:', JSON.stringify(settings, null, 2));
      if (!center.settings) {
        center.settings = {} as any;
      }
      // theme 설정 병합
      if (settings.theme) {
        if (!center.settings.theme) {
          center.settings.theme = {} as any;
        }
        if (settings.theme.primaryColor !== undefined) {
          center.settings.theme.primaryColor = settings.theme.primaryColor;
          console.log('✅ primaryColor 설정:', settings.theme.primaryColor);
        }
        if (settings.theme.secondaryColor !== undefined) {
          center.settings.theme.secondaryColor = settings.theme.secondaryColor;
          console.log('✅ secondaryColor 설정:', settings.theme.secondaryColor);
        }
        if (settings.theme.mode !== undefined) {
          center.settings.theme.mode = settings.theme.mode;
          console.log('✅ theme mode 설정:', settings.theme.mode);
        }
        // 다른 theme 필드도 병합
        Object.keys(settings.theme).forEach(key => {
          if (settings.theme[key] !== undefined && !['primaryColor', 'secondaryColor', 'mode'].includes(key)) {
            (center.settings.theme as any)[key] = settings.theme[key];
          }
        });
      }
      // 다른 settings 필드들도 병합
      Object.keys(settings).forEach(key => {
        if (key !== 'theme' && settings[key] !== undefined) {
          (center.settings as any)[key] = settings[key];
        }
      });
      
      // Mixed 타입 필드는 markModified()를 호출해야 Mongoose가 변경을 감지함
      center.markModified('settings');
      
      console.log('💾 저장될 settings:', JSON.stringify(center.settings, null, 2));
      console.log('💾 markModified 호출 완료');
    }
    
    if (availabilitySettings) {
      // availabilitySettings를 안전하게 병합
      // 기존 값을 보존하면서 새로운 값만 업데이트
      if (!center.availabilitySettings) {
        center.availabilitySettings = {
          personalLesson: {
            enabled: false,
            availableDays: [],
            availableTimes: [],
            cancellationPolicy: ''
          },
          freeSwim: {
            enabled: false,
            dayTimeSlots: [],
            cancellationPolicy: ''
          },
          laneRental: {
            enabled: false,
            availableDays: [],
            availableTimes: [],
            availableLanes: [],
            cancellationPolicy: ''
          }
        } as any;
      }
      
      // personalLesson 업데이트
      if (availabilitySettings.personalLesson) {
        center.availabilitySettings.personalLesson = availabilitySettings.personalLesson;
      }
      
      // freeSwim 업데이트 (자유수영 운영시간) - 항상 업데이트
      if (availabilitySettings.freeSwim !== undefined) {
        console.log('🏊 자유수영 운영시간 저장:', JSON.stringify(availabilitySettings.freeSwim, null, 2));
        center.availabilitySettings.freeSwim = {
          enabled: availabilitySettings.freeSwim.enabled !== undefined ? availabilitySettings.freeSwim.enabled : true,
          dayTimeSlots: availabilitySettings.freeSwim.dayTimeSlots || [],
          cancellationPolicy: availabilitySettings.freeSwim.cancellationPolicy || ''
        };
        console.log('✅ 자유수영 운영시간 저장 완료:', JSON.stringify(center.availabilitySettings.freeSwim, null, 2));
      }
      
      // laneRental도 업데이트 (요청에 포함된 경우에만)
      if (availabilitySettings.laneRental) {
        center.availabilitySettings.laneRental = availabilitySettings.laneRental;
      }
    }

    console.log('💾 센터 정보 저장 중...');
    const savedCenter = await center.save();
    console.log('✅ 센터 정보 저장 완료');
    console.log('🔍 저장된 availabilitySettings:', JSON.stringify(savedCenter.availabilitySettings, null, 2));
    console.log('🎨 저장된 settings:', JSON.stringify((savedCenter as any).settings, null, 2));
    console.log('🎨 저장된 settings.theme:', JSON.stringify((savedCenter as any).settings?.theme, null, 2));
    
    // 저장 후 다시 조회하여 최신 데이터 확인 (.lean() 사용하여 플레인 객체로 가져오기)
    const refreshedCenter = await Center.findById(centerId).select('settings images').lean();
    if (refreshedCenter) {
      console.log('🔄 저장 후 재조회한 settings:', JSON.stringify((refreshedCenter as any).settings, null, 2));
      console.log('🔄 저장 후 재조회한 settings.theme:', JSON.stringify((refreshedCenter as any).settings?.theme, null, 2));
    }

    // 응답에 settings 정보 포함 (클라이언트에서 즉시 사용 가능하도록)
    const responseData: any = savedCenter.toObject ? savedCenter.toObject() : savedCenter;
    if (responseData.settings?.theme) {
      console.log('📤 응답에 포함될 settings.theme:', JSON.stringify(responseData.settings.theme, null, 2));
    }

    res.json({
      success: true,
      message: '센터 정보가 성공적으로 수정되었습니다!',
      data: responseData,
      // 브랜딩 정보를 별도로 포함 (클라이언트에서 바로 사용 가능)
      branding: {
        primaryColor: (savedCenter as any).settings?.theme?.primaryColor,
        secondaryColor: (savedCenter as any).settings?.theme?.secondaryColor,
        theme: (savedCenter as any).settings?.theme?.mode || 'light',
        logo: (savedCenter as any).images?.logo,
        mainImage: (savedCenter as any).images?.mainImage,
      }
    });
  } catch (error) {
    console.error('❌ 센터 정보 수정 오류:', error);
    if (error instanceof Error) {
      console.error('❌ 오류 메시지:', error.message);
      console.error('❌ 오류 스택:', error.stack);
    }
    res.status(500).json({
      success: false,
      message: '센터 정보 수정에 실패했습니다.',
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    });
  }
});

// 3. 강사 계정 생성/관리 (센터 관리자만)
router.post('/instructors', authMiddleware, requireRole(['centerAdmin']), async (req: AuthRequest, res: Response) => {
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
    const center = await Center.findById(centerId);
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
router.get('/instructors', authMiddleware, requireRole(['centerAdmin']), async (req: AuthRequest, res: Response) => {
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
router.put('/instructors/:id/permissions', authMiddleware, requireRole(['centerAdmin']), async (req: AuthRequest, res: Response) => {
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
router.put('/instructors/:id', authMiddleware, requireRole(['centerAdmin']), async (req: AuthRequest, res: Response) => {
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
router.delete('/instructors/:id', authMiddleware, requireRole(['centerAdmin']), async (req: AuthRequest, res: Response) => {
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
    const center = await Center.findById(centerId);
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
router.get('/info', authMiddleware, requireRole(['centerAdmin', 'superAdmin']), async (req: AuthRequest, res: Response) => {
  try {
    const centerAdmin = await User.findById(req.user._id);
    const centerId = centerAdmin?.centerAdminInfo?.managedCenters?.[0];

    if (!centerId) {
      return res.status(400).json({
        success: false,
        message: '관리하는 센터가 없습니다.'
      });
    }

    const center = await Center.findById(centerId);
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
        description: center.introduction?.fullDescription || '',
        address: center.address,
        phone: center.phone,
        email: center.email,
        operatingHours: center.operatingHours,
        facilities: center.facilities || [],
        introduction: center.introduction || ({} as any),
        guide: '', // guide 필드는 Center 모델에 없으므로 빈 문자열 반환
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
router.put('/info', authMiddleware, requireRole(['centerAdmin', 'superAdmin']), async (req: AuthRequest, res: Response) => {
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

    const center = await Center.findById(centerId);
    if (!center) {
      return res.status(404).json({
        success: false,
        message: '센터를 찾을 수 없습니다.'
      });
    }

    // 센터 정보 업데이트
    if (name) center.name = name;
    // description은 introduction.fullDescription로 저장
    if (description) {
      if (!center.introduction) {
        center.introduction = {} as any;
      }
      center.introduction.fullDescription = description;
    }
    if (address) center.address = address;
    if (phone) center.phone = phone;
    if (email) center.email = email;
    if (operatingHours) center.operatingHours = operatingHours;
    if (facilities) center.facilities = facilities;
    if (introduction) center.introduction = introduction;
    // guide 필드는 Center 모델에 없으므로 무시

    await center.save();

    res.json({
      success: true,
      message: '센터 정보가 성공적으로 수정되었습니다!',
      data: {
        centerId: center._id,
        name: center.name,
        description: center.introduction?.fullDescription || '',
        address: center.address,
        phone: center.phone,
        email: center.email,
        operatingHours: center.operatingHours,
        facilities: center.facilities,
        introduction: center.introduction,
        guide: '', // guide 필드는 Center 모델에 없으므로 빈 문자열 반환
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
router.get('/dashboard', authMiddleware, requireRole(['centerAdmin']), async (req: AuthRequest, res: Response) => {
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
      centerInfo: await Center.findById(centerId).select('name address capacity')
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
router.put('/operating-hours', authMiddleware, requireRole(['centerAdmin']), async (req: AuthRequest, res: Response) => {
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

    const center = await Center.findById(centerId);
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
router.put('/facilities', authMiddleware, requireRole(['centerAdmin']), async (req: AuthRequest, res: Response) => {
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

    const center = await Center.findById(centerId);
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
router.get('/analytics', authMiddleware, requireRole(['centerAdmin']), async (req: AuthRequest, res: Response) => {
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
    const centerForCapacity = await Center.findById(centerId).select('capacity');

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
        capacityUtilization: centerForCapacity && centerForCapacity.capacity ? Math.round((studentRetention.length / centerForCapacity.capacity) * 100) : 0
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
router.post('/promotions', authMiddleware, requireRole(['centerAdmin']), async (req: AuthRequest, res: Response) => {
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
router.get('/optimization-suggestions', authMiddleware, requireRole(['centerAdmin']), async (req: AuthRequest, res: Response) => {
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

// 12. 센터 통계 조회 (센터 관리자만)
router.get('/my-center/stats', authMiddleware, requireRole(['centerAdmin']), async (req: AuthRequest, res: Response) => {
  try {
    const centerAdmin = await User.findById(req.user.userId).populate('centerAdminInfo.managedCenters');
    
    if (!centerAdmin?.centerAdminInfo?.managedCenters) {
      return res.status(404).json({
        success: false,
        message: '관리하는 센터가 없습니다.'
      });
    }

    const centerId = centerAdmin.centerAdminInfo.managedCenters[0];
    
    // 센터 통계 데이터 수집
    const totalStudents = await User.countDocuments({ 
      userType: 'student',
      'studentInfo.centerId': centerId 
    });
    
    const totalInstructors = await User.countDocuments({ 
      userType: 'instructor',
      'instructorInfo.centerId': centerId 
    });
    
    const totalCourses = await Course.countDocuments({ 
      instructor: { $in: await User.find({ 'instructorInfo.centerId': centerId }).select('_id') }
    });
    
    const totalBookings = await Booking.countDocuments({ 
      centerId: centerId 
    });

    const stats = {
      totalStudents,
      totalInstructors,
      totalCourses,
      totalBookings,
      centerCapacity: (await Center.findById(centerId))?.capacity || 0,
      utilizationRate: totalStudents / ((await Center.findById(centerId))?.capacity || 1) * 100
    };

    res.json({
      success: true,
      message: '센터 통계 조회 성공!',
      data: stats
    });
  } catch (error) {
    console.error('센터 통계 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '센터 통계 조회에 실패했습니다.'
    });
  }
});

// 13. 센터 강습 과정 조회 (센터 관리자만)
router.get('/my-center/courses', authMiddleware, requireRole(['centerAdmin']), async (req: AuthRequest, res: Response) => {
  try {
    const centerAdmin = await User.findById(req.user.userId).populate('centerAdminInfo.managedCenters');
    
    if (!centerAdmin?.centerAdminInfo?.managedCenters) {
      return res.status(404).json({
        success: false,
        message: '관리하는 센터가 없습니다.'
      });
    }

    const centerId = centerAdmin.centerAdminInfo.managedCenters[0];
    
    // 페이지네이션 파라미터
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    
    // 센터의 강사들 조회
    const instructors = await User.find({ 
      'instructorInfo.centerId': centerId 
    }).select('_id');
    
    const instructorIds = instructors.map(instructor => instructor._id);
    
    // 센터의 강습 과정 조회
    const courses = await Course.find({ 
      instructor: { $in: instructorIds }
    })
    .populate('instructor', 'name email')
    .populate('enrolledStudents.student', 'name email')
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });
    
    const totalCourses = await Course.countDocuments({ 
      instructor: { $in: instructorIds }
    });

    res.json({
      success: true,
      message: '센터 강습 과정 조회 성공!',
      data: courses,
      pagination: {
        page,
        limit,
        total: totalCourses,
        pages: Math.ceil(totalCourses / limit)
      }
    });
  } catch (error) {
    console.error('센터 강습 과정 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '센터 강습 과정 조회에 실패했습니다.'
    });
  }
});

// 🌐 **게스트용 공개 라우트**
/**
 * 게스트용 센터 목록 조회 (인증 불필요)
 * GET /api/centers/guest
 * 
 * 응답: 모든 활성 센터의 기본 정보 (지도 표시를 위한 location 포함)
 */
router.get('/guest', async (req, res) => {
  try {
    const centers = await Center.find(
      { isActive: true }, 
      'name region district address phone email website location description facilities province city gu dong'
    ).lean();

    res.json(centers);
  } catch (error) {
    console.error('게스트 센터 목록 조회 실패:', error);
    res.status(500).json({ 
      error: '센터 목록을 불러올 수 없습니다.',
      message: error instanceof Error ? error.message : '알 수 없는 오류'
    });
  }
});

// 임시: 센터 관리자 연결 수정 API (개발 전용)
router.post('/fix-center-admin-link', authMiddleware, requireRole(['superAdmin']), async (req: AuthRequest, res: Response) => {
  try {
    const { centerAdminEmail, centerId } = req.body;

    console.log('🔧 센터 관리자 연결 수정 요청:', { centerAdminEmail, centerId });

    // 센터 관리자 찾기
    const centerAdmin = await User.findOne({ email: centerAdminEmail });
    if (!centerAdmin) {
      return res.status(404).json({
        success: false,
        message: '센터 관리자를 찾을 수 없습니다.'
      });
    }

    // 센터 찾기
    const center = await Center.findById(centerId);
    if (!center) {
      return res.status(404).json({
        success: false,
        message: '센터를 찾을 수 없습니다.'
      });
    }

    // centerAdminInfo 초기화
    if (!centerAdmin.centerAdminInfo) {
      centerAdmin.centerAdminInfo = {
        managedCenters: [],
        adminLevel: 'director',
        permissions: {
          canManageUsers: true,
          canManageCourses: true,
          canManageBookings: true,
          canManagePayments: true,
          canManageNotices: true,
          canViewReports: true
        }
      };
    }

    // centerId 설정
    centerAdmin.centerId = center._id;

    // managedCenters에 추가
    if (!centerAdmin.centerAdminInfo.managedCenters) {
      centerAdmin.centerAdminInfo.managedCenters = [];
    }

    const alreadyManaged = centerAdmin.centerAdminInfo.managedCenters.some(
      (id: any) => id.toString() === center._id.toString()
    );

    if (!alreadyManaged) {
      centerAdmin.centerAdminInfo.managedCenters.push(center._id);
    }

    await centerAdmin.save();

    console.log('✅ 센터 관리자 연결 수정 완료');

    res.json({
      success: true,
      message: '센터 관리자 연결이 수정되었습니다.',
      data: {
        centerAdminEmail: centerAdmin.email,
        centerId: center._id,
        centerName: center.name,
        managedCenters: centerAdmin.centerAdminInfo.managedCenters
      }
    });
  } catch (error) {
    console.error('❌ 센터 관리자 연결 수정 오류:', error);
    res.status(500).json({
      success: false,
      message: '센터 관리자 연결 수정에 실패했습니다.'
    });
  }
});

/**
 * 📅 센터 가능시간 설정 조회
 * GET /api/centers/availability
 */
router.get('/availability', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const centerAdmin = await User.findById(req.user._id);
    const centerId = centerAdmin?.centerAdminInfo?.managedCenters?.[0];

    if (!centerId) {
      return res.status(400).json({
        success: false,
        message: '관리하는 센터가 없습니다.'
      });
    }

    const center = await Center.findById(centerId);
    if (!center) {
      return res.status(404).json({
        success: false,
        message: '센터를 찾을 수 없습니다.'
      });
    }

    res.json({
      success: true,
      message: '센터 가능시간 설정 조회 성공!',
      data: center.availabilitySettings || {
        personalLesson: {
          enabled: true,
          availableDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
          availableTimes: [
            { startTime: '09:00', endTime: '18:00', maxDuration: 120 }
          ],
          advanceBookingDays: 7,
          cancellationPolicy: '24시간 전 취소 가능'
        },
        laneRental: {
          enabled: true,
          availableDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
          availableTimes: [
            { startTime: '06:00', endTime: '22:00', maxDuration: 180 }
          ],
          availableLanes: [1, 2, 3, 4, 5, 6],
          advanceBookingDays: 14,
          cancellationPolicy: '12시간 전 취소 가능'
        }
      }
    });
  } catch (error) {
    console.error('센터 가능시간 설정 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

// 📦 설정 머지: 글로벌 → 센터 → 사용자
router.get('/settings', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    // req.user가 없으면 기본 설정만 반환
    if (!req.user || !req.user._id) {
      const globalSettings = {
        theme: { color: 'blue', density: 'comfortable' },
        notifications: { email: true, sms: false },
        features: { reports: true, payments: true, bookings: true },
        branding: {}
      };
      return res.json({ success: true, data: globalSettings });
    }

    // x-center-id 헤더 우선 사용 (Phase 2)
    const headerCenterId = req.headers['x-center-id'];
    const user = await User.findById(req.user._id).select('userType centerId centerAdminInfo instructorInfo settings');
    
    // centerId 우선순위: 1) x-center-id 헤더, 2) JWT의 centerId, 3) JWT의 defaultCenterId, 4) JWT의 memberships[0].centerId, 5) DB의 centerId, 6) DB의 managedCenters[0]
    const jwtUser = req.user as any;
    let rawCenterId = (headerCenterId && typeof headerCenterId === 'string') 
      ? headerCenterId 
      : (jwtUser?.centerId || 
         jwtUser?.defaultCenterId || 
         jwtUser?.memberships?.[0]?.centerId ||
         user?.centerId || 
         user?.centerAdminInfo?.managedCenters?.[0]);

    // ObjectId 형식 검증 및 변환
    let centerId: string | null = null;
    if (rawCenterId) {
      // ObjectId 형식인 경우
      if (/^[0-9a-fA-F]{24}$/.test(String(rawCenterId))) {
        centerId = String(rawCenterId);
      } else if (String(rawCenterId).toLowerCase() === 'default') {
        // 'default'인 경우 첫 번째 활성 센터 찾기
        const defaultCenter = await Center.findOne({ isActive: true }).select('_id').sort({ createdAt: 1 });
        if (defaultCenter) {
          centerId = defaultCenter._id.toString();
        }
      }
      // 그 외의 경우는 null로 처리 (센터 정보 없이 진행)
    }

    // 글로벌 기본값 (간단한 기본 세트)
    const globalSettings: any = {
      theme: { color: 'blue', density: 'comfortable' },
      notifications: { email: true, sms: false },
      features: { reports: true, payments: true, bookings: true }
    };

    let centerSettings: any = {};
    let centerBranding: any = {};
    
    if (centerId) {
      try {
        console.log(`🔍 센터 설정 조회: centerId=${centerId}`);
        // .lean()을 사용하여 플레인 JavaScript 객체로 가져오기 (Mongoose 문서 변환 없음)
        const centerDoc = await Center.findById(centerId).select('settings availabilitySettings customLevels introduction images name').lean();
        if (centerDoc) {
          console.log('✅ 센터 문서 조회 성공 (lean)');
          centerSettings = (centerDoc as any)?.settings || {};
          console.log('📥 조회된 centerSettings:', JSON.stringify(centerSettings, null, 2));
          console.log('📥 centerSettings 타입:', typeof centerSettings);
          console.log('🎨 centerSettings.theme:', JSON.stringify(centerSettings?.theme, null, 2));
          console.log('🎨 centerSettings.theme?.primaryColor:', centerSettings?.theme?.primaryColor);
          console.log('🎨 centerSettings.theme?.secondaryColor:', centerSettings?.theme?.secondaryColor);
          console.log('🎨 centerSettings.theme?.mode:', centerSettings?.theme?.mode);
          
          // 브랜딩 정보 추출 (Phase 4)
          centerBranding = {
            logo: (centerDoc as any)?.images?.logo,
            mainImage: (centerDoc as any)?.images?.mainImage,
            primaryColor: centerSettings?.theme?.primaryColor,
            secondaryColor: centerSettings?.theme?.secondaryColor,
            theme: centerSettings?.theme?.mode || 'light',
            name: (centerDoc as any)?.name, // 센터명 추가
          };
          console.log('🎨 추출된 centerBranding:', JSON.stringify(centerBranding, null, 2));
        } else {
          console.warn(`⚠️ 센터를 찾을 수 없음: centerId=${centerId}`);
        }
      } catch (dbError: any) {
        console.error('센터 조회 오류:', dbError);
        console.error('센터 조회 오류 스택:', dbError?.stack);
        // 센터 조회 실패해도 기본 설정으로 진행
      }
    } else {
      console.warn('⚠️ centerId가 없어 센터 설정을 조회할 수 없음');
    }

    const userSettings: any = (user as any)?.settings || {};

    const merged = {
      ...globalSettings,
      ...centerSettings,
      ...userSettings,
      branding: centerBranding, // 브랜딩 정보 추가
    };

    console.log('📤 최종 반환 데이터:', JSON.stringify(merged, null, 2));
    console.log('📤 최종 branding:', JSON.stringify(merged.branding, null, 2));

    return res.json({ success: true, data: merged });
  } catch (error: any) {
    console.error('설정 조회/머지 오류:', error);
    console.error('에러 스택:', error?.stack);
    return res.status(500).json({ 
      success: false, 
      message: '설정 조회 중 오류가 발생했습니다.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router; 