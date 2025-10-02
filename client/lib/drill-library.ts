/**
 * 드릴/훈련유형 카탈로그
 * 
 * 연동되는 데이터:
 * - 수영 기술 체크리스트 결과
 * - 영법별 드릴 데이터베이스
 * - 훈련 목적별 드릴 분류
 * 
 * 연동되는 파일:
 * - lib/planner.ts (드릴 추천 및 매칭)
 * - components/PlannerForm.tsx (기술 체크리스트)
 * - data/swimming-checklist.ts (체크리스트 데이터)
 */

export type DrillCategory = 'warmup' | 'technique' | 'endurance' | 'threshold' | 'vo2max' | 'sprint' | 'cooldown';
export type Stroke = 'freestyle' | 'backstroke' | 'breaststroke' | 'butterfly' | 'mixed';
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export interface Drill {
  id: string;
  name: string;
  description: string;
  category: DrillCategory;
  stroke: Stroke;
  difficulty: Difficulty;
  duration: number; // 분
  distance: number; // 미터
  rest: number; // 초
  pace: string; // 페이스 설명
  cues: string[]; // 코칭 큐
  equipment?: string[]; // 필요한 장비
  contraindications?: string[]; // 금기사항
  techniqueFocus: string[]; // 기술 포커스
}

export interface TechniqueChecklist {
  freestyle: {
    followThrough: boolean;
    eliteCatch: boolean;
    crossover: boolean;
    highElbow: boolean;
    bilateralBreathing: boolean;
    kickTempo: boolean;
    headPosition: boolean;
  };
  backstroke: {
    bodyPosition: boolean;
    armRecovery: boolean;
    kickTiming: boolean;
    headPosition: boolean;
  };
  breaststroke: {
    kickTiming: boolean;
    pullTiming: boolean;
    breathing: boolean;
    glide: boolean;
  };
  butterfly: {
    bodyUndulation: boolean;
    armRecovery: boolean;
    kickTiming: boolean;
    breathing: boolean;
  };
}

