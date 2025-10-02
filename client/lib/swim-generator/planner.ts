/**
 * 🏊‍♂️ JJ Swim Lab - 세션 생성 알고리즘
 * 
 * 📋 **기능:**
 * - 개인별 입력 기반 주간 계획 생성
 * - 랩 단위(25m/50m) 세트 구성
 * - 페이스/레스트/드릴/코칭큐 포함
 */

import { 
  UserInput, 
  WeekPlan, 
  SessionPlan, 
  SessionSet, 
  Zone, 
  Stroke, 
  TrainingMethod, 
  Drill 
} from './types';
import { resolveBasePace, zonePace, formatPace } from './pace';
import { getSafetyCaps, filterMethodsBySafety, filterDrillsBySafety, getSafetyBadges } from './health_rules';
import { TRAINING_METHODS } from './training_methods';
import { DRILLS } from './drills';

export function buildWeek(input: UserInput): WeekPlan {
  const css = resolveBasePace(input.pace);
  const zones = zonePace(css);
  const safetyCaps = getSafetyCaps(input.health);
  const availableMethods = filterMethodsBySafety(TRAINING_METHODS, safetyCaps);
  const availableDrills = filterDrillsBySafety(DRILLS, safetyCaps);
  
  const sessions: SessionPlan[] = [];
  const totalMeters = input.avail.daysPerWeek * input.avail.sessionMinutes * 2; // 대략적 계산
  
  // 목적별 훈련법 배치
  const methodDistribution = getMethodDistribution(input.goal, availableMethods);
  
  for (let day = 0; day < input.avail.daysPerWeek; day++) {
    const session = buildSession({
      dayIndex: day,
      input,
      css,
      zones,
      safetyCaps,
      availableMethods,
      availableDrills,
      methodDistribution
    });
    
    sessions.push(session);
  }
  
  return {
    summary: {
      totalMeters: sessions.reduce((sum, s) => sum + s.totalMeters, 0),
      zoneDist: calculateZoneDistribution(sessions),
      sessions: sessions.length
    },
    sessions
  };
}

function buildSession(params: {
  dayIndex: number;
  input: UserInput;
  css: number;
  zones: Record<Zone, [number, number]>;
  safetyCaps: any;
  availableMethods: TrainingMethod[];
  availableDrills: Drill[];
  methodDistribution: any;
}): SessionPlan {
  const { dayIndex, input, css, zones, safetyCaps, availableMethods, availableDrills, methodDistribution } = params;
  
  const sets: SessionSet[] = [];
  let totalMeters = 0;
  
  // 워밍업 세트
  const warmup = createWarmupSet(input, css, zones);
  sets.push(warmup);
  totalMeters += warmup.reps * warmup.distance;
  
  // 메인 세트 (목적별)
  const mainMethod = methodDistribution[dayIndex % methodDistribution.length];
  const mainSets = createMainSets(mainMethod, input, css, zones, availableDrills);
  sets.push(...mainSets);
  totalMeters += mainSets.reduce((sum, s) => sum + s.reps * s.distance, 0);
  
  // 쿨다운 세트
  const cooldown = createCooldownSet(input, css, zones);
  sets.push(cooldown);
  totalMeters += cooldown.reps * cooldown.distance;
  
  return {
    dayIndex,
    totalMeters,
    sets,
    safetyBadges: getSafetyBadges(input.health)
  };
}

function createWarmupSet(input: UserInput, css: number, zones: Record<Zone, [number, number]>): SessionSet {
  const poolLength = input.avail.pool;
  const reps = poolLength === 25 ? 4 : 2;
  const distance = poolLength;
  
  return {
    label: 'Warm-up',
    reps,
    distance,
    paceNote: `@ ${formatPace(zones.Z1[1])} (Z1)`,
    restSec: 15,
    stroke: input.stroke,
    cues: ['편안한 속도', '기술에 집중', '점진적 강도 증가']
  };
}

