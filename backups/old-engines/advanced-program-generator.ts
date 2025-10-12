/**
 * 고급 수영 프로그램 생성기
 * 
 * 연동되는 데이터:
 * - CSS (Critical Swim Speed) - 영법별 페이스 기준
 * - PRE (Perceived Rate of Exertion) - 운동 강도 기준
 * - 수영 엔진 로직 (swim-training-engine)
 * - 훈련법과 드릴 라이브러리
 * 
 * 연동되는 파일:
 * - client/swim-training-engine/src/types.ts
 * - client/swim-training-engine/src/pace.ts
 * - client/swim-training-engine/src/training_methods.ts
 * - client/swim-training-engine/src/drills.ts
 */

export interface EquipmentType {
  id: string;
  name: string;
  purpose: string;
  modifier: number; // 페이스 조정 계수 (1.2 = 20% 느려짐)
}

export const EQUIPMENT: EquipmentType[] = [
  { id: 'kickboard', name: '킥보드', purpose: '발차기 훈련', modifier: 1.5 },
  { id: 'pullbuoy', name: '풀부이', purpose: '팔 훈련', modifier: 1.2 },
  { id: 'paddle', name: '패들', purpose: '파워 향상', modifier: 1.15 },
  { id: 'fins', name: '핀', purpose: '발목 유연성', modifier: 0.9 },
  { id: 'snorkel', name: '스노클', purpose: '호흡 제거', modifier: 1.1 },
  { id: 'resistance_band', name: '저항밴드', purpose: '저항 훈련', modifier: 1.3 }
];

export interface SessionBlock {
  type: '워밍업' | '드릴 세트' | '메인 세트' | '스피드 세트' | '지구력 세트' | '기술 세트' | '쿨다운';
  subtype?: '팔' | '발차기' | '콤비네이션' | '스피드' | '지구력'; // 세분화
  stroke: string;
  strokeName: string;
  sets?: number; // 반복 횟수 (예: 8×100m의 8)
  repsDistance?: number; // 반복 거리 (예: 8×100m의 100)
  totalDistance: number; // 총 거리
  duration: number; // 예상 시간 (분)
  pace: number; // 페이스 (초/100m) - CSS 기반
  rpe: number; // RPE (1-10) - 컨디션 기반
  restSec: number; // 세트 간 휴식 시간 (초)
  equipment: string[]; // 사용 장비
  description: string; // 설명
  method?: string; // 훈련법
  drill?: string; // 드릴명
  cues?: string[]; // 코칭 포인트
}

export interface TrainingGoalConfig {
  warmupRatio: number; // 워밍업 비율
  mainRatio: number; // 메인 비율
  cooldownRatio: number; // 쿨다운 비율
  drillRatio: number; // 드릴 비율
  speedRatio: number; // 스피드 비율
  enduranceRatio: number; // 지구력 비율
  targetRPE: number; // 목표 RPE
  restMultiplier: number; // 휴식 시간 배수
}

export const GOAL_CONFIGS: Record<string, TrainingGoalConfig> = {
  '기술 연마': {
    warmupRatio: 0.2,
    mainRatio: 0.6,
    cooldownRatio: 0.2,
    drillRatio: 0.6,
    speedRatio: 0.1,
    enduranceRatio: 0.3,
    targetRPE: 5,
    restMultiplier: 1.2
  },
  '실력 향상': {
    warmupRatio: 0.2,
    mainRatio: 0.6,
    cooldownRatio: 0.2,
    drillRatio: 0.3,
    speedRatio: 0.4,
    enduranceRatio: 0.3,
    targetRPE: 7,
    restMultiplier: 1.5
  },
  '체력 향상': {
    warmupRatio: 0.15,
    mainRatio: 0.7,
    cooldownRatio: 0.15,
    drillRatio: 0.2,
    speedRatio: 0.2,
    enduranceRatio: 0.6,
    targetRPE: 6,
    restMultiplier: 1.0
  },
  '체중 감량': {
    warmupRatio: 0.2,
    mainRatio: 0.6,
    cooldownRatio: 0.2,
    drillRatio: 0.2,
    speedRatio: 0.1,
    enduranceRatio: 0.7,
    targetRPE: 5,
    restMultiplier: 0.8
  },
  '재활': {
    warmupRatio: 0.3,
    mainRatio: 0.4,
    cooldownRatio: 0.3,
    drillRatio: 0.6,
    speedRatio: 0,
    enduranceRatio: 0.4,
    targetRPE: 3,
    restMultiplier: 2.0
  },
  '스트레스 해소': {
    warmupRatio: 0.25,
    mainRatio: 0.5,
    cooldownRatio: 0.25,
    drillRatio: 0.3,
    speedRatio: 0,
    enduranceRatio: 0.7,
    targetRPE: 4,
    restMultiplier: 1.5
  }
};

