/**
 * 🏊 JJ Swim Lab - 수영 프로그램 생성 엔진 v3.1 (Explainable + 25 Methods + 40 Drills)
 * 
 * 연동되는 데이터:
 * - CSS (Critical Swim Speed) - 영법별 100m당 초
 * - Zone 기반 페이스 및 휴식 시간
 * - 컨디션 및 질환 기반 자동 조정
 * - **25개 훈련법 자동 로테이션** (client/src/swimlab/data/trainingMethods.ts)
 * - **40개 드릴 자동 배치** (client/src/swimlab/data/drills.ts)
 * - 이력 기반 다양성 (같은 훈련법 3주 연속 방지)
 * - 설명가능성 (Explainability) - 모든 결정에 과학적 근거 첨부
 * 
 * 주요 개선사항 v3.1:
 * - 0×100m 버그 방지
 * - CSS 엄밀 산출
 * - 영법 분배/회피 정확 반영
 * - 컨디션/질환 가감 강화 (chlorine_sensitivity 등)
 * - 주간 타깃 정합성 (시간/거리 정확 매칭)
 * - 25m 풀 스냅
 * - 🔬 설명가능성: whyPace, whyRest, whySet, evidenceKeys
 * - 🎯 목표별 훈련법 자동 선택 (25개 훈련법 풀)
 * - 📚 이력 기반 로테이션 (3주 연속 회피)
 * 
 * 연동되는 파일:
 * - client/types/evidence.ts
 * - client/lib/swimlab/engine-explainable.ts
 * - client/lib/swimlab/condition-rules-v4.ts
 * - client/src/swimlab/data/trainingMethods.ts (25개)
 * - client/src/swimlab/data/drills.ts (40개)
 */

import { EvidenceKey } from '@/types/evidence';
import { makeExplainableSet, type ExplainableSetItem } from '@/lib/swimlab/engine-explainable';
import { aggregateConditionRules, type ConditionRuleResult } from '@/lib/swimlab/condition-rules-v4';
import { TRAINING_METHODS } from '@/src/swimlab/data/trainingMethods';
import { DRILLS } from '@/src/swimlab/data/drills';

type Stroke = 'freestyle' | 'backstroke' | 'breaststroke' | 'butterfly' | 'elementary_backstroke' | 'sidestroke';
type Zone = 'Z1' | 'Z2' | 'Z3' | 'Z4' | 'Z5';
type ConditionId = 'chlorine_sensitivity' | 'asthma' | 'shoulder_impingement' | 'knee_pain' | string;

// 🎯 레벨별 허용 영법
const LEVEL_ALLOWED_STROKES: Record<string, Stroke[]> = {
  'beginner': ['freestyle', 'backstroke', 'breaststroke'], // 초급: 기본 3가지
  'intermediate': ['freestyle', 'backstroke', 'breaststroke', 'butterfly'], // 중급: 접영 추가
  'intermediate_1': ['freestyle', 'backstroke', 'breaststroke', 'butterfly'],
  'intermediate_2': ['freestyle', 'backstroke', 'breaststroke', 'butterfly'],
  'advanced': ['freestyle', 'backstroke', 'breaststroke', 'butterfly', 'elementary_backstroke', 'sidestroke'], // 상급: 기본배영, 횡영 추가
  'advanced_1': ['freestyle', 'backstroke', 'breaststroke', 'butterfly', 'elementary_backstroke', 'sidestroke'],
  'advanced_2': ['freestyle', 'backstroke', 'breaststroke', 'butterfly', 'elementary_backstroke', 'sidestroke'],
  'master': ['freestyle', 'backstroke', 'breaststroke', 'butterfly', 'elementary_backstroke', 'sidestroke'], // 마스터: 모든 영법
  'expert': ['freestyle', 'backstroke', 'breaststroke', 'butterfly', 'elementary_backstroke', 'sidestroke'] // 전문가: 모든 영법
};

// 🎯 레벨별 기준 CSS 추정 (초급/중급용, 실측 CSS 없을 때)
// 근거: 일반 성인 수영 능력 분포 (YMCA, Red Cross 기준)
const LEVEL_ESTIMATED_CSS: Record<string, Record<string, number>> = {
  'beginner': {
    freestyle: 150,    // 초급: 2분30초/100m (매우 느림, 기술 미숙)
    backstroke: 165,   // 자유형보다 10% 느림
    breaststroke: 180, // 자유형보다 20% 느림
    butterfly: 165     // 접영은 초급에 없지만 추정
  },
  'intermediate': {
    freestyle: 120,    // 중급: 2분/100m (기술 숙달 중)
    backstroke: 132,   // 자유형보다 10% 느림
    breaststroke: 144, // 자유형보다 20% 느림
    butterfly: 132     // 자유형보다 10% 느림
  },
  'intermediate_1': {
    freestyle: 110,
    backstroke: 121,
    breaststroke: 132,
    butterfly: 121
  },
  'intermediate_2': {
    freestyle: 100,
    backstroke: 110,
    breaststroke: 120,
    butterfly: 110
  },
  'advanced': {
    freestyle: 90,     // 상급: 1분30초/100m (CSS 측정 권장)
    backstroke: 99,
    breaststroke: 108,
    butterfly: 99
  },
  'advanced_1': {
    freestyle: 85,
    backstroke: 93,
    breaststroke: 102,
    butterfly: 93
  },
  'advanced_2': {
    freestyle: 80,
    backstroke: 88,
    breaststroke: 96,
    butterfly: 88
  },
  'master': {
    freestyle: 75,     // 마스터: 1분15초/100m
    backstroke: 82,
    breaststroke: 90,
    butterfly: 82
  },
  'expert': {
    freestyle: 70,     // 전문가: 1분10초/100m
    backstroke: 77,
    breaststroke: 84,
    butterfly: 77
  }
};

// 🎯 레벨별 드릴 필터 매핑 (드릴 who 필드 → 회원 레벨)
const LEVEL_TO_DRILL_WHO: Record<string, string[]> = {
  'beginner': ['초보~중급', '모든 수준', '초보'], // 초급: 초보 드릴만
  'intermediate': ['초보~중급', '중급~상급', '모든 수준', '중급'], // 중급: 초보~중급, 중급 드릴
  'intermediate_1': ['초보~중급', '중급~상급', '모든 수준', '중급'],
  'intermediate_2': ['초보~중급', '중급~상급', '모든 수준', '중급'],
  'advanced': ['중급~상급', '상급 이상', '모든 수준', '상급', '초보~중급'], // 상급: 중급 이상 드릴
  'advanced_1': ['중급~상급', '상급 이상', '모든 수준', '상급', '초보~중급'],
  'advanced_2': ['중급~상급', '상급 이상', '모든 수준', '상급', '초보~중급'],
  'master': ['모든 수준', '상급 이상', '중급~상급', '마스터'], // 마스터: 모든 드릴
  'expert': ['모든 수준', '상급 이상', '중급~상급', '마스터', '엘리트'] // 전문가: 모든 드릴
};

// 🎯 목표별 훈련법 우선순위 매핑 (25개 훈련법 활용)
const GOAL_TO_METHODS: Record<string, string[]> = {
  '체력 향상': [
    '25', // LSD 장거리 저강도
    '10', // 풀 집중
    '06', // 역치 인터벌
    '05', // 템포 홀드
    '14', // 하이-로우
    '16', // 브로큰 사다리
    '23', // 템포 트레이너
    '24'  // IM 혼합
  ],
  '실력 향상': [
    '06', // 역치 인터벌
    '02', // 디센딩 인터벌
    '07', // 레이스 페이스 (USRPT)
    '08', // 스프린트 반복
    '04', // 빌드업 200
    '21', // 스타트 반응
    '01', // 어센딩 인터벌
    '03'  // 네거티브 스플릿
  ],
  '기술 연마': [
    '13', // 스컬링·캐치 품질
    '18', // 스트로크 카운트 (SPL)
    '09', // 킥 파워 집중
    '11', // 패들 파워
    '20', // 턴·언더워터 돌핀 킥
    '10', // 풀 집중
    '12', // 핀 보조 스피드
    '19'  // 저호흡 (표면·안전중시)
  ],
  '체중 감량': [
    '25', // LSD 장거리 저강도 (지방 연소)
    '10', // 풀 집중
    '14', // 하이-로우 (칼로리 소모)
    '05', // 템포 홀드
    '16', // 브로큰 사다리
    '06', // 역치 인터벌
    '24', // IM 혼합
    '09'  // 킥 파워 집중
  ],
  '재활': [
    '25', // LSD 장거리 저강도 (회복)
    '10', // 풀 집중 (하체 부담↓)
    '13', // 스컬링·캐치 품질
    '18', // 스트로크 카운트 (SPL)
    '05', // 템포 홀드
    '09', // 킥 파워 집중 (부위별)
    '11', // 패들 파워 (어깨 주의)
    '23'  // 템포 트레이너
  ],
  '스트레스 해소': [
    '25', // LSD 장거리 저강도 (명상적)
    '10', // 풀 집중
    '05', // 템포 홀드
    '13', // 스컬링·캐치 품질
    '18', // 스트로크 카운트 (SPL)
    '14', // 하이-로우
    '16', // 브로큰 사다리
    '24'  // IM 혼합
  ],
  '장거리 수영': [
    '25', // LSD 장거리 저강도 (핵심)
    '05', // 템포 홀드 (페이스 유지)
    '06', // 역치 인터벌 (지구력)
    '23', // 템포 트레이너 (리듬 일관성)
    '03', // 네거티브 스플릿 (후반 가속 연습)
    '15', // 브로큰 100/200 (분할 연습)
    '16', // 브로큰 사다리 (변화 적응)
    '18', // 스트로크 카운트 (효율성)
  ],
  '오픈워터': [
    '22', // 오픈워터 모의 (사이팅/드래프팅) - 핵심
    '25', // LSD 장거리 저강도 (기초 지구력)
    '05', // 템포 홀드 (페이스 유지)
    '06', // 역치 인터벌 (지구력)
    '03', // 네거티브 스플릿 (후반 가속)
    '01', // 어센딩 인터벌 (페이스 조절)
    '18', // 스트로크 카운트 (효율성)
    '13'  // 스컬링 (물감각)
  ],
  '생존수영': [
    '10', // 풀 집중 (하체 부담↓, 호흡 안정)
    '13', // 스컬링·캐치 품질 (손수영)
    '09', // 킥 파워 집중 (트레드워터)
    '25', // LSD 장거리 저강도 (버티기)
    '18', // 스트로크 카운트 (효율성)
    '05', // 템포 홀드 (에너지 절약)
    '23', // 템포 트레이너 (리듬 일관성)
    '11'  // 패들 파워 (주의: 안전 우선)
  ],
  '인명구조원': [
    '06', // 역치 인터벌 (구조 지구력)
    '08', // 스프린트 반복 (접근 속도)
    '25', // LSD 장거리 저강도 (기초 체력)
    '05', // 템포 홀드 (구조 운반)
    '13', // 스컬링·캐치 (물감각)
    '09', // 킥 파워 (서피스 다이브)
    '22', // 오픈워터 모의 (환경 적응)
    '04'  // 빌드업 200 (점진적 강도)
  ]
};

/**
 * 🏊 목적성 있는 드릴 선택 함수 (40개 드릴 활용 + 레벨 필터)
 * 
 * @param type - 드릴 타입 ('pull', 'kick', 'combo')
 * @param theme - 테마 (tech_tempo, endurance, tempo_hi)
 * @param goal - 운동 목표
 * @param level - 회원 레벨 (beginner, intermediate, advanced, master, expert)
 * @returns 선택된 드릴 정보
 */
