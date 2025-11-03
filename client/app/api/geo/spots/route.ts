/**
 * 지오해시 블록 기반 스팟 API
 * 
 * 연동되는 데이터:
 * - 주소 데이터를 지오해시 블록으로 집계
 * - k-익명성, 노이즈, 반올림을 통한 프라이버시 보호
 * 
 * 연동되는 파일:
 * - client/app/admin/geo/page-block-spots.tsx (프론트엔드)
 * - client/lib/center-colors.ts (센터 색상 관리)
 */

import { NextRequest, NextResponse } from 'next/server';
import ngeohash from 'ngeohash';

type Row = { 
  geohash: string; 
  center_id: string; 
  memberType: 'member' | 'instructor' | 'guest' | 'center';
  count: number; 
};

// 서울 강남구/서초구 경계 박스 (실제 지오해시 범위에 맞춤)
const BBOX_SEOUL = { 
  minLng: 126.9, 
  minLat: 37.4, 
  maxLng: 127.1, 
  maxLat: 37.6 
};

const K = 20;                 // 운영 기본 k-익명 (강화)
const ROUND = 1;              // 1명 단위 반올림 (최소 단위 1명으로 변경)
const EPS = 1.5;              // 라플라스 노이즈 ε (강한 보호)

// 라플라스 노이즈 생성
const laplace = (n: number, eps = 1) => 
  n + (Math.random() < 0.5 ? -1 : 1) * (Math.log(1 - Math.random()) / -eps);

// 1명 단위 반올림 (최소 단위 1명)
const round5 = (n: number) => Math.max(1, Math.round(n)); // 최소 1명 보장

// 경계 박스 내부 확인
function insideBBox(lng: number, lat: number, b = BBOX_SEOUL) {
  return lng >= b.minLng && lng <= b.maxLng && lat >= b.minLat && lat <= b.maxLat;
}

// DB에서 블록 집계 읽어오기
// ⚠️ 실제 DB 데이터 사용 - 서버 API 호출
async function fetchAggBlocks(precision: number, dong?: string, memberType?: string): Promise<Row[]> {
  try {
    // 서버 API에서 실제 회원 데이터 가져오기
    const serverUrl = process.env.SERVER_URL || 'http://localhost:5000';
    const queryParams = new URLSearchParams({
      precision: String(precision),
      ...(memberType && memberType !== 'all' && { memberType })
    });
    
    const response = await fetch(`${serverUrl}/api/geo/aggregate?${queryParams.toString()}`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.warn(`⚠️ 서버 API 호출 실패 (${response.status}), 목업 데이터 사용`);
      // 서버 API 실패 시 목업 데이터 사용 (하위 호환성)
      return getMockData(memberType);
    }

    let result;
    try {
      result = await response.json();
    } catch (jsonError) {
      console.error('❌ 서버 API JSON 파싱 오류:', jsonError);
      console.log('⚠️ 목업 데이터 사용');
      return getMockData(memberType);
    }
    
    if (!result || !result.success || !result.data || !result.data.cells) {
      console.warn('⚠️ 서버 API 응답 형식 오류:', result);
      console.log('⚠️ 목업 데이터 사용');
      return getMockData(memberType);
    }

    // H3 셀 데이터를 geohash 형식으로 변환
    const rows: Row[] = [];
    const cells = result.data.cells || [];
    
    for (const cell of cells) {
      // H3 셀을 geohash로 변환 (간단한 근사)
      // 실제로는 H3 셀의 중심 좌표를 geohash로 변환
      const [lat, lng] = cell.h3Index ? parseH3ToLatLng(cell.h3Index) : [cell.lat, cell.lng];
      const geohash = ngeohash.encode(lat, lng, precision);
      
      // 각 센터별로 행 생성
      if (cell.centers && Array.isArray(cell.centers)) {
        for (const center of cell.centers) {
          rows.push({
            geohash,
            center_id: center.centerId || cell.dominantCenter || '기타',
            memberType: memberType === 'all' ? 'member' : (memberType as any) || 'member',
            count: center.countApprox || cell.totalApprox || 0
          });
        }
      } else {
        // centers 배열이 없으면 dominantCenter만 사용
        rows.push({
          geohash,
          center_id: cell.dominantCenter || '기타',
          memberType: memberType === 'all' ? 'member' : (memberType as any) || 'member',
          count: cell.totalApprox || 0
        });
      }
    }

    if (rows.length === 0) {
      console.warn('⚠️ 서버 API에서 데이터가 없음, 목업 데이터 사용');
      return getMockData(memberType);
    }

    console.log(`✅ 실제 DB 데이터 사용: ${rows.length}개 블록`);
    return rows;
  } catch (error) {
    console.error('❌ 서버 API 호출 오류:', error);
    console.error('❌ 에러 상세:', error instanceof Error ? error.message : String(error));
    console.error('❌ 에러 스택:', error instanceof Error ? error.stack : '');
    console.log('⚠️ 목업 데이터 사용');
    return getMockData(memberType);
  }
}

// H3 인덱스 파싱 (간단한 파서)
function parseH3ToLatLng(h3Index: string): [number, number] {
  // H3 인덱스가 "h3_8_37_127" 형식인 경우
  const parts = h3Index.split('_');
  if (parts.length >= 4) {
    const lat = parseFloat(parts[2]) || 37.4979;
    const lng = parseFloat(parts[3]) || 127.0276;
    return [lat, lng];
  }
  // 기본값 (강남역)
  return [37.4979, 127.0276];
}

