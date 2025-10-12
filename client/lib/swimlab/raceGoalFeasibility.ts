/**
 * 🎯 대회 목표 기록 실현 가능성 검증 엔진 (CSS/CS 기반)
 * 
 * 과학적 근거:
 * 1. **CSS/CS (Critical Swim Speed)**: 역치/MLSS 근사, 템포 페이스 설계 기준
 *    - PubMed, ResearchGate 연구 기반
 * 
 * 2. **12주 기준 개선률**:
 *    - Novice: 3-8% / 12주 (신경계 적응)
 *    - Trained: 1-3% / 12주 (핵심 연구 다수, SpringerOpen)
 *    - Elite: 0-1.5% / 12주 (표본 협소, 개체차 큼)
 * 
 * 3. **훈련 부하 추정**: Banister TRIMP (충격-반응 모델)
 *    - Wiley Online Library, TrainingPeaks
 * 
 * 4. **거리 예측**: Riegel 식 (T₂ = T₁·(D₂/D₁)^k, 수영 k≈1.06)
 *    - nku.edu, 관행적 사용
 * 
 * 5. **인터벌 강도 조정**: CS 대비 비율 (100→200→400m 시 속도 −2%)
 *    - PubMed
 * 
 * 6. **코어·근력 추가 효과**: ~1-2% 추가 개선
 *    - 스포츠과학 및 의학 저널
 * 
 * 핵심 로직:
 * - 목표기록 vs 현재기록 vs 남은 기간
 * - 시간(기록) · 속도(CSS/CS) · 훈련노출(완료율/부하) · 질환제약
 * - 현실적인 주당 개선률과 비교해 등급 산출
 * 
 * @module raceGoalFeasibility
 */

export type SwimmerLevel = 'novice' | 'trained' | 'elite';
export type Distance = 50 | 100 | 200 | 400 | 800 | 1500;
export type Stroke = 'freestyle' | 'backstroke' | 'breaststroke' | 'butterfly';
export type FeasibilityGrade = 'feasible' | 'stretch' | 'unlikely' | 'unrealistic';

export interface RaceGoalInput {
  // 목표 종목
  event: {
    distance: Distance;
    stroke: Stroke;
  };
  
  // 현재 기록 & 목표 기록 (초)
  T_now: number;
  T_goal: number;
  
  // 남은 주 수
  weeks: number;
  
  // CSS (Critical Swim Speed) - m/s 또는 100m당 초
  CS?: number; // 예: 1.5 m/s 또는 67초/100m
  cssType?: 'mps' | 'sec_per_100m'; // 단위
  
  // 훈련 이력 (최근 4-8주)
  history?: {
    completionRate: number; // 완료율 (0-100)
    avgRPE?: number; // 평균 RPE (1-10)
    z4Exposure?: number; // Z4 노출 횟수 (주당)
    injuryFlag?: boolean; // 부상/통증 여부
    fatigueFlag?: boolean; // 피로 누적 여부
  };
  
  // 수준
  level: SwimmerLevel;
  
  // 제약 조건 (컨디션/질환)
  constraints?: {
    conditionIds: string[]; // 예: ['shoulder_impingement', 'chlorine_sensitivity']
    impactScore?: number; // 0-10, 높을수록 제약 큼
  };
  
  // 훈련 환경
  trainingVolume?: {
    sessionsPerWeek: number;
    minutesPerSession: number;
  };
}

export interface FeasibilityResult {
  grade: FeasibilityGrade;
  confidence: number; // 0-100
  
  // 필요한 개선률
  requiredImprovement: {
    total: number; // 총 개선률 (%)
    weeklyAvg: number; // 주당 평균 개선률 (%)
  };
  
  // 현실적 범위
  realisticRange: {
    min: number; // 최소 예상 개선률 (%)
    mid: number; // 중간 예상 개선률 (%)
    max: number; // 최대 예상 개선률 (%)
  };
  
  // CSS 기반 분석
  cssAnalysis?: {
    currentCS: number; // 현재 CS (m/s)
    requiredCS: number; // 필요한 CS (m/s)
    deltaCS: number; // CS 개선 필요량 (m/s)
    deltaCS_pct: number; // CS 개선률 (%)
  };
  