function selectDrill(type: 'pull' | 'kick' | 'combo', theme: DayPlan['theme'], goal: string, level?: string): {
  id: string;
  name: string;
  why: string;
  purpose: string;
} {
  // 레벨별 허용 드릴 who 태그
  const memberLevel = level || 'intermediate';
  const allowedWhoTags = LEVEL_TO_DRILL_WHO[memberLevel] || LEVEL_TO_DRILL_WHO['intermediate'];
  
  // 🎯 목적별 드릴 매핑 (40개 드릴 활용)
  const drillsByPurpose = {
    pull: {
      '기술 연마': [
        { id: 'D01', name: 'Catch-Up', why: '타이밍/정렬', purpose: '앞손이 닿을 때까지 대기 → 스트로크 리듬·정렬 교정' },
        { id: 'D05', name: 'Scull', why: '물감각·캐치', purpose: '스컬링으로 물 느끼기 → 추진력·캐치 타이밍 향상' },
        { id: 'D03', name: 'Zipper', why: '하이 엘보', purpose: '옆구리 지퍼 올리듯 → 팔꿈치 높이·회복 궤도 교정' }
      ],
      '실력 향상': [
        { id: 'D06', name: 'Single Arm', why: '편측 강화', purpose: '한쪽 팔만 사용 → 좌우 불균형 교정·캐치 강화' },
        { id: 'D36', name: 'Paddle Pull', why: '추진력·파워', purpose: '패들로 저항 증가 → 스트로크 힘·물감각 향상' },
        { id: 'D02', name: 'Finger Drag', why: '회복 궤도', purpose: '손가락 표면 스치기 → 회복 궤도·정렬 안정화' }
      ],
      '체력 향상': [
        { id: 'D35', name: 'Pull Buoy Steady', why: '상체 지구력', purpose: '풀부이로 장거리 → 상체 근지구력·정렬 유지' },
        { id: 'D05', name: 'Scull', why: '물감각·지속', purpose: '스컬링 지속 → 미세 조정 능력·피로 속 기술 유지' },
        { id: 'D01', name: 'Catch-Up', why: '효율성', purpose: '타이밍 연습 → 에너지 절약·리듬 안정' }
      ],
      '체중 감량': [
        { id: 'D35', name: 'Pull Buoy Continuous', why: '칼로리 소모', purpose: '연속 풀 → 상체 근육 동원·에너지 소비↑' },
        { id: 'D06', name: 'Single Arm', why: '근력·소모', purpose: '편측 집중 → 근육 피로·대사 활성↑' },
        { id: 'D02', name: 'Finger Drag', why: '기술 유지', purpose: '낮은 강도로 기술 유지 → 장시간 지속 가능' }
      ],
      '재활': [
        { id: 'D05', name: 'Scull (Gentle)', why: '저부하 기술', purpose: '부드러운 스컬링 → 관절 부담↓, 물감각 유지' },
        { id: 'D01', name: 'Catch-Up (Slow)', why: '안전한 정렬', purpose: '느린 템포 → 관절 보호·정렬 재학습' },
        { id: 'D35', name: 'Easy Pull', why: '하체 회복', purpose: '풀부이로 하체 쉬게 → 무릎·발목 회복' }
      ],
      '스트레스 해소': [
        { id: 'D05', name: 'Scull (Meditative)', why: '집중·명상', purpose: '물 느끼기 집중 → 마음 진정·스트레스↓' },
        { id: 'D01', name: 'Catch-Up (Flow)', why: '리듬·흐름', purpose: '일정한 리듬 → 명상적 효과·정신 안정' },
        { id: 'D35', name: 'Easy Pull', why: '편안함', purpose: '부드러운 풀 → 긴장 해소·리프레시' }
      ]
    },
    kick: {
      '기술 연마': [
        { id: 'D13', name: 'Flutter Kick (Technique)', why: '킥 기본·정렬', purpose: '발목 유연성·킥 폭 조절 → 효율적 발차기' },
        { id: 'D15', name: 'Side Kick', why: '체간·밸런스', purpose: '옆으로 킥 → 체간 회전·밸런스 감각 향상' },
        { id: 'D14', name: 'Vertical Kick', why: '코어·파워', purpose: '수직 킥 → 코어 안정성·킥 출력 강화' }
      ],
      '실력 향상': [
        { id: 'D16', name: 'Dolphin Kick', why: '전신 협응·파워', purpose: '돌핀 킥 → 신경근 동원·폭발력 향상' },
        { id: 'D27', name: 'Underwater Kick', why: '브레이크아웃·속도', purpose: '수중 킥 → 출발·턴 후 가속 능력↑' },
        { id: 'D14', name: 'Vertical Kick (Hard)', why: '최대 출력', purpose: '고강도 수직 킥 → 킥 최대 파워 개발' }
      ],
      '체력 향상': [
        { id: 'D13', name: 'Flutter Kick (Endurance)', why: '하체 지구력', purpose: '장거리 킥 → 하체 근지구력·심폐 기능↑' },
        { id: 'D15', name: 'Side Kick (Long)', why: '지속력', purpose: '측면 킥 장거리 → 코어·하체 동시 강화' },
        { id: 'D16', name: 'Dolphin Kick (Steady)', why: '전신 지구력', purpose: '지속 돌핀 킥 → 전신 협응·체력 기반' }
      ],
      '체중 감량': [
        { id: 'D13', name: 'Flutter Kick (Continuous)', why: '칼로리 소모', purpose: '연속 킥 → 하체 대근육 동원·에너지↑' },
        { id: 'D14', name: 'Vertical Kick (Interval)', why: '고강도 소모', purpose: '인터벌 수직 킥 → 대사 부스트·지방 연소' },
        { id: 'D16', name: 'Dolphin Kick (Power)', why: '전신 소모', purpose: '전신 돌핀 → 최대 에너지 소비' }
      ],
      '재활': [
        { id: 'D13', name: 'Gentle Flutter', why: '저부하 킥', purpose: '부드러운 킥 → 관절 가동범위 유지, 부담↓' },
        { id: 'D15', name: 'Easy Side Kick', why: '안전한 코어', purpose: '측면 킥(저강도) → 코어 안정화, 부상 방지' },
        { id: 'D35', name: 'Pull Only (No Kick)', why: '하체 휴식', purpose: '킥 없이 풀만 → 하체 완전 회복' }
      ],
      '스트레스 해소': [
        { id: 'D13', name: 'Easy Flutter', why: '리듬·명상', purpose: '편안한 킥 → 반복 리듬·정신 안정' },
        { id: 'D15', name: 'Side Kick (Relaxed)', why: '흐름·여유', purpose: '측면 킥(여유) → 긴장 해소·몰입' },
        { id: 'D16', name: 'Dolphin (Flow)', why: '전신 흐름', purpose: '흐르는 돌핀 → 전신 조화·스트레스↓' }
      ]
    }
  };
  
  // 목표에 맞는 드릴 후보 선택
  const goalDrills = drillsByPurpose[type][goal as keyof typeof drillsByPurpose[typeof type]] 
    || drillsByPurpose[type]['체력 향상']; // 폴백
  
  // 🔍 레벨 필터: 실제 DRILLS 데이터에서 who 필드 확인
  const levelFilteredDrills = goalDrills.filter(drill => {
    const fullDrill = DRILLS.find(d => d.id === drill.id);
    if (!fullDrill) return true; // 드릴을 찾을 수 없으면 허용
    return allowedWhoTags.some(tag => fullDrill.who.includes(tag));
  });
  
  // 필터 후 드릴이 없으면 원본 사용 (안전 장치)
  const filteredDrills = levelFilteredDrills.length > 0 ? levelFilteredDrills : goalDrills;
  
  // 테마에 맞는 드릴 선택
  const themeIndex = {
    tech_tempo: 0,   // 기술 집중 (첫 번째)
    endurance: 1,    // 지구력 지원 (두 번째)
    tempo_hi: 2      // 고강도 대비 (세 번째 또는 첫 번째)
  };
  
  const idx = themeIndex[theme] % filteredDrills.length;
  const selected = filteredDrills[idx];
  
  return {
    id: selected.id,
    name: selected.name,
    why: selected.why,
    purpose: selected.purpose
  };
}

/**
 * 🎯 목적성 있는 훈련법 선택 함수 (이력 기반 다양성)
 * 
 * @param goal - 운동 목표 (체력 향상, 실력 향상, 기술 연마, 체중 감량, 재활, 스트레스 해소)
 * @param theme - 테마 (tech_tempo, endurance, tempo_hi)
 * @param weekHistory - 최근 3주간 사용한 훈련법 ID 목록 (선택사항)
 * @param css100 - 영법별 CSS (초/100m)
 * @param stroke - 영법
 * @param distance - 거리 (m)
 * @returns 선택된 훈련법의 상세 정보
 */
function selectTrainingMethod(
  goal: string, 
  theme: DayPlan['theme'], 
  weekHistory?: string[],
  css100?: Record<string, number>,
  stroke?: Stroke,
  distance?: number
): {
  id: string;
  name: string;
  zone: Zone;
  pace: string;
  whyPace: string;
  whyRest: string;
  purpose: string;
} {
  // 목표에 맞는 훈련법 목록
  const methodIds = GOAL_TO_METHODS[goal] || GOAL_TO_METHODS['체력 향상'];
  
  // 테마에 맞는 훈련법 후보 목록
  let themeIds: string[];
  
  if (theme === 'tech_tempo') {
    // 기술+템포: 역치, 템포 홀드, 스컬링 등
    themeIds = ['06', '05', '13', '18', '23', '01'];
  } else if (theme === 'endurance') {
    // 지구력: LSD, 풀 집중, 브로큰 사다리 등
    themeIds = ['25', '10', '16', '14', '24', '15'];
  } else {
    // tempo_hi: 스프린트, 디센딩, USRPT, 빌드업 등
    themeIds = ['08', '02', '07', '04', '12', '21'];
  }
  
  // 목표와 테마가 모두 일치하는 훈련법 찾기
  let candidates = methodIds.filter(id => themeIds.includes(id));
  
  // 📚 이력 기반 회피 로직: 최근 3주간 사용한 훈련법 제외
  if (weekHistory && weekHistory.length > 0) {
    console.log('📚 훈련법 선택 - 이력:', weekHistory, '후보:', candidates);
    const available = candidates.filter(id => !weekHistory.includes(id));
    if (available.length > 0) {
      candidates = available;
      console.log('✅ 이력 회피 후 후보:', candidates);
    } else {
      console.log('⚠️ 모든 후보가 이력에 있음, 그대로 사용');
    }
    // 모든 후보가 이력에 있으면 그대로 사용 (다양성보다 목적성 우선)
  }
  
  // 첫 번째 후보 선택
  let selectedId = candidates[0];
  console.log('🎯 선택된 훈련법:', selectedId, '테마:', theme, '목표:', goal);
  
  // 후보가 없으면 테마의 기본값 사용
  if (!selectedId) {
    if (theme === 'tech_tempo') {
      selectedId = '06'; // 기본: 역치 인터벌
    } else if (theme === 'endurance') {
      selectedId = '25'; // 기본: LSD
    } else {
      selectedId = '08'; // 기본: 스프린트
    }
  }
  
  // 선택된 훈련법 데이터
  const method = TRAINING_METHODS.find(m => m.id === selectedId);
  
  if (!method) {
    // 폴백: 기본 템포 훈련
    return {
      id: '05',
      name: '템포 홀드',
      zone: 'Z3',
      pace: 'CSS±0″',
      whyPace: 'CSS(=CV) 근처의 역치 강도(MLSS 근사) → 템포/지속 속도 유지 훈련',
      whyRest: 'Z3 역치 근처 반복 유지 위해 20–30″ 권장',
      purpose: '지구력·페이스 안정성 향상, 경제성 개선'
    };
  }
  
  // Zone 매핑 (intensityAndVolume에서 추출)
  const zoneMap: Record<string, Zone> = {
    'Z1': 'Z1', 'Z2': 'Z2', 'Z3': 'Z3', 'Z4': 'Z4', 'Z5': 'Z5'
  };
  const zoneMatch = method.intensityAndVolume.match(/Z([1-5])/);
  const zone: Zone = zoneMatch ? zoneMap[`Z${zoneMatch[1]}`] : 'Z3';
  
  // Pace 추출 및 실제 초로 변환
  let cssAdjustment = 0;
  if (method.howToDo.includes('CSS+')) {
    const match = method.howToDo.match(/CSS\+(\d+)/);
    if (match) cssAdjustment = parseInt(match[1]);
  } else if (method.howToDo.includes('CSS-')) {
    const match = method.howToDo.match(/CSS-(\d+)/);
    if (match) cssAdjustment = -parseInt(match[1]);
  } else if (method.howToDo.includes('@CSS')) {
    cssAdjustment = 0;
  } else if (zone === 'Z1') {
    cssAdjustment = 16;
  } else if (zone === 'Z2') {
    cssAdjustment = 8;
  } else if (zone === 'Z4') {
    cssAdjustment = -8;
  } else if (zone === 'Z5') {
    cssAdjustment = -15;
  }
  
  // 실제 CSS 값으로 페이스 계산
  let pace = 'CSS±0″'; // 기본값
  if (css100 && stroke && distance) {
    const cssValue = css100[stroke] || 90; // 기본값 90초
    const actualPace100 = cssValue + cssAdjustment;
    const actualPaceForDistance = (actualPace100 / 100) * distance;
    pace = formatPace(actualPaceForDistance);
  } else {
    // CSS 값이 없으면 기존 형식 유지
    if (cssAdjustment > 0) pace = `CSS+${cssAdjustment}″`;
    else if (cssAdjustment < 0) pace = `CSS−${Math.abs(cssAdjustment)}″`;
    else pace = 'CSS±0″';
  }
  
  return {
    id: method.id,
    name: method.title,
    zone,
    pace,
    whyPace: `${method.title}: ${method.whenToUse}`,
    whyRest: `${zone} 강도에 적합한 휴식. ${method.pros}`,
    purpose: method.pros
  };
}

export type Input = {
  startDate: string;                 // '2025-10-07'
  days: ('Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun')[];
  weeklyMinutes: number;             // 180
  weeklyMeters: number;              // 7950
  poolLen: 25 | 50 | 33.3 | 36.5;
  strokesAllowed: Stroke[];          // ['freestyle','backstroke']
  strokesAvoid: string[];            // ['breaststroke','sidestroke']
  css100: Record<string, number>;    // sec/100m by stroke (초급/중급은 추정값 사용)
  conditionIds: ConditionId[];       // ['chlorine_sensitivity']
  dayCondition: 'very_good' | 'good' | 'normal' | 'tired' | 'very_tired';
  hasPain?: boolean;
  goal?: string;                     // '체력 향상', '실력 향상', etc.
  level?: string;                    // 'beginner', 'intermediate', 'advanced', 'master'
  weekHistory?: string[];            // 최근 3주간 사용한 훈련법 ID (이력 기반 다양성)
  // 🎯 완료율 기반 강도 조절
  previousWeekCompletionRate?: number; // 이전 주 완료율 (0-100)
  intensityAdjustmentMode?: 'auto' | 'maintain' | 'increase' | 'decrease'; // 강도 조절 모드
  // 🧬 생리학적 지표 (개선 한계 판단용)
  vo2max?: number; // VO2max (ml/kg/min)
  maxHeartRate?: number; // 최고심박수 (bpm)
  restingHeartRate?: number; // 안정심박수 (bpm)
  // 🏥 건강 상태 기반 강도 조절 (과학적 페이스 조정용)
  intensityPercent?: number; // 건강 상태 기반 강도 (70% = 0.7)
};

export type SetItem = {
  stroke: Stroke;
  desc: string;        // e.g., '6×100m @ CSS+0″, r20″'
  meters: number;
  zone: Zone;
  restSec: number;
  rpe?: number;        // RPE 추가
  equipment?: string[]; // 장비 추가
  subtype?: string;    // 팔/발차기/콤비네이션
  
  // 🔬 설명가능성 (Explainability)
  whyPace: string;     // "CSS 기반 Z3(역치) → MLSS 근사, Wakayoshi 1992/1993"
  whyRest: string;     // "Z3 기본 r20″ + 염소 민감 +10″ → r30″ (PCr/젖산동역학)"
  whySet: string;      // "템포 유지력 강화, 기술 무너지지 않는 거리/반복"
  evidenceKeys: EvidenceKey[]; // 과학적 근거 키
};

