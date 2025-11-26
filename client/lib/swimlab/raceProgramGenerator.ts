/**
 * 🏊 대회일 기반 프로그램 생성 엔진 (테이퍼 포함)
 * 
 * 과학적 근거:
 * 1. **테이퍼 전략**: 2-3주 전부터 볼륨 40-60% 감소, 빈도·강도 유지
 *    - Bompa & Haff (2009) - Periodization
 *    - Mujika & Padilla (2003) - Scientific basis for precompetition tapering
 *    - USA Swimming Taper Guidelines
 * 
 * 2. **피리어다이제이션**: Base → Build → Peak → Taper → Race
 *    - Bompa - Linear Periodization
 *    - Issurin - Block Periodization
 * 
 * 3. **테이퍼 효과**: 2-3% 추가 기록 향상
 *    - Meta-analysis: 0.5-6% improvement (중간값 ~2%)
 * 
 * 4. **강도 유지**: 테이퍼 중 Z4-Z5 소량 유지 (신경계 활성 유지)
 *    - PubMed - Neuromuscular adaptations
 * 
 * 연동되는 파일:
 * - client/lib/swimlab/engine-v31.ts (주간 프로그램 생성)
 * - client/lib/swimlab/raceGoalFeasibility.ts (목표 검증)
 * - server/src/routes/swim-programs.ts
 */

import { calculateRaceGoalFeasibility, type RaceGoalInput, type FeasibilityResult } from './raceGoalFeasibility';
import { generateWeeklyPlan, type Input as EngineInput, type WeeklyPlan } from './engine-v31';
import { logger } from '@/lib/logger';

export type TrainingPhase = 'base' | 'build' | 'peak' | 'taper' | 'race';

export interface RaceProgramInput {
  // 대회 정보
  raceDate: string; // ISO format
  raceEvent: {
    distance: 50 | 100 | 200 | 400 | 800 | 1500;
    stroke: 'freestyle' | 'backstroke' | 'breaststroke' | 'butterfly';
  };
  
  // 현재 & 목표 기록
  currentTime: number; // 초
  targetTime: number; // 초
  
  // 선수 정보
  athleteInfo: {
    level: 'novice' | 'trained' | 'elite';
    css: Record<string, number>; // 영법별 CSS (100m당 초)
    mainStrokes: string[];
    excludedStrokes?: string[];
    conditionIds?: string[];
  };
  
  // 훈련 가능 환경
  trainingSchedule: {
    daysPerWeek: number;
    selectedDays: number[]; // 0(일)~6(토)
    sessionDuration: number; // 분
    poolLength: 25 | 50;
  };
  
  // 훈련 이력 (선택)
  history?: {
    completionRate: number;
    avgRPE?: number;
    recentInjury?: boolean;
  };
}

export interface RaceProgramOutput {
  // 실현 가능성 분석
  feasibility: FeasibilityResult;
  
  // 페이즈별 프로그램
  phases: PhaseProgram[];
  
  // 전체 요약
  summary: {
    totalWeeks: number;
    baseWeeks: number;
    buildWeeks: number;
    peakWeeks: number;
    taperWeeks: number;
    totalDistance: number; // 총 예상 거리 (m)
    peakVolume: number; // 피크 주간 거리 (m)
    taperVolume: number; // 테이퍼 주간 거리 (m)
  };
  
  // 권장 사항
  recommendations: string[];
  evidenceKeys: string[];
}

export interface PhaseProgram {
  phase: TrainingPhase;
  weekStart: number; // 1-based
  weekEnd: number;
  focus: string;
  weeklyPlans: WeeklyPlan[];
  volumeTarget: number; // 주간 목표 거리 (m)
  intensityDistribution: {
    z1: number; // %
    z2: number;
    z3: number;
    z4: number;
    z5: number;
  };
}

/**
 * 페이즈별 볼륨 비율 (피크 대비)
 */
const PHASE_VOLUME_RATIOS = {
  base: 0.7,    // 70% (지구력 기반)
  build: 0.85,  // 85% (점진 증가)
  peak: 1.0,    // 100% (최대 볼륨)
  taper: 0.5    // 50% (40-60% 권장)
};

/**
 * 페이즈별 강도 분포 (%)
 */
