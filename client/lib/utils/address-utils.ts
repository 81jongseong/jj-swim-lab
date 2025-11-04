/**
 * 주소 변환 유틸리티
 * 
 * 연동되는 데이터:
 * - VWorld API를 통한 역지오코딩
 * 
 * 연동되는 파일:
 * - client/app/admin/geo-distribution/page.tsx (지도 페이지)
 * - client/app/center-admin/geo-distribution/page.tsx (센터 관리자 지도 페이지)
 */

import ngeohash from 'ngeohash';

/**
 * 좌표를 한글 주소로 변환 (Next.js API Route를 통해 프록시)
 */
export async function getAddressFromCoordinates(
  lat: number, 
  lng: number
): Promise<string | null> {
  try {
    // Next.js API Route를 통해 프록시 호출 (CORS 문제 해결)
    const response = await fetch(`/api/geo/address?lat=${lat}&lng=${lng}`);
    
    if (!response.ok) {
      throw new Error(`주소 변환 API 오류: ${response.status}`);
    }

    const data = await response.json();

    if (data?.success && data?.address) {
      return data.address;
    }

    return getDefaultAddress(lat, lng);
  } catch (error) {
    console.error('❌ 주소 변환 오류:', error);
    return getDefaultAddress(lat, lng);
  }
}

/**
 * 기본 주소 생성 (API 실패 시 사용)
 */