export type DayPlan = {
  date: string;
  theme: 'tech_tempo' | 'endurance' | 'tempo_hi';
  themeDesc: string; // 테마 설명 (기술+템포, 지구력 등)
  sets: SetItem[];
  totalMeters: number;
  totalDuration: number;
  notes: string[];
  // 🎯 완료율 정보 (실행 후 입력)
  completion?: {
    completionRate: number; // 0-100
    feeling: 'easy' | 'moderate' | 'hard' | 'very_hard';
    inputBy?: string; // 입력자 ID
    inputByRole?: 'self' | 'instructor';
    inputAt?: Date;
    notes?: string;
  };
  // 🌤️ 당일 컨디션 (실행 전 입력)
  dayCondition?: {
    condition: 'very_good' | 'good' | 'normal' | 'tired' | 'very_tired';
    hasPain: boolean;
    painLocation?: string;
    sleepQuality?: number; // 1-10
    stressLevel?: number; // 1-10
    inputBy?: string;
    inputByRole?: 'self' | 'instructor';
    inputAt?: Date;
  };
};

export type WeeklyPlan = {
  goal: string;
  planExplanation: string; // 주간 계획 전체 설명
  days: DayPlan[];
};

/**
 * 🧬 생리학적 지표 기반 개선 한계 판단
 * 
 * 과학적 근거:
 * - VO2max: 심폐 능력의 최고 지표
 * - 최고심박수: 운동 강도 상한
 * - 안정심박수: 회복 능력 지표
 */
function calculateImprovementPotential(input: Input): {
  potential: 'low' | 'moderate' | 'high' | 'elite';
  maxImprovement: number; // %
  recommendedFocus: string;
  scientificFactors: string[];
} {
  let score = 0;
  let factors: string[] = [];
  
  // VO2max 기반 (가장 중요한 지표)
  if (input.vo2max) {
    if (input.vo2max >= 60) {
      score += 3; factors.push('VO2max 매우 높음 (60+)');
    } else if (input.vo2max >= 50) {
      score += 2; factors.push('VO2max 높음 (50-59)');
    } else if (input.vo2max >= 40) {
      score += 1; factors.push('VO2max 보통 (40-49)');
    } else {
      score -= 1; factors.push('VO2max 낮음 (40 미만)');
    }
  }
  
  // 심박수 기반 (회복 능력)
  if (input.maxHeartRate && input.restingHeartRate) {
    const heartRateReserve = input.maxHeartRate - input.restingHeartRate;
    if (heartRateReserve >= 100) {
      score += 2; factors.push('심박수 여유도 우수 (100+)');
    } else if (heartRateReserve >= 80) {
      score += 1; factors.push('심박수 여유도 양호 (80-99)');
    } else {
      score -= 1; factors.push('심박수 여유도 부족 (80 미만)');
    }
  }
  
  // CSS 기반 (현재 수영 능력)
  const cssValues = Object.values(input.css100).filter(v => v > 0);
  if (cssValues.length > 0) {
    const avgCSS = cssValues.reduce((a, b) => a + b, 0) / cssValues.length;
    if (avgCSS <= 80) {
      score += 3; factors.push('CSS 매우 빠름 (80초 이하)');
    } else if (avgCSS <= 90) {
      score += 2; factors.push('CSS 빠름 (80-90초)');
    } else if (avgCSS <= 100) {
      score += 1; factors.push('CSS 보통 (90-100초)');
    } else {
      score -= 1; factors.push('CSS 느림 (100초 초과)');
    }
  } else {
    factors.push('CSS 정보 없음 (레벨 기반 판단)');
  }
  
  // 완료율 (현재 부하 적응도)
  if (input.previousWeekCompletionRate !== undefined) {
    if (input.previousWeekCompletionRate >= 95) {
      score += 2; factors.push('완료율 매우 높음 (95%+)');
    } else if (input.previousWeekCompletionRate >= 85) {
      score += 1; factors.push('완료율 높음 (85-94%)');
    } else if (input.previousWeekCompletionRate < 70) {
      score -= 1; factors.push('완료율 낮음 (70% 미만)');
    }
  }
  
  // 레벨 기반 (추가 점수)
  if (input.level?.includes('advanced') || input.level?.includes('master')) {
    score += 1; factors.push('상급/마스터 레벨');
  }
  
  // 판정
  if (score >= 8) return { 
    potential: 'elite', 
    maxImprovement: 2, 
    recommendedFocus: '기술 정교화 및 세밀한 조정',
    scientificFactors: factors
  };
  if (score >= 5) return { 
    potential: 'high', 
    maxImprovement: 5, 
    recommendedFocus: '체력+기술 종합 발전',
    scientificFactors: factors
  };
  if (score >= 2) return { 
    potential: 'moderate', 
    maxImprovement: 8, 
    recommendedFocus: '기초 체력 강화',
    scientificFactors: factors
  };
  return { 
    potential: 'low', 
    maxImprovement: 12, 
    recommendedFocus: '기초 기술 및 체력 향상',
    scientificFactors: factors
  };
}

/**
 * 완료율 기반 강도 조절 계수 계산
 * 
 * 과학적 근거:
 * - 90% 이상: 강도 증가 (적응 완료)
 * - 80-89%: 현재 강도 유지
 * - 70-79%: 강도 약간 감소
 * - 70% 미만: 강도 대폭 감소 (과부하)
 */
function calculateIntensityAdjustment(
  completionRate: number | undefined,
  mode: 'auto' | 'maintain' | 'increase' | 'decrease' = 'auto'
): number {
  if (mode === 'maintain') return 1.0;
  if (mode === 'increase') return 1.1; // 10% 증가
  if (mode === 'decrease') return 0.9; // 10% 감소
  
  // auto 모드: 완료율 기반 자동 조절
  if (!completionRate) return 1.0; // 완료율 정보 없으면 기본값
  
  if (completionRate >= 90) {
    return 1.05; // 5% 증가 (안전한 증가)
  } else if (completionRate >= 80) {
    return 1.0; // 유지
  } else if (completionRate >= 70) {
    return 0.95; // 5% 감소
  } else {
    return 0.85; // 15% 감소 (과부하 방지)
  }
}

