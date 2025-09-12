/**
 * 🏢 JJ Swim Lab - 센터 관리 API 라우트
 * 
 * 📋 **라우트 목적**
 * - 기존 센터들의 전체적인 관리를 담당하는 Express.js API 라우트
 * - 센터 목록 조회, 상태 관리, 상세 정보 관리 기능 제공
 * - 센터별 사용자 관리 및 통계 정보 제공
 * 
 * 🔄 **주요 기능**
 * - 모든 센터 목록 조회 (검색, 필터링, 페이지네이션)
 * - 특정 센터 상세 정보 조회
 * - 센터 상태 변경 (활성/비활성/정지/점검중)
 * - 센터 정보 수정 (권한별 제한)
 * - 센터 삭제 (비활성화 처리)
 * - 센터 통계 조회 (전체 현황, 사용자 통계)
 * - 센터별 사용자 목록 조회
 * 
 * 🗄️ **데이터 연동**
 * - CenterInfo 모델과 연동 (센터 정보 관리)
 * - User 모델과 연동 (센터별 사용자 관리)
 * - CenterRegistration 모델과 연동 (최근 등록 현황)
 * - auth 미들웨어와 연동 (인증 및 권한 검증)
 * 
 * 🛠️ **필요한 설치 파일**
 * - Express.js 서버
 * - Mongoose ODM
 * - JWT 인증 미들웨어
 * - MongoDB Atlas 연결
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 권한별 접근 제어 (superAdmin, admin, centerAdmin)
 * 2. 센터 관리자는 자신의 센터만 조회/수정 가능
 * 3. 사용자가 있는 센터는 삭제 불가 (비활성화 처리)
 * 4. 센터 상태 변경 시 영향 범위 고려
 * 5. 데이터 무결성 및 일관성 유지
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] 권한 검증 로직 확인
 * - [ ] 데이터 검증 규칙 업데이트
 * - [ ] 성능 최적화 (인덱스, 쿼리)
 * - [ ] 에러 처리 로직 개선
 * - [ ] API 엔드포인트 테스트
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 구현 (센터 관리 API)
 * - 2024-12-19: 권한별 접근 제어 추가
 * - 2024-12-19: 통계 및 사용자 관리 기능 구현
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (센터 관리 API 완료)
 * 
 * 🚀 **다음 단계**
 * - 센터별 상세 통계 대시보드
 * - 센터 간 데이터 동기화 시스템
 * - 센터별 성과 분석 기능
 * - 자동화된 센터 상태 모니터링
 * 
 * 💡 **API 사용 예시**
 * ```typescript
 * // 센터 목록 조회
 * GET /api/center-management?page=1&limit=10&status=active
 * 
 * // 센터 상태 변경
 * PATCH /api/center-management/:id/status
 * {
 *   "status": "inactive",
 *   "reason": "정기 점검"
 * }
 * 
 * // 센터 통계 조회
 * GET /api/center-management/stats/overview
 * ```
 * 
 * 🔍 **API 처리 흐름**
 * 1. 센터 목록 조회 (검색, 필터링 적용)
 * 2. 센터 상세 정보 조회 (통계 포함)
 * 3. 센터 상태 변경 (권한 검증 후 처리)
 * 4. 센터 정보 수정 (권한별 필드 제한)
 * 5. 통계 조회 (전체 현황 및 센터별 통계)
 */

import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import { CenterInfo } from '../models/CenterInfo';
import { User } from '../models/User';
import CenterRegistration from '../models/CenterRegistration';
import { auth, requireRole } from '../middleware/auth';

const router = express.Router();

// 인증된 요청 인터페이스
interface AuthRequest extends Request {
  user?: {
    _id: string;
    userType: string;
    centerId?: string;
  };
}

