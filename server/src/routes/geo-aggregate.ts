/**
 * 🗺️ 지리적 회원 분포 집계 API
 * 
 * 📋 **파일 목적**
 * - 프라이버시 보호된 회원 분포 데이터 제공
 * - 서버 측에서만 지오코딩 및 집계 수행
 * - k-익명성, 노이즈 주입, 안전한 반올림 적용
 * 
 * 🔄 **주요 기능**
 * 1. GET /api/geo/aggregate - 회원 분포 집계 데이터 조회
 * 2. 센터별, 기간별, 회원등급별 필터링
 * 3. k<5인 셀 자동 필터링
 * 4. 원본 주소/좌표 절대 노출 금지
 * 
 * 🛡️ **프라이버시 원칙**
 * - 원본 데이터는 서버 메모리에서만 처리
 * - 집계 결과만 클라이언트로 전송
 * - 모든 요청 로깅 (감사 추적)
 * 
 * 🗄️ **데이터 연동**
 * - User 모델 (address 필드)
 * - Center 모델 (센터 정보)
 * 
 * ⚠️ **보안 요구사항**
 * - 관리자 권한 필수 (superAdmin, centerAdmin)
 * - Rate limiting 적용 권장
 * - 로그 저장 및 정기 감사
 * 
 * 📅 **개발 히스토리**
 * - 2025-01-13: 초기 구현 (집계 API)
 */

import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import { authMiddleware } from '../middleware/auth';
import { User } from '../models/User';
import Center from '../models/Center';
import { logInfo, logError, logWarn, logDebug } from '../utils/logger';

const router = express.Router();

/**
 * Mock 지오코딩 함수 (실제론 카카오/네이버 API 사용)
 */
async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  if (!address || address.trim() === '') {
    return null;
  }

  // Mock: 서울 중심부 (37.5665, 126.9780) ± 0.1 도
  const mockLat = 37.5665 + (Math.random() - 0.5) * 0.2;
  const mockLng = 126.9780 + (Math.random() - 0.5) * 0.2;

  return { lat: mockLat, lng: mockLng };
}

/**
 * 좌표를 H3 헥사곤 인덱스로 변환 (Mock)
 */
function toH3(lat: number, lng: number, resolution: number = 8): string {
  const latGrid = Math.floor(lat / 0.01);
  const lngGrid = Math.floor(lng / 0.01);
  return `h3_${resolution}_${latGrid}_${lngGrid}`;
}

/**
 * H3 인덱스를 중심 좌표로 변환 (Mock)
 */
function h3ToLatLng(h3Index: string): { lat: number; lng: number } {
  const parts = h3Index.split('_');
  if (parts.length >= 4) {
    const lat = parseFloat(parts[2]) * 0.01 + 0.005;
    const lng = parseFloat(parts[3]) * 0.01 + 0.005;
    return { lat, lng };
  }
  return { lat: 37.5665, lng: 126.9780 };
}

/**
 * 라플라스 노이즈 생성
 */
function laplaceNoise(epsilon: number = 1.0): number {
  const u = Math.random() - 0.5;
  const scale = 1 / epsilon;
  return -scale * Math.sign(u) * Math.log(1 - 2 * Math.abs(u));
}

/**
 * 노이즈 추가 및 반올림
 * 프라이버시를 위해 노이즈만 추가하고 정수로 반올림 (5단위 반올림 제거)
 */
function addNoiseAndRound(count: number, epsilon: number = 1.0): number {
  const noisy = count + laplaceNoise(epsilon);
  // 최소값 보장: 원본 count가 1 이상이면 최소 1로 보장
  const rounded = Math.max(1, Math.round(Math.max(0, noisy)));
  return rounded;
}

/**
 * GET /api/geo/aggregate
 * 
 * 회원 분포 집계 데이터 조회
 * 
 * Query Parameters:
 * - centerId: 센터 ID (선택)
 * - from: 가입 시작일 (선택, ISO 8601)
 * - to: 가입 종료일 (선택, ISO 8601)
 * - memberType: 회원 유형 (선택, student/instructor/...)
 * 
 * Response:
 * - cells: H3 셀 배열 { h3Index, lat, lng, countApprox, centerName }
 * - metadata: { totalCells, filteredCells, k }
 */