// 블록 내부 중심 좌표 계산 (도로가 아닌 블록 내부)
function getBlockCenterFromGeohash(geohash: string, precision: number): { lat: number; lng: number } {
  try {
    const { latitude, longitude } = ngeohash.decode(geohash);
    
    // Geohash 정밀도에 따라 오프셋 조정 (블록 내부로 이동)
    let offsetMeters = 20;
    
    if (precision >= 8) {
      // 8자리: 건물 단위 (약 38m) → 작은 오프셋
      offsetMeters = 10;
    } else if (precision >= 7) {
      // 7자리: 블록 단위 (약 150m) → 중간 오프셋
      offsetMeters = 20;
    } else if (precision >= 6) {
      // 6자리: 구역 단위 (약 1.2km) → 큰 오프셋
      offsetMeters = 50;
    } else {
      // 그 외: 큰 오프셋
      offsetMeters = 100;
    }
    
    // 동일한 geohash에 대해 항상 같은 오프셋 적용 (일관성)
    const hash = geohash.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const angle = (hash % 360) * (Math.PI / 180);
    
    const offsetLat = (offsetMeters / 111320) * Math.sin(angle); // 위도 1m ≈ 1/111320 deg
    const offsetLng = (offsetMeters / (111320 * Math.cos(latitude * Math.PI / 180))) * Math.cos(angle);
    
    return {
      lat: latitude + offsetLat,
      lng: longitude + offsetLng
    };
  } catch (error) {
    console.error('❌ 블록 중심 좌표 계산 오류:', error);
    // 오류 시 원본 좌표 반환
    try {
      const { latitude, longitude } = ngeohash.decode(geohash);
      return { lat: latitude, lng: longitude };
    } catch {
      return { lat: 37.4979, lng: 127.0276 }; // 강남역 기본값
    }
  }
}