export function generateWeeklyPlan(i: Input): WeeklyPlan {
  // 🧬 생리학적 지표 기반 개선 한계 판단
  const improvementPotential = calculateImprovementPotential(i);
  
  // 🎯 완료율 기반 강도 조절 적용
  const intensityAdjustment = calculateIntensityAdjustment(
    i.previousWeekCompletionRate,
    i.intensityAdjustmentMode
  );
  
  // 🧬 개선 한계를 고려한 추가 조정
  let biologicalAdjustment = 1.0;
  if (improvementPotential.potential === 'elite') {
    biologicalAdjustment = 0.95; // 엘리트는 과부하 방지
  } else if (improvementPotential.potential === 'high') {
    biologicalAdjustment = 1.05; // 높은 잠재력은 약간 증가
  } else if (improvementPotential.potential === 'low') {
    biologicalAdjustment = 0.9; // 낮은 잠재력은 안전하게
  }
  
  // 🏥 건강 상태 기반 거리 조절 (과학적 접근)
  // 70% 강도 → 거리만 70%로 조절, 시간은 그대로 + 페이스 143%로 느리게
  // 결과: 같은 운동 효과, 같은 시간, 안전한 강도
  let healthVolumeAdjustment = 1.0; // 거리만 조절
  if (i.intensityPercent && i.intensityPercent < 1.0) {
    healthVolumeAdjustment = i.intensityPercent; // 70% 강도 → 0.7배 거리
    console.log(`🏥 건강 상태 기반 거리 조절: ${Math.round(i.intensityPercent * 100)}% 강도 → ${Math.round(healthVolumeAdjustment * 100)}% 거리, 시간은 그대로`);
  }
  
  // 최종 조정 계수
  // 시간: 완료율 + 생리학적 지표만 적용 (건강 상태는 시간에 영향 안 줌)
  // 거리: 완료율 + 생리학적 지표 + 건강 상태 모두 적용
  const timeAdjustment = intensityAdjustment * biologicalAdjustment;
  const volumeAdjustment = intensityAdjustment * biologicalAdjustment * healthVolumeAdjustment;
  
  // 조정된 목표 계산
  const adjustedWeeklyMinutes = Math.round(i.weeklyMinutes * timeAdjustment); // 시간은 건강 조절 제외
  const adjustedWeeklyMeters = Math.round(i.weeklyMeters * volumeAdjustment); // 거리는 건강 조절 포함
  
  const perDay = deriveDailyTarget(adjustedWeeklyMinutes, adjustedWeeklyMeters, i.days.length);
  const out: DayPlan[] = [];
  
  // 디버그 로그
  console.log(`🧬 생리학적 지표 기반 개선 한계:`, {
    potential: improvementPotential.potential,
    maxImprovement: improvementPotential.maxImprovement + '%',
    recommendedFocus: improvementPotential.recommendedFocus,
    scientificFactors: improvementPotential.scientificFactors
  });
  
  if (i.previousWeekCompletionRate !== undefined) {
    console.log(`🎯 완료율 기반 강도 조절:`, {
      completionRate: i.previousWeekCompletionRate,
      mode: i.intensityAdjustmentMode || 'auto',
      intensityAdjustment: intensityAdjustment,
      biologicalAdjustment: biologicalAdjustment,
      finalAdjustment: finalAdjustment,
      originalMinutes: i.weeklyMinutes,
      adjustedMinutes: adjustedWeeklyMinutes,
      originalMeters: i.weeklyMeters,
      adjustedMeters: adjustedWeeklyMeters
    });
  }
  
  // 🎯 CSS 측정 주기 확인 (4-8주마다 자동 삽입)
  const shouldIncludeCSSTest = (weekHistory: string[]): boolean => {
    const memberLevel = i.level || 'intermediate';
    const testFrequency = getCSSTestFrequency(memberLevel, i.goal || '체력 향상');
    
    // 이력에서 마지막 CSS 측정 주차 확인
    const lastCSSTestWeek = weekHistory.findLastIndex(id => id === 'CSS_TEST');
    const weeksSinceLastTest = lastCSSTestWeek >= 0 ? weekHistory.length - lastCSSTestWeek : 999;
    
    return weeksSinceLastTest >= testFrequency;
  };
  
  // 🎯 목표별 주간 테마 구성 (선택 목표 중심, 보조 목표 포함)
  const getWeeklyThemes = (goal: string, days: number): DayPlan['theme'][] => {
    if (goal === '기술 연마') {
      // 기술 연마: 70% 기술, 30% 지구력
      if (days === 2) return ['tech_tempo', 'tech_tempo'];
      if (days === 3) return ['tech_tempo', 'tech_tempo', 'endurance'];
      if (days === 4) return ['tech_tempo', 'tech_tempo', 'endurance', 'tech_tempo'];
      if (days === 5) return ['tech_tempo', 'tech_tempo', 'endurance', 'tech_tempo', 'endurance'];
      if (days >= 6) return ['tech_tempo', 'tech_tempo', 'endurance', 'tech_tempo', 'endurance', 'tempo_hi'];
    } else if (goal === '체력 향상') {
      // 체력 향상: 70% 지구력, 30% 기술
      if (days === 2) return ['endurance', 'endurance'];
      if (days === 3) return ['endurance', 'endurance', 'tech_tempo'];
      if (days === 4) return ['endurance', 'endurance', 'tech_tempo', 'endurance'];
      if (days === 5) return ['endurance', 'endurance', 'tech_tempo', 'endurance', 'tech_tempo'];
      if (days >= 6) return ['endurance', 'endurance', 'tech_tempo', 'endurance', 'tech_tempo', 'tempo_hi'];
    } else if (goal === '실력 향상') {
      // 실력 향상: 50% 기술, 30% 지구력, 20% 고강도
      if (days === 2) return ['tech_tempo', 'endurance'];
      if (days === 3) return ['tech_tempo', 'endurance', 'tempo_hi'];
      if (days === 4) return ['tech_tempo', 'tech_tempo', 'endurance', 'tempo_hi'];
      if (days === 5) return ['tech_tempo', 'tech_tempo', 'endurance', 'tempo_hi', 'tech_tempo'];
      if (days >= 6) return ['tech_tempo', 'tech_tempo', 'endurance', 'tempo_hi', 'tech_tempo', 'endurance'];
    } else if (goal === '체중 감량') {
      // 체중 감량: 80% 지구력, 20% 기술
      if (days === 2) return ['endurance', 'endurance'];
      if (days === 3) return ['endurance', 'endurance', 'tech_tempo'];
      if (days === 4) return ['endurance', 'endurance', 'tech_tempo', 'endurance'];
      if (days === 5) return ['endurance', 'endurance', 'tech_tempo', 'endurance', 'endurance'];
      if (days >= 6) return ['endurance', 'endurance', 'tech_tempo', 'endurance', 'endurance', 'tech_tempo'];
    } else if (goal === '재활') {
      // 재활: 80% 기술, 20% 지구력
      if (days === 2) return ['tech_tempo', 'tech_tempo'];
      if (days === 3) return ['tech_tempo', 'tech_tempo', 'endurance'];
      if (days === 4) return ['tech_tempo', 'tech_tempo', 'endurance', 'tech_tempo'];
      if (days === 5) return ['tech_tempo', 'tech_tempo', 'endurance', 'tech_tempo', 'tech_tempo'];
      if (days >= 6) return ['tech_tempo', 'tech_tempo', 'endurance', 'tech_tempo', 'tech_tempo', 'endurance'];
    } else if (goal === '장거리 수영') {
      // 장거리 수영: 90% 지구력, 10% 기술 (페이스 유지 능력 극대화)
      if (days === 2) return ['endurance', 'endurance'];
      if (days === 3) return ['endurance', 'endurance', 'endurance'];
      if (days === 4) return ['endurance', 'endurance', 'endurance', 'tech_tempo'];
      if (days === 5) return ['endurance', 'endurance', 'endurance', 'endurance', 'tech_tempo'];
      if (days >= 6) return ['endurance', 'endurance', 'endurance', 'endurance', 'tech_tempo', 'endurance'];
    } else if (goal === '오픈워터') {
      // 오픈워터: 70% 지구력, 20% 기술, 10% 오픈워터 특화
      if (days === 2) return ['endurance', 'tech_tempo'];
      if (days === 3) return ['endurance', 'endurance', 'tech_tempo'];
      if (days === 4) return ['endurance', 'endurance', 'tech_tempo', 'endurance'];
      if (days === 5) return ['endurance', 'endurance', 'tech_tempo', 'endurance', 'tech_tempo'];
      if (days >= 6) return ['endurance', 'endurance', 'tech_tempo', 'endurance', 'tech_tempo', 'endurance'];
    } else if (goal === '생존수영') {
      // 생존수영: 100% 기술 (안전·기능 중심, 거리/기록 무관)
      if (days === 2) return ['tech_tempo', 'tech_tempo'];
      if (days === 3) return ['tech_tempo', 'tech_tempo', 'tech_tempo'];
      if (days === 4) return ['tech_tempo', 'tech_tempo', 'tech_tempo', 'tech_tempo'];
      if (days === 5) return ['tech_tempo', 'tech_tempo', 'tech_tempo', 'tech_tempo', 'tech_tempo'];
      if (days >= 6) return ['tech_tempo', 'tech_tempo', 'tech_tempo', 'tech_tempo', 'tech_tempo', 'tech_tempo'];
    } else if (goal === '인명구조원') {
      // 인명구조원: 50% 지구력, 30% 고강도, 20% 기술 (과제특이성)
      if (days === 2) return ['endurance', 'tempo_hi'];
      if (days === 3) return ['endurance', 'tempo_hi', 'tech_tempo'];
      if (days === 4) return ['endurance', 'tempo_hi', 'endurance', 'tech_tempo'];
      if (days === 5) return ['endurance', 'tempo_hi', 'endurance', 'tempo_hi', 'tech_tempo'];
      if (days >= 6) return ['endurance', 'tempo_hi', 'endurance', 'tempo_hi', 'tech_tempo', 'endurance'];
    } else {
      // 스트레스 해소: 60% 기술, 40% 지구력
      if (days === 2) return ['tech_tempo', 'endurance'];
      if (days === 3) return ['tech_tempo', 'tech_tempo', 'endurance'];
      if (days === 4) return ['tech_tempo', 'tech_tempo', 'endurance', 'endurance'];
      if (days === 5) return ['tech_tempo', 'tech_tempo', 'endurance', 'endurance', 'tech_tempo'];
      if (days >= 6) return ['tech_tempo', 'tech_tempo', 'endurance', 'endurance', 'tech_tempo', 'endurance'];
    }
    
    // 기본값 (fallback)
    return days >= 3 ? ['tech_tempo', 'endurance', 'tempo_hi'] : ['tech_tempo', 'endurance'];
  };
  
  const dayThemes = getWeeklyThemes(i.goal, i.days.length);
  console.log('📅 주간 테마 설정:', {
    goal: i.goal,
    days: i.days.length,
    themes: dayThemes
  });

  // 📝 주간 훈련 계획 논리 설명 생성
  const getWeeklyPlanExplanation = (goal: string, themes: DayPlan['theme'][]): string => {
    const dayNames = ['월요일', '화요일', '수요일', '목요일', '금요일', '토요일', '일요일'];
    let explanation = '';
    
    if (goal === '기술 연마') {
      explanation = '📋 주간 훈련 계획: 기술 중심으로 구성\n';
      explanation += `• 월화목: 기술+템포 집중 훈련 (동작 패턴 강화)\n`;
      explanation += `• 수금: 지구력 보완 (체력 기반 확립)\n`;
      explanation += `• 전략: 기술 훈련 3일 + 지구력 2일로 균형 유지`;
    } else if (goal === '체력 향상') {
      explanation = '📋 주간 훈련 계획: 체력 중심으로 구성\n';
      explanation += `• 월화목금: 지구력 훈련 (심폐기능 강화)\n`;
      explanation += `• 수요일: 기술 보완 (효율성 향상)\n`;
      explanation += `• 전략: 지구력 4일 + 기술 1일로 체력 극대화`;
    } else if (goal === '실력 향상') {
      explanation = '📋 주간 훈련 계획: 종합 실력 향상\n';
      explanation += `• 월화목: 기술+템포 (기술 기반)\n`;
      explanation += `• 수요일: 지구력 (체력 보완)\n`;
      explanation += `• 금요일: 고강도 (스피드 향상)\n`;
      explanation += `• 전략: 기술 3일 + 지구력 1일 + 고강도 1일로 균형`;
    } else if (goal === '체중 감량') {
      explanation = '📋 주간 훈련 계획: 체중 감량 최적화\n';
      explanation += `• 월화목금: 지구력 훈련 (칼로리 소모 극대화)\n`;
      explanation += `• 수요일: 기술 보완 (운동 효율성)\n`;
      explanation += `• 전략: 지구력 4일 + 기술 1일로 지속적 소모`;
    } else if (goal === '장거리 수영') {
      explanation = '📋 주간 훈련 계획: 장거리 수영 대비\n';
      explanation += `• 월~금: 지구력 훈련 (페이스 유지 능력 극대화)\n`;
      explanation += `• 목표: 3km 이상 장거리 완주 능력 개발\n`;
      explanation += `• 핵심: LSD + 템포 홀드로 일정한 페이스 유지 훈련\n`;
      explanation += `• 전략: 90% 지구력 + 10% 기술로 장거리 적응력 극대화`;
    } else if (goal === '오픈워터') {
      explanation = '📋 주간 훈련 계획: 오픈워터/트라이애슬론 대비\n';
      explanation += `• 월화목: 지구력 훈련 (기초 체력)\n`;
      explanation += `• 수금: 기술 훈련 (사이팅, 드래프팅 연습)\n`;
      explanation += `• 핵심: 실내 풀에서 오픈워터 기술 시뮬레이션\n`;
      explanation += `• 전략: 70% 지구력 + 20% 기술 + 10% OW 특화 훈련`;
    } else if (goal === '생존수영') {
      explanation = '📋 주간 훈련 계획: 생존수영 (교육부 10차시 기준)\n';
      explanation += `• 전 차시: 기능 중심 훈련 (거리/기록 무관)\n`;
      explanation += `• 핵심: 호흡-뜨기-스컬-트레드워터-HELP/허들-구조보조-안전입수\n`;
      explanation += `• 목표: 생존기능 습득 (ALT-PE 극대화)\n`;
      explanation += `• 전략: 100% 기술 + 안전 우선 + 저강도(Z1) 유지`;
    } else if (goal === '인명구조원') {
      explanation = '📋 주간 훈련 계획: 인명구조원 자격 대비\n';
      explanation += `• 월수: 지구력 훈련 (구조 운반 체력)\n`;
      explanation += `• 화목: 고강도 훈련 (접근 속도, 서피스 다이브)\n`;
      explanation += `• 금: 기술 훈련 (엔트리, 접촉, 토우)\n`;
      explanation += `• 전략: 50% 지구력 + 30% 고강도 + 20% 기술 (과제특이성)`;
    } else {
      explanation = '📋 주간 훈련 계획: 맞춤형 구성\n';
      themes.forEach((theme, idx) => {
        const dayName = dayNames[idx] || `${idx + 1}일차`;
        const themeName = theme === 'tech_tempo' ? '기술+템포' : 
                         theme === 'endurance' ? '지구력' : '고강도';
        explanation += `• ${dayName}: ${themeName}\n`;
      });
    }
    
    return explanation;
  };

  // 🎯 테마별 설명 함수 (요일별 훈련 계획 논리 포함)
  const getThemeDescription = (theme: DayPlan['theme'], goal: string, dayIndex: number, weekThemes: DayPlan['theme'][]): string => {
    const dayNames = ['월요일', '화요일', '수요일', '목요일', '금요일', '토요일', '일요일'];
    const prevDayNames = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
    const dayName = dayNames[dayIndex] || `${dayIndex + 1}일차`;
    
    // 전 요일 테마 확인
    const prevDayTheme = dayIndex > 0 ? weekThemes[dayIndex - 1] : null;
    const prevDayName = dayIndex > 0 ? prevDayNames[dayIndex] : null;
    
    if (theme === 'tech_tempo') {
      let explanation = '기술+템포 (역치 인터벌, 스컬링, 캐치업)';
      if (prevDayTheme === 'endurance' && prevDayName) {
        explanation += ` - ${prevDayName} 지구력 훈련 후 기술 집중으로 근육 피로 회복`;
      } else if (prevDayTheme === 'tech_tempo' && prevDayName) {
        explanation += ` - ${prevDayName} 이어 연속 기술 훈련으로 동작 패턴 강화`;
      } else {
        explanation += ' - 주간 목표 중심 훈련';
      }
      return explanation;
    } else if (theme === 'endurance') {
      let explanation = '지구력 (LSD, 풀 부이, 브로큰 사다리)';
      if (prevDayTheme === 'tech_tempo' && prevDayName) {
        explanation += ` - ${prevDayName} 기술 훈련 후 지구력 기반 체력 보완`;
      } else if (prevDayTheme === 'endurance' && prevDayName) {
        explanation += ` - ${prevDayName} 이어 지구력 훈련 연속으로 심폐기능 강화`;
      } else {
        explanation += ' - 체력 기반 확립';
      }
      return explanation;
    } else {
      let explanation = '고강도 (스프린트, 디센딩, USRPT)';
      if (prevDayTheme === 'endurance' && prevDayName) {
        explanation += ` - ${prevDayName} 지구력 훈련 후 스피드 파워 발휘`;
      } else if (prevDayTheme === 'tech_tempo' && prevDayName) {
        explanation += ` - ${prevDayName} 기술 훈련 후 고강도로 스피드 향상`;
      } else {
        explanation += ' - 최고 강도 훈련';
      }
      return explanation;
    }
  };

  // 📚 주간 내 훈련법 이력 추적 (다양성 확보)
  const weekMethodHistory: string[] = [...(i.weekHistory || [])];
  
  // 🎯 CSS 측정 필요 여부 확인
  const needsCSSTest = shouldIncludeCSSTest(i.weekHistory || []);
  const cssTestInserted = needsCSSTest && i.days.length >= 3; // 주 3회 이상만 CSS 측정

  i.days.forEach((day, idx) => {
    // CSS 측정 세션 삽입 (마지막 날)
    if (cssTestInserted && idx === i.days.length - 1) {
      const mainStroke = i.strokesAllowed[0] || 'freestyle';
      const cssSets = buildCSSTestSession({
        poolLen: i.poolLen,
        stroke: mainStroke,
        level: i.level
      });
      
      out.push({
        date: addDays(i.startDate, idx),
        theme: 'tempo_hi',
        themeDesc: '🎯 CSS 측정일 - 현재 수영 능력 평가 및 프로필 업데이트',
        sets: cssSets,
        totalMeters: cssSets.reduce((sum, s) => sum + s.meters, 0),
        totalDuration: perDay.minutes,
        notes: [
          '📊 오늘은 CSS 측정일입니다',
          `✅ ${getStrokeName(mainStroke)} CSS를 측정하여 프로필을 업데이트하세요`,
          '💡 측정 결과는 향후 모든 훈련 페이스의 기준이 됩니다',
          '⚠️ 충분한 워밍업 후 전력으로 수영하세요'
        ]
      });
      
      // CSS 측정 이력 추가
      weekMethodHistory.push('CSS_TEST');
      return;
    }
    
    const theme = dayThemes[idx % dayThemes.length];
    const themeDesc = getThemeDescription(theme, i.goal, idx, dayThemes);
    const base = buildDayPlan({
      theme,
      perDay,
      poolLen: i.poolLen,
      strokesAllowed: i.strokesAllowed,
      strokesAvoid: i.strokesAvoid,
      css100: i.css100,
      goal: i.goal || '체력 향상',
      weekHistory: weekMethodHistory,
      dayIndex: idx, // 요일 인덱스 전달
      level: i.level // 회원 레벨 전달
    });

    // v4 규칙 사용 (28가지 관절질환 + 카테고리별 차등 + 건강 상태 기반 과학적 강도 조절)
    const mod = aggregateConditionRules(
      i.conditionIds,
      i.dayCondition,
      i.hasPain || false,
      i.intensityPercent // 건강 상태 기반 강도 (70% = 0.7)
    );

    const adjusted = applyToSets(base.sets, mod, i.css100, i.poolLen);
    const finalized = finalizePlan(adjusted, perDay.meters, i.poolLen, mod, perDay.minutes);

    // 📚 사용된 훈련법 ID를 이력에 추가 (다음 요일에서 회피)
    if (base.usedMethodIds && base.usedMethodIds.length > 0) {
      weekMethodHistory.push(...base.usedMethodIds);
    }

    out.push({
      date: addDays(i.startDate, idx),
      theme,
      themeDesc,
      sets: finalized.sets,
      totalMeters: finalized.total,
      totalDuration: finalized.totalDuration,
      notes: finalized.notes
    });
  });

  // 📝 주간 계획 설명 생성
  const planExplanation = getWeeklyPlanExplanation(i.goal, dayThemes);

  return { 
    goal: i.goal,
    planExplanation,
    days: out 
  };
}

// ---------- 핵심 함수 5개 ----------

/**
 * 1. deriveDailyTarget - 일일 타깃 계산
 */
