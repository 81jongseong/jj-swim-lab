/**
 * 🏊 JJ Swim Lab - 수영 프로그램 생성 엔진 v3.5 (Time-Based Scientific System)
 * Updated: 2025-10-13 - Time-priority mode (minReps flexible)
 * 
 * 🎯 핵심 개선사항:
 * 1. **시간 역산 시스템**: 거리가 아닌 시간을 기준으로 프로그램 생성
 * 2. **과학적 시간 배분**: 워밍업(10%), 드릴(15%), 메인(60%), 쿨다운(15%)
 * 3. **정확한 시간 계산**: 페이스 + 휴식을 정확히 계산하여 목표 시간 달성
 * 4. **meters와 desc 완벽 동기화**: 모든 변경 시 동시 업데이트
 * 
 * 연동되는 데이터:
 * - CSS (Critical Swim Speed) - 영법별 100m당 초
 * - Zone 기반 페이스 및 휴식 시간
 * - 컨디션 및 질환 기반 자동 조정
 * - 25개 훈련법 + 40개 드릴
 * 
 * 연동되는 파일:
 * - client/types/evidence.ts
 * - client/lib/swimlab/condition-rules-v4.ts
 * - client/src/swimlab/data/trainingMethods.ts (25개)
 * - client/src/swimlab/data/drills.ts (40개)
 */

import { EvidenceKey } from '@/types/evidence';
import { aggregateConditionRules } from '@/lib/swimlab/condition-rules-v4';
import { TRAINING_METHODS } from '@/src/swimlab/data/trainingMethods';
import { DRILLS } from '@/src/swimlab/data/drills';
import { calculateScientificAdjustments } from '@/lib/swimlab/scientific-factors';

type Stroke = 'freestyle' | 'backstroke' | 'breaststroke' | 'butterfly' | 'elementary_backstroke' | 'sidestroke';
type Zone = 'Z1' | 'Z2' | 'Z3' | 'Z4' | 'Z5';

// 🎯 과학적 시간 배분 비율
// 근거: ACSM/NSCA 운동 처방 가이드라인
const TIME_ALLOCATION = {
  WU: 0.10,   // 워밍업: 10% (체온↑, 가동성 확보)
  PRE: 0.15,  // 드릴: 15% (기술 준비)
  MAIN: 0.60, // 메인: 60% (목표 중심 훈련)
  CD: 0.15    // 쿨다운: 15% (회복 시작)
};

// 🎯 과학적 반복 횟수 범위
// 근거: 훈련법별 생리학적 적응 시간
const SCIENTIFIC_REPS = {
  warmup: { min: 2, max: 5 },      // 워밍업: 2-5회 (5-10분)
  drill: { min: 2, max: 6 },        // 드릴: 2-6회 (7-12분)
  main_endurance: { min: 3, max: 8 }, // 지구력: 3-8회 (30-40분)
  main_tempo: { min: 4, max: 12 },   // 템포: 4-12회 (30-40분)
  main_sprint: { min: 6, max: 16 },  // 스프린트: 6-16회 (30-40분)
  cooldown: { min: 2, max: 10 }      // 쿨다운: 2-10회 (7-12분)
};

// 🏊 레벨별 세트 거리 단위 (과학적 근거)
// 근거: Maglischo (2003) - 수영 능력별 최적 거리
const LEVEL_DISTANCE_UNITS = {
  beginner: {
    warmup: 25,      // 초급: 25m 단위 (기술 미숙, 짧은 거리)
    drill: 25,
    main_endurance: 50,  // 최대 50m (지구력 부족)
    main_tempo: 25,
    main_sprint: 25,
    cooldown: 25
  },
  intermediate: {
    warmup: 50,      // 중급: 50-100m 단위
    drill: 50,
    main_endurance: 100, // 100-200m (기초 체력)
    main_tempo: 50,
    main_sprint: 50,
    cooldown: 50
  },
  advanced: {
    warmup: 100,     // 고급: 100-200m 단위
    drill: 50,
    main_endurance: 200, // 200-400m (높은 지구력)
    main_tempo: 100,
    main_sprint: 50,
    cooldown: 50
  },
  master: {
    warmup: 100,     // 마스터: 100-400m 단위
    drill: 50,
    main_endurance: 400, // 400m+ (최대 지구력)
    main_tempo: 200,
    main_sprint: 50,
    cooldown: 50
  },
  expert: {
    warmup: 100,     // 엘리트: 100-500m 단위
    drill: 50,
    main_endurance: 500, // 500m+ (엘리트 수준)
    main_tempo: 200,
    main_sprint: 50,
    cooldown: 50
  }
} as const;

interface SetItem {
  stroke: Stroke;
  zone: Zone;
  restSec: number;
  rpe: number;
  equipment: string[];
  subtype?: string;
  meters: number;
  desc: string;
  whyPace: string;
  whyRest: string;
  whySet: string;
  methodId?: string;
  evidenceKeys: EvidenceKey[];
}

interface DayPlan {
  date: string;
  theme: 'tech_tempo' | 'endurance' | 'tempo_hi';
  themeDesc: string;
  sets: SetItem[];
  totalMeters: number;
  estimatedMinutes: number;
  usedMethodIds: string[];
  strokeWarnings?: string[]; // 영법 경고 메시지
}

/**
 * 🎯 테마 자동 선택 (목표 기반)
 * 
 * @param goal - 운동 목표
 * @param weeklyFrequency - 주간 운동 횟수
 * @returns 테마 (tech_tempo, endurance, tempo_hi)
 */
function selectThemeByGoal(goal: string, weeklyFrequency: number): 'tech_tempo' | 'endurance' | 'tempo_hi' {
  // 🎯 목표별 테마 매핑
  const goalToTheme: Record<string, 'tech_tempo' | 'endurance' | 'tempo_hi'> = {
    '체력 향상': 'endurance',      // 지구력 중심
    '실력 향상': 'tempo_hi',        // 고강도 템포
    '기술 연마': 'tech_tempo',      // 기술 + 템포
    '체중 감량': 'endurance',       // 장시간 유산소
    '재활': 'tech_tempo',           // 낮은 강도 + 기술
    '스트레스 해소': 'endurance',   // 편안한 지구력
    '장거리 수영': 'endurance',     // 지구력 극대화
    '스프린트': 'tempo_hi',         // 고강도 스프린트
    '생존수영': 'tech_tempo',       // 기술 중심
    '인명구조원': 'tempo_hi'        // 혼합 고강도
  };
  
  let theme = goalToTheme[goal] || 'endurance'; // 기본값: 지구력
  
  // 주간 운동 횟수에 따른 조정
  if (weeklyFrequency <= 2) {
    // 주 1-2회: 기술 중심 (체력 쌓기보다 기술 유지)
    theme = 'tech_tempo';
  } else if (weeklyFrequency >= 5) {
    // 주 5회 이상: 고강도 가능
    if (theme === 'endurance') {
      theme = 'tempo_hi'; // 지구력 → 템포 전환
    }
  }
  
  return theme;
}

/**
 * 🎯 목표별 + 테마별 훈련법 자동 선택
 * 
 * @param goal - 운동 목표 (체력 향상, 실력 향상, 기술 연마, 체중 감량, 재활, 스트레스 해소, 장거리 수영, 스프린트, 생존수영, 인명구조원)
 * @param theme - 테마 (tech_tempo, endurance, tempo_hi)
 * @param baseCss - 기본 CSS (초/100m)
 * @param targetMinutes - 목표 시간 (분)
 * @returns 선택된 훈련법 정보
 */
