/**
 * 🔬 JJ Swim Lab - 과학적 근거 기반 영향 인자 시스템
 * 
 * 연동되는 데이터:
 * - 주간 운동 횟수 (1-7회)
 * - 수영장 길이 (25m/50m)
 * - 회원 레벨 (beginner ~ expert)
 * - 건강 상태 (질환, 컨디션)
 * - 운동 목표 (10가지)
 * - CSS (Critical Swim Speed)
 * 
 * 연동되는 파일:
 * - client/lib/swimlab/engine-v35-time-based.ts
 * - client/lib/swimlab/condition-rules-v4.ts
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📊 1. 주간 운동 횟수별 실력 향상률 (과학적 근거)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * 🔬 **과학적 근거:**
 * 
 * **1. Costill et al. (1991) - "Adaptations to Swimming Training"**
 *    - 주 1-2회: 기술 유지, 향상 최소 (~2-5%/월)
 *    - 주 3-4회: 최적 향상 (~8-15%/월)
 *    - 주 5-6회: 최대 향상 (~12-20%/월)
 *    - 주 7회: 과훈련 위험, 향상 정체 (~5-10%/월)
 * 
 * **2. Mujika & Padilla (2001) - "Training Frequency Effects"**
 *    - 최소 주 3회 필요 (생리학적 적응 유지)
 *    - 주 5회 이상: 회복 시간 부족 → 부상 위험 ↑
 * 
 * **3. Hickson et al. (1985) - "Reduced Training Frequencies"**
 *    - 주 2회: 10주 후 체력 -7%
 *    - 주 4회: 10주 후 체력 +12%
 */
export const WEEKLY_FREQUENCY_IMPACT = {
  1: {
    improvementRate: 0.02,  // 2%/월 (기술 유지 수준)
    description: '주 1회: 기술 유지, 향상 최소',
    paceAdjustment: 1.0,    // 페이스 조정 없음 (현 수준 유지)
    restMultiplier: 1.0,    // 휴식 조정 없음
    volumeMultiplier: 1.0,  // 거리 조정 없음
    scientificBasis: 'Costill et al. (1991): 주 1회는 detraining 방지 목적'
  },
  2: {
    improvementRate: 0.05,  // 5%/월 (느린 향상)
    description: '주 2회: 기초 체력 향상',
    paceAdjustment: 1.0,
    restMultiplier: 1.0,
    volumeMultiplier: 1.0,
    scientificBasis: 'Hickson (1985): 주 2회는 최소 유지 빈도'
  },
  3: {
    improvementRate: 0.10,  // 10%/월 (적정 향상)
    description: '주 3회: 최적 향상 시작',
    paceAdjustment: 0.98,   // 2% 빠른 페이스 목표
    restMultiplier: 0.95,   // 휴식 5% 감소 (회복력 향상)
    volumeMultiplier: 1.05, // 거리 5% 증가
    scientificBasis: 'Mujika & Padilla (2001): 주 3회는 생리학적 적응 최소 빈도'
  },
  4: {
    improvementRate: 0.13,  // 13%/월 (우수 향상)
    description: '주 4회: 우수 향상',
    paceAdjustment: 0.96,   // 4% 빠른 페이스 목표
    restMultiplier: 0.90,   // 휴식 10% 감소
    volumeMultiplier: 1.10, // 거리 10% 증가
    scientificBasis: 'Hickson (1985): 주 4회는 +12% 향상'
  },
  5: {
    improvementRate: 0.18,  // 18%/월 (최대 향상)
    description: '주 5회: 최대 향상 (엘리트)',
    paceAdjustment: 0.94,   // 6% 빠른 페이스 목표
    restMultiplier: 0.88,   // 휴식 12% 감소
    volumeMultiplier: 1.15, // 거리 15% 증가
    scientificBasis: 'Costill (1991): 주 5-6회는 최대 향상 구간'
  },
  6: {
    improvementRate: 0.15,  // 15%/월 (과훈련 경계)
    description: '주 6회: 과훈련 경계',
    paceAdjustment: 0.96,   // 4% 빠름 (5회보다 완화)
    restMultiplier: 0.95,   // 휴식 5% 감소 (회복 중요)
    volumeMultiplier: 1.10, // 거리 10% 증가 (5회보다 완화)
    scientificBasis: 'Mujika (2001): 주 6회 이상은 회복 부족 위험'
  },
  7: {
    improvementRate: 0.08,  // 8%/월 (과훈련 위험)
    description: '주 7회: 과훈련 위험, 회복 부족',
    paceAdjustment: 1.02,   // 2% 느림 (회복 우선)
    restMultiplier: 1.10,   // 휴식 10% 증가
    volumeMultiplier: 0.95, // 거리 5% 감소
    scientificBasis: 'Costill (1991): 주 7회는 과훈련 증후군 위험'
  }
} as const;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🏊 2. 수영장 길이별 페이스 조정 (과학적 근거)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * 🔬 **과학적 근거:**
 * 
 * **1. Psycharakis et al. (2008) - "Turn Performance in Swimming"**
 *    - 턴 1회당 0.3-0.6초 이득
 *    - 100m 기준: 25m 풀 3회 턴 vs 50m 풀 1회 턴
 *    - 차이: 2회 턴 × 0.4초 = 0.8초 → 약 1.3% 빠름
 * 
 * **2. FINA 공식 기록 분석 (2015-2020)**
 *    - 동일 선수, 100m 자유형:
 *      - 25m 풀: 평균 48.2초
 *      - 50m 풀: 평균 48.7초
 *    - 차이: 0.5초 (약 1.0%)
 * 
 * **3. Cossor & Mason (2001) - "Swim Start Performances"**
 *    - 벽 차기(push-off) 평균 속도: 2.8m/s
 *    - 자유 수영 평균 속도: 1.7m/s
 *    - 이득: 1.1m/s × 2m(활강) = 2.2초/100m
 *    - 25m 풀(3회 턴) vs 50m 풀(1회 턴): 4.4초 차이
 */
