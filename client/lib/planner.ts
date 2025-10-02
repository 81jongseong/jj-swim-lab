/**
 * 세션 제너레이터 알고리즘
 * 
 * 연동되는 데이터:
 * - 사용자 입력 데이터 (연령, 성별, 목적, 건강 상태 등)
 * - 기록 표준 데이터 (standards.ts)
 * - 건강 규칙 데이터 (health_rules.ts)
 * - 드릴 라이브러리 (drill-library.ts)
 * 
 * 연동되는 파일:
 * - components/PlannerForm.tsx (입력 데이터)
 * - plans/exporter.ts (결과 출력)
 * 
 * 알고리즘:
 * 1. 기준 페이스 결정 (CSS > best100 > Z2 > 연령표 기반)
 * 2. 밴드 기반 훈련 분배
 * 3. 스케줄 반영 (가능 요일/시간)
 * 4. 건강 캡 적용
 * 5. 세트 빌드 (WU, Tech, Main, Secondary, CD)
 */

import { lookupBand, getTrainingDistribution, getRecommendedWeeklyMinutes, getRecommendedSessions } from './standards';
import { getSafetyCaps, getRecommendedWeeklyMinutes as getHealthWeeklyMinutes, getRecommendedSessions as getHealthSessions } from './health_rules';
import { getRecommendedDrills, getCoachingCues, getDrillsByCategory } from './drill-library';
import type { TechniqueChecklist } from './drill-library';

export type PoolLength = 25 | 50;
export type Goal = 'fatloss' | 'endurance' | 'performance';
export type Sex = 'M' | 'F';
export type HealthFlags = {
  hypertension?: boolean;
  obesity?: boolean;
  dyslipidemia?: boolean;
  diabetes?: boolean;
  msd?: string[];
};

export interface PaceData {
  css?: number; // CSS 페이스 (초/100m)
  best100?: number; // 100m 최고 기록 (초)
  z2?: number; // Z2 페이스 (초/100m)
}

export interface Inputs {
  pool: PoolLength;
  daysAvailable: string[];
  sessionMinutes: number;
  goal: Goal;
  age: number;
  sex: Sex;
  health: HealthFlags;
  pace: PaceData;
  technique: TechniqueChecklist;
}

export interface Set {
  id: string;
  name: string;
  description: string;
  laps: number;
  distance: number; // 미터
  pace: string;
  rest: number; // 초
  zone: string;
  cues: string[];
  drills?: string[];
  equipment?: string[];
}

export interface Session {
  id: string;
  name: string;
  day: string;
  duration: number; // 분
  totalDistance: number; // 미터
  sets: Set[];
  safetyNotes: string[];
  equipment: string[];
}

export interface Plan {
  id: string;
  name: string;
  goal: Goal;
  weeklyMinutes: number;
  weeklyDistance: number;
  sessions: Session[];
  safetyCaps: any;
  progression: {
    volumeIncrease: number; // %
    restDecrease: number; // 초
    intensityIncrease: number; // %
  };
}

/**
 * 기준 페이스 결정
 * @param pace 페이스 데이터
 * @param age 연령
 * @param sex 성별
 * @returns 기준 페이스 (초/100m)
 */
function determineBasePace(pace: PaceData, age: number, sex: Sex): number {
  // CSS 우선
  if (pace.css) {
    return pace.css;
  }
  
  // best100 기반 추정 (CSS ≈ best100 + 6-8초)
  if (pace.best100) {
    return pace.best100 + 7;
  }
  
  // Z2 페이스
  if (pace.z2) {
    return pace.z2;
  }
  
  // 연령표 기반 추정 (기본값)
  const basePace = sex === 'M' ? 120 : 130; // 기본 2분/100m (남성), 2분10초/100m (여성)
  const ageAdjustment = Math.max(0, (age - 25) * 2); // 25세 기준, 1세당 2초 증가
  
  return basePace + ageAdjustment;
}

/**
 * 밴드 기반 훈련 분배 계산
 * @param pace 페이스 데이터
 * @param age 연령
 * @param sex 성별
 * @returns 훈련 분배 비율
 */