function selectTrainingMethodByGoalAndTheme(
  goal: string,
  theme: 'tech_tempo' | 'endurance' | 'tempo_hi',
  baseCss: number,
  targetMinutes: number,
  splitIndex: number = 0, // 메인 세트 분할 시 인덱스 (0, 1, 2...)
  level?: string // 레벨별 거리 조정용
): {
  methodId: string;
  name: string;
  zone: Zone;
  distPerRep: number;
  paceSeconds: number;
  pace100m: number;
  restSeconds: number;
  minReps: number;
  maxReps: number;
  isPer100m: boolean;
  equipment: string[];
  whyPace: string;
  whyRest: string;
  whySet: string;
  evidenceKeys: EvidenceKey[];
  rationale: string;
} {
  // 🎯 테마별 + 목표별 훈련법 매핑
  const themeMethodMap: Record<string, Record<string, any>> = {
    tech_tempo: {
      '체력 향상': {
        methodId: '06',
        name: '역치 인터벌(Threshold)',
        zone: 'Z3' as Zone,
        distPerRep: 200,
        paceMultiplier: 1.05,
        restZone: 'Z3',
        minReps: 4,
        maxReps: 10,
        equipment: [],
        rationale: 'CSS/MLSS 유지 능력, 기술+템포 조화'
      },
      '기술 연마': {
        methodId: '18',
        name: '스트로크 카운트(최소화)',
        zone: 'Z2' as Zone,
        distPerRep: 100,
        paceMultiplier: 1.15,
        restZone: 'Z2',
        minReps: 6,
        maxReps: 12,
        equipment: [],
        rationale: '효율성 향상, 기술 집중'
      },
      default: {
        methodId: '05',
        name: '템포 홀드(일정 페이스)',
        zone: 'Z3' as Zone,
        distPerRep: 150,
        paceMultiplier: 1.0,
        restZone: 'Z3',
        minReps: 5,
        maxReps: 10,
        equipment: [],
        rationale: '페이스 유지력, 기술 안정성'
      }
    },
    endurance: {
      '체력 향상': {
        methodId: '25',
        name: 'LSD(장거리 저강도) 지속 수영',
        zone: 'Z2' as Zone,
        distPerRep: 300,
        paceMultiplier: 1.0,
        restZone: 'Z2',
        minReps: 3,
        maxReps: 8,
        equipment: [],
        rationale: '기초 체력·심폐 기반 구축 (ACSM 2018)'
      },
    '실력 향상': {
      methodId: '06',
      name: '역치 인터벌(Threshold)',
      zone: 'Z3' as Zone,
      distPerRep: 200,
      paceMultiplier: 1.05, // CSS + 5%
      restZone: 'Z3',
      minReps: 4,
      maxReps: 10,
      equipment: [],
      rationale: 'CSS/MLSS 유지 능력, 템포 트레이닝 (Wakayoshi 1993)'
    },
    '기술 연마': {
      methodId: '18',
      name: '스트로크 카운트(최소화)',
      zone: 'Z2' as Zone,
      distPerRep: 100,
      paceMultiplier: 1.15, // CSS + 15% (느리게, 기술 집중)
      restZone: 'Z2',
      minReps: 6,
      maxReps: 12,
      equipment: [],
      rationale: '효율성 향상, 스트로크 품질 우선 (Maglischo 2003)'
    },
    '체중 감량': {
      methodId: '25',
      name: 'LSD(장거리 저강도) 지속 수영',
      zone: 'Z2' as Zone,
      distPerRep: 400,
      paceMultiplier: 1.0,
      restZone: 'Z2',
      minReps: 3,
      maxReps: 6,
      equipment: [],
      rationale: '지방 연소 극대화, 장시간 유산소 (ACSM 2018)'
    },
    '재활': {
      methodId: '10',
      name: '풀 집중(하체 부담↓, 호흡 안정)',
      zone: 'Z1' as Zone,
      distPerRep: 100,
      paceMultiplier: 1.3, // CSS + 30% (매우 느리게)
      restZone: 'Z1',
      minReps: 4,
      maxReps: 10,
      equipment: ['풀부이'],
      rationale: '관절 부담 최소화, 상체 중심 운동 (APTA 2016)'
    },
    '스트레스 해소': {
      methodId: '25',
      name: 'LSD(장거리 저강도) 지속 수영',
      zone: 'Z1' as Zone,
      distPerRep: 200,
      paceMultiplier: 1.2, // CSS + 20% (편안하게)
      restZone: 'Z1',
      minReps: 4,
      maxReps: 10,
      equipment: [],
      rationale: '엔돌핀 분비, 명상적 수영 (Peluso & Andrade 2005)'
    },
    '장거리 수영': [
      {
        methodId: '25',
        name: 'LSD(장거리 저강도) 지속 수영',
        zone: 'Z2' as Zone,
        distPerRep: 400,
        paceMultiplier: 1.0,
        restZone: 'Z2',
        minReps: 3,
        maxReps: 6,
        equipment: [],
        rationale: '지구력 극대화, 90분+ 지속 적응 (Costill 1991)'
      },
      {
        methodId: '05',
        name: '템포 홀드(일정 페이스)',
        zone: 'Z3' as Zone,
        distPerRep: 200,
        paceMultiplier: 1.0,
        restZone: 'Z3',
        minReps: 4,
        maxReps: 8,
        equipment: [],
        rationale: '페이스 유지력, 장거리 페이스 감각 (NSCA 2017)'
      }
    ],
    '스프린트': {
      methodId: '08',
      name: '스프린트 반복(폭발력)',
      zone: 'Z5' as Zone,
      distPerRep: 50,
      paceMultiplier: 0.8, // CSS - 20% (빠르게)
      restZone: 'Z5',
      minReps: 6,
      maxReps: 16,
      equipment: [],
      rationale: '최고 속도, 신경근 동원력 (Sharp et al. 1986)'
    },
    '생존수영': {
      methodId: '13',
      name: '스컬링·캐치 품질(손수영)',
      zone: 'Z1' as Zone,
      distPerRep: 50,
      paceMultiplier: 1.5, // CSS + 50% (매우 느리게, 기술 집중)
      restZone: 'Z1',
      minReps: 6,
      maxReps: 12,
      equipment: [],
      rationale: '생존 기술 습득, 효율성 극대화 (Langendorfer 1995)'
    },
    '인명구조원': {
      methodId: '06',
      name: '역치 인터벌(구조 지구력)',
      zone: 'Z3' as Zone,
      distPerRep: 200,
      paceMultiplier: 1.0,
      restZone: 'Z3',
      minReps: 4,
      maxReps: 8,
      equipment: [],
      rationale: '구조 상황 지구력, 혼합 강도 (Reilly et al. 2003)'
    },
      default: {
        methodId: '25',
        name: 'LSD(장거리 저강도) 지속 수영',
        zone: 'Z2' as Zone,
        distPerRep: 400,
        paceMultiplier: 1.0,
        restZone: 'Z2',
        minReps: 3,
        maxReps: 6,
        equipment: [],
        rationale: '지구력 극대화, 장시간 지속'
      }
    },
    tempo_hi: {
      '실력 향상': {
        methodId: '08',
        name: '스프린트 반복(폭발력)',
        zone: 'Z5' as Zone,
        distPerRep: 50,
        paceMultiplier: 0.8,
        restZone: 'Z5',
        minReps: 6,
        maxReps: 16,
        equipment: [],
        rationale: '최고 속도, 신경근 동원력 (Sharp et al. 1986)'
      },
      '스프린트': {
        methodId: '08',
        name: '스프린트 반복(폭발력)',
        zone: 'Z5' as Zone,
        distPerRep: 50,
        paceMultiplier: 0.8,
        restZone: 'Z5',
        minReps: 6,
        maxReps: 16,
        equipment: [],
        rationale: '최고 속도, 폭발력 극대화'
      },
      default: {
        methodId: '06',
        name: '역치 인터벌(Threshold)',
        zone: 'Z4' as Zone,
        distPerRep: 100,
        paceMultiplier: 0.95,
        restZone: 'Z4',
        minReps: 6,
        maxReps: 12,
        equipment: [],
        rationale: '고강도 템포, VO₂max 향상'
      }
    }
  };
  
  // 테마별 훈련법 선택
  const themeMethods = themeMethodMap[theme] || themeMethodMap['endurance'];
  let goalMethods = themeMethods[goal] || themeMethods['default'];
  
  // 🎯 배열이면 splitIndex에 따라 선택 (다양성 확보)
  let method: any;
  if (Array.isArray(goalMethods)) {
    method = goalMethods[splitIndex % goalMethods.length]; // 순환 선택
  } else {
    method = goalMethods;
  }
  
  // 🏊 레벨별 거리 조정
  let distPerRep = method.distPerRep;
  if (level) {
    const levelGroup = (level.split('_')[0]) as keyof typeof LEVEL_DISTANCE_UNITS;
    const levelUnits = LEVEL_DISTANCE_UNITS[levelGroup] || LEVEL_DISTANCE_UNITS.intermediate;
    
    // 테마에 따라 레벨별 거리 적용
    if (theme === 'endurance') {
      distPerRep = Math.min(method.distPerRep, levelUnits.main_endurance);
    } else if (theme === 'tempo_hi') {
      distPerRep = Math.min(method.distPerRep, levelUnits.main_sprint);
    } else {
      distPerRep = Math.min(method.distPerRep, levelUnits.main_tempo);
    }
  }
  
  // 페이스 계산
  const pace100m = Math.round(baseCss * method.paceMultiplier);
  const paceSeconds = (distPerRep / 100) * pace100m; // per set 페이스
  const restSeconds = getRestForZone(method.restZone);
  
  // whyPace, whyRest, whySet 생성
  const whyPace = `${method.name}: ${method.zone} 강도, CSS ${method.paceMultiplier === 1.0 ? '기준' : (method.paceMultiplier > 1.0 ? `+${((method.paceMultiplier - 1) * 100).toFixed(0)}%` : `-${((1 - method.paceMultiplier) * 100).toFixed(0)}%`)}`;
  const whyRest = `${method.zone} 기본 r${restSeconds}″. ${method.rationale}`;
  const whySet = `${method.name}: ${method.rationale}`;
  
  return {
    methodId: method.methodId,
    name: method.name,
    zone: method.zone,
    distPerRep, // 레벨별 조정된 거리
    paceSeconds,
    pace100m,
    restSeconds,
    minReps: method.minReps,
    maxReps: method.maxReps,
    isPer100m: false, // per set
    equipment: method.equipment,
    whyPace,
    whyRest,
    whySet,
    evidenceKeys: ['CSS_MLSS_WAKAYOSHI_1993'] as EvidenceKey[],
    rationale: method.rationale
  };
}

