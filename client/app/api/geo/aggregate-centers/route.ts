/**
 * 🗺️ JJ Swim Lab - 센터별 회원 분포 집계 API
 * 
 * 📋 **API 목적**
 * - 센터별 회원 분포를 H3 헥사곤으로 집계
 * - 지배 센터(Dominant Center) 계산
 * - 프라이버시 보호 (k-익명성, 라플라스 노이즈, 반올림)
 * 
 * 🔄 **주요 기능**
 * - H3 셀별 센터 집계
 * - k-익명성 적용 (k≥5)
 * - 작은 센터는 "기타"로 묶음
 * - 라플라스 노이즈 + 5단위 반올림
 * - 지배 센터 계산 (가장 회원이 많은 센터)
 * 
 * 🗄️ **데이터 연동**
 * - VWorld Geocoder 2.0 API
 * - H3 헥사곤 그리드 시스템
 * - 회원 데이터베이스
 * - 센터 정보
 * 
 * 🛠️ **필요한 설치 파일**
 * - h3-js: H3 헥사곤 그리드 처리
 * - Next.js API Routes
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. k-익명성 임계값은 5 이상 유지
 * 2. 원본 주소/좌표는 절대 클라이언트에 전송 금지
 * 3. 센터별 작은 값은 "기타"로 묶음
 * 4. 지배 센터는 가장 많은 회원을 가진 센터
 * 5. 모든 집계 결과는 5단위 반올림
 */

import { NextRequest, NextResponse } from 'next/server';
import h3 from 'h3-js';

// 🔒 프라이버시 파라미터
const K_ANONYMITY_THRESHOLD = 5; // k-익명 임계치
const LAPLACE_EPSILON = 2;       // 라플라스 노이즈 ε (값↓ = 노이즈↑)
const ROUND_UNIT = 5;            // 5단위 반올림
const H3_RESOLUTION = 8;         // H3 해상도 (8 = ~600m-1km)

// 타입 정의
type MemberRow = {
  h3: string;
  centerId: string;
  count: number;
};

type CenterData = {
  centerId: string;
  countApprox: number;
};

type AggregatedCell = {
  h3: string;
  totalApprox: number;
  dominantCenter: string;
  centers: CenterData[];
};

/**
 * 라플라스 노이즈 생성
 */
function laplaceNoise(n: number, epsilon: number = LAPLACE_EPSILON): number {
  const u = Math.random() - 0.5;
  const noise = (u < 0 ? -1 : 1) * (Math.log(1 - 2 * Math.abs(u)) / -epsilon);
  return n + noise;
}

/**
 * 5단위 반올림
 */
function roundToNearestFive(n: number): number {
  return Math.max(0, Math.round(n / ROUND_UNIT) * ROUND_UNIT);
}

/**
 * 목업 데이터 생성
 * TODO: 실제 DB에서 가져오기
 */
function generateMockData(): MemberRow[] {
  // 서울 주요 지역의 H3 인덱스 (해상도 8)
  const seoulH3Cells = [
    '8928308291fffff', // 강남역 근처
    '8928308293fffff', // 홍대 근처
    '892830829bfffff', // 잠실 근처
    '8928308299fffff', // 여의도 근처
    '892830828bfffff', // 신촌 근처
    '8928308295fffff', // 삼성동 근처
    '892830829dfffff', // 송파 근처
    '8928308289fffff', // 서울역 근처
  ];

  const centers = ['강남센터', '홍대센터', '송파센터', '마포센터'];
  const mockData: MemberRow[] = [];

  // 각 H3 셀에 대해 랜덤 센터별 회원 수 생성
  seoulH3Cells.forEach((h3Cell, index) => {
    centers.forEach((centerId, centerIndex) => {
      // 특정 센터가 특정 지역에서 우세하도록 설정
      const baseCount = (index % centers.length === centerIndex) ? 
        Math.floor(Math.random() * 20) + 10 : // 우세 센터: 10-30명
        Math.floor(Math.random() * 8) + 2;    // 기타 센터: 2-10명

      if (baseCount > 0) {
        mockData.push({
          h3: h3Cell,
          centerId: centerId,
          count: baseCount
        });
      }
    });
  });

  return mockData;
}