// 드릴 라이브러리
export const DRILL_LIBRARY: Drill[] = [
  // 워밍업 드릴
  {
    id: 'wu_easy_swim',
    name: 'Easy Swim',
    description: '편안한 페이스로 자유형 수영',
    category: 'warmup',
    stroke: 'freestyle',
    difficulty: 'beginner',
    duration: 5,
    distance: 200,
    rest: 0,
    pace: 'Z1-Z2',
    cues: ['편안한 페이스', '호흡 조절', '몸 풀기'],
    techniqueFocus: ['기본 자세', '호흡']
  },
  {
    id: 'wu_6_1_6',
    name: '6-1-6 Drill',
    description: '6번 킥, 1번 풀, 6번 킥 패턴',
    category: 'warmup',
    stroke: 'freestyle',
    difficulty: 'intermediate',
    duration: 8,
    distance: 300,
    rest: 30,
    pace: 'Z2',
    cues: ['하이엘보 유지', '킥 타이밍', '몸 회전'],
    techniqueFocus: ['하이엘보', '킥 타이밍', '몸 회전']
  },
  
  // 기술 드릴
  {
    id: 'tech_fingertip_drag',
    name: 'Fingertip Drag',
    description: '손가락 끝으로 물 표면을 드래그하며 리커버리',
    category: 'technique',
    stroke: 'freestyle',
    difficulty: 'intermediate',
    duration: 10,
    distance: 400,
    rest: 20,
    pace: 'Z2',
    cues: ['크로스오버 방지', '하이엘보', '손가락 끝 드래그'],
    techniqueFocus: ['리커버리', '크로스오버 방지', '하이엘보']
  },
  {
    id: 'tech_catch_up',
    name: 'Catch Up',
    description: '한 팔이 다른 팔을 따라잡을 때까지 기다리는 드릴',
    category: 'technique',
    stroke: 'freestyle',
    difficulty: 'beginner',
    duration: 8,
    distance: 300,
    rest: 25,
    pace: 'Z2',
    cues: ['긴 몸선', '풀 동작 완성', '균형 유지'],
    techniqueFocus: ['풀 동작', '몸선', '균형']
  },
  {
    id: 'tech_sculling',
    name: 'Sculling',
    description: '손목과 팔꿈치를 이용한 물 밀기 연습',
    category: 'technique',
    stroke: 'freestyle',
    difficulty: 'intermediate',
    duration: 12,
    distance: 500,
    rest: 30,
    pace: 'Z2',
    cues: ['손목 유연성', '물 밀기', '압력 감각'],
    techniqueFocus: ['캐치', '물 밀기', '압력 감각']
  },
  
  // 지구력 드릴
  {
    id: 'endurance_steady',
    name: 'Steady Endurance',
    description: '지속적인 페이스로 장거리 수영',
    category: 'endurance',
    stroke: 'freestyle',
    difficulty: 'beginner',
    duration: 20,
    distance: 1000,
    rest: 0,
    pace: 'Z2-Z3',
    cues: ['일정한 페이스', '호흡 리듬', '몸 이완'],
    techniqueFocus: ['페이스 유지', '호흡', '이완']
  },
  {
    id: 'endurance_pyramid',
    name: 'Pyramid Set',
    description: '거리를 점진적으로 늘렸다가 줄이는 피라미드 세트',
    category: 'endurance',
    stroke: 'freestyle',
    difficulty: 'intermediate',
    duration: 25,
    distance: 1200,
    rest: 15,
    pace: 'Z3',
    cues: ['점진적 강도 증가', '페이스 유지', '회복'],
    techniqueFocus: ['페이스 유지', '강도 조절', '회복']
  },
  
  // 임계점 드릴
  {
    id: 'threshold_cruise',
    name: 'Threshold Cruise',
    description: '임계점 근처에서 지속적인 수영',
    category: 'threshold',
    stroke: 'freestyle',
    difficulty: 'intermediate',
    duration: 15,
    distance: 800,
    rest: 20,
    pace: 'CSS+5-8초',
    cues: ['임계점 유지', '호흡 조절', '몸 이완'],
    techniqueFocus: ['임계점 유지', '호흡', '이완']
  },
  {
    id: 'threshold_ladder',
    name: 'Threshold Ladder',
    description: '거리를 늘려가며 임계점 페이스 유지',
    category: 'threshold',
    stroke: 'freestyle',
    difficulty: 'advanced',
    duration: 20,
    distance: 1000,
    rest: 30,
    pace: 'CSS+3-5초',
    cues: ['임계점 유지', '거리 증가', '회복'],
    techniqueFocus: ['임계점 유지', '거리 증가', '회복']
  },
  
  // VO2max 드릴
  {
    id: 'vo2max_intervals',
    name: 'VO2max Intervals',
    description: '최대 산소 섭취량 향상을 위한 인터벌',
    category: 'vo2max',
    stroke: 'freestyle',
    difficulty: 'advanced',
    duration: 12,
    distance: 600,
    rest: 60,
    pace: 'Z5',
    cues: ['최대 강도', '호흡 조절', '회복'],
    techniqueFocus: ['최대 강도', '호흡', '회복']
  },
  
  // 스프린트 드릴
  {
    id: 'sprint_25s',
    name: '25m Sprints',
    description: '25m 최대 속도 스프린트',
    category: 'sprint',
    stroke: 'freestyle',
    difficulty: 'intermediate',
    duration: 8,
    distance: 200,
    rest: 90,
    pace: '최대 속도',
    cues: ['최대 속도', '빠른 턴', '회복'],
    techniqueFocus: ['최대 속도', '턴', '회복']
  },
  
  // 쿨다운 드릴
  {
    id: 'cd_easy_swim',
    name: 'Easy Swim',
    description: '편안한 페이스로 쿨다운',
    category: 'cooldown',
    stroke: 'freestyle',
    difficulty: 'beginner',
    duration: 5,
    distance: 200,
    rest: 0,
    pace: 'Z1',
    cues: ['편안한 페이스', '몸 이완', '호흡 조절'],
    techniqueFocus: ['이완', '호흡']
  }
];

/**
 * 기술 체크리스트 기반 드릴 추천
 * @param checklist 기술 체크리스트
 * @param category 드릴 카테고리
 * @returns 추천 드릴 배열
 */