/**
 * 🎯 레벨별 드릴 자동 선택
 * 
 * @param type - 드릴 타입 ('pull' 또는 'kick')
 * @param level - 회원 레벨 (beginner_1, intermediate_1, advanced_2, etc.)
 * @param goal - 운동 목표
 * @returns 선택된 드릴 정보
 */
function selectDrillByLevel(
  type: 'pull' | 'kick',
  level: string,
  goal: string
): {
  name: string;
  equipment: string[];
  rationale: string;
  paceMultiplier: number;
} {
  // 레벨 그룹 추출 (beginner_1 → beginner)
  const levelGroup = level.split('_')[0];
  
  // 🎯 레벨별 + 목표별 드릴 매핑
  const drillMap: Record<string, Record<string, any>> = {
    beginner: {
      pull: {
        '체력 향상': { name: 'Pull Buoy Steady', equipment: ['풀부이'], rationale: '상체 지구력, 기본 자세 유지', paceMultiplier: 1.3 },
        '기술 연마': { name: 'Catch-Up', equipment: ['풀부이'], rationale: '타이밍/정렬 교정, 스트로크 리듬', paceMultiplier: 1.4 },
        default: { name: 'Catch-Up', equipment: ['풀부이'], rationale: '타이밍/정렬 교정', paceMultiplier: 1.4 }
      },
      kick: {
        '체력 향상': { name: 'Flutter Kick', equipment: ['킥보드'], rationale: '하체 지구력 기초', paceMultiplier: 1.5 },
        '기술 연마': { name: 'Side Kick (Long)', equipment: ['킥보드'], rationale: '발차기 기술, 몸통 정렬', paceMultiplier: 1.6 },
        default: { name: 'Flutter Kick', equipment: ['킥보드'], rationale: '기본 발차기', paceMultiplier: 1.5 }
      }
    },
    intermediate: {
      pull: {
        '체력 향상': { name: 'Pull Buoy Steady', equipment: ['풀부이'], rationale: '상체 근지구력', paceMultiplier: 1.2 },
        '실력 향상': { name: 'Paddle Pull', equipment: ['패들', '풀부이'], rationale: '추진력·파워 향상', paceMultiplier: 1.1 },
        '기술 연마': { name: 'Zipper', equipment: ['풀부이'], rationale: '하이 엘보, 회복 궤도', paceMultiplier: 1.3 },
        default: { name: 'Catch-Up', equipment: ['풀부이'], rationale: '효율성', paceMultiplier: 1.2 }
      },
      kick: {
        '체력 향상': { name: 'Flutter Kick', equipment: ['킥보드'], rationale: '하체 지구력', paceMultiplier: 1.4 },
        '실력 향상': { name: 'Vertical Kick', equipment: [], rationale: '킥 파워, 체간 안정성', paceMultiplier: 1.3 },
        default: { name: 'Side Kick (Long)', equipment: ['킥보드'], rationale: '지속력', paceMultiplier: 1.4 }
      }
    },
    advanced: {
      pull: {
        '체력 향상': { name: 'Pull Buoy Steady', equipment: ['풀부이'], rationale: '상체 근지구력 극대화', paceMultiplier: 1.1 },
        '실력 향상': { name: 'Paddle Pull', equipment: ['패들', '풀부이'], rationale: '추진력 극대화', paceMultiplier: 1.0 },
        '기술 연마': { name: 'Scull', equipment: [], rationale: '물감각·캐치 정확도', paceMultiplier: 1.2 },
        default: { name: 'Single Arm', equipment: ['풀부이'], rationale: '편측 강화', paceMultiplier: 1.1 }
      },
      kick: {
        '체력 향상': { name: 'Dolphin Kick', equipment: ['킥보드'], rationale: '전신 파워, 코어 강화', paceMultiplier: 1.3 },
        '실력 향상': { name: 'Vertical Kick', equipment: [], rationale: '킥 폭발력, 체간 안정성', paceMultiplier: 1.2 },
        default: { name: 'Flutter Kick', equipment: ['킥보드'], rationale: '하체 지구력', paceMultiplier: 1.3 }
      }
    },
    master: {
      pull: {
        '실력 향상': { name: 'Paddle Pull', equipment: ['패들', '풀부이'], rationale: '최대 추진력', paceMultiplier: 0.95 },
        '기술 연마': { name: 'Scull', equipment: [], rationale: '미세 조정, 물감각', paceMultiplier: 1.1 },
        default: { name: 'Paddle Pull', equipment: ['패들', '풀부이'], rationale: '파워 유지', paceMultiplier: 1.0 }
      },
      kick: {
        '실력 향상': { name: 'Dolphin Kick', equipment: [], rationale: '턴 가속, 브레이크아웃', paceMultiplier: 1.2 },
        default: { name: 'Vertical Kick', equipment: [], rationale: '폭발력 유지', paceMultiplier: 1.2 }
      }
    },
    expert: {
      pull: {
        default: { name: 'Paddle Pull', equipment: ['패들', '풀부이', '밴드'], rationale: '최대 파워, 저항 훈련', paceMultiplier: 0.95 }
      },
      kick: {
        default: { name: 'Dolphin Kick', equipment: [], rationale: '최대 폭발력', paceMultiplier: 1.1 }
      }
    }
  };
  
  const levelDrills = drillMap[levelGroup] || drillMap['intermediate'];
  const typeDrills = levelDrills[type] || levelDrills['pull'];
  const selectedDrill = typeDrills[goal] || typeDrills['default'];
  
  return selectedDrill;
}