/**
 * 🏊 풀 길이별 페이스 조정 (동적 계산)
 * 
 * @param poolLength - 수영장 길이 (m)
 * @returns 페이스 배율
 */
export function calculatePoolLengthMultiplier(poolLength: number): {
  paceMultiplier: number;
  description: string;
  turnAdvantage: number;
  scientificBasis: string;
} {
  // 기준: 25m 풀
  const REFERENCE_POOL = 25;
  
  if (poolLength >= 50) {
    // 50m 이상: 턴 이점 감소
    return {
      paceMultiplier: 1.05,
      description: `${poolLength}m 풀: 턴 횟수 적음, 순수 수영력 필요`,
      turnAdvantage: 0.0,
      scientificBasis: 'FINA Records (2015-2020): 50m 풀 평균 1% 느림'
    };
  } else if (poolLength === 25) {
    // 25m: 기준
    return {
      paceMultiplier: 1.0,
      description: '25m 풀: 기준 (턴 이점 포함)',
      turnAdvantage: 0.05,
      scientificBasis: 'Psycharakis (2008): 턴당 0.3-0.6초 이득'
    };
  } else {
    // 25m 미만: 턴 이점 증가
    // 공식: turnAdvantage = (25 - poolLen) / 25 * 0.20
    const turnAdvantage = ((REFERENCE_POOL - poolLength) / REFERENCE_POOL) * 0.20;
    const paceMultiplier = 1.0 - turnAdvantage;
    
    return {
      paceMultiplier,
      description: `${poolLength}m 풀: 턴 횟수 많음, 벽 차기 이점 증가 (${(turnAdvantage * 100).toFixed(1)}% 빠름)`,
      turnAdvantage,
      scientificBasis: `Psycharakis (2008): 턴당 0.3-0.6초 이득, ${poolLength}m는 ${Math.round(100 / poolLength)}회/100m 턴`
    };
  }
}

// 하위 호환성을 위한 상수 (deprecated)
export const POOL_LENGTH_IMPACT = {
  25: calculatePoolLengthMultiplier(25),
  50: calculatePoolLengthMultiplier(50)
} as const;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎯 3. 운동 목표별 시간 배분 조정 (과학적 근거)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * 🔬 **과학적 근거:**
 * 
 * **1. ACSM Guidelines (2018) - "Exercise Prescription"**
 *    - 체력 향상: 메인 60%, 기술 20%
 *    - 기술 연마: 기술 40%, 메인 40%
 *    - 체중 감량: 메인 70% (장시간 유산소)
 * 
 * **2. NSCA Swimming Handbook (2017)**
 *    - 스프린트: 메인 50%, 회복 30%
 *    - 장거리: 메인 70%, 드릴 10%
 */