function createMainSets(
  method: TrainingMethod, 
  input: UserInput, 
  css: number, 
  zones: Record<Zone, [number, number]>,
  availableDrills: Drill[]
): SessionSet[] {
  const sets: SessionSet[] = [];
  const poolLength = input.avail.pool;
  
  // 목적별 세트 구성
  switch (method.id) {
    case 'technique':
      sets.push(createTechniqueSet(method, input, css, zones, availableDrills));
      break;
    case 'aerobic_en1':
    case 'aerobic_en2':
      sets.push(createAerobicSet(method, input, css, zones));
      break;
    case 'threshold':
      sets.push(createThresholdSet(method, input, css, zones));
      break;
    case 'vo2max':
      sets.push(createVO2MaxSet(method, input, css, zones));
      break;
    case 'sprint':
      sets.push(createSprintSet(method, input, css, zones));
      break;
    case 'kick':
      sets.push(createKickSet(method, input, css, zones));
      break;
    case 'pull':
      sets.push(createPullSet(method, input, css, zones));
      break;
    case 'hypoxic':
      sets.push(createHypoxicSet(method, input, css, zones));
      break;
    case 'im':
      sets.push(createIMSet(method, input, css, zones));
      break;
    case 'skills':
      sets.push(createSkillsSet(method, input, css, zones));
      break;
    case 'openwater':
      sets.push(createOpenWaterSet(method, input, css, zones));
      break;
    case 'recovery':
      sets.push(createRecoverySet(method, input, css, zones));
      break;
    case 'endurance':
      sets.push(createEnduranceSet(method, input, css, zones));
      break;
    default:
      sets.push(createDefaultSet(method, input, css, zones));
  }
  
  return sets;
}

function createTechniqueSet(
  method: TrainingMethod, 
  input: UserInput, 
  css: number, 
  zones: Record<Zone, [number, number]>,
  availableDrills: Drill[]
): SessionSet {
  const poolLength = input.avail.pool;
  const drill = availableDrills.find(d => method.recommendedDrillIds.includes(d.id)) || availableDrills[0];
  
  return {
    label: 'Main (Technique)',
    reps: poolLength === 25 ? 6 : 4,
    distance: poolLength,
    paceNote: `@ ${formatPace(zones.Z2[1])} (Z2)`,
    restSec: 20,
    stroke: input.stroke,
    methodId: method.id,
    drillIds: [drill.id],
    cues: drill.cues
  };
}

function createAerobicSet(
  method: TrainingMethod, 
  input: UserInput, 
  css: number, 
  zones: Record<Zone, [number, number]>
): SessionSet {
  const poolLength = input.avail.pool;
  const zone = method.id === 'aerobic_en1' ? 'Z1' : 'Z2';
  
  return {
    label: 'Main (Aerobic)',
    reps: poolLength === 25 ? 8 : 6,
    distance: poolLength * 2,
    paceNote: `@ ${formatPace(zones[zone][1])} (${zone})`,
    restSec: 15,
    stroke: input.stroke,
    methodId: method.id,
    cues: ['일정한 페이스 유지', '편안한 호흡', '기술에 집중']
  };
}

function createThresholdSet(
  method: TrainingMethod, 
  input: UserInput, 
  css: number, 
  zones: Record<Zone, [number, number]>
): SessionSet {
  const poolLength = input.avail.pool;
  
  return {
    label: 'Main (Threshold)',
    reps: poolLength === 25 ? 6 : 4,
    distance: poolLength * 2,
    paceNote: `@ ${formatPace(css)} (CSS)`,
    restSec: 20,
    stroke: input.stroke,
    methodId: method.id,
    cues: ['일정한 페이스 유지', '강도 유지', '기술 유지']
  };
}

function createVO2MaxSet(
  method: TrainingMethod, 
  input: UserInput, 
  css: number, 
  zones: Record<Zone, [number, number]>
): SessionSet {
  const poolLength = input.avail.pool;
  
  return {
    label: 'Main (VO₂max)',
    reps: poolLength === 25 ? 8 : 6,
    distance: poolLength,
    paceNote: `@ ${formatPace(zones.Z4[0])} (Z4)`,
    restSec: 30,
    stroke: input.stroke,
    methodId: method.id,
    cues: ['강하게', '최대 노력', '기술 유지']
  };
}

