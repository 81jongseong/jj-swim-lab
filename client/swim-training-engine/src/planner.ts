/**
 * 🏊‍♂️ JJ Swim Lab - 세션 생성 알고리즘
 * 
 * 📋 **기능:**
 * - 개인별 입력 기반 주간 계획 생성
 * - 건강·질환·기술 기반 세션 구성
 * - 랩 단위(25m/50m) 세트 생성
 * - 페이스/레스트/드릴/코칭큐 포함
 */

import { 
  UserInput, 
  SessionPlan, 
  WeekPlan, 
  SessionSet, 
  Zone, 
  Stroke, 
  TrainingMethod,
  Drill 
} from './types';
import { 
  resolveBasePace, 
  zonePace, 
  formatPaceNote, 
  calculateRestTime, 
  calculateZoneDistribution 
} from './pace';
import { getSafetyCaps } from './health_rules';
import { TRAINING_METHODS } from './training_methods';
import { DRILLS } from './drills';

/**
 * 주간 수영 계획 생성
 */
export function buildWeek(input: UserInput): WeekPlan {
  const { demographics, health, technique, pace, avail, goal, stroke } = input;
  
  // 기준 페이스 계산
  const basePace = resolveBasePace(pace);
  const zonePaces = zonePace(basePace);
  
  // 안전 제한 적용
  const safetyCaps = getSafetyCaps(health);
  
  // 총 거리 계산 (주당 목표)
  const totalMeters = calculateTotalMeters(avail, goal);
  
  // 존별 거리 분배
  const zoneDist = calculateZoneDistribution(totalMeters, zonePaces);
  
  // 세션 수 계산
  const sessions = avail.daysPerWeek;
  
  // 세션별 계획 생성
  const sessionPlans: SessionPlan[] = [];
  
  for (let dayIndex = 0; dayIndex < sessions; dayIndex++) {
    const sessionPlan = buildSession({
      dayIndex,
      totalMeters: Math.round(totalMeters / sessions),
      basePace,
      zonePaces,
      zoneDist,
      safetyCaps,
      avail,
      goal,
      stroke,
      technique,
      health
    });
    
    sessionPlans.push(sessionPlan);
  }
  
  return {
    summary: {
      totalMeters,
      zoneDist,
      sessions
    },
    sessions: sessionPlans
  };
}

/**
 * 개별 세션 계획 생성
 */
function buildSession(params: {
  dayIndex: number;
  totalMeters: number;
  basePace: number;
  zonePaces: Record<Zone, [number, number]>;
  zoneDist: Record<Zone, number>;
  safetyCaps: any;
  avail: any;
  goal: string;
  stroke: Stroke;
  technique: any;
  health: any;
}): SessionPlan {
  const { 
    dayIndex, 
    totalMeters, 
    basePace, 
    zonePaces, 
    zoneDist, 
    safetyCaps, 
    avail, 
    goal, 
    stroke, 
    technique, 
    health 
  } = params;
  
  const sets: SessionSet[] = [];
  let remainingMeters = totalMeters;
  
  // 워밍업 세트 (10-15%)
  const warmupMeters = Math.min(Math.round(totalMeters * 0.15), 400);
  if (warmupMeters > 0) {
    sets.push(createWarmupSet(warmupMeters, stroke, technique));
    remainingMeters -= warmupMeters;
  }
  
  // 메인 세트 (70-80%)
  const mainMeters = Math.round(remainingMeters * 0.8);
  if (mainMeters > 0) {
    const mainSets = createMainSets(mainMeters, zoneDist, zonePaces, basePace, stroke, goal, safetyCaps);
    sets.push(...mainSets);
    remainingMeters -= mainMeters;
  }
  
  // 쿨다운 세트 (10-15%)
  const cooldownMeters = remainingMeters;
  if (cooldownMeters > 0) {
    sets.push(createCooldownSet(cooldownMeters, stroke));
  }
  
  return {
    dayIndex,
    totalMeters,
    sets,
    safetyBadges: safetyCaps.modifications
  };
}

/**
 * 워밍업 세트 생성
 */
function createWarmupSet(meters: number, stroke: Stroke, technique: any): SessionSet {
  const reps = Math.ceil(meters / 50);
  const distance = 50;
  
  return {
    label: 'Warm-up',
    reps,
    distance,
    paceNote: '@ Easy (Z1)',
    restSec: 10,
    stroke,
    cues: ['편안한 페이스', '몸 풀기', '기술 점검']
  };
}