function calculateTrainingDistribution(pace: PaceData, age: number, sex: Sex) {
  // best100이 있으면 밴드 계산
  if (pace.best100) {
    const band = lookupBand({
      age,
      sex,
      event: 'FR100',
      timeSec: pace.best100
    });
    return getTrainingDistribution(band);
  }
  
  // 기본 분배 (중급자 기준)
  return {
    endurance: { EN1: 35, EN2: 25 },
    threshold: 20,
    vo2max: 10,
    sprint: 5,
    technique: 5
  };
}

/**
 * 목적별 볼륨 스케일링
 * @param goal 목적
 * @param baseVolume 기본 볼륨
 * @returns 스케일링된 볼륨
 */
function scaleVolumeByGoal(goal: Goal, baseVolume: number): number {
  switch (goal) {
    case 'fatloss':
      return Math.max(baseVolume, 150); // WHO 최소 권장
    case 'endurance':
      return baseVolume * 1.2;
    case 'performance':
      return baseVolume * 1.5;
    default:
      return baseVolume;
  }
}

/**
 * 세션 빌드
 * @param inputs 입력 데이터
 * @param day 요일
 * @param sessionIndex 세션 인덱스
 * @returns 세션
 */
function buildSession(inputs: Inputs, day: string, sessionIndex: number): Session {
  const { pool, sessionMinutes, goal, health, pace, technique } = inputs;
  
  const basePace = determineBasePace(pace, inputs.age, inputs.sex);
  const safetyCaps = getSafetyCaps(health);
  const trainingDist = calculateTrainingDistribution(pace, inputs.age, inputs.sex);
  
  const sets: Set[] = [];
  const safetyNotes: string[] = [];
  const equipment: string[] = [];
  
  // 워밍업 (10-15%)
  const warmupMinutes = Math.round(sessionMinutes * 0.12);
  const warmupDistance = Math.round(warmupMinutes * 30); // 분당 30m 추정
  const warmupLaps = Math.round(warmupDistance / pool);
  
  sets.push({
    id: 'warmup',
    name: '워밍업',
    description: '편안한 페이스로 몸 풀기',
    laps: warmupLaps,
    distance: warmupLaps * pool,
    pace: `Z1-Z2 (${basePace + 20}-${basePace + 10}초/100m)`,
    rest: 0,
    zone: 'Z1-Z2',
    cues: ['편안한 페이스', '호흡 조절', '몸 풀기'],
    drills: ['Easy Swim']
  });
  
  // 기술 블록 (10-20%)
  const techMinutes = Math.round(sessionMinutes * 0.15);
  const techDistance = Math.round(techMinutes * 25); // 분당 25m 추정
  const techLaps = Math.round(techDistance / pool);
  
  const techDrills = getRecommendedDrills(technique, 'technique');
  const techCues = getCoachingCues(technique);
  
  sets.push({
    id: 'technique',
    name: '기술 훈련',
    description: '기술 체크리스트 기반 드릴',
    laps: techLaps,
    distance: techLaps * pool,
    pace: `Z2 (${basePace + 10}초/100m)`,
    rest: 20,
    zone: 'Z2',
    cues: techCues.slice(0, 3),
    drills: techDrills.slice(0, 2).map(drill => drill.name)
  });
  
  // 메인 세트 (50-65%)
  const mainMinutes = Math.round(sessionMinutes * 0.55);
  const mainDistance = Math.round(mainMinutes * 35); // 분당 35m 추정
  const mainLaps = Math.round(mainDistance / pool);
  
  let mainPace: string;
  let mainZone: string;
  let mainRest: number;
  
  if (goal === 'fatloss') {
    mainPace = `Z2-Z3 (${basePace + 5}-${basePace}초/100m)`;
    mainZone = 'Z2-Z3';
    mainRest = 15;
  } else if (goal === 'endurance') {
    mainPace = `Z3 (${basePace}초/100m)`;
    mainZone = 'Z3';
    mainRest = 20;
  } else { // performance
    mainPace = `CSS+5-8초 (${basePace + 5}-${basePace + 8}초/100m)`;
    mainZone = 'Z3-Z4';
    mainRest = 25;
  }
  
  // 건강 상태에 따른 제한 적용
  if (health.hypertension && mainZone.includes('Z4')) {
    mainZone = 'Z3';
    mainPace = `Z3 (${basePace}초/100m)`;
    safetyNotes.push('고혈압 모드 적용—Z4 제한');
  }
  
  sets.push({
    id: 'main',
    name: '메인 세트',
    description: `${goal === 'fatloss' ? '체중 감량' : goal === 'endurance' ? '지구력' : '성능'} 향상`,
    laps: mainLaps,
    distance: mainLaps * pool,
    pace: mainPace,
    rest: mainRest,
    zone: mainZone,
    cues: ['일정한 페이스', '호흡 리듬', '몸 이완']
  });
  
  // 보조 세트 (10-20%)
  const secondaryMinutes = Math.round(sessionMinutes * 0.15);
  const secondaryDistance = Math.round(secondaryMinutes * 30);
  const secondaryLaps = Math.round(secondaryDistance / pool);
  
  let secondaryPace: string;
  let secondaryZone: string;
  let secondaryRest: number;
  
  if (goal === 'performance' && !health.hypertension) {
    secondaryPace = `Z5 (${basePace - 10}초/100m)`;
    secondaryZone = 'Z5';
    secondaryRest = 60;
  } else {
    secondaryPace = `Z3-Z4 (${basePace}-${basePace - 5}초/100m)`;
    secondaryZone = 'Z3-Z4';
    secondaryRest = 30;
  }
  
  // 건강 상태에 따른 제한 적용
  if (health.hypertension && secondaryZone.includes('Z5')) {
    secondaryZone = 'Z3-Z4';
    secondaryPace = `Z3-Z4 (${basePace}-${basePace - 5}초/100m)`;
    safetyNotes.push('고혈압 모드 적용—Z5 제한');
  }
  
  sets.push({
    id: 'secondary',
    name: '보조 세트',
    description: '고강도 인터벌',
    laps: secondaryLaps,
    distance: secondaryLaps * pool,
    pace: secondaryPace,
    rest: secondaryRest,
    zone: secondaryZone,
    cues: ['고강도 유지', '호흡 조절', '회복']
  });
  
  // 쿨다운 (5-10%)
  const cooldownMinutes = Math.round(sessionMinutes * 0.08);
  const cooldownDistance = Math.round(cooldownMinutes * 25);
  const cooldownLaps = Math.round(cooldownDistance / pool);
  
  sets.push({
    id: 'cooldown',
    name: '쿨다운',
    description: '편안한 페이스로 몸 이완',
    laps: cooldownLaps,
    distance: cooldownLaps * pool,
    pace: `Z1 (${basePace + 25}초/100m)`,
    rest: 0,
    zone: 'Z1',
    cues: ['편안한 페이스', '몸 이완', '호흡 조절']
  });
  
  // 총 거리 계산
  const totalDistance = sets.reduce((sum, set) => sum + set.distance, 0);
  
  // 안전 주의사항 추가
  if (health.hypertension) {
    safetyNotes.push('고혈압 모드 적용—Z4 제한/하이폭식 비활성');
  }
  if (health.diabetes) {
    safetyNotes.push('당뇨 모드 적용—저혈당 주의');
  }
  if (health.msd && health.msd.length > 0) {
    safetyNotes.push('근골격계 질환 모드 적용—관절 부하 최소화');
  }
  
  return {
    id: `session_${day}_${sessionIndex}`,
    name: `${day}요일 세션`,
    day,
    duration: sessionMinutes,
    totalDistance,
    sets,
    safetyNotes,
    equipment: [...new Set(equipment)]
  };
}

