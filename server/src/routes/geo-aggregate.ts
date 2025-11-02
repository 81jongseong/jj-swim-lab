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
 * 5 단위 반올림
 */
function round5(n: number): number {
  return Math.round(n / 5) * 5;
}

/**
 * 노이즈 추가 및 반올림
 */
function addNoiseAndRound(count: number, epsilon: number = 1.0): number {
  const noisy = count + laplaceNoise(epsilon);
  const rounded = round5(Math.max(0, noisy));
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
    const { centerId, from, to, memberType } = req.query;

    // 필터 조건 구성
    const filter: any = {};

    // centerAdmin은 자신의 센터(들)만 조회 가능
    if (user.userType === 'centerAdmin' || user.userType === 'center-admin') {
      // 여러 센터를 관리하는 경우 처리
      const managedCenters = user.centerAdminInfo?.managedCenters || [];
      
      if (managedCenters.length > 0) {
        // 쿼리 파라미터로 특정 센터를 지정한 경우
        if (centerId && managedCenters.some((c: any) => {
          const cId = c.toString ? c.toString() : c._id?.toString() || c;
          return cId === centerId;
        })) {
          // 특정 센터만 조회
          filter.centerId = centerId;
        } else if (centerId === null || centerId === undefined || centerId === '') {
          // centerId가 없으면 관리하는 모든 센터 포함 (전체 통계)
          const centerIds = managedCenters.map((c: any) => {
            return c.toString ? c.toString() : c._id?.toString() || c;
          });
          if (centerIds.length > 0) {
            filter.centerId = { $in: centerIds };
          }
        }
      } else if (user.centerId) {
        // managedCenters가 없으면 기존 centerId 사용 (하위 호환성)
        filter.centerId = user.centerId;
      }
    } else if (centerId && user.userType === 'superAdmin') {
      // superAdmin은 모든 센터 접근 가능, centerId가 있으면 필터링
      // centerId가 없으면 모든 센터 조회 (필터 없음)
      if (centerId !== 'all' && centerId !== null && centerId !== undefined && centerId !== '') {
        filter.centerId = centerId;
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
        const personalLessons = await PersonalLesson.find({
          status: { $in: ['pending', 'approved', 'completed'] }
        }).select('studentId').lean();
        userIds = [...new Set(personalLessons.map((pl: any) => pl.studentId).filter(Boolean))];
        console.log(`👤 개인레슨 수강생: ${userIds.length}명`);
      } else if (memberType === 'free-swim') {
        // 자유수영 이용자 조회
        const laneRentals = await LaneRental.find({
          status: { $in: ['pending', 'approved', 'completed'] }
        }).select('userId').lean();
        userIds = [...new Set(laneRentals.map((lr: any) => lr.userId).filter(Boolean))];
        console.log(`🏊 자유수영 이용자: ${userIds.length}명`);
      } else if (memberType === 'group-lesson') {
        // 단체레슨 수강생 조회 (Course의 enrollments 또는 students 필드)
        const courses = await Course.find({
          isActive: true,
          type: { $in: ['group', 'course'] }
        }).select('enrollments students participants').lean();
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
        console.log(`👥 단체레슨 수강생: ${userIds.length}명`);
      }
      
      if (userIds && userIds.length > 0) {
        filter._id = { $in: userIds };
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

    // 🆕 위치 정보가 있는 회원만 조회 (location.coordinates 우선, address 대체)
    // 주소지가 없으면 센터 주소지나 기본 주소지 사용
    filter.$or = [
      { 'location.coordinates': { $exists: true, $ne: [] } },
      { address: { $exists: true, $nin: ['', null] } }
    ];

    // 회원 데이터 조회
    console.log('🔍 필터 조건:', JSON.stringify(filter, null, 2));
    const users = await User.find(filter)
      .select('address location centerId createdAt userType')
      .lean();

    console.log(`📍 지리적 분포 조회: ${users.length}명의 회원 데이터 처리 (필터: ${memberType || '전체'})`);
    
    // 주소지/좌표 보유 현황 확인
    const usersWithAddress = users.filter(u => u.address && u.address.trim() !== '');
    const usersWithCoords = users.filter(u => u.location?.coordinates && Array.isArray(u.location.coordinates) && u.location.coordinates.length === 2);
    const usersWithoutLocation = users.filter(u => !u.address && !u.location?.coordinates);
    
    console.log(`📊 회원 위치 정보 현황:`);
    console.log(`  - 주소지 보유: ${usersWithAddress.length}명`);
    console.log(`  - 좌표 보유: ${usersWithCoords.length}명`);
    console.log(`  - 위치 정보 없음: ${usersWithoutLocation.length}명`);

    // 센터 정보 조회 (이름 매핑용) - SwimmingCenter 모델 사용
    const centerIds = [...new Set(users.map(u => u.centerId).filter(Boolean))];
    const { SwimmingCenter } = await import('../models/SwimmingCenter');
    const centers = await SwimmingCenter.find({ _id: { $in: centerIds } })
      .select('_id name')
      .lean();
    
    const centerMap = new Map(centers.map((c: any) => [c._id.toString(), c.name || `센터 ${c._id.toString().substring(0, 8)}`]));

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
      else if (userItem.address) {
        coords = await geocodeAddress(userItem.address);
        if (processedCount < 3) {
          console.log(`  📍 지오코딩: User ${userItem._id}, 주소 "${userItem.address}" → [${coords?.lng}, ${coords?.lat}]`);
        }
      }
      // 주소지도 없으면 센터 주소지 사용 (최후 수단)
      else if (userItem.centerId) {
        try {
          const { SwimmingCenter } = await import('../models/SwimmingCenter');
          const center = await SwimmingCenter.findById(userItem.centerId).select('address location').lean() as any;
          if (center && !Array.isArray(center)) {
            if (center.location?.coordinates && Array.isArray(center.location.coordinates) && center.location.coordinates.length === 2) {
              coords = {
                lng: center.location.coordinates[0],
                lat: center.location.coordinates[1]
              };
              if (processedCount < 3) {
                console.log(`  🏢 센터 좌표 사용: User ${userItem._id}, Center ${userItem.centerId} → [${coords.lng}, ${coords.lat}]`);
              }
            } else if (center.address) {
              coords = await geocodeAddress(center.address);
              if (processedCount < 3) {
                console.log(`  🏢 센터 주소 지오코딩: User ${userItem._id}, Center ${userItem.centerId}, 주소 "${center.address}" → [${coords?.lng}, ${coords?.lat}]`);
              }
            }
          }
        } catch (error) {
          // 센터 주소지 조회 실패 시 무시
          if (processedCount < 3) {
            console.warn(`  ⚠️ 센터 조회 실패: User ${userItem._id}, Center ${userItem.centerId}`, error);
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

    // 노이즈 추가 및 반올림
    cells.forEach(cell => {
      cell.countApprox = addNoiseAndRound(cell.count, 1.0);
      // 원본 count 제거 (보안)
      const originalCount = cell.count;
      delete cell.count;
      delete cell.centerCounts;
      
      if (cells.length <= 10) {
        console.log(`  셀 [${cell.lat.toFixed(4)}, ${cell.lng.toFixed(4)}]: 원본 ${originalCount}명 → 근사값 ${cell.countApprox}명`);
      }
    });
    
    console.log(`\n📤 최종 응답:`);
    console.log(`  - 총 셀 수: ${cells.length}개`);
    console.log(`  - 총 회원 수 (근사값): ${cells.reduce((sum: number, c: any) => sum + c.countApprox, 0)}명`);

    // 감사 로그
    console.log(`📊 [GEO-AUDIT] User: ${user.userId}, Type: ${user.userType}, Filter: ${JSON.stringify({ centerId, from, to, memberType })}, Result: ${filteredCells} cells`);

    res.json({
      success: true,
      cells,
      metadata: {
        totalCells,
        filteredCells,
        k: K_THRESHOLD,
        privacyNotice: `본 데이터는 k-익명성(k≥${K_THRESHOLD}), 노이즈 주입, 5단위 반올림이 적용되었습니다.`,
      },
    });
  } catch (error) {
    console.error('지리적 분포 집계 오류:', error);
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
    console.error('센터 목록 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '센터 목록 조회 중 오류가 발생했습니다.',
    });
  }
});

export default router;

