/**
 * 📉 JJ Swim Lab - 하락 판단 정책 시스템
 * 
 * 📋 **목적**
 * - 최근 3개월 추세(slope)와 전월 대비 증감률(MoM%)을 결합한 유연한 하락 판단
 * - AND/OR 로직으로 정책 유연성 제공
 * - 센터별 성과 기반 자동 비공개 처리
 * 
 * 🔄 **주요 기능**
 * - 추세 기울기 계산 (최근 N개월 선형 회귀)
 * - 전월 대비 증감률 계산 (MoM%)
 * - AND/OR 로직 결합
 * - 정책 설정 관리
 * 
 * 🗄️ **데이터 연동**
 * - 월별 매출 데이터 (center_revenue_monthly)
 * - 정책 설정 테이블 (visibility_policy)
 * - 센터별 성과 지표
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 추세 계산은 최소 3개월 데이터 필요
 * 2. MoM%는 전월 데이터가 없으면 null 처리
 * 3. 정책 변경 시 기존 데이터 재계산 필요
 * 4. 감사 로그 필수
 */

// 정책 설정 타입
export interface DeclinePolicy {
  id?: number;
  hideDeclining: boolean;           // 하락 비공개 켜기/끄기
  trendMonths: number;              // 추세 계산 개월 (기본 3)
  trendSlopeThreshold: number;      // 추세 기울기 임계치 (기본 0)
  momThresholdPct: number;          // 전월 대비 % 임계치 (기본 -5%)
  logic: 'OR' | 'AND';              // 판정 로직
  kMin: number;                     // k-익명 임계치
  noiseEpsilon: number;             // 라플라스 노이즈 ε
  roundingUnit: number;             // 반올림 단위
  updatedAt?: Date;
}

// 센터별 성과 지표
export interface CenterMetrics {
  centerId: string;
  trendSlope: number | null;        // A: 최근 N개월 추세 기울기
  momPct: number | null;            // B: 전월 대비 증감률 (%)
  lastRevenue: number | null;       // 최신 월 매출
  prevRevenue: number | null;       // 전월 매출
  dataPoints: number;               // 추세 계산에 사용된 데이터 포인트 수
}

// 월별 매출 데이터
export interface MonthlyRevenue {
  centerId: string;
  yearMonth: string;                // YYYY-MM 형식
  revenue: number;
  date: Date;
}

// 하락 판단 결과
export interface DeclineResult {
  isDeclining: boolean;
  reason: string;
  trendSlope: number | null;
  momPct: number | null;
  policy: DeclinePolicy;
}

/**
 * 기본 하락 판단 정책
 */
export const DEFAULT_DECLINE_POLICY: DeclinePolicy = {
  hideDeclining: true,
  trendMonths: 3,
  trendSlopeThreshold: 0,
  momThresholdPct: -5,
  logic: 'OR',
  kMin: 5,
  noiseEpsilon: 2,
  roundingUnit: 5
};

/**
 * 선형 회귀 기울기 계산 (최근 N개월)
 */
export function calculateTrendSlope(
  revenues: number[],
  months: number = 3
): number | null {
  if (revenues.length < 2) return null;
  
  const n = Math.min(revenues.length, months);
  const recentRevenues = revenues.slice(-n);
  
  if (recentRevenues.length < 2) return null;
  
  // x: 1..n, y: revenue
  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
  
  for (let i = 0; i < recentRevenues.length; i++) {
    const x = i + 1;
    const y = recentRevenues[i];
    
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumXX += x * x;
  }
  
  const nPoints = recentRevenues.length;
  const slope = (nPoints * sumXY - sumX * sumY) / (nPoints * sumXX - sumX * sumX);
  
  return isNaN(slope) ? null : slope;
}

/**
 * 전월 대비 증감률 계산 (MoM%)
 */
export function calculateMoMPercentage(
  currentRevenue: number,
  previousRevenue: number | null
): number | null {
  if (previousRevenue === null || previousRevenue === 0) return null;
  
  return ((currentRevenue - previousRevenue) / previousRevenue) * 100;
}

/**
 * 센터별 성과 지표 계산
 */