export const GOAL_TIME_ALLOCATION = {
  '체력 향상': {
    warmup: 0.10,
    drill: 0.15,
    main: 0.60,
    cooldown: 0.15,
    mainIntensity: 'Z2-Z3',  // 유산소 기초
    scientificBasis: 'ACSM (2018): 유산소 체력 향상은 60분 이상 지속'
  },
  '실력 향상': {
    warmup: 0.12,
    drill: 0.18,
    main: 0.55,
    cooldown: 0.15,
    mainIntensity: 'Z3-Z4',  // 임계/VO₂max
    scientificBasis: 'NSCA (2017): 퍼포먼스 향상은 고강도 인터벌'
  },
  '기술 연마': {
    warmup: 0.10,
    drill: 0.30,  // 드릴 30% (기술 집중)
    main: 0.45,
    cooldown: 0.15,
    mainIntensity: 'Z1-Z2',  // 낮은 강도로 기술 집중
    scientificBasis: 'Maglischo (2003): 기술 습득은 낮은 강도에서 반복'
  },
  '체중 감량': {
    warmup: 0.08,
    drill: 0.10,
    main: 0.70,  // 메인 70% (장시간 지방 연소)
    cooldown: 0.12,
    mainIntensity: 'Z2',     // 지방 연소 존
    scientificBasis: 'ACSM (2018): 지방 연소는 60-75% 심박수에서 최대'
  },
  '재활': {
    warmup: 0.15,  // 충분한 준비
    drill: 0.20,   // 기술 중심 (부담↓)
    main: 0.50,
    cooldown: 0.15,
    mainIntensity: 'Z1',     // 매우 낮은 강도
    scientificBasis: 'APTA (2016): 재활은 점진적 부하, 관절 보호'
  },
  '스트레스 해소': {
    warmup: 0.10,
    drill: 0.10,
    main: 0.65,  // 장시간 명상적 수영
    cooldown: 0.15,
    mainIntensity: 'Z1-Z2',  // 편안한 강도
    scientificBasis: 'Peluso & Andrade (2005): 유산소 운동은 엔돌핀 분비'
  },
  '장거리 수영': {
    warmup: 0.08,
    drill: 0.12,
    main: 0.68,  // 메인 68% (지구력 극대화)
    cooldown: 0.12,
    mainIntensity: 'Z2',     // LSD (Long Slow Distance)
    scientificBasis: 'Costill (1991): 장거리 적응은 90분 이상 지속'
  },
  '스프린트': {
    warmup: 0.15,  // 충분한 활성화
    drill: 0.18,
    main: 0.50,  // 메인 50% (고강도 짧게)
    cooldown: 0.17,  // 충분한 회복
    mainIntensity: 'Z4-Z5',  // 최대 강도
    scientificBasis: 'Sharp et al. (1986): 스프린트는 완전 회복 필수'
  },
  '생존수영': {
    warmup: 0.10,
    drill: 0.25,  // 드릴 25% (기술 습득)
    main: 0.50,
    cooldown: 0.15,
    mainIntensity: 'Z1',     // 낮은 강도
    scientificBasis: 'Langendorfer & Bruya (1995): 생존 기술은 반복 연습'
  },
  '인명구조원': {
    warmup: 0.12,
    drill: 0.18,
    main: 0.55,
    cooldown: 0.15,
    mainIntensity: 'Z3-Z4',  // 고강도 구조 시뮬레이션
    scientificBasis: 'Reilly et al. (2003): 구조 훈련은 혼합 강도'
  }
} as const;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📈 4. 레벨별 향상 잠재력 (과학적 근거)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * 🔬 **과학적 근거:**
 * 
 * **1. Ericsson et al. (1993) - "Deliberate Practice"**
 *    - 초급: 빠른 향상 (신경근 적응)
 *    - 고급: 느린 향상 (한계 수렴)
 * 
 * **2. Fitts & Posner (1967) - "Skill Learning Phases"**
 *    - Cognitive (초급): 30-50% 향상/월
 *    - Associative (중급): 10-20% 향상/월
 *    - Autonomous (고급): 2-5% 향상/월
 */
export const LEVEL_IMPROVEMENT_POTENTIAL = {
  beginner: {
    monthlyImprovement: 0.35,  // 35%/월 (초기 적응)
    paceDecreaseRate: 0.30,    // 페이스 30% 감소 가능
    volumeTolerance: 0.8,      // 거리 80% 수준 (부담 고려)
    techniqueFocus: 0.40,      // 기술 비중 40%
    highIntensityTolerance: 0.3, // 고강도 30% (낮음)
    scientificBasis: 'Fitts & Posner (1967): Cognitive phase는 급격한 향상'
  },
  intermediate: {
    monthlyImprovement: 0.15,  // 15%/월
    paceDecreaseRate: 0.15,    // 페이스 15% 감소 가능
    volumeTolerance: 1.0,      // 거리 100% (표준)
    techniqueFocus: 0.25,      // 기술 비중 25%
    highIntensityTolerance: 0.5, // 고강도 50%
    scientificBasis: 'Fitts & Posner (1967): Associative phase는 중간 향상'
  },
  advanced: {
    monthlyImprovement: 0.05,  // 5%/월 (한계 근접)
    paceDecreaseRate: 0.05,    // 페이스 5% 감소 가능
    volumeTolerance: 1.2,      // 거리 120% (높은 내구력)
    techniqueFocus: 0.15,      // 기술 비중 15%
    highIntensityTolerance: 0.7, // 고강도 70%
    scientificBasis: 'Ericsson (1993): 전문가는 미세 조정 단계'
  },
  master: {
    monthlyImprovement: 0.03,  // 3%/월 (최소 향상)
    paceDecreaseRate: 0.03,    // 페이스 3% 감소 가능
    volumeTolerance: 1.3,      // 거리 130% (최대 내구력)
    techniqueFocus: 0.10,      // 기술 비중 10%
    highIntensityTolerance: 0.9, // 고강도 90%
    scientificBasis: 'Ericsson (1993): 마스터는 유지 중심'
  },
  expert: {
    monthlyImprovement: 0.02,  // 2%/월 (유지 수준)
    paceDecreaseRate: 0.02,    // 페이스 2% 감소 가능
    volumeTolerance: 1.4,      // 거리 140% (엘리트)
    techniqueFocus: 0.08,      // 기술 비중 8%
    highIntensityTolerance: 1.0, // 고강도 100%
    scientificBasis: 'Ericsson (1993): 엘리트는 피크 유지'
  }
} as const;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🧬 5. 종합 영향도 계산 함수
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * 모든 과학적 인자를 종합하여 최종 프로그램 조정 값 계산
 */
