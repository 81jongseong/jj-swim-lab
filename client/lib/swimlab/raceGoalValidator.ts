/**
 * 🎯 대회 목표 기록 실현 가능성 검증 모듈
 * 
 * 과학적 근거:
 * 1. 초급자 (0-6개월): 주당 2-5% 향상 가능 (신경계 적응)
 * 2. 중급자 (6-12개월): 주당 1-2% 향상 가능 (체력 적응)
 * 3. 상급자 (1-3년): 주당 0.5-1% 향상 가능 (세부 조정)
 * 4. 엘리트 (3년+): 주당 0.1-0.5% 향상 가능 (한계 근접)
 * 
 * 참고:
 * - Bompa & Haff (2009) - Periodization: Theory and Methodology of Training
 * - Maglischo (2003) - Swimming Fastest
 * - USA Swimming - Age Group Development Guidelines
 * - 테이퍼 효과: 최종 2주 -20~40% 볼륨 시 2-3% 추가 향상
 * 
 * @module raceGoalValidator
 */

export type SwimmerLevel = 'beginner' | 'intermediate' | 'advanced' | 'advanced_1' | 'advanced_2' | 'master' | 'expert';
export type TrainingWeeks = number; // 훈련 주 수
export type Distance = 50 | 100 | 200 | 400 | 800 | 1500;
export type Stroke = 'freestyle' | 'backstroke' | 'breaststroke' | 'butterfly';

export interface CurrentPerformance {
  distance: Distance;
  stroke: Stroke;
  currentTime: number; // 현재 기록 (초)
  level: SwimmerLevel;
}

export interface RaceGoal {
  distance: Distance;
  stroke: Stroke;
  targetTime: number; // 목표 기록 (초)
  raceDate: string; // 대회 날짜 (ISO format)
}

export interface ValidationResult {
  isRealistic: boolean;
  confidence: 'high' | 'medium' | 'low' | 'unrealistic';
  improvementNeeded: number; // 필요한 향상률 (%)
  maxRealisticImprovement: number; // 최대 현실적 향상률 (%)
  recommendedTarget: number; // 권장 목표 기록 (초)
  weeksAvailable: number;
  message: string;
  detailedExplanation: string;
}

/**
 * 레벨별 주간 향상률 범위 (%)
 */
const WEEKLY_IMPROVEMENT_RATES: Record<SwimmerLevel, { min: number; max: number }> = {
  beginner: { min: 2.0, max: 5.0 },         // 초급: 신경계 적응
  intermediate: { min: 1.0, max: 2.0 },     // 중급: 체력 적응
  advanced: { min: 0.5, max: 1.0 },         // 상급: 세부 조정
  advanced_1: { min: 0.5, max: 1.0 },
  advanced_2: { min: 0.4, max: 0.8 },
  master: { min: 0.3, max: 0.6 },          // 마스터: 한계 근접
  expert: { min: 0.1, max: 0.5 }           // 전문가: 최소 향상
};

/**
 * 테이퍼 효과 (최종 2주)
 */
const TAPER_BONUS = 0.02; // 2% 추가 향상

/**
 * 거리별 난이도 계수
 * 짧은 거리는 기록 향상이 더 어려움 (기술적 정밀도 요구)
 */
const DISTANCE_DIFFICULTY: Record<Distance, number> = {
  50: 1.2,   // 가장 어려움 (폭발력+기술)
  100: 1.1,
  200: 1.0,  // 기준
  400: 0.95,
  800: 0.9,
  1500: 0.85 // 상대적으로 쉬움 (지구력 중심)
};

/**
 * 영법별 난이도 계수
 */
const STROKE_DIFFICULTY: Record<Stroke, number> = {
  freestyle: 1.0,    // 기준
  backstroke: 1.1,   // 약간 어려움
  breaststroke: 1.15, // 기술적으로 어려움
  butterfly: 1.2     // 가장 어려움 (체력+기술)
};

/**
 * 목표 기록 실현 가능성 검증
 */