  // 권장 목표
  recommendedTarget: {
    time: number; // 권장 목표 기록 (초)
    conservative: number; // 보수적 목표 (초)
    aggressive: number; // 도전적 목표 (초)
  };
  
  // 메시지
  message: string;
  detailedExplanation: string;
  actionItems: string[];
  
  // 근거
  evidenceKeys: string[];
}

/**
 * 레벨별 12주 기준 개선률 범위 (%)
 */
const IMPROVEMENT_RANGE_12W: Record<SwimmerLevel, { min: number; mid: number; max: number }> = {
  novice: { min: 3.0, mid: 5.5, max: 8.0 },    // 신경계 적응 (개체차 매우 큼)
  trained: { min: 1.0, mid: 2.0, max: 3.0 },   // 리뷰/개입 연구 다수
  elite: { min: 0.0, mid: 0.75, max: 1.5 }     // 표본 협소, 개체차 큼
};

/**
 * 거리별 난이도 계수
 * 짧은 거리는 D′ (무산소 예비) 영향 큼 → CS만 올려도 기록 개선 어려움
 */
const DISTANCE_DIFFICULTY: Record<Distance, number> = {
  50: 1.3,   // 무산소 비중 높음
  100: 1.2,  // 무산소+유산소
  200: 1.0,  // 기준 (역치 근처)
  400: 0.95, // 유산소 비중 높음
  800: 0.9,
  1500: 0.85 // 순수 유산소
};

/**
 * 영법별 난이도 계수
 */
const STROKE_DIFFICULTY: Record<Stroke, number> = {
  freestyle: 1.0,
  backstroke: 1.1,
  breaststroke: 1.15,
  butterfly: 1.2
};

/**
 * Riegel 식 상수 (수영)
 * T₂ = T₁ · (D₂/D₁)^k
 */
const RIEGEL_K_SWIMMING = 1.06;

/**
 * 대회 목표 기록 실현 가능성 검증 (Step-by-Step)
 */
