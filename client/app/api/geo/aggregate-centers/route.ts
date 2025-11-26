import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import * as h3 from 'h3-js';
import { 
  enforceVisibilityPolicy, 
  parseUserSession, 
  hasPermission,
  createAuditLog,
  type UserSession,
  type CenterData as PolicyCenterData
} from '../../../../lib/visibility-policy';
import { 
  calculateAllCenterMetrics,
  applyDeclineVisibilityPolicy,
  type DeclinePolicy,
  type CenterMetrics,
  type MonthlyRevenue,
  DEFAULT_DECLINE_POLICY
} from '../../../../lib/decline-policy';

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
  centerId: string | null; // null이면 익명화된 피어 집계
  totalApprox: number;
  dominantCenter: string;
  trend3m: number; // 최근 3개월 매출 추세
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
 * 목업 데이터 생성 (매출 추세 포함)
 * TODO: 실제 DB에서 가져오기
 */
function generateMockData(): MemberRow[] {
  // 서울 주요 지역의 H3 인덱스 (해상도 8) - 올바른 좌표
  const seoulH3Cells = [
    '8830e1ca2bfffff', // 강남역 근처 (37.4999, 127.0311)
    '8830e1ca27fffff', // 홍대 근처 (37.4869, 127.0326)
    '8830e1cabbfffff', // 잠실 근처 (37.5123, 127.1023)
    '8830e1d957fffff', // 여의도 근처 (37.5212, 126.9243)
    '8830e1d80dfffff', // 신촌 근처 (37.5556, 126.9367)
    '8830e1cae1fffff', // 삼성동 근처 (37.5089, 127.0628)
    '8830e1cabbfffff', // 송파 근처 (37.5145, 127.1056)
    '8830e1d8e9fffff', // 서울역 근처 (37.5547, 126.9706)
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
 * 센터별 매출 추세 목업 데이터 (하락 판단 정책용)
 * TODO: 실제 DB에서 가져오기
 */
function getCenterTrends(): Record<string, number> {
  return {
    '강남센터': 0.15,  // 상승
    '홍대센터': -0.08, // 하락 (비공개 대상)
    '송파센터': 0.05,  // 소폭 상승
    '마포센터': -0.12, // 하락 (비공개 대상)
  };
}

/**
 * 월별 매출 데이터 목업 생성 (하락 판단 정책용)
 * TODO: 실제 DB에서 가져오기
 */
function generateMonthlyRevenueData(): MonthlyRevenue[] {
  const centers = ['강남센터', '홍대센터', '송파센터', '마포센터'];
  const monthlyData: MonthlyRevenue[] = [];
  
  // 최근 6개월 데이터 생성
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    centers.forEach(centerId => {
      // 각 센터별로 다른 추세 패턴 적용
      let baseRevenue = 1000;
      let trendFactor = 1;
      
      switch (centerId) {
        case '강남센터':
          trendFactor = 1 + (5 - i) * 0.03; // 상승 추세
          break;
        case '홍대센터':
          trendFactor = 1 - (5 - i) * 0.02; // 하락 추세
          break;
        case '송파센터':
          trendFactor = 1 + (5 - i) * 0.01; // 소폭 상승
          break;
        case '마포센터':
          trendFactor = 1 - (5 - i) * 0.025; // 큰 하락 추세
          break;
      }
      
      const revenue = Math.round(baseRevenue * trendFactor * (0.9 + Math.random() * 0.2));
      
      monthlyData.push({
        centerId,
        yearMonth,
        revenue,
        date: new Date(date)
      });
    });
  }
  
  return monthlyData;
}

/**
 * 하락 판단 정책 설정 가져오기
 * TODO: 실제 DB에서 가져오기
 */
function getDeclinePolicy(): DeclinePolicy {
  return {
    ...DEFAULT_DECLINE_POLICY,
    hideDeclining: false, // 테스트용: 하락 비공개 비활성화
    trendMonths: 3,
    trendSlopeThreshold: 0,
    momThresholdPct: -5,
    logic: 'OR' // OR: 둘 중 하나라도 하락이면 비공개
  };
}

/**
 * GET /api/geo/aggregate-centers
 * 센터별 회원 분포 집계 데이터 제공
 */
export async function GET(request: NextRequest) {
  try {
    logger.info('🗺️ 센터별 집계 API 호출 시작');

    // JWT 세션 파싱 (목업)
    // TODO: 실제 JWT 토큰에서 추출
    const mockSession: UserSession = {
      userId: 'user_123',
      role: 'CenterAdmin', // 테스트용: CenterAdmin
      centers: ['강남센터'], // 테스트용: 강남센터만 접근 가능
      org: 'JJ_SWIM_LAB',
      scopes: ['heatmap:view', 'export:agg', 'center:read:own']
    };

    // 권한 검증
    if (!hasPermission(mockSession, 'heatmap:view')) {
      return NextResponse.json({
        success: false,
        error: '지도 열람 권한이 없습니다.',
        data: { cells: [] }
      }, { status: 403 });
    }

    // 쿼리 파라미터 파싱
    const { searchParams } = new URL(request.url);
    const centerId = searchParams.get('centerId');
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    // 1) DB에서 데이터 가져오기 (현재는 목업 사용)
    // TODO: 실제 DB 쿼리로 교체
    let rows = generateMockData();
    const centerTrends = getCenterTrends();
    const monthlyRevenueData = generateMonthlyRevenueData();
    const declinePolicy = getDeclinePolicy();

    // 필터 적용
    if (centerId) {
      rows = rows.filter(row => row.centerId === centerId);
    }

    logger.info(`📊 원본 데이터: ${rows.length}개 행`);

    // 2) H3 셀별로 그룹화
    const byH3 = new Map<string, MemberRow[]>();
    for (const row of rows) {
      if (!byH3.has(row.h3)) {
        byH3.set(row.h3, []);
      }
      byH3.get(row.h3)!.push(row);
    }

    logger.info(`🔢 H3 셀 수: ${byH3.size}`);

    // 3) k-익명성 & 노이즈/반올림 적용
    const cells: AggregatedCell[] = [];

    for (const [h3Cell, cellRows] of byH3) {
      // 셀 전체 회원 수 계산
      const totalCount = cellRows.reduce((sum, row) => sum + row.count, 0);

      // k-익명성: 전체 회원이 k명 미만이면 셀 자체를 숨김
      if (totalCount < K_ANONYMITY_THRESHOLD) {
        logger.info(`🔒 셀 ${h3Cell} 숨김 (총 ${totalCount}명 < ${K_ANONYMITY_THRESHOLD})`);
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

      // 센터별 추세 계산 (지배 센터 기준)
      const dominantTrend = centerTrends[dominantCenter] || 0;

      cells.push({
        h3: h3Cell,
        centerId: dominantCenter, // 지배 센터 ID
        totalApprox,
        dominantCenter,
        trend3m: dominantTrend,
        centers: centersWithNoise.sort((a, b) => b.countApprox - a.countApprox) // 내림차순 정렬
      });
    }

    logger.info(`✅ 프라이버시 보호 완료: ${cells.length}개 셀`);
    logger.info(`🔒 k-익명성(k=${K_ANONYMITY_THRESHOLD}), 노이즈(ε=${LAPLACE_EPSILON}), 반올림(${ROUND_UNIT}단위)`);

    // 4) 하락 판단 정책 적용
    logger.info('📉 하락 판단 정책 적용 시작');
    
    // 센터별 성과 지표 계산
    const centerMetrics = calculateAllCenterMetrics(monthlyRevenueData, declinePolicy);
    logger.info('📊 센터별 성과 지표 계산 완료:', centerMetrics.size, '개 센터');
    
    // 하락 판단 정책 적용
    const policyAppliedCells = applyDeclineVisibilityPolicy(cells, centerMetrics, declinePolicy, mockSession);
    logger.info(`✅ 하락 판단 정책 적용 완료: ${policyAppliedCells.length}개 셀`);

    // 감사 로그 생성
    const auditLog = createAuditLog('geo_aggregate_view', mockSession, {
      originalCells: cells.length,
      policyAppliedCells: policyAppliedCells.length,
      centerMetrics: Array.from(centerMetrics.entries()).map(([id, metrics]) => ({
        centerId: id,
        trendSlope: metrics.trendSlope,
        momPct: metrics.momPct,
        dataPoints: metrics.dataPoints
      })),
      declinePolicy,
      filters: { centerId, from, to }
    });
    logger.info('📋 감사 로그:', auditLog);

    // 응답 데이터
    const response = {
      success: true,
      data: {
        cells: policyAppliedCells,
        metadata: {
          totalCells: policyAppliedCells.length,
          originalCells: cells.length,
          h3Resolution: H3_RESOLUTION,
          kAnonymityThreshold: K_ANONYMITY_THRESHOLD,
          laplaceEpsilon: LAPLACE_EPSILON,
          roundUnit: ROUND_UNIT,
          userRole: mockSession.role,
          userCenters: mockSession.centers,
          declinePolicy,
          centerMetrics: Array.from(centerMetrics.entries()).map(([id, metrics]) => ({
            centerId: id,
            trendSlope: metrics.trendSlope,
            momPct: metrics.momPct,
            dataPoints: metrics.dataPoints
          })),
          filters: {
            centerId,
            from,
            to
          },
          privacyNotice: '이 데이터는 k-익명성, 라플라스 노이즈, 5단위 반올림이 적용된 집계 결과입니다.',
          visibilityPolicy: '하락 판단 정책이 적용되어 일부 센터는 익명화되었습니다.'
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
    logger.error('❌ 센터별 집계 API 오류:', error);

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
    logger.error('❌ 센터 목록 API 오류:', error);

    return NextResponse.json({
      success: false,
      error: '센터 목록을 가져오는 중 오류가 발생했습니다.',
      data: { centers: [] }
    }, { status: 500 });
  }
}