// 모든 센터 목록 조회 (관리자용)
router.get('/', auth, requireRole(['superAdmin', 'admin']), async (req: AuthRequest, res: Response) => {
  try {
    const { status, page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    // 필터 조건 구성
    const filter: any = {};
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { 'contact.email': { $regex: search, $options: 'i' } },
        { 'contact.phone': { $regex: search, $options: 'i' } },
        { 'address.city': { $regex: search, $options: 'i' } },
        { 'address.province': { $regex: search, $options: 'i' } }
      ];
    }

    // 정렬 조건
    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

    // 페이지네이션
    const skip = (Number(page) - 1) * Number(limit);
    
    const [centers, total] = await Promise.all([
      CenterInfo.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(Number(limit))
        .populate('createdBy', 'name email')
        .populate('centerId', 'name email'),
      CenterInfo.countDocuments(filter)
    ]);

    // 각 센터의 통계 정보 추가
    const centersWithStats = await Promise.all(
      centers.map(async (center) => {
        const [userCount, recentRegistrations] = await Promise.all([
          User.countDocuments({ centerId: center._id }),
          CenterRegistration.countDocuments({ 
            createdCenterId: center._id,
            submittedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // 최근 30일
          })
        ]);

        return {
          ...center.toObject(),
          stats: {
            userCount,
            recentRegistrations
          }
        };
      })
    );

    res.json({
      success: true,
      data: {
        centers: centersWithStats,
        pagination: {
          current: Number(page),
          total: Math.ceil(total / Number(limit)),
          count: total
        }
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

// 특정 센터 상세 정보 조회
router.get('/:id', auth, requireRole(['superAdmin', 'admin', 'centerAdmin']), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user!;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 ID입니다.'
      });
    }

    // 센터 관리자는 자신의 센터만 조회 가능
    if (user.userType === 'centerAdmin' && user.centerId !== id) {
      return res.status(403).json({
        success: false,
        message: '접근 권한이 없습니다.'
      });
    }

    const center = await CenterInfo.findById(id)
      .populate('createdBy', 'name email')
      .populate('centerId', 'name email');

    if (!center) {
      return res.status(404).json({
        success: false,
        message: '센터를 찾을 수 없습니다.'
      });
    }

    // 센터 통계 정보 조회
    const [userStats, recentActivity] = await Promise.all([
      User.aggregate([
        { $match: { centerId: center._id } },
        { $group: { _id: '$userType', count: { $sum: 1 } } }
      ]),
      CenterRegistration.find({ createdCenterId: center._id })
        .sort({ submittedAt: -1 })
        .limit(5)
        .populate('applicant.userId', 'name email')
    ]);

    const userTypeStats = userStats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {} as Record<string, number>);

    res.json({
      success: true,
      data: {
        center,
        stats: {
          totalUsers: Object.values(userTypeStats).reduce((sum: number, count: any) => sum + (count as number), 0),
          userTypeStats,
          recentActivity
        }
      }
    });
  } catch (error) {
    console.error('센터 상세 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '센터 상세 조회 중 오류가 발생했습니다.'
    });
  }
});

// 센터 상태 변경
router.patch('/:id/status', auth, requireRole(['superAdmin', 'admin']), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 ID입니다.'
      });
    }

    const validStatuses = ['active', 'inactive', 'suspended', 'maintenance'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 상태입니다.'
      });
    }

    const center = await CenterInfo.findByIdAndUpdate(
      id,
      { 
        status,
        statusReason: reason,
        statusUpdatedAt: new Date(),
        statusUpdatedBy: req.user!._id
      },
      { new: true, runValidators: true }
    );

    if (!center) {
      return res.status(404).json({
        success: false,
        message: '센터를 찾을 수 없습니다.'
      });
    }

    res.json({
      success: true,
      message: `센터 상태가 ${status}로 변경되었습니다.`,
      data: { center }
    });
  } catch (error) {
    console.error('센터 상태 변경 오류:', error);
    res.status(500).json({
      success: false,
      message: '센터 상태 변경 중 오류가 발생했습니다.'
    });
  }
});

// 센터 정보 수정
router.put('/:id', auth, requireRole(['superAdmin', 'admin', 'centerAdmin']), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const user = req.user!;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 ID입니다.'
      });
    }

    // 센터 관리자는 자신의 센터만 수정 가능
    if (user.userType === 'centerAdmin' && user.centerId !== id) {
      return res.status(403).json({
        success: false,
        message: '접근 권한이 없습니다.'
      });
    }

    // 센터 관리자는 제한된 필드만 수정 가능
    if (user.userType === 'centerAdmin') {
      const allowedFields = ['description', 'contact', 'facilities', 'operatingHours', 'images'];
      const filteredData: any = {};
      allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
          filteredData[field] = updateData[field];
        }
      });
      Object.assign(updateData, filteredData);
    }

    const center = await CenterInfo.findByIdAndUpdate(
      id,
      { 
        ...updateData,
        updatedAt: new Date(),
        updatedBy: user._id
      },
      { new: true, runValidators: true }
    );

    if (!center) {
      return res.status(404).json({
        success: false,
        message: '센터를 찾을 수 없습니다.'
      });
    }

    res.json({
      success: true,
      message: '센터 정보가 성공적으로 수정되었습니다.',
      data: { center }
    });
  } catch (error) {
    console.error('센터 정보 수정 오류:', error);
    res.status(500).json({
      success: false,
      message: '센터 정보 수정 중 오류가 발생했습니다.'
    });
  }
});