export function calculateRaceGoalFeasibility(input: RaceGoalInput): FeasibilityResult {
  const evidenceKeys: string[] = [
    'PubMed - CSS/CS as MLSS proxy',
    'SpringerOpen - Trained swimmer improvement',
    'Wiley - Banister TRIMP model',
    'nku.edu - Riegel formula'
  ];
  
  // === Step 1: 입력 검증 ===
  if (input.weeks < 2) {
    return {
      grade: 'unrealistic',
      confidence: 0,
      requiredImprovement: { total: 0, weeklyAvg: 0 },
      realisticRange: { min: 0, mid: 0, max: 0 },
      recommendedTarget: {
        time: input.T_now,
        conservative: input.T_now,
        aggressive: input.T_now
      },
      message: '⚠️ 대회까지 2주 미만입니다. 현재 기록 유지에 집중하세요.',
      detailedExplanation: '훈련 효과를 보려면 최소 4주 이상 필요합니다. 짧은 기간에는 테이퍼와 컨디션 조절에 집중하는 것이 좋습니다.',
      actionItems: [
        '테이퍼 시작 (볼륨 -40~60%)',
        '수면 및 영양 최적화',
        '기술 정확도 유지 훈련'
      ],
      evidenceKeys
    };
  }
  
  if (input.T_goal >= input.T_now) {
    return {
      grade: 'feasible',
      confidence: 100,
      requiredImprovement: { total: 0, weeklyAvg: 0 },
      realisticRange: { min: 0, mid: 0, max: 0 },
      recommendedTarget: {
        time: input.T_goal,
        conservative: input.T_goal,
        aggressive: input.T_now * 0.98
      },
      message: '✅ 현재 기록이 목표보다 빠릅니다! 더 도전적인 목표를 설정하세요.',
      detailedExplanation: `현재 기록(${formatTime(input.T_now)})이 목표 기록(${formatTime(input.T_goal)})보다 빠릅니다.`,
      actionItems: [
        '목표 기록을 2-3% 더 낮게 재설정',
        '경기 전략 세분화 (페이싱, 턴 최적화)',
        '레이스 시뮬레이션 훈련'
      ],
      evidenceKeys
    };
  }
  
  // === Step 2: 필요한 주당 개선률 계산 ===
  const req_pct_total = ((input.T_now - input.T_goal) / input.T_now) * 100;
  const weekly_req = (1 - Math.pow((input.T_goal / input.T_now), (1 / input.weeks))) * 100;
  
  // === Step 3: 기준 "현실 범위" (weeks 기준으로 스케일) ===
  const baseRange = IMPROVEMENT_RANGE_12W[input.level];
  const scaleFactor = input.weeks / 12;
  
  let range_min = baseRange.min * scaleFactor;
  let range_mid = baseRange.mid * scaleFactor;
  let range_max = baseRange.max * scaleFactor;
  
  // === Step 4: 조건/이력 보정 ===
  const history = input.history;
  let adjustment_max = 0;
  let adjustment_mid = 0;
  let adjustment_min = 0;
  
  const adjustmentReasons: string[] = [];
  
  // 4.1 완료율 보정
  if (history?.completionRate !== undefined) {
    if (history.completionRate >= 90) {
      adjustment_max += 0.5;
      adjustment_mid += 0.3;
      adjustment_min += 0.2;
      adjustmentReasons.push('✅ 높은 완료율 (90%+): 상한 +0.5%p');
    } else if (history.completionRate < 70) {
      adjustment_max -= 0.5;
      adjustment_mid -= 0.3;
      adjustment_min -= 0.2;
      adjustmentReasons.push('⚠️ 낮은 완료율 (<70%): 상한 -0.5%p');
    }
  }
  
  // 4.2 피로/부상 플래그
  if (history?.injuryFlag || history?.fatigueFlag) {
    adjustment_max -= 1.0;
    adjustment_mid -= 0.5;
    adjustmentReasons.push('⚠️ 부상/피로 플래그: 상한 -1.0%p');
  }
  
  // 4.3 질환 impact
  if (input.constraints?.impactScore && input.constraints.impactScore > 5) {
    const impact = (input.constraints.impactScore - 5) * 0.2;
    adjustment_max -= impact;
    adjustment_mid -= impact * 0.5;
    adjustmentReasons.push(`⚠️ 질환 제약 (impact ${input.constraints.impactScore}/10): 상한 -${impact.toFixed(1)}%p`);
  }
  
  // 4.4 훈련 볼륨 미달
  if (input.trainingVolume) {
    const minSessionsNeeded = input.event.distance <= 200 ? 4 : 5;
    if (input.trainingVolume.sessionsPerWeek < minSessionsNeeded) {
      adjustment_max -= 0.5;
      adjustment_mid -= 0.3;
      adjustment_min -= 0.2;
      adjustmentReasons.push(`⚠️ 훈련 빈도 부족 (${input.trainingVolume.sessionsPerWeek}회/주 < ${minSessionsNeeded}회): -0.5%p`);
    }
  }
  
  // 4.5 거리·영법 난이도 보정
  const distDifficulty = DISTANCE_DIFFICULTY[input.event.distance];
  const strokeDifficulty = STROKE_DIFFICULTY[input.event.stroke];
  const difficultyMultiplier = distDifficulty * strokeDifficulty;
  
  range_min = (range_min + adjustment_min) / difficultyMultiplier;
  range_mid = (range_mid + adjustment_mid) / difficultyMultiplier;
  range_max = (range_max + adjustment_max) / difficultyMultiplier;
  
  // === Step 5: CSS 기반 분석 (선택적, 400m+ 거리만 유효) ===
  let cssAnalysis: FeasibilityResult['cssAnalysis'] | undefined;
  
  if (input.CS && input.cssType && input.event.distance >= 400) {
    // ⚠️ CSS는 역치 페이스로 장거리(400m+)에만 적합
    // 단거리(50-200m)는 무산소 영역으로 CSS 예측 부정확
    
    // CS를 m/s로 변환
    const currentCS_mps = input.cssType === 'mps' 
      ? input.CS 
      : 100 / input.CS;
    
    // 현재 기록에서 평균 속도 계산
    const currentAvgSpeed = input.event.distance / input.T_now; // m/s
    const targetAvgSpeed = input.event.distance / input.T_goal; // m/s
    
    // 필요한 CS
    // 400m: CS보다 5% 빠름
    // 800m+: CS보다 2-3% 빠름
    const csBonus = input.event.distance <= 400 ? 1.05 : 1.02;
    const requiredCS_mps = targetAvgSpeed / csBonus;
    
    const deltaCS = requiredCS_mps - currentCS_mps;
    const deltaCS_pct = (deltaCS / currentCS_mps) * 100;
    
    cssAnalysis = {
      currentCS: currentCS_mps,
      requiredCS: requiredCS_mps,
      deltaCS: deltaCS,
      deltaCS_pct: deltaCS_pct
    };
    
    // CSS 개선 필요량이 과도하면 하향 조정 (단, 절댓값 사용)
    const absDeltaCS_pct = Math.abs(deltaCS_pct);
    if (absDeltaCS_pct > range_max * 0.8) {
      adjustmentReasons.push(`⚠️ CSS 개선 필요량 과다 (${absDeltaCS_pct.toFixed(1)}%): 현실성 ↓`);
      range_max *= 0.9;
      range_mid *= 0.9;
    }
    
    evidenceKeys.push('PubMed - CS-based interval prescription');
  }
  
  // === Step 6: 판정 로직 ===
  let grade: FeasibilityGrade;
  let confidence: number;
  let message: string;
  let detailedExplanation: string;
  let actionItems: string[] = [];
  
  if (weekly_req <= range_mid) {
    // 중간값 이하 → 가능
    grade = 'feasible';
    confidence = Math.min(95, 100 - (weekly_req / range_mid) * 20);
    message = '✅ 매우 현실적인 목표입니다! 체계적으로 훈련하면 충분히 달성 가능합니다.';
    detailedExplanation = `${input.weeks}주 훈련으로 ${req_pct_total.toFixed(1)}% 향상은 충분히 가능합니다.\n\n`;
    detailedExplanation += `• 레벨: ${getLevelName(input.level)}\n`;
    detailedExplanation += `• 주당 필요 개선률: ${weekly_req.toFixed(2)}%\n`;
    detailedExplanation += `• 현실적 범위: ${range_min.toFixed(1)}~${range_max.toFixed(1)}%\n`;
    detailedExplanation += `• 예상 개선률: ${range_mid.toFixed(1)}% (중간값 기준)`;
    
    actionItems = [
      `주 ${input.trainingVolume?.sessionsPerWeek || 4}회 이상 훈련 유지`,
      'CSS 기반 역치 인터벌 (주 2회)',
      '기술 드릴 + 레이스 페이스 연습 (주 1회)',
      '테이퍼 2주 전 시작 (볼륨 -40%)'
    ];
    
  } else if (weekly_req <= range_max) {
    // 중간~상한 사이 → 도전적
    grade = 'stretch';
    confidence = Math.min(75, 100 - ((weekly_req - range_mid) / (range_max - range_mid)) * 30);
    message = '⚡ 도전적이지만 가능한 목표입니다. 일관된 고강도 훈련과 완벽한 회복이 필요합니다.';
    detailedExplanation = `${input.weeks}주 훈련으로 ${req_pct_total.toFixed(1)}% 향상은 가능하지만, 최대 노력이 필요합니다.\n\n`;
    detailedExplanation += `• 레벨: ${getLevelName(input.level)}\n`;
    detailedExplanation += `• 주당 필요 개선률: ${weekly_req.toFixed(2)}%\n`;
    detailedExplanation += `• 현실적 범위: ${range_min.toFixed(1)}~${range_max.toFixed(1)}%\n`;
    detailedExplanation += `• ⚠️ 상한 근처 (${range_max.toFixed(1)}%)에 근접`;
    
    actionItems = [
      `주 ${Math.max(5, input.trainingVolume?.sessionsPerWeek || 5)}회 훈련 필수`,
      'CSS 기반 역치 인터벌 (주 2-3회)',
      'Z4 고강도 스프린트 (주 1-2회)',
      '수면 8시간+, 영양 최적화',
      '부상 예방 (스트레칭, 코어)',
      '완료율 90% 이상 유지'
    ];
    
  } else if (weekly_req <= range_max * 1.3) {
    // 상한 초과하지만 근접 → 낮음
    grade = 'unlikely';
    confidence = Math.max(20, 50 - ((weekly_req - range_max) / range_max) * 100);
    message = '⚠️ 매우 어려운 목표입니다. 목표를 조정하거나 대회 날짜를 연기하세요.';
    detailedExplanation = `${req_pct_total.toFixed(1)}% 향상은 ${input.weeks}주에는 매우 어렵습니다.\n\n`;
    detailedExplanation += `• 최대 현실적 향상: ${(range_max * input.weeks / 12 * 12).toFixed(1)}% (12주 기준)\n`;
    detailedExplanation += `• 필요 개선: ${req_pct_total.toFixed(1)}%\n`;
    detailedExplanation += `• ⚠️ 부상 위험 증가, 과훈련 증후군 가능성`;
    
    actionItems = [
      `권장: 목표 ${(input.T_now * (1 - range_mid / 100)).toFixed(2)}초로 하향`,
      '또는 대회를 4-8주 연기',
      '현재 목표 유지 시: 주 6회+ 훈련 + 완벽한 회복',
      '부상 신호 즉시 대응'
    ];
    
  } else {
    // 비현실적
    grade = 'unrealistic';
    confidence = 0;
    message = '❌ 비현실적인 목표입니다. 부상 위험이 매우 높습니다.';
    detailedExplanation = `${req_pct_total.toFixed(1)}% 향상은 ${input.weeks}주에는 불가능합니다.\n\n`;
    detailedExplanation += `• 예: 자유형 50m 40초→30초는 25% 향상\n`;
    detailedExplanation += `  → 엘리트 선수도 수년이 걸립니다.\n\n`;
    detailedExplanation += `현실적 목표를 다시 설정하세요.`;
    
    actionItems = [
      `권장 목표: ${(input.T_now * (1 - range_mid / 100)).toFixed(2)}초`,
      '또는 대회를 12주+ 연기',
      '장기 계획 수립 (6개월-1년)'
    ];
  }
  
  // 조정 이유 추가
  if (adjustmentReasons.length > 0) {
    detailedExplanation += '\n\n### 보정 사항:\n' + adjustmentReasons.join('\n');
  }
  
  // CSS 분석 추가
  if (cssAnalysis) {
    detailedExplanation += `\n\n### CSS 분석:\n`;
    detailedExplanation += `• 현재 CSS: ${cssAnalysis.currentCS.toFixed(3)} m/s\n`;
    detailedExplanation += `• 필요 CSS: ${cssAnalysis.requiredCS.toFixed(3)} m/s\n`;
    detailedExplanation += `• CSS 개선 필요: ${cssAnalysis.deltaCS_pct.toFixed(1)}%`;
  }
  
  // === Step 7: 권장 목표 계산 ===
  // range_min/mid/max는 이미 전체 기간 기준 개선률 (12주 기준 * scaleFactor)
  // 따라서 그대로 사용
  const totalRangeMin = range_min;
  const totalRangeMid = range_mid;
  const totalRangeMax = range_max;
  
  let conservativeImprovement: number;
  let midImprovement: number;
  let aggressiveImprovement: number;
  
  if (grade === 'feasible') {
    // 가능한 목표 → 안전하게 중간값 근처
    conservativeImprovement = (totalRangeMid * 0.5) / 100;
    midImprovement = (totalRangeMid * 0.75) / 100;
    aggressiveImprovement = totalRangeMid / 100;
  } else if (grade === 'stretch') {
    // 도전적 목표 → 사용자 목표의 50-80%
    // 사용자가 이미 도전적 목표를 세웠으므로, 권장은 그보다 안전한 수준
    conservativeImprovement = (req_pct_total * 0.5) / 100;
    midImprovement = (req_pct_total * 0.7) / 100;
    aggressiveImprovement = (req_pct_total * 0.9) / 100;
  } else if (grade === 'unlikely') {
    // 어려운 목표 → 사용자 목표의 70-95%
    conservativeImprovement = (req_pct_total * 0.7) / 100;
    midImprovement = (req_pct_total * 0.85) / 100;
    aggressiveImprovement = (req_pct_total * 0.95) / 100;
  } else {
    // 비현실적 → 사용자 목표의 80-100%
    conservativeImprovement = (req_pct_total * 0.8) / 100;
    midImprovement = (req_pct_total * 0.9) / 100;
    aggressiveImprovement = (req_pct_total * 1.0) / 100;
  }
  
  // 디버그 로그
  console.log('🎯 권장 목표 계산:', {
    grade,
    totalRangeMin,
    totalRangeMid,
    totalRangeMax,
    conservativeImprovement: (conservativeImprovement * 100).toFixed(2) + '%',
    midImprovement: (midImprovement * 100).toFixed(2) + '%',
    aggressiveImprovement: (aggressiveImprovement * 100).toFixed(2) + '%',
    conservativeTime: (input.T_now * (1 - conservativeImprovement)).toFixed(2),
    midTime: (input.T_now * (1 - midImprovement)).toFixed(2),
    aggressiveTime: (input.T_now * (1 - aggressiveImprovement)).toFixed(2)
  });
  
  const recommendedTarget = {
    time: input.T_now * (1 - midImprovement),
    conservative: input.T_now * (1 - conservativeImprovement),
    aggressive: input.T_now * (1 - aggressiveImprovement)
  };
  
  return {
    grade,
    confidence,
    requiredImprovement: {
      total: req_pct_total,
      weeklyAvg: weekly_req
    },
    realisticRange: {
      min: range_min,
      mid: range_mid,
      max: range_max
    },
    cssAnalysis,
    recommendedTarget,
    message,
    detailedExplanation,
    actionItems,
    evidenceKeys
  };
}