export function calculateCenterMetrics(
  centerId: string,
  monthlyRevenues: MonthlyRevenue[],
  policy: DeclinePolicy
): CenterMetrics {
  // 해당 센터의 매출 데이터만 필터링
  const centerRevenues = monthlyRevenues
    .filter(r => r.centerId === centerId)
    .sort((a, b) => a.date.getTime() - b.date.getTime());
  
  if (centerRevenues.length === 0) {
    return {
      centerId,
      trendSlope: null,
      momPct: null,
      lastRevenue: null,
      prevRevenue: null,
      dataPoints: 0
    };
  }
  
  // 최신 월과 전월 데이터
  const lastRevenue = centerRevenues[centerRevenues.length - 1];
  const prevRevenue = centerRevenues.length > 1 ? centerRevenues[centerRevenues.length - 2] : null;
  
  // 추세 기울기 계산
  const revenues = centerRevenues.map(r => r.revenue);
  const trendSlope = calculateTrendSlope(revenues, policy.trendMonths);
  
  // MoM% 계산
  const momPct = calculateMoMPercentage(
    lastRevenue.revenue,
    prevRevenue?.revenue || null
  );
  
  return {
    centerId,
    trendSlope,
    momPct,
    lastRevenue: lastRevenue.revenue,
    prevRevenue: prevRevenue?.revenue || null,
    dataPoints: centerRevenues.length
  };
}

/**
 * 하락 센터 판단 (AND/OR 로직)
 */
export function isDecliningCenter(
  metrics: CenterMetrics,
  policy: DeclinePolicy
): DeclineResult {
  if (!policy.hideDeclining) {
    return {
      isDeclining: false,
      reason: 'policy_disabled',
      trendSlope: metrics.trendSlope,
      momPct: metrics.momPct,
      policy
    };
  }
  
  // A: 추세 기울기 기준
  const trendDeclining = (metrics.trendSlope ?? 0) < policy.trendSlopeThreshold;
  
  // B: MoM% 기준
  const momDeclining = (metrics.momPct ?? 0) <= policy.momThresholdPct;
  
  // AND/OR 로직 적용
  let isDeclining: boolean;
  let reason: string;
  
  if (policy.logic === 'AND') {
    isDeclining = trendDeclining && momDeclining;
    reason = isDeclining ? 'both_criteria_met' : 'not_both_criteria';
  } else { // OR
    isDeclining = trendDeclining || momDeclining;
    reason = isDeclining ? 'either_criteria_met' : 'neither_criteria';
  }
  
  return {
    isDeclining,
    reason,
    trendSlope: metrics.trendSlope,
    momPct: metrics.momPct,
    policy
  };
}

/**
 * 모든 센터의 성과 지표 계산
 */
export function calculateAllCenterMetrics(
  monthlyRevenues: MonthlyRevenue[],
  policy: DeclinePolicy
): Map<string, CenterMetrics> {
  const centerIds = [...new Set(monthlyRevenues.map(r => r.centerId))];
  const metricsMap = new Map<string, CenterMetrics>();
  
  for (const centerId of centerIds) {
    const metrics = calculateCenterMetrics(centerId, monthlyRevenues, policy);
    metricsMap.set(centerId, metrics);
  }
  
  return metricsMap;
}

/**
 * 가시성 정책 적용 (하락 판단 포함)
 */
export function applyDeclineVisibilityPolicy(
  rows: any[],
  centerMetrics: Map<string, CenterMetrics>,
  policy: DeclinePolicy,
  userSession: any
): any[] {
  const result: any[] = [];
  const auditLog: Array<{
    centerId: string;
    decision: string;
    reason: string;
    trendSlope: number | null;
    momPct: number | null;
    timestamp: Date;
  }> = [];
  
  for (const row of rows) {
    // 피어 집계(centerId=null)는 통과
    if (!row.centerId) {
      result.push(row);
      continue;
    }
    
    // 내 센터는 항상 허용
    if (userSession.centers.includes(row.centerId)) {
      result.push(row);
      continue;
    }
    
    // HQ는 모든 센터 허용
    if (userSession.role === 'HQ') {
      result.push(row);
      continue;
    }
    
    // 타 센터: 하락 판단 적용
    const metrics = centerMetrics.get(row.centerId);
    if (!metrics) {
      // 데이터 없음: 기본적으로 허용
      result.push(row);
      continue;
    }
    
    const declineResult = isDecliningCenter(metrics, policy);
    
    // 감사 로그
    auditLog.push({
      centerId: row.centerId,
      decision: declineResult.isDeclining ? 'DENY' : 'ALLOW',
      reason: declineResult.reason,
      trendSlope: declineResult.trendSlope,
      momPct: declineResult.momPct,
      timestamp: new Date()
    });
    
    if (declineResult.isDeclining) {
      // 하락 센터: 익명화 처리
      result.push({
        ...row,
        centerId: null,
        label: '비공개(정책: 하락)',
        declineReason: declineResult.reason
      });
    } else {
      // 정상 센터: 허용
      result.push(row);
    }
  }
  
  // 감사 로그 출력
  if (auditLog.length > 0) {
    console.log('📊 하락 판단 정책 적용 결과:', auditLog);
  }
  
  return result;
}