function createSprintSet(
  method: TrainingMethod, 
  input: UserInput, 
  css: number, 
  zones: Record<Zone, [number, number]>
): SessionSet {
  const poolLength = input.avail.pool;
  
  return {
    label: 'Main (Sprint)',
    reps: poolLength === 25 ? 8 : 6,
    distance: poolLength,
    paceNote: `@ ${formatPace(zones.Z5[0])} (Z5)`,
    restSec: 45,
    stroke: input.stroke,
    methodId: method.id,
    cues: ['최대 속도', '폭발적', '기술 유지']
  };
}

function createKickSet(
  method: TrainingMethod, 
  input: UserInput, 
  css: number, 
  zones: Record<Zone, [number, number]>
): SessionSet {
  const poolLength = input.avail.pool;
  
  return {
    label: 'Main (Kick)',
    reps: poolLength === 25 ? 6 : 4,
    distance: poolLength,
    paceNote: `@ ${formatPace(zones.Z2[1])} (Z2)`,
    restSec: 20,
    stroke: input.stroke,
    methodId: method.id,
    cues: ['킥에 집중', '리듬 유지', '체간 안정']
  };
}

function createPullSet(
  method: TrainingMethod, 
  input: UserInput, 
  css: number, 
  zones: Record<Zone, [number, number]>
): SessionSet {
  const poolLength = input.avail.pool;
  
  return {
    label: 'Main (Pull)',
    reps: poolLength === 25 ? 6 : 4,
    distance: poolLength * 2,
    paceNote: `@ ${formatPace(zones.Z2[1])} (Z2)`,
    restSec: 20,
    stroke: input.stroke,
    methodId: method.id,
    cues: ['풀에 집중', '캐치-프레스', '전완 각도']
  };
}

function createHypoxicSet(
  method: TrainingMethod, 
  input: UserInput, 
  css: number, 
  zones: Record<Zone, [number, number]>
): SessionSet {
  const poolLength = input.avail.pool;
  
  return {
    label: 'Main (Hypoxic)',
    reps: poolLength === 25 ? 6 : 4,
    distance: poolLength,
    paceNote: `@ ${formatPace(zones.Z2[1])} (Z2)`,
    restSec: 30,
    stroke: input.stroke,
    methodId: method.id,
    cues: ['3/5/7 패턴', '현기증 시 즉시 중단', '편안한 호흡']
  };
}

function createIMSet(
  method: TrainingMethod, 
  input: UserInput, 
  css: number, 
  zones: Record<Zone, [number, number]>
): SessionSet {
  const poolLength = input.avail.pool;
  
  return {
    label: 'Main (IM)',
    reps: poolLength === 25 ? 4 : 2,
    distance: poolLength * 4,
    paceNote: `@ ${formatPace(zones.Z2[1])} (Z2)`,
    restSec: 30,
    stroke: input.stroke,
    methodId: method.id,
    cues: ['전환 기술', '다양한 영법', '기술 유지']
  };
}

function createSkillsSet(
  method: TrainingMethod, 
  input: UserInput, 
  css: number, 
  zones: Record<Zone, [number, number]>
): SessionSet {
  const poolLength = input.avail.pool;
  
  return {
    label: 'Main (Skills)',
    reps: poolLength === 25 ? 8 : 6,
    distance: poolLength,
    paceNote: `@ ${formatPace(zones.Z2[1])} (Z2)`,
    restSec: 20,
    stroke: input.stroke,
    methodId: method.id,
    cues: ['출발 기술', '턴 기술', '브레이크아웃']
  };
}

function createOpenWaterSet(
  method: TrainingMethod, 
  input: UserInput, 
  css: number, 
  zones: Record<Zone, [number, number]>
): SessionSet {
  const poolLength = input.avail.pool;
  
  return {
    label: 'Main (Open Water)',
    reps: poolLength === 25 ? 6 : 4,
    distance: poolLength,
    paceNote: `@ ${formatPace(zones.Z2[1])} (Z2)`,
    restSec: 20,
    stroke: input.stroke,
    methodId: method.id,
    cues: ['사이팅', '드래프팅', '직선 유영']
  };
}