/**
 * 🎯 시간 역산 기반 반복 횟수 계산
 * 
 * @param targetMinutes - 목표 시간 (분)
 * @param distPerRep - 반복당 거리 (m)
 * @param paceSeconds - 페이스 (초/100m 또는 초/set)
 * @param restSeconds - 휴식 시간 (초)
 * @param minReps - 최소 반복 횟수
 * @param maxReps - 최대 반복 횟수
 * @param isPer100m - 페이스가 per 100m인지 여부
 * @returns 반복 횟수
 */
function calculateRepsFromTime(
  targetMinutes: number,
  distPerRep: number,
  paceSeconds: number,
  restSeconds: number,
  minReps: number,
  maxReps: number,
  isPer100m: boolean = true
): number {
  const targetSeconds = targetMinutes * 60;
  
  // 1회당 소요 시간 계산 (수영 시간만, 휴식은 별도)
  let swimTimePerRep: number;
  if (isPer100m) {
    // per 100m 페이스: (거리 / 100) * 페이스
    swimTimePerRep = (distPerRep / 100) * paceSeconds;
  } else {
    // per set 페이스
    swimTimePerRep = paceSeconds;
  }
  
  // 반복 횟수 역산: targetSeconds = (swimTime * reps) + (rest * (reps - 1))
  // 정리: targetSeconds = reps * swimTime + reps * rest - rest
  //      targetSeconds = reps * (swimTime + rest) - rest
  //      targetSeconds + rest = reps * (swimTime + rest)
  //      reps = (targetSeconds + rest) / (swimTime + rest)
  const timePerRepWithRest = swimTimePerRep + restSeconds;
  const calculatedReps = Math.floor((targetSeconds + restSeconds) / timePerRepWithRest);
  
  // 🎯 시간 우선 vs 과학적 최소 반복 균형
  const timeWithMinReps = (swimTimePerRep * minReps) + (restSeconds * (minReps - 1));
  const timeWithCalcReps = (swimTimePerRep * calculatedReps) + (restSeconds * (calculatedReps - 1));
  
  let finalReps: number;
  let adjustmentNote: string = '';
  
  if (calculatedReps >= minReps) {
    // 계산된 반복이 최소 이상 → 그대로 사용
    finalReps = Math.min(maxReps, calculatedReps);
    adjustmentNote = '✅ 시간 & 과학적 범위 모두 충족';
  } else if (timeWithMinReps <= targetSeconds * 1.05) {
    // minReps 사용해도 5% 이내 → minReps 사용 (과학적 효과 우선)
    finalReps = minReps;
    adjustmentNote = `✅ minReps(${minReps}) 사용 (과학적 효과 우선, +${((timeWithMinReps / targetSeconds - 1) * 100).toFixed(1)}% 시간)`;
  } else {
    // minReps 사용 시 5% 이상 초과 → calculatedReps 사용 (시간 우선)
    finalReps = Math.max(1, calculatedReps);
    adjustmentNote = `⚠️ 시간 우선: calculatedReps(${calculatedReps}) 사용 (minReps ${minReps}는 시간 초과)`;
  }
  
  // 실제 소요 시간 계산 (검증용)
  const actualTotalSeconds = (swimTimePerRep * finalReps) + (restSeconds * (finalReps - 1));
  
  console.log(`⏱️ 시간 역산 계산:`, {
    targetMinutes,
    targetSeconds,
    distPerRep,
    paceSeconds,
    restSeconds,
    isPer100m,
    swimTimePerRep: swimTimePerRep.toFixed(1) + '초',
    calculatedReps,
    minReps,
    maxReps,
    finalReps,
    adjustmentNote,
    expectedTotalTime: (actualTotalSeconds / 60).toFixed(1) + '분',
    accuracy: ((actualTotalSeconds / targetSeconds) * 100).toFixed(1) + '%'
  });
  
  return finalReps;
}

/**
 * 🎯 세트의 정확한 소요 시간 계산
 */
function calculateSetDuration(
  reps: number,
  distPerRep: number,
  paceSeconds: number,
  restSeconds: number,
  isPer100m: boolean = true
): number {
  let swimSeconds: number;
  
  if (isPer100m) {
    // per 100m 페이스
    const totalMeters = reps * distPerRep;
    swimSeconds = (totalMeters / 100) * paceSeconds;
  } else {
    // per set 페이스
    swimSeconds = paceSeconds * reps;
  }
  
  // 휴식: 마지막 반복 제외 (reps - 1)
  const totalRestSeconds = restSeconds * (reps - 1);
  
  return (swimSeconds + totalRestSeconds) / 60; // 분 단위 반환
}

/**
 * 🎯 페이스 포맷팅 (초 → "분:초")
 */
function formatPace(seconds: number): string {
  const min = Math.floor(seconds / 60);
  const sec = Math.round(seconds % 60);
  return `${min}:${String(sec).padStart(2, '0')}`;
}

/**
 * 🎯 Zone별 기본 휴식 시간
 */
function getRestForZone(zone: Zone): number {
  const restMap: Record<Zone, number> = {
    Z1: 10,
    Z2: 15,
    Z3: 20,
    Z4: 30,
    Z5: 45
  };
  return restMap[zone];
}

/**
 * 🏊 영법 이름 한글 변환
 */
function getStrokeName(stroke: Stroke): string {
  const names: Record<Stroke, string> = {
    freestyle: '자유형',
    backstroke: '배영',
    breaststroke: '평영',
    butterfly: '접영',
    elementary_backstroke: '기본배영',
    sidestroke: '횡영'
  };
  return names[stroke] || '자유형';
}

/**
 * 🎯 Zone별 RPE
 */
function getRPEForZone(zone: Zone): number {
  const rpeMap: Record<Zone, number> = {
    Z1: 3,
    Z2: 5,
    Z3: 6,
    Z4: 8,
    Z5: 9
  };
  return rpeMap[zone];
}

/**
 * 🎯 시간 기반 일일 프로그램 생성
 * 
 * 핵심 로직:
 * 1. 총 시간을 과학적 비율로 배분 (WU 10%, PRE 15%, MAIN 60%, CD 15%)
 * 2. 각 섹션별로 시간 역산하여 반복 횟수 계산
 * 3. meters와 desc를 항상 동기화
 * 4. 실시간 시간 검증 및 자동 조정
 */
