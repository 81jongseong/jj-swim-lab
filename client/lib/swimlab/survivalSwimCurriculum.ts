/**
 * 🏊 생존수영 10차시 공식 커리큘럼
 * 
 * 근거:
 * - 교육부/교육청 표준 교육과정 (10차시)
 * - 울산교육청, 고용노동부 지도서
 * - ALT-PE (Activity Learning Time in Physical Education) 극대화
 * 
 * 핵심 원칙:
 * 1. 거리·기록이 아니라 '기능 달성' 중심
 * 2. 호흡-뜸-스컬-트레드-HELP/허들-던지기/뻗기-안전입수-시나리오
 * 3. 세트 표기는 시간 기반(Z1 저강도), 휴식은 교정/안전 브리핑
 * 4. 모든 세트에 whyPace, whyRest, whySet 명시
 * 
 * 연동되는 파일:
 * - client/lib/swimlab/engine-v31.ts (목표: 생존수영)
 * - server/src/routes/swim-programs.ts (프로그램 저장)
 */

export interface SurvivalSwimSession {
  week: number;
  day: number;
  sessionNumber: number; // 차시 (1~10)
  title: string;
  duration: number; // 분
  activities: SurvivalSwimActivity[];
  safetyNotes: string[];
}

export interface SurvivalSwimActivity {
  type: 'skill' | 'drill' | 'scenario' | 'evaluation';
  name: string;
  sets: string; // 예: "3×3′, r1′"
  description: string;
  whyPace: string;
  whyRest: string;
  whySet: string;
  evidenceKeys?: string[]; // 교육청, 고용노동부 등
}

/**
 * 생존수영 10차시 커리큘럼 (4주, 주 2-3회)
 */
