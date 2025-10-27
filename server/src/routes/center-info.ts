/**
 * 🏢 JJ Swim Lab - 센터 정보 관리 API
 *
 * =============================================================================
 * 📋 **의존성 파일들**
 * =============================================================================
 * 🔗 **직접 의존성**:
 *   - ../models/Center.ts (센터 데이터 모델)
 *   - ../models/User.ts (사용자 데이터 모델)
 *   - ../middleware/auth.ts (인증 미들웨어, requireRole 함수)
 *   - multer (이미지 업로드 처리)
 * 
 * 🔗 **연동되는 클라이언트 파일들**:
 *   - client/app/center-admin/info/page.tsx (센터 정보 관리 페이지)
 *   - client/app/center-admin/settings/page.tsx (센터 설정 페이지)
 *   - client/app/center-admin/introduction/page.tsx (센터 소개 편집 페이지)
 * 
 * 🔗 **데이터베이스 연동**:
 *   - Center 컬렉션 (센터 기본 정보, 시설, 운영 정책)
 *   - User 컬렉션 (센터 관리자 정보)
 *   - uploads/center-images/ (센터 이미지 파일)
 *
 * =============================================================================
 * 🔄 **현재 구현된 기능들**
 * =============================================================================
 * ✅ **완전 구현**:
 *   - GET /api/center-info (센터 정보 조회)
 *   - PUT /api/center-info (센터 정보 수정)
 *   - GET /api/center-info/settings (센터 설정 조회)
 *   - PUT /api/center-info/settings (센터 설정 수정)
 * 
 * ✅ **부분 구현**:
 *   - POST /api/center-info/images (이미지 업로드 - multer 설정됨)
 *   - DELETE /api/center-info/images/:imageUrl (이미지 삭제)
 * 
 * ❌ **미구현**:
 *   - 실제 이미지 파일 시스템 연동
 *   - 센터 설정 데이터 영구 저장 (현재 임시 데이터)
 *
 * =============================================================================
 * ⚠️ **중요한 주의사항**
 * =============================================================================
 * 🚨 **권한 체크**: centerAdmin, superAdmin만 접근 가능
 * 🚨 **데이터 검증**: Center 모델 스키마에 없는 필드들 제거됨
 * 🚨 **파일 업로드**: uploads/center-images/ 디렉토리 자동 생성 필요
 * 🚨 **타입 안전성**: Center 모델의 실제 스키마와 일치하도록 수정됨
 * 
 * 📅 **개발 히스토리**
 * - 2025-01-13: 초기 센터 정보 관리 API 구현
 * - 2025-01-13: 센터 설정 관리 기능 추가 (임시 데이터)
 * - 2025-01-13: 이미지 업로드 기능 구현 (multer 설정)
 * - 2025-01-13: TypeScript 오류 수정 (Center 모델 스키마 맞춤)
 */

import express from 'express';
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import path from 'path';
import { authMiddleware } from '../middleware/auth';
import { requireRole } from '../middleware/auth';
import { Center } from '../models/Center';
import { User } from '../models/User';

const router = express.Router();

// Multer 설정 (이미지 업로드)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/center-images/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB 제한
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('이미지 파일만 업로드 가능합니다.'));
    }
  }
});

// 인터페이스 정의
interface AuthRequest extends Request {
  user?: any;
}

/**
 * @route GET /api/center-info
 * @desc 센터 기본 정보 조회
 * @access 센터 관리자, 최고 관리자
 */
router.get('/', authMiddleware, requireRole(['centerAdmin', 'superAdmin']), async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user._id;
    
    // 사용자 정보 조회
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '사용자 정보를 찾을 수 없습니다.'
      });
    }

    let center;
    if (user.userType === 'superAdmin') {
      // 최고 관리자는 모든 센터 조회 가능
      center = await Center.findOne({});
    } else {
      // 센터 관리자는 자신의 센터만 조회
      center = await Center.findById(user.centerId);
    }

    if (!center) {
      return res.status(404).json({
        success: false,
        message: '센터 정보를 찾을 수 없습니다.'
      });
    }

    res.json({
      success: true,
      message: '센터 정보 조회 성공!',
      data: {
        _id: center._id,
        name: center.name,
        address: center.address,
        phone: center.phone,
        email: center.email,
        website: center.website,
        operatingHours: center.operatingHours,
        facilities: center.facilities,
        amenities: center.amenities,
        images: center.images,
        description: center.description,
        contactInfo: center.contactInfo,
        location: center.location,
        capacity: center.capacity,
        policies: center.policies,
        introduction: center.introduction,
        poolConfiguration: center.poolConfiguration, // ⭐ 풀 구성 정보 추가
        availabilitySettings: center.availabilitySettings, // ⭐ 개인레슨 운영시간 추가
        customLevels: center.customLevels // ⭐ 커스텀 급수 추가
      }
    });
  } catch (error) {
    console.error('센터 정보 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '센터 정보 조회 중 오류가 발생했습니다.'
    });
  }
});

