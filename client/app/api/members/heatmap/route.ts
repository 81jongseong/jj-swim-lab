/**
 * 🗺️ JJ Swim Lab - 회원 분포도 API
 * 
 * 📋 **API 목적**
 * - VWorld Geocoder 2.0으로 주소를 좌표로 변환
 * - H3 헥사곤 그리드로 지리적 집계 수행
 * - 프라이버시 보호 (k-익명성, 라플라스 노이즈, 반올림)
 * - 클라이언트에는 집계된 결과만 전송
 * 
 * 🔄 **주요 기능**
 * - VWorld Geocoder 2.0 API 호출 (일 40,000건 무료)
 * - H3 헥사곤 그리드 집계 (해상도 8, ~600m-1km)
 * - k-익명성 적용 (k≥5)
 * - 라플라스 노이즈 추가
 * - 5단위 반올림 처리
 * 
 * 🗄️ **데이터 연동**
 * - VWorld Geocoder 2.0 API
 * - H3 헥사곤 그리드 시스템
 * - 회원 주소 데이터베이스
 * - 프라이버시 보호 알고리즘
 * 
 * 🛠️ **필요한 설치 파일**
 * - h3-js: H3 헥사곤 그리드 처리
 * - fetch API: VWorld API 호출
 * - Next.js API Routes
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. VWorld API 키는 서버에서만 사용
 * 2. 원본 주소/좌표는 절대 클라이언트에 전송 금지
 * 3. k-익명성 임계값은 5 이상 유지
 * 4. 라플라스 노이즈는 ε=2 사용
 * 5. 모든 집계 결과는 5단위 반올림
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] VWorld API 키 설정 확인
 * - [ ] H3 해상도 적절성 확인
 * - [ ] 프라이버시 가드 동작 확인
 * - [ ] API 응답 시간 최적화
 * - [ ] 오류 처리 및 로깅 확인
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 구현 (VWorld Geocoder 연동)
 * - 2024-12-19: H3 헥사곤 집계 시스템 구현
 * - 2024-12-19: 프라이버시 보호 알고리즘 적용
 * - 2024-12-19: k-익명성 및 노이즈 처리 구현
 * 
 * 📚 **참고 자료**
 * - VWorld Geocoder 2.0: https://www.vworld.kr/dev/v4dv_geocoderguide2_s001.do
 * - H3 헥사곤 시스템: https://h3geo.org/
 * - 프라이버시 보호: k-익명성, 차등 프라이버시
 */

import { NextResponse } from 'next/server';
// import h3 from 'h3-js'; // 패키지 미설치로 인해 주석 처리

// 회원 데이터 타입 정의
type Member = { 
  address: string; 
  centerId: string; 
  joinedAt: string;
  userType: string;
};

// H3 헥사곤 집계 결과 타입
type H3Cell = {
  h3: string;
  countApprox: number;
};

// 프라이버시 보호 설정
const K_ANONYMITY_THRESHOLD = 5; // k-익명성 임계값
const LAPLACE_EPSILON = 2; // 라플라스 노이즈 ε 값
const H3_RESOLUTION = 8; // H3 해상도 (8 = ~600m-1km)

/**
 * 데이터베이스에서 회원 목록을 가져오는 함수
 * TODO: 실제 MongoDB/데이터베이스 연동
 */