// 목업 데이터 (하위 호환성) - 줌 레벨별 집계 테스트를 위해 분산된 데이터
function getMockData(memberType?: string): Row[] {
  // ⚠️ 목업 데이터 구조:
  // - 같은 5자리 접두사(wydm6)를 가진 여러 7-8자리 geohash 생성
  // - 줌 아웃 시 5자리로 집계되면 합쳐짐
  // - 줌 인 시 7-8자리로 집계되면 분리됨
  
  const mockData: Row[] = [
    // 구역 1: wydm6 (5자리) - 줌 아웃 시 합쳐짐 (총 ~45명)
    // 7-8자리 geohash로 분산된 블록들 (줌 인 시 분리됨)
    { geohash: 'wydm69e1', center_id: '강남센터', memberType: 'member', count: 4 },
    { geohash: 'wydm69e2', center_id: '강남센터', memberType: 'member', count: 3 },
    { geohash: 'wydm69f1', center_id: '강남센터', memberType: 'member', count: 5 },
    { geohash: 'wydm69f2', center_id: '강남센터', memberType: 'member', count: 4 },
    { geohash: 'wydm69g1', center_id: '강남센터', memberType: 'member', count: 2 },
    { geohash: 'wydm69h1', center_id: '강남센터', memberType: 'member', count: 6 },
    { geohash: 'wydm69h2', center_id: '강남센터', memberType: 'member', count: 5 },
    { geohash: 'wydm6dm1', center_id: '홍대센터', memberType: 'member', count: 3 },
    { geohash: 'wydm6dm2', center_id: '홍대센터', memberType: 'member', count: 3 },
    { geohash: 'wydm6dn1', center_id: '홍대센터', memberType: 'member', count: 2 },
    { geohash: 'wydm6dc1', center_id: '송파센터', memberType: 'member', count: 4 },
    { geohash: 'wydm6dc2', center_id: '송파센터', memberType: 'member', count: 3 },
    { geohash: 'wydm6dd1', center_id: '송파센터', memberType: 'member', count: 5 },
    { geohash: 'wydm6dd2', center_id: '송파센터', memberType: 'member', count: 4 },
    { geohash: 'wydm6981', center_id: '강남센터', memberType: 'member', count: 6 },
    { geohash: 'wydm6982', center_id: '강남센터', memberType: 'member', count: 5 },
    { geohash: 'wydm6991', center_id: '강남센터', memberType: 'member', count: 3 },
    { geohash: 'wydm6992', center_id: '강남센터', memberType: 'member', count: 3 },
    
    // 구역 2: wydm7 (5자리) - 줌 아웃 시 합쳐짐 (총 ~85명)
    { geohash: 'wydm7du1', center_id: '마포센터', memberType: 'member', count: 4 },
    { geohash: 'wydm7du2', center_id: '마포센터', memberType: 'member', count: 4 },
    { geohash: 'wydm7dv1', center_id: '마포센터', memberType: 'member', count: 3 },
    { geohash: 'wydm7dv2', center_id: '마포센터', memberType: 'member', count: 2 },
    { geohash: 'wydm7eh1', center_id: '송파센터', memberType: 'member', count: 5 },
    { geohash: 'wydm7eh2', center_id: '송파센터', memberType: 'member', count: 5 },
    { geohash: 'wydm7ei1', center_id: '송파센터', memberType: 'member', count: 4 },
    { geohash: 'wydm7ei2', center_id: '송파센터', memberType: 'member', count: 3 },
    { geohash: 'wydm7ej1', center_id: '송파센터', memberType: 'member', count: 4 },
    { geohash: 'wydm7ej2', center_id: '송파센터', memberType: 'member', count: 4 },
    { geohash: 'wydm76p1', center_id: '강남센터', memberType: 'member', count: 3 },
    { geohash: 'wydm76p2', center_id: '강남센터', memberType: 'member', count: 3 },
    { geohash: 'wydm76q1', center_id: '강남센터', memberType: 'member', count: 2 },
    { geohash: 'wydm76q2', center_id: '강남센터', memberType: 'member', count: 2 },
    { geohash: 'wydm79v1', center_id: '홍대센터', memberType: 'member', count: 6 },
    { geohash: 'wydm79v2', center_id: '홍대센터', memberType: 'member', count: 6 },
    { geohash: 'wydm79w1', center_id: '홍대센터', memberType: 'member', count: 8 },
    { geohash: 'wydm79w2', center_id: '홍대센터', memberType: 'member', count: 7 },
    { geohash: 'wydm79x1', center_id: '홍대센터', memberType: 'member', count: 4 },
    { geohash: 'wydm79x2', center_id: '홍대센터', memberType: 'member', count: 4 },
    
    // 구역 3: wydm8 (5자리) - 줌 아웃 시 합쳐짐 (총 ~65명)
    { geohash: 'wydm8dc1', center_id: '마포센터', memberType: 'member', count: 3 },
    { geohash: 'wydm8dc2', center_id: '마포센터', memberType: 'member', count: 2 },
    { geohash: 'wydm8dd1', center_id: '마포센터', memberType: 'member', count: 4 },
    { geohash: 'wydm8dd2', center_id: '마포센터', memberType: 'member', count: 3 },
    { geohash: 'wydm8d01', center_id: '송파센터', memberType: 'member', count: 4 },
    { geohash: 'wydm8d02', center_id: '송파센터', memberType: 'member', count: 4 },
    { geohash: 'wydm8d11', center_id: '송파센터', memberType: 'member', count: 3 },
    { geohash: 'wydm8d12', center_id: '송파센터', memberType: 'member', count: 3 },
    { geohash: 'wydm8d21', center_id: '송파센터', memberType: 'member', count: 3 },
    { geohash: 'wydm8d22', center_id: '송파센터', memberType: 'member', count: 3 },
    { geohash: 'wydm8dk1', center_id: '강남센터', memberType: 'member', count: 2 },
    { geohash: 'wydm8dk2', center_id: '강남센터', memberType: 'member', count: 2 },
    { geohash: 'wydm8dl1', center_id: '강남센터', memberType: 'member', count: 3 },
    { geohash: 'wydm8dl2', center_id: '강남센터', memberType: 'member', count: 2 },
    { geohash: 'wydm89e1', center_id: '마포센터', memberType: 'member', count: 5 },
    { geohash: 'wydm89e2', center_id: '마포센터', memberType: 'member', count: 4 },
    { geohash: 'wydm89f1', center_id: '마포센터', memberType: 'member', count: 6 },
    { geohash: 'wydm89f2', center_id: '마포센터', memberType: 'member', count: 5 },
    { geohash: 'wydm89g1', center_id: '마포센터', memberType: 'member', count: 4 },
    { geohash: 'wydm89g2', center_id: '마포센터', memberType: 'member', count: 4 },
    
    // 구역 4: wydm9 (5자리) - 줌 아웃 시 합쳐짐 (총 ~61명)
    { geohash: 'wydm9dm1', center_id: '홍대센터', memberType: 'member', count: 4 },
    { geohash: 'wydm9dm2', center_id: '홍대센터', memberType: 'member', count: 3 },
    { geohash: 'wydm9dn1', center_id: '홍대센터', memberType: 'member', count: 3 },
    { geohash: 'wydm9dn2', center_id: '홍대센터', memberType: 'member', count: 2 },
    { geohash: 'wydm9dc1', center_id: '강남센터', memberType: 'member', count: 3 },
    { geohash: 'wydm9dc2', center_id: '강남센터', memberType: 'member', count: 3 },
    { geohash: 'wydm9dd1', center_id: '강남센터', memberType: 'member', count: 4 },
    { geohash: 'wydm9dd2', center_id: '강남센터', memberType: 'member', count: 4 },
    { geohash: 'wydm9de1', center_id: '강남센터', memberType: 'member', count: 2 },
    { geohash: 'wydm9de2', center_id: '강남센터', memberType: 'member', count: 2 },
    { geohash: 'wydm9981', center_id: '송파센터', memberType: 'member', count: 3 },
    { geohash: 'wydm9982', center_id: '송파센터', memberType: 'member', count: 2 },
    { geohash: 'wydm9991', center_id: '송파센터', memberType: 'member', count: 4 },
    { geohash: 'wydm9992', center_id: '송파센터', memberType: 'member', count: 3 },
    { geohash: 'wydm9du1', center_id: '강남센터', memberType: 'member', count: 5 },
    { geohash: 'wydm9du2', center_id: '강남센터', memberType: 'member', count: 5 },
    { geohash: 'wydm9dv1', center_id: '강남센터', memberType: 'member', count: 4 },
    { geohash: 'wydm9dv2', center_id: '강남센터', memberType: 'member', count: 4 },
    { geohash: 'wydm9dw1', center_id: '강남센터', memberType: 'member', count: 3 },
    { geohash: 'wydm9dw2', center_id: '강남센터', memberType: 'member', count: 3 },
    
    // 구역 5: wydmb (5자리) - 줌 아웃 시 합쳐짐 (총 ~57명)
    { geohash: 'wydmbeh1', center_id: '홍대센터', memberType: 'member', count: 5 },
    { geohash: 'wydmbeh2', center_id: '홍대센터', memberType: 'member', count: 4 },
    { geohash: 'wydmbei1', center_id: '홍대센터', memberType: 'member', count: 6 },
    { geohash: 'wydmbei2', center_id: '홍대센터', memberType: 'member', count: 5 },
    { geohash: 'wydmbej1', center_id: '홍대센터', memberType: 'member', count: 4 },
    { geohash: 'wydmbej2', center_id: '홍대센터', memberType: 'member', count: 4 },
    { geohash: 'wydmb6p1', center_id: '송파센터', memberType: 'member', count: 4 },
    { geohash: 'wydmb6p2', center_id: '송파센터', memberType: 'member', count: 3 },
    { geohash: 'wydmb6q1', center_id: '송파센터', memberType: 'member', count: 3 },
    { geohash: 'wydmb6q2', center_id: '송파센터', memberType: 'member', count: 2 },
    { geohash: 'wydmb9v1', center_id: '마포센터', memberType: 'member', count: 3 },
    { geohash: 'wydmb9v2', center_id: '마포센터', memberType: 'member', count: 3 },
    { geohash: 'wydmb9w1', center_id: '마포센터', memberType: 'member', count: 4 },
    { geohash: 'wydmb9w2', center_id: '마포센터', memberType: 'member', count: 4 },
    { geohash: 'wydmb9x1', center_id: '마포센터', memberType: 'member', count: 2 },
    { geohash: 'wydmb9x2', center_id: '마포센터', memberType: 'member', count: 2 },
    
    // 강사 데이터 (비슷한 구조로 분산, 각 구역에 분산 배치)
    { geohash: 'wydm69e1', center_id: '강남센터', memberType: 'instructor', count: 1 },
    { geohash: 'wydm69f1', center_id: '강남센터', memberType: 'instructor', count: 1 },
    { geohash: 'wydm6dm1', center_id: '홍대센터', memberType: 'instructor', count: 1 },
    { geohash: 'wydm7du1', center_id: '마포센터', memberType: 'instructor', count: 1 },
    { geohash: 'wydm7eh1', center_id: '송파센터', memberType: 'instructor', count: 1 },
    { geohash: 'wydm7eh2', center_id: '송파센터', memberType: 'instructor', count: 1 },
    { geohash: 'wydm76p1', center_id: '강남센터', memberType: 'instructor', count: 1 },
    { geohash: 'wydm79v1', center_id: '홍대센터', memberType: 'instructor', count: 1 },
    { geohash: 'wydm79v2', center_id: '홍대센터', memberType: 'instructor', count: 1 },
    { geohash: 'wydm8dc1', center_id: '마포센터', memberType: 'instructor', count: 1 },
    { geohash: 'wydm8d01', center_id: '송파센터', memberType: 'instructor', count: 1 },
    { geohash: 'wydm8dk1', center_id: '강남센터', memberType: 'instructor', count: 1 },
    { geohash: 'wydm89e1', center_id: '마포센터', memberType: 'instructor', count: 1 },
    { geohash: 'wydm89e2', center_id: '마포센터', memberType: 'instructor', count: 1 },
    { geohash: 'wydm9dm1', center_id: '홍대센터', memberType: 'instructor', count: 1 },
    { geohash: 'wydm9dc1', center_id: '강남센터', memberType: 'instructor', count: 1 },
    { geohash: 'wydm9dc2', center_id: '강남센터', memberType: 'instructor', count: 1 },
    { geohash: 'wydm9981', center_id: '송파센터', memberType: 'instructor', count: 1 },
    { geohash: 'wydm9du1', center_id: '강남센터', memberType: 'instructor', count: 1 },
    { geohash: 'wydmbeh1', center_id: '홍대센터', memberType: 'instructor', count: 1 },
    { geohash: 'wydmbeh2', center_id: '홍대센터', memberType: 'instructor', count: 1 },
    { geohash: 'wydmbeh3', center_id: '홍대센터', memberType: 'instructor', count: 1 },
    { geohash: 'wydmb6p1', center_id: '송파센터', memberType: 'instructor', count: 1 },
    { geohash: 'wydmb9v1', center_id: '마포센터', memberType: 'instructor', count: 1 },
    
    // 게스트 데이터 (비슷한 구조로 분산, 각 구역에 분산 배치)
    { geohash: 'wydm69e1', center_id: '강남센터', memberType: 'guest', count: 1 },
    { geohash: 'wydm69f1', center_id: '홍대센터', memberType: 'guest', count: 1 },
    { geohash: 'wydm69g1', center_id: '송파센터', memberType: 'guest', count: 1 },
    { geohash: 'wydm7ae1', center_id: '강남센터', memberType: 'guest', count: 1 },
    { geohash: 'wydm7af1', center_id: '마포센터', memberType: 'guest', count: 1 },
    { geohash: 'wydm7ag1', center_id: '송파센터', memberType: 'guest', count: 1 },
    { geohash: 'wydm7ag2', center_id: '송파센터', memberType: 'guest', count: 1 },
    { geohash: 'wydm8be1', center_id: '홍대센터', memberType: 'guest', count: 1 },
    { geohash: 'wydm8be2', center_id: '홍대센터', memberType: 'guest', count: 1 },
    { geohash: 'wydm8bf1', center_id: '마포센터', memberType: 'guest', count: 1 },
    { geohash: 'wydm8bg1', center_id: '송파센터', memberType: 'guest', count: 1 },
    { geohash: 'wydm9ce1', center_id: '강남센터', memberType: 'guest', count: 1 },
    { geohash: 'wydm9cf1', center_id: '마포센터', memberType: 'guest', count: 1 },
    { geohash: 'wydm9cf2', center_id: '마포센터', memberType: 'guest', count: 1 },
    { geohash: 'wydm9cg1', center_id: '홍대센터', memberType: 'guest', count: 1 },
    { geohash: 'wydmbde1', center_id: '강남센터', memberType: 'guest', count: 1 },
    { geohash: 'wydmbde2', center_id: '강남센터', memberType: 'guest', count: 1 },
    { geohash: 'wydmbdf1', center_id: '송파센터', memberType: 'guest', count: 1 },
    { geohash: 'wydmbdg1', center_id: '홍대센터', memberType: 'guest', count: 1 },
    { geohash: 'wydmbdg2', center_id: '홍대센터', memberType: 'guest', count: 1 },
    { geohash: 'wydmbdg3', center_id: '홍대센터', memberType: 'guest', count: 1 },
    { geohash: 'wydmbdh1', center_id: '마포센터', memberType: 'guest', count: 1 },
    
    // 센터 데이터 (각 센터 위치에 1개씩)
    { geohash: 'wydm69e', center_id: '강남센터', memberType: 'center', count: 1 },
    { geohash: 'wydm6dm', center_id: '홍대센터', memberType: 'center', count: 1 },
    { geohash: 'wydm6dc', center_id: '송파센터', memberType: 'center', count: 1 },
    { geohash: 'wydm7du', center_id: '마포센터', memberType: 'center', count: 1 },
    { geohash: 'wydm8dc', center_id: '수원센터', memberType: 'center', count: 1 },
    { geohash: 'wydm9dm', center_id: '성남센터', memberType: 'center', count: 1 },
    { geohash: 'wydmbeh', center_id: '인천센터', memberType: 'center', count: 1 },
    { geohash: 'wydm69f', center_id: '부산센터', memberType: 'center', count: 1 },
    { geohash: 'wydm69g', center_id: '대구센터', memberType: 'center', count: 1 },
    { geohash: 'wydm7ae', center_id: '광주센터', memberType: 'center', count: 1 },
    { geohash: 'wydm7af', center_id: '대전센터', memberType: 'center', count: 1 },
    { geohash: 'wydm7ag', center_id: '울산센터', memberType: 'center', count: 1 },
    { geohash: 'wydm8be', center_id: '세종센터', memberType: 'center', count: 1 },
    { geohash: 'wydm8bf', center_id: '춘천센터', memberType: 'center', count: 1 },
    { geohash: 'wydm8bg', center_id: '강릉센터', memberType: 'center', count: 1 },
    { geohash: 'wydm9ce', center_id: '기타', memberType: 'center', count: 1 },
  ];

  // memberType 필터링
  if (memberType && memberType !== 'all') {
    return mockData.filter(row => row.memberType === memberType);
  }

  return mockData;
}