export function getRecommendedDrills(
  checklist: TechniqueChecklist,
  category: DrillCategory
): Drill[] {
  const recommended: Drill[] = [];
  
  // 카테고리별 드릴 필터링
  const categoryDrills = DRILL_LIBRARY.filter(drill => drill.category === category);
  
  // 기술 체크리스트 기반 추천
  if (category === 'technique') {
    // 자유형 기술 문제 기반 추천
    if (!checklist.freestyle.crossover) {
      recommended.push(...categoryDrills.filter(drill => 
        drill.techniqueFocus.includes('크로스오버 방지') || 
        drill.techniqueFocus.includes('리커버리')
      ));
    }
    
    if (!checklist.freestyle.highElbow) {
      recommended.push(...categoryDrills.filter(drill => 
        drill.techniqueFocus.includes('하이엘보')
      ));
    }
    
    if (!checklist.freestyle.bilateralBreathing) {
      recommended.push(...categoryDrills.filter(drill => 
        drill.techniqueFocus.includes('호흡')
      ));
    }
  }
  
  // 기본 드릴 추가 (추천이 없는 경우)
  if (recommended.length === 0) {
    recommended.push(...categoryDrills.slice(0, 2));
  }
  
  return recommended;
}

/**
 * 기술 체크리스트 기반 코칭 큐 생성
 * @param checklist 기술 체크리스트
 * @returns 코칭 큐 배열
 */
export function getCoachingCues(checklist: TechniqueChecklist): string[] {
  const cues: string[] = [];
  
  // 자유형 기술 문제 기반 큐
  if (!checklist.freestyle.crossover) {
    cues.push('크로스오버 방지', '하이엘보 유지');
  }
  
  if (!checklist.freestyle.highElbow) {
    cues.push('하이엘보 유지', '리커버리 높게');
  }
  
  if (!checklist.freestyle.bilateralBreathing) {
    cues.push('양측 호흡 연습', '호흡 리듬 유지');
  }
  
  if (!checklist.freestyle.kickTempo) {
    cues.push('킥 타이밍 조절', '킥 리듬 유지');
  }
  
  if (!checklist.freestyle.headPosition) {
    cues.push('머리 위치 유지', '시선 아래');
  }
  
  // 배영 기술 문제 기반 큐
  if (!checklist.backstroke.bodyPosition) {
    cues.push('몸 자세 유지', '엎드린 자세');
  }
  
  if (!checklist.backstroke.armRecovery) {
    cues.push('팔 리커버리 높게', '직선 리커버리');
  }
  
  // 평영 기술 문제 기반 큐
  if (!checklist.breaststroke.kickTiming) {
    cues.push('킥 타이밍 조절', '킥 리듬 유지');
  }
  
  if (!checklist.breaststroke.pullTiming) {
    cues.push('풀 타이밍 조절', '풀 리듬 유지');
  }
  
  // 접영 기술 문제 기반 큐
  if (!checklist.butterfly.bodyUndulation) {
    cues.push('몸 파도 동작', '몸 움직임 조절');
  }
  
  if (!checklist.butterfly.armRecovery) {
    cues.push('팔 리커버리 높게', '직선 리커버리');
  }
  
  return [...new Set(cues)];
}

/**
 * 드릴 카테고리별 기본 드릴 조회
 * @param category 드릴 카테고리
 * @param difficulty 난이도
 * @returns 드릴 배열
 */
export function getDrillsByCategory(
  category: DrillCategory,
  difficulty?: Difficulty
): Drill[] {
  let drills = DRILL_LIBRARY.filter(drill => drill.category === category);
  
  if (difficulty) {
    drills = drills.filter(drill => drill.difficulty === difficulty);
  }
  
  return drills;
}

/**
 * 영법별 드릴 조회
 * @param stroke 영법
 * @param category 드릴 카테고리
 * @returns 드릴 배열
 */
export function getDrillsByStroke(
  stroke: Stroke,
  category?: DrillCategory
): Drill[] {
  let drills = DRILL_LIBRARY.filter(drill => drill.stroke === stroke);
  
  if (category) {
    drills = drills.filter(drill => drill.category === category);
  }
  
  return drills;
}

/**
 * 드릴 ID로 드릴 조회
 * @param id 드릴 ID
 * @returns 드릴 또는 null
 */
export function getDrillById(id: string): Drill | null {
  return DRILL_LIBRARY.find(drill => drill.id === id) || null;
}

/**
 * 기술 체크리스트 기반 전체 추천 드릴 조회
 * @param checklist 기술 체크리스트
 * @returns 카테고리별 추천 드릴
 */
export function getAllRecommendedDrills(checklist: TechniqueChecklist): Record<DrillCategory, Drill[]> {
  const categories: DrillCategory[] = ['warmup', 'technique', 'endurance', 'threshold', 'vo2max', 'sprint', 'cooldown'];
  const result: Record<DrillCategory, Drill[]> = {} as Record<DrillCategory, Drill[]>;
  
  categories.forEach(category => {
    result[category] = getRecommendedDrills(checklist, category);
  });
  
  return result;
}