/**
 * 주간 계획 빌드
 * @param inputs 입력 데이터
 * @returns 주간 계획
 */
export function buildWeek(inputs: Inputs): Plan {
  const { daysAvailable, sessionMinutes, goal, health, age, sex } = inputs;
  
  // 건강 상태에 따른 권장 시간 조회
  const healthWeekly = getHealthWeeklyMinutes(health);
  const healthSessions = getHealthSessions(health);
  
  // 목적별 볼륨 스케일링
  const baseWeeklyMinutes = daysAvailable.length * sessionMinutes;
  const scaledWeeklyMinutes = scaleVolumeByGoal(goal, baseWeeklyMinutes);
  
  // 세션 수 조정
  const targetSessions = Math.min(daysAvailable.length, healthSessions.max);
  const adjustedSessionMinutes = Math.round(scaledWeeklyMinutes / targetSessions);
  
  // 세션 생성
  const sessions: Session[] = [];
  daysAvailable.forEach((day, index) => {
    if (index < targetSessions) {
      sessions.push(buildSession({
        ...inputs,
        sessionMinutes: adjustedSessionMinutes
      }, day, index));
    }
  });
  
  // 총 거리 계산
  const weeklyDistance = sessions.reduce((sum, session) => sum + session.totalDistance, 0);
  
  // 진행률 기반 자동 증감 로직
  const progression = {
    volumeIncrease: 5, // 5% 볼륨 증가
    restDecrease: 5, // 5초 휴식 감소
    intensityIncrease: 2 // 2% 강도 증가
  };
  
  return {
    id: `plan_${Date.now()}`,
    name: `${goal} 목적 주간 계획`,
    goal,
    weeklyMinutes: scaledWeeklyMinutes,
    weeklyDistance,
    sessions,
    safetyCaps: getSafetyCaps(health),
    progression
  };
}