export function generateTimeBasedProgram(opts: {
  targetMinutes: number;
  css100: Record<string, number>;
  poolLen: number;
  goal: string;
  level: string;
  strokesAllowed: Stroke[];
  strokesAvoid: string[];
  conditionIds: string[];
  dayCondition: string;
  weeklyFrequency?: number; // 주간 운동 횟수 (1-7)
  intensityPercent?: number; // 건강 상태 기반 강도 조절 (0.7 = 70%)
  cssMeasurementPoolLength?: number; // CSS 측정 풀 길이 (25 or 50)
}): DayPlan {
  
  // 🎯 테마 자동 선택
  const theme = selectThemeByGoal(opts.goal, opts.weeklyFrequency || 3);
  const themeDescriptions = {
    tech_tempo: '기술+템포 (Technique & Tempo) - 효율성과 페이스 조화',
    endurance: '지구력 (Endurance) - 유산소 기반 체력 강화',
    tempo_hi: '고강도 템포 (High Intensity) - 스피드와 파워 극대화'
  };
  
  // 🏊 영법 선택 (선호 영법 가중치 + 회피 영법 제외 + 질환 기반 추천)
  let availableStrokes = opts.strokesAllowed.filter(s => !opts.strokesAvoid.includes(s));
  
  // 🏥 질환이 있으면 횡영/기본배영 자동 추가 (관절 부담 최소)
  if (opts.conditionIds.length > 0) {
    if (!availableStrokes.includes('sidestroke')) {
      availableStrokes.push('sidestroke');
    }
    if (!availableStrokes.includes('elementary_backstroke')) {
      availableStrokes.push('elementary_backstroke');
    }
  }
  
  const primaryStroke: Stroke = availableStrokes.length > 0 ? availableStrokes[0] as Stroke : 'freestyle';
  
  // 🎯 세트별 영법 배분 함수 (다양성 확보)
  const getStrokeForSet = (setIndex: number): Stroke => {
    if (availableStrokes.length === 1) return primaryStroke;
    return availableStrokes[setIndex % availableStrokes.length] as Stroke;
  };
  
  // 🔄 CSS 풀 길이 변환 (Psycharakis & Sanders, 2008)
  const convertCSSBetweenPools = (
    css: number,
    fromPoolLength: number,
    toPoolLength: number
  ): number => {
    // 턴당 0.4초 이득 (Psycharakis & Sanders, 2008: 0.3-0.6초)
    const TURN_ADVANTAGE = 0.4;
    
    // 100m 당 턴 횟수 (마지막 터치는 턴 아님)
    const turnsInFrom = Math.max(0, Math.floor(100 / fromPoolLength) - 1);
    const turnsInTo = Math.max(0, Math.floor(100 / toPoolLength) - 1);
    
    // 턴 횟수 차이에 따른 시간 조정
    const turnDifference = turnsInTo - turnsInFrom;
    const timeAdjustment = turnDifference * TURN_ADVANTAGE;
    
    return css + timeAdjustment;
  };
  
  // 🏊 영법별 CSS 가져오기 (풀 길이 변환 적용)
  const getCssForStroke = (stroke: Stroke): number => {
    let baseCss: number;
    
    // 🔬 횡영/기본배영: 평영 기반 1.2배 느리게 (과학적 근거: 유사한 동작 패턴)
    if (stroke === 'sidestroke' || stroke === 'elementary_backstroke') {
      const breaststrokeCss = opts.css100['breaststroke'] || 110; // 평영 기본값 110초
      baseCss = Math.round(breaststrokeCss * 1.2); // 20% 느리게
    } else {
      // 대회 영법: 입력된 CSS 사용
      baseCss = opts.css100[stroke] 
        || opts.css100[primaryStroke] 
        || opts.css100[availableStrokes[0] as Stroke]
        || Object.values(opts.css100).find(css => css > 0) 
        || 90;
    }
    
    // 🔄 CSS 측정 풀 길이가 다르면 변환
    const cssMeasurementPoolLength = opts.cssMeasurementPoolLength || 25;
    if (cssMeasurementPoolLength !== 50) {
      const convertedCss = convertCSSBetweenPools(baseCss, cssMeasurementPoolLength, 50);
      console.log(`🔄 CSS 변환 (${stroke}): ${cssMeasurementPoolLength}m 풀 ${baseCss}초 → 50m 기준 ${convertedCss.toFixed(1)}초`);
      return convertedCss;
    }
    
    return baseCss;
  };
  
  // 🔬 영법별 적합 세트 타입 (과학적 근거)
  // - 횡영/기본배영: CSS 없음, 재활/회복 목적 → 워밍업/쿨다운만 적합
  //   * 드릴 제외 이유: 드릴은 메인 영법의 기술 연습이므로 횡영/기본배영은 부적합
  // - 대회 영법: CSS 있음 → 모든 세트 타입 가능
  const isStrokeSuitableForSetType = (stroke: Stroke, setType: 'warmup' | 'drill' | 'main' | 'cooldown'): boolean => {
    const rehabilitationStrokes: Stroke[] = ['sidestroke', 'elementary_backstroke'];
    
    if (rehabilitationStrokes.includes(stroke)) {
      // 횡영/기본배영: 워밍업, 쿨다운만 (드릴, 메인 세트 제외)
      return setType === 'warmup' || setType === 'cooldown';
    }
    
    // 대회 영법: 모든 세트 타입 가능
    return true;
  };
  
  // 🎯 세트 타입별 영법 선택 (과학적 배치)
  const getStrokeForSetType = (setType: 'warmup' | 'drill' | 'main' | 'cooldown', currentIndex: number): Stroke => {
    // 해당 세트 타입에 적합한 영법만 필터링
    const suitableStrokes = availableStrokes.filter(s => isStrokeSuitableForSetType(s as Stroke, setType));
    
    if (suitableStrokes.length === 0) {
      // 적합한 영법이 없으면 primaryStroke 사용
      return primaryStroke;
    }
    
    if (suitableStrokes.length === 1) {
      return suitableStrokes[0] as Stroke;
    }
    
    // 순환 배치
    return suitableStrokes[currentIndex % suitableStrokes.length] as Stroke;
  };
  
  console.log('🚀 시간 기반 프로그램 생성 시작:', {
    targetMinutes: opts.targetMinutes,
    goal: opts.goal,
    level: opts.level,
    weeklyFrequency: opts.weeklyFrequency || 3,
    selectedTheme: theme,
    themeDesc: themeDescriptions[theme],
    conditionIds: opts.conditionIds,
    primaryStroke,
    availableStrokes, // 🏊 사용 가능한 영법 (질환 시 재활 영법 자동 추가)
    avoidStrokes: opts.strokesAvoid,
    strokeRotation: availableStrokes.length > 1 ? '세트별 영법 순환' : '단일 영법',
    scientificPlacement: '횡영/기본배영 → 워밍업/쿨다운만 (드릴은 메인 영법 기술 연습)'
  });
  
  // 🔬 과학적 인자 종합 계산
  const scientificAdj = calculateScientificAdjustments({
    weeklyFrequency: opts.weeklyFrequency || 3,
    poolLength: opts.poolLen,
    goal: opts.goal,
    level: opts.level,
    intensityPercent: opts.intensityPercent
  });
  
  console.log('🔬 과학적 조정:', scientificAdj.scientificSummary);
  
  // 1. 시간 배분 (목표별 맞춤 비율 + 최소/최대 제한)
  // 🔬 과학적 근거: ACSM (2018) - 워밍업 최소 5분, 쿨다운 최소 5분
  const MIN_WARMUP = 5;   // 최소 5분 (체온 상승 필요)
  const MAX_WARMUP = 15;  // 최대 15분 (과도한 피로 방지)
  const MIN_COOLDOWN = 5; // 최소 5분 (젖산 제거 필요)
  const MAX_COOLDOWN = 15; // 최대 15분 (시간 낭비 방지)
  
  const rawWarmup = opts.targetMinutes * scientificAdj.timeAllocation.warmup;
  const rawCooldown = opts.targetMinutes * scientificAdj.timeAllocation.cooldown;
  
  const warmup = Math.max(MIN_WARMUP, Math.min(MAX_WARMUP, rawWarmup));
  const cooldown = Math.max(MIN_COOLDOWN, Math.min(MAX_COOLDOWN, rawCooldown));
  
  // 워밍업/쿨다운 조정으로 인한 차이를 메인/드릴에 재배분
  const warmupDiff = rawWarmup - warmup;
  const cooldownDiff = rawCooldown - cooldown;
  const redistributeTime = warmupDiff + cooldownDiff;
  
  const rawDrill = opts.targetMinutes * scientificAdj.timeAllocation.drill;
  const rawMain = opts.targetMinutes * scientificAdj.timeAllocation.main;
  
  const timeAllocation = {
    warmup,
    drill: rawDrill + (redistributeTime * 0.3), // 30%를 드릴에
    main: rawMain + (redistributeTime * 0.7),   // 70%를 메인에
    cooldown
  };
  
  console.log('📊 시간 배분:', timeAllocation);
  
  // 2. 컨디션 기반 페이스 조절
  const conditionRules = aggregateConditionRules(opts.conditionIds, opts.dayCondition);
  
  // 🎯 CSS 선택: primaryStroke CSS 우선, 없으면 첫 번째 사용 가능 영법, 없으면 기본 90초
  const baseCss = opts.css100[primaryStroke] 
    || opts.css100[availableStrokes[0] as Stroke]
    || Object.values(opts.css100).find(css => css > 0) 
    || 90;
  
  // 🚨 질환별 영법 경고 시스템
  console.log('🔍 영법 조정 디버그:', {
    primaryStroke,
    strokeAdjustments: conditionRules.strokeAdjustments,
    primaryStrokeAdj: conditionRules.strokeAdjustments[primaryStroke],
    conditionIds: opts.conditionIds
  });
  
  const strokeWarnings: string[] = [];
  
  // 회피 영법 체크
  if (conditionRules.strokeAdjustments[primaryStroke]?.avoid) {
    strokeWarnings.push(`⚠️ ${getStrokeName(primaryStroke)} 영법은 현재 질환으로 인해 권장되지 않습니다.`);
  }
  
  // 주의 영법 체크
  if (conditionRules.strokeAdjustments[primaryStroke]?.reduceVolume) {
    const intensityPct = Math.round((conditionRules.strokeAdjustments[primaryStroke].volumePct || 0.7) * 100);
    strokeWarnings.push(`💡 ${getStrokeName(primaryStroke)} 영법은 주의가 필요합니다. 페이스를 느리게 조절하여 강도를 ${intensityPct}%로 제한합니다.`);
  }
  
  if (strokeWarnings.length > 0) {
    console.warn('🚨 영법 경고:', strokeWarnings.join('\n'));
  }
  
  // 🔬 종합 페이스 조절 (모든 과학적 인자 통합)
  const finalMultiplier = scientificAdj.finalPaceMultiplier * (1 + conditionRules.cssPct);
  const adjustedCss = Math.round(baseCss * finalMultiplier);
  
  console.log('🏥 최종 페이스 조절:', {
    baseCss,
    scientificMultiplier: scientificAdj.finalPaceMultiplier.toFixed(2),
    conditionCssPct: conditionRules.cssPct,
    finalMultiplier: finalMultiplier.toFixed(2),
    adjustedCss,
    improvementRate: `${(scientificAdj.improvementRate * 100).toFixed(1)}%/월`
  });
  
  const sets: SetItem[] = [];
  let setIndex = 0; // 세트별 영법 순환용 인덱스
  
  // 3. 워밍업 (레벨별 거리 단위)
  {
    const warmupStroke = getStrokeForSetType('warmup', setIndex++);
    const strokeCss = getCssForStroke(warmupStroke);
    const adjustedStrokeCss = Math.round(strokeCss * finalMultiplier);
    
    const targetMin = timeAllocation.warmup;
    const levelGroup = (opts.level.split('_')[0]) as keyof typeof LEVEL_DISTANCE_UNITS;
    const levelUnits = LEVEL_DISTANCE_UNITS[levelGroup] || LEVEL_DISTANCE_UNITS.intermediate;
    const distPerRep = levelUnits.warmup;
    const paceSeconds = adjustedStrokeCss + 16; // Z1: CSS + 16초
    const restSeconds = getRestForZone('Z1');
    
    const reps = calculateRepsFromTime(
      targetMin,
      distPerRep,
      paceSeconds,
      restSeconds,
      SCIENTIFIC_REPS.warmup.min,
      SCIENTIFIC_REPS.warmup.max,
      true // per 100m
    );
    
    const meters = reps * distPerRep;
    const desc = `[${getStrokeName(warmupStroke)}] ${reps}×${distPerRep}m 워밍업 @ ${formatPace(paceSeconds)}/${distPerRep}m, r${restSeconds}″`;
    
    sets.push({
      stroke: warmupStroke,
      zone: 'Z1',
      restSec: restSeconds,
      rpe: getRPEForZone('Z1'),
      equipment: [],
      subtype: 'WARMUP',
      meters,
      desc,
      whyPace: `${getStrokeName(warmupStroke)} CSS ${strokeCss}초 기반 Z1 → 호흡·기술 정렬`,
      whyRest: `Z1 기본 r${restSeconds}″. 저강도 회복/환기`,
      whySet: '워밍업으로 체온·가동성 확보, 이후 템포 세트 품질 보장',
      evidenceKeys: ['CSS_VALIDITY_WAKAYOSHI_1992']
    });
    
    console.log('✅ 워밍업 생성:', { stroke: getStrokeName(warmupStroke), css: strokeCss, adjustedCss: adjustedStrokeCss, reps, meters });
  }
  
  // 4. 드릴 (레벨별 거리 단위)
  {
    const targetMin = timeAllocation.drill;
    let halfTime = targetMin / 2;
    const levelGroup = (opts.level.split('_')[0]) as keyof typeof LEVEL_DISTANCE_UNITS;
    const levelUnits = LEVEL_DISTANCE_UNITS[levelGroup] || LEVEL_DISTANCE_UNITS.intermediate;
    
    // 🏥 질환이 있고 횡영/기본배영이 추가되었지만 주 영법에 없으면 → 강습 필요
    const needsRehabStrokeLessons = opts.conditionIds.length > 0 
      && (availableStrokes.includes('sidestroke') || availableStrokes.includes('elementary_backstroke'))
      && !opts.strokesAllowed.includes('sidestroke')
      && !opts.strokesAllowed.includes('elementary_backstroke');
    
    if (needsRehabStrokeLessons) {
      // 드릴 시간의 1/3을 강습에 할당
      const lessonTime = targetMin / 3;
      halfTime = (targetMin - lessonTime) / 2; // 나머지를 팔/발차기로 분배
      
      // 🎓 재활 영법 강습 드릴 추가
      const lessonStrokes: Stroke[] = [];
      if (availableStrokes.includes('sidestroke')) lessonStrokes.push('sidestroke');
      if (availableStrokes.includes('elementary_backstroke')) lessonStrokes.push('elementary_backstroke');
      
      lessonStrokes.forEach((lessonStroke) => {
        const strokeCss = getCssForStroke(lessonStroke);
        const adjustedStrokeCss = Math.round(strokeCss * finalMultiplier);
        const distPerRep = 25; // 짧은 거리로 기술 습득
        const paceSeconds = adjustedStrokeCss + 30; // 매우 느리게 (기술 습득)
        const restSeconds = 30; // 긴 휴식 (설명 시간)
        
        const reps = Math.max(2, Math.floor(lessonTime * 60 / (paceSeconds + restSeconds)));
        const meters = reps * distPerRep;
        const desc = `[${getStrokeName(lessonStroke)}] ${reps}×${distPerRep}m 강습 (기초 자세) @ ${formatPace(paceSeconds)}/${distPerRep}m, r${restSeconds}″`;
        
        sets.push({
          stroke: lessonStroke,
          zone: 'Z1',
          restSec: restSeconds,
          rpe: 2,
          equipment: [],
          subtype: 'DRILL_LESSON',
          meters,
          desc,
          whyPace: `${getStrokeName(lessonStroke)} 강습: 평영 CSS ${opts.css100['breaststroke'] || 110}초 기반 1.2배 → 기초 자세 습득`,
          whyRest: `r${restSeconds}″ (강사 설명 및 피드백 시간 포함)`,
          whySet: `🎓 질환 관리를 위한 ${getStrokeName(lessonStroke)} 기초 강습 - 관절 부담 최소 영법 습득`,
          evidenceKeys: ['CSS_VALIDITY_WAKAYOSHI_1992']
        });
        
        console.log(`🎓 재활 영법 강습 추가: ${getStrokeName(lessonStroke)}, ${reps}×${distPerRep}m`);
      });
    }
    
    // 4-1. 팔 드릴 (레벨별 자동 선택)
    {
      const distPerRep = levelUnits.drill;
      
      // 🎯 레벨별 팔 드릴 선택
      const selectedDrill = selectDrillByLevel('pull', opts.level, opts.goal);
      const paceSeconds = (adjustedCss * 1.09 * selectedDrill.paceMultiplier) / 2; // 레벨별 페이스 조정
      const restSeconds = getRestForZone('Z2');
      
      console.log('🎯 선택된 팔 드릴:', {
        level: opts.level,
        goal: opts.goal,
        drillName: selectedDrill.name,
        equipment: selectedDrill.equipment,
        rationale: selectedDrill.rationale
      });
      
      const reps = calculateRepsFromTime(
        halfTime,
        distPerRep,
        paceSeconds,
        restSeconds,
        SCIENTIFIC_REPS.drill.min,
        SCIENTIFIC_REPS.drill.max,
        false // paceSeconds는 50m 전체 시간 (per set)
      );
      
      const meters = reps * distPerRep;
      // 🎯 페이스를 세트 거리 기준으로 표시 (50m 세트 → 50m 페이스)
      const pacePerSet = paceSeconds; // 이미 50m 기준 페이스
      const equipmentStr = selectedDrill.equipment.length > 0 ? ` (${selectedDrill.equipment.join(', ')})` : '';
      const pullStroke = getStrokeForSetType('drill', setIndex++);
      const desc = `[자유형] ${reps}×${distPerRep}m ${selectedDrill.name}${equipmentStr} @ ${formatPace(pacePerSet)}/${distPerRep}m, r${restSeconds}″`;
      
      sets.push({
        stroke: pullStroke,
        zone: 'Z2',
        restSec: restSeconds,
        rpe: getRPEForZone('Z2'),
        equipment: selectedDrill.equipment,
        subtype: 'DRILL_PULL', // 드릴 파트 - 팔
        meters,
        desc: desc.replace('[자유형]', `[${getStrokeName(pullStroke)}]`),
        whyPace: 'CSS 기반 Z2(유산소 기초) → 미토콘드리아 밀도↑, 지방 대사 개선',
        whyRest: `Z2 기본 r${restSeconds}″. 기술 유지와 환기 위한 회복`,
        whySet: `${selectedDrill.name}: ${selectedDrill.rationale}`,
        evidenceKeys: ['CSS_VALIDITY_WAKAYOSHI_1992']
      });
      
      console.log('✅ 팔 드릴 생성:', { reps, meters, desc, stroke: getStrokeName(pullStroke) });
    }
    
    // 4-2. 발차기 드릴 (레벨별 자동 선택)
    {
      const distPerRep = levelUnits.drill;
      
      // 🎯 레벨별 발차기 드릴 선택
      const selectedDrill = selectDrillByLevel('kick', opts.level, opts.goal);
      const paceSeconds = (adjustedCss * 1.5 * selectedDrill.paceMultiplier) / 2; // 레벨별 페이스 조정
      const restSeconds = getRestForZone('Z2');
      
      console.log('🎯 선택된 발차기 드릴:', {
        level: opts.level,
        goal: opts.goal,
        drillName: selectedDrill.name,
        equipment: selectedDrill.equipment,
        rationale: selectedDrill.rationale
      });
      
      const reps = calculateRepsFromTime(
        halfTime,
        distPerRep,
        paceSeconds,
        restSeconds,
        SCIENTIFIC_REPS.drill.min,
        SCIENTIFIC_REPS.drill.max,
        false // paceSeconds는 50m 전체 시간 (per set)
      );
      
      const meters = reps * distPerRep;
      // 🎯 페이스를 세트 거리 기준으로 표시 (50m 세트 → 50m 페이스)
      const pacePerSet = paceSeconds; // 이미 50m 기준 페이스
      const equipmentStr = selectedDrill.equipment.length > 0 ? ` (${selectedDrill.equipment.join(', ')})` : '';
      const kickStroke = getStrokeForSetType('drill', setIndex++);
      const desc = `[자유형] ${reps}×${distPerRep}m ${selectedDrill.name}${equipmentStr} @ ${formatPace(pacePerSet)}/${distPerRep}m, r${restSeconds}″`;
      
      sets.push({
        stroke: kickStroke,
        zone: 'Z2',
        restSec: restSeconds,
        rpe: getRPEForZone('Z2'),
        equipment: selectedDrill.equipment,
        subtype: 'DRILL_KICK', // 드릴 파트 - 발차기
        meters,
        desc: desc.replace('[자유형]', `[${getStrokeName(kickStroke)}]`),
        whyPace: `발차기는 전신 수영보다 1.5배 느림 (CSS ${formatPace(adjustedCss)} × 1.5)`,
        whyRest: `Z2 기본 r${restSeconds}″. 기술 유지와 환기 위한 회복`,
        whySet: `${selectedDrill.name}: ${selectedDrill.rationale}`,
        evidenceKeys: ['CSS_VALIDITY_WAKAYOSHI_1992']
      });
      
      console.log('✅ 발차기 드릴 생성:', { reps, meters, desc, stroke: getStrokeName(kickStroke) });
    }
  }
  
  // 5. 메인 세트 (과학적 근거 기반 분할)
  {
    const targetMin = timeAllocation.main;
    
    // 🔬 과학적 근거 기반 메인 세트 분할 결정
    // 근거: Costill et al. (1991) - 최소 10분 이상 지속해야 생리학적 적응
    let mainSplits = 1;
    if (targetMin >= 30) {
      mainSplits = 2; // 30분 이상: 2개로 분할 (각 15분)
    } else if (targetMin >= 45) {
      mainSplits = 3; // 45분 이상: 3개로 분할 (각 15분)
    }
    // 10분 미만이면 분할 없음 (효과 없음)
    
    const timePerMethod = targetMin / mainSplits;
    
    console.log('📊 메인 세트 분할 (과학적 근거):', {
      totalMainTime: targetMin,
      splits: mainSplits,
      timePerMethod,
      rationale: timePerMethod >= 10 ? '✅ 생리학적 적응 충분 (10분+)' : '⚠️ 효과 제한적 (10분 미만)'
    });
    
    for (let i = 0; i < mainSplits; i++) {
      // 🎯 목표별 + 테마별 + 레벨별 훈련법 자동 선택
      const selectedMethod = selectTrainingMethodByGoalAndTheme(opts.goal, theme, adjustedCss, timePerMethod, i, opts.level);
      
      console.log(`🎯 메인 훈련법 ${i + 1}/${mainSplits}:`, {
        goal: opts.goal,
        methodId: selectedMethod.methodId,
        methodName: selectedMethod.name,
        zone: selectedMethod.zone,
        distPerRep: selectedMethod.distPerRep,
        rationale: selectedMethod.rationale
      });
      
      const reps = calculateRepsFromTime(
        timePerMethod,
        selectedMethod.distPerRep,
        selectedMethod.paceSeconds,
        selectedMethod.restSeconds,
        selectedMethod.minReps,
        selectedMethod.maxReps,
        selectedMethod.isPer100m
      );
      
      const meters = reps * selectedMethod.distPerRep;
      // 🎯 페이스 표시: 100m보다 긴 세트는 100m 페이스 + 총 소요 시간 표시
      let paceDescription: string;
      if (selectedMethod.distPerRep > 100) {
        const pacePerSet = (selectedMethod.distPerRep / 100) * selectedMethod.pace100m;
        paceDescription = `@ ${formatPace(selectedMethod.pace100m)}/100m (${formatPace(pacePerSet)}/${selectedMethod.distPerRep}m)`;
      } else {
        const pacePerSet = (selectedMethod.distPerRep / 100) * selectedMethod.pace100m;
        paceDescription = `@ ${formatPace(pacePerSet)}/${selectedMethod.distPerRep}m`;
      }
      const desc = `[자유형] ${reps}×${selectedMethod.distPerRep}m ${selectedMethod.name} ${paceDescription}, r${selectedMethod.restSeconds}″`;
      
      const mainStroke = getStrokeForSetType('main', setIndex++);
      const finalDesc = desc.replace('[자유형]', `[${getStrokeName(mainStroke)}]`);
      
      sets.push({
        stroke: mainStroke,
        zone: selectedMethod.zone,
        restSec: selectedMethod.restSeconds,
        rpe: getRPEForZone(selectedMethod.zone),
        equipment: selectedMethod.equipment || [],
        subtype: i === 0 ? 'MAIN' : 'MAIN_SUB', // 메인 파트 표시
        meters,
        desc: finalDesc,
        whyPace: selectedMethod.whyPace,
        whyRest: selectedMethod.whyRest,
        whySet: selectedMethod.whySet,
        methodId: selectedMethod.methodId,
        evidenceKeys: selectedMethod.evidenceKeys
      });
      
      console.log(`✅ 메인 세트 ${i + 1} 생성:`, { reps, meters, desc: finalDesc, stroke: getStrokeName(mainStroke) });
    }
  }
  
  // 6. 쿨다운 (레벨별 거리 단위)
  {
    const targetMin = timeAllocation.cooldown;
    const levelGroup = (opts.level.split('_')[0]) as keyof typeof LEVEL_DISTANCE_UNITS;
    const levelUnits = LEVEL_DISTANCE_UNITS[levelGroup] || LEVEL_DISTANCE_UNITS.intermediate;
    const distPerRep = levelUnits.cooldown;
    const paceSeconds = adjustedCss + 16; // Z1
    const restSeconds = getRestForZone('Z1');
    
    const reps = calculateRepsFromTime(
      targetMin,
      distPerRep,
      paceSeconds,
      restSeconds,
      SCIENTIFIC_REPS.cooldown.min,
      SCIENTIFIC_REPS.cooldown.max,
      true
    );
    
    const meters = reps * distPerRep;
    // 🎯 페이스를 세트 거리 기준으로 표시 (50m 세트 → 50m 페이스)
    const cooldownStroke = getStrokeForSetType('cooldown', setIndex++);
    const desc = `[자유형] ${reps}×${distPerRep}m 쿨다운 @ ${formatPace(paceSeconds)}/${distPerRep}m, r${restSeconds}″`;
    
    sets.push({
      stroke: cooldownStroke,
      zone: 'Z1',
      restSec: restSeconds,
      rpe: getRPEForZone('Z1'),
      equipment: [],
      subtype: 'COOLDOWN', // 쿨다운 파트 표시
      meters,
      desc: desc.replace('[자유형]', `[${getStrokeName(cooldownStroke)}]`),
      whyPace: 'CSS 기반 Z1(회복) → 호흡·기술 정렬, 젖산 제거 촉진',
      whyRest: `Z1 기본 r${restSeconds}″. 저강도 회복/환기`,
      whySet: '쿨다운으로 젖산 제거 촉진, 회복 시작',
      evidenceKeys: ['CSS_VALIDITY_WAKAYOSHI_1992']
    });
    
    console.log('✅ 쿨다운 생성:', { reps, meters, desc, stroke: getStrokeName(cooldownStroke) });
  }
  
  // 7. 최종 검증: 실제 소요 시간 계산
  let totalMinutes = 0;
  let totalMeters = 0;
  
  sets.forEach((set, idx) => {
    const match = set.desc.match(/(\d+)×(\d+)m/);
    if (!match) return;
    
    const reps = parseInt(match[1]);
    const distPerRep = parseInt(match[2]);
    
    // 🎯 페이스 파싱: "@ 1:05/50m" 또는 "@ 2:00/100m (6:00/300m)" 형식
    const paceMatch = set.desc.match(/@\s*(\d+):(\d+)\/(\d+)m/);
    
    if (paceMatch) {
      const paceSeconds = parseInt(paceMatch[1]) * 60 + parseInt(paceMatch[2]);
      const paceDistance = parseInt(paceMatch[3]); // 50m, 100m, 300m 등
      
      // 페이스를 100m 기준으로 환산
      const pace100m = (paceSeconds / paceDistance) * 100;
      
      const duration = calculateSetDuration(reps, distPerRep, pace100m, set.restSec, true);
      totalMinutes += duration;
      totalMeters += set.meters;
      
      console.log(`✅ 세트 ${idx + 1} 검증:`, {
        desc: set.desc.substring(0, 60),
        reps,
        distPerRep,
        paceSeconds,
        paceDistance,
        pace100m: pace100m.toFixed(1),
        meters: set.meters,
        duration: duration.toFixed(1) + '분'
      });
    }
  });
  
  console.log('🎯 최종 검증:', {
    targetMinutes: opts.targetMinutes,
    actualMinutes: totalMinutes.toFixed(1),
    accuracy: ((totalMinutes / opts.targetMinutes) * 100).toFixed(1) + '%',
    totalMeters
  });
  
  return {
    date: new Date().toISOString().slice(0, 10),
    theme,
    themeDesc: themeDescriptions[theme],
    sets,
    totalMeters,
    estimatedMinutes: Math.round(totalMinutes),
    usedMethodIds: sets.filter(s => s.methodId).map(s => s.methodId!),
    strokeWarnings: strokeWarnings.length > 0 ? strokeWarnings : undefined
  };
}

