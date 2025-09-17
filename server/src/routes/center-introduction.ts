/**
 * 🏢 JJ Swim Lab - 센터 소개 관리 API 라우트
 * 
 * 📋 **라우트 목적**
 * - 센터 소개 정보의 조회, 편집, 관리 API
 * - 비회원, 소속 회원, 소속 강사별 다른 정보 표시
 * - 센터 관리자가 소개 내용을 편집할 수 있는 기능
 * - 센터 검색 시 표시되는 정보 관리
 * 
 * 🔄 **주요 기능**
 * - 센터 소개 정보 조회 (권한별 다른 정보 표시)
 * - 센터 소개 정보 편집 (센터 관리자 전용)
 * - 센터 검색용 공개 정보 제공
 * - 소속 회원/강사용 상세 정보 제공
 * - 이미지 및 영상 관리
 * 
 * 🗄️ **데이터 연동**
 * - Center 모델과 연동 (센터 소개 정보)
 * - User 모델과 연동 (권한 확인)
 * - 인증 미들웨어와 연동
 * 
 * 🛠️ **필요한 설치 파일**
 * - Express.js
 * - Mongoose
 * - 인증 미들웨어 (authMiddleware, requireRole)
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 권한별 정보 표시 차별화
 * 2. 개인정보 보호 (연락처, 가격 정보)
 * 3. 이미지 업로드 보안
 * 4. 공개 정보의 정확성 검증
 * 5. 센터별 접근 권한 확인
 * 
 * 📅 **개발 히스토리**
 * - 2025-01-13: 초기 센터 소개 관리 API 구현
 * - 2025-01-13: 권한별 정보 표시 기능 추가
 * - 2025-01-13: 센터 검색 API 연동
 */

import express, { Request, Response } from 'express';
import { Center } from '../models/Center';
import { authMiddleware, requireRole } from '../middleware/auth';

const router = express.Router();

// 인터페이스 정의
interface AuthRequest extends Request {
  user?: any;
}

/**
 * 센터 소개 정보 조회 (공개용 - 비회원 포함)
 * GET /api/center-introduction/public/:centerId
 */
router.get('/public/:centerId', async (req: Request, res: Response) => {
  try {
    console.log('🔍 센터 소개 정보 조회 (공개용)');

    const { centerId } = req.params;
    
    const center = await Center.findById(centerId)
      .select('name address phone email introduction operatingHours facilities')
      .populate('managerId', 'name');

    if (!center) {
      return res.status(404).json({
        success: false,
        message: '센터를 찾을 수 없습니다.'
      });
    }

    // 공개 설정 확인
    if (!center.introduction?.visibility?.isPublic) {
      return res.status(403).json({
        success: false,
        message: '이 센터는 공개되지 않은 정보입니다.'
      });
    }

    // 공개용 정보만 반환
    const publicInfo = {
      _id: center._id,
      name: center.name,
      address: center.address,
      phone: center.phone,
      email: center.email,
      operatingHours: center.operatingHours,
      facilities: center.facilities,
      introduction: {
        shortDescription: center.introduction?.shortDescription || '',
        fullDescription: center.introduction?.fullDescription || '',
        features: center.introduction?.features || [],
        certifications: center.introduction?.certifications || [],
        images: center.introduction?.images || [],
        videoUrl: center.introduction?.videoUrl || '',
        achievements: center.introduction?.achievements || [],
        specialPrograms: center.introduction?.specialPrograms || [],
        targetAudience: center.introduction?.targetAudience || [],
        philosophy: center.introduction?.philosophy || '',
        contactInfo: {
          website: center.introduction?.contactInfo?.website || '',
          socialMedia: center.introduction?.contactInfo?.socialMedia || {},
          parkingInfo: center.introduction?.contactInfo?.parkingInfo || '',
          publicTransport: center.introduction?.contactInfo?.publicTransport || ''
        }
        // 가격 정보는 공개하지 않음
      }
    };

    res.json({
      success: true,
      message: '센터 소개 정보 조회 성공',
      data: publicInfo
    });

  } catch (error) {
    console.error('센터 소개 정보 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '센터 소개 정보를 조회할 수 없습니다.'
    });
  }
});

/**
 * 센터 소개 정보 조회 (회원/강사용)
 * GET /api/center-introduction/member/:centerId
 */