/**
 * 세션 결과 기반 진행률 업데이트
 * @param plan 기존 계획
 * @param sessionResults 세션 결과
 * @returns 업데이트된 계획
 */
export function updateProgression(
  plan: Plan,
  sessionResults: Array<{
    sessionId: string;
    completionRate: number; // 0-100%
    rpe: number; // 1-10
    painFlag: boolean;
  }>
): Plan {
  const avgCompletion = sessionResults.reduce((sum, result) => sum + result.completionRate, 0) / sessionResults.length;
  const avgRpe = sessionResults.reduce((sum, result) => sum + result.rpe, 0) / sessionResults.length;
  const hasPain = sessionResults.some(result => result.painFlag);
  
  let volumeAdjustment = 0;
  let restAdjustment = 0;
  let intensityAdjustment = 0;
  
  // 완료율 85% 이상 & 목표 RPE 이내
  if (avgCompletion >= 85 && avgRpe <= 6) {
    volumeAdjustment = 5; // 볼륨 +5%
    restAdjustment = -5; // 휴식 -5초
    intensityAdjustment = 2; // 강도 +2%
  }
  
  // 완료율 70% 미만 또는 통증 플래그
  if (avgCompletion < 70 || hasPain) {
    volumeAdjustment = -20; // 볼륨 -20%
    restAdjustment = 10; // 휴식 +10초
    intensityAdjustment = -5; // 강도 -5%
  }
  
  // 진행률 업데이트
  const updatedProgression = {
    volumeIncrease: Math.max(0, plan.progression.volumeIncrease + volumeAdjustment),
    restDecrease: Math.max(0, plan.progression.restDecrease + restAdjustment),
    intensityIncrease: Math.max(0, plan.progression.intensityIncrease + intensityAdjustment)
  };
  
  return {
    ...plan,
    progression: updatedProgression
  };
}

/**
 * 계획 검증
 * @param plan 계획
 * @returns 검증 결과
 */
export function validatePlan(plan: Plan): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // 25m 풀 선택 시 모든 세트가 25m 배수 랩으로만 표기
  const has25mPool = plan.sessions.some(session => 
    session.sets.some(set => set.distance % 25 !== 0)
  );
  
  if (has25mPool) {
    errors.push('25m 풀 선택 시 모든 세트가 25m 배수 랩으로만 표기되어야 합니다.');
  }
  
  // 고혈압 On이면 Z4·Z5 합계 ≤10%로 제한
  const hasHypertension = plan.safetyCaps?.zones?.Z4maxPct <= 10;
  if (hasHypertension) {
    const z4z5Percentage = plan.sessions.reduce((sum, session) => {
      return sum + session.sets.filter(set => 
        set.zone.includes('Z4') || set.zone.includes('Z5')
      ).length;
    }, 0) / plan.sessions.reduce((sum, session) => sum + session.sets.length, 0) * 100;
    
    if (z4z5Percentage > 10) {
      errors.push('고혈압 모드에서 Z4·Z5 합계가 10%를 초과했습니다.');
    }
  }
  
  // 목적=체중감량이면 주간 시간 목표가 WHO 기준 ≥150분으로 유도
  if (plan.goal === 'fatloss' && plan.weeklyMinutes < 150) {
    errors.push('체중감량 목적 시 주간 시간 목표가 WHO 기준 150분 이상이어야 합니다.');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