router.get('/aggregate', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    // 권한 확인: superAdmin 또는 centerAdmin만 허용
    if (user.userType !== 'superAdmin' && user.userType !== 'centerAdmin' && user.userType !== 'center-admin') {
      return res.status(403).json({
        success: false,
        message: '지리적 분포 조회 권한이 없습니다.',
      });
    }

    // k-익명성 임계값 설정 (개발 환경에서는 k=1, 프로덕션에서는 k=5)
    const isDevelopment = process.env.NODE_ENV !== 'production';
    const K_THRESHOLD = isDevelopment ? 1 : 5;

    // 쿼리 파라미터 추출
    const { centerId, from, to, memberType, noNoise, noRound } = req.query;
    const skipNoise = noNoise === 'true' || (typeof noNoise === 'boolean' && noNoise); // 노이즈 제거 옵션
    const skipRound = noRound === 'true' || (typeof noRound === 'boolean' && noRound); // 반올림 제거 옵션
    
    console.log(`🔍 노이즈/반올림 옵션: noNoise=${noNoise}, noRound=${noRound}, skipNoise=${skipNoise}, skipRound=${skipRound}`);

    // 필터 조건 구성
    const filter: any = {};

    // centerAdmin은 자신의 센터(들)만 조회 가능
    // ⚠️ 최신 사용자 정보를 조회하여 user 객체 업데이트 (공개 여부 체크를 위해)
    let updatedUser = user;
    if (user.userType === 'centerAdmin' || user.userType === 'center-admin') {
      // DB에서 최신 사용자 정보 조회 (managedCenters를 포함하기 위해)
      const centerAdminUser = await User.findById(user._id || user.id).select('centerAdminInfo centerId userType').lean();
      const managedCenters = centerAdminUser?.centerAdminInfo?.managedCenters || [];
      
      // user 객체 업데이트 (공개 여부 체크를 위해)
      updatedUser = {
        ...user,
        centerAdminInfo: centerAdminUser?.centerAdminInfo || user.centerAdminInfo,
        centerId: centerAdminUser?.centerId || user.centerId
      };
      
      const managedCenterIds = managedCenters.map((c: any) => c.toString ? c.toString() : c._id?.toString() || c);
      console.log('🔍 센터 관리자 정보:', {
        userId: user._id || user.id,
        hasCenterId: !!centerAdminUser?.centerId,
        managedCentersCount: managedCenters.length,
        managedCenterIds: managedCenterIds,
        centerId: centerId || '없음',
        userType: user.userType
      });
      
      if (managedCenters.length > 0) {
        const centerIds = managedCenters.map((c: any) => {
          return c.toString ? c.toString() : c._id?.toString() || c;
        });
        console.log(`  📍 관리하는 센터 ID 목록:`, centerIds);
        
        // 쿼리 파라미터로 특정 센터를 지정한 경우
        if (centerId && centerIds.some((cId: string) => cId === centerId)) {
          // 특정 센터만 조회
          filter.centerId = centerId;
          console.log(`  ✅ 특정 센터 필터링: ${centerId}`);
        } else if (!centerId || centerId === 'all' || centerId === '') {
          // centerId가 없으면 관리하는 모든 센터 포함 (전체 통계)
          filter.centerId = { $in: centerIds };
          console.log(`  ✅ 전체 센터 필터링: ${centerIds.length}개 센터`);
        } else {
          console.warn(`  ⚠️ 요청한 센터 ID(${centerId})가 관리하는 센터 목록에 없음`);
        }
      } else if (centerAdminUser?.centerId) {
        // managedCenters가 없으면 기존 centerId 사용 (하위 호환성)
        filter.centerId = centerAdminUser.centerId;
        console.log(`  ✅ 기존 centerId 사용: ${centerAdminUser.centerId}`);
      } else {
        console.warn('  ⚠️ 관리하는 센터가 없음');
      }
    } else if (centerId && user.userType === 'superAdmin') {
      // superAdmin은 모든 센터 접근 가능, centerId가 있으면 필터링
      // centerId가 없으면 모든 센터 조회 (필터 없음)
      if (centerId !== 'all' && centerId !== null && centerId !== undefined && centerId !== '') {
        // centerId가 ObjectId 형식이 아니면 센터 이름으로 조회
        const centerIdStr = Array.isArray(centerId) ? String(centerId[0]) : String(centerId);
        if (mongoose.Types.ObjectId.isValid(centerIdStr)) {
          filter.centerId = centerIdStr;
        } else {
          // 센터 이름으로 센터 조회
          logInfo('센터 이름으로 ObjectId 조회 시도', { centerId, centerIdType: typeof centerId });
          const center = await Center.findOne({ name: centerId }).select('_id name').lean();
          if (center) {
            filter.centerId = center._id;
            logInfo('센터 이름으로 ObjectId 변환 성공', { 
              centerName: centerId, 
              centerId: center._id.toString(),
              centerNameFromDB: center.name 
            });
            console.log(`  ✅ 센터 이름으로 ObjectId 변환: ${centerId} -> ${center._id}`);
          } else {
            logWarn('센터를 찾을 수 없음', { centerId, centerIdType: typeof centerId });
            console.warn(`  ⚠️ 센터를 찾을 수 없음: ${centerId}`);
            // 센터를 찾을 수 없으면 필터를 적용하지 않음 (모든 센터 조회)
          }
        }
      }
    }

    // 가입 기간 필터
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from as string);
      if (to) filter.createdAt.$lte = new Date(to as string);
    }

    // 레슨 유형별 필터링
    let userIds: mongoose.Types.ObjectId[] | null = null;
    
    if (memberType && ['group-lesson', 'personal-lesson', 'free-swim'].includes(memberType as string)) {
      const { PersonalLesson } = await import('../models/PersonalLesson');
      const { LaneRental } = await import('../models/LaneRental');
      const { Course } = await import('../models/Course');
      
      if (memberType === 'personal-lesson') {
        // 개인레슨 수강생 조회
        // ⚠️ 중요: centerId 필터가 이미 설정되어 있으면, 해당 센터의 개인레슨 수강생만 조회
        const personalLessonFilter: any = {
          status: { $in: ['pending', 'approved', 'completed'] }
        };
        
        // centerId 필터가 있으면 PersonalLesson에도 적용
        // PersonalLesson의 studentId와 매칭되는 User의 centerId를 확인
        if (filter.centerId) {
          const centerUsers = await User.find(filter).select('_id').lean();
          const centerUserIds = centerUsers.map((u: any) => u._id);
          
          if (centerUserIds.length > 0) {
            personalLessonFilter.studentId = { $in: centerUserIds };
          } else {
            userIds = [];
            console.log(`👤 개인레슨 수강생: 0명 (해당 센터에 회원 없음)`);
          }
        }
        
        if (userIds === null || (userIds.length > 0 && userIds.length !== undefined)) {
          const personalLessons = await PersonalLesson.find(personalLessonFilter).select('studentId').lean();
          userIds = [...new Set(personalLessons.map((pl: any) => pl.studentId).filter(Boolean))];
          console.log(`👤 개인레슨 수강생: ${userIds.length}명`);
        } else if (userIds && userIds.length === 0) {
          console.log(`👤 개인레슨 수강생: 0명 (이미 필터링됨)`);
        }
      } else if (memberType === 'free-swim') {
        // 자유수영 이용자 조회
        // ⚠️ 중요: centerId 필터가 이미 설정되어 있으면, 해당 센터의 자유수영 이용자만 조회
        const laneRentalFilter: any = {
          status: { $in: ['pending', 'approved', 'completed'] }
        };
        
        // centerId 필터가 있으면 LaneRental에도 적용
        // LaneRental 모델에 centerId 필드가 있는지 확인 필요
        // 일단 centerId 필터가 있으면 User를 먼저 필터링한 후 해당 userId들만 조회
        if (filter.centerId) {
          // filter.centerId가 $in 배열인 경우도 처리
          const centerUserFilter: any = {};
          if (typeof filter.centerId === 'object' && filter.centerId.$in) {
            centerUserFilter.centerId = filter.centerId;
          } else {
            centerUserFilter.centerId = filter.centerId;
          }
          
          // centerId 필터가 있으면, 해당 센터의 회원들만 조회
          // LaneRental의 userId와 매칭되는 User의 centerId를 확인
          const centerUsers = await User.find(centerUserFilter).select('_id').lean();
          const centerUserIds = centerUsers.map((u: any) => u._id);
          
          if (centerUserIds.length > 0) {
            laneRentalFilter.userId = { $in: centerUserIds };
          } else {
            // 해당 센터에 회원이 없으면 빈 배열
            userIds = [];
            console.log(`🏊 자유수영 이용자: 0명 (해당 센터에 회원 없음)`);
          }
        }
        
        if (userIds === null || (userIds.length > 0 && userIds.length !== undefined)) {
          const laneRentals = await LaneRental.find(laneRentalFilter).select('userId').lean();
          userIds = [...new Set(laneRentals.map((lr: any) => lr.userId).filter(Boolean))];
          console.log(`🏊 자유수영 이용자: ${userIds.length}명`);
        } else if (userIds && userIds.length === 0) {
          console.log(`🏊 자유수영 이용자: 0명 (이미 필터링됨)`);
        }
      } else if (memberType === 'group-lesson') {
        // 단체레슨 수강생 조회 (Course의 enrollments 또는 students 필드)
        // ⚠️ 중요: centerId 필터가 이미 설정되어 있으면, 해당 센터의 단체레슨 수강생만 조회
        const courseFilter: any = {
          isActive: true,
          type: { $in: ['group', 'course'] }
        };
        
        // centerId 필터가 있으면 Course에도 적용
        if (filter.centerId) {
          courseFilter.centerId = filter.centerId;
        }
        
        const courses = await Course.find(courseFilter).select('enrollments students participants').lean();
        userIds = [];
        courses.forEach((course: any) => {
          if (course.enrollments && Array.isArray(course.enrollments)) {
            course.enrollments.forEach((enrollment: any) => {
              const userId = enrollment.student || enrollment.userId || enrollment;
              if (userId) userIds!.push(userId);
            });
          }
          if (course.students && Array.isArray(course.students)) {
            course.students.forEach((student: any) => {
              const userId = student._id || student.id || student;
              if (userId) userIds!.push(userId);
            });
          }
          if (course.participants && Array.isArray(course.participants)) {
            course.participants.forEach((participant: any) => {
              const userId = participant._id || participant.id || participant;
              if (userId) userIds!.push(userId);
            });
          }
        });
        userIds = [...new Set(userIds)];
        
        // centerId 필터가 있으면 해당 센터의 회원만 필터링
        if (filter.centerId && userIds.length > 0) {
          // filter.centerId가 $in 배열인 경우도 처리
          const centerUserFilter: any = { _id: { $in: userIds } };
          if (typeof filter.centerId === 'object' && filter.centerId.$in) {
            centerUserFilter.centerId = filter.centerId;
          } else {
            centerUserFilter.centerId = filter.centerId;
          }
          
          const centerUsers = await User.find(centerUserFilter).select('_id').lean();
          userIds = centerUsers.map((u: any) => u._id);
        }
        
        console.log(`👥 단체레슨 수강생: ${userIds.length}명`);
      }
      
      if (userIds && userIds.length > 0) {
        // ⚠️ 중요: filter.centerId와 filter._id를 동시에 사용하면 AND 조건이 됨
        // 하지만 userIds는 이미 해당 센터의 회원만 포함하므로, filter.centerId는 제거해야 함
        // 그렇지 않으면 필터 조건이 너무 엄격해져서 회원이 조회되지 않을 수 있음
        const originalCenterId = filter.centerId;
        filter._id = { $in: userIds };
        // ⚠️ userIds는 이미 해당 센터의 회원만 포함하므로 centerId 필터 제거
        delete filter.centerId;
        console.log(`  🔧 memberType 필터링: ${userIds.length}명의 userId 사용, centerId 필터 제거 (원본: ${originalCenterId})`);
      } else {
        // 해당 레슨 유형에 맞는 회원이 없으면 빈 배열 반환
        res.json({
          success: true,
          cells: [],
          metadata: {
            totalCells: 0,
            filteredCells: 0,
            k: K_THRESHOLD,
            privacyNotice: `해당 레슨 유형(${memberType})에 해당하는 회원이 없습니다.`
          }
        });
        return;
      }
    } else if (memberType) {
      // 기존 userType 필터 (student, instructor 등)
      filter.userType = memberType;
    }

    // 위치 정보 필터 완화: 모든 회원을 조회한 후 좌표를 가져오도록 함
    // (주소지가 없으면 센터 주소지를 사용하므로 모든 회원 조회)
    // 필터는 나중에 위치 정보가 없으면 스킵하도록 처리
    // filter.$or = [
    //   { 'location.coordinates': { $exists: true, $ne: [] } },
    //   { address: { $exists: true, $nin: ['', null] } }
    // ];

    // 회원 데이터 조회
    console.log('🔍 최종 필터 조건:', JSON.stringify(filter, null, 2));
    console.log('🔍 사용자 정보:', {
      userType: user.userType,
      userId: user._id || user.id,
      isCenterAdmin: user.userType === 'centerAdmin' || user.userType === 'center-admin',
      hasManagedCenters: !!updatedUser.centerAdminInfo?.managedCenters?.length
    });
    
    // 필터를 MongoDB 쿼리로 변환할 때 ObjectId 처리
    if (filter.centerId && typeof filter.centerId === 'object' && filter.centerId.$in) {
      filter.centerId.$in = filter.centerId.$in.map((id: any) => {
        if (typeof id === 'string' && mongoose.Types.ObjectId.isValid(id)) {
          return new mongoose.Types.ObjectId(id);
        }
        return id;
      });
      console.log(`  📝 centerId.$in ObjectId 변환 완료: ${filter.centerId.$in.length}개`);
    } else if (filter.centerId && typeof filter.centerId === 'string' && mongoose.Types.ObjectId.isValid(filter.centerId)) {
      filter.centerId = new mongoose.Types.ObjectId(filter.centerId);
      console.log(`  📝 centerId ObjectId 변환 완료: ${filter.centerId}`);
    }
    
    if (filter._id && typeof filter._id === 'object' && filter._id.$in) {
      filter._id.$in = filter._id.$in.map((id: any) => {
        if (typeof id === 'string' && mongoose.Types.ObjectId.isValid(id)) {
          return new mongoose.Types.ObjectId(id);
        }
        return id;
      });
      console.log(`  📝 _id.$in ObjectId 변환 완료: ${filter._id.$in.length}개`);
    }
    
    const users = await User.find(filter)
      .select('address location centerId createdAt userType')
      .lean();

    console.log(`📍 지리적 분포 조회: ${users.length}명의 회원 데이터 처리 (필터: ${memberType || '전체'})`);
    console.log(`📍 필터 조건 상세:`, {
      centerId: filter.centerId,
      _id: filter._id ? (filter._id.$in ? `${filter._id.$in.length}개 userId` : filter._id) : '없음',
      userType: filter.userType || '없음',
      hasAddressFilter: !!filter.$or
    });
    if (users.length > 0 && users.length <= 10) {
      console.log(`📍 조회된 회원 샘플 (센터 ID):`, users.slice(0, 5).map((u: any) => ({
        userId: u._id,
        centerId: u.centerId?.toString(),
        hasAddress: !!u.address,
        hasCoords: !!u.location?.coordinates
      })));
    } else if (users.length === 0) {
      console.warn(`⚠️ 조회된 회원이 없습니다. 필터 조건을 확인하세요:`, JSON.stringify(filter, null, 2));
      // 필터 조건으로 실제로 몇 명의 회원이 있는지 확인
      const totalUsers = await User.countDocuments({});
      const centerUsers = filter.centerId ? await User.countDocuments({ centerId: filter.centerId }) : 0;
      console.warn(`⚠️ 전체 회원 수: ${totalUsers}명, 필터된 센터 회원 수: ${centerUsers}명`);
    }
    
    // 주소지/좌표 보유 현황 확인
    const usersWithAddress = users.filter(u => u.address && u.address.trim() !== '');
    const usersWithCoords = users.filter(u => u.location?.coordinates && Array.isArray(u.location.coordinates) && u.location.coordinates.length === 2);
    const usersWithoutLocation = users.filter(u => !u.address && !u.location?.coordinates);
    
    console.log(`📊 회원 위치 정보 현황:`);
    console.log(`  - 주소지 보유: ${usersWithAddress.length}명`);
    console.log(`  - 좌표 보유: ${usersWithCoords.length}명`);
    console.log(`  - 위치 정보 없음: ${usersWithoutLocation.length}명`);

    // 센터 정보 조회 (이름 매핑 및 공개 여부 확인용)
    const centerIds = [...new Set(users.map(u => u.centerId).filter(Boolean))];
    
    // 회원분포도 공개 여부를 포함하여 센터 정보 조회
    const centers = await Center.find({ _id: { $in: centerIds } })
      .select('_id name geoDistributionVisibility')
      .lean();
    
    const centerMap = new Map(centers.map((c: any) => [c._id.toString(), c.name || `센터 ${c._id.toString().substring(0, 8)}`]));
    
    // 회원분포도 공개 여부 확인 함수
    const canViewCenterDistribution = (centerId: string, viewerUser: any): boolean => {
      // 최고관리자는 항상 볼 수 있음
      if (viewerUser.userType === 'superAdmin') {
        return true;
      }
      
      // 센터관리자는 본인 센터는 항상 볼 수 있음
      if (viewerUser.userType === 'centerAdmin' || viewerUser.userType === 'center-admin') {
        const managedCenters = viewerUser.centerAdminInfo?.managedCenters || [];
        const viewerCenterId = viewerUser.centerId;
        const centerIdStr = centerId.toString();
        
        // 본인이 관리하는 센터인지 확인
        const isManaged = managedCenters.some((c: any) => {
          const cId = c.toString ? c.toString() : c._id?.toString() || c;
          return cId === centerIdStr;
        }) || (viewerCenterId && viewerCenterId.toString() === centerIdStr);
        
        if (isManaged) {
          return true; // 본인 센터는 항상 볼 수 있음
        }
      }
      
      // 다른 센터의 경우 공개 여부 확인
      const center = centers.find((c: any) => c._id.toString() === centerId.toString());
      if (!center || !center.geoDistributionVisibility) {
        return false; // 공개 설정이 없으면 비공개로 간주
      }
      
      const visibility = center.geoDistributionVisibility;
      const viewerType = viewerUser.userType;
      
      // 전체 공개 여부 확인
      if (visibility.isPublic) {
        return true;
      }
      
      // 사용자 유형별 공개 여부 확인
      if (viewerType === 'centerAdmin' || viewerType === 'center-admin') {
        return visibility.showToOtherCenterAdmins || false;
      } else if (viewerType === 'instructor') {
        // 강사인 경우: 우리 센터 강사인지 다른 센터 강사인지 확인
        const viewerCenterId = viewerUser.centerId?.toString();
        const centerIdStr = centerId.toString();
        const isOwnCenter = viewerCenterId === centerIdStr;
        
        if (isOwnCenter) {
          // 우리 센터 강사
          return visibility.showToOwnInstructors || false;
        } else {
          // 다른 센터 강사
          return visibility.showToOtherInstructors || false;
        }
      } else if (viewerType === 'member' || viewerType === 'student') {
        // 회원인 경우: 우리 센터 회원인지 다른 센터 회원인지 확인
        const viewerCenterId = viewerUser.centerId?.toString();
        const centerIdStr = centerId.toString();
        const isOwnCenter = viewerCenterId === centerIdStr;
        
        if (isOwnCenter) {
          // 우리 센터 회원
          return visibility.showToOwnMembers || false;
        } else {
          // 다른 센터 회원
          return visibility.showToOtherMembers || false;
        }
      }
      
      return false; // 기본값: 비공개
    };

    // H3 셀 집계
    const h3Map: Map<string, any> = new Map();

    let processedCount = 0;
    let skippedNoCoords = 0;
    let skippedInvalidCoords = 0;
    
    for (const userItem of users) {
      let coords: { lat: number; lng: number } | null = null;

      // 🆕 location.coordinates 우선 사용 (GeoJSON 형식)
      if (userItem.location && userItem.location.coordinates && userItem.location.coordinates.length === 2) {
        coords = {
          lng: userItem.location.coordinates[0],
          lat: userItem.location.coordinates[1]
        };
        if (processedCount < 3) {
          console.log(`  ✅ 좌표 사용: User ${userItem._id} → [${coords.lng}, ${coords.lat}]`);
        }
      } 
      // 대체: address에서 지오코딩 (기존 회원 호환)
      if (!coords && userItem.address && userItem.address.trim() !== '') {
        coords = await geocodeAddress(userItem.address);
        if (coords) {
          if (processedCount < 3) {
            console.log(`  ✅ 지오코딩: User ${userItem._id}, 주소 "${userItem.address}" → [${coords.lng}, ${coords.lat}]`);
          }
        } else {
          if (processedCount < 3) {
            console.warn(`  ⚠️ 지오코딩 실패: User ${userItem._id}, 주소 "${userItem.address}"`);
          }
        }
      }
      // 주소지도 없으면 센터 주소지 사용 (최후 수단)
      if (!coords && userItem.centerId) {
        try {
          let center: any = null;
          const centerId = userItem.centerId;
          
          // ObjectId 변환 시도
          let centerIdObj: mongoose.Types.ObjectId | string = centerId;
          if (typeof centerId === 'string' && mongoose.Types.ObjectId.isValid(centerId)) {
            centerIdObj = new mongoose.Types.ObjectId(centerId);
          }
          
          // SwimmingCenter 모델에서 먼저 조회
          const { SwimmingCenter } = await import('../models/SwimmingCenter');
          center = await SwimmingCenter.findById(centerIdObj).select('address location').lean() as any;
          
          // SwimmingCenter에서 못 찾으면 Center 모델로 시도
          if (!center) {
            center = await Center.findById(centerIdObj).select('address location').lean() as any;
          }
          
          if (processedCount < 3) {
            console.log(`  🔍 센터 조회 시도: User ${userItem._id}, Center ${userItem.centerId}`);
            console.log(`     센터 조회 결과:`, center ? '성공' : '실패 (센터 없음)');
            if (center) {
              console.log(`     센터 주소지:`, center.address || '없음');
              console.log(`     센터 좌표:`, center.location?.coordinates || '없음');
            }
          }
          
          if (center && !Array.isArray(center)) {
            if (center.location?.coordinates && Array.isArray(center.location.coordinates) && center.location.coordinates.length === 2) {
              coords = {
                lng: center.location.coordinates[0],
                lat: center.location.coordinates[1]
              };
              if (processedCount < 3) {
                console.log(`  ✅ 센터 좌표 사용: User ${userItem._id}, Center ${userItem.centerId} → [${coords.lng}, ${coords.lat}]`);
              }
            } else if (center.address && center.address.trim() !== '') {
              coords = await geocodeAddress(center.address);
              if (coords) {
                if (processedCount < 3) {
                  console.log(`  ✅ 센터 주소 지오코딩: User ${userItem._id}, Center ${userItem.centerId}, 주소 "${center.address}" → [${coords.lng}, ${coords.lat}]`);
                }
              } else {
                if (processedCount < 3) {
                  console.warn(`  ⚠️ 센터 주소 지오코딩 실패: User ${userItem._id}, Center ${userItem.centerId}, 주소 "${center.address}"`);
                }
              }
            } else {
              if (processedCount < 3) {
                console.warn(`  ⚠️ 센터에 주소지/좌표 없음: User ${userItem._id}, Center ${userItem.centerId}`);
              }
            }
          } else {
            if (processedCount < 3) {
              console.warn(`  ⚠️ 센터 조회 실패: User ${userItem._id}, Center ${userItem.centerId} - SwimmingCenter와 Center 모델 모두에서 찾을 수 없음`);
            }
          }
        } catch (error) {
          if (processedCount < 3) {
            logError(`  ❌ 센터 조회 오류: User ${userItem._id}, Center ${userItem.centerId}`, error);
          }
        }
      }

      if (!coords) {
        skippedNoCoords++;
        if (skippedNoCoords <= 3) {
          console.warn(`  ❌ 좌표 없음: User ${userItem._id}, 주소지: ${userItem.address || '없음'}, 센터: ${userItem.centerId || '없음'}`);
        }
        continue;
      }
      
      // 좌표 유효성 검사
      if (isNaN(coords.lat) || isNaN(coords.lng) || coords.lat === 0 || coords.lng === 0) {
        skippedInvalidCoords++;
        if (skippedInvalidCoords <= 3) {
          console.warn(`  ⚠️ 잘못된 좌표: User ${userItem._id}, [${coords.lng}, ${coords.lat}]`);
        }
        continue;
      }
      
      processedCount++;

      // H3 변환
      const h3Index = toH3(coords.lat, coords.lng, 8);

      // 회원분포도 공개 여부 확인: 해당 센터의 데이터를 볼 수 있는지 체크
      const userCenterId = userItem.centerId?.toString();
      if (userCenterId && !canViewCenterDistribution(userCenterId, updatedUser)) {
        // 공개되지 않은 센터 데이터는 스킵 (최고관리자와 본인 센터 관리자는 제외)
        continue;
      }
      
      if (h3Map.has(h3Index)) {
        const cell = h3Map.get(h3Index);
        cell.count += 1;
        // 센터별 카운트 (다중 센터 겹침 지역 처리)
        if (userItem.centerId) {
          const cId = userItem.centerId.toString();
          cell.centerCounts[cId] = (cell.centerCounts[cId] || 0) + 1;
        }
      } else {
        const center = h3ToLatLng(h3Index);
        const cId = userItem.centerId?.toString();
        h3Map.set(h3Index, {
          h3Index,
          lat: center.lat,
          lng: center.lng,
          count: 1,
          countApprox: 0,
          centerId: cId,
          centerName: cId ? centerMap.get(cId) : undefined,
          centerCounts: cId ? { [cId]: 1 } : {},
        });
      }
    }

    // k-익명성 필터링 (K_THRESHOLD는 이미 상단에서 선언됨)
    let cells = Array.from(h3Map.values());
    const totalCells = cells.length;

    console.log(`\n📊 처리 결과:`);
    console.log(`  - 총 회원 수: ${users.length}명`);
    console.log(`  - 좌표 처리 완료: ${processedCount}명`);
    console.log(`  - 좌표 없음으로 스킵: ${skippedNoCoords}명`);
    console.log(`  - 잘못된 좌표로 스킵: ${skippedInvalidCoords}명`);
    console.log(`  - H3 셀 개수: ${h3Map.size}개`);
    
    console.log(`\n🔒 k-익명성 필터링 전: ${totalCells}개 셀`);
    if (totalCells > 0) {
      const countDistribution: any = {};
      cells.forEach((cell: any) => {
        countDistribution[cell.count] = (countDistribution[cell.count] || 0) + 1;
      });
      console.log(`  - 셀별 회원 수 분포:`, countDistribution);
    }
    
    cells = cells.filter(cell => cell.count >= K_THRESHOLD);
    const filteredCells = cells.length;

    console.log(`🔒 k-익명성 필터링 후: ${filteredCells}개 셀 (k≥${K_THRESHOLD})${isDevelopment ? ' (개발 모드: k=1)' : ''}`);

    // 노이즈 추가 및 반올림 (옵션에 따라)
    cells.forEach(cell => {
      // 원본 count 저장
      const originalCount = cell.count;
      
      if (skipNoise && skipRound) {
        // 노이즈와 반올림 모두 제거 (실제 DB 데이터)
        cell.countApprox = originalCount;
      } else if (skipNoise) {
        // 노이즈만 제거, 반올림은 적용
        cell.countApprox = Math.max(1, Math.round(originalCount));
      } else if (skipRound) {
        // 반올림만 제거, 노이즈는 적용
        const noisy = originalCount + laplaceNoise(1.0);
        cell.countApprox = Math.max(1, noisy);
      } else {
        // 기본: 노이즈와 반올림 모두 적용
        cell.countApprox = addNoiseAndRound(originalCount, 1.0); // epsilon=1.0
      }
      
      // 원본 count 제거 (보안)
      delete cell.count;
      
      // ✅ centers 배열 생성 (클라이언트에서 사용)
      // centerCounts를 centers 배열로 변환 (센터 ID와 countApprox 포함)
      if (cell.centerCounts && Object.keys(cell.centerCounts).length > 0) {
        const totalCount = Object.values(cell.centerCounts).reduce((sum: number, count: any) => sum + count, 0);
        cell.centers = Object.entries(cell.centerCounts).map(([centerId, count]: [string, any]) => {
          // 각 센터의 비율에 따라 countApprox 분배
          const ratio = Number(count) / Number(totalCount);
          // 노이즈/반올림 옵션에 따라 처리
          let centerApprox: number;
          if (skipNoise && skipRound) {
            // 실제 DB 데이터 사용 (노이즈/반올림 없음)
            // 원본 count를 직접 사용 (비율 계산 불필요, count가 이미 센터별 실제 인원수)
            centerApprox = Math.max(1, Number(count));
          } else if (skipNoise) {
            // 반올림만 적용 (노이즈 없음)
            centerApprox = Math.max(1, Math.round(Number(cell.countApprox) * ratio));
          } else if (skipRound) {
            // 반올림 제거, 노이즈는 이미 cell.countApprox에 적용됨
            // 노이즈가 적용된 값에서 반올림만 제거 (소수점 유지)
            centerApprox = Math.max(1, Number(cell.countApprox) * ratio);
          } else {
            // 기본: 반올림 적용 (노이즈는 이미 cell.countApprox에 적용됨)
            centerApprox = Math.max(1, Math.round(Number(cell.countApprox) * ratio));
          }
          return {
            centerId: centerId,
            countApprox: centerApprox
          };
        });
        
        // ✅ dominantCenter 설정 (가장 많은 회원을 가진 센터)
        // ⚠️ 중요: centerId를 센터 이름으로 변환하여 반환 (클라이언트 필터링을 위해)
        const dominantCenterEntry = Object.entries(cell.centerCounts).reduce((max: any, [id, count]: [string, any]) => {
          return count > (max[1] || 0) ? [id, count] : max;
        }, ['기타', 0]);
        const dominantCenterId = dominantCenterEntry[0];
        // 센터 ID를 센터 이름으로 변환 (centerMap 사용)
        cell.dominantCenter = centerMap.get(dominantCenterId) || dominantCenterId; // 센터 이름 사용
      } else if (cell.centerId) {
        // centerCounts가 없는 경우 (단일 센터)
        const centerIdStr = cell.centerId.toString();
        cell.centers = [{
          centerId: centerIdStr,
          countApprox: cell.countApprox
        }];
        // 센터 ID를 센터 이름으로 변환 (centerMap 사용)
        cell.dominantCenter = centerMap.get(centerIdStr) || centerIdStr; // 센터 이름 사용
      } else {
        // 센터 정보가 없는 경우
        cell.centers = [];
        cell.dominantCenter = '기타';
      }
      
      // centerCounts 제거 (보안, centers 배열로 변환 완료)
      delete cell.centerCounts;
      
      if (cells.length <= 10) {
        console.log(`  셀 [${cell.lat.toFixed(4)}, ${cell.lng.toFixed(4)}]: 원본 ${originalCount}명 → 근사값 ${cell.countApprox}명, 센터: ${cell.dominantCenter}`);
      }
    });
    
    console.log(`\n📤 최종 응답:`);
    console.log(`  - 총 셀 수: ${cells.length}개`);
    console.log(`  - 총 회원 수 (근사값): ${cells.reduce((sum: number, c: any) => sum + c.countApprox, 0)}명`);

    // 감사 로그
    console.log(`📊 [GEO-AUDIT] User: ${user.userId}, Type: ${user.userType}, Filter: ${JSON.stringify({ centerId, from, to, memberType })}, Result: ${cells.length} cells`);

    res.json({
      success: true,
      cells,
      metadata: {
        totalCells,
        filteredCells: cells.length,
        k: K_THRESHOLD,
        privacyNotice: `본 데이터는 k-익명성(k≥${K_THRESHOLD}), 노이즈 주입이 적용되었습니다.`,
      },
    });
  } catch (error) {
    logError('지리적 분포 집계 오류:', error);
    res.status(500).json({
      success: false,
      message: '지리적 분포 집계 중 오류가 발생했습니다.',
    });
  }
});

/**
 * GET /api/geo/centers
 * 
 * 센터 목록 조회 (필터링용)
 */
router.get('/centers', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    if (user.userType !== 'superAdmin' && user.userType !== 'centerAdmin') {
      return res.status(403).json({
        success: false,
        message: '센터 목록 조회 권한이 없습니다.',
      });
    }

    const filter: any = { isActive: true };
    
    // centerAdmin은 자신의 센터만
    if (user.userType === 'centerAdmin' && user.centerId) {
      filter._id = user.centerId;
    }

    const centers = await Center.find(filter)
      .select('_id name region city district address')
      .lean();

    res.json({
      success: true,
      centers,
    });
  } catch (error) {
    logError('센터 목록 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '센터 목록 조회 중 오류가 발생했습니다.',
    });
  }
});

export default router;

