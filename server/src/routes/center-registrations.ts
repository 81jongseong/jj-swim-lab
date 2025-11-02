/**
 * 🏢 JJ Swim Lab - 센터 등록 신청 API 라우트
 * 
 * 📋 **라우트 목적**
 * - 새로운 센터의 등록 신청을 처리하는 Express.js API 라우트
 * - 센터 등록 신청부터 승인/거부까지의 전체 프로세스 관리
 * - 관리자용 센터 등록 신청 목록 조회 및 통계 제공
 * 
 * 🔄 **주요 기능**
 * - 센터 등록 신청 생성 및 검증
 * - 센터 등록 신청 목록 조회 (관리자용)
 * - 특정 센터 등록 신청 상세 조회
 * - 센터 등록 승인/거부 처리
 * - 센터 등록 신청 검토 시작
 * - 센터 등록 통계 조회
 * 
 * 🗄️ **데이터 연동**
 * - CenterRegistration 모델과 연동 (센터 등록 신청 데이터)
 * - CenterInfo 모델과 연동 (승인 후 센터 정보 생성)
 * - User 모델과 연동 (센터 관리자 계정 생성)
 * - auth 미들웨어와 연동 (인증 및 권한 검증)
 * 
 * 🛠️ **필요한 설치 파일**
 * - Express.js 서버
 * - Mongoose ODM
 * - JWT 인증 미들웨어
 * - MongoDB Atlas 연결
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 관리자 권한 검증 필수 (superAdmin, admin만 접근 가능)
 * 2. 사업자등록번호 중복 검증
 * 3. 승인 시 센터 정보 및 관리자 계정 자동 생성
 * 4. 거부 시 상세한 거부 사유 기록
 * 5. 개인정보 보호 및 GDPR 준수
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] API 엔드포인트 테스트
 * - [ ] 권한 검증 로직 확인
 * - [ ] 데이터 검증 규칙 업데이트
 * - [ ] 에러 처리 로직 개선
 * - [ ] 성능 최적화 확인
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 구현 (센터 등록 신청 API)
 * - 2024-12-19: 승인/거부 처리 기능 추가
 * - 2024-12-19: 통계 조회 및 검토 기능 구현
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (센터 등록 신청 API 완료)
 * 
 * 🚀 **다음 단계**
 * - 파일 업로드 기능 추가
 * - 이메일 알림 시스템 구현
 * - 승인 프로세스 워크플로우 개선
 * - 실시간 알림 시스템 추가
 * 
 * 💡 **API 사용 예시**
 * ```typescript
 * // 센터 등록 신청 생성
 * POST /api/center-registrations
 * {
 *   "centerName": "JJ 수영센터",
 *   "businessNumber": "123-45-67890",
 *   "representativeName": "홍길동",
 *   // ... 기타 필드들
 * }
 * 
 * // 센터 등록 승인
 * POST /api/center-registrations/:id/approve
 * {
 *   "comments": "승인 완료"
 * }
 * ```
 * 
 * 🔍 **API 처리 흐름**
 * 1. 센터 등록 신청 접수 (POST /)
 * 2. 관리자 검토 및 승인/거부 처리
 * 3. 승인 시 센터 정보 및 관리자 계정 자동 생성
 * 4. 거부 시 상세한 거부 사유 기록
 * 5. 통계 및 현황 조회 (GET /stats/overview)
 */

import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import CenterRegistration from '../models/CenterRegistration';
import { User } from '../models/User';
import { CenterInfo } from '../models/CenterInfo';
import { SwimmingCenter } from '../models/SwimmingCenter';
import { authMiddleware, requireRole } from '../middleware/auth';
// import { body, validationResult } from 'express-validator';

const router = express.Router();

// 인증된 요청 인터페이스
interface AuthRequest extends Request {
  user?: {
    _id: string;
    userType: string;
    centerId?: string;
  };
}