/**
 * 메인 세트 생성
 */
function createMainSets(
  meters: number, 
  zoneDist: Record<Zone, number>, 
  zonePaces: Record<Zone, [number, number]>, 
  basePace: number, 
  stroke: Stroke, 
  goal: string, 
  safetyCaps: any
): SessionSet[] {
  const sets: SessionSet[] = [];
  
  // 목표별 메인 세트 구성
  switch (goal) {
    case 'fatloss':
      sets.push(...createFatlossSets(meters, zonePaces, basePace, stroke, safetyCaps));
      break;
    case 'endurance':
      sets.push(...createEnduranceSets(meters, zonePaces, basePace, stroke, safetyCaps));
      break;
    case 'performance':
      sets.push(...createPerformanceSets(meters, zonePaces, basePace, stroke, safetyCaps));
      break;
    default:
      sets.push(...createEnduranceSets(meters, zonePaces, basePace, stroke, safetyCaps));
  }
  
  return sets;
}

/**
 * 체중감량 목표 세트 생성
 */
function createFatlossSets(
  meters: number, 
  zonePaces: Record<Zone, [number, number]>, 
  basePace: number, 
  stroke: Stroke, 
  safetyCaps: any
): SessionSet[] {
  const sets: SessionSet[] = [];
  
  // Z2 지속 세트 (60%)
  const z2Meters = Math.round(meters * 0.6);
  if (z2Meters > 0) {
    sets.push(createZoneSet('Z2', z2Meters, zonePaces, basePace, stroke, '지속 지구력'));
  }
  
  // Z3 템포 세트 (30%)
  const z3Meters = Math.round(meters * 0.3);
  if (z3Meters > 0) {
    sets.push(createZoneSet('Z3', z3Meters, zonePaces, basePace, stroke, '템포 수영'));
  }
  
  // Z1 회복 세트 (10%)
  const z1Meters = meters - z2Meters - z3Meters;
  if (z1Meters > 0) {
    sets.push(createZoneSet('Z1', z1Meters, zonePaces, basePace, stroke, '회복 수영'));
  }
  
  return sets;
}

/**
 * 지구력 목표 세트 생성
 */
function createEnduranceSets(
  meters: number, 
  zonePaces: Record<Zone, [number, number]>, 
  basePace: number, 
  stroke: Stroke, 
  safetyCaps: any
): SessionSet[] {
  const sets: SessionSet[] = [];
  
  // Z2 지속 세트 (70%)
  const z2Meters = Math.round(meters * 0.7);
  if (z2Meters > 0) {
    sets.push(createZoneSet('Z2', z2Meters, zonePaces, basePace, stroke, '지속 지구력'));
  }
  
  // Z3 템포 세트 (20%)
  const z3Meters = Math.round(meters * 0.2);
  if (z3Meters > 0) {
    sets.push(createZoneSet('Z3', z3Meters, zonePaces, basePace, stroke, '템포 수영'));
  }
  
  // Z1 회복 세트 (10%)
  const z1Meters = meters - z2Meters - z3Meters;
  if (z1Meters > 0) {
    sets.push(createZoneSet('Z1', z1Meters, zonePaces, basePace, stroke, '회복 수영'));
  }
  
  return sets;
}

/**
 * 기록향상 목표 세트 생성
 */
function createPerformanceSets(
  meters: number, 
  zonePaces: Record<Zone, [number, number]>, 
  basePace: number, 
  stroke: Stroke, 
  safetyCaps: any
): SessionSet[] {
  const sets: SessionSet[] = [];
  
  // Z3 템포 세트 (40%)
  const z3Meters = Math.round(meters * 0.4);
  if (z3Meters > 0) {
    sets.push(createZoneSet('Z3', z3Meters, zonePaces, basePace, stroke, '템포 수영'));
  }
  
  // Z4 VO2max 세트 (30%)
  const z4Meters = Math.round(meters * 0.3);
  if (z4Meters > 0 && !safetyCaps.restrictedMethods.includes('vo2max')) {
    sets.push(createZoneSet('Z4', z4Meters, zonePaces, basePace, stroke, 'VO2max 수영'));
  }
  
  // Z2 지속 세트 (20%)
  const z2Meters = Math.round(meters * 0.2);
  if (z2Meters > 0) {
    sets.push(createZoneSet('Z2', z2Meters, zonePaces, basePace, stroke, '지속 지구력'));
  }
  
  // Z1 회복 세트 (10%)
  const z1Meters = meters - z3Meters - z4Meters - z2Meters;
  if (z1Meters > 0) {
    sets.push(createZoneSet('Z1', z1Meters, zonePaces, basePace, stroke, '회복 수영'));
  }
  
  return sets;
}