/**
 * 컨디션 기반 RPE 및 페이스 조정
 */
export function adjustForCondition(
  baseRPE: number,
  basePace: number,
  condition: string,
  hasPain: boolean
): { rpe: number; pace: number } {
  let rpeAdjustment = 0;
  let paceAdjustment = 0;

  // 컨디션 기반 조정
  switch (condition) {
    case '매우 좋음':
      rpeAdjustment = +1;
      paceAdjustment = -5; // 5초 빠르게
      break;
    case '좋음':
      rpeAdjustment = 0;
      paceAdjustment = 0;
      break;
    case '보통':
      rpeAdjustment = 0;
      paceAdjustment = +5; // 5초 느리게
      break;
    case '피곤함':
      rpeAdjustment = -1;
      paceAdjustment = +10; // 10초 느리게
      break;
    case '매우 피곤함':
      rpeAdjustment = -2;
      paceAdjustment = +15; // 15초 느리게
      break;
  }

  // 통증 있으면 추가 조정
  if (hasPain) {
    rpeAdjustment -= 1;
    paceAdjustment += 10;
  }

  const adjustedRPE = Math.max(1, Math.min(10, baseRPE + rpeAdjustment));
  const adjustedPace = basePace + paceAdjustment;

  return { rpe: adjustedRPE, pace: adjustedPace };
}

/**
 * RPE 기반 휴식 시간 계산
 */
export function calculateRestTime(rpe: number, distance: number): number {
  // RPE가 높을수록 더 긴 휴식
  const baseRest = rpe >= 8 ? 45 : rpe >= 7 ? 30 : rpe >= 6 ? 20 : rpe >= 5 ? 15 : 10;
  
  // 거리가 길수록 휴식 증가
  const distanceFactor = Math.max(1, distance / 100);
  
  return Math.round(baseRest * distanceFactor);
}

/**
 * 워밍업 생성
 */
export function generateWarmup(
  duration: number,
  pool: number,
  condition: string,
  hasPain: boolean
): SessionBlock {
  const basePace = 200; // 200초/100m (매우 느림)
  const { rpe, pace } = adjustForCondition(3, basePace, condition, hasPain);
  
  const distance = Math.round((duration * 60) / (pace / 100));
  const adjustedDistance = Math.round(distance / pool) * pool;

  return {
    type: '워밍업',
    stroke: 'elementary_backstroke',
    strokeName: '기본배영',
    totalDistance: adjustedDistance,
    duration: duration,
    pace: pace,
    rpe: rpe,
    restSec: 0,
    equipment: [],
    description: `${duration}분 가벼운 워밍업 (RPE ${rpe})`,
    cues: ['편안하게 수영하세요', '호흡에 집중하세요', '몸을 풀어주세요']
  };
}

/**
 * 쿨다운 생성
 */
export function generateCooldown(
  duration: number,
  pool: number,
  condition: string,
  hasPain: boolean
): SessionBlock {
  const basePace = 220; // 220초/100m (매우 느림)
  const { rpe, pace } = adjustForCondition(2, basePace, condition, hasPain);
  
  const distance = Math.round((duration * 60) / (pace / 100));
  const adjustedDistance = Math.round(distance / pool) * pool;

  return {
    type: '쿨다운',
    stroke: 'elementary_backstroke',
    strokeName: '기본배영',
    totalDistance: adjustedDistance,
    duration: duration,
    pace: pace,
    rpe: rpe,
    restSec: 0,
    equipment: [],
    description: `${duration}분 쿨다운 (RPE ${rpe})`,
    cues: ['매우 천천히 수영하세요', '긴장을 풀어주세요', '깊게 호흡하세요']
  };
}

/**
 * 기술 연마 세트 생성 (팔/발차기/콤비네이션 세분화)
 */