/**
 * GET /api/geo/aggregate-centers
 * 센터별 회원 분포 집계 데이터 제공
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🗺️ 센터별 집계 API 호출 시작');

    // 쿼리 파라미터 파싱
    const { searchParams } = new URL(request.url);
    const centerId = searchParams.get('centerId');
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    // 1) DB에서 데이터 가져오기 (현재는 목업 사용)
    // TODO: 실제 DB 쿼리로 교체
    let rows = generateMockData();

    // 필터 적용
    if (centerId) {
      rows = rows.filter(row => row.centerId === centerId);
    }

    console.log(`📊 원본 데이터: ${rows.length}개 행`);

    // 2) H3 셀별로 그룹화
    const byH3 = new Map<string, MemberRow[]>();
    for (const row of rows) {
      if (!byH3.has(row.h3)) {
        byH3.set(row.h3, []);
      }
      byH3.get(row.h3)!.push(row);
    }

    console.log(`🔢 H3 셀 수: ${byH3.size}`);

    // 3) k-익명성 & 노이즈/반올림 적용
    const cells: AggregatedCell[] = [];

    for (const [h3Cell, cellRows] of byH3) {
      // 셀 전체 회원 수 계산
      const totalCount = cellRows.reduce((sum, row) => sum + row.count, 0);

      // k-익명성: 전체 회원이 k명 미만이면 셀 자체를 숨김
      if (totalCount < K_ANONYMITY_THRESHOLD) {
        console.log(`🔒 셀 ${h3Cell} 숨김 (총 ${totalCount}명 < ${K_ANONYMITY_THRESHOLD})`);
        continue;
      }

      // 센터별로 분리
      const majorCenters: MemberRow[] = [];
      let othersCount = 0;

      for (const row of cellRows) {
        if (row.count < K_ANONYMITY_THRESHOLD) {
          // k명 미만인 센터는 "기타"로 묶음
          othersCount += row.count;
        } else {
          majorCenters.push(row);
        }
      }

      // "기타" 센터 추가
      if (othersCount > 0) {
        majorCenters.push({
          h3: h3Cell,
          centerId: '기타',
          count: othersCount
        });
      }

      // 노이즈 + 반올림 적용
      const centersWithNoise: CenterData[] = majorCenters
        .map(row => ({
          centerId: row.centerId,
          countApprox: roundToNearestFive(
            Math.max(0, laplaceNoise(row.count, LAPLACE_EPSILON))
          )
        }))
        .filter(center => center.countApprox > 0); // 0이 된 센터는 제거

      // 센터가 하나도 없으면 스킵
      if (centersWithNoise.length === 0) continue;

      // 지배 센터 계산 (가장 회원이 많은 센터)
      const dominantCenter = centersWithNoise.reduce((prev, current) => 
        (current.countApprox >= prev.countApprox) ? current : prev
      ).centerId;

      // 총 회원 수 계산 (노이즈 적용 후)
      const totalApprox = centersWithNoise.reduce(
        (sum, center) => sum + center.countApprox, 
        0
      );

      cells.push({
        h3: h3Cell,
        totalApprox,
        dominantCenter,
        centers: centersWithNoise.sort((a, b) => b.countApprox - a.countApprox) // 내림차순 정렬
      });
    }

    console.log(`✅ 프라이버시 보호 완료: ${cells.length}개 셀`);
    console.log(`🔒 k-익명성(k=${K_ANONYMITY_THRESHOLD}), 노이즈(ε=${LAPLACE_EPSILON}), 반올림(${ROUND_UNIT}단위)`);

    // 응답 데이터
    const response = {
      success: true,
      data: {
        cells,
        metadata: {
          totalCells: cells.length,
          h3Resolution: H3_RESOLUTION,
          kAnonymityThreshold: K_ANONYMITY_THRESHOLD,
          laplaceEpsilon: LAPLACE_EPSILON,
          roundUnit: ROUND_UNIT,
          filters: {
            centerId,
            from,
            to
          },
          privacyNotice: '이 데이터는 k-익명성, 라플라스 노이즈, 5단위 반올림이 적용된 집계 결과입니다.'
        }
      }
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    console.error('❌ 센터별 집계 API 오류:', error);

    return NextResponse.json({
      success: false,
      error: '센터별 분포 데이터를 가져오는 중 오류가 발생했습니다.',
      data: { cells: [] }
    }, { status: 500 });
  }
}

/**
 * GET /api/geo/aggregate-centers/centers
 * 센터 목록 제공
 */
export async function POST(request: NextRequest) {
  try {
    // TODO: 실제 DB에서 센터 목록 가져오기
    const centers = [
      { id: '강남센터', name: '강남센터', location: '서울 강남구' },
      { id: '홍대센터', name: '홍대센터', location: '서울 마포구' },
      { id: '송파센터', name: '송파센터', location: '서울 송파구' },
      { id: '마포센터', name: '마포센터', location: '서울 마포구' }
    ];

    return NextResponse.json({
      success: true,
      data: { centers }
    });

  } catch (error) {
    console.error('❌ 센터 목록 API 오류:', error);

    return NextResponse.json({
      success: false,
      error: '센터 목록을 가져오는 중 오류가 발생했습니다.',
      data: { centers: [] }
    }, { status: 500 });
  }
}
