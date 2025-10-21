/**
 * 🏊‍♂️ 인명구조원(라이프가드) 훈련 프로그램
 * 
 * 근거:
 * - 대한인명구조협회/연맹 공식 5일 과정
 * - American Red Cross Lifeguarding
 * - 과제특이성 (Task-Specific Training)
 * 
 * 구성:
 * A) 공식 5일 집중 과정 (자격증 교육)
 * B) 4주 준비 프로그램 (지원자 사전 훈련)
 * 
 * 연동되는 파일:
 * - client/lib/swimlab/engine-v31.ts (목표: 인명구조원)
 * - server/src/routes/swim-programs.ts
 */

export interface LifeguardSession {
  day: number;
  title: string;
  duration: number; // 분
  category: 'pool' | 'land' | 'theory' | 'evaluation';
  activities: LifeguardActivity[];
  prerequisites?: string[];
}

export interface LifeguardActivity {
  type: 'swim' | 'rescue' | 'theory' | 'cpr' | 'scenario' | 'evaluation';
  name: string;
  sets?: string;
  description: string;
  whyPace?: string;
  whyRest?: string;
  whySet: string;
  evidenceKeys?: string[];
}

// ===== A) 공식 5일 집중 과정 =====

export const LIFEGUARD_5DAY_COURSE: LifeguardSession[] = [
  {
    day: 1,
    title: 'Day 1: 수영 검정 & 구조 튜브 기본',
    duration: 480, // 8시간
    category: 'pool',
    activities: [
      {
        type: 'swim',
        name: '수영 검정 (전제 조건)',
        description: '1) 자유형 100m (2분 30초 내), 2) 평영 50m (1분 30초 내), 3) 배영 50m (1분 30초 내)',
        whySet: '라이프가드 최소 수영 능력 검증 (지구력+기술)',
        evidenceKeys: ['대한인명구조협회']
      },
      {
        type: 'swim',
        name: '영법 숙달 (4개 영법)',
        sets: '각 영법 8×50m @ Z2, r20″',
        description: '자유형, 배영, 평영, 접영 정확도 및 지구력 확인',
        whyPace: 'Z2 (CSS+8″) - 지속 가능한 페이스',
        whyRest: '기술 품질 유지',
        whySet: '다양한 영법으로 장거리 구조 대응',
        evidenceKeys: ['American Red Cross']
      },
      {
        type: 'rescue',
        name: '구조 튜브 기본 (Rescue Tube)',
        sets: '10′ 드릴',
        description: '1) 착용법, 2) 던지기, 3) 익수자에게 전달, 4) 토우(Tow) 기본 자세',
        whySet: '구조 도구 숙달 (1차 구조 도구)',
        evidenceKeys: ['대한인명구조협회', 'Red Cross']
      },
      {
        type: 'rescue',
        name: '도구 이용 구조 (Equipment)',
        sets: '서킷 20′',
        description: '1) 구명환(Ring Buoy), 2) 구조 폴(Shepherd\'s Crook), 3) 백보드(Backboard) 기본',
        whySet: '상황별 적절한 구조 도구 선택 능력',
        evidenceKeys: ['Red Cross']
      }
    ],
    prerequisites: ['수영 능력: 200m 이상 연속', '4개 영법 기본 구사']
  },
  {
    day: 2,
    title: 'Day 2: 익수자 수영 구조 & 생존수영',
    duration: 480,
    category: 'pool',
    activities: [
      {
        type: 'rescue',
        name: '익수자 접근 (Approach)',
        sets: '6×25m 헤드업 프리 @ Z3, r30″',
        description: '머리를 들고 시야 확보하며 익수자에게 빠르게 접근',
        whyPace: 'Z3 (CSS±0″) - 역치 근처 고강도',
        whyRest: 'PCr 회복 (45-60초)',
        whySet: '신속 접근 능력 (시야 유지 + 속도)',
        evidenceKeys: ['Red Cross']
      },
      {
        type: 'rescue',
        name: '익수자 접촉 (Contact & Control)',
        sets: '8라운드 × (접근 25m + 접촉 + 토우 25m), r90″',
        description: '1) 엔트리, 2) 어프로치, 3) 익수자 말걸기/안정, 4) 구조 튜브 전달, 5) 토우',
        whyPace: '접근 Z3, 토우 Z2',
        whyRest: '품질 유지 및 안전 브리핑',
        whySet: '능동적 익수자(Active Victim) 구조 절차 숙달',
        evidenceKeys: ['American Red Cross', '대한인명구조협회']
      },
      {
        type: 'rescue',
        name: '수동적 익수자 구조 (Passive Victim)',
        sets: '6라운드 × (접근 + 들어올리기 + 토우), r120″',
        description: '의식 없는 익수자: 1) 빠른 접근, 2) 턱 들어올리기, 3) 기도 확보, 4) 토우',
        whyRest: '절차 복습 및 회복',
        whySet: '의식 없는 익수자 대응 (기도 확보 우선)',
        evidenceKeys: ['Red Cross']
      },
      {
        type: 'swim',
        name: '생존을 위한 수영 (Survival Swimming)',
        sets: '4×200m @ Z1, r30″',
        description: '의복/신발 착용 상태로 저강도 지속 수영 (에너지 절약)',
        whyPace: 'Z1 - 절약형 페이스',
        whyRest: '회복',
        whySet: '장시간 버티기 능력 (자기 안전 우선)',
        evidenceKeys: ['대한인명구조협회']
      }
    ]
  },
  {
    day: 3,
    title: 'Day 3: 수상 안전 & 응급처치',
    duration: 480,
    category: 'theory',
    activities: [
      {
        type: 'theory',
        name: '수상 안전 상식',
        description: '1) 물의 특성, 2) 익사 메커니즘, 3) 저체온증, 4) 조류/파도 대응',
        whySet: '예방 중심 안전 지식 습득',
        evidenceKeys: ['대한인명구조협회']
      },
      {
        type: 'theory',
        name: '직업 윤리 & 법적 책임',
        description: '1) 라이프가드 역할, 2) 감시 의무, 3) 법적 책임 범위, 4) 보고 절차',
        whySet: '전문성 및 책임감 확립',
        evidenceKeys: ['Red Cross', '고용노동부']
      },
      {
        type: 'cpr',
        name: '외상 처치 (First Aid)',
        sets: '시나리오 8개, 각 5′',
        description: '1) 출혈 제어, 2) 화상, 3) 골절 고정, 4) 열사병, 5) 저체온증, 6) 상처 소독, 7) 쇼크, 8) 알레르기',
        whySet: '수상 사고 외 일반 응급처치 능력',
        evidenceKeys: ['American Red Cross FA']
      },
      {
        type: 'cpr',
        name: 'CPR (심폐소생술)',
        sets: '5라운드 × 2분 CPR, r3′',
        description: '1) 반응 확인, 2) 119 신고, 3) 가슴압박 30회, 4) 인공호흡 2회, 5) 반복',
        whySet: '심정지 대응 능력 (생존 사슬)',
        evidenceKeys: ['대한심폐소생협회']
      },
      {
        type: 'cpr',
        name: 'AED (자동제세동기)',
        sets: '3라운드 × (CPR + AED), r5′',
        description: 'CPR 중 AED 도착 시 패드 부착, 분석, 쇼크, CPR 재개',
        whySet: 'AED 통합 심정지 대응',
        evidenceKeys: ['대한심폐소생협회', 'Red Cross']
      }
    ]
  },
  {
    day: 4,
    title: 'Day 4: 기본 구조술 & 운반',
    duration: 480,
    category: 'pool',
    activities: [
      {
        type: 'rescue',
        name: '엔트리 기술 (Entry)',
        sets: '각 기술 10회',
        description: '1) 슬라이드 입수, 2) 스트라이드 점프, 3) 컴팩트 점프 (높이별)',
        whySet: '상황별 신속·안전 입수 (목·머리 보호)',
        evidenceKeys: ['Red Cross']
      },
      {
        type: 'rescue',
        name: '서피스 다이브 (Surface Dive)',
        sets: '8라운드 × (잠수 3-4m + 브릭 회수), r90″',
        description: '1) 헤드퍼스트 다이브, 2) 수중 브릭 찾기, 3) 들어올리기, 4) 수면 복귀',
        whyPace: '무산소, 최대 노력',
        whyRest: 'PCr 회복 및 과호흡 방지',
        whySet: '수중 익수자 구조 (수영장 바닥)',
        evidenceKeys: ['American Red Cross']
      },
      {
        type: 'rescue',
        name: '토우 기술 (Towing)',
        sets: '6라운드 × (25m 토우 + 출수), r120″',
        description: '1) 액슬러 토우, 2) 크로스체스트 토우, 3) 구조 튜브 토우',
        whyPace: 'Z2 - 지속 가능 페이스',
        whyRest: '기술 품질 및 회복',
        whySet: '다양한 토우 기술 습득 (상황별)',
        evidenceKeys: ['대한인명구조협회']
      },
      {
        type: 'rescue',
        name: '익수자 운반 (Removal)',
        sets: '8회 × (출수 + 백보드 이동)',
        description: '1) 풀 가장자리 출수, 2) 백보드 탑재, 3) 육지 이동, 4) CPR 준비 자세',
        whySet: '안전한 출수 및 즉시 CPR 전환',
        evidenceKeys: ['Red Cross']
      }
    ]
  },
  {
    day: 5,
    title: 'Day 5: 경추 부상 & 종합 평가',
    duration: 480,
    category: 'evaluation',
    activities: [
      {
        type: 'rescue',
        name: '경추(척추) 부상 대응',
        sets: '6라운드 × (접근 + 고정 + 백보드 탑재), r180″',
        description: '1) 경추 의심 확인, 2) 인라인 스태빌라이제이션, 3) 백보드 탑재, 4) 고정, 5) 이동',
        whyRest: '절차 복습 및 팀 협력',
        whySet: '경추 손상 방지 (2차 손상 예방)',
        evidenceKeys: ['American Red Cross', '대한인명구조협회']
      },
      {
        type: 'scenario',
        name: '종합 실습 (Scenario)',
        sets: '5개 시나리오, 각 10′',
        description: '1) 능동적 익수자, 2) 수동적 익수자, 3) 서피스 다이브+브릭, 4) 경추 부상, 5) CPR+AED',
        whySet: '통합 대응 능력 평가',
        evidenceKeys: ['대한인명구조협회']
      },
      {
        type: 'evaluation',
        name: '최종 평가',
        description: '1) 수영 능력, 2) 구조 절차, 3) CPR/AED, 4) FA, 5) 이론 시험 (70점 이상)',
        whySet: '자격증 발급 기준 충족 확인',
        evidenceKeys: ['대한인명구조협회', 'Red Cross']
      }
    ]
  }
];