// 센터 등록 신청 생성
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    // 기본 입력 검증
    const { centerName, businessNumber, representativeName, representativeEmail, representativePhone, password } = req.body;
    
    if (!centerName || !businessNumber || !representativeName || !representativeEmail || !representativePhone || !password) {
      return res.status(400).json({
        success: false,
        message: '필수 필드가 누락되었습니다.'
      });
    }

    const registrationData = req.body;
    
    // 중복 사업자등록번호 확인
    const existingRegistration = await CenterRegistration.findOne({
      businessNumber: registrationData.businessNumber
    });
    
    if (existingRegistration) {
      return res.status(400).json({
        success: false,
        message: '이미 등록된 사업자등록번호입니다.'
      });
    }

    // 중복 이메일 확인
    const existingUser = await User.findOne({
      email: registrationData.representativeEmail
    });
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: '이미 사용 중인 이메일입니다.'
      });
    }

    // 비밀번호 해시화
    const hashedPassword = await bcrypt.hash(password, 10);

    // 센터 등록 신청 생성
    const registration = new CenterRegistration({
      ...registrationData,
      password: hashedPassword,
      status: 'pending',
      submittedAt: new Date()
    });

    await registration.save();

    res.status(201).json({
      success: true,
      message: '센터 등록 신청이 성공적으로 제출되었습니다.',
      data: { registration }
    });
  } catch (error) {
    console.error('센터 등록 신청 생성 오류:', error);
    res.status(500).json({
      success: false,
      message: '센터 등록 신청 중 오류가 발생했습니다.'
    });
  }
});

// 센터 등록 신청 목록 조회 (관리자용)
router.get('/', authMiddleware, requireRole(['superAdmin', 'admin']), async (req: AuthRequest, res: Response) => {
  try {
    const { status, page = 1, limit = 10, search } = req.query;
    
    // 필터 조건 구성
    const filter: any = {};
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { centerName: { $regex: search, $options: 'i' } },
        { businessNumber: { $regex: search, $options: 'i' } },
        { representativeName: { $regex: search, $options: 'i' } },
        { 'applicant.name': { $regex: search, $options: 'i' } }
      ];
    }

    // 페이지네이션
    const skip = (Number(page) - 1) * Number(limit);
    
    const [registrations, total] = await Promise.all([
      CenterRegistration.find(filter)
        .sort({ submittedAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate('approvalInfo.reviewedBy', 'name email')
        .populate('approvalInfo.approvedBy', 'name email')
        .populate('approvalInfo.rejectedBy', 'name email'),
      CenterRegistration.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: {
        registrations,
        pagination: {
          current: Number(page),
          total: Math.ceil(total / Number(limit)),
          count: total
        }
      }
    });
  } catch (error) {
    console.error('센터 등록 신청 목록 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '센터 등록 신청 목록 조회 중 오류가 발생했습니다.'
    });
  }
});

// 특정 센터 등록 신청 조회
router.get('/:id', authMiddleware, requireRole(['superAdmin', 'admin']), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 ID입니다.'
      });
    }

    const registration = await CenterRegistration.findById(id)
      .populate('approvalInfo.reviewedBy', 'name email')
      .populate('approvalInfo.approvedBy', 'name email')
      .populate('approvalInfo.rejectedBy', 'name email')
      .populate('createdCenterId')
      .populate('createdCenterAdminId', 'name email');

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: '센터 등록 신청을 찾을 수 없습니다.'
      });
    }

    res.json({
      success: true,
      data: { registration }
    });
  } catch (error) {
    console.error('센터 등록 신청 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '센터 등록 신청 조회 중 오류가 발생했습니다.'
    });
  }
});

