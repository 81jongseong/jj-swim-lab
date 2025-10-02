/**
 * 🔒 프라이버시 보호 지오코딩 유틸리티
 * 
 * 📋 **파일 목적**
 * - k-익명성을 보장하는 안전한 지리적 데이터 집계 및 시각화
 * - 개인정보보호법(PIPA) 및 위치정보법 준수
 * - H3 헥사곤 기반 공간 집계 및 노이즈 주입
 * 
 * 🔄 **주요 기능**
 * 1. H3 헥사곤 셀 변환 (주소 → 격자)
 * 2. k-익명성 임계치 적용 (k≥5)
 * 3. 라플라스 노이즈 주입
 * 4. 안전한 반올림 및 마스킹
 * 
 * 🛡️ **프라이버시 원칙**
 * - 원본 주소/좌표는 절대 클라이언트로 전송 금지
 * - 모든 데이터는 서버에서 집계 후 전송
 * - k<5인 셀은 자동 필터링 또는 상위 셀로 병합
 * - 노이즈 추가로 정확한 수치 추정 방지
 * 
 * ⚠️ **법적 근거**
 * - 개인정보보호법(PIPA) 제28조의2 (가명정보 처리)
 * - 위치정보의 보호 및 이용 등에 관한 법률
 * - PIPC 비식별 조치 가이드라인
 * 
 * 📅 **개발 히스토리**
 * - 2025-01-13: 초기 구현 (H3, k-익명성, 노이즈)
 */

/**
 * H3 해상도별 평균 셀 크기 (km)
 * res 7: ~5.16 km
 * res 8: ~1.95 km (권장)
 * res 9: ~0.74 km
 */
export const H3_RESOLUTION = 8;

/**
 * k-익명성 최소 임계치
 * k≥5: 한 셀에 최소 5명 이상의 회원이 있어야 표시
 */
export const K_ANONYMITY_THRESHOLD = 5;

/**
 * 라플라스 노이즈 파라미터 (프라이버시 예산)
 * epsilon이 작을수록 노이즈가 커지고 프라이버시가 강화됨
 */
export const EPSILON = 1.0;

/**
 * 반올림 단위
 */
export const ROUNDING_UNIT = 5;

/**
 * H3 셀 인터페이스
 */
export interface H3Cell {
  h3Index: string;
  lat: number;
  lng: number;
  count: number;
  countApprox: number; // 노이즈 추가된 근사값
  centerId?: string;
  centerName?: string;
}

/**
 * 주소를 좌표로 변환 (Mock 구현 - 실제론 카카오/네이버 지오코딩 API 사용)
 * 
 * @param address - 주소 문자열
 * @returns 위도/경도 좌표 또는 null
 */
export async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  // TODO: 실제 지오코딩 API 연동 (카카오/네이버/Google)
  // 임시: 서울 중심부 기준 랜덤 좌표 생성 (테스트용)
  
  if (!address || address.trim() === '') {
    return null;
  }

  // Mock: 서울 중심부 (37.5665, 126.9780) ± 0.1 도
  const mockLat = 37.5665 + (Math.random() - 0.5) * 0.2;
  const mockLng = 126.9780 + (Math.random() - 0.5) * 0.2;

  return {
    lat: mockLat,
    lng: mockLng,
  };
}

/**
 * 좌표를 H3 헥사곤 인덱스로 변환
 * 
 * ⚠️ 주의: 이 함수는 h3-js 라이브러리가 필요합니다
 * npm install h3-js
 * 
 * @param lat - 위도
 * @param lng - 경도
 * @param resolution - H3 해상도 (기본값: 8)
 * @returns H3 인덱스 문자열
 */
export function toH3(lat: number, lng: number, resolution: number = H3_RESOLUTION): string {
  // TODO: h3-js 라이브러리 설치 후 실제 구현
  // import { latLngToCell } from 'h3-js';
  // return latLngToCell(lat, lng, resolution);
  
  // Mock: 간단한 격자 ID 생성 (실제론 H3 사용)
  const latGrid = Math.floor(lat / 0.01);
  const lngGrid = Math.floor(lng / 0.01);
  return `mock_h3_${resolution}_${latGrid}_${lngGrid}`;
}

/**
 * H3 인덱스를 중심 좌표로 변환
 * 
 * @param h3Index - H3 인덱스
 * @returns 중심 좌표 { lat, lng }
 */
export function h3ToLatLng(h3Index: string): { lat: number; lng: number } {
  // TODO: h3-js 라이브러리 설치 후 실제 구현
  // import { cellToLatLng } from 'h3-js';
  // const [lat, lng] = cellToLatLng(h3Index);
  // return { lat, lng };
  
  // Mock: 인덱스에서 좌표 역계산
  const parts = h3Index.split('_');
  if (parts.length >= 4) {
    const lat = parseFloat(parts[3]) * 0.01 + 0.005;
    const lng = parseFloat(parts[4]) * 0.01 + 0.005;
    return { lat, lng };
  }
  
  return { lat: 37.5665, lng: 126.9780 };
}