function deriveDailyTarget(weeklyMin: number, weeklyM: number, n: number) {
  return {
    minutes: Math.round(weeklyMin / n),           // 60
    meters: Math.round(weeklyM / n / 25) * 25     // 2650 (25m 스냅)
  };
}

/**
 * 헬퍼: 초를 MM:SS 형식으로 변환
 */
function formatPace(seconds: number): string {
  const min = Math.floor(seconds / 60);
  const sec = Math.round(seconds % 60);
  return `${min}:${sec.toString().padStart(2, '0')}`;
}

/**
 * CSS 측정 주기 결정 (목표별)
 * 
 * 과학적 근거:
 * - 초급/중급: 기술 향상이 빠르므로 4주마다 측정
 * - 상급/마스터: 안정기이므로 6-8주마다 측정
 * - 장거리 목표: 유산소 적응이 느리므로 8주
 * - 단거리/스피드: 빠른 적응이므로 4주
 */
function getCSSTestFrequency(level: string, goal: string): number {
  // 레벨 기반
  if (level === 'beginner') return 4; // 4주
  if (level.includes('intermediate')) return 5; // 5주
  
  // 목표 기반 (상급 이상)
  if (goal.includes('장거리') || goal.includes('지구력') || goal.includes('오픈워터')) {
    return 8; // 8주 (유산소 적응 느림)
  }
  if (goal.includes('실력') || goal.includes('스피드') || goal.includes('스프린트')) {
    return 4; // 4주 (빠른 적응)
  }
  
  return 6; // 기본 6주
}

/**
 * CSS 측정 세션 생성 (Wakayoshi 프로토콜)
 * 
 * 표준 프로토콜:
 * - 워밍업 → 400m TT (전력) → 휴식 → 200m TT (전력) → 쿨다운
 * - CSS = (400 - 200) / (T400 - T200) m/s
 */
function buildCSSTestSession(opts: {
  poolLen: number;
  stroke: Stroke;
  level?: string;
}): SetItem[] {
  const sets: SetItem[] = [];
  const testDistance = opts.level && ['beginner', 'intermediate', 'intermediate_1'].includes(opts.level) 
    ? 200 // 초급/중급: 200m + 100m
    : 400; // 상급 이상: 400m + 200m
  const shortDistance = testDistance / 2;
  
  // 워밍업 (800m)
  sets.push({
    stroke: opts.stroke,
    zone: 'Z1',
    restSec: 10,
    rpe: 3,
    equipment: [],
    subtype: undefined,
    meters: 800,
    desc: `[${getStrokeName(opts.stroke)}] 800m 워밍업 @ 편안한 페이스, r자유`,
    whyPace: '충분한 워밍업으로 근육 준비, CSS 테스트 전 컨디션 최적화',
    whyRest: '자유 휴식. 워밍업은 피로 없이 진행',
    whySet: 'CSS 측정 전 필수 워밍업 (근육·관절 준비, 심박수 상승)',
    evidenceKeys: ['CSS_VALIDITY_WAKAYOSHI_1992']
  });
  
  // 1차 측정 (장거리)
  sets.push({
    stroke: opts.stroke,
    zone: 'Z5',
    restSec: 0,
    rpe: 10,
    equipment: [],
    subtype: 'CSS 측정',
    meters: testDistance,
    desc: `[${getStrokeName(opts.stroke)}] ${testDistance}m 전력 수영 (기록 측정) ⏱️`,
    whyPace: '전력 수영: 최대한 빠르게 일정한 페이스 유지. CSS 계산의 첫 번째 데이터',
    whyRest: '측정 세트는 휴식 없음',
    whySet: `CSS 측정 1단계: ${testDistance}m 전력 수영으로 장거리 능력 측정`,
    evidenceKeys: ['CSS_VALIDITY_WAKAYOSHI_1992', 'CSS_MLSS_WAKAYOSHI_1993']
  });
  
  // 충분한 휴식 (10-20분)
  sets.push({
    stroke: opts.stroke,
    zone: 'Z1',
    restSec: 600, // 10분
    rpe: 1,
    equipment: [],
    subtype: undefined,
    meters: 0,
    desc: `💤 완전 회복 휴식 (10-20분) - 호흡 정상화, 젖산 제거`,
    whyPace: 'N/A',
    whyRest: '완전 회복 필수. 2차 측정의 정확도를 위해 젖산 완전 제거',
    whySet: 'CSS 측정 정확도 확보를 위한 충분한 회복 시간',
    evidenceKeys: ['PCR_RECOVERY_BAKER_2010']
  });
  
  // 2차 측정 (단거리)
  sets.push({
    stroke: opts.stroke,
    zone: 'Z5',
    restSec: 0,
    rpe: 10,
    equipment: [],
    subtype: 'CSS 측정',
    meters: shortDistance,
    desc: `[${getStrokeName(opts.stroke)}] ${shortDistance}m 전력 수영 (기록 측정) ⏱️`,
    whyPace: '전력 수영: 최대한 빠르게. CSS 계산의 두 번째 데이터',
    whyRest: '측정 세트는 휴식 없음',
    whySet: `CSS 측정 2단계: ${shortDistance}m 전력 수영으로 단거리 능력 측정`,
    evidenceKeys: ['CSS_VALIDITY_WAKAYOSHI_1992', 'CSS_MLSS_WAKAYOSHI_1993']
  });
  
  // CSS 계산 안내
  sets.push({
    stroke: opts.stroke,
    zone: 'Z1',
    restSec: 0,
    rpe: 1,
    equipment: [],
    subtype: undefined,
    meters: 0,
    desc: `📊 CSS 계산: (${testDistance} - ${shortDistance}) / (T${testDistance} - T${shortDistance}) m/s → 초/100m로 변환`,
    whyPace: 'N/A',
    whyRest: 'N/A',
    whySet: 'Wakayoshi 공식으로 CSS 자동 계산. 결과를 프로필에 저장하여 향후 훈련 페이스 기준으로 사용',
    evidenceKeys: ['CSS_VALIDITY_WAKAYOSHI_1992', 'CSS_MLSS_WAKAYOSHI_1993']
  });
  
  // 쿨다운 (400m)
  sets.push({
    stroke: opts.stroke,
    zone: 'Z1',
    restSec: 10,
    rpe: 2,
    equipment: [],
    subtype: undefined,
    meters: 400,
    desc: `[${getStrokeName(opts.stroke)}] 400m 쿨다운 @ 매우 편안한 페이스`,
    whyPace: '저강도 회복으로 젖산 제거, 근육 이완',
    whyRest: '쿨다운 휴식은 자유',
    whySet: 'CSS 측정 후 충분한 쿨다운으로 회복 시작',
    evidenceKeys: ['CSS_VALIDITY_WAKAYOSHI_1992']
  });
  
  return sets;
}

/**
 * Riegel 공식으로 거리 간 기록 변환
 * T₂ = T₁ × (D₂/D₁)^k
 * k ≈ 1.06 (수영), 근거: Riegel 1981, nku.edu
 */
function convertDistanceTime(time: number, fromDistance: number, toDistance: number): number {
  const k = 1.06; // 수영 피로 지수
  return time * Math.pow(toDistance / fromDistance, k);
}

/**
 * 목표에 따른 최적 CSS 기준 거리
 * 
 * 과학적 근거:
 * - 단거리 목표 → 50-100m CSS (무산소 역치 반영)
 * - 장거리 목표 → 400m CSS (유산소 역치 정확)
 * - Wakayoshi 1993: CSS는 400m+200m 테스트로 측정
 */
function getOptimalCSSDistance(goal: string): number {
  const goalLower = goal.toLowerCase();
  
  // 단거리/스피드 목표 → 100m 기준
  if (goalLower.includes('실력') || goalLower.includes('스피드') || goalLower.includes('스프린트')) {
    return 100;
  }
  
  // 장거리 목표 → 400m 기준
  if (goalLower.includes('장거리') || goalLower.includes('지구력') || goalLower.includes('오픈워터')) {
    return 400;
  }
  
  // 중거리 목표 → 200m 기준
  if (goalLower.includes('체력') || goalLower.includes('재활') || goalLower.includes('기술')) {
    return 200;
  }
  
  // 기본값: 200m (가장 범용적)
  return 200;
}

/**
 * CSS 값 가져오기 또는 변환/추정 (초급/중급 대응, 목표별 최적 거리)
 * 
 * 우선순위:
 * 1. 목표에 맞는 거리의 실측 CSS (예: 장거리 목표 → 400m CSS 우선)
 * 2. 다른 거리 CSS → 목표 거리로 변환 (Riegel 공식)
 * 3. 레벨별 추정값
 */
function getEffectiveCSS(css100Record: Record<string, number>, stroke: Stroke, level?: string, goal?: string): number {
  const strokeKey = stroke === 'freestyle' ? 'freestyle' :
                    stroke === 'backstroke' ? 'backstroke' :
                    stroke === 'breaststroke' ? 'breaststroke' :
                    stroke === 'butterfly' ? 'butterfly' : 'freestyle';
  
  const optimalDistance = getOptimalCSSDistance(goal || '체력 향상');
  
  // 1. 목표에 최적인 거리의 CSS가 있는지 확인
  const optimalKey = optimalDistance === 400 ? `${strokeKey}_400m` :
                     optimalDistance === 200 ? `${strokeKey}_200m` :
                     strokeKey; // 100m는 기본 키
  
  if (css100Record[optimalKey] && css100Record[optimalKey] > 0) {
    // 최적 거리 CSS를 100m 기준으로 변환
    if (optimalDistance !== 100) {
      const css100 = convertDistanceTime(css100Record[optimalKey], optimalDistance, 100);
      console.log(`📏 ${strokeKey} ${optimalDistance}m CSS(${css100Record[optimalKey]}초) → 100m(${css100.toFixed(1)}초) 변환 [목표: ${goal}]`);
      return Math.round(css100);
    }
    return css100Record[optimalKey];
  }
  
  // 2. 다른 거리의 CSS가 있으면 변환
  // 400m → 100m
  if (css100Record[`${strokeKey}_400m`] && css100Record[`${strokeKey}_400m`] > 0) {
    const css100 = convertDistanceTime(css100Record[`${strokeKey}_400m`], 400, 100);
    console.log(`📏 ${strokeKey} 400m(${css100Record[`${strokeKey}_400m`]}초) → 100m(${css100.toFixed(1)}초) 변환`);
    return Math.round(css100);
  }
  
  // 200m → 100m
  if (css100Record[`${strokeKey}_200m`] && css100Record[`${strokeKey}_200m`] > 0) {
    const css100 = convertDistanceTime(css100Record[`${strokeKey}_200m`], 200, 100);
    console.log(`📏 ${strokeKey} 200m(${css100Record[`${strokeKey}_200m`]}초) → 100m(${css100.toFixed(1)}초) 변환`);
    return Math.round(css100);
  }
  
  // 100m 기본 키
  if (css100Record[strokeKey] && css100Record[strokeKey] > 0) {
    return css100Record[strokeKey];
  }
  
  // 50m → 100m
  if (css100Record[`${strokeKey}_50m`] && css100Record[`${strokeKey}_50m`] > 0) {
    const css100 = convertDistanceTime(css100Record[`${strokeKey}_50m`], 50, 100);
    console.log(`📏 ${strokeKey} 50m(${css100Record[`${strokeKey}_50m`]}초) → 100m(${css100.toFixed(1)}초) 변환`);
    return Math.round(css100);
  }
  
  // 25m → 100m
  if (css100Record[`${strokeKey}_25m`] && css100Record[`${strokeKey}_25m`] > 0) {
    const css100 = convertDistanceTime(css100Record[`${strokeKey}_25m`], 25, 100);
    console.log(`📏 ${strokeKey} 25m(${css100Record[`${strokeKey}_25m`]}초) → 100m(${css100.toFixed(1)}초) 변환`);
    return Math.round(css100);
  }
  
  // 3. CSS 없으면 레벨별 추정값 사용
  const memberLevel = level || 'intermediate';
  const estimatedCSS = LEVEL_ESTIMATED_CSS[memberLevel] || LEVEL_ESTIMATED_CSS['intermediate'];
  const finalCSS = estimatedCSS[strokeKey] || 90;
  console.log(`📊 ${strokeKey} CSS 없음 → 레벨(${memberLevel}) 기반 추정: ${finalCSS}초/100m`);
  return finalCSS;
}

/**
 * 2. zonePace - Zone별 페이스 계산 (CSS 기준)
 */
function paceOf(css100: number, zone: Zone, stroke?: Stroke): number {
  // 기본배영과 횡영은 저강도 회복 영법 (CSS 기준 더 느림)
  if (stroke === 'elementary_backstroke') {
    // 기본배영: CSS의 2.5~2.8배 느림 (회복/컨디셔닝 목적)
    return zone === 'Z1' ? Math.round(css100 * 2.8) : Math.round(css100 * 2.5);
  }
  if (stroke === 'sidestroke') {
    // 횡영: CSS의 2.8~3.0배 느림 (체력 절약형)
    return zone === 'Z1' ? Math.round(css100 * 3.0) : Math.round(css100 * 2.8);
  }
  
  // 경영 영법은 CSS 비율 기반 계산 (절대값이 아닌 상대값)
  const z = {
    Z1: css100 * 1.18,   // 회복 (+18% 느림)
    Z2: css100 * 1.09,   // 유산소 (+9% 느림)
    Z3: css100 * 1.00,   // 역치 (CSS 기준)
    Z4: css100 * 0.91,   // VO₂ (-9% 빠름)
    Z5: css100 * 0.83    // 스프린트 (-17% 빠름)
  } as const;
  return Math.round(z[zone]);
}

/**
 * Zone별 RPE 매핑
 */
function rpeOf(zone: Zone): number {
  return ({ Z1: 3, Z2: 5, Z3: 6, Z4: 8, Z5: 10 } as const)[zone];
}

