/**
 * 🔒 JJ Swim Lab - 가시성 정책 시스템
 * 
 * 📋 **목적**
 * - 역할/센터/성과 조건 기반 데이터 열람 권한 제어
 * - 내 센터는 상세, 타 센터는 익명/집계만
 * - 매출 하락 센터는 자동 비공개
 * 
 * 🔄 **주요 기능**
 * - 역할 기반 권한 검증
 * - 센터별 가시성 정책 적용
 * - 성과 기반 자동 비공개
 * - 정책 로깅 및 감사
 * 
 * 🗄️ **데이터 연동**
 * - JWT 세션 정보
 * - 센터별 매출 추세 데이터
 * - 가시성 정책 설정
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 모든 정책 결정은 로깅 필수
 * 2. 기본값은 보수적으로 설정
 * 3. HQ는 모든 데이터 접근 가능
 * 4. 정책 변경 시 감사 추적
 */

// 역할 정의
export type UserRole = 'HQ' | 'Regional' | 'CenterAdmin' | 'Coach' | 'Analyst';

// 세션 정보
export interface UserSession {
  userId: string;
  role: UserRole;
  centers: string[]; // 사용자가 접근 가능한 센터 목록
  org: string;
  scopes: string[]; // 권한 스코프
}

// 가시성 정책 설정
export interface VisibilityPolicy {
  hideDeclining: boolean; // 하락 센터 비공개 여부
  months: number; // 추세 계산 기간 (개월)
  threshold: number; // 하락 임계치
  exceptions: string[]; // 예외 센터 목록
  minKAnonymity: number; // 최소 k-익명성
  noiseEpsilon: number; // 노이즈 강도
  roundingUnit: number; // 반올림 단위
}

// 센터 데이터
export interface CenterData {
  centerId: string;
  totalApprox: number;
  trend3m: number; // 최근 3개월 매출 추세
  centers: Array<{
    centerId: string;
    countApprox: number;
  }>;
}

// 정책 적용 결과
export interface PolicyResult {
  visible: boolean;
  reason: string;
  anonymized: boolean;
}

/**
 * 기본 가시성 정책 설정
 */
export const DEFAULT_VISIBILITY_POLICY: VisibilityPolicy = {
  hideDeclining: true,
  months: 3,
  threshold: 0,
  exceptions: [],
  minKAnonymity: 5,
  noiseEpsilon: 2,
  roundingUnit: 5
};

/**
 * 센터 가시성 검증
 */
export function canSeeCenter(
  centerId: string, 
  trend3m: number, 
  session: UserSession, 
  policy: VisibilityPolicy = DEFAULT_VISIBILITY_POLICY
): PolicyResult {
  // 1. 내 센터는 항상 허용
  if (session.centers.includes(centerId)) {
    return {
      visible: true,
      reason: 'own_center',
      anonymized: false
    };
  }

  // 2. HQ는 모든 센터 접근 가능
  if (session.role === 'HQ') {
    return {
      visible: true,
      reason: 'hq_access',
      anonymized: false
    };
  }

  // 3. 예외 센터는 허용
  if (policy.exceptions.includes(centerId)) {
    return {
      visible: true,
      reason: 'policy_exception',
      anonymized: false
    };
  }

  // 4. 하락 센터 비공개 정책
  if (policy.hideDeclining && trend3m < policy.threshold) {
    return {
      visible: false,
      reason: 'declining_center',
      anonymized: true
    };
  }

  // 5. 기본적으로 타 센터는 집계 수준만 허용
  return {
    visible: true,
    reason: 'peer_aggregate',
    anonymized: true
  };
}

/**
 * 가시성 정책 적용
 */