function getDefaultAddress(lat: number, lng: number): string {
  // 좌표 기반으로 간단한 주소 생성
  // 서울 강남구 기준
  if (lat >= 37.4 && lat <= 37.6 && lng >= 126.9 && lng <= 127.1) {
    // 강남역 부근
    if (lat >= 37.49 && lat <= 37.51 && lng >= 127.02 && lng <= 127.04) {
      return '서울특별시 강남구 역삼동';
    }
    // 테헤란로 부근
    if (lat >= 37.5 && lat <= 37.52) {
      return '서울특별시 강남구 테헤란로';
    }
    return '서울특별시 강남구';
  }
  
  // 기본값
  return `서울특별시 (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
}

/**
 * Geohash를 한글 주소로 변환
 * @param geohash - Geohash 문자열
 * @param zoomLevel - 현재 줌 레벨 (주소 단위 조정용, 선택적)
 */
export async function getAddressFromGeohash(geohash: string, zoomLevel?: number): Promise<string | null> {
  try {
    const { latitude, longitude } = ngeohash.decode(geohash);
    const fullAddress = await getAddressFromCoordinates(latitude, longitude);
    
    if (!fullAddress) return null;
    
    // 줌 레벨에 따라 주소 단위 조정
    if (zoomLevel !== undefined) {
      return adjustAddressByZoomLevel(fullAddress, zoomLevel);
    }
    
    return fullAddress;
  } catch (error) {
    console.error('❌ Geohash 주소 변환 오류:', error);
    return null;
  }
}

/**
 * 줌 레벨에 따라 주소 단위 조정
 * ⚠️ 개인정보 보호를 위해 항상 마지막 단위를 제거한 주소만 표시
 * - 도로명 주소(현주소)와 지번 주소(구주소) 모두 지원
 * - 줌 레벨이 낮을수록(줌 아웃) 더 큰 단위만 표시
 * - 줌 레벨이 높을수록(줌 인) 더 상세한 주소 표시 (하지만 마지막 단위는 항상 제거)
 */
function adjustAddressByZoomLevel(address: string, zoomLevel: number): string {
  // 서울특별시, 서울시 제거
  let adjusted = address.replace(/^서울특별시\s*/, '').replace(/^서울시\s*/, '');
  
  // ⚠️ 개인정보 보호: 번지, 상세 주소 등 마지막 단위 제거
  // 번지수 제거 (예: "123번지", "123-45번지")
  adjusted = adjusted.replace(/\s+[0-9-]+번지.*$/, '');
  
  // 도로명 주소 처리: 숫자만 있는 경우 제거 (예: "테헤란로 123" → "테헤란로")
  // 하지만 "길" 단위는 유지 (예: "테헤란로 123길" → "테헤란로 123길")
  // 숫자만 있는 마지막 단위 제거 (예: "123", "123-45")
  adjusted = adjusted.replace(/\s+[0-9-]+(?![가-힣])$/, '');
  
  // 지번 주소에서 상세 주소 제거 (예: "123", "123-45", "123-45가")
  // 단, "길"로 끝나는 경우는 유지 (도로명 주소의 길 단위)
  if (!adjusted.match(/[가-힣]+길$/)) {
    adjusted = adjusted.replace(/\s+[0-9-]+[가-힣]?$/, '');
  }
  
  // 줌 레벨에 따른 주소 단위 조정
  // ⚠️ 개인정보 보호: 번지는 항상 제거, 하지만 도로명 주소의 "길" 단위까지는 표시 가능
  // ✅ 실질 데이터 주소가 들어가면 더 상세한 주소 표시 가능
  if (zoomLevel <= 11) {
    // 줌 아웃 (스팟이 합쳐짐) → 구 단위만 표시
    // 예: "강남구"
    const guMatch = adjusted.match(/^([가-힣]+구)/);
    if (guMatch) {
      return guMatch[1]; // "강남구"
    }
    return adjusted.split(' ')[0] || adjusted; // 첫 번째 단어만
  } else if (zoomLevel <= 13) {
    // 중간 줌 → 구/도로명 또는 구/동 단위 표시 (더 상세하게)
    // 예: "강남구 테헤란로" 또는 "강남구 서초동"
    
    // 도로명 주소 패턴 (예: "강남구 테헤란로", "강남구 테헤란로 123길")
    const roadMatch = adjusted.match(/^([가-힣]+구)\s+([가-힣]+로)(?:\s+[가-힣]+길)?/);
    if (roadMatch) {
      return roadMatch[0]; // "강남구 테헤란로" 또는 "강남구 테헤란로 123길"
    }
    
    // 동 단위 주소 패턴 (예: "강남구 서초동")
    const dongMatch = adjusted.match(/^([가-힣]+구)\s+([가-힣]+동)/);
    if (dongMatch) {
      return dongMatch[0]; // "강남구 서초동"
    }
    
    const guMatch = adjusted.match(/^([가-힣]+구)/);
    if (guMatch) {
      return guMatch[1]; // "강남구"
    }
    return adjusted.split(' ').slice(0, 2).join(' ') || adjusted; // 처음 2개 단어
  } else {
    // 줌 인 (스팟이 분리됨) → 구/도로명/길 또는 구/동 단위 표시 (번지 제거, 더 상세하게)
    // 예: "강남구 테헤란로 123길" 또는 "강남구 서초동"
    // ✅ 실질 데이터 주소가 들어가면 더 상세한 주소 표시 가능
    
    // 도로명 주소 패턴 (예: "강남구 테헤란로", "강남구 테헤란로 123길")
    // ⚠️ "길" 단위까지는 표시 가능 (개인정보 보호를 위해 번지만 제거)
    const roadMatch = adjusted.match(/^([가-힣]+구)\s+([가-힣]+로)(?:\s+[가-힣]+길)?/);
    if (roadMatch) {
      return roadMatch[0]; // "강남구 테헤란로" 또는 "강남구 테헤란로 123길"
    }
    
    // 동 단위 주소 패턴 (예: "강남구 서초동")
    // 동 단위는 그대로 유지 (개인정보 보호)
    const dongMatch = adjusted.match(/^([가-힣]+구)\s+([가-힣]+동)/);
    if (dongMatch) {
      return dongMatch[0]; // "강남구 서초동"
    }
    
    const guMatch = adjusted.match(/^([가-힣]+구)/);
    if (guMatch) {
      return guMatch[1]; // "강남구"
    }
    return adjusted; // 이미 마지막 단위 제거됨
  }
}

/**
 * 블록 내부 중심 좌표 계산 (도로가 아닌 블록 내부)
 * Geohash 블록의 중심점에서 약간 오프셋을 주어 블록 내부로 이동
 * ⚠️ 중요: 동일한 geohash에 대해 항상 같은 오프셋을 적용하여 줌인/줌아웃 시에도 위치가 고정되도록 함
 * 
 * @param geohash - Geohash 문자열
 * @param offsetMeters - 기본 오프셋 거리 (미터)
 * @param centerId - 센터 ID (같은 위치의 다른 센터를 구분하기 위해 사용, 선택적)
 */
export function getBlockCenterCoordinates(
  geohash: string, 
  offsetMeters: number = 20,
  centerId?: string
): { lat: number; lng: number } {
  const { latitude, longitude } = ngeohash.decode(geohash);
  
  // Geohash 정밀도에 따라 오프셋 조정
  const precision = geohash.length;
  let offset = offsetMeters;
  
  if (precision >= 8) {
    // 8자리: 건물 단위 (약 38m) → 작은 오프셋
    offset = 10;
  } else if (precision >= 7) {
    // 7자리: 블록 단위 (약 150m) → 중간 오프셋
    offset = 20;
  } else if (precision >= 6) {
    // 6자리: 구역 단위 (약 1.2km) → 큰 오프셋
    offset = 50;
  } else {
    // 그 외: 큰 오프셋
    offset = 100;
  }
  
  // ⚠️ 동일한 geohash + centerId 조합에 대해 항상 같은 오프셋 적용 (줌인/줌아웃 시 위치 고정)
  // geohash와 centerId를 조합하여 해시값을 생성하여 결정적인 각도 생성
  // 같은 위치의 다른 센터는 다른 각도로 분산됨
  const hashKey = centerId ? `${geohash}_${centerId}` : geohash;
  const hash = hashKey.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const angle = (hash % 360) * (Math.PI / 180);
  
  const offsetLat = (offset / 111320) * Math.sin(angle); // 위도 1m ≈ 1/111320 deg
  const offsetLng = (offset / (111320 * Math.cos(latitude * Math.PI / 180))) * Math.cos(angle);
  
  return {
    lat: latitude + offsetLat,
    lng: longitude + offsetLng
  };
}