// ===== B) 4주 준비 프로그램 (주 3일) =====

export interface PrepWeek {
  week: number;
  focus: string;
  poolSessions: PrepSession[];
  landSession: PrepLandSession;
}

export interface PrepSession {
  day: string;
  title: string;
  duration: number;
  sets: PrepSet[];
}

export interface PrepSet {
  name: string;
  prescription: string; // 세트 처방
  whyPace?: string;
  whyRest?: string;
  whySet: string;
}

export interface PrepLandSession {
  title: string;
  duration: number;
  activities: string[];
}

export const LIFEGUARD_4WEEK_PREP: PrepWeek[] = [
  {
    week: 1,
    focus: '기초 체력 & 기술',
    poolSessions: [
      {
        day: '월요일',
        title: 'Pool-1: 지구력 기초',
        duration: 60,
        sets: [
          {
            name: '워밍업',
            prescription: '1×400m @ Z1',
            whySet: '혈류 증가, 관절 준비'
          },
          {
            name: '메인 세트',
            prescription: '8×100m @ Z2(CSS+8″), r20-25″',
            whyPace: 'Z2는 짧은 휴식으로도 기술 유지 가능',
            whyRest: '20-25초 - 불완전 회복으로 지구력 적응',
            whySet: '지구력 토대 확립 (유산소 기반)'
          },
          {
            name: '쿨다운',
            prescription: '1×200m @ Z1',
            whySet: '젖산 제거, 회복 촉진'
          }
        ]
      },
      {
        day: '수요일',
        title: 'Pool-2: 헤드업 & 엔트리',
        duration: 60,
        sets: [
          {
            name: '엔트리 드릴',
            prescription: '슬라이드/스트라이드/컴팩트 각 6회',
            whySet: '안전 입수 자동화 (목·머리 보호)'
          },
          {
            name: '헤드업 프리스타일',
            prescription: '8×25m @ Z3, r20″',
            whyPace: 'Z3 - 역치 근처, 시야 유지하며 고강도',
            whyRest: '기술 품질 유지',
            whySet: '익수자 접근 시 시야 확보 능력 (라이프가드 핵심)'
          },
          {
            name: '구조 튜브 토우 연습',
            prescription: '6×25m 토우 @ Z2, r30″',
            whySet: '토우 기술 기초 습득'
          }
        ]
      }
    ],
    landSession: {
      title: '코어 & CPR 절차',
      duration: 30,
      activities: [
        '코어 안정화 (플랭크, 사이드 플랭크, 데드버그) - 15분',
        '견갑 안정화 (밴드 풀, Y-T-W) - 10분',
        'CPR 절차 리허설 (마네킹 없이 동작만) - 5분'
      ]
    }
  },
  {
    week: 2,
    focus: '역치 강화 & 접촉/토우',
    poolSessions: [
      {
        day: '월요일',
        title: 'Pool-1: 역치 인터벌',
        duration: 60,
        sets: [
          {
            name: '워밍업',
            prescription: '1×400m @ Z1',
            whySet: '준비'
          },
          {
            name: '역치 세트',
            prescription: '6×200m @ Z3(CSS±0″), r25-30″',
            whyPace: 'CSS 페이스 - MLSS (최대 젖산 안정 상태)',
            whyRest: '25-30초 - TIZ (Time In Zone) 확보',
            whySet: '역치 능력 강화 (구조 운반 체력)'
          },
          {
            name: '쿨다운',
            prescription: '1×200m @ Z1',
            whySet: '회복'
          }
        ]
      },
      {
        day: '수요일',
        title: 'Pool-2: 접근-접촉-토우',
        duration: 60,
        sets: [
          {
            name: '통합 구조 드릴',
            prescription: '6라운드 × (25m 접근 Z3 + 25m 토우 Z2), r60″',
            whyPace: '접근 Z3 (신속), 토우 Z2 (지속)',
            whyRest: '품질 유지 및 안전 브리핑',
            whySet: '실전 구조 과제특이성 훈련'
          }
        ]
      }
    ],
    landSession: {
      title: '외상 처치 (FA)',
      duration: 30,
      activities: [
        '출혈 제어 및 붕대 감기 - 10분',
        '골절 고정 (부목) - 10분',
        '시나리오 연습 (출혈+골절) - 10분'
      ]
    }
  },
  {
    week: 3,
    focus: '고강도 스프린트 & 서피스 다이브',
    poolSessions: [
      {
        day: '월요일',
        title: 'Pool-1: 반복 스프린트',
        duration: 60,
        sets: [
          {
            name: '워밍업',
            prescription: '1×400m @ Z1 + 4×50m 빌드업',
            whySet: '신경계 활성화'
          },
          {
            name: '스프린트 세트',
            prescription: '10×25m @ Z4(CSS−8″), r45-60″',
            whyPace: 'Z4 - 고강도, 최대 속도의 85-90%',
            whyRest: '45-60초 - PCr 재합성 (Phosphocreatine 회복)',
            whySet: '접근 속도 극대화 (반복 스프린트 능력)'
          },
          {
            name: '쿨다운',
            prescription: '1×200m @ Z1',
            whySet: '회복'
          }
        ]
      },
      {
        day: '수요일',
        title: 'Pool-2: 서피스 다이브 + 브릭',
        duration: 60,
        sets: [
          {
            name: '서피스 다이브 & 브릭 회수',
            prescription: '8라운드 × (잠수 3-4m + 브릭 집기 + 수면 복귀), r90″',
            whyPace: '무산소 전환, 최대 노력',
            whyRest: '90초 - PCr 회복 및 과호흡 방지',
            whySet: '수중 구조 과제특이성 (브릭 = 수동적 익수자)'
          }
        ]
      }
    ],
    landSession: {
      title: '경추 고정 & 백보드',
      duration: 30,
      activities: [
        '경추 인라인 스태빌라이제이션 연습 - 10분',
        '백보드 탑재 (팀 협력) - 15분',
        '고정 및 이동 - 5분'
      ]
    }
  },
  {
    week: 4,
    focus: '종합 시나리오 & 테이퍼',
    poolSessions: [
      {
        day: '월요일',
        title: 'Pool-1: 지구력 유지 + 시야',
        duration: 60,
        sets: [
          {
            name: '헤드업 지구력',
            prescription: '12×100m @ Z3, r20-25″ (매 3번째는 헤드업)',
            whySet: '지구력과 시야 유지 동시 훈련'
          }
        ]
      },
      {
        day: '수요일',
        title: 'Pool-2: 시나리오 서킷',
        duration: 60,
        sets: [
          {
            name: '종합 구조 시나리오',
            prescription: '3라운드 × (EAP → 엔트리 → 어프로치 25m → 접촉 → 토우 25m → 출수), r2′',
            whyRest: '절차 브리핑 및 팀 피드백',
            whySet: 'EAP (Emergency Action Plan) 통합 훈련'
          }
        ]
      }
    ],
    landSession: {
      title: 'FA/CPR/AED 종합 리허설',
      duration: 30,
      activities: [
        'CPR 2분 × 3라운드 - 10분',
        'AED 통합 시나리오 - 10분',
        'FA 종합 (출혈+골절+열사병) - 10분'
      ]
    }
  }
];

/**
 * 테이퍼 전략 (시험 주간)
 */
export const LIFEGUARD_TAPER_STRATEGY = {
  description: '자격 시험 1주 전부터 테이퍼 적용',
  volumeReduction: '40-60% 감소',
  frequency: '유지 (주 3회)',
  intensity: '고강도 소량 유지 (Z4 세트 5-6회로 축소)',
  focus: '품질 위주 (기술 정확도, CPR 절차)',
  evidence: ['Bompa & Haff (2009) - Periodization', 'USA Swimming Taper Guidelines']
};