function createRecoverySet(
  method: TrainingMethod, 
  input: UserInput, 
  css: number, 
  zones: Record<Zone, [number, number]>
): SessionSet {
  const poolLength = input.avail.pool;
  
  return {
    label: 'Main (Recovery)',
    reps: poolLength === 25 ? 6 : 4,
    distance: poolLength * 2,
    paceNote: `@ ${formatPace(zones.Z1[1])} (Z1)`,
    restSec: 15,
    stroke: input.stroke,
    methodId: method.id,
    cues: ['편안한 속도', '회복에 집중', '기술 유지']
  };
}

function createEnduranceSet(
  method: TrainingMethod, 
  input: UserInput, 
  css: number, 
  zones: Record<Zone, [number, number]>
): SessionSet {
  const poolLength = input.avail.pool;
  
  return {
    label: 'Main (Endurance)',
    reps: poolLength === 25 ? 10 : 8,
    distance: poolLength * 2,
    paceNote: `@ ${formatPace(zones.Z2[1])} (Z2)`,
    restSec: 15,
    stroke: input.stroke,
    methodId: method.id,
    cues: ['일정한 페이스', '지구력 유지', '기술 유지']
  };
}

function createDefaultSet(
  method: TrainingMethod, 
  input: UserInput, 
  css: number, 
  zones: Record<Zone, [number, number]>
): SessionSet {
  const poolLength = input.avail.pool;
  
  return {
    label: 'Main',
    reps: poolLength === 25 ? 6 : 4,
    distance: poolLength * 2,
    paceNote: `@ ${formatPace(zones.Z2[1])} (Z2)`,
    restSec: 20,
    stroke: input.stroke,
    methodId: method.id,
    cues: ['일정한 페이스', '기술 유지']
  };
}

function createCooldownSet(input: UserInput, css: number, zones: Record<Zone, [number, number]>): SessionSet {
  const poolLength = input.avail.pool;
  const reps = poolLength === 25 ? 4 : 2;
  const distance = poolLength;
  
  return {
    label: 'Cool-down',
    reps,
    distance,
    paceNote: `@ ${formatPace(zones.Z1[1])} (Z1)`,
    restSec: 15,
    stroke: input.stroke,
    cues: ['편안한 속도', '회복에 집중', '스트레칭']
  };
}

function getMethodDistribution(goal: string, availableMethods: TrainingMethod[]): TrainingMethod[] {
  switch (goal) {
    case 'fatloss':
      return availableMethods.filter(m => 
        ['aerobic_en1', 'aerobic_en2', 'endurance', 'recovery'].includes(m.id)
      );
    case 'endurance':
      return availableMethods.filter(m => 
        ['aerobic_en2', 'threshold', 'endurance', 'recovery'].includes(m.id)
      );
    case 'performance':
      return availableMethods.filter(m => 
        ['threshold', 'vo2max', 'sprint', 'skills', 'technique'].includes(m.id)
      );
    default:
      return availableMethods.filter(m => 
        ['aerobic_en1', 'aerobic_en2', 'technique', 'recovery'].includes(m.id)
      );
  }
}

function calculateZoneDistribution(sessions: SessionPlan[]): Record<Zone, number> {
  const zoneDist: Record<Zone, number> = {
    Z1: 0,
    Z2: 0,
    Z3: 0,
    Z4: 0,
    Z5: 0
  };
  
  sessions.forEach(session => {
    session.sets.forEach(set => {
      const meters = set.reps * set.distance;
      if (set.paceNote.includes('Z1')) zoneDist.Z1 += meters;
      else if (set.paceNote.includes('Z2')) zoneDist.Z2 += meters;
      else if (set.paceNote.includes('Z3')) zoneDist.Z3 += meters;
      else if (set.paceNote.includes('Z4')) zoneDist.Z4 += meters;
      else if (set.paceNote.includes('Z5')) zoneDist.Z5 += meters;
    });
  });
  
  return zoneDist;
}