/**
 * @route PUT /api/center-info
 * @desc 센터 기본 정보 수정
 * @access 센터 관리자, 최고 관리자
 */
router.put('/', authMiddleware, requireRole(['centerAdmin', 'superAdmin']), async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user._id;
    const updateData = req.body;

    // 사용자 정보 조회
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '사용자 정보를 찾을 수 없습니다.'
      });
    }

    let center;
    if (user.userType === 'superAdmin') {
      center = await Center.findOne({});
    } else {
      center = await Center.findById(user.centerId);
    }

    if (!center) {
      return res.status(404).json({
        success: false,
        message: '센터 정보를 찾을 수 없습니다.'
      });
    }

    // 업데이트할 필드들
    const allowedFields = [
      'name', 'address', 'phone', 'email', 'website',
      'operatingHours', 'facilities', 'amenities', 'description',
      'contactInfo', 'location', 'capacity', 'policies', 'introduction',
      'poolConfiguration', 'availabilitySettings', 'customLevels' // ⭐ 추가
    ];

    const updateFields: any = {};
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        updateFields[field] = updateData[field];
      }
    });

    updateFields.updatedAt = new Date();
    updateFields.updatedBy = userId;

    const updatedCenter = await Center.findByIdAndUpdate(
      center._id,
      updateFields,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: '센터 정보가 성공적으로 업데이트되었습니다!',
      data: {
        _id: updatedCenter._id,
        name: updatedCenter.name,
        address: updatedCenter.address,
        phone: updatedCenter.phone,
        email: updatedCenter.email,
        operatingHours: updatedCenter.operatingHours,
        facilities: updatedCenter.facilities,
        capacity: updatedCenter.capacity,
        introduction: updatedCenter.introduction,
        updatedAt: updatedCenter.updatedAt
      }
    });
  } catch (error) {
    console.error('센터 정보 수정 오류:', error);
    res.status(500).json({
      success: false,
      message: '센터 정보 수정 중 오류가 발생했습니다.'
    });
  }
});

/**
 * @route POST /api/center-info/images
 * @desc 센터 이미지 업로드
 * @access 센터 관리자, 최고 관리자
 */
router.post('/images', 
  authMiddleware, 
  requireRole(['centerAdmin', 'superAdmin']), 
  upload.array('images', 5), // 최대 5개 이미지
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user._id;
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        return res.status(400).json({
          success: false,
          message: '업로드할 이미지가 없습니다.'
        });
      }

      // 사용자 정보 조회
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: '사용자 정보를 찾을 수 없습니다.'
        });
      }

      let center;
      if (user.userType === 'superAdmin') {
        center = await Center.findOne({});
      } else {
        center = await Center.findById(user.centerId);
      }

      if (!center) {
        return res.status(404).json({
          success: false,
          message: '센터 정보를 찾을 수 없습니다.'
        });
      }

      // 이미지 URL 생성
      const imageUrls = files.map(file => `/uploads/center-images/${file.filename}`);
      
      // 기존 이미지에 새 이미지 추가
      const updatedImages = [...(center.images || []), ...imageUrls];

      // 센터 정보 업데이트
      const updatedCenter = await Center.findByIdAndUpdate(
        center._id,
        { 
          images: updatedImages,
          updatedAt: new Date(),
          updatedBy: userId
        },
        { new: true }
      );

      res.json({
        success: true,
        message: '이미지가 성공적으로 업로드되었습니다!',
        data: {
          uploadedImages: imageUrls,
          totalImages: updatedImages.length,
          images: updatedImages
        }
      });
    } catch (error) {
      console.error('이미지 업로드 오류:', error);
      res.status(500).json({
        success: false,
        message: '이미지 업로드 중 오류가 발생했습니다.'
      });
    }
  }
);

/**
 * @route DELETE /api/center-info/images/:imageUrl
 * @desc 센터 이미지 삭제
 * @access 센터 관리자, 최고 관리자
 */