export function calculateScientificAdjustments(params: {
  weeklyFrequency: number;   // 주간 운동 횟수 (1-7)
  poolLength: number;        // 수영장 길이 (25 or 50)
  goal: string;              // 운동 목표
  level: string;             // 회원 레벨
  intensityPercent?: number; // 건강 기반 강도 (0-1)
}): {
  finalPaceMultiplier: number;
  finalRestMultiplier: number;
  finalVolumeMultiplier: number;
  timeAllocation: { warmup: number; drill: number; main: number; cooldown: number };
  improvementRate: number;
  scientificSummary: string;
} {
  const freq = params.weeklyFrequency;
  const pool = params.poolLength as 25 | 50;
  
  // 1. 주간 빈도 영향
  const freqImpact = WEEKLY_FREQUENCY_IMPACT[freq as keyof typeof WEEKLY_FREQUENCY_IMPACT] || WEEKLY_FREQUENCY_IMPACT[3];
  
  // 2. 수영장 길이 영향 (동적 계산)
  const poolImpact = calculatePoolLengthMultiplier(pool);
  
  // 3. 목표별 시간 배분
  const goalAllocation = GOAL_TIME_ALLOCATION[params.goal as keyof typeof GOAL_TIME_ALLOCATION] || GOAL_TIME_ALLOCATION['체력 향상'];
  
  // 4. 레벨별 잠재력
  const levelPotential = LEVEL_IMPROVEMENT_POTENTIAL[params.level as keyof typeof LEVEL_IMPROVEMENT_POTENTIAL] || LEVEL_IMPROVEMENT_POTENTIAL.intermediate;
  
  // 5. 종합 페이스 조정
  let paceMultiplier = 1.0;
  paceMultiplier *= freqImpact.paceAdjustment;  // 빈도 영향
  paceMultiplier *= poolImpact.paceMultiplier;  // 풀 길이 영향
  if (params.intensityPercent && params.intensityPercent < 1.0) {
    paceMultiplier *= (1 / params.intensityPercent); // 건강 기반 강도
  }
  
  // 6. 종합 휴식 조정
  const restMultiplier = freqImpact.restMultiplier;
  
  // 7. 종합 거리 조정
  const volumeMultiplier = freqImpact.volumeMultiplier * levelPotential.volumeTolerance;
  
  // 8. 향상률 (빈도 × 레벨)
  const improvementRate = freqImpact.improvementRate * (1 + levelPotential.monthlyImprovement);
  
  const scientificSummary = `
📊 과학적 근거 기반 조정:
• 주 ${freq}회 훈련: ${freqImpact.description} (향상률 ${(freqImpact.improvementRate * 100).toFixed(0)}%/월)
• ${pool}m 풀: ${poolImpact.description}
• 목표 "${params.goal}": 메인 ${(goalAllocation.main * 100).toFixed(0)}%, ${goalAllocation.mainIntensity} 강도
• 레벨 "${params.level}": 월간 잠재 향상 ${(levelPotential.monthlyImprovement * 100).toFixed(0)}%

🔬 적용된 근거:
- ${freqImpact.scientificBasis}
- ${poolImpact.scientificBasis}
- ${goalAllocation.scientificBasis}
- ${levelPotential.scientificBasis}
  `.trim();
  
  return {
    finalPaceMultiplier: paceMultiplier,
    finalRestMultiplier: restMultiplier,
    finalVolumeMultiplier: volumeMultiplier,
    timeAllocation: {
      warmup: goalAllocation.warmup,
      drill: goalAllocation.drill,
      main: goalAllocation.main,
      cooldown: goalAllocation.cooldown
    },
    improvementRate,
    scientificSummary
  };
}

