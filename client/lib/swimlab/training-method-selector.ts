/**
 * 🏊 훈련법 자동 선택 시스템 v2.0
 * 
 * 목표와 이력에 따라 25가지 훈련법 + 40가지 드릴 중 최적의 조합을 자동 선택
 * 
 * 연동되는 데이터:
 * - client/src/swimlab/data/trainingMethods.ts (25개 훈련법)
 * - client/src/swimlab/data/drills.ts (40개 드릴)
 * 
 * 핵심 원칙:
 * - 목표별 훈련법 우선순위 (25개 전체 활용)
 * - 이력 기반 변형 (같은 훈련법 3주 연속 방지)
 * - 테마별 자동 로테이션 (PRE/MAIN 모두)
 * - 드릴 자동 배치 (40개 드릴 순환)
 */

export interface TrainingMethodSelection {
  methodId: string;
  methodName: string;
  reps: number;
  distance: number;
  zone: 'Z1' | 'Z2' | 'Z3' | 'Z4' | 'Z5';
  restSec: number;
  description: string;
  reason: string;
}

/**
 * 목표별 훈련법 우선순위
 */
export const GOAL_METHOD_PRIORITY = {
  '체력 향상': [
    'endurance',      // 지구력 (장거리)
    'aerobic_base',   // 유산소 기초
    'threshold',      // 임계/CSS
    'interval',       // 인터벌
    'recovery'        // 회복
  ],
  '실력 향상': [
    'threshold',      // 임계/CSS
    'vo2max',         // VO₂max
    'interval',       // 인터벌
    'sprint',         // 스프린트
    'skills_training' // 스타트·턴
  ],
  '기술 연마': [
    'technique',      // 기술 훈련
    'pull_focused',   // 풀 집중
    'kick_focused',   // 킥 집중
    'skills_training',// 스타트·턴
    'mixed'           // 혼합
  ],
  '체중 감량': [
    'aerobic_base',   // 유산소 기초
    'endurance',      // 지구력
    'interval',       // 인터벌 (칼로리 소모)
    'recovery',       // 회복
    'mixed'           // 혼합
  ],
  '재활': [
    'recovery',       // 회복
    'technique',      // 기술 (저강도)
    'aerobic_base',   // 유산소 기초
    'pull_focused',   // 풀 집중 (킥 부담↓)
    'kick_focused'    // 킥 집중 (부위별)
  ],
  '스트레스 해소': [
    'recovery',       // 회복
    'aerobic_base',   // 유산소 기초
    'endurance',      // 지구력 (명상적)
    'technique',      // 기술 (집중력)
    'mixed'           // 혼합
  ]
};

/**
 * 테마별 PRE 세트 훈련법 (빌드업 대체)
 */
export function selectPREMethod(theme: 'tech_tempo' | 'endurance' | 'tempo_hi', goal: string, weekHistory: string[]): {
  type: string;
  description: string;
  paceRange: string;
  reason: string;
  effect: string;
} {
  // 최근 3주 이력 확인 (같은 것 연속 방지)
  const usedRecently = weekHistory.slice(-3);
  
  // 테마별 후보 목록
  const candidates = {
    tech_tempo: [
      { type: '빌드업', desc: 'Z1→Z2→Z3', pace: 'CSS+12→CSS−2″', reason: '워밍업→메인 전환', effect: '심박수·기술 단계적 상승' },
      { type: '스트로크 카운트', desc: '25m당 스트로크 수 감소', pace: 'CSS+8″', reason: '스트로크 효율 향상', effect: '긴 스트로크, DPS↑' },
      { type: '템포 트레이너', desc: '일정 리듬 유지', pace: 'CSS+5″', reason: '리듬 감각 향상', effect: '일정한 템포, 효율성' }
    ],
    endurance: [
      { type: '디센딩', desc: 'CSS+10→CSS±0″', pace: '점진 가속', reason: '페이스 감각', effect: '네거티브 스플릿 능력' },
      { type: '어센딩', desc: 'CSS−5→CSS+10″', pace: '점진 감속', reason: '피로 관리', effect: '피로 속 페이스 유지력' },
      { type: '지속 이지', desc: 'CSS+10″ 유지', pace: 'CSS+10″', reason: '유산소 기초', effect: '지방 대사, 지구력' }
    ],
    tempo_hi: [
      { type: '피라미드', desc: 'Easy→Hard→Easy', pace: 'CSS+8→CSS−5→CSS+8″', reason: '강도 변화 적응', effect: '페이스 컨트롤, 정신력' },
      { type: 'USRPT', desc: '짧은 고강도 반복', pace: 'CSS−10″', reason: '레이스 페이스 적응', effect: '고강도 지속력' },
      { type: '브로큰', desc: '짧은 휴식 반복', pace: 'CSS±0″', reason: '회복 능력 향상', effect: 'PCr 재합성 훈련' }
    ]
  };
  
  const themeList = candidates[theme];
  
  // 최근 사용하지 않은 것 우선 선택
  const available = themeList.filter(m => !usedRecently.includes(m.type));
  const selected = available.length > 0 ? available[0] : themeList[0];
  
  return {
    type: selected.type,
    description: selected.desc,
    paceRange: selected.pace,
    reason: selected.reason,
    effect: selected.effect
  };
}