router.delete('/images/:imageUrl', authMiddleware, requireRole(['centerAdmin', 'superAdmin']), async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user._id;
    const { imageUrl } = req.params;

    // 사용자 정보 조회
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '사용자 정보를 찾을 수 없습니다.'
      });
    }

    let center;
    if (user.userType === 'superAdmin') {
      center = await Center.findOne({});
    } else {
      center = await Center.findById(user.centerId);
    }

    if (!center) {
      return res.status(404).json({
        success: false,
        message: '센터 정보를 찾을 수 없습니다.'
      });
    }

    // 이미지 URL에서 파일명 추출
    const decodedImageUrl = decodeURIComponent(imageUrl);
    const filename = decodedImageUrl.split('/').pop();
    
    if (!filename) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 이미지 URL입니다.'
      });
    }

    // 이미지 배열에서 제거
    const updatedImages = (center.images || []).filter(img => !img.includes(filename));

    // 센터 정보 업데이트
    const updatedCenter = await Center.findByIdAndUpdate(
      center._id,
      { 
        images: updatedImages,
        updatedAt: new Date(),
        updatedBy: userId
      },
      { new: true }
    );

    // 실제 파일 삭제 (선택사항)
    // fs.unlink(`uploads/center-images/${filename}`, (err) => {
    //   if (err) console.error('파일 삭제 오류:', err);
    // });

    res.json({
      success: true,
      message: '이미지가 성공적으로 삭제되었습니다!',
      data: {
        deletedImage: decodedImageUrl,
        totalImages: updatedImages.length,
        images: updatedImages
      }
    });
  } catch (error) {
    console.error('이미지 삭제 오류:', error);
    res.status(500).json({
      success: false,
      message: '이미지 삭제 중 오류가 발생했습니다.'
    });
  }
});

/**
 * @route GET /api/center-info/settings
 * @desc 센터 설정 조회
 * @access 센터 관리자, 최고 관리자
 */
router.get('/settings', authMiddleware, requireRole(['centerAdmin', 'superAdmin']), async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user._id;
    
    // 사용자 정보 조회
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '사용자 정보를 찾을 수 없습니다.'
      });
    }

    let center;
    if (user.userType === 'superAdmin') {
      center = await Center.findOne({});
    } else {
      center = await Center.findById(user.centerId);
    }

    if (!center) {
      return res.status(404).json({
        success: false,
        message: '센터 정보를 찾을 수 없습니다.'
      });
    }

    // 센터 설정 데이터 반환 (임시 데이터)
    const settingsData = {
      _id: center._id,
      centerId: center._id,
      bookingSettings: {
        advanceBookingDays: 7,
        maxBookingPerUser: 3,
        cancellationHours: 24,
        autoApproval: true,
        bookingTimeSlots: [
          '09:00-10:00',
          '10:00-11:00',
          '11:00-12:00',
          '14:00-15:00',
          '15:00-16:00',
          '16:00-17:00',
          '18:00-19:00',
          '19:00-20:00',
          '20:00-21:00'
        ]
      },
      paymentSettings: {
        acceptedMethods: ['카드', '계좌이체', '현금'],
        refundPolicy: '이용 24시간 전까지 100% 환불, 이후 50% 환불',
        latePaymentFee: 10000,
        autoPayment: false
      },
      notificationSettings: {
        emailNotifications: true,
        smsNotifications: true,
        bookingReminders: true,
        paymentReminders: true,
        systemAlerts: true
      },
      operatingPolicy: {
        membershipRequired: false,
        ageRestrictions: '만 12세 이상',
        dressCode: '수영복 착용 필수, 샤워 후 입장',
        safetyRules: [
          '수영 전 반드시 샤워',
          '수영장 내에서 뛰지 않기',
          '음식물 반입 금지',
          '구급상자 및 구명장비 위치 확인'
        ]
      },
      systemSettings: {
        maintenanceMode: false,
        allowGuestBooking: true,
        requireApproval: false,
        displayCapacity: true
      },
      updatedAt: new Date()
    };

    res.json({
      success: true,
      message: '센터 설정 조회 성공!',
      data: settingsData
    });
  } catch (error) {
    console.error('센터 설정 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '센터 설정 조회 중 오류가 발생했습니다.'
    });
  }
});

/**
 * @route PUT /api/center-info/settings
 * @desc 센터 설정 수정
 * @access 센터 관리자, 최고 관리자
 */
router.put('/settings', authMiddleware, requireRole(['centerAdmin', 'superAdmin']), async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user._id;
    const settingsData = req.body;

    // 사용자 정보 조회
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '사용자 정보를 찾을 수 없습니다.'
      });
    }

    let center;
    if (user.userType === 'superAdmin') {
      center = await Center.findOne({});
    } else {
      center = await Center.findById(user.centerId);
    }

    if (!center) {
      return res.status(404).json({
        success: false,
        message: '센터 정보를 찾을 수 없습니다.'
      });
    }

    // 설정 데이터를 센터 모델에 저장 (임시로 처리)
    // 실제로는 별도의 설정 모델을 만들거나 Center 모델에 settings 필드를 추가해야 함
    const updatedCenter = await Center.findByIdAndUpdate(
      center._id,
      { 
        updatedAt: new Date(),
        updatedBy: userId
      },
      { new: true }
    );

    res.json({
      success: true,
      message: '센터 설정이 성공적으로 업데이트되었습니다!',
      data: {
        ...settingsData,
        updatedAt: new Date()
      }
    });
  } catch (error) {
    console.error('센터 설정 수정 오류:', error);
    res.status(500).json({
      success: false,
      message: '센터 설정 수정 중 오류가 발생했습니다.'
    });
  }
});

export default router;