export function enforceVisibilityPolicy(
  rows: CenterData[],
  session: UserSession,
  policy: VisibilityPolicy = DEFAULT_VISIBILITY_POLICY
): CenterData[] {
  const result: CenterData[] = [];
  const policyLog: Array<{
    centerId: string;
    decision: string;
    reason: string;
    timestamp: Date;
  }> = [];

  for (const row of rows) {
    // 피어 집계(centerId=null)는 통과
    if (!row.centerId) {
      result.push(row);
      continue;
    }

    const policyResult = canSeeCenter(row.centerId, row.trend3m, session, policy);
    
    // 정책 로깅
    policyLog.push({
      centerId: row.centerId,
      decision: policyResult.visible ? 'ALLOW' : 'DENY',
      reason: policyResult.reason,
      timestamp: new Date()
    });

    if (policyResult.visible) {
      if (policyResult.anonymized) {
        // 익명화: centerId를 null로 변환하여 피어 집계로 흡수
        result.push({
          ...row,
          centerId: null,
          centers: row.centers.map(c => ({ ...c, centerId: 'anonymous' }))
        });
      } else {
        // 상세 표시 허용
        result.push(row);
      }
    } else {
      // 비공개: 완전 제외
      console.log(`🚫 센터 비공개: ${row.centerId} (${policyResult.reason})`);
    }
  }

  // 정책 로그 출력
  if (policyLog.length > 0) {
    console.log('📊 가시성 정책 적용 결과:', policyLog);
  }

  // 동일 h3, centerId=null 레코드 병합
  return mergeAnonymousRows(result);
}

/**
 * 익명화된 행 병합
 */
function mergeAnonymousRows(rows: CenterData[]): CenterData[] {
  const merged = new Map<string, CenterData>();

  for (const row of rows) {
    const key = row.h3 || 'global';
    
    if (merged.has(key)) {
      const existing = merged.get(key)!;
      existing.totalApprox += row.totalApprox;
      existing.centers.push(...row.centers);
    } else {
      merged.set(key, { ...row });
    }
  }

  return Array.from(merged.values());
}

/**
 * JWT에서 세션 정보 추출
 */
export function parseUserSession(jwtPayload: any): UserSession | null {
  try {
    if (!jwtPayload) return null;

    return {
      userId: jwtPayload.sub || jwtPayload.userId,
      role: jwtPayload.role || 'Coach',
      centers: jwtPayload.centers || [],
      org: jwtPayload.org || 'default',
      scopes: jwtPayload.scopes || ['heatmap:view']
    };
  } catch (error) {
    console.error('❌ JWT 파싱 오류:', error);
    return null;
  }
}

/**
 * 권한 검증
 */
export function hasPermission(
  session: UserSession,
  requiredScope: string
): boolean {
  return session.scopes.includes(requiredScope) || session.role === 'HQ';
}

/**
 * 센터 필터링 (프론트엔드용)
 */
export function getVisibleCenters(
  allCenters: string[],
  session: UserSession,
  centerData: Map<string, { trend3m: number; visible: boolean }>
): Array<{
  centerId: string;
  visible: boolean;
  disabled: boolean;
  reason?: string;
}> {
  return allCenters.map(centerId => {
    const data = centerData.get(centerId);
    const policyResult = data ? 
      canSeeCenter(centerId, data.trend3m, session) : 
      { visible: false, reason: 'no_data', anonymized: false };

    return {
      centerId,
      visible: policyResult.visible,
      disabled: !policyResult.visible,
      reason: policyResult.reason
    };
  });
}

/**
 * 정책 설정 업데이트
 */
export function updateVisibilityPolicy(
  newPolicy: Partial<VisibilityPolicy>
): VisibilityPolicy {
  return {
    ...DEFAULT_VISIBILITY_POLICY,
    ...newPolicy
  };
}

/**
 * 감사 로그 생성
 */
export function createAuditLog(
  action: string,
  session: UserSession,
  details: any
): any {
  return {
    action,
    userId: session.userId,
    role: session.role,
    centers: session.centers,
    timestamp: new Date().toISOString(),
    details
  };
}