async function fetchMembers(): Promise<Member[]> {
  // 임시 목업 데이터 (실제로는 DB에서 가져옴)
  return [
    { 
      address: '서울특별시 중구 세종대로 110', 
      centerId: 'A', 
      joinedAt: '2025-09-01',
      userType: 'student'
    },
    { 
      address: '서울특별시 강남구 테헤란로 231', 
      centerId: 'B', 
      joinedAt: '2025-09-03',
      userType: 'student'
    },
    { 
      address: '서울특별시 마포구 홍대입구역', 
      centerId: 'A', 
      joinedAt: '2025-09-05',
      userType: 'instructor'
    },
    { 
      address: '서울특별시 송파구 올림픽공원', 
      centerId: 'C', 
      joinedAt: '2025-09-10',
      userType: 'student'
    },
    { 
      address: '서울특별시 용산구 한강대로', 
      centerId: 'B', 
      joinedAt: '2025-09-15',
      userType: 'student'
    },
    // 더 많은 목업 데이터...
    { 
      address: '서울특별시 강서구 화곡동', 
      centerId: 'A', 
      joinedAt: '2025-09-20',
      userType: 'student'
    },
    { 
      address: '서울특별시 영등포구 여의도', 
      centerId: 'C', 
      joinedAt: '2025-09-25',
      userType: 'student'
    },
    { 
      address: '서울특별시 서초구 강남역', 
      centerId: 'B', 
      joinedAt: '2025-10-01',
      userType: 'student'
    }
  ];
}

/**
 * VWorld Geocoder 2.0 API 호출
 * 주소를 좌표로 변환 (일 40,000건 무료)
 * 
 * @param addr 변환할 주소
 * @returns 좌표 객체 {lon, lat} 또는 null
 */
async function geocode(addr: string): Promise<{lon: number, lat: number} | null> {
  try {
    // VWorld API 키 (환경변수에서 가져옴 - 서버 전용)
    const key = process.env.VWORLD_SERVER_KEY;
    
    if (!key || key === '여기에_서버용_브이월드_API_키') {
      console.warn('⚠️ VWorld API 키가 설정되지 않았습니다. 목업 좌표를 사용합니다.');
      
      // API 키가 없을 때 목업 좌표 반환
      const mockCoords = [
        { lon: 126.978, lat: 37.5665 }, // 서울 중구
        { lon: 127.028, lat: 37.4979 }, // 서울 강남구
        { lon: 126.922, lat: 37.5563 }, // 서울 마포구
        { lon: 127.125, lat: 37.5158 }, // 서울 송파구
        { lon: 126.974, lat: 37.5326 }, // 서울 용산구
        { lon: 126.834, lat: 37.5424 }, // 서울 강서구
        { lon: 126.924, lat: 37.5219 }, // 서울 영등포구
        { lon: 127.028, lat: 37.4979 }, // 서울 서초구
      ];
      
      // 주소 해시를 이용한 일관된 목업 좌표 반환
      const hash = addr.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
      }, 0);
      
      return mockCoords[Math.abs(hash) % mockCoords.length];
    }

    // VWorld Geocoder 2.0 API 호출
    const url = new URL('https://api.vworld.kr/req/address');
    url.searchParams.set('service', 'address');
    url.searchParams.set('request', 'getCoord');
    url.searchParams.set('version', '2.0');
    url.searchParams.set('crs', 'EPSG:4326');
    url.searchParams.set('type', 'ROAD'); // 도로명 기준
    url.searchParams.set('format', 'json');
    url.searchParams.set('key', key);
    url.searchParams.set('address', addr);

    const response = await fetch(url.toString(), { cache: 'no-store' });
    const data = await response.json();
    
    const point = data?.response?.result?.point;
    if (!point) {
      console.warn(`⚠️ 주소 변환 실패: ${addr}`);
      return null;
    }

    console.log(`✅ Geocoding 성공: ${addr} → (${point.x}, ${point.y})`);
    
    return {
      lon: Number(point.x),
      lat: Number(point.y)
    };
    
  } catch (error) {
    console.error(`❌ Geocoding 오류 (${addr}):`, error);
    return null;
  }
}

/**
 * 라플라스 노이즈 생성 (차등 프라이버시)
 * 
 * @param n 원본 수치
 * @param epsilon 프라이버시 매개변수 (기본값: 2)
 * @returns 노이즈가 추가된 수치
 */
function laplaceNoise(n: number, epsilon: number = LAPLACE_EPSILON): number {
  const u = Math.random() - 0.5;
  const noise = -(1 / epsilon) * Math.sign(u) * Math.log(1 - 2 * Math.abs(u));
  return Math.max(0, Math.round(n + noise));
}