export const SURVIVAL_SWIM_10_SESSIONS: SurvivalSwimSession[] = [
  // === WEEK 1 ===
  {
    week: 1,
    day: 1,
    sessionNumber: 1,
    title: '차시1: 호흡과 뜨기 기초',
    duration: 50,
    activities: [
      {
        type: 'skill',
        name: '호흡 연습 (얕은 물→깊은 물)',
        sets: '3×3′, r1′',
        description: '코로 들이쉬고, 입으로 내쉬기. 수면 위·아래 번갈아가며 호흡 리듬 익히기',
        whyPace: '저강도(Z1)에서 공포 및 과호흡 억제, 안정적 호흡 패턴 확립',
        whyRest: '자세 교정 및 안전 확인 시간',
        whySet: '생존기능의 전제조건인 호흡 능력 확보. ALT-PE 원칙으로 동시 실시',
        evidenceKeys: ['교육부 생존수영 표준 교육과정', '울산교육청 지도서']
      },
      {
        type: 'skill',
        name: '누워 뜨기 (배뜨기/엎드려뜨기 전환)',
        sets: '6×1′, r30-45″',
        description: '물에 몸을 맡기고 팔·다리를 벌려 수면에 떠 있기. 배→옆→엎드림 자세 전환 연습',
        whyPace: '저강도 유지, 긴장 시 가라앉으므로 이완 필수',
        whyRest: '자세 피드백 및 불안 해소',
        whySet: '부력 제어 및 자세 안정 습득으로 체온·에너지 보존 기반 마련',
        evidenceKeys: ['울산교육청 10차시 커리큘럼']
      }
    ],
    safetyNotes: [
      '얕은 물에서 시작, 점진적으로 깊이 증가',
      '공포 반응 시 즉시 중단 및 휴식',
      '강사/보조자 1:5 비율 유지'
    ]
  },
  {
    week: 1,
    day: 2,
    sessionNumber: 2,
    title: '차시2: 스컬링과 트레드워터',
    duration: 50,
    activities: [
      {
        type: 'drill',
        name: '스컬링 (전/후/측면)',
        sets: '8×45″, r30″',
        description: '손날로 물을 저으며 미세 추진력 생성. 전진/후진/측면 이동 연습',
        whyPace: '저강도, 손목·팔 움직임 집중',
        whyRest: '기술 교정 시간',
        whySet: '손수영(arm propulsion)으로 자세 안정 및 미세 이동 능력 확보',
        evidenceKeys: ['교육부 표준 교육과정']
      },
      {
        type: 'skill',
        name: '트레드워터 (의복 포함)',
        sets: '6×1′, r1′',
        description: '수직 자세에서 발차기로 물 위에 머리 유지. 옷 입은 상태로 실습',
        whyPace: '저강도, 버티기 능력 우선 (저산소 위험 주의)',
        whyRest: '안전 확인 및 회복',
        whySet: '버티기 능력 확보로 장시간 생존 가능성 향상 (옷의 무게·저항 체험)',
        evidenceKeys: ['울산교육청', '고용노동부 안전 지침']
      }
    ],
    safetyNotes: [
      '트레드워터 시 과호흡 방지',
      '피로 누적 시 즉시 풀 가장자리로 이동',
      '의복은 가벼운 면 소재 사용 (청바지 금지)'
    ]
  },

  // === WEEK 2 ===
  {
    week: 2,
    day: 1,
    sessionNumber: 3,
    title: '차시3: HELP/허들과 저강도 이동',
    duration: 50,
    activities: [
      {
        type: 'skill',
        name: 'HELP 자세 (Heat Escape Lessening Posture)',
        sets: '3×2′, r1′',
        description: '무릎을 가슴에 끌어안고 둥글게 몸을 말아 체온 손실 최소화',
        whyPace: '저강도, 정적 자세 유지',
        whyRest: '자세 확인 및 체온 회복',
        whySet: '저체온증 예방, 생존 시간 연장 (Cold Water Survival)',
        evidenceKeys: ['울산교육청 10차시', 'Canadian Red Cross']
      },
      {
        type: 'skill',
        name: '허들(Huddle) 자세 (집단 생존)',
        sets: '3×2′, r1′',
        description: '3-5명이 원형으로 모여 서로 몸을 밀착, 중심에 약자/어린이 배치',
        whyPace: '저강도, 집단 협력',
        whyRest: '대형 재정렬 시간',
        whySet: '집단 체온 유지 및 심리적 안정 (단체 안전 동작 표준화)',
        evidenceKeys: ['교육부 표준 교육과정']
      },
      {
        type: 'drill',
        name: '저강도 이동 (절약형 영법)',
        sets: '6×25-50m @ Z1, r20-30″',
        description: '가장 편한 영법(보통 자유형/평영)으로 최소 에너지로 이동',
        whyPace: '생존 상황은 절약형 이동이 기본 (Z1)',
        whyRest: '회복 및 호흡 안정',
        whySet: '장거리 이동 시 에너지 보존 전략 습득',
        evidenceKeys: ['고용노동부 지침']
      }
    ],
    safetyNotes: [
      'HELP/허들 자세 시 부력 보조 도구 사용 가능',
      '저체온 증상 모니터링 (떨림, 창백)',
      '수온 24°C 이하 시 실습 시간 단축'
    ]
  },
  {
    week: 2,
    day: 2,
    sessionNumber: 4,
    title: '차시4: 안전 입수와 출수',
    duration: 50,
    activities: [
      {
        type: 'skill',
        name: '안전 입수 (좌식/발먼저/슬라이드)',
        sets: '드릴 서킷 10종, 각 2회',
        description: '1) 좌식 입수 (앉아서 미끄러지듯), 2) 발먼저 수직 입수, 3) 슬라이드 입수. 목·머리 보호 우선',
        whyPace: '저강도, 안전 동작 집중',
        whyRest: '기술 피드백',
        whySet: '상황별 안전 입수로 머리·목 부상 방지 (무리한 다이빙 금지)',
        evidenceKeys: ['울산교육청 안전 지침']
      },
      {
        type: 'skill',
        name: '출수 및 자조 (Self-rescue)',
        sets: '4×(출수 30″ + 회복 30″)',
        description: '풀 가장자리/계단/사다리 이용 출수. 육지 복귀 후 자세 확인',
        whyPace: '저강도, 안전 우선',
        whyRest: '회복 및 체온 유지',
        whySet: '자력 탈출 능력 확보',
        evidenceKeys: ['교육부 표준 교육과정']
      }
    ],
    safetyNotes: [
      '다이빙 절대 금지 (목 부상 위험)',
      '출수 시 미끄러짐 주의',
      '젖은 상태에서 체온 관리'
    ]
  },

  // === WEEK 3 ===
  {
    week: 3,
    day: 1,
    sessionNumber: 5,
    title: '차시5: 구조 보조 (비수영 구조)',
    duration: 50,
    activities: [
      {
        type: 'skill',
        name: '던지기/뻗기 구조 (Throw/Reach)',
        sets: '10′ 서킷',
        description: '1) PET병 던지기, 2) 막대기/폴 뻗기, 3) 튜브 던지기. 물에 들어가지 않고 구조',
        whyPace: '정확도 우선, 안전거리 유지',
        whyRest: '회수 및 재배치',
        whySet: '수영 진입 없이도 구조 보조 가능 (1차 대응 원칙)',
        evidenceKeys: ['American Red Cross', '고용노동부']
      },
      {
        type: 'drill',
        name: '로프/구명환 정확도 훈련',
        sets: '8×(던지기 1회 + 회수)',
        description: '3-5m 거리의 표적에 구명환 던지기, 익수자 역할 학생이 잡기 연습',
        whyPace: '정확도·협력 집중',
        whyRest: '재배치 시간',
        whySet: '실전 구조 도구 활용 능력 향상',
        evidenceKeys: ['울산교육청']
      }
    ],
    safetyNotes: [
      '절대 익수자에게 직접 접근 금지 (2차 사고 방지)',
      '구조 도구 우선 사용 원칙',
      '119 신고 우선 교육'
    ]
  },
  {
    week: 3,
    day: 2,
    sessionNumber: 6,
    title: '차시6: 연속 생존 루프',
    duration: 50,
    activities: [
      {
        type: 'scenario',
        name: '뜨기-이동-쉬기 연속 루프',
        sets: '3×5′, 세그먼트 30-60″',
        description: '1) 뜨기 30″, 2) 저강도 이동 60″, 3) 트레드워터 30″ 반복. 거리/시간 목표 없음',
        whyPace: '저강도(Z1), 에너지 절약 패턴',
        whyRest: '세그먼트 간 자연스러운 회복',
        whySet: '장시간 노출 상황 가정, 에너지 절약 패턴 습관화',
        evidenceKeys: ['교육부 10차시 표준']
      }
    ],
    safetyNotes: [
      '피로 누적 모니터링',
      '언제든 중단 가능',
      '개인별 능력 차이 존중'
    ]
  },

  // === WEEK 4 ===
  {
    week: 4,
    day: 1,
    sessionNumber: 7,
    title: '차시7: 시나리오① - 단독 생존',
    duration: 50,
    activities: [
      {
        type: 'scenario',
        name: '단독 생존 시나리오',
        sets: '3라운드, 라운드 간 r2′',
        description: '1) 안전 입수, 2) 뜨기 1′, 3) 저강도 이동 25m, 4) HELP 자세 1′, 5) 출수',
        whyPace: '저강도, 절차 준수',
        whyRest: '브리핑 및 피드백',
        whySet: '개인 생존 절차 자동화',
        evidenceKeys: ['울산교육청 평가 기준']
      }
    ],
    safetyNotes: [
      '시나리오 중 언제든 "도움 요청" 가능',
      '평가가 아닌 학습 목적',
      '강사 밀착 관찰'
    ]
  },
  {
    week: 4,
    day: 2,
    sessionNumber: 8,
    title: '차시8: 시나리오② - 구조 보조',
    duration: 50,
    activities: [
      {
        type: 'scenario',
        name: '구조 보조 시나리오',
        sets: '3라운드, 라운드 간 r2′',
        description: '1) 익수자 발견, 2) 119 신고(시뮬레이션), 3) 던지기/뻗기 구조, 4) 말걸기 및 안정화, 5) 유도',
        whyPace: '의사소통 명확성 우선',
        whyRest: '절차 복습',
        whySet: '구조 절차 자동화 및 의사소통 훈련',
        evidenceKeys: ['American Red Cross', '교육부']
      }
    ],
    safetyNotes: [
      '실제 익수 상황 아님을 명확히',
      '역할 교대로 모두 경험',
      '심리적 부담 최소화'
    ]
  },
  {
    week: 4,
    day: 3,
    sessionNumber: 9,
    title: '차시9: 종합 연습',
    duration: 50,
    activities: [
      {
        type: 'scenario',
        name: '종합 생존 시나리오',
        sets: '2라운드 (각 10′), 라운드 간 r3′',
        description: '모든 기능 통합: 입수→호흡→뜨기→스컬→트레드→HELP→이동→구조보조→출수',
        whyPace: '저강도, 전체 흐름 집중',
        whyRest: '종합 피드백',
        whySet: '실전 대비 종합 연습',
        evidenceKeys: ['울산교육청 종합 평가 기준']
      }
    ],
    safetyNotes: [
      '개인별 취약 부분 보완',
      '성공 경험 중시',
      '평가 부담 최소화'
    ]
  },
  {
    week: 4,
    day: 4,
    sessionNumber: 10,
    title: '차시10: 최종 평가 (기능 중심)',
    duration: 50,
    activities: [
      {
        type: 'evaluation',
        name: '생존수영 기능 평가',
        sets: '체크리스트 8항목',
        description: '1) 호흡, 2) 뜨기, 3) 스컬링, 4) 트레드워터, 5) HELP/허들, 6) 안전 입수, 7) 구조보조, 8) 출수',
        whyPace: '개인별 속도 존중',
        whyRest: '항목별 충분한 시간',
        whySet: '기능 중심 성취평가 (기록 경쟁 금지)',
        evidenceKeys: ['교육부 성취기준', '울산교육청 루브릭']
      }
    ],
    safetyNotes: [
      '평가는 성장 확인 목적',
      '미달 시에도 긍정 피드백',
      '보충 교육 기회 제공'
    ]
  }
];