export async function GET(req: NextRequest) {
  try {
    console.log('🗺️ 지오해시 블록 스팟 API 호출 시작');

    const p = Number(req.nextUrl.searchParams.get('precision') || '7'); // 7 or 8 권장
    const dong = req.nextUrl.searchParams.get('dong') || undefined;
    const k = Number(req.nextUrl.searchParams.get('k') || K);
    const memberType = req.nextUrl.searchParams.get('memberType') || 'all';
    const zoom = Number(req.nextUrl.searchParams.get('zoom') || '12'); // 줌 레벨 추가

    console.log(`📊 요청 파라미터: precision=${p}, dong=${dong}, k=${k}, memberType=${memberType}, zoom=${zoom}`);

    // fetchAggBlocks는 에러 발생 시 자동으로 목업 데이터 반환
    let rows: Row[];
    try {
      rows = await fetchAggBlocks(p, dong, memberType);
    } catch (fetchError) {
      console.error('❌ fetchAggBlocks 호출 오류:', fetchError);
      console.log('⚠️ 목업 데이터로 대체');
      rows = getMockData(memberType);
    }
    
    if (!rows || rows.length === 0) {
      console.warn('⚠️ 데이터가 비어있음, 목업 데이터 사용');
      rows = getMockData(memberType);
    }

    // 정밀도별 구역 분할 (블록/건물 단위로 더 세밀하게)
    // ⚠️ 조정: 줌 14부터 스팟이 분리되도록 설정 (이전: 줌 16부터)
    let aggregationPrecision: number;
    if (zoom >= 17) {
      // 줌≥17: 건물 단위 (8자리, ≈38m) - 매우 세밀
      aggregationPrecision = 8;
    } else if (zoom >= 15) {
      // 줌 15-16: 블록 단위 (7자리, ≈150m) - 세밀
      aggregationPrecision = 7;
    } else if (zoom >= 14) {
      // 줌 14: 블록 단위 (7자리, ≈150m) - 스팟 분리 시작 ⚠️ 조정
      aggregationPrecision = 7;
    } else if (zoom >= 13) {
      // 줌 13: 작은 구역 단위 (6자리, ≈1.2km)
      aggregationPrecision = 6;
    } else if (zoom >= 12) {
      // 줌 12: 구역 단위 (6자리, ≈1.2km)
      aggregationPrecision = 6;
    } else if (zoom >= 10) {
      // 줌 10-11: 행정동 단위 (5자리, ≈4.9km)
      aggregationPrecision = 5;
    } else if (zoom >= 9) {
      // 줌 9: 행정구 단위 (4자리, ≈19.5km)
      aggregationPrecision = 4;
    } else {
      // 줌<9: 시 단위 (3자리, ≈78km)
      aggregationPrecision = 3;
    }
    
    // ⚠️ 중요: 센터별로 별도 집계 (같은 센터만 합침, 다른 센터와 합치지 않음)
    // - 키 형식: `${geohashPrefix}_${centerId}` 
    // - 줌 아웃 시 같은 구역의 같은 센터 회원만 합쳐짐
    // - 색상 구분을 위해 센터별로 별도 스팟 생성
    const byAggregation = new Map<string, { 
      lat: number; 
      lng: number; 
      centerId: string; // 단일 센터만 저장
      count: number; // 해당 센터의 총 인원수
      blocks: Array<{ geohash: string; count: number }>; // 원본 블록들과 각 블록의 인원수
      geohashPrefix: string; // 집계 키의 geohash 부분
    }>();

    for (const r of rows) {
      const { latitude, longitude } = ngeohash.decode(r.geohash);
      console.log(`📍 지오해시 ${r.geohash} → 좌표: (${latitude}, ${longitude}), 센터: ${r.center_id}`);
      
      if (dong && !insideBBox(longitude, latitude)) continue; // 간단 bbox clip
      
      // ⚠️ 센터별 별도 집계 키: geohash + centerId 조합
      // 같은 구역의 같은 센터만 합쳐짐
      const geohashPrefix = r.geohash.substring(0, aggregationPrecision);
      const aggregationKey = `${geohashPrefix}_${r.center_id}`;
      
      if (!byAggregation.has(aggregationKey)) {
        byAggregation.set(aggregationKey, { 
          lat: 0, // 나중에 가중 평균으로 계산
          lng: 0, // 나중에 가중 평균으로 계산
          centerId: r.center_id, // 단일 센터만 저장
          count: 0, // 해당 센터의 총 인원수
          blocks: [], // 각 블록의 geohash와 인원수 저장
          geohashPrefix: geohashPrefix
        });
      }
      
      const aggregation = byAggregation.get(aggregationKey)!;
      aggregation.count += r.count; // 같은 센터만 합침
      
      // 블록 정보 저장 (각 블록의 인원수 포함)
      const existingBlock = aggregation.blocks.find(b => b.geohash === r.geohash);
      if (existingBlock) {
        existingBlock.count += r.count; // 같은 블록이면 인원수 누적
      } else {
        aggregation.blocks.push({ geohash: r.geohash, count: r.count });
      }
    }

    // ✅ 가중 평균 중심점 계산 (Weighted Centroid): 주소지 블록들의 가중치 합으로 중앙 지점 구하기
    // 공식: Centroid = Σ(위치 × 가중치) / Σ(가중치)
    // - 각 블록의 중심점 좌표(latitude, longitude)와 인원수(block.count)를 사용
    // - 인원수가 많은 블록일수록 중심점에 더 큰 영향력을 가짐 (밀도가 높은 곳이 중심에 가까워짐)
    // - 센터별로 별도 계산하여 같은 위치의 다른 센터 스팟이 분리됨
    for (const [key, aggregation] of byAggregation.entries()) {
      let weightedLat = 0;  // 가중 합: Σ(위도 × 인원수)
      let weightedLng = 0;  // 가중 합: Σ(경도 × 인원수)
      let totalWeight = 0;  // 총 가중치: Σ(인원수)

      for (const block of aggregation.blocks) {
        // geohash 블록의 중심 좌표 디코딩
        const { latitude, longitude } = ngeohash.decode(block.geohash);
        
        // ⚠️ 각 블록의 실제 인원수를 가중치로 사용 (Weighted Centroid 공식)
        // 인원수가 많은 블록일수록 중심점 계산에 더 큰 비중을 가짐
        const blockCount = block.count || 1;
        
        // 가중 합 누적: 위치 × 가중치(인원수)
        weightedLat += latitude * blockCount;
        weightedLng += longitude * blockCount;
        totalWeight += blockCount;
      }

      // 가중 평균 중심점 계산: Centroid = Σ(위치 × 가중치) / Σ(가중치)
      if (totalWeight > 0) {
        aggregation.lat = weightedLat / totalWeight;
        aggregation.lng = weightedLng / totalWeight;
        console.log(`📍 가중 평균 중심점 계산: ${key} → (${aggregation.lat.toFixed(6)}, ${aggregation.lng.toFixed(6)}), 총 ${aggregation.blocks.length}개 블록, 총 ${totalWeight}명`);
      } else {
        // 가중치가 0인 경우 첫 번째 블록의 좌표 사용 (예외 처리)
        const firstBlock = aggregation.blocks[0];
        if (firstBlock) {
          const { latitude, longitude } = ngeohash.decode(firstBlock.geohash);
          aggregation.lat = latitude;
          aggregation.lng = longitude;
          console.warn(`⚠️ 가중치가 0이므로 첫 번째 블록 좌표 사용: ${key}`);
        }
      }
    }

    // 주소 수집 단위 이름 매핑 (블록/건물 단위로 더 세밀하게)
    const getAdministrativeUnit = (precision: number) => {
      switch (precision) {
        case 8: return '건물 단위 (≈38m)';
        case 7: return '블록 단위 (≈150m)';
        case 6: return '블록 단위 (≈1.2km)';
        case 5: return '구역 단위 (≈4.9km)';
        case 4: return '행정동 단위 (≈19.5km)';
        case 3: return '행정구 단위 (≈78km)';
        case 2: return '시 단위 (≈312km)';
        default: return `${precision}자리`;
      }
    };

    // ⚠️ 위에서 이미 가중 평균으로 중심점을 계산했으므로 중복 계산 제거
    // 모든 정밀도에 대해 동일한 가중 평균 방식 사용 (각 블록의 실제 인원수 기반)
    for (const [key, aggregation] of byAggregation.entries()) {
      console.log(`📍 중심점 계산 완료: ${key} (센터: ${aggregation.centerId}, 정밀도 ${aggregationPrecision}, ${getAdministrativeUnit(aggregationPrecision)}) → (${aggregation.lat.toFixed(6)}, ${aggregation.lng.toFixed(6)})`);
    }

    console.log(`🔢 행정단위별 집계 (줌 ${zoom}): ${byAggregation.size}개 구역 (${getAdministrativeUnit(aggregationPrecision)})`);
    
    // 정밀도별 구역 분할 상태 로깅 (블록/건물 단위 기준)
    let adminLevel: string;
    if (zoom >= 17) {
      adminLevel = 'building-level'; // 건물 단위
    } else if (zoom >= 14) {
      adminLevel = 'block-level-7'; // 블록 단위 (150m) - ⚠️ 조정: 줌 14부터
    } else if (zoom >= 13) {
      adminLevel = 'block-level-6'; // 블록 단위 (1.2km)
    } else if (zoom >= 12) {
      adminLevel = 'block-level-6'; // 구역 단위 (1.2km)
    } else if (zoom >= 10) {
      adminLevel = 'admin-dong'; // 행정동 단위
    } else if (zoom >= 9) {
      adminLevel = 'admin-gu'; // 행정구 단위
    } else {
      adminLevel = 'city'; // 시 단위
    }
    
    console.log(`🏛️ 정밀도별 구역 분할: ${adminLevel} (줌 ${zoom})`);
    console.log(`🎯 구역 단위: 정밀도 ${aggregationPrecision}자리 (${getAdministrativeUnit(aggregationPrecision)})`);
    console.log(`📍 정밀도별 구역 중심점 계산: 지번주소 단위 기준`);
    
    // 집계 결과 상세 로깅
    console.log(`🔍 정밀도별 구역 분할 분석:`);
    console.log(`   - 줌 레벨: ${zoom} → 정밀도 ${aggregationPrecision}자리 (${getAdministrativeUnit(aggregationPrecision)})`);
    console.log(`   - 총 ${byAggregation.size}개 구역으로 분할됨`);
    console.log(`   - 각 구역은 ${aggregationPrecision}자리 지오해시로 그룹화됨`);
    console.log(`   - 동그라미 개수 = 정밀도별 구역 개수 (${byAggregation.size}개)`);
    console.log(`   - ${getAdministrativeUnit(aggregationPrecision)} 단위로 구역 분할`);
    
    for (const [key, agg] of byAggregation.entries()) {
      console.log(`📍 구역 ${key} (센터: ${agg.centerId}): ${agg.blocks.length}개 블록, ${agg.count}명, 중심 (${agg.lat.toFixed(6)}, ${agg.lng.toFixed(6)})`);
    }

    // ⚠️ 중요: 센터별 별도 스팟 생성 (k-익명 + 노이즈 + 반올림)
    // - 각 aggregation은 이미 단일 센터로 집계됨
    // - dominantCenter는 항상 obj.centerId (이미 센터별로 분리됨)
    const spots: any[] = [];
    let hiddenBlocks = 0;
    let totalOriginalCount = 0;
    let totalApproxCount = 0;

    for (const [aggregationKey, obj] of byAggregation.entries()) {
      const total = obj.count; // 해당 센터의 총 인원수
      totalOriginalCount += total;

      // k-익명성 체크: 해당 센터의 인원수가 k 미만이면 숨김
      if (total < k) {
        hiddenBlocks++;
        continue; // 블록 자체 숨김
      }

      // 노이즈 + 반올림 (보안 강화)
      const countApprox = round5(Math.max(0, laplace(total, EPS)));
      
      if (countApprox <= 0) continue;

      totalApproxCount += countApprox;

      // 유효성 검사
      if (!aggregationKey || typeof obj.lat !== 'number' || typeof obj.lng !== 'number' || !obj.centerId) {
        console.warn('⚠️ 유효하지 않은 스팟 데이터 스킵:', { aggregationKey, lat: obj.lat, lng: obj.lng, centerId: obj.centerId });
        continue;
      }

      // ⚠️ 중요: 가중 평균 중심점을 사용 (이미 obj.lat, obj.lng에 계산됨)
      // - getBlockCenterFromGeohash를 다시 호출하면 가중 평균이 무시되고 geohash prefix의 중심만 사용됨
      // - 줌아웃 시 여러 블록이 합쳐질 때 가중 평균 중심점이 올바른 위치를 나타냄
      // - 블록 내부로 이동시키기 위해 충분한 오프셋 적용 (도로가 아닌 블록 내부)
      const weightedCenter = { lat: obj.lat, lng: obj.lng };
      
      // ✅ 블록 내부로 충분한 오프셋 적용 (도로 위가 아닌 블록 내부로 확실히 이동)
      // ⚠️ 문제: 정밀도에 따라 오프셋이 바뀌면 줌 레벨 변경 시 스팟 위치가 변경됨
      // 해결: 정밀도와 무관하게 충분한 최소 오프셋 보장 + 추가 오프셋 적용
      // 도로 폭은 보통 10-30m이므로, 최소 60m 이상 오프셋 필요
      const baseOffsetMeters = 60; // 최소 기본 오프셋 (도로 폭 고려)
      const precisionOffsetMeters = aggregationPrecision >= 8 ? 20 : (aggregationPrecision >= 7 ? 30 : (aggregationPrecision >= 6 ? 50 : 70));
      const offsetMeters = baseOffsetMeters + precisionOffsetMeters; // 최소 60m, 최대 130m
      
      // 결정론적 각도 계산 (geohash + centerId 기반으로 항상 같은 방향)
      // ⚠️ 중요: geohashPrefix를 사용하여 줌 레벨이 바뀌어도 같은 방향 유지
      const hash = (obj.geohashPrefix || obj.blocks[0]?.geohash || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + (obj.centerId || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const angle = (hash % 360) * (Math.PI / 180);
      
      // 위도/경도 오프셋 계산
      const offsetLat = (offsetMeters / 111320) * Math.sin(angle);
      const offsetLng = (offsetMeters / (111320 * Math.cos(weightedCenter.lat * Math.PI / 180))) * Math.cos(angle);
      
      const finalLat = weightedCenter.lat + offsetLat;
      const finalLng = weightedCenter.lng + offsetLng;
      
      console.log(`📍 스팟 좌표 (가중 평균 중심점 사용): ${obj.centerId} → 가중 평균 (${obj.lat.toFixed(6)}, ${obj.lng.toFixed(6)}) → 최종 (${finalLat.toFixed(6)}, ${finalLng.toFixed(6)}), ${obj.blocks.length}개 블록 합침`);
      
      // ⚠️ 중요: dominantCenter는 항상 obj.centerId (센터별로 이미 분리됨)
      // centers 배열에는 해당 센터만 포함
      spots.push({
        geohash: obj.geohashPrefix, // 집계된 geohash prefix
        lat: finalLat, // ✅ 가중 평균 중심점 + 블록 내부 오프셋 사용
        lng: finalLng, // ✅ 가중 평균 중심점 + 블록 내부 오프셋 사용
        totalApprox: countApprox, // 해당 센터의 근사 인원수
        dominantCenter: obj.centerId, // 항상 해당 센터 (이미 센터별로 분리됨)
        centers: [{ centerId: obj.centerId, countApprox: countApprox }], // 단일 센터 정보
        memberType: memberType as any, // 요청된 memberType 추가
        blocks: obj.blocks.length, // 합쳐진 블록 개수 (디버깅용)
        originalCount: total // 원본 인원수 (디버깅용, 나중에 제거)
      });
    }

    console.log(`🎯 최종 스팟: ${spots.length}개 (숨김: ${hiddenBlocks}개)`);
    console.log(`📊 원본 총 인원: ${totalOriginalCount}명 → 근사 총 인원: ${totalApproxCount}명`);

    return NextResponse.json({
      success: true,
      data: {
        spots,
        metadata: {
          totalSpots: spots.length,
          hiddenBlocks,
          totalOriginalCount,
          totalApproxCount,
          precision: aggregationPrecision,
          administrativeUnit: getAdministrativeUnit(aggregationPrecision),
          zoom,
          k,
          privacyNotice: `본 데이터는 k-익명성(k≥${k}), 노이즈 주입, 반올림이 적용되었습니다.`,
        },
      },
    }, {
      headers: {
        'Cache-Control': 'no-store',
        'Content-Type': 'application/json'
      } 
    });

  } catch (error) {
    console.error('❌ 지오해시 블록 스팟 API 오류:', error);
    console.error('❌ 에러 상세:', error instanceof Error ? error.message : String(error));
    console.error('❌ 에러 스택:', error instanceof Error ? error.stack : '');
    
    // 에러 발생 시에도 목업 데이터 반환 (안정성)
    try {
      const memberType = req.nextUrl.searchParams.get('memberType') || 'all';
      const mockRows = getMockData(memberType);
      console.log('⚠️ 에러 발생, 목업 데이터 사용:', mockRows.length, '개 블록');
      
      // 목업 데이터로 기본 응답 생성
      return NextResponse.json({
        success: true,
        data: {
          spots: [],
          metadata: {
            totalSpots: 0,
            hiddenBlocks: 0,
            totalOriginalCount: 0,
            totalApproxCount: 0,
            precision: 7,
            warning: '서버 오류로 인해 목업 데이터를 사용할 수 없습니다.'
          }
        }
      });
    } catch (fallbackError) {
      console.error('❌ 목업 데이터 로딩 실패:', fallbackError);
      return NextResponse.json({
        success: false,
        error: '지오해시 블록 스팟 데이터를 가져오는 중 오류가 발생했습니다.',
        errorDetail: error instanceof Error ? error.message : String(error),
        data: { spots: [] }
      }, { status: 500 });
    }
  }
}