/**
 * 라플라스 노이즈 생성
 * 
 * 차분 프라이버시(Differential Privacy)의 핵심 기법
 * 
 * @param epsilon - 프라이버시 예산 (작을수록 노이즈 큼)
 * @returns 라플라스 분포 노이즈 값
 */
export function laplaceNoise(epsilon: number = EPSILON): number {
  const u = Math.random() - 0.5;
  const scale = 1 / epsilon;
  return -scale * Math.sign(u) * Math.log(1 - 2 * Math.abs(u));
}

/**
 * 수치를 지정된 단위로 반올림
 * 
 * @param n - 원본 수치
 * @param unit - 반올림 단위 (기본값: 5)
 * @returns 반올림된 수치
 */
export function round5(n: number, unit: number = ROUNDING_UNIT): number {
  return Math.round(n / unit) * unit;
}

/**
 * k-익명성을 만족하는 셀만 필터링
 * 
 * k 미만인 셀은 제거하거나 상위 셀로 병합
 * 
 * @param cells - H3 셀 배열
 * @param k - 최소 임계치 (기본값: 5)
 * @returns 필터링된 셀 배열
 */
export function enforceKAnonymity(cells: H3Cell[], k: number = K_ANONYMITY_THRESHOLD): H3Cell[] {
  return cells.filter(cell => cell.count >= k);
}

/**
 * 셀 카운트에 노이즈를 추가하고 반올림
 * 
 * @param count - 원본 카운트
 * @param epsilon - 프라이버시 예산
 * @returns 노이즈 추가 및 반올림된 근사값
 */
export function addNoiseAndRound(count: number, epsilon: number = EPSILON): number {
  const noisy = count + laplaceNoise(epsilon);
  const rounded = round5(Math.max(0, noisy)); // 음수 방지
  return rounded;
}

/**
 * 주소 배열을 H3 셀로 집계 (프라이버시 보호)
 * 
 * 전체 파이프라인:
 * 1. 주소 → 좌표 (지오코딩)
 * 2. 좌표 → H3 셀
 * 3. 셀별 카운트 집계
 * 4. k-익명성 필터링
 * 5. 노이즈 추가 및 반올림
 * 
 * @param addresses - 주소 배열 (회원 데이터)
 * @param resolution - H3 해상도
 * @param k - k-익명성 임계치
 * @returns 집계된 H3 셀 배열
 */
export async function aggregateToH3(
  addresses: Array<{ address: string; centerId?: string; centerName?: string }>,
  resolution: number = H3_RESOLUTION,
  k: number = K_ANONYMITY_THRESHOLD
): Promise<H3Cell[]> {
  const h3Map: Map<string, H3Cell> = new Map();

  // 1단계: 주소 → H3 셀 변환 및 집계
  for (const item of addresses) {
    const coords = await geocodeAddress(item.address);
    if (!coords) continue;

    const h3Index = toH3(coords.lat, coords.lng, resolution);
    
    if (h3Map.has(h3Index)) {
      const cell = h3Map.get(h3Index)!;
      cell.count += 1;
    } else {
      const center = h3ToLatLng(h3Index);
      h3Map.set(h3Index, {
        h3Index,
        lat: center.lat,
        lng: center.lng,
        count: 1,
        countApprox: 0,
        centerId: item.centerId,
        centerName: item.centerName,
      });
    }
  }

  // 2단계: k-익명성 필터링
  let cells = Array.from(h3Map.values());
  cells = enforceKAnonymity(cells, k);

  // 3단계: 노이즈 추가 및 반올림
  cells.forEach(cell => {
    cell.countApprox = addNoiseAndRound(cell.count);
  });

  return cells;
}

/**
 * 안전한 내보내기 형식으로 변환
 * 
 * 원본 count는 제거하고 countApprox만 포함
 * 
 * @param cells - H3 셀 배열
 * @returns 내보내기 안전한 데이터
 */
export function toSafeExport(cells: H3Cell[]): Array<{
  h3Index: string;
  lat: number;
  lng: number;
  countApprox: number;
  centerName?: string;
}> {
  return cells.map(cell => ({
    h3Index: cell.h3Index,
    lat: cell.lat,
    lng: cell.lng,
    countApprox: cell.countApprox,
    centerName: cell.centerName,
  }));
}

/**
 * 프라이버시 보호 안내 문구
 */
export const PRIVACY_NOTICE = `
본 지도는 가명·집계 처리된 통계 시각화입니다.
개별 회원의 위치는 표시되지 않으며, 모든 데이터는 다음과 같이 보호됩니다:

• k-익명성: 5명 미만의 회원이 거주하는 지역은 표시되지 않습니다
• 노이즈 주입: 표시된 수치는 ±1~±2명의 변형이 적용되었습니다
• 격자 집계: 약 2km 단위의 헥사곤 셀로 집계되어 정확한 주소는 알 수 없습니다
• 반올림: 모든 수치는 5명 단위로 반올림되어 표시됩니다

이는 개인정보보호법 및 위치정보법을 준수하는 안전한 처리 방식입니다.
`.trim();