export function generateTechniqueSet(
  duration: number,
  stroke: string,
  strokeName: string,
  css: number,
  pool: number,
  condition: string,
  hasPain: boolean
): SessionBlock[] {
  const blocks: SessionBlock[] = [];
  const baseRPE = 5;
  
  // 1. 팔 드릴 (40% 시간)
  const pullTime = Math.round(duration * 0.4);
  const pullPace = css * 1.2; // CSS보다 20% 느리게
  const { rpe: pullRPE, pace: adjustedPullPace } = adjustForCondition(baseRPE, pullPace, condition, hasPain);
  const pullDistance = Math.round((pullTime * 60) / (adjustedPullPace / 100));
  const adjustedPullDistance = Math.round(pullDistance / pool) * pool;
  
  blocks.push({
    type: '기술 세트',
    subtype: '팔',
    stroke: stroke,
    strokeName: strokeName,
    sets: Math.floor(adjustedPullDistance / 100),
    repsDistance: 100,
    totalDistance: adjustedPullDistance,
    duration: pullTime,
    pace: adjustedPullPace,
    rpe: pullRPE,
    restSec: calculateRestTime(pullRPE, 100),
    equipment: ['풀부이'],
    description: `${strokeName} 팔 드릴 ${Math.floor(adjustedPullDistance / 100)}×100m (풀부이)`,
    drill: '팔 집중 훈련',
    cues: ['캐치 감각에 집중', '엘보우 높게 유지', '회전력 활용']
  });

  // 2. 발차기 드릴 (30% 시간)
  const kickTime = Math.round(duration * 0.3);
  const kickPace = css * 1.5; // CSS보다 50% 느리게
  const { rpe: kickRPE, pace: adjustedKickPace } = adjustForCondition(baseRPE, kickPace, condition, hasPain);
  const kickDistance = Math.round((kickTime * 60) / (adjustedKickPace / 100));
  const adjustedKickDistance = Math.round(kickDistance / pool) * pool;
  
  blocks.push({
    type: '기술 세트',
    subtype: '발차기',
    stroke: stroke,
    strokeName: strokeName,
    sets: Math.floor(adjustedKickDistance / 50),
    repsDistance: 50,
    totalDistance: adjustedKickDistance,
    duration: kickTime,
    pace: adjustedKickPace,
    rpe: kickRPE,
    restSec: calculateRestTime(kickRPE, 50),
    equipment: ['킥보드'],
    description: `${strokeName} 발차기 ${Math.floor(adjustedKickDistance / 50)}×50m (킥보드)`,
    drill: '킥 집중 훈련',
    cues: ['발목을 부드럽게', '무릎 과신전 주의', '리듬 유지']
  });

  // 3. 콤비네이션 (30% 시간)
  const comboTime = duration - pullTime - kickTime;
  const { rpe: comboRPE, pace: adjustedComboPace } = adjustForCondition(baseRPE, css, condition, hasPain);
  const comboDistance = Math.round((comboTime * 60) / (adjustedComboPace / 100));
  const adjustedComboDistance = Math.round(comboDistance / pool) * pool;
  
  blocks.push({
    type: '기술 세트',
    subtype: '콤비네이션',
    stroke: stroke,
    strokeName: strokeName,
    sets: Math.floor(adjustedComboDistance / 100),
    repsDistance: 100,
    totalDistance: adjustedComboDistance,
    duration: comboTime,
    pace: adjustedComboPace,
    rpe: comboRPE,
    restSec: calculateRestTime(comboRPE, 100),
    equipment: [],
    description: `${strokeName} 완성 수영 ${Math.floor(adjustedComboDistance / 100)}×100m (기술 중심)`,
    cues: ['팔과 킥의 조화', '타이밍 맞추기', '효율적인 스트로크']
  });

  return blocks;
}

/**
 * 스피드 향상 세트 생성
 */
export function generateSpeedSet(
  duration: number,
  stroke: string,
  strokeName: string,
  css: number,
  pool: number,
  condition: string,
  hasPain: boolean
): SessionBlock[] {
  const blocks: SessionBlock[] = [];
  const baseRPE = 8; // 고강도
  
  // 스피드 인터벌 (CSS보다 10초 빠르게)
  const speedPace = css - 10;
  const { rpe: speedRPE, pace: adjustedSpeedPace } = adjustForCondition(baseRPE, speedPace, condition, hasPain);
  
  // 인터벌 세트 수 계산 (3분당 1세트)
  const intervalCount = Math.max(3, Math.floor(duration / 3));
  const timePerInterval = Math.floor(duration / intervalCount);
  
  for (let i = 0; i < intervalCount; i++) {
    const intervalDistance = Math.round((timePerInterval * 60) / (adjustedSpeedPace / 100));
    const adjustedDistance = Math.round(intervalDistance / 50) * 50; // 50m 단위
    
    blocks.push({
      type: '스피드 세트',
      stroke: stroke,
      strokeName: strokeName,
      sets: Math.floor(adjustedDistance / 50),
      repsDistance: 50,
      totalDistance: adjustedDistance,
      duration: timePerInterval,
      pace: adjustedSpeedPace,
      rpe: speedRPE,
      restSec: calculateRestTime(speedRPE, 50),
      equipment: i % 2 === 0 ? ['패들'] : [], // 교대로 패들 사용
      description: `${strokeName} 스피드 인터벌 ${i + 1}/${intervalCount} (${Math.floor(adjustedDistance / 50)}×50m)`,
      method: '스피드 훈련',
      cues: ['최대 속도의 85-90%', '회복은 충분히', '폼 유지']
    });
  }

  return blocks;
}