/**
 * Zone별 휴식 시간 (CSS 기반 조정)
 * - 빠른 선수(CSS 낮음)는 회복도 빠름
 * - 느린 선수(CSS 높음)는 회복도 느림
 */
function restOf(zone: Zone, css100?: number): number {
  const baseRest = ({ Z1: 10, Z2: 15, Z3: 20, Z4: 35, Z5: 60 } as const)[zone];
  
  // CSS 제공 시 비율 조정 (기준: CSS 90초)
  if (css100) {
    const cssRatio = css100 / 90; // 90초 기준
    return Math.round(baseRest * cssRatio);
  }
  
  return baseRest;
}

/**
 * 3. buildDayPlan - 테마별 일일 계획 구성
 */
function buildDayPlan(opts: {
  theme: DayPlan['theme'],
  perDay: { minutes: number; meters: number },
  poolLen: number,
  strokesAllowed: Stroke[],
  strokesAvoid: string[],
  css100: Record<string, number>,
  goal: string,
  weekHistory?: string[],
  dayIndex?: number, // 요일 인덱스 (체계적 변화용)
  level?: string // 회원 레벨
}) {
  // 블록 비율
  const quota = { WU: 0.10, PRE: 0.15, MAIN: 0.60, CD: 0.15 };
  const M = opts.perDay.meters;

  // 레벨별 허용 영법 확인
  const memberLevel = opts.level || 'intermediate';
  const levelAllowedStrokes = LEVEL_ALLOWED_STROKES[memberLevel] || LEVEL_ALLOWED_STROKES['intermediate'];
  
  // 사용자 설정 + 레벨 제한 교차 확인
  const finalAllowedStrokes = opts.strokesAllowed.filter(s => levelAllowedStrokes.includes(s));
  
  // 회피 영법 제외한 실제 사용 가능한 영법
  const availableStrokes = finalAllowedStrokes.filter(s => !opts.strokesAvoid.includes(s));
  
  // 과학적 영법 배분: 사용 가능한 영법만으로 비율 계산
  // 배영 회피 시 자유형 100% 사용
  const hasBackstroke = availableStrokes.includes('backstroke');
  const ratio = hasBackstroke ? {
    tech_tempo: { free: 0.6, back: 0.4 },
    endurance: { free: 0.7, back: 0.3 },
    tempo_hi: { free: 0.65, back: 0.35 }
  }[opts.theme] : {
    tech_tempo: { free: 1.0, back: 0.0 },
    endurance: { free: 1.0, back: 0.0 },
    tempo_hi: { free: 1.0, back: 0.0 }
  }[opts.theme];

  const pickStroke = (prefer: 'free' | 'back'): Stroke => {
    // 회피 영법 제외한 실제 사용 가능한 영법 필터링
    const availableStrokes = finalAllowedStrokes.filter(s => !opts.strokesAvoid.includes(s));
    
    // 사용 가능한 영법이 없으면 허용 영법 중 첫 번째 사용 (안전 장치)
    if (availableStrokes.length === 0) {
      console.warn('⚠️ 모든 영법이 회피됨, 허용 영법 중 첫 번째 사용:', finalAllowedStrokes[0]);
      return finalAllowedStrokes[0];
    }
    
    // 선호하는 영법 선택 (회피 영법은 이미 필터링됨)
    if (prefer === 'free' && availableStrokes.includes('freestyle')) return 'freestyle';
    if (prefer === 'back' && availableStrokes.includes('backstroke')) return 'backstroke';
    // 선호 영법이 없으면 첫 번째 사용 가능한 영법
    return availableStrokes[0];
  };
  
  // CSS 기반 휴식 시간 계산 헬퍼 (회원별 회복 속도 반영)
  const getRestFor = (zone: Zone, stroke: Stroke): number => {
    const css = getEffectiveCSS(opts.css100, stroke, memberLevel, opts.goal);
    return restOf(zone, css);
  };

  const sets: SetItem[] = [];

  // WU (10%) - 워밍업: 기본배영/횡영은 전 수업 복습용으로만
  {
    const target = snap25(M * quota.WU, opts.poolLen);
    let s1 = pickStroke('free');
    const n = Math.max(1, Math.round(target / 100));
    
    // 워밍업 영법 선택: 특수 영법은 이력에 있을 때만 (복습 목적)
    const hasRecentElementary = (opts.weekHistory || []).some(id => id.includes('elementary'));
    const hasRecentSide = (opts.weekHistory || []).some(id => id.includes('side'));
    
    if (hasRecentElementary && finalAllowedStrokes.includes('elementary_backstroke')) {
      s1 = 'elementary_backstroke'; // 전 수업에서 배운 기본배영 복습
    } else if (hasRecentSide && finalAllowedStrokes.includes('sidestroke')) {
      s1 = 'sidestroke'; // 전 수업에서 배운 횡영 복습
    } else {
      s1 = pickStroke('free'); // 기본 영법
    }
    
    sets.push({
      stroke: s1,
      zone: 'Z1',
      restSec: restOf('Z1'),
      rpe: rpeOf('Z1'),
      equipment: [],
      subtype: undefined,
      meters: n * 100,
      desc: `[${getStrokeName(s1)}] ${n}×100m 워밍업 @ CSS+16″, r${restOf('Z1')}″`,
      whyPace: 'CSS 기반 Z1(회복) → 호흡·기술 정렬, 젖산 제거 촉진',
      whyRest: `Z1 기본 r${restOf('Z1')}″. 저강도 회복/환기`,
      whySet: s1 === 'elementary_backstroke' ? '기본배영 복습: 전 수업 내용 정착, 저부하 중립자세로 워밍업' :
              s1 === 'sidestroke' ? '횡영 복습: 전 수업 내용 정착, 체력 절약형 영법 강화' :
              '워밍업으로 체온·가동성 확보, 이후 템포 세트 품질 보장',
      evidenceKeys: ['CSS_VALIDITY_WAKAYOSHI_1992', 'CSS_MLSS_WAKAYOSHI_1993']
    });
  }

  // PRE (15%) - 🏊 40개 드릴 자동 배치
  {
    const target = snap25(M * quota.PRE, opts.poolLen);
    // 드릴용 영법: 배영이 사용 가능하면 배영, 아니면 자유형
    const s1 = hasBackstroke ? pickStroke('back') : pickStroke('free');
    const n50 = Math.max(2, Math.round(target / 50));
    
    // 테마별 PRE 구성 비율 (다양성 확보)
    let pullRatio = 0.4, kickRatio = 0.3;
    
    if (opts.theme === 'tech_tempo') {
      // 기술+템포: 팔 드릴 집중
      pullRatio = 0.5; kickRatio = 0.2;
    } else if (opts.theme === 'endurance') {
      // 지구력: 발차기 파워 강화
      pullRatio = 0.3; kickRatio = 0.4;
    } else if (opts.theme === 'tempo_hi') {
      // 템포+고강도: 균형 유지
      pullRatio = 0.35; kickRatio = 0.35;
    }
    
    // 팔/발차기/콤비네이션 세분화
    const pullN = Math.max(0, Math.round(n50 * pullRatio)); // 0 허용
    const kickN = Math.max(0, Math.round(n50 * kickRatio)); // 0 허용
    const comboN = Math.max(1, n50 - pullN - kickN); // 최소 1개는 콤비네이션
    
    // 🏊 40개 드릴 중 목적성 있는 자동 선택 (목표 + 테마 + 레벨 기반)
    // ⚠️ 주의: 드릴은 선택된 영법(s1) 기반으로 작동
    // 자유형이면 자유형 드릴, 배영이면 배영 드릴 사용
    const drillForPull = selectDrill('pull', opts.theme, opts.goal, memberLevel);
    const drillForKick = selectDrill('kick', opts.theme, opts.goal, memberLevel);
    
    // 실제 CSS 값 가져오기 (목표별 최적 거리 자동 선택)
    const cssForStroke = getEffectiveCSS(opts.css100, s1, memberLevel, opts.goal);
    
    console.log('🏊 드릴 섹션 영법:', {
      selectedStroke: s1,
      pullDrill: drillForPull.name,
      kickDrill: drillForKick.name,
      note: '드릴은 선택된 영법 기반 (회피 영법 적용됨)'
    });
    const pullPace50 = (cssForStroke * 1.09) / 2; // 50m 페이스: CSS의 1.09배 (Z2, +9% 느림, 물감각 집중)
    const kickPace50 = (cssForStroke * 1.5) / 2; // 발차기는 CSS의 1.5배 느림 (근육 효율 차이)
    
    // 팔 드릴 (pullN > 0일 때만)
    if (pullN > 0) {
      // 풀부이 사용 여부 결정 (어깨 부상 시 제외)
      const usePullBuoy = !(opts.conditionIds || []).some(id => 
        id.includes('shoulder') || id.includes('rotator')
      );
      
      sets.push({
        stroke: s1,
        zone: 'Z2',
        restSec: restOf('Z2'),
        rpe: rpeOf('Z2'),
        equipment: usePullBuoy ? ['풀부이'] : [],
        subtype: '팔',
        meters: pullN * 50,
        desc: usePullBuoy 
          ? `[${getStrokeName(s1)}] ${pullN}×50m ${drillForPull.name} (풀부이) @ ${formatPace(pullPace50)}, r${restOf('Z2')}″`
          : `[${getStrokeName(s1)}] ${pullN}×50m ${drillForPull.name} @ ${formatPace(pullPace50)}, r${restOf('Z2')}″`,
        whyPace: 'CSS 기반 Z2(유산소 기초) → 미토콘드리아 밀도↑, 지방 대사 개선',
        whyRest: `Z2 기본 r${restOf('Z2')}″. 기술 유지와 환기 위한 짧은 회복`,
        whySet: usePullBuoy 
          ? `${drillForPull.name}: ${drillForPull.why}. 풀부이로 하체 부양 → 상체 기술 집중`
          : `${drillForPull.name}: ${drillForPull.why}. (어깨 부상으로 풀부이 제외)`,
        evidenceKeys: ['CSS_VALIDITY_WAKAYOSHI_1992', 'CSS_MLSS_WAKAYOSHI_1993']
      });
    }
    
    // 발차기 드릴 (kickN > 0일 때만)
    if (kickN > 0) {
      // 킥보드 사용 여부 결정 (무릎/발목 부상 시 제외)
      const useKickboard = !(opts.conditionIds || []).some(id => 
        id.includes('knee') || id.includes('ankle') || id.includes('achilles')
      );
      
      sets.push({
        stroke: s1,
        zone: 'Z2',
        restSec: restOf('Z2'),
        rpe: rpeOf('Z2'),
        equipment: useKickboard ? ['킥보드'] : [],
        subtype: '발차기',
        meters: kickN * 50,
        desc: useKickboard
          ? `[${getStrokeName(s1)}] ${kickN}×50m ${drillForKick.name} (킥보드) @ ${formatPace(kickPace50)}, r${restOf('Z2')}″`
          : `[${getStrokeName(s1)}] ${kickN}×50m ${drillForKick.name} @ ${formatPace(kickPace50)}, r${restOf('Z2')}″`,
        whyPace: `발차기는 전신 수영보다 1.5배 느림 (CSS ${formatPace(cssForStroke)} × 1.5 = ${formatPace(kickPace50)}/50m)`,
        whyRest: `Z2 기본 r${restOf('Z2')}″. 기술 유지와 환기 위한 짧은 회복`,
        whySet: useKickboard
          ? `${drillForKick.name}: ${drillForKick.why}. 킥보드로 상체 지지 → 발차기 기술 집중`
          : `${drillForKick.name}: ${drillForKick.why}. (무릎/발목 부상으로 킥보드 제외)`,
        evidenceKeys: ['CSS_VALIDITY_WAKAYOSHI_1992', 'CSS_MLSS_WAKAYOSHI_1993']
      });
    }
    
    if (comboN > 0) {
      // 테마별 빌드업 변형
      let buildupDesc = '';
      let buildupWhy = '';
      let buildupSet = '';
      let buildupEvidence: EvidenceKey[] = [];
      
      // 실제 CSS 값으로 페이스 범위 계산
      const buildupStart50 = (cssForStroke + 12) / 2;
      const buildupEnd50 = (cssForStroke - 2) / 2;
      const descendStart50 = (cssForStroke + 10) / 2;
      const descendEnd50 = cssForStroke / 2;
      const pyramidEasy50 = (cssForStroke + 8) / 2;
      const pyramidHard50 = (cssForStroke - 5) / 2;
      
      if (opts.theme === 'tech_tempo') {
        // 기본 빌드업 (워밍업→메인 전환)
        buildupDesc = `[${getStrokeName(s1)}] ${comboN}×50m 빌드업 (Z1→Z2→Z3) @ ${formatPace(buildupStart50)}→${formatPace(buildupEnd50)}, r20″`;
        buildupWhy = '빌드업: 점진적 강도 증가 (Easy → Medium → Hard). 워밍업에서 메인 세트로 전환, 심박수·기술 단계적 상승';
        buildupSet = '워밍업→메인 전환, 심리적 준비, 기술-속도 조화';
        buildupEvidence = ['CV_INTERVALS_TOUBEKIS_2011'];
      } else if (opts.theme === 'endurance') {
        // 디센딩 빌드업 (점진적 가속)
        buildupDesc = `[${getStrokeName(s1)}] ${comboN}×50m 디센딩 @ ${formatPace(descendStart50)}→${formatPace(descendEnd50)}, r15″`;
        buildupWhy = '디센딩: 세트마다 페이스 상승 (#1: Easy → #${comboN}: CSS). 페이스 감각과 스피드 조절 능력 향상';
        buildupSet = '페이스 감각 향상, 레이스 시뮬레이션, 지구력 + 속도 조화';
        buildupEvidence = ['CSS_MLSS_WAKAYOSHI_1993'];
      } else {
        // 피라미드 (강도 변화 적응)
        buildupDesc = `[${getStrokeName(s1)}] ${comboN}×50m 피라미드 (Easy→Hard→Easy) @ ${formatPace(pyramidEasy50)}→${formatPace(pyramidHard50)}→${formatPace(pyramidEasy50)}, r20″`;
        buildupWhy = '피라미드: 강도 올렸다 내림 (Easy → Hard → Easy). 피로 상태에서 페이스 컨트롤, 정신력 향상';
        buildupSet = '강도 변화 적응, 페이스 컨트롤 능력, 고강도 전 준비';
        buildupEvidence = ['SPRINT_REST_TOUBEKIS_2005'];
      }
      
      sets.push({
        stroke: s1,
        zone: 'Z2',
        restSec: 20,
        rpe: rpeOf('Z2'),
        equipment: [],
        subtype: '콤비네이션',
        meters: comboN * 50,
        desc: buildupDesc,
        whyPace: buildupWhy,
        whyRest: `변형 세트는 강도 변화가 있어 r20″. 회복 + 다음 세트 준비`,
        whySet: buildupSet,
        evidenceKeys: buildupEvidence
      });
    }
  }

  // MAIN (60%) - 🎯 목적성 있는 훈련법 선택
  {
    const target = snap25(M * quota.MAIN, opts.poolLen);
    
    if (opts.theme === 'tech_tempo') {
      // 기술+템포: 역치 인터벌, 템포 홀드 등
      const freeM = snap25(target * ratio.free, opts.poolLen);
      const backM = target - freeM;

      // 📈 체계적 거리 변화 (200m → 150m → 100m)
      const distances = [200, 150, 100];
      const dayIndex = opts.dayIndex || 0;
      const distance = distances[dayIndex % distances.length];
      
      const nF = Math.max(2, Math.round(freeM / distance));
      const selectedMethodFree = selectTrainingMethod(opts.goal, opts.theme, opts.weekHistory, opts.css100, 'freestyle', distance);
      const methodData = TRAINING_METHODS.find(m => m.id === selectedMethodFree.id);
      
      sets.push({
        stroke: 'freestyle',
        zone: selectedMethodFree.zone,
        restSec: restOf(selectedMethodFree.zone),
        rpe: rpeOf(selectedMethodFree.zone),
        equipment: [],
        subtype: undefined,
        meters: nF * distance,
        desc: `[자유형] ${nF}×${distance}m ${selectedMethodFree.name} @ ${selectedMethodFree.pace}, r${restOf(selectedMethodFree.zone)}″`,
        whyPace: selectedMethodFree.whyPace,
        whyRest: selectedMethodFree.whyRest,
        whySet: `${selectedMethodFree.name}: ${methodData?.pros || selectedMethodFree.purpose} (${distance}m 거리로 집중도 향상)`,
        methodId: selectedMethodFree.id, // 이력 추적용
        evidenceKeys: ['CSS_VALIDITY_WAKAYOSHI_1992', 'CSS_MLSS_WAKAYOSHI_1993', 'CV_INTERVALS_TOUBEKIS_2011']
      });

      // 배영 세트는 backM > 0 일 때만 생성 (회피 영법 고려)
      if (backM > 0 && hasBackstroke) {
        const nB = Math.max(1, Math.round(backM / 100));
        const strokeBack = pickStroke('back'); // 회피 영법 고려
        const selectedMethodBack = selectTrainingMethod(opts.goal, opts.theme, opts.weekHistory, opts.css100, strokeBack, 100);
        sets.push({
          stroke: strokeBack,
          zone: selectedMethodBack.zone,
          restSec: restOf(selectedMethodBack.zone),
          rpe: rpeOf(selectedMethodBack.zone),
          equipment: [],
          subtype: undefined,
          meters: nB * 100,
          desc: `[${getStrokeName(strokeBack)}] ${nB}×100m ${selectedMethodBack.name} @ ${selectedMethodBack.pace}, r${restOf(selectedMethodBack.zone)}″`,
          whyPace: selectedMethodBack.whyPace,
          whyRest: selectedMethodBack.whyRest,
          whySet: `${selectedMethodBack.name}: ${methodData?.pros || selectedMethodBack.purpose}`,
          methodId: selectedMethodBack.id, // 이력 추적용
          evidenceKeys: ['CSS_VALIDITY_WAKAYOSHI_1992', 'CSS_MLSS_WAKAYOSHI_1993', 'CV_INTERVALS_TOUBEKIS_2011']
        });
      }
    }
    else if (opts.theme === 'endurance') {
      // 지구력: LSD, 풀 집중, 하이-로우 등
      const freeM = snap25(target * ratio.free, opts.poolLen);
      const backM = target - freeM;

      // 📈 체계적 거리 변화 (300m → 400m → 500m)
      const distances = [300, 400, 500];
      const dayIndex = opts.dayIndex || 0;
      const distance = distances[dayIndex % distances.length];
      
      const nF = Math.max(2, Math.round(freeM / distance));
      const selectedMethodFreeEnd = selectTrainingMethod(opts.goal, opts.theme, opts.weekHistory, opts.css100, 'freestyle', distance);
      const methodDataEnd = TRAINING_METHODS.find(m => m.id === selectedMethodFreeEnd.id);
      
      sets.push({
        stroke: 'freestyle',
        zone: selectedMethodFreeEnd.zone,
        restSec: restOf(selectedMethodFreeEnd.zone),
        rpe: rpeOf(selectedMethodFreeEnd.zone),
        equipment: [],
        subtype: undefined,
        meters: nF * distance,
        desc: `[자유형] ${nF}×${distance}m ${selectedMethodFreeEnd.name} @ ${selectedMethodFreeEnd.pace}, r${restOf(selectedMethodFreeEnd.zone)}″`,
        whyPace: selectedMethodFreeEnd.whyPace,
        whyRest: selectedMethodFreeEnd.whyRest,
        whySet: `${selectedMethodFreeEnd.name}: ${methodDataEnd?.pros || selectedMethodFreeEnd.purpose} (${distance}m 거리로 지구력 점진적 향상)`,
        methodId: selectedMethodFreeEnd.id, // 이력 추적용
        evidenceKeys: ['CSS_MLSS_WAKAYOSHI_1993']
      });

      // 배영 세트는 backM > 0이고 배영이 사용 가능할 때만 생성
      if (backM > 0 && hasBackstroke) {
        const nB = Math.max(1, Math.round(backM / 200));
        const strokeBackEnd = pickStroke('back'); // 회피 영법 고려
        const selectedMethodBackEnd = selectTrainingMethod(opts.goal, opts.theme, opts.weekHistory, opts.css100, strokeBackEnd, 200);
        sets.push({
          stroke: strokeBackEnd,
          zone: selectedMethodBackEnd.zone,
          restSec: restOf(selectedMethodBackEnd.zone),
          rpe: rpeOf(selectedMethodBackEnd.zone),
          equipment: [],
          subtype: undefined,
          meters: nB * 200,
          desc: `[${getStrokeName(strokeBackEnd)}] ${nB}×200m ${selectedMethodBackEnd.name} @ ${selectedMethodBackEnd.pace}, r${restOf(selectedMethodBackEnd.zone)}″`,
          whyPace: selectedMethodBackEnd.whyPace,
          whyRest: selectedMethodBackEnd.whyRest,
          whySet: `${selectedMethodBackEnd.name}: ${methodDataEnd?.pros || selectedMethodBackEnd.purpose}`,
          methodId: selectedMethodBackEnd.id, // 이력 추적용
          evidenceKeys: ['CSS_MLSS_WAKAYOSHI_1993']
        });
      }
    }
    else {
      // tempo_hi: 스프린트, 디센딩, 레이스 페이스 등
      const freeM = snap25(target * ratio.free, opts.poolLen);
      const backM = target - freeM;

      // 📈 체계적 거리 변화 (150m → 100m → 50m)
      const distances = [150, 100, 50];
      const dayIndex = opts.dayIndex || 0;
      const distance = distances[dayIndex % distances.length];
      
      const nF = Math.max(2, Math.round(freeM / distance));
      const selectedMethodFreeHi = selectTrainingMethod(opts.goal, opts.theme, opts.weekHistory, opts.css100, 'freestyle', distance);
      const methodDataHi = TRAINING_METHODS.find(m => m.id === selectedMethodFreeHi.id);
      
      sets.push({
        stroke: 'freestyle',
        zone: selectedMethodFreeHi.zone,
        restSec: restOf(selectedMethodFreeHi.zone),
        rpe: rpeOf(selectedMethodFreeHi.zone),
        equipment: [],
        subtype: undefined,
        meters: nF * distance,
        desc: `[자유형] ${nF}×${distance}m ${selectedMethodFreeHi.name} @ ${selectedMethodFreeHi.pace}, r${restOf(selectedMethodFreeHi.zone)}″`,
        whyPace: selectedMethodFreeHi.whyPace,
        whyRest: selectedMethodFreeHi.whyRest,
        whySet: `${selectedMethodFreeHi.name}: ${methodDataHi?.pros || selectedMethodFreeHi.purpose} (${distance}m 거리로 스피드 집중도 향상)`,
        methodId: selectedMethodFreeHi.id, // 이력 추적용
        evidenceKeys: ['CSS_VALIDITY_WAKAYOSHI_1992', 'CSS_MLSS_WAKAYOSHI_1993', 'CV_INTERVALS_TOUBEKIS_2011']
      });

      // 배영 세트는 backM > 0이고 배영이 사용 가능할 때만 생성
      if (backM > 0 && hasBackstroke) {
        const nB = Math.max(2, Math.round(backM / 50));
        const strokeBackHi = pickStroke('back'); // 회피 영법 고려
        sets.push({
          stroke: strokeBackHi,
          zone: 'Z4',
          restSec: restOf('Z4'),
          rpe: rpeOf('Z4'),
          equipment: ['패들'],
          subtype: undefined,
          meters: nB * 50,
          desc: `[${getStrokeName(strokeBackHi)}] ${nB}×50m 스피드 (패들) @ CSS−8″, r${restOf('Z4')}″`,
          whyPace: '역치 초과의 고강도(VO₂↑) → 세트 품질 유지를 위해 거리를 짧게',
          whyRest: `Z4 기본 r${restOf('Z4')}″. 고강도는 PCr 재합성·젖산 제거 시간 확보 필요`,
          whySet: '품질 높은 스프린트-유사 자극, 신경근 동원력 향상',
          evidenceKeys: ['CV_INTERVALS_TOUBEKIS_2011', 'SPRINT_REST_TOUBEKIS_2005', 'PCR_RECOVERY_BAKER_2010']
        });
      }
    }
  }

  // CD (15%) - 쿨다운: 평영 과다/부족 시 보완, 횡영 우선
  {
    const target = snap25(M * quota.CD, opts.poolLen);
    const n = Math.max(1, Math.round(target / 50));
    
    // 평영 사용량 분석
    const breastMeters = sets.filter(s => s.stroke === 'breaststroke').reduce((sum, s) => sum + s.meters, 0);
    const breastRatio = breastMeters / M; // 평영 비율
    
    // 쿨다운용 기본 영법: 배영이 사용 가능하면 배영, 아니면 자유형
    let cdStroke: Stroke = hasBackstroke ? pickStroke('back') : pickStroke('free');
    
    // 쿨다운 영법 선택 전략 (상급 이상만)
    if (finalAllowedStrokes.includes('sidestroke') || finalAllowedStrokes.includes('elementary_backstroke')) {
      if (breastRatio > 0.4) {
        // 평영 과다 사용 (40% 이상) → 횡영으로 상체 회복
        if (finalAllowedStrokes.includes('sidestroke')) {
          cdStroke = 'sidestroke';
        }
      } else if (breastRatio < 0.1 && finalAllowedStrokes.includes('breaststroke')) {
        // 평영 거의 안함 (10% 미만) → 쿨다운에 평영 보완
        cdStroke = 'breaststroke';
      } else {
        // 평형적 사용 → 횡영 또는 배영
        if (finalAllowedStrokes.includes('sidestroke')) {
          cdStroke = 'sidestroke';
        }
      }
    }
    
    sets.push({
      stroke: cdStroke,
      zone: 'Z1',
      restSec: restOf('Z1'),
      rpe: rpeOf('Z1'),
      equipment: [],
      subtype: undefined,
      meters: n * 50,
      desc: `[${getStrokeName(cdStroke)}] ${n}×50m 쿨다운 @ CSS+16″, r${restOf('Z1')}″`,
      whyPace: 'CSS 기반 Z1(회복) → 호흡·기술 정렬, 젖산 제거 촉진',
      whyRest: `Z1 기본 r${restOf('Z1')}″. 저강도 회복/환기`,
      whySet: cdStroke === 'sidestroke' ? 
                (breastRatio > 0.4 ? '횡영: 평영 과다 사용(40%+) 후 상체 회복, 편안한 쿨다운' : '횡영: 체력 절약형 영법으로 쿨다운, 회복 시작') :
              cdStroke === 'breaststroke' ?
                '평영 보완: 오늘 평영 부족(10% 미만), 쿨다운에서 균형 맞춤' :
              cdStroke === 'elementary_backstroke' ?
                '기본배영: 저부하 중립자세로 쿨다운, 젖산 제거 촉진' :
              '쿨다운으로 젖산 제거 촉진, 회복 시작',
      evidenceKeys: ['CSS_VALIDITY_WAKAYOSHI_1992']
    });
  }

  // 📚 사용된 훈련법 ID 추출 (이력 추적용)
  const usedMethodIds = sets
    .filter(s => s.methodId)
    .map(s => s.methodId!)
    .filter((id, idx, arr) => arr.indexOf(id) === idx); // 중복 제거

  return { sets, usedMethodIds };
}