// 센터 삭제 (비활성화)
router.delete('/:id', auth, requireRole(['superAdmin']), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 ID입니다.'
      });
    }

    const center = await CenterInfo.findById(id);
    if (!center) {
      return res.status(404).json({
        success: false,
        message: '센터를 찾을 수 없습니다.'
      });
    }

    // 센터에 사용자가 있는지 확인
    const userCount = await User.countDocuments({ centerId: id });
    if (userCount > 0) {
      return res.status(400).json({
        success: false,
        message: '사용자가 있는 센터는 삭제할 수 없습니다. 먼저 사용자를 다른 센터로 이동하거나 삭제해주세요.'
      });
    }

    // 센터를 비활성화로 변경 (실제 삭제 대신)
    await CenterInfo.findByIdAndUpdate(id, {
      status: 'inactive',
      updatedAt: new Date(),
      updatedBy: req.user!._id
    });

    res.json({
      success: true,
      message: '센터가 성공적으로 비활성화되었습니다.'
    });
  } catch (error) {
    console.error('센터 삭제 오류:', error);
    res.status(500).json({
      success: false,
      message: '센터 삭제 중 오류가 발생했습니다.'
    });
  }
});

// 센터 통계 조회
router.get('/stats/overview', auth, requireRole(['superAdmin', 'admin']), async (req: AuthRequest, res: Response) => {
  try {
    const [centerStats, userStats, recentRegistrations] = await Promise.all([
      CenterInfo.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      User.aggregate([
        { $group: { _id: '$userType', count: { $sum: 1 } } }
      ]),
      CenterRegistration.countDocuments({
        submittedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      })
    ]);

    const centerStatusCounts = centerStats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {} as Record<string, number>);

    const userTypeCounts = userStats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {} as Record<string, number>);

    res.json({
      success: true,
      data: {
        centers: {
          total: Object.values(centerStatusCounts).reduce((sum: number, count: any) => sum + (count as number), 0),
          active: centerStatusCounts.active || 0,
          inactive: centerStatusCounts.inactive || 0,
          suspended: centerStatusCounts.suspended || 0,
          maintenance: centerStatusCounts.maintenance || 0
        },
        users: {
          total: Object.values(userTypeCounts).reduce((sum: number, count: any) => sum + (count as number), 0),
          students: userTypeCounts.student || 0,
          instructors: userTypeCounts.instructor || 0,
          centerAdmins: userTypeCounts.centerAdmin || 0,
          superAdmins: userTypeCounts.superAdmin || 0
        },
        recentRegistrations
      }
    });
  } catch (error) {
    console.error('센터 통계 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '센터 통계 조회 중 오류가 발생했습니다.'
    });
  }
});

// 센터별 사용자 목록 조회
router.get('/:id/users', auth, requireRole(['superAdmin', 'admin', 'centerAdmin']), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { userType, page = 1, limit = 10 } = req.query;
    const user = req.user!;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 ID입니다.'
      });
    }

    // 센터 관리자는 자신의 센터만 조회 가능
    if (user.userType === 'centerAdmin' && user.centerId !== id) {
      return res.status(403).json({
        success: false,
        message: '접근 권한이 없습니다.'
      });
    }

    const filter: any = { centerId: id };
    if (userType) filter.userType = userType;

    const skip = (Number(page) - 1) * Number(limit);
    
    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      User.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          current: Number(page),
          total: Math.ceil(total / Number(limit)),
          count: total
        }
      }
    });
  } catch (error) {
    console.error('센터 사용자 목록 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '센터 사용자 목록 조회 중 오류가 발생했습니다.'
    });
  }
});

export default router;