/**
 * 정책 설정 검증
 */
export function validatePolicy(policy: Partial<DeclinePolicy>): string[] {
  const errors: string[] = [];
  
  if (policy.trendMonths !== undefined && policy.trendMonths < 2) {
    errors.push('추세 계산 개월은 최소 2개월 이상이어야 합니다.');
  }
  
  if (policy.momThresholdPct !== undefined && policy.momThresholdPct > 0) {
    errors.push('MoM% 임계치는 보통 음수여야 합니다.');
  }
  
  if (policy.kMin !== undefined && policy.kMin < 1) {
    errors.push('k-익명 임계치는 최소 1 이상이어야 합니다.');
  }
  
  if (policy.noiseEpsilon !== undefined && policy.noiseEpsilon <= 0) {
    errors.push('노이즈 ε은 0보다 커야 합니다.');
  }
  
  if (policy.roundingUnit !== undefined && policy.roundingUnit < 1) {
    errors.push('반올림 단위는 최소 1 이상이어야 합니다.');
  }
  
  return errors;
}

/**
 * 정책 설정 업데이트
 */
export function updatePolicy(
  currentPolicy: DeclinePolicy,
  updates: Partial<DeclinePolicy>
): DeclinePolicy {
  const updatedPolicy = { ...currentPolicy, ...updates };
  const errors = validatePolicy(updatedPolicy);
  
  if (errors.length > 0) {
    throw new Error(`정책 설정 오류: ${errors.join(', ')}`);
  }
  
  return {
    ...updatedPolicy,
    updatedAt: new Date()
  };
}

/**
 * 테스트 시나리오 생성
 */
export function createTestScenarios(): Array<{
  name: string;
  metrics: CenterMetrics;
  policy: DeclinePolicy;
  expected: boolean;
  description: string;
}> {
  return [
    {
      name: '센터 X: 추세 하락, MoM 소폭 하락',
      metrics: {
        centerId: '센터X',
        trendSlope: -10,
        momPct: -2,
        lastRevenue: 1000,
        prevRevenue: 1020,
        dataPoints: 3
      },
      policy: { ...DEFAULT_DECLINE_POLICY, logic: 'OR' },
      expected: true,
      description: 'OR 로직: 추세 하락(-10)이므로 비공개'
    },
    {
      name: '센터 Y: 추세 상승, MoM 큰 하락',
      metrics: {
        centerId: '센터Y',
        trendSlope: 5,
        momPct: -8,
        lastRevenue: 920,
        prevRevenue: 1000,
        dataPoints: 3
      },
      policy: { ...DEFAULT_DECLINE_POLICY, logic: 'OR' },
      expected: true,
      description: 'OR 로직: MoM 큰 하락(-8%)이므로 비공개'
    },
    {
      name: '센터 Z: 둘 다 하락',
      metrics: {
        centerId: '센터Z',
        trendSlope: -7,
        momPct: -9,
        lastRevenue: 910,
        prevRevenue: 1000,
        dataPoints: 3
      },
      policy: { ...DEFAULT_DECLINE_POLICY, logic: 'AND' },
      expected: true,
      description: 'AND 로직: 둘 다 하락이므로 비공개'
    },
    {
      name: '센터 A: 추세 하락, MoM 상승',
      metrics: {
        centerId: '센터A',
        trendSlope: -5,
        momPct: 3,
        lastRevenue: 1030,
        prevRevenue: 1000,
        dataPoints: 3
      },
      policy: { ...DEFAULT_DECLINE_POLICY, logic: 'AND' },
      expected: false,
      description: 'AND 로직: MoM 상승이므로 공개'
    }
  ];
}