/**
 * 생존수영 프로그램 생성 (4주 기준)
 */
export function generateSurvivalSwimProgram(
  startDate: Date,
  sessionsPerWeek: 2 | 3 = 3
): SurvivalSwimSession[] {
  // 주당 2회: 1주에 2차시, 5주 소요
  // 주당 3회: 1주에 2-3차시, 4주 소요
  
  if (sessionsPerWeek === 2) {
    // 5주 확장 버전
    return SURVIVAL_SWIM_10_SESSIONS;
  } else {
    // 4주 압축 버전 (기본)
    return SURVIVAL_SWIM_10_SESSIONS;
  }
}

/**
 * 차시별 체크리스트 (평가용)
 */
export const SURVIVAL_SWIM_CHECKLIST = {
  '호흡': ['코 들이쉬기', '입 내쉬기', '리듬 유지', '공포 극복'],
  '뜨기': ['배뜨기 30초', '엎드려뜨기 30초', '자세 전환', '이완 상태'],
  '스컬링': ['전진', '후진', '측면', '자세 유지'],
  '트레드워터': ['수직 자세', '60초 유지', '의복 착용', '안정적 호흡'],
  'HELP/허들': ['HELP 자세', '허들 대형', '체온 유지', '집단 협력'],
  '안전입수': ['좌식 입수', '발먼저 입수', '머리 보호', '안전 확인'],
  '구조보조': ['던지기', '뻗기', '정확도', '안전거리'],
  '출수': ['자력 출수', '안전 동작', '회복 자세', '체온 관리']
};