router.get('/member/:centerId', authMiddleware, requireRole(['student', 'instructor', 'centerAdmin']), async (req: AuthRequest, res: Response) => {
  try {
    console.log('🔍 센터 소개 정보 조회 (회원/강사용)');

    const { centerId } = req.params;
    const userType = (req as any).user.userType;
    const userCenterId = (req as any).user.centerId;

    const center = await Center.findById(centerId)
      .populate('managerId', 'name email')
      .populate('instructors', 'name email instructorInfo')
      .populate('students', 'name email');

    if (!center) {
      return res.status(404).json({
        success: false,
        message: '센터를 찾을 수 없습니다.'
      });
    }

    // 권한별 정보 표시 확인
    const isOwnCenter = userCenterId && userCenterId.toString() === centerId;
    const canViewMemberInfo = userType === 'centerAdmin' || 
      (userType === 'instructor' && center.introduction?.visibility?.showToInstructors) ||
      (userType === 'student' && center.introduction?.visibility?.showToMembers);

    if (!isOwnCenter && !canViewMemberInfo) {
      return res.status(403).json({
        success: false,
        message: '이 센터 정보에 접근할 권한이 없습니다.'
      });
    }

    // 회원/강사용 상세 정보 반환
    const memberInfo = {
      _id: center._id,
      name: center.name,
      address: center.address,
      phone: center.phone,
      email: center.email,
      operatingHours: center.operatingHours,
      facilities: center.facilities,
      manager: center.managerId,
      instructorCount: center.instructors.length,
      studentCount: center.students.length,
      introduction: center.introduction,
      // 소속 회원/강사는 전체 정보 접근 가능
      status: center.status,
      capacity: center.capacity
    };

    res.json({
      success: true,
      message: '센터 소개 정보 조회 성공',
      data: memberInfo
    });

  } catch (error) {
    console.error('센터 소개 정보 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '센터 소개 정보를 조회할 수 없습니다.'
    });
  }
});

/**
 * 센터 소개 정보 편집 (센터 관리자 전용)
 * PUT /api/center-introduction/:centerId
 */
router.put('/:centerId', authMiddleware, requireRole(['centerAdmin', 'superAdmin']), async (req: AuthRequest, res: Response) => {
  try {
    console.log('🔄 센터 소개 정보 편집 요청');

    const { centerId } = req.params;
    const userId = (req as any).user._id;
    const userType = (req as any).user.userType;
    const userCenterId = (req as any).user.centerId;

    // 권한 확인
    if (userType === 'centerAdmin' && (!userCenterId || userCenterId.toString() !== centerId)) {
      return res.status(403).json({
        success: false,
        message: '자신이 관리하는 센터만 편집할 수 있습니다.'
      });
    }

    const center = await Center.findById(centerId);

    if (!center) {
      return res.status(404).json({
        success: false,
        message: '센터를 찾을 수 없습니다.'
      });
    }

    const updateData = req.body;

    // 소개 정보 업데이트
    if (!center.introduction) {
      center.introduction = {
        shortDescription: '',
        fullDescription: '',
        features: [],
        certifications: [],
        images: [],
        achievements: [],
        specialPrograms: [],
        targetAudience: [],
        philosophy: '',
        history: '',
        staff: [],
        contactInfo: {
          socialMedia: {}
        },
        pricing: {
          membershipFees: [],
          lessonFees: []
        },
        visibility: {
          isPublic: true,
          showToMembers: true,
          showToInstructors: true,
          lastUpdated: new Date(),
          updatedBy: userId
        }
      };
    }

    // 업데이트할 필드만 적용
    Object.keys(updateData).forEach(key => {
      if (key !== 'visibility') {
        (center.introduction as any)[key] = updateData[key];
      }
    });

    // 가시성 설정 업데이트
    if (updateData.visibility) {
      center.introduction.visibility = {
        ...center.introduction.visibility,
        ...updateData.visibility,
        lastUpdated: new Date(),
        updatedBy: userId
      };
    } else {
      center.introduction.visibility.lastUpdated = new Date();
      center.introduction.visibility.updatedBy = userId;
    }

    await center.save();

    res.json({
      success: true,
      message: '센터 소개 정보가 성공적으로 업데이트되었습니다.',
      data: center.introduction
    });

  } catch (error) {
    console.error('센터 소개 정보 편집 오류:', error);
    res.status(500).json({
      success: false,
      message: '센터 소개 정보를 편집할 수 없습니다.'
    });
  }
});