// 센터 등록 신청 승인
router.post('/:id/approve', authMiddleware, requireRole(['superAdmin', 'admin']), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { comments, assignToExistingAdminId } = req.body; // 기존 관리자에게 할당할 경우
    const user = req.user!;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 ID입니다.'
      });
    }

    const registration = await CenterRegistration.findById(id);
    if (!registration) {
      return res.status(404).json({
        success: false,
        message: '센터 등록 신청을 찾을 수 없습니다.'
      });
    }

    // 거부된 센터를 다시 승인하는 경우
    let existingSwimmingCenter = null;
    let existingCenterAdmin = null;
    
    if (registration.status === 'rejected' && registration.createdCenterId) {
      console.log('⚠️ 거부된 센터를 다시 승인합니다. 기존 데이터를 재활성화합니다.');
      existingSwimmingCenter = await SwimmingCenter.findById(registration.createdCenterId);
      existingCenterAdmin = registration.createdCenterAdminId 
        ? await User.findById(registration.createdCenterAdminId)
        : null;
    }

    // 🆕 센터 정보 생성 (SwimmingCenter 모델 사용)
    // 운영 시간을 요일별로 변환 (입력된 값만 사용, 기본값 없음)
    const weekdayOpen = registration.centerInfo.operatingHours?.weekdays?.open || '';
    const weekdayClose = registration.centerInfo.operatingHours?.weekdays?.close || '';
    const weekendOpen = registration.centerInfo.operatingHours?.weekends?.open || '';
    const weekendClose = registration.centerInfo.operatingHours?.weekends?.close || '';

    // 수영장 정보 (pools 배열에서 타입별로 추출)
    const mainPool = registration.centerInfo.pools?.find((p: any) => p.type === 'main') || registration.centerInfo.pools?.[0];
    const kidsPool = registration.centerInfo.pools?.find((p: any) => p.type === 'kids' || p.type === 'children');
    const endlessPool = registration.centerInfo.pools?.find((p: any) => p.type === 'endless' || p.type === 'warmup');
    
    console.log('🏊 수영장 정보 추출:');
    console.log('  - 메인풀:', mainPool);
    console.log('  - 유아풀:', kidsPool);
    console.log('  - 엔드리스풀:', endlessPool);
    
    // 시설 목록 추출 (enabled된 시설명만)
    const facilityNames: string[] = [];
    const facilityDetails: any = {};
    
    if (registration.centerInfo.facilities && Array.isArray(registration.centerInfo.facilities)) {
      registration.centerInfo.facilities.forEach((facility: any) => {
        if (typeof facility === 'object' && facility.enabled) {
          facilityNames.push(facility.name);
          // 상세 정보도 저장 (샤워기 개수 등)
          if (facility.details) {
            facilityDetails[facility.name] = facility.details;
          }
        } else if (typeof facility === 'string') {
          facilityNames.push(facility);
        }
      });
    }
    
    console.log('🏪 시설 정보:', facilityNames);
    console.log('📊 시설 상세:', facilityDetails);

    // 🆕 주소에서 위도/경도 추출 (Daum API에서 받아온 좌표 사용)
    const latitude = (registration.address as any).latitude || 37.5665;
    const longitude = (registration.address as any).longitude || 126.9780;
    
    // 최대 수용 인원 계산 (레인 수 × 4명 기준)
    const mainPoolCapacity = (mainPool?.laneCount || 6) * 4;
    const kidsPoolCapacity = kidsPool ? (kidsPool.laneCount || 2) * 3 : 0;
    const endlessPoolCapacity = endlessPool ? (endlessPool.laneCount || 1) * 2 : 0;
    const totalCapacity = mainPoolCapacity + kidsPoolCapacity + endlessPoolCapacity;
    
    console.log('👥 수용 인원 계산:');
    console.log('  - 메인풀:', mainPoolCapacity, '명');
    console.log('  - 유아풀:', kidsPoolCapacity, '명');
    console.log('  - 엔드리스풀:', endlessPoolCapacity, '명');
    console.log('  - 총 수용 인원:', totalCapacity, '명');
    
    // SwimmingCenter 모델로 저장 (지도에서 조회 가능)
    const swimmingCenter = new SwimmingCenter({
      name: registration.centerName,
      address: `${registration.address.address1} ${registration.address.address2 || ''}`.trim(),
      location: {
        type: 'Point',
        coordinates: [longitude, latitude] // [경도, 위도] 순서 (GeoJSON 표준)
      },
      phone: registration.representativePhone,
      email: registration.representativeEmail,
      description: registration.centerInfo.description,
      shortDescription: registration.centerInfo.description?.substring(0, 100) || '',
      maxCapacity: totalCapacity,
      facilities: {
        availablePoolLengths: registration.centerInfo.pools?.map((p: any) => p.length) || [25],
        mainPool: mainPool ? {
          lanes: mainPool.laneCount || 0,
          poolLength: mainPool.length || 0,
          poolDepth: mainPool.depth || 0,
          temperature: (mainPool as any).temperature || 0
        } : {
          lanes: 0,
          poolLength: 0,
          poolDepth: 0,
          temperature: 0
        },
        kidsPool: kidsPool ? {
          hasKidsPool: true,
          kidsPoolLanes: kidsPool.laneCount || 0,
          kidsPoolLength: kidsPool.length || 0,
          kidsPoolDepth: kidsPool.depth || 0,
          kidsPoolTemperature: (kidsPool as any).temperature || 0
        } : {
          hasKidsPool: false,
          kidsPoolLanes: 0,
          kidsPoolLength: 0,
          kidsPoolDepth: 0,
          kidsPoolTemperature: 0
        },
        endlessPool: endlessPool ? {
          hasEndlessPool: true,
          endlessPoolCount: 1,
          endlessPoolLength: endlessPool.length || 0,
          endlessPoolWidth: endlessPool.width || 0
        } : {
          hasEndlessPool: false,
          endlessPoolCount: 0,
          endlessPoolLength: 0,
          endlessPoolWidth: 0
        },
        amenities: {
          hasSauna: facilityNames.some(f => f.includes('사우나')),
          hasShower: facilityNames.some(f => f.includes('샤워')) || true,
          hasLocker: facilityNames.some(f => f.includes('락커') || f.includes('탈의')),
          hasJacuzzi: facilityNames.some(f => f.includes('자쿠지') || f.includes('월풀') || f.includes('체온유지')),
          hasSteamRoom: facilityNames.some(f => f.includes('찜질') || f.includes('스팀')),
          hasFitnessRoom: facilityNames.some(f => f.includes('PT') || f.includes('헬스') || f.includes('피트니스')),
          hasCafeteria: facilityNames.some(f => f.includes('카페') || f.includes('매점')),
          hasParking: registration.centerInfo.parkingAvailable || false,
          parkingSpaces: registration.centerInfo.parkingSpaces || 0,
          additionalFacilities: Object.keys(facilityDetails).length > 0 
            ? JSON.stringify(facilityDetails)
            : facilityNames.filter(f => !['사우나', '샤워실', '락커룸', '체온유지탕(월풀)', '찜질방', 'PT룸', '카페'].includes(f)).join(', ')
        }
      },
      operatingHours: {
        monday: { open: weekdayOpen, close: weekdayClose, isOpen: !!(weekdayOpen && weekdayClose) },
        tuesday: { open: weekdayOpen, close: weekdayClose, isOpen: !!(weekdayOpen && weekdayClose) },
        wednesday: { open: weekdayOpen, close: weekdayClose, isOpen: !!(weekdayOpen && weekdayClose) },
        thursday: { open: weekdayOpen, close: weekdayClose, isOpen: !!(weekdayOpen && weekdayClose) },
        friday: { open: weekdayOpen, close: weekdayClose, isOpen: !!(weekdayOpen && weekdayClose) },
        saturday: { open: weekendOpen, close: weekendClose, isOpen: !!(weekendOpen && weekendClose) },
        sunday: { open: weekendOpen, close: weekendClose, isOpen: !!(weekendOpen && weekendClose) }
      },
      contactInfo: {
        mainNumber: registration.representativePhone,
        email: registration.representativeEmail,
        website: (registration.centerInfo as any).website || '',
        kakaoChannel: (registration.centerInfo as any).kakaoChannel || ''
      },
      province: registration.address.province || '',
      city: registration.address.city || '',
      gu: (registration.address as any).gu || '',
      dong: (registration.address as any).dong || '',
      isActive: true,
      instructors: [],
      courses: []
    });

    // 기존 센터가 있으면 업데이트, 없으면 새로 생성
    let savedSwimmingCenter;
    if (existingSwimmingCenter) {
      // 기존 센터 재활성화 및 정보 업데이트
      Object.assign(existingSwimmingCenter, swimmingCenter.toObject());
      existingSwimmingCenter.isActive = true;
      savedSwimmingCenter = await existingSwimmingCenter.save();
      console.log('✅ SwimmingCenter 재활성화 및 업데이트:', savedSwimmingCenter._id);
    } else {
      savedSwimmingCenter = await swimmingCenter.save();
      console.log('✅ SwimmingCenter 생성 완료:', savedSwimmingCenter._id);
    }

    // 🆕 CenterInfo도 생성 (기존 호환성 유지)
    const centerInfo = new CenterInfo({
      centerId: `center-${Date.now()}`,
      name: registration.centerName,
      shortDescription: (registration.centerInfo.description || '').substring(0, 100),
      address: `${registration.address.address1} ${registration.address.address2 || ''}`.trim(),
      phone: registration.representativePhone,
      email: registration.representativeEmail,
      description: registration.centerInfo.description || '',
      businessHours: {
        monday: `${weekdayOpen}-${weekdayClose}`,
        tuesday: `${weekdayOpen}-${weekdayClose}`,
        wednesday: `${weekdayOpen}-${weekdayClose}`,
        thursday: `${weekdayOpen}-${weekdayClose}`,
        friday: `${weekdayOpen}-${weekdayClose}`,
        saturday: `${weekendOpen}-${weekendClose}`,
        sunday: `${weekendOpen}-${weekendClose}`
      },
      facilities: facilityNames.length > 0 ? facilityNames : ['샤워실', '락커룸'],
      features: mainPool ? [`메인 수영장: ${mainPool.length}m × ${mainPool.width}m × ${mainPool.depth}m (${mainPool.laneCount || 6}레인)`] : [],
      images: {
        gallery: []
      },
      instructors: [],
      courses: []
    });

    await centerInfo.save();
    console.log('✅ CenterInfo 생성 완료:', centerInfo._id);

    // 센터 관리자 계정 생성 또는 재활성화
    let savedCenterAdmin;
    
    // 기존 관리자에게 할당하는 경우
    if (assignToExistingAdminId && mongoose.Types.ObjectId.isValid(assignToExistingAdminId)) {
      const existingAdmin = await User.findById(assignToExistingAdminId);
      if (existingAdmin && existingAdmin.userType === 'centerAdmin') {
        // managedCenters에 새 센터 추가
        if (!existingAdmin.centerAdminInfo) {
          existingAdmin.centerAdminInfo = {} as any;
        }
        if (!existingAdmin.centerAdminInfo.managedCenters) {
          existingAdmin.centerAdminInfo.managedCenters = [];
        }
        
        // 이미 할당되어 있는지 확인
        const alreadyAssigned = existingAdmin.centerAdminInfo.managedCenters.some(
          (c: any) => c.toString() === savedSwimmingCenter._id.toString()
        );
        
        if (!alreadyAssigned) {
          existingAdmin.centerAdminInfo.managedCenters.push(savedSwimmingCenter._id);
          await existingAdmin.save();
          savedCenterAdmin = existingAdmin;
          console.log('✅ 기존 관리자에게 센터 추가:', savedCenterAdmin.email);
        } else {
          savedCenterAdmin = existingAdmin;
          console.log('ℹ️ 이미 해당 관리자에게 센터가 할당되어 있습니다.');
        }
      } else {
        return res.status(400).json({
          success: false,
          message: '유효하지 않은 관리자 ID입니다.'
        });
      }
    } else if (existingCenterAdmin) {
      // 기존 계정 재활성화
      existingCenterAdmin.centerId = savedSwimmingCenter._id;
      if (!existingCenterAdmin.centerAdminInfo) {
        existingCenterAdmin.centerAdminInfo = {} as any;
      }
      if (!existingCenterAdmin.centerAdminInfo.managedCenters) {
        existingCenterAdmin.centerAdminInfo.managedCenters = [];
      }
      // 중복 체크 후 추가
      const alreadyAssigned = existingCenterAdmin.centerAdminInfo.managedCenters.some(
        (c: any) => c.toString() === savedSwimmingCenter._id.toString()
      );
      if (!alreadyAssigned) {
        existingCenterAdmin.centerAdminInfo.managedCenters.push(savedSwimmingCenter._id);
      }
      existingCenterAdmin.isActive = true;
      savedCenterAdmin = await existingCenterAdmin.save();
      console.log('✅ 센터 관리자 계정 재활성화:', savedCenterAdmin.email);
    } else {
      // 새 계정 생성
      const centerAdmin = new User({
        userId: `admin-${registration.businessNumber}`,
        email: registration.representativeEmail,
        name: registration.representativeName,
        password: registration.password, // 이미 해시화된 비밀번호
        phone: registration.representativePhone,
        userType: 'centerAdmin',
        centerId: savedSwimmingCenter._id,
        centerAdminInfo: {
          centerName: registration.centerName,
          businessNumber: registration.businessNumber,
          permissions: ['center_management', 'user_management', 'course_management'],
          managedCenters: [savedSwimmingCenter._id]
        },
        isActive: true
      });
      savedCenterAdmin = await centerAdmin.save();
      console.log('✅ 센터 관리자 계정 생성:', savedCenterAdmin.email);
    }

    // 센터 등록 신청 상태 업데이트
    registration.status = 'approved';
    registration.approvalInfo = {
      ...registration.approvalInfo,
      reviewedBy: new mongoose.Types.ObjectId(user._id),
      reviewedAt: new Date(),
      approvedBy: new mongoose.Types.ObjectId(user._id),
      approvedAt: new Date(),
      comments: comments || '센터 등록이 승인되었습니다.'
    };
    registration.createdCenterId = centerInfo._id;
    registration.createdCenterAdminId = savedCenterAdmin._id;

    await registration.save();

    res.json({
      success: true,
      message: '센터 등록이 성공적으로 승인되었습니다.',
      data: {
        registration,
        swimmingCenter: {
          id: savedSwimmingCenter._id,
          name: savedSwimmingCenter.name,
          address: savedSwimmingCenter.address,
          location: savedSwimmingCenter.location
        },
        centerInfo,
        centerAdmin: {
          id: savedCenterAdmin._id,
          email: savedCenterAdmin.email,
          name: savedCenterAdmin.name,
          centerId: savedSwimmingCenter._id
        }
      }
    });
  } catch (error) {
    console.error('❌ 센터 등록 승인 오류:');
    console.error('   오류 메시지:', (error as Error).message);
    console.error('   오류 스택:', (error as Error).stack);
    console.error('   전체 오류:', error);
    res.status(500).json({
      success: false,
      message: '센터 등록 승인 중 오류가 발생했습니다.',
      error: (error as Error).message
    });
  }
});