/**
 * Riegel 식으로 거리 간 기록 예측
 * T₂ = T₁ · (D₂/D₁)^k
 */
export function predictTimeByRiegel(
  T1: number, // 알고 있는 거리의 기록 (초)
  D1: Distance, // 알고 있는 거리
  D2: Distance, // 예측할 거리
  k: number = RIEGEL_K_SWIMMING
): number {
  return T1 * Math.pow(D2 / D1, k);
}

/**
 * CSS로부터 목표 거리 예측 페이스 계산
 * 
 * @param cs - Critical Speed (m/s)
 * @param distance - 목표 거리 (m)
 * @param intensity - 강도 계수 (1.0 = CS 페이스, 1.05 = CS+5%)
 */
export function calculatePaceFromCS(
  cs: number,
  distance: Distance,
  intensity: number = 1.0
): number {
  const targetSpeed = cs * intensity; // m/s
  return distance / targetSpeed; // 초
}

/**
 * 레벨 한글 변환
 */
function getLevelName(level: SwimmerLevel): string {
  const names: Record<SwimmerLevel, string> = {
    novice: '초급 (Novice)',
    trained: '중급 (Trained)',
    elite: '상급/엘리트 (Elite)'
  };
  return names[level];
}

/**
 * 시간 포맷
 */
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.round((seconds % 1) * 100);
  
  if (mins > 0) {
    return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  }
  return `${secs}.${ms.toString().padStart(2, '0')}`;
}

/**
 * 예시 사용
 */
export function getExampleFeasibility(): FeasibilityResult {
  return calculateRaceGoalFeasibility({
    event: { distance: 50, stroke: 'freestyle' },
    T_now: 40, // 40.00초
    T_goal: 30, // 30.00초 (25% 향상 - 비현실적)
    weeks: 8,
    CS: 1.5, // 1.5 m/s
    cssType: 'mps',
    history: {
      completionRate: 85,
      avgRPE: 7,
      z4Exposure: 2,
      injuryFlag: false,
      fatigueFlag: false
    },
    level: 'trained',
    constraints: {
      conditionIds: [],
      impactScore: 3
    },
    trainingVolume: {
      sessionsPerWeek: 4,
      minutesPerSession: 90
    }
  });
}