// applyModifiers 함수는 aggregateConditionRules로 대체됨 (condition-rules-v4.ts)

/**
 * 5. applyToSets - 세트에 조정사항 적용 (v4 규칙 기반)
 */
function applyToSets(
  sets: SetItem[],
  mod: ConditionRuleResult,
  css100: Record<string, number>,
  poolLen: number
) {
  const out: SetItem[] = [];
  let z4Accum = 0;

  for (const s of sets) {
    // 영법 회피/축소 체크
    const strokeAdj = mod.strokeAdjustments[s.stroke];
    if (strokeAdj?.avoid) {
      continue; // 영법 완전 회피
    }
    
    // 장비 금지 체크
    if (s.equipment && s.equipment.some(eq => mod.equipmentRestrictions.forbiddenEquipment.includes(eq))) {
      // 금지된 장비 제거
      s.equipment = s.equipment.filter(eq => !mod.equipmentRestrictions.forbiddenEquipment.includes(eq));
      s.desc = s.desc.replace(/\(패들\)|\(핀\)/g, '').replace(/스피드\s+@/, '스피드 @').trim();
      s.whySet += ' | 패들 금지됨 (어깨 보호)';
    }
    
    // Z5 금지
    if (s.zone === 'Z5' && !mod.zoneRestrictions.allowZ5) {
      s.zone = 'Z4'; // Z5를 Z4로 다운그레이드
      s.desc = s.desc.replace('스프린트', '고강도').replace(/CSS−15″/, 'CSS−8″') + ' (Z5→Z4)';
      s.whySet += ' | Z5 금지로 Z4로 다운그레이드';
    }

    // Z4 축소 (cap)
    if (s.zone === 'Z4' && mod.zoneRestrictions.z4MaxMeters < Infinity) {
      const keep = Math.min(s.meters, mod.zoneRestrictions.z4MaxMeters - z4Accum);
      if (keep <= 0) continue; // Z4 한도 초과, 제외
      
      if (keep < s.meters) {
        const k = snap25(keep, poolLen);
        const originalReps = parseReps(s.desc);
        const newReps = Math.max(1, Math.round(k / (s.meters / originalReps)));
        s.meters = k;
        s.desc = s.desc.replace(/^(\d+)×/, `${newReps}×`) + ' (Z4 cap 적용)';
        s.whySet += ` | Z4 총량 ≤${mod.zoneRestrictions.z4MaxMeters}m로 제한`;
        z4Accum += k;
      } else {
        z4Accum += s.meters;
      }
    }
    
    // 영법 볼륨 축소
    // 🔧 영법별 강도 조절 (어깨 충돌증후군 등)
    // ✅ 올바른 방식: 거리 유지, 페이스만 느리게 (초 증가)
    if (strokeAdj?.reduceVolume && strokeAdj.volumePct < 1.0) {
      const intensityReduction = 1.0 - strokeAdj.volumePct; // 0.3 (30% 감소)
      const paceIncreaseFactor = 1.0 + (intensityReduction * 0.5); // 1.15 (15% 느리게)
      
      // 🎯 거리는 유지 (운동량 유지)
      // 페이스만 느리게 조절 (desc와 whyPace 업데이트)
      const currentPaceMatch = s.desc.match(/@\s*(\d+):(\d+)/);
      if (currentPaceMatch) {
        const minutes = parseInt(currentPaceMatch[1]);
        const seconds = parseInt(currentPaceMatch[2]);
        const totalSeconds = minutes * 60 + seconds;
        const adjustedSeconds = Math.round(totalSeconds * paceIncreaseFactor);
        const newMinutes = Math.floor(adjustedSeconds / 60);
        const newSeconds = adjustedSeconds % 60;
        
        s.desc = s.desc.replace(/@\s*\d+:\d+/, `@ ${newMinutes}:${newSeconds.toString().padStart(2, '0')}`);
      }
      
      // Zone도 낮춤 (Z4 → Z3, Z3 → Z2)
      if (intensityReduction >= 0.3) {
        if (s.zone === 'Z4') s.zone = 'Z3';
        else if (s.zone === 'Z3') s.zone = 'Z2';
      }
      
      s.whySet += ` | ${s.stroke} 강도 ${Math.round(strokeAdj.volumePct * 100)}%로 조절 (페이스 ${Math.round(paceIncreaseFactor * 100)}%, 질환 관리)`;
    }

    // 🔬 휴식 시간 및 설명 업데이트
    const zoneRestBonus = mod.restBonus[s.zone] || 0;
    const newRest = s.restSec + zoneRestBonus;
    let newWhyRest = s.whyRest;
    
    // 휴식 조정이 있으면 설명 업데이트
    if (zoneRestBonus > 0) {
      const baseRest = s.restSec;
      newWhyRest = `${s.zone} 기본 r${baseRest}″ + 조정 +${zoneRestBonus}″ → r${newRest}″. `;
      
      if (s.zone === 'Z4' || s.zone === 'Z5') {
        newWhyRest += '고강도는 PCr 재합성·젖산 제거 시간 확보 필요';
      } else if (s.zone === 'Z3') {
        newWhyRest += '역치 근처 반복 유지 위해 20–30″ 권장';
      } else {
        newWhyRest += '기술 유지와 환기 위한 회복';
      }
      
      // Evidence 키 업데이트
      if (s.zone === 'Z4' || s.zone === 'Z5') {
        s.evidenceKeys = Array.from(new Set([...s.evidenceKeys, 'PCR_RECOVERY_BAKER_2010', 'SPRINT_REST_TOUBEKIS_2005']));
      }
    }

    // CSS 가감 반영 (v4: 대부분의 질환은 CSS 유지, 예외적으로만 조정)
    const baseCss = css100[s.stroke] ?? css100['freestyle'] ?? 100;
    const adjCss = Math.round(baseCss * (1 + mod.cssPct));
    const zoneCss = paceOf(adjCss, s.zone, s.stroke);
    
    // 첫 세트에서만 디버깅 로그
    if (out.length === 0) {
      console.log('🎯 페이스 조절 적용:', {
        stroke: s.stroke,
        baseCss: baseCss + '초/100m',
        cssPct: (mod.cssPct * 100).toFixed(1) + '%',
        adjCss: adjCss + '초/100m',
        multiplier: (1 + mod.cssPct).toFixed(2) + 'x'
      });
    }
    
    // 설명 문자열 업데이트
    let paced = s.desc.replace(/@ CSS[+−]?\d*″/, `@ ${fmtCss(zoneCss)}`);
    paced = paced.replace(/r\d+″/, `r${newRest}″`);

    out.push({ 
      ...s, 
      restSec: newRest, 
      desc: paced,
      whyRest: newWhyRest
    });
  }

  return out;
}