// 센터 등록 신청 거부
router.post('/:id/reject', authMiddleware, requireRole(['superAdmin', 'admin']), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { rejectionReason, comments } = req.body;
    const user = req.user!;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 ID입니다.'
      });
    }

    const registration = await CenterRegistration.findById(id);
    if (!registration) {
      return res.status(404).json({
        success: false,
        message: '센터 등록 신청을 찾을 수 없습니다.'
      });
    }

    // 승인된 센터를 거부하는 경우, 관련 데이터도 삭제/비활성화
    if (registration.status === 'approved') {
      console.log('⚠️ 승인된 센터를 거부 처리합니다. 관련 데이터를 정리합니다.');
      
      // SwimmingCenter 비활성화 또는 삭제
      if (registration.createdCenterId) {
        const swimmingCenter = await SwimmingCenter.findById(registration.createdCenterId);
        if (swimmingCenter) {
          swimmingCenter.isActive = false;
          await swimmingCenter.save();
          console.log('✅ SwimmingCenter 비활성화:', swimmingCenter.name);
        }
      }
      
      // centerAdmin 계정의 centerId 제거
      if (registration.createdCenterAdminId) {
        const centerAdmin = await User.findById(registration.createdCenterAdminId);
        if (centerAdmin) {
          centerAdmin.centerId = undefined;
          if (centerAdmin.centerAdminInfo) {
            centerAdmin.centerAdminInfo.managedCenters = [];
          }
          await centerAdmin.save();
          console.log('✅ 센터 관리자 연결 해제:', centerAdmin.email);
        }
      }
    }

    // 센터 등록 신청 상태 업데이트
    registration.status = 'rejected';
    registration.approvalInfo = {
      ...registration.approvalInfo,
      reviewedBy: new mongoose.Types.ObjectId(user._id),
      reviewedAt: new Date(),
      rejectedBy: new mongoose.Types.ObjectId(user._id),
      rejectedAt: new Date(),
      rejectionReason,
      comments: comments || '센터 등록이 거부되었습니다.'
    };

    await registration.save();

    res.json({
      success: true,
      message: '센터 등록이 거부되었습니다.',
      data: { registration }
    });
  } catch (error) {
    console.error('센터 등록 거부 오류:', error);
    res.status(500).json({
      success: false,
      message: '센터 등록 거부 중 오류가 발생했습니다.'
    });
  }
});