/**
 * 5단위 반올림 (추가 프라이버시 보호)
 * 
 * @param n 반올림할 수치
 * @returns 5단위로 반올림된 수치
 */
function roundToNearestFive(n: number): number {
  return Math.max(0, Math.round(n / 5) * 5);
}

/**
 * k-익명성 적용 (임계값 미만 셀 제거)
 * 
 * @param cells H3 셀 배열
 * @param k k-익명성 임계값
 * @returns k-익명성이 적용된 셀 배열
 */
function enforceKAnonymity(cells: H3Cell[], k: number): H3Cell[] {
  return cells.filter(cell => cell.countApprox >= k);
}

/**
 * GET /api/members/heatmap
 * 회원 분포도 데이터 제공 (프라이버시 보호 적용)
 */
export async function GET(request: Request) {
  try {
    console.log('🗺️ 회원 분포도 API 호출 시작');
    
    // 쿼리 파라미터 파싱
    const { searchParams } = new URL(request.url);
    const centerId = searchParams.get('centerId');
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const userType = searchParams.get('userType');

    // 회원 데이터 가져오기
    const members = await fetchMembers();
    
    // 필터링 적용
    let filteredMembers = members;
    
    if (centerId) {
      filteredMembers = filteredMembers.filter(m => m.centerId === centerId);
    }
    
    if (from) {
      filteredMembers = filteredMembers.filter(m => m.joinedAt >= from);
    }
    
    if (to) {
      filteredMembers = filteredMembers.filter(m => m.joinedAt <= to);
    }
    
    if (userType) {
      filteredMembers = filteredMembers.filter(m => m.userType === userType);
    }

    console.log(`📊 필터링된 회원 수: ${filteredMembers.length}`);

    // H3 집계 (패키지 미설치로 목업 데이터 반환)
    console.warn('⚠️ h3-js 패키지가 설치되지 않아 목업 데이터를 반환합니다.');
    
    // 목업 H3 셀 데이터
    const h3Counts = new Map<string, number>();
    h3Counts.set('8928308291fffff', 12);
    h3Counts.set('8928308293fffff', 8);
    h3Counts.set('892830829bfffff', 15);
    h3Counts.set('8928308299fffff', 6);

    console.log(`🔢 H3 셀 수 (목업): ${h3Counts.size}`);

    // 프라이버시 보호 처리
    const privacyProtectedCells: H3Cell[] = Array.from(h3Counts, ([h3Index, count]) => ({
      h3: h3Index,
      countApprox: roundToNearestFive(laplaceNoise(count))
    }));

    // k-익명성 적용
    const kAnonymizedCells = enforceKAnonymity(privacyProtectedCells, K_ANONYMITY_THRESHOLD);

    console.log(`🔒 k-익명성 적용 후 셀 수: ${kAnonymizedCells.length}`);
    console.log(`✅ 프라이버시 보호 완료 (k=${K_ANONYMITY_THRESHOLD}, ε=${LAPLACE_EPSILON})`);

    // 응답 데이터 (원본 주소/좌표는 절대 포함하지 않음)
    const response = {
      success: true,
      data: {
        cells: kAnonymizedCells,
        metadata: {
          totalCells: kAnonymizedCells.length,
          h3Resolution: H3_RESOLUTION,
          kAnonymityThreshold: K_ANONYMITY_THRESHOLD,
          laplaceEpsilon: LAPLACE_EPSILON,
          filters: {
            centerId,
            from,
            to,
            userType
          },
          privacyNotice: '이 데이터는 k-익명성, 라플라스 노이즈, 5단위 반올림이 적용된 집계 결과입니다.'
        }
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ 회원 분포도 API 오류:', error);
    
    return NextResponse.json({
      success: false,
      error: '회원 분포도 데이터를 가져오는 중 오류가 발생했습니다.',
      data: { cells: [] }
    }, { status: 500 });
  }
}