const PHASE_INTENSITY_DISTRIBUTION = {
  base: { z1: 60, z2: 25, z3: 10, z4: 5, z5: 0 },
  build: { z1: 40, z2: 30, z3: 20, z4: 8, z5: 2 },
  peak: { z1: 30, z2: 25, z3: 25, z4: 15, z5: 5 },
  taper: { z1: 40, z2: 20, z3: 15, z4: 20, z5: 5 } // 강도 유지, 볼륨만 감소
};

/**
 * 대회 기반 프로그램 생성 (Main Function)
 */
export function generateRaceProgram(input: RaceProgramInput): RaceProgramOutput {
  const evidenceKeys = [
    'Bompa & Haff (2009) - Periodization',
    'Mujika & Padilla (2003) - Tapering strategies',
    'USA Swimming - Taper guidelines',
    'PubMed - Neuromuscular adaptations'
  ];
  
  // === Step 1: 실현 가능성 검증 ===
  const today = new Date();
  const raceDate = new Date(input.raceDate);
  const totalDays = Math.floor((raceDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const totalWeeks = Math.floor(totalDays / 7);
  
  const feasibilityInput: RaceGoalInput = {
    event: input.raceEvent,
    T_now: input.currentTime,
    T_goal: input.targetTime,
    weeks: totalWeeks,
    CS: input.athleteInfo.css[input.raceEvent.stroke === 'freestyle' ? '자유형' : 
         input.raceEvent.stroke === 'backstroke' ? '배영' :
         input.raceEvent.stroke === 'breaststroke' ? '평영' : '접영'],
    cssType: 'sec_per_100m',
    history: input.history ? {
      completionRate: input.history.completionRate,
      avgRPE: input.history.avgRPE,
      injuryFlag: input.history.recentInjury
    } : undefined,
    level: input.athleteInfo.level,
    constraints: {
      conditionIds: input.athleteInfo.conditionIds || [],
      impactScore: (input.athleteInfo.conditionIds?.length || 0) * 2
    },
    trainingVolume: {
      sessionsPerWeek: input.trainingSchedule.daysPerWeek,
      minutesPerSession: input.trainingSchedule.sessionDuration
    }
  };
  
  const feasibility = calculateRaceGoalFeasibility(feasibilityInput);
  
  // === Step 2: 페이즈 배분 결정 ===
  const phaseAllocation = allocatePhases(totalWeeks, input.athleteInfo.level);
  
  // === Step 3: 피크 볼륨 계산 ===
  const peakVolume = calculatePeakVolume(
    input.trainingSchedule.daysPerWeek,
    input.trainingSchedule.sessionDuration,
    input.athleteInfo.level,
    input.raceEvent.distance
  );
  
  // === Step 4: 페이즈별 프로그램 생성 ===
  const phases: PhaseProgram[] = [];
  let currentWeek = 1;
  
  for (const [phase, weeks] of Object.entries(phaseAllocation)) {
    if (weeks === 0) continue;
    
    const phaseType = phase as TrainingPhase;
    const volumeRatio = PHASE_VOLUME_RATIOS[phaseType];
    const phaseVolume = peakVolume * volumeRatio;
    
    const weeklyPlans: WeeklyPlan[] = [];
    
    for (let i = 0; i < weeks; i++) {
      // 엔진 v3.1로 주간 계획 생성
      const weekVolume = calculateWeekVolume(phaseVolume, phaseType, i, weeks);
      
      // 레벨 변환: novice/trained/elite → beginner/intermediate/advanced
      const levelMap: Record<string, string> = {
        'novice': 'beginner',
        'trained': 'intermediate',
        'elite': 'advanced'
      };
      
      const engineInput: EngineInput = {
        startDate: addWeeks(today, currentWeek - 1).toISOString().split('T')[0],
        days: input.trainingSchedule.selectedDays.map(d => 
          ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d]) as any,
        weeklyMinutes: input.trainingSchedule.sessionDuration * input.trainingSchedule.daysPerWeek,
        weeklyMeters: weekVolume,
        poolLen: input.trainingSchedule.poolLength as any,
        strokesAllowed: input.athleteInfo.mainStrokes.map(convertStrokeKorToEng) as any,
        strokesAvoid: (input.athleteInfo.excludedStrokes || []).map(convertStrokeKorToEng),
        css100: input.athleteInfo.css,
        conditionIds: (input.athleteInfo.conditionIds || []) as any,
        dayCondition: 'normal' as any,
        hasPain: false,
        goal: getGoalByPhase(phaseType, input.raceEvent.distance),
        level: levelMap[input.athleteInfo.level] || 'intermediate',
        weekHistory: []
      };
      
      const weekPlan = generateWeeklyPlan(engineInput);
      weeklyPlans.push(weekPlan);
      
      currentWeek++;
    }
    
    logger.debug(`${phaseType} 페이즈 생성 완료`, {
      weekStart: currentWeek - weeks,
      weekEnd: currentWeek - 1,
      totalWeeks: weeks,
      generatedWeeklyPlans: weeklyPlans.length,
      weeklyPlansPreview: weeklyPlans.map(w => ({
        goal: w.goal,
        daysCount: w.days.length
      }))
    });
    
    phases.push({
      phase: phaseType,
      weekStart: currentWeek - weeks,
      weekEnd: currentWeek - 1,
      focus: getPhaseFocus(phaseType),
      weeklyPlans,
      volumeTarget: phaseVolume,
      intensityDistribution: PHASE_INTENSITY_DISTRIBUTION[phaseType]
    });
  }
  
  // === Step 5: 요약 및 권장사항 ===
  const totalDistance = phases.reduce((sum, p) => 
    sum + p.weeklyPlans.reduce((s, w) => 
      s + w.days.reduce((d, day) => d + day.totalMeters, 0), 0), 0);
  
  const recommendations = generateRecommendations(feasibility, phaseAllocation, input);
  
  return {
    feasibility,
    phases,
    summary: {
      totalWeeks,
      baseWeeks: phaseAllocation.base,
      buildWeeks: phaseAllocation.build,
      peakWeeks: phaseAllocation.peak,
      taperWeeks: phaseAllocation.taper,
      totalDistance,
      peakVolume,
      taperVolume: peakVolume * PHASE_VOLUME_RATIOS.taper
    },
    recommendations,
    evidenceKeys
  };
}

/**
 * 페이즈 배분 (총 주 수에 따라)
 */
function allocatePhases(totalWeeks: number, level: 'novice' | 'trained' | 'elite'): Record<TrainingPhase, number> {
  // 테이퍼는 레벨별로 다름
  const taperWeeks = level === 'novice' ? 1 : level === 'trained' ? 2 : 3;
  
  if (totalWeeks < 4) {
    // 짧은 기간: 테이퍼만
    return { base: 0, build: 0, peak: Math.max(0, totalWeeks - 1), taper: 1, race: 0 };
  } else if (totalWeeks <= 8) {
    // 중간 기간: Build + Peak + Taper
    const remaining = totalWeeks - taperWeeks;
    return {
      base: 0,
      build: Math.floor(remaining * 0.6),
      peak: Math.ceil(remaining * 0.4),
      taper: taperWeeks,
      race: 0
    };
  } else if (totalWeeks <= 16) {
    // 표준 기간: Base + Build + Peak + Taper
    const remaining = totalWeeks - taperWeeks;
    return {
      base: Math.floor(remaining * 0.4),
      build: Math.floor(remaining * 0.35),
      peak: Math.ceil(remaining * 0.25),
      taper: taperWeeks,
      race: 0
    };
  } else {
    // 장기 기간: 비율 조정
    const remaining = totalWeeks - taperWeeks;
    return {
      base: Math.floor(remaining * 0.45),
      build: Math.floor(remaining * 0.35),
      peak: Math.ceil(remaining * 0.2),
      taper: taperWeeks,
      race: 0
    };
  }
}

/**
 * 피크 볼륨 계산
 */
function calculatePeakVolume(
  daysPerWeek: number,
  minutesPerSession: number,
  level: 'novice' | 'trained' | 'elite',
  raceDistance: number
): number {
  // 기본 볼륨 (m/주)
  const baseVolumePerWeek: Record<string, number> = {
    novice: 3000,
    trained: 5000,
    elite: 8000
  };
  
  let volume = baseVolumePerWeek[level];
  
  // 빈도 보정 (주 3회 기준)
  volume *= (daysPerWeek / 3);
  
  // 세션 길이 보정 (60분 기준)
  volume *= (minutesPerSession / 60);
  
  // 레이스 거리 보정
  if (raceDistance <= 100) {
    volume *= 0.9; // 스프린트는 볼륨↓, 강도↑
  } else if (raceDistance >= 800) {
    volume *= 1.2; // 장거리는 볼륨↑
  }
  
  return Math.round(volume);
}

/**
 * 주차별 볼륨 계산 (페이즈 내 변동)
 */
function calculateWeekVolume(
  phaseVolume: number,
  phase: TrainingPhase,
  weekIndex: number,
  totalWeeksInPhase: number
): number {
  if (phase === 'taper') {
    // 테이퍼: 지수 감소 (1주차 60%, 2주차 50%, 3주차 40%)
    const taperCurve = [0.6, 0.5, 0.4];
    return Math.round(phaseVolume * (taperCurve[weekIndex] || 0.4));
  } else if (phase === 'base' || phase === 'build') {
    // Base/Build: 점진 증가 (90% → 100%)
    const progress = weekIndex / totalWeeksInPhase;
    return Math.round(phaseVolume * (0.9 + progress * 0.1));
  } else {
    // Peak: 일정
    return Math.round(phaseVolume);
  }
}

/**
 * 페이즈별 목표 설정
 */
function getGoalByPhase(phase: TrainingPhase, raceDistance: number): string {
  if (phase === 'base') {
    return raceDistance <= 200 ? '기술 연마' : '체력 향상';
  } else if (phase === 'build') {
    return raceDistance <= 100 ? '실력 향상' : '체력 향상';
  } else if (phase === 'peak') {
    return '실력 향상';
  } else { // taper
    return '기술 연마'; // 회복 + 기술 유지
  }
}

/**
 * 페이즈 설명
 */
function getPhaseFocus(phase: TrainingPhase): string {
  const focuses: Record<TrainingPhase, string> = {
    base: '지구력 기반 구축 (70% 볼륨, Z1-Z2 중심)',
    build: '볼륨 증가 + 역치 강화 (85% 볼륨, Z2-Z3)',
    peak: '최대 볼륨 + 레이스 페이스 (100% 볼륨, Z3-Z4)',
    taper: '볼륨 감소 + 강도 유지 (50% 볼륨, Z4 소량)',
    race: '대회 당일'
  };
  return focuses[phase];
}

/**
 * 권장사항 생성
 */
function generateRecommendations(
  feasibility: FeasibilityResult,
  phases: Record<TrainingPhase, number>,
  input: RaceProgramInput
): string[] {
  const recs: string[] = [];
  
  // 실현 가능성 기반
  if (feasibility.grade === 'unrealistic' || feasibility.grade === 'unlikely') {
    recs.push(`⚠️ 목표 기록 재조정 권장: ${formatTime(feasibility.recommendedTarget.time)}`);
  }
  
  // 페이즈별
  if (phases.taper >= 2) {
    recs.push('✅ 2주 이상 테이퍼 확보 → 최적의 컨디션 조성 가능');
  } else {
    recs.push('⚠️ 테이퍼 기간 부족 → 가능하면 대회 1-2주 연기 권장');
  }
  
  // CSS 기반
  if (feasibility.cssAnalysis && feasibility.cssAnalysis.deltaCS_pct > 5) {
    recs.push(`🎯 CSS 개선 집중: 역치 인터벌 (주 2-3회) 필수`);
  }
  
  // 훈련 빈도
  if (input.trainingSchedule.daysPerWeek < 4) {
    recs.push('⚠️ 훈련 빈도 부족: 주 4-5회 이상 권장');
  }
  
  // 완료율
  if (input.history && input.history.completionRate < 80) {
    recs.push('⚠️ 완료율 개선 필요: 90% 이상 목표');
  }
  
  // 테이퍼 팁
  recs.push('💤 테이퍼 기간: 수면 8시간+, 영양 최적화, 스트레스 최소화');
  recs.push('🏊 테이퍼 강도: Z4 스프린트 소량 유지 (신경계 활성)');
  
  return recs;
}

/**
 * 영법 변환
 */
function convertStrokeKorToEng(korean: string): string {
  const map: Record<string, string> = {
    '자유형': 'freestyle',
    '배영': 'backstroke',
    '평영': 'breaststroke',
    '접영': 'butterfly'
  };
  return map[korean] || 'freestyle';
}

/**
 * 날짜 더하기
 */
function addWeeks(date: Date, weeks: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + weeks * 7);
  return result;
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