/**
 * 존별 세트 생성
 */
function createZoneSet(
  zone: Zone, 
  meters: number, 
  zonePaces: Record<Zone, [number, number]>, 
  basePace: number, 
  stroke: Stroke, 
  description: string
): SessionSet {
  const paceNote = formatPaceNote(basePace, zone);
  const restSec = calculateRestTime(zone, 50);
  
  // 거리에 따른 세트 구성
  let reps: number;
  let distance: number;
  
  if (meters <= 100) {
    reps = 1;
    distance = meters;
  } else if (meters <= 200) {
    reps = 2;
    distance = meters / 2;
  } else if (meters <= 400) {
    reps = 4;
    distance = meters / 4;
  } else {
    reps = 8;
    distance = meters / 8;
  }
  
  // 25m 단위로 조정
  distance = Math.round(distance / 25) * 25;
  reps = Math.ceil(meters / distance);
  
  return {
    label: `Main (${zone})`,
    reps,
    distance,
    paceNote,
    restSec,
    stroke,
    cues: [description, '일정한 페이스 유지', '호흡 조절']
  };
}

/**
 * 쿨다운 세트 생성
 */
function createCooldownSet(meters: number, stroke: Stroke): SessionSet {
  const reps = Math.ceil(meters / 50);
  const distance = 50;
  
  return {
    label: 'Cool-down',
    reps,
    distance,
    paceNote: '@ Easy (Z1)',
    restSec: 10,
    stroke,
    cues: ['편안한 페이스', '몸 풀기', '스트레칭 준비']
  };
}

/**
 * 총 거리 계산
 */
function calculateTotalMeters(avail: any, goal: string): number {
  const baseMeters = avail.daysPerWeek * avail.sessionMinutes * 2; // 분당 2m 가정
  
  switch (goal) {
    case 'fatloss':
      return Math.round(baseMeters * 0.8); // 체중감량은 거리보다 강도
    case 'endurance':
      return Math.round(baseMeters * 1.2); // 지구력은 거리 증가
    case 'performance':
      return Math.round(baseMeters * 1.0); // 기록향상은 균형
    default:
      return baseMeters;
  }
}

/**
 * 기술 드릴 세트 생성
 */
function createTechniqueSet(meters: number, stroke: Stroke, technique: any): SessionSet {
  const reps = Math.ceil(meters / 25);
  const distance = 25;
  
  // 기술별 드릴 선택
  let drillIds: string[] = [];
  let cues: string[] = [];
  
  if (stroke === 'FR') {
    if (technique.freestyle?.crossover) {
      drillIds.push('catch_up', 'fingertip_drag');
      cues.push('크로스오버 교정', '하이엘보 유지');
    }
    if (technique.freestyle?.highElbow) {
      drillIds.push('fingertip_drag');
      cues.push('하이엘보 유지', '손끝이 수면 스치기');
    }
    if (technique.freestyle?.bilateralBreath) {
      drillIds.push('6_1_6');
      cues.push('양측 호흡', '균형 유지');
    }
  }
  
  return {
    label: 'Technique',
    reps,
    distance,
    paceNote: '@ Easy (Z1)',
    restSec: 15,
    stroke,
    drillIds,
    cues
  };
}

/**
 * 하이폭식 세트 생성 (안전 범위 내)
 */
function createHypoxicSet(meters: number, stroke: Stroke, safetyCaps: any, zonePaces: Record<string, [number, number]>): SessionSet {
  if (safetyCaps.restrictedDrills.includes('hypoxic_3_5_7')) {
    return createZoneSet('Z2', meters, zonePaces as any, 0, stroke, '지속 수영');
  }
  
  const reps = Math.ceil(meters / 50);
  const distance = 50;
  
  return {
    label: 'Hypoxic',
    reps,
    distance,
    paceNote: '@ Easy (Z2)',
    restSec: 20,
    stroke,
    drillIds: ['hypoxic_3_5_7'],
    cues: ['3/5/7 호흡 패턴', '절대 과호흡 금지', '현기증 시 즉시 중단']
  };
}