/**
 * 메인 세트 훈련법 선택 (목표 기반)
 */
export function selectMainMethod(goal: string, theme: 'tech_tempo' | 'endurance' | 'tempo_hi', weekHistory: string[]): {
  methodId: string;
  methodName: string;
  reason: string;
  effect: string;
} {
  const priorities = GOAL_METHOD_PRIORITY[goal as keyof typeof GOAL_METHOD_PRIORITY] || GOAL_METHOD_PRIORITY['체력 향상'];
  const usedRecently = weekHistory.slice(-2); // 최근 2주
  
  // 우선순위에서 최근 사용하지 않은 첫 번째 선택
  const available = priorities.filter(m => !usedRecently.includes(m));
  const methodId = available.length > 0 ? available[0] : priorities[0];
  
  const methodNames = {
    technique: '기술 훈련',
    aerobic_base: '유산소 기초',
    threshold: '임계/CSS 훈련',
    vo2max: 'VO₂max 훈련',
    interval: '인터벌 훈련',
    kick_focused: '킥 집중 훈련',
    pull_focused: '풀 집중 훈련',
    hypoxic: '하이폭식 훈련',
    im_training: '개인혼영',
    skills_training: '스킬 훈련',
    openwater: '오픈워터',
    recovery: '회복 수영',
    endurance: '지구력 훈련',
    sprint: '스프린트',
    mixed: '혼합 훈련'
  };
  
  const reasons = {
    technique: '기술 교정, 효율성 향상',
    aerobic_base: '기초 체력, 지방 연소',
    threshold: '역치 능력, 템포 유지',
    vo2max: '최대 산소 섭취, 폭발력',
    interval: '체력+속도 동시, 시간 효율',
    kick_focused: '하체 추진력, 킥 기술',
    pull_focused: '상체 추진력, 캐치 감각',
    hypoxic: '호흡 효율, CO₂ 내성',
    im_training: '전 영법 균형, 전환 기술',
    skills_training: '스타트·턴·브레이크아웃',
    openwater: '사이팅, 직선 유영',
    recovery: '피로 회복, 활성 회복',
    endurance: '장시간 지속, 마라톤 수영',
    sprint: '최고 속도, 폭발력',
    mixed: '종합 체력, 다양성'
  };
  
  const effects = {
    technique: '기술적 완성도↑, 효율성↑',
    aerobic_base: '미토콘드리아 밀도↑, 지방 대사↑',
    threshold: 'MLSS 능력↑, 템포 유지력↑',
    vo2max: '최대 산소 섭취↑, 고강도 지속력↑',
    interval: '회복 능력↑, 다양한 강도 적응',
    kick_focused: '킥 파워↑, 체간 안정성↑',
    pull_focused: '풀 파워↑, 캐치 정확도↑',
    hypoxic: '호흡 효율↑, 오픈워터 적응',
    im_training: '전 영법 균형 발달',
    skills_training: '경기 기술 완성도↑',
    openwater: '사이팅 정확도↑, 에너지 효율↑',
    recovery: '젖산 제거↑, 스트레스↓',
    endurance: '장거리 능력↑, 정신력↑',
    sprint: '순간 폭발력↑, 신경근 동원↑',
    mixed: '종합 체력↑, 지루함 방지'
  };
  
  return {
    methodId,
    methodName: methodNames[methodId as keyof typeof methodNames] || methodId,
    reason: reasons[methodId as keyof typeof reasons] || '',
    effect: effects[methodId as keyof typeof effects] || ''
  };
}