/**
 * 지구력 세트 생성
 */
export function generateEnduranceSet(
  duration: number,
  stroke: string,
  strokeName: string,
  css: number,
  pool: number,
  condition: string,
  hasPain: boolean
): SessionBlock[] {
  const blocks: SessionBlock[] = [];
  const baseRPE = 6;
  
  const { rpe, pace: adjustedPace } = adjustForCondition(baseRPE, css, condition, hasPain);
  
  // 지속 수영 세트 (8분당 1세트)
  const setCount = Math.max(2, Math.floor(duration / 8));
  const timePerSet = Math.floor(duration / setCount);
  
  for (let i = 0; i < setCount; i++) {
    const setDistance = Math.round((timePerSet * 60) / (adjustedPace / 100));
    const adjustedDistance = Math.round(setDistance / 100) * 100; // 100m 단위
    
    blocks.push({
      type: '지구력 세트',
      stroke: stroke,
      strokeName: strokeName,
      sets: Math.floor(adjustedDistance / 200),
      repsDistance: 200,
      totalDistance: adjustedDistance,
      duration: timePerSet,
      pace: adjustedPace,
      rpe: rpe,
      restSec: calculateRestTime(rpe, 200),
      equipment: [],
      description: `${strokeName} 지속 수영 ${i + 1}/${setCount} (${Math.floor(adjustedDistance / 200)}×200m)`,
      method: '지구력 훈련',
      cues: ['일정한 페이스 유지', '효율적인 호흡', '긴 스트로크']
    });
  }

  return blocks;
}

/**
 * 고급 프로그램 생성 (CSS + PRE 기반)
 */
export function generateAdvancedProgram(params: {
  sessionDuration: number;
  strokes: string[];
  strokeCSS: Record<string, number>;
  goal: string;
  condition: string;
  hasPain: boolean;
  pool: number;
}): SessionBlock[] {
  const { sessionDuration, strokes, strokeCSS, goal, condition, hasPain, pool } = params;
  const blocks: SessionBlock[] = [];
  
  // 목표별 설정 가져오기
  const config = GOAL_CONFIGS[goal] || GOAL_CONFIGS['체력 향상'];
  
  // 1. 워밍업
  const warmupTime = Math.round(sessionDuration * config.warmupRatio);
  blocks.push(generateWarmup(warmupTime, pool, condition, hasPain));
  
  // 2. 메인 세트
  const mainTime = Math.round(sessionDuration * config.mainRatio);
  const timePerStroke = Math.floor(mainTime / strokes.length);
  
  strokes.forEach((stroke, idx) => {
    const css = strokeCSS[stroke] || 100;
    const strokeName = {
      FR: '자유형', BK: '배영', BR: '평영', FL: '접영',
      IM: '개인혼영', elementary_backstroke: '기본배영', sidestroke: '측영'
    }[stroke] || stroke;
    
    // 드릴/스피드/지구력 비율에 따라 세트 생성
    const drillTime = Math.round(timePerStroke * config.drillRatio);
    const speedTime = Math.round(timePerStroke * config.speedRatio);
    const enduranceTime = timePerStroke - drillTime - speedTime;
    
    // 기술 드릴
    if (drillTime > 0) {
      blocks.push(...generateTechniqueSet(drillTime, stroke, strokeName, css, pool, condition, hasPain));
    }
    
    // 스피드 세트
    if (speedTime > 0) {
      blocks.push(...generateSpeedSet(speedTime, stroke, strokeName, css, pool, condition, hasPain));
    }
    
    // 지구력 세트
    if (enduranceTime > 0) {
      blocks.push(...generateEnduranceSet(enduranceTime, stroke, strokeName, css, pool, condition, hasPain));
    }
  });
  
  // 3. 쿨다운
  const cooldownTime = Math.round(sessionDuration * config.cooldownRatio);
  blocks.push(generateCooldown(cooldownTime, pool, condition, hasPain));
  
  return blocks;
}