// 센터 등록 신청 검토 시작
router.post('/:id/review', authMiddleware, requireRole(['superAdmin', 'admin']), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user!;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 ID입니다.'
      });
    }

    const registration = await CenterRegistration.findById(id);
    if (!registration) {
      return res.status(404).json({
        success: false,
        message: '센터 등록 신청을 찾을 수 없습니다.'
      });
    }

    if (registration.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: '검토할 수 없는 상태입니다.'
      });
    }

    // 상태를 검토중으로 변경
    registration.status = 'under_review';
    registration.approvalInfo = {
      ...registration.approvalInfo,
      reviewedBy: new mongoose.Types.ObjectId(user._id),
      reviewedAt: new Date()
    };

    await registration.save();

    res.json({
      success: true,
      message: '센터 등록 신청 검토가 시작되었습니다.',
      data: { registration }
    });
  } catch (error) {
    console.error('센터 등록 검토 시작 오류:', error);
    res.status(500).json({
      success: false,
      message: '센터 등록 검토 시작 중 오류가 발생했습니다.'
    });
  }
});

// 센터 등록 신청 통계 조회
router.get('/stats/overview', authMiddleware, requireRole(['superAdmin', 'admin']), async (req: AuthRequest, res: Response) => {
  try {
    const stats = await CenterRegistration.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const statusCounts = stats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {} as Record<string, number>);

    const total = Object.values(statusCounts).reduce((sum: number, count: any) => sum + (count as number), 0);

    res.json({
      success: true,
      data: {
        total,
        pending: statusCounts.pending || 0,
        underReview: statusCounts.under_review || 0,
        approved: statusCounts.approved || 0,
        rejected: statusCounts.rejected || 0,
        cancelled: statusCounts.cancelled || 0
      }
    });
  } catch (error) {
    console.error('센터 등록 통계 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '센터 등록 통계 조회 중 오류가 발생했습니다.'
    });
  }
});

export default router;