export function validateRaceGoal(
  current: CurrentPerformance,
  goal: RaceGoal
): ValidationResult {
  // 1. 훈련 가능 주 수 계산
  const today = new Date();
  const raceDate = new Date(goal.raceDate);
  const daysAvailable = Math.floor((raceDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const weeksAvailable = Math.floor(daysAvailable / 7);

  if (weeksAvailable < 2) {
    return {
      isRealistic: false,
      confidence: 'unrealistic',
      improvementNeeded: 0,
      maxRealisticImprovement: 0,
      recommendedTarget: current.currentTime,
      weeksAvailable,
      message: '⚠️ 대회까지 2주 미만입니다. 현재 기록 유지에 집중하세요.',
      detailedExplanation: '훈련 효과를 보려면 최소 4주 이상의 시간이 필요합니다. 짧은 기간에는 테이퍼와 컨디션 조절에 집중하는 것이 좋습니다.'
    };
  }

  // 2. 필요한 향상률 계산
  const improvementNeeded = ((current.currentTime - goal.targetTime) / current.currentTime) * 100;

  if (improvementNeeded <= 0) {
    return {
      isRealistic: true,
      confidence: 'high',
      improvementNeeded: 0,
      maxRealisticImprovement: 0,
      recommendedTarget: goal.targetTime,
      weeksAvailable,
      message: '✅ 현재 기록이 목표보다 빠릅니다! 목표를 더 높게 설정하세요.',
      detailedExplanation: `현재 기록(${formatTime(current.currentTime)})이 목표 기록(${formatTime(goal.targetTime)})보다 빠릅니다.`
    };
  }

  // 3. 레벨별 최대 향상률 계산
  const weeklyRate = WEEKLY_IMPROVEMENT_RATES[current.level];
  const distanceMultiplier = DISTANCE_DIFFICULTY[goal.distance];
  const strokeMultiplier = STROKE_DIFFICULTY[goal.stroke];
  
  // 조정된 주간 향상률
  const adjustedMinWeekly = weeklyRate.min / (distanceMultiplier * strokeMultiplier);
  const adjustedMaxWeekly = weeklyRate.max / (distanceMultiplier * strokeMultiplier);
  
  // 총 향상률 (테이퍼 포함)
  const minTotalImprovement = (adjustedMinWeekly * weeksAvailable) + (TAPER_BONUS * 100);
  const maxTotalImprovement = (adjustedMaxWeekly * weeksAvailable) + (TAPER_BONUS * 100);

  // 4. 권장 목표 기록 계산 (보수적: 평균 향상률 70% 적용)
  const conservativeImprovement = (minTotalImprovement + maxTotalImprovement) / 2 * 0.7;
  const recommendedTarget = current.currentTime * (1 - conservativeImprovement / 100);

  // 5. 실현 가능성 판단
  let isRealistic = false;
  let confidence: 'high' | 'medium' | 'low' | 'unrealistic';
  let message = '';
  let detailedExplanation = '';

  if (improvementNeeded <= minTotalImprovement * 0.7) {
    // 보수적 최소 향상률 이내
    isRealistic = true;
    confidence = 'high';
    message = '✅ 매우 현실적인 목표입니다! 체계적으로 훈련하면 충분히 달성 가능합니다.';
    detailedExplanation = `${weeksAvailable}주 훈련으로 ${improvementNeeded.toFixed(1)}% 향상은 충분히 가능합니다. 레벨(${getLevelName(current.level)})에서 평균 ${adjustedMinWeekly.toFixed(2)}~${adjustedMaxWeekly.toFixed(2)}%/주 향상이 예상됩니다.`;
  } else if (improvementNeeded <= maxTotalImprovement) {
    // 최대 향상률 이내 (도전적)
    isRealistic = true;
    confidence = 'medium';
    message = '⚡ 도전적이지만 가능한 목표입니다. 일관된 고강도 훈련이 필요합니다.';
    detailedExplanation = `${weeksAvailable}주 훈련으로 ${improvementNeeded.toFixed(1)}% 향상은 가능하지만, 최대 노력이 필요합니다. 주 4~5회 이상 훈련, CSS 기반 고강도 세션, 충분한 회복이 필수입니다.`;
  } else if (improvementNeeded <= maxTotalImprovement * 1.3) {
    // 최대치 초과하지만 근접
    isRealistic = false;
    confidence = 'low';
    message = '⚠️ 매우 어려운 목표입니다. 목표를 조정하거나 대회 날짜를 연기하세요.';
    detailedExplanation = `${improvementNeeded.toFixed(1)}% 향상은 ${weeksAvailable}주에는 매우 어렵습니다 (최대 현실적 향상: ${maxTotalImprovement.toFixed(1)}%). 부상 위험이 높고, 과훈련 증후군이 발생할 수 있습니다. 권장 목표: ${formatTime(recommendedTarget)}`;
  } else {
    // 비현실적
    isRealistic = false;
    confidence = 'unrealistic';
    message = '❌ 비현실적인 목표입니다. 부상 위험이 매우 높습니다.';
    detailedExplanation = `${improvementNeeded.toFixed(1)}% 향상은 ${weeksAvailable}주에는 불가능합니다. 예: 자유형 50m 40초→30초는 25% 향상으로, 엘리트 선수도 수년이 걸립니다. 현실적 목표를 다시 설정하세요. 권장: ${formatTime(recommendedTarget)}`;
  }

  return {
    isRealistic,
    confidence,
    improvementNeeded,
    maxRealisticImprovement: maxTotalImprovement,
    recommendedTarget,
    weeksAvailable,
    message,
    detailedExplanation
  };
}

/**
 * 레벨 이름 한글 변환
 */
function getLevelName(level: SwimmerLevel): string {
  const names: Record<SwimmerLevel, string> = {
    beginner: '초급',
    intermediate: '중급',
    advanced: '상급',
    advanced_1: '상급1',
    advanced_2: '상급2',
    master: '마스터',
    expert: '전문가'
  };
  return names[level] || '중급';
}

/**
 * 시간 포맷 (초 → 분:초.밀리초)
 */
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.round((seconds % 1) * 100);
  
  if (mins > 0) {
    return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  }
  return `${secs}.${ms.toString().padStart(2, '0')}초`;
}

/**
 * 시간 파싱 (문자열 → 초)
 */
export function parseTimeToSeconds(timeStr: string): number {
  // 형식: "1:23.45" 또는 "35.20" 또는 "35.2초"
  const cleaned = timeStr.replace('초', '').trim();
  
  if (cleaned.includes(':')) {
    const [mins, secs] = cleaned.split(':');
    return parseInt(mins) * 60 + parseFloat(secs);
  }
  
  return parseFloat(cleaned);
}

/**
 * 예시 사용법
 */
export function getExampleValidation(): ValidationResult {
  const current: CurrentPerformance = {
    distance: 50,
    stroke: 'freestyle',
    currentTime: 40, // 40초
    level: 'intermediate'
  };

  const goal: RaceGoal = {
    distance: 50,
    stroke: 'freestyle',
    targetTime: 30, // 30초 (25% 향상)
    raceDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString() // 60일 후
  };

  return validateRaceGoal(current, goal);
}