/**
 * 센터 검색 (공개 센터 목록)
 * GET /api/center-introduction/search
 */
router.get('/search', async (req: Request, res: Response) => {
  try {
    console.log('🔍 센터 검색 요청');

    const { 
      keyword = '', 
      location = '', 
      features = '',
      page = 1, 
      limit = 10 
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // 검색 조건 구성
    const searchConditions: any = {
      status: 'active',
      'introduction.visibility.isPublic': true
    };

    if (keyword) {
      searchConditions.$or = [
        { name: { $regex: keyword, $options: 'i' } },
        { 'introduction.shortDescription': { $regex: keyword, $options: 'i' } },
        { 'introduction.features': { $in: [new RegExp(keyword as string, 'i')] } }
      ];
    }

    if (location) {
      searchConditions.address = { $regex: location, $options: 'i' };
    }

    if (features) {
      const featureList = (features as string).split(',').map(f => f.trim());
      searchConditions['introduction.features'] = { $in: featureList };
    }

    const centers = await Center.find(searchConditions)
      .select('name address phone introduction operatingHours facilities')
      .skip(skip)
      .limit(limitNum)
      .sort({ 'introduction.visibility.lastUpdated': -1 });

    const total = await Center.countDocuments(searchConditions);

    const searchResults = centers.map(center => ({
      _id: center._id,
      name: center.name,
      address: center.address,
      phone: center.phone,
      operatingHours: center.operatingHours,
      facilities: center.facilities,
      shortDescription: center.introduction?.shortDescription || '',
      features: center.introduction?.features || [],
      images: center.introduction?.images?.slice(0, 3) || [], // 최대 3개 이미지만
      targetAudience: center.introduction?.targetAudience || []
    }));

    res.json({
      success: true,
      message: '센터 검색 완료',
      data: {
        centers: searchResults,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum)
        }
      }
    });

  } catch (error) {
    console.error('센터 검색 오류:', error);
    res.status(500).json({
      success: false,
      message: '센터 검색 중 오류가 발생했습니다.'
    });
  }
});

/**
 * 이미지 업로드 (센터 관리자 전용)
 * POST /api/center-introduction/:centerId/images
 */
router.post('/:centerId/images', authMiddleware, requireRole(['centerAdmin', 'superAdmin']), async (req: AuthRequest, res: Response) => {
  try {
    console.log('📸 센터 이미지 업로드 요청');

    const { centerId } = req.params;
    const { imageUrl, description } = req.body;
    const userId = (req as any).user._id;
    const userType = (req as any).user.userType;
    const userCenterId = (req as any).user.centerId;

    // 권한 확인
    if (userType === 'centerAdmin' && (!userCenterId || userCenterId.toString() !== centerId)) {
      return res.status(403).json({
        success: false,
        message: '자신이 관리하는 센터에만 이미지를 업로드할 수 있습니다.'
      });
    }

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: '이미지 URL이 필요합니다.'
      });
    }

    const center = await Center.findById(centerId);

    if (!center) {
      return res.status(404).json({
        success: false,
        message: '센터를 찾을 수 없습니다.'
      });
    }

    // 이미지 목록에 추가
    if (!center.introduction) {
      center.introduction = {} as any;
    }
    if (!center.introduction.images) {
      center.introduction.images = [];
    }

    center.introduction.images.push(imageUrl);

    // 가시성 정보 업데이트
    if (!center.introduction.visibility) {
      center.introduction.visibility = {
        isPublic: true,
        showToMembers: true,
        showToInstructors: true,
        lastUpdated: new Date(),
        updatedBy: userId
      };
    } else {
      center.introduction.visibility.lastUpdated = new Date();
      center.introduction.visibility.updatedBy = userId;
    }

    await center.save();

    res.json({
      success: true,
      message: '이미지가 성공적으로 업로드되었습니다.',
      data: {
        imageUrl,
        totalImages: center.introduction.images.length
      }
    });

  } catch (error) {
    console.error('센터 이미지 업로드 오류:', error);
    res.status(500).json({
      success: false,
      message: '이미지 업로드 중 오류가 발생했습니다.'
    });
  }
});

export default router;