/**
 * finalizePlan - 최종 거리 보정 및 0×100m 방지
 */
function finalizePlan(
  sets: SetItem[], 
  targetM: number, 
  poolLen: number, 
  mod: ConditionRuleResult,
  targetMinutes?: number // 목표 시간 추가
) {
  // 0×100m 같은 케이스 방지: meters < poolLen이면 삭제
  sets = sets.filter(s => s.meters >= poolLen);

  let total = sets.reduce((s, x) => s + x.meters, 0);
  
  console.log('📊 finalizePlan 총거리 계산:', {
    targetM,
    calculatedTotal: total,
    setsDetail: sets.map(s => ({ desc: s.desc, meters: s.meters, stroke: s.stroke }))
  });

  // 거리 보정 (±8% 허용) - targetM이 0이면 보정하지 않음
  if (targetM > 0) {
    const minT = Math.round(targetM * 0.92 / poolLen) * poolLen;
    const maxT = Math.round(targetM * 1.08 / poolLen) * poolLen;

    // 부족하면 기존 세트를 늘림 (filler 추가 안함)
    if (total < minT) {
      // 가장 큰 메인 세트를 찾아서 1회 추가
      const mainSetIdx = sets.findIndex(s => s.zone === 'Z3' || s.zone === 'Z2');
      if (mainSetIdx >= 0) {
        const originalReps = parseReps(sets[mainSetIdx].desc);
        const repDist = sets[mainSetIdx].meters / originalReps;
        const addReps = Math.ceil((minT - total) / repDist);
        
        sets[mainSetIdx].meters += addReps * repDist;
        sets[mainSetIdx].desc = sets[mainSetIdx].desc.replace(/^(\d+)×/, `${originalReps + addReps}×`);
        total = sets.reduce((s, x) => s + x.meters, 0);
      }
    }

    // 초과하면 세트 축소 (최대 5회까지만)
    let shrinkCount = 0;
    while (total > maxT && shrinkCount < 5) {
      const idx = sets.findIndex(s => s.meters >= 2 * poolLen);
      if (idx < 0) break;
      sets[idx].meters -= poolLen;
      sets[idx].desc = sets[idx].desc.replace(/^(\d+)×/, (match) => {
        const n = parseInt(match);
        return `${Math.max(1, n - 1)}×`;
      });
      total -= poolLen;
      shrinkCount++;
    }
  }

  // 🎯 시간 기반 조절 로직: 시간 초과 시 쿨다운 거리 축소
  // 엔진이 conditionIds/dayCondition 기반으로 페이스를 느리게 조절 → 시간 초과 가능
  // 예: 100m 109초 → 70% 강도 → 139초 페이스로 느려져서 같은 거리에 시간이 더 걸림
  // 해결: 목표 시간 초과 시 쿨다운 거리를 줄여서 전체 시간을 맞춤

  // 예상 소요 시간 계산 (각 세트의 페이스 기반)
  let estimatedMinutes = 0;
  sets.forEach(s => {
    const paceMatch = s.desc.match(/@\s*(\d+):(\d+)/);
    if (paceMatch) {
      const minutes = parseInt(paceMatch[1]);
      const seconds = parseInt(paceMatch[2]);
      const pace100m = minutes * 60 + seconds; // 초/100m
      const estimatedTime = (s.meters / 100) * pace100m / 60; // 분
      estimatedMinutes += estimatedTime + (s.restSec / 60); // 휴식 포함
    } else {
      // 페이스 정보 없으면 기본 90초/100m 가정
      estimatedMinutes += (s.meters / 100) * 1.5 + (s.restSec / 60);
    }
  });

  console.log('⏱️ 시간 기반 조절:', {
    targetMinutes,
    estimatedMinutes: Math.round(estimatedMinutes),
    difference: Math.round(estimatedMinutes - (targetMinutes || 0))
  });

  // 🏥 시간 부족/초과 확인 (과학적 거리 조절로 인해 거의 발생하지 않음)
  // 건강 상태 기반 거리 조절로 인해 시간이 자동으로 맞춰짐
  // 예: 70% 강도 → 거리 70% + 페이스 143% = 시간 약 100%

  // 시간 초과 시 쿨다운 거리 축소 (targetMinutes가 있을 때만)
  if (targetMinutes && estimatedMinutes > targetMinutes * 1.1) {
    const cooldownIdx = sets.findIndex(s => s.desc.includes('쿨다운') || s.zone === 'Z1');
    if (cooldownIdx >= 0 && sets[cooldownIdx].meters > poolLen * 2) {
      const excessMinutes = estimatedMinutes - targetMinutes;
      const metersToReduce = Math.min(
        Math.round(excessMinutes / 1.5 * 100 / poolLen) * poolLen, // 90초/100m 기준
        sets[cooldownIdx].meters - poolLen // 최소 1개 풀은 남김
      );
      
      sets[cooldownIdx].meters -= metersToReduce;
      total -= metersToReduce;
      
      // 세트 설명도 업데이트
      sets[cooldownIdx].desc = sets[cooldownIdx].desc.replace(/^(\d+)×/, (match) => {
        const n = parseInt(match);
        const newReps = Math.max(1, Math.round(sets[cooldownIdx].meters / poolLen / (sets[cooldownIdx].meters / (n * poolLen))));
        return `${newReps}×`;
      });
      
      console.log('⚠️ 시간 초과로 쿨다운 거리 축소:', {
        excessMinutes: Math.round(excessMinutes),
        metersToReduce,
        newCooldownMeters: sets[cooldownIdx].meters
      });
      
      // 시간 재계산
      estimatedMinutes -= (metersToReduce / 100) * 1.5;
    }
  }

  // 최종 시간: targetMinutes가 있으면 그것 사용, 없으면 계산된 시간 사용
  const finalDuration = targetMinutes || Math.round(estimatedMinutes);

  console.log('⏰ finalizePlan 최종 결과:', {
    totalMeters: total,
    estimatedMinutes: Math.round(estimatedMinutes),
    finalDuration,
    setsCount: sets.length
  });

  return { sets, total, totalDuration: finalDuration, notes: [mod.explanation] };
}

// ---------- 헬퍼 함수 ----------

function filler(poolLen: number): SetItem {
  return {
    stroke: 'backstroke',
    zone: 'Z1',
    restSec: 10,
    rpe: 2,
    equipment: [],
    subtype: undefined,
    meters: poolLen,
    desc: `[배영] +${poolLen}m 보정 (easy fill)`,
    whyPace: '거리 보정용 저강도 수영',
    whyRest: '짧은 회복',
    whySet: '일일 타깃 거리 달성을 위한 보정',
    evidenceKeys: []
  };
}

const addDays = (iso: string, d: number) => {
  const t = new Date(iso);
  t.setDate(t.getDate() + d);
  return t.toISOString().slice(0, 10);
};

const snap25 = (m: number, poolLen: number = 25) => Math.round(m / poolLen) * poolLen;

const fmtCss = (sec100: number) => {
  const min = Math.floor(sec100 / 60);
  const sec = Math.round(sec100 % 60);
  return `${min}:${String(sec).padStart(2, '0')}`;
};

const parseReps = (desc: string): number => {
  const match = desc.match(/^(?:\[.*?\]\s*)?(\d+)×/);
  return match ? parseInt(match[1]) : 1;
};

const getStrokeName = (stroke: Stroke): string => {
  const names = {
    freestyle: '자유형',
    backstroke: '배영',
    breaststroke: '평영',
    butterfly: '접영',
    elementary_backstroke: '기본배영',
    sidestroke: '측영'
  };
  return names[stroke] || stroke;
};

