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
    if (user.userType !== 'superAdmin' && user.userType !== 'centerAdmin') {
      return res.status(403).json({
        success: false,
        message: '지리적 분포 조회 권한이 없습니다.',
      });
    }

    // 쿼리 파라미터 추출
    const { centerId, from, to, memberType } = req.query;

    // 필터 조건 구성
    const filter: any = {};

    // centerAdmin은 자신의 센터만 조회 가능
    if (user.userType === 'centerAdmin' && user.centerId) {
      filter.centerId = user.centerId;
    } else if (centerId) {
      filter.centerId = centerId;
    }

    // 가입 기간 필터
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from as string);
      if (to) filter.createdAt.$lte = new Date(to as string);
    }

    // 회원 유형 필터
    if (memberType) {
      filter.userType = memberType;
    }

    // 🆕 위치 정보가 있는 회원만 조회 (location.coordinates 우선, address 대체)
    filter.$or = [
      { 'location.coordinates': { $exists: true, $ne: [] } },
      { address: { $exists: true, $ne: '' } }
    ];

    // 회원 데이터 조회
    const users = await User.find(filter)
      .select('address location centerId createdAt userType')
      .lean();

    console.log(`📍 지리적 분포 조회: ${users.length}명의 회원 데이터 처리`);

    // 센터 정보 조회 (이름 매핑용)
    const centerIds = [...new Set(users.map(u => u.centerId).filter(Boolean))];
    const centers = await Center.find({ _id: { $in: centerIds } })
      .select('_id name')
      .lean();
    
    const centerMap = new Map(centers.map(c => [c._id.toString(), c.name]));

    // H3 셀 집계
    const h3Map: Map<string, any> = new Map();

    for (const userItem of users) {
      let coords: { lat: number; lng: number } | null = null;

      // 🆕 location.coordinates 우선 사용 (GeoJSON 형식)
      if (userItem.location && userItem.location.coordinates && userItem.location.coordinates.length === 2) {
        coords = {
          lng: userItem.location.coordinates[0],
          lat: userItem.location.coordinates[1]
        };
        console.log('✅ GeoJSON 좌표 사용:', coords);
      } 
      // 대체: address에서 지오코딩 (기존 회원 호환)
      else if (userItem.address) {
        coords = await geocodeAddress(userItem.address);
        console.log('⚠️ 주소 → 지오코딩:', userItem.address, coords);
      }

      if (!coords) continue;

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

    // k-익명성 필터링 (k=5)
    const K_THRESHOLD = 5;
    let cells = Array.from(h3Map.values());
    const totalCells = cells.length;
    
    cells = cells.filter(cell => cell.count >= K_THRESHOLD);
    const filteredCells = cells.length;

    console.log(`🔒 k-익명성 필터링: ${totalCells}개 셀 → ${filteredCells}개 셀 (k≥${K_THRESHOLD})`);

    // 노이즈 추가 및 반올림
    cells.forEach(cell => {
      cell.countApprox = addNoiseAndRound(cell.count, 1.0);
      // 원본 count 제거 (보안)
      delete cell.count;
      delete cell.centerCounts;
    });

    // 감사 로그
    console.log(`📊 [GEO-AUDIT] User: ${user.userId}, Type: ${user.userType}, Filter: ${JSON.stringify({ centerId, from, to, memberType })}, Result: ${filteredCells} cells`);

    res.json({
      success: true,
      cells,
      metadata: {
        totalCells,
        filteredCells,
        k: K_THRESHOLD,
        privacyNotice: '본 데이터는 k-익명성(k≥5), 노이즈 주입, 5단위 반올림이 적용되었습니다.',
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

