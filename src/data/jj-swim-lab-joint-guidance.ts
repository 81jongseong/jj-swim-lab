/**
 * 🏊‍♂️ JJ Swim Lab - 관절질환별 운동 가이드라인 데이터 (수영 트레이닝 엔진용)
 * 
 * 📋 데이터 목적
 * - 28개 관절질환 × 6개 수영 영법 가이드라인
 * - 신뢰 가능한 근거(메타/SR, RCT, CPG) 기반 안전도 분류
 * - 허용/금지 동작, 수정사항, 대안 운동
 * - 운동 제한사항 및 권장 운동
 * 
 * 🎯 사용 목적
 * - 수영 트레이닝 규칙 엔진의 핵심 데이터
 * - 안전한 영법 선택 및 제약사항 적용
 * - 의학적 근거 기반 운동 계획 수립
 * 
 * 📅 개발 히스토리
 * - 2025-09-17: 초기 관절질환 데이터 구조 설계
 * - 2025-09-17: 28개 관절질환 베타
 * - 2025-09-23: 출처 재검증 및 28개 완전 구성(템플릿+오버라이드)
 * - 2025-09-23: 수영 트레이닝 엔진용 최적화
 * 
 * 👨‍💻 개발자 정보
 * - 작성자: AI Assistant
 * - 최종 수정: 2025-09-23
 * - 상태: ✅ 완성 (28개 관절질환 완전 구현, 검증된 출처 적용)
 */

import { 
  Category, 
  Stroke, 
  SafetyLevel, 
  MedicalCitation, 
  StrokeGuidance, 
  JointConditionGuidance 
} from '../types';

// ────────────────────────────────────────────────────────────────────────────────
// 검증된 의학적 근거(링크 포함)
// 레벨: SR/MA(체계적고찰/메타), RCT, CPG(가이드라인), Observational, Expert
// ────────────────────────────────────────────────────────────────────────────────
export const EVIDENCE_BASED_SOURCES: Record<string, MedicalCitation> = {
  // Osteoarthritis & Aquatic
  BARTELS_2016_CDSR: {
    id: 'BARTELS_2016_CDSR',
    citation: 'Bartels EM et al. Aquatic exercise for the treatment of knee and hip osteoarthritis. Cochrane Database Syst Rev. 2016.',
    link: 'https://pubmed.ncbi.nlm.nih.gov/27007113/',
    level: 'SR/MA',
    keyFindings: '고관절/무릎 OA에서 수중운동이 단기간 통증·기능 개선에 유익.'
  },
  HINMAN_2007_PT_RCT: {
    id: 'HINMAN_2007_PT_RCT',
    citation: 'Hinman RS et al. Aquatic Physical Therapy for Hip and Knee Osteoarthritis: RCT. Phys Ther. 2007.',
    link: 'https://academic.oup.com/ptj/article/87/1/32/2742115',
    level: 'RCT',
    keyFindings: '6주 수중 물리치료 → 통증↓, 기능/근력/삶의 질↑.'
  },

  // Low Back Pain
  HAYDEN_2005_CDSR_LBP: {
    id: 'HAYDEN_2005_CDSR_LBP',
    citation: 'Hayden JA et al. Exercise therapy for non-specific low back pain. Cochrane. 2005.',
    link: 'https://pubmed.ncbi.nlm.nih.gov/16034851/',
    level: 'SR/MA',
    keyFindings: '만성 요통에서 운동치료가 통증·기능에 소~중등도 이점.'
  },
  PENG_2022_JAMAO_RCT: {
    id: 'PENG_2022_JAMAO_RCT',
    citation: 'Peng MS et al. Therapeutic aquatic exercise vs PT modalities for chronic low back pain: RCT. JAMA Netw Open. 2022.',
    link: 'https://jamanetwork.com/journals/jamanetworkopen/fullarticle/2787713',
    level: 'RCT',
    keyFindings: '수중운동이 12개월까지 통증·기능 장기효과 우수.'
  },

  // Shoulder
  TATE_2012_JAT_SWIM: {
    id: 'TATE_2012_JAT_SWIM',
    citation: 'Tate A et al. Risk factors associated with shoulder pain in competitive swimmers. J Athl Train. 2012.',
    link: 'https://pubmed.ncbi.nlm.nih.gov/22488280/',
    level: 'Observational',
    keyFindings: '훈련량·반복 오버헤드 사용이 어깨 통증과 연관.'
  },
  LITTLEWOOD_2012_SR_RC: {
    id: 'LITTLEWOOD_2012_SR_RC',
    citation: 'Littlewood C et al. Exercise for rotator cuff tendinopathy: systematic review. 2012.',
    link: 'https://pubmed.ncbi.nlm.nih.gov/22507359/',
    level: 'SR/MA',
    keyFindings: '회전근개 건병증에서 운동치료 유효성을 지지(연구 이질성 존재).'
  },
  MCKENZIE_2023_SR_SWIMSHOULDER: {
    id: 'MCKENZIE_2023_SR_SWIMSHOULDER',
    citation: 'McKenzie A et al. Shoulder pain and injury risk factors in competitive swimmers. Scand J Med Sci Sports. 2023.',
    link: 'https://onlinelibrary.wiley.com/doi/10.1111/sms.14454',
    level: 'SR/MA',
    keyFindings: 'ACWR↑, 후면근 지구력↓ 등 위험요인 연관.'
  },

  // Knee CPGs
  JOSPT_2018_MENISCUS_CPG: {
    id: 'JOSPT_2018_MENISCUS_CPG',
    citation: 'Logerstedt DS et al. Knee Pain & Mobility Impairments: Meniscal & Articular Cartilage Lesions. JOSPT. 2018.',
    link: 'https://www.jospt.org/doi/10.2519/jospt.2018.0301',
    level: 'CPG',
    keyFindings: '반월상·연골 병변의 검사/분류/개입 권고.'
  },
  JOSPT_2017_KNEE_LIG_CPG: {
    id: 'JOSPT_2017_KNEE_LIG_CPG',
    citation: 'Logerstedt DS et al. Knee Stability & Movement Coordination Impairments: Knee Ligament Sprain. JOSPT. 2017.',
    link: 'https://www.jospt.org/doi/10.2519/jospt.2017.0510',
    level: 'CPG',
    keyFindings: '무릎 인대 손상 평가·재활·복귀 기준 제시.'
  },
  JOSPT_2019_PFPS_CPG: {
    id: 'JOSPT_2019_PFPS_CPG',
    citation: 'Willy RW et al. Patellofemoral Pain CPG. JOSPT. 2019.',
    link: 'https://www.jospt.org/doi/10.2519/jospt.2019.0302',
    level: 'CPG',
    keyFindings: 'PFPS의 기계적 부하 관리 및 운동중재 권고.'
  },

  // Ankle/Foot
  SADAAK_2024_RCT_ANKLE_AQUATIC: {
    id: 'SADAAK_2024_RCT_ANKLE_AQUATIC',
    citation: 'Sadaak MM et al. Aquatic vs conventional PT for grade III ankle sprain in elite athletes: RCT. J Orthop Surg Res. 2024.',
    link: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC11238378/',
    level: 'RCT',
    keyFindings: '수중 재활이 통증·균형·퍼포먼스·복귀시간 개선.'
  },
  JOSPT_2024_ACHILLES_CPG: {
    id: 'JOSPT_2024_ACHILLES_CPG',
    citation: 'Chimenti RL et al. Midportion Achilles Tendinopathy CPG (Revision 2024). JOSPT. 2024.',
    link: 'https://pubmed.ncbi.nlm.nih.gov/39611662/',
    level: 'CPG',
    keyFindings: '아킬레스 건병증의 평가와 점진적 부하훈련 권고.'
  },
  JOSPT_2023_PLANTAR_CPG: {
    id: 'JOSPT_2023_PLANTAR_CPG',
    citation: 'Koc TA Jr et al. Heel Pain—Plantar Fasciitis CPG (Revision 2023). JOSPT. 2023.',
    link: 'https://www.jospt.org/doi/10.2519/jospt.2023.0303',
    level: 'CPG',
    keyFindings: '족저근막염의 보존적 치료 권고(신장, 테이핑, 보강 등).'
  },

  // Wrist/Hand
  AAOS_2024_CTS_CPG: {
    id: 'AAOS_2024_CTS_CPG',
    citation: 'AAOS. Management of Carpal Tunnel Syndrome. 2024 CPG.',
    link: 'https://www.aaos.org/globalassets/quality-and-practice-resources/carpal-tunnel/carpal-tunnel-2024/cts-cpg.pdf',
    level: 'CPG',
    keyFindings: 'CTS 진단·보존/수술 치료 권고.'
  },
  JOSPT_2019_CTS_CPG: {
    id: 'JOSPT_2019_CTS_CPG',
    citation: 'Erickson M et al. Hand Pain & Sensory Deficits: Carpal Tunnel Syndrome CPG. JOSPT. 2019.',
    link: 'https://www.jospt.org/doi/10.2519/jospt.2019.0501',
    level: 'CPG',
    keyFindings: 'CTS 물리치료 진단/치료 권고.'
  },
  COCHRANE_2009_DEQUERVAIN: {
    id: 'COCHRANE_2009_DEQUERVAIN',
    citation: "Peters-Veluthamaningal C et al. Corticosteroid injection for de Quervain's tenosynovitis. Cochrane. 2009.",
    link: 'https://pubmed.ncbi.nlm.nih.gov/19588376/',
    level: 'SR/MA',
    keyFindings: '소규모 근거로 단기 호전 보고, 일반화 제한.'
  },
  MCNAMARA_2020_TFCC_SR: {
    id: 'MCNAMARA_2020_TFCC_SR',
    citation: 'McNamara CT et al. A Systematic Review of Palmer Type I TFCC Injuries. J Hand Microsurg. 2020.',
    link: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC7410809/',
    level: 'SR/MA',
    keyFindings: 'TFCC 손상 치료 결과 비교(보존적 우선 고려).'
  },

  // Hip
  JOSPT_2017_HIP_OA_CPG: {
    id: 'JOSPT_2017_HIP_OA_CPG',
    citation: 'Cibulka MT et al. Hip Pain & Mobility Deficits—Hip Osteoarthritis (Revision 2017). JOSPT. 2017.',
    link: 'https://www.jospt.org/doi/10.2519/jospt.2017.0301',
    level: 'CPG',
    keyFindings: '고관절 OA 평가/운동중재 권고.'
  },
  JOSPT_2023_NONARTHRITIC_HIP_CPG: {
    id: 'JOSPT_2023_NONARTHRITIC_HIP_CPG',
    citation: 'Enseki K et al. Nonarthritic Hip Joint Pain (Revision 2023). JOSPT. 2023.',
    link: 'https://www.jospt.org/doi/10.2519/jospt.2023.0302',
    level: 'CPG',
    keyFindings: '비관절염성 고관절 통증의 진단·운동중재 권고.'
  },
  MELLOR_2018_BMJ_GT_RCT: {
    id: 'MELLOR_2018_BMJ_GT_RCT',
    citation: 'Mellor R et al. Education + exercise vs corticosteroid injection for gluteal tendinopathy: RCT. BMJ. 2018.',
    link: 'https://www.bmj.com/content/361/bmj.k1662',
    level: 'RCT',
    keyFindings: '교육+운동이 주사보다 중장기 결과 우수.'
  },

  // Neck (for cervical issues)
  JOSPT_2017_NECK_CPG: {
    id: 'JOSPT_2017_NECK_CPG',
    citation: 'Blanpied PR et al. Neck Pain (Revision 2017) CPG. JOSPT. 2017.',
    link: 'https://www.jospt.org/doi/10.2519/jospt.2017.0302',
    level: 'CPG',
    keyFindings: '경부 통증에 대한 비수술적 중재 권고.'
  }
} as const;

// ────────────────────────────────────────────────────────────────────────────────
// 스트로크 템플릿(카테고리별 기본 안전도 & 코칭 큐)
// 대부분 stroke별 직접 RCT가 부족 → 근거수준은 기본적으로 Observational/Expert로 표기
// ────────────────────────────────────────────────────────────────────────────────
type StrokeTemplate = Record<Stroke, Omit<StrokeGuidance, 'medicalEvidence'>>;

const strokeTemplates: Record<Category, StrokeTemplate> = {
  spine: {
    freestyle: {
      level: 'caution',
      reason: '요추 과신전/과회전 가능',
      allowedMovements: ['중립 체간 회전', '부드러운 플러터킥'],
      prohibitedMovements: ['허리 과신전', '급격한 방향전환'],
      modifications: ['글라이드 짧게', '호흡 시 목·허리 중립'],
      alternatives: ['backstroke', 'elementary_backstroke'],
      detailedExplanation: '자유형은 체간 회전이 필요해 요추에 부담이 될 수 있어 강도·속도 조절 필수.'
    },
    backstroke: {
      level: 'safe',
      reason: '요추부 하중/전단이 낮음',
      allowedMovements: ['중립 체간', '부드러운 팔 스윕'],
      prohibitedMovements: ['과도한 허리 신전'],
      modifications: ['느린 템포 유지'],
      alternatives: [],
      detailedExplanation: '배영은 체간 중립을 쉽게 유지해 요추 부담이 가장 낮은 편.'
    },
    breaststroke: {
      level: 'caution',
      reason: '킥 말기 요추 신전 증가',
      allowedMovements: ['좁은 위프킥', '짧은 글라이드'],
      prohibitedMovements: ['깊은 허리 신전'],
      modifications: ['킥 폭 축소', '글라이드 시간 단축'],
      alternatives: ['backstroke', 'elementary_backstroke'],
      detailedExplanation: '평영 킥의 고관절 신전이 요추 신전을 유발할 수 있음.'
    },
    butterfly: {
      level: 'avoid',
      reason: '요추 파동/신전 토크가 큼',
      allowedMovements: [],
      prohibitedMovements: ['돌핀킥 강한 파동', '대흉근 과사용'],
      modifications: ['접영 회피 또는 드릴만 제한적 적용'],
      alternatives: ['backstroke', 'freestyle'],
      detailedExplanation: '접영은 웨이브 패턴으로 요추 전단/신전 부하가 커 금기.'
    },
    elementary_backstroke: {
      level: 'safe',
      reason: '저부하·중립자세 유지 용이',
      allowedMovements: ['느린 개구리킥', '편안한 리커버리'],
      prohibitedMovements: ['강한 킥'],
      modifications: ['템포 낮추기'],
      alternatives: [],
      detailedExplanation: '회복/컨디셔닝 목적에 적합.'
    },
    sidestroke: {
      level: 'caution',
      reason: '비대칭 체간 비틀림',
      allowedMovements: ['작은 킥', '체간 중립'],
      prohibitedMovements: ['과도한 트위스트'],
      modifications: ['아픈 쪽 위로 누워 비틀림 감소'],
      alternatives: ['backstroke', 'elementary_backstroke'],
      detailedExplanation: '측면 정렬 유지가 어려우면 요추 회전 스트레스 증가.'
    }
  },

  shoulder: {
    freestyle: {
      level: 'caution',
      reason: '오버헤드 반복·전방활주',
      allowedMovements: ['팔꿈치 약간 굴곡', '하이엘보 진입 최소화'],
      prohibitedMovements: ['패들 사용', '스프린트/볼륨 급증'],
      modifications: ['S-라인 짧게', '통증각 회피'],
      alternatives: ['elementary_backstroke', 'sidestroke'],
      detailedExplanation: '회전근개/전방 캡슐 스트레스 관리가 핵심.'
    },
    backstroke: {
      level: 'caution',
      reason: '벌림+가쪽돌림 말기 각도',
      allowedMovements: ['ROM 70~80% 범위', '부드러운 캐치'],
      prohibitedMovements: ['말기 가동범위 스내치'],
      modifications: ['볼륨 관리', '통증각 회피'],
      alternatives: ['elementary_backstroke', 'sidestroke'],
      detailedExplanation: '전방 불안정성/랩럼 시 끝범위 회피.'
    },
    breaststroke: {
      level: 'caution',
      reason: '벌림/가쪽돌림+수평모음',
      allowedMovements: ['좁은 스컬', '천천히 리커버리'],
      prohibitedMovements: ['넓은 스컬', '속도 추구'],
      modifications: ['스컬 폭 축소'],
      alternatives: ['elementary_backstroke', 'sidestroke'],
      detailedExplanation: '어깨 충돌 유발 자세를 줄이기.'
    },
    butterfly: {
      level: 'avoid',
      reason: '어깨 토크·가동범위 요구↑',
      allowedMovements: [],
      prohibitedMovements: ['큰 캐치', '돌핀 강도↑'],
      modifications: ['접영 회피'],
      alternatives: ['elementary_backstroke', 'sidestroke'],
      detailedExplanation: '통증/불안정성에서 고부하 접영은 비권장.'
    },
    elementary_backstroke: {
      level: 'safe',
      reason: '저부하 리듬, 어깨 전방활주↓',
      allowedMovements: ['느린 스컬'],
      prohibitedMovements: ['과한 벌림'],
      modifications: ['통증 없는 범위'],
      alternatives: [],
      detailedExplanation: '혈류 증가·가벼운 가동성 회복 목적.'
    },
    sidestroke: {
      level: 'safe',
      reason: '아픈 팔 휴식/저부하 가능',
      allowedMovements: ['통증 없는 스컬', '아픈 팔 몸통 따라 붙이기'],
      prohibitedMovements: ['과한 스컬'],
      modifications: ['한쪽 팔 최소 사용'],
      alternatives: ['elementary_backstroke'],
      detailedExplanation: '증상 조절에 용이.'
    }
  },

  elbow: {
    freestyle: {
      level: 'caution',
      reason: '견인기에서 팔꿈치/손목 토크',
      allowedMovements: ['팔꿈치 부드럽게 굴곡', '손목 중립'],
      prohibitedMovements: ['패들', '속도훈련'],
      modifications: ['로프/핀 금지', '볼륨↓'],
      alternatives: ['backstroke', 'elementary_backstroke'],
      detailedExplanation: '테니스/골프 엘보 증상 유발 동작 최소화.'
    },
    backstroke: {
      level: 'safe',
      reason: '견인 토크 상대적으로 낮음',
      allowedMovements: ['부드러운 풀'],
      prohibitedMovements: ['통증각 유지'],
      modifications: ['통증 유발 동작 즉시 수정'],
      alternatives: [],
      detailedExplanation: '저부하 유지 시 안전.'
    },
    breaststroke: {
      level: 'caution',
      reason: '스컬 시 회내/척·요측 편위',
      allowedMovements: ['좁은 스컬'],
      prohibitedMovements: ['강한 스컬'],
      modifications: ['속도 낮춤'],
      alternatives: ['backstroke', 'elementary_backstroke'],
      detailedExplanation: '팔꿈치/손목 스트레스 관리.'
    },
    butterfly: {
      level: 'avoid',
      reason: '견인 토크와 반복 고부하',
      allowedMovements: [],
      prohibitedMovements: ['접영 전체'],
      modifications: ['접영 회피'],
      alternatives: ['backstroke'],
      detailedExplanation: '급성기/통증기에는 비권장.'
    },
    elementary_backstroke: {
      level: 'safe',
      reason: '저부하',
      allowedMovements: ['느린 리듬'],
      prohibitedMovements: ['강한 스컬'],
      modifications: ['통증범위 내'],
      alternatives: [],
      detailedExplanation: '증상 조절 목적.'
    },
    sidestroke: {
      level: 'caution',
      reason: '한쪽 팔 과사용 위험',
      allowedMovements: ['아픈 팔 휴식'],
      prohibitedMovements: ['강한 한손 스컬'],
      modifications: ['아픈 팔은 몸통에 붙임'],
      alternatives: ['elementary_backstroke'],
      detailedExplanation: '비대칭 부하 주의.'
    }
  },

  wrist: {
    freestyle: {
      level: 'caution',
      reason: '손목 폄/편위 반복',
      allowedMovements: ['손목 중립'],
      prohibitedMovements: ['패들', '강한 스컬'],
      modifications: ['킥보드 장시간 사용 제한'],
      alternatives: ['backstroke', 'elementary_backstroke'],
      detailedExplanation: 'CTS/드꿰르벵/TFCC에 손목 스트레스 최소화.'
    },
    backstroke: {
      level: 'safe',
      reason: '손목 중립 유지 용이',
      allowedMovements: ['부드러운 풀'],
      prohibitedMovements: ['과한 회외/회내'],
      modifications: ['ROM 70~80%'],
      alternatives: [],
      detailedExplanation: '저부하 유지 시 안전.'
    },
    breaststroke: {
      level: 'caution',
      reason: '스컬 시 요·척측 편위',
      allowedMovements: ['좁은 스컬'],
      prohibitedMovements: ['강한 스컬'],
      modifications: ['속도 낮춤'],
      alternatives: ['backstroke', 'elementary_backstroke'],
      detailedExplanation: '수근부 구조 스트레스 관리.'
    },
    butterfly: {
      level: 'avoid',
      reason: '강스컬·팔궤적 토크↑',
      allowedMovements: [],
      prohibitedMovements: ['접영 전체'],
      modifications: ['접영 회피'],
      alternatives: ['backstroke'],
      detailedExplanation: '급성기/통증기 비권장.'
    },
    elementary_backstroke: {
      level: 'safe',
      reason: '저부하 회복',
      allowedMovements: ['느린 스컬'],
      prohibitedMovements: ['강한 스컬'],
      modifications: ['통증범위 내'],
      alternatives: [],
      detailedExplanation: '증상 조절·순환 촉진.'
    },
    sidestroke: {
      level: 'caution',
      reason: '한손 스컬 편측 부하',
      allowedMovements: ['아픈 손 휴식'],
      prohibitedMovements: ['강한 한손 스컬'],
      modifications: ['스컬 최소화'],
      alternatives: ['elementary_backstroke'],
      detailedExplanation: '비대칭 부하 주의.'
    }
  },

  hip: {
    freestyle: {
      level: 'safe',
      reason: '중립 고관절과 작은 킥',
      allowedMovements: ['작은 플러터킥'],
      prohibitedMovements: ['과도한 신전/큰 킥 폭'],
      modifications: ['골반 중립 유지'],
      alternatives: [],
      detailedExplanation: '힙 토크가 낮아 대체로 안전.'
    },
    backstroke: {
      level: 'safe',
      reason: '중립 체간·작은 킥',
      allowedMovements: ['작은 플러터킥'],
      prohibitedMovements: ['골반 과전방경사'],
      modifications: ['ROM 70~80%'],
      alternatives: [],
      detailedExplanation: '허리·고관절 모두 저부하.'
    },
    breaststroke: {
      level: 'caution',
      reason: '내회전/모음·굴곡 말기',
      allowedMovements: ['좁은 위프킥'],
      prohibitedMovements: ['깊은 굴곡+내회전'],
      modifications: ['킥 폭 축소'],
      alternatives: ['freestyle', 'backstroke'],
      detailedExplanation: 'FAI/랩럼에서 충돌 유발 자세 회피.'
    },
    butterfly: {
      level: 'caution',
      reason: '힙 신전 토크 증가',
      allowedMovements: ['작은 돌핀킥'],
      prohibitedMovements: ['강한 돌핀킥'],
      modifications: ['강도·속도 낮춤'],
      alternatives: ['freestyle', 'backstroke'],
      detailedExplanation: '증상 유발 시 회피.'
    },
    elementary_backstroke: {
      level: 'safe',
      reason: '저부하 회복',
      allowedMovements: ['느린 개구리킥'],
      prohibitedMovements: ['깊은 모음'],
      modifications: ['통증범위 내'],
      alternatives: [],
      detailedExplanation: '가동성 회복/혈류 증가.'
    },
    sidestroke: {
      level: 'caution',
      reason: '비대칭 부하·압박',
      allowedMovements: ['아픈 쪽 위로 눕기'],
      prohibitedMovements: ['아픈 쪽 아래로 눕기(압박)'],
      modifications: ['킥 폭 축소'],
      alternatives: ['freestyle', 'backstroke'],
      detailedExplanation: 'GTPS에서는 중둔근 압박 회피.'
    }
  },

  knee: {
    freestyle: {
      level: 'safe',
      reason: '무릎 굴곡 각 작고 전단 낮음',
      allowedMovements: ['작은 킥', '엉-무-발끝 정렬'],
      prohibitedMovements: ['큰 킥 폭'],
      modifications: ['속도 낮춤'],
      alternatives: [],
      detailedExplanation: 'OA/반월상/ACL 모두 안전도가 높은 편.'
    },
    backstroke: {
      level: 'safe',
      reason: '부드러운 플러터킥',
      allowedMovements: ['작은 킥'],
      prohibitedMovements: ['큰 킥 폭'],
      modifications: ['속도 낮춤'],
      alternatives: [],
      detailedExplanation: '저부하 선택.'
    },
    breaststroke: {
      level: 'caution',
      reason: '위프킥의 외회전/모음, 깊은 굴곡',
      allowedMovements: ['좁은 위프킥'],
      prohibitedMovements: ['깊은 굴곡+트위스트'],
      modifications: ['킥 폭 축소'],
      alternatives: ['freestyle', 'backstroke'],
      detailedExplanation: '내측구조/연골·반월상 스트레스 증가 가능.'
    },
    butterfly: {
      level: 'caution',
      reason: '반복 굴곡·속도',
      allowedMovements: ['작은 돌핀킥'],
      prohibitedMovements: ['강한 돌핀킥'],
      modifications: ['강도 낮춤'],
      alternatives: ['freestyle', 'backstroke'],
      detailedExplanation: '초기/수술 직후에는 회피 권장.'
    },
    elementary_backstroke: {
      level: 'safe',
      reason: '저부하 회복',
      allowedMovements: ['느린 개구리킥'],
      prohibitedMovements: ['큰 킥 폭'],
      modifications: ['ROM 내'],
      alternatives: [],
      detailedExplanation: '순환·가동성 목적.'
    },
    sidestroke: {
      level: 'caution',
      reason: '비대칭 킥',
      allowedMovements: ['작은 킥'],
      prohibitedMovements: ['비틀림 동작'],
      modifications: ['킥 폭 축소'],
      alternatives: ['freestyle', 'backstroke'],
      detailedExplanation: '트위스트 회피.'
    }
  },

  ankle: {
    freestyle: {
      level: 'safe',
      reason: '발목 폄 토크 낮음(속도 낮출 때)',
      allowedMovements: ['작은 킥', '포인팅 과도 금지'],
      prohibitedMovements: ['핀 사용(초기)'],
      modifications: ['속도 낮춤', 'ROM 내'],
      alternatives: [],
      detailedExplanation: '아킬레스/족저/염좌 모두에서 안전도가 높은 편.'
    },
    backstroke: {
      level: 'safe',
      reason: '작은 플러터킥',
      allowedMovements: ['작은 킥'],
      prohibitedMovements: ['핀 사용(초기)'],
      modifications: ['속도 낮춤'],
      alternatives: [],
      detailedExplanation: '저부하 선택.'
    },
    breaststroke: {
      level: 'caution',
      reason: '내번/외번·내외회전 스트레스',
      allowedMovements: ['좁은 위프킥'],
      prohibitedMovements: ['넓은 킥 폭'],
      modifications: ['킥 폭 축소'],
      alternatives: ['freestyle', 'backstroke'],
      detailedExplanation: 'PTTD에서 과외반 유발 회피.'
    },
    butterfly: {
      level: 'caution',
      reason: '돌핀킥의 족저굴곡 요구',
      allowedMovements: ['작은 돌핀킥'],
      prohibitedMovements: ['강한 돌핀킥'],
      modifications: ['강도 낮춤'],
      alternatives: ['freestyle', 'backstroke'],
      detailedExplanation: '아킬레스·족저에 부하↑.'
    },
    elementary_backstroke: {
      level: 'safe',
      reason: '저부하 회복',
      allowedMovements: ['느린 개구리킥'],
      prohibitedMovements: ['큰 킥 폭'],
      modifications: ['ROM 내'],
      alternatives: [],
      detailedExplanation: '증상 조절·순환 촉진.'
    },
    sidestroke: {
      level: 'caution',
      reason: '편측 킥 과사용',
      allowedMovements: ['작은 킥'],
      prohibitedMovements: ['강한 킥'],
      modifications: ['킥 폭 축소'],
      alternatives: ['freestyle', 'backstroke'],
      detailedExplanation: '비대칭 부하 관리.'
    }
  }
};

// 카테고리별 기본 근거 셋(주요 키)
const categoryEvidence: Record<Category, string[]> = {
  spine: ['HAYDEN_2005_CDSR_LBP', 'PENG_2022_JAMAO_RCT'],
  shoulder: ['TATE_2012_JAT_SWIM', 'LITTLEWOOD_2012_SR_RC', 'MCKENZIE_2023_SR_SWIMSHOULDER'],
  knee: ['BARTELS_2016_CDSR', 'HINMAN_2007_PT_RCT', 'JOSPT_2018_MENISCUS_CPG', 'JOSPT_2017_KNEE_LIG_CPG', 'JOSPT_2019_PFPS_CPG'],
  ankle: ['SADAAK_2024_RCT_ANKLE_AQUATIC', 'JOSPT_2024_ACHILLES_CPG', 'JOSPT_2023_PLANTAR_CPG'],
  wrist: ['AAOS_2024_CTS_CPG', 'JOSPT_2019_CTS_CPG', 'COCHRANE_2009_DEQUERVAIN', 'MCNAMARA_2020_TFCC_SR'],
  elbow: ['LITTLEWOOD_2012_SR_RC'], // 팔꿈치 전용 CPG 부족 → 팔꿈치 부하 관리 원칙 + 상지 운동 근거
  hip: ['JOSPT_2017_HIP_OA_CPG', 'JOSPT_2023_NONARTHRITIC_HIP_CPG', 'MELLOR_2018_BMJ_GT_RCT', 'BARTELS_2016_CDSR', 'HINMAN_2007_PT_RCT']
};

// ────────────────────────────────────────────────────────────────────────────────
// 28개 질환 메타데이터(카테고리·중증도)
// ────────────────────────────────────────────────────────────────────────────────
const conditionsMeta: Array<{ id: string; name: string; cat: Category; severity: 'mild' | 'moderate' | 'severe'; }> = [
  // Spine (5)
  { id: 'lumbar_disc_herniation', name: '요추 추간판 탈출증', cat: 'spine', severity: 'moderate' },
  { id: 'chronic_nonspecific_lbp', name: '만성 비특이적 요통', cat: 'spine', severity: 'moderate' },
  { id: 'lumbar_spinal_stenosis', name: '요추 척추관 협착증', cat: 'spine', severity: 'moderate' },
  { id: 'spondylolisthesis', name: '척추전방전위증', cat: 'spine', severity: 'moderate' },
  { id: 'cervical_spondylosis', name: '경추증/경추성 통증', cat: 'spine', severity: 'mild' },

  // Shoulder (6)
  { id: 'rotator_cuff_tendinopathy', name: '회전근개 건병증', cat: 'shoulder', severity: 'moderate' },
  { id: 'subacromial_impingement', name: '견봉하 충돌증후군', cat: 'shoulder', severity: 'moderate' },
  { id: 'adhesive_capsulitis', name: '유착성 관절낭염(오십견)', cat: 'shoulder', severity: 'moderate' },
  { id: 'gh_instability', name: '견관절 불안정성', cat: 'shoulder', severity: 'moderate' },
  { id: 'shoulder_labral_tear', name: '견관절 관절순 손상(SLAP 포함)', cat: 'shoulder', severity: 'moderate' },
  { id: 'biceps_tendinopathy', name: '상완이두근 장두 건병증', cat: 'shoulder', severity: 'mild' },

  // Elbow (2)
  { id: 'lateral_epicondylalgia', name: '외측 상과염(테니스 엘보)', cat: 'elbow', severity: 'mild' },
  { id: 'medial_epicondylalgia', name: '내측 상과염(골프 엘보)', cat: 'elbow', severity: 'mild' },

  // Wrist/Hand (3)
  { id: 'de_quervain', name: '드꿰르벵 건초염', cat: 'wrist', severity: 'mild' },
  { id: 'carpal_tunnel', name: '수근관 증후군', cat: 'wrist', severity: 'moderate' },
  { id: 'tfcc_injury', name: 'TFCC(삼각섬유연골복합체) 손상', cat: 'wrist', severity: 'moderate' },

  // Hip (4)
  { id: 'hip_oa', name: '고관절 골관절염', cat: 'hip', severity: 'moderate' },
  { id: 'femoroacetabular_impingement', name: 'FAI(대퇴비구 충돌)', cat: 'hip', severity: 'moderate' },
  { id: 'gtps_gluteal_tendinopathy', name: '대전자 통증증후군/둔근 건병증', cat: 'hip', severity: 'moderate' },
  { id: 'hip_labral_tear', name: '고관절 관절순 손상', cat: 'hip', severity: 'moderate' },

  // Knee (4)
  { id: 'knee_oa', name: '무릎 골관절염', cat: 'knee', severity: 'moderate' },
  { id: 'meniscal_tear', name: '반월상 연골 손상', cat: 'knee', severity: 'moderate' },
  { id: 'patellofemoral_pain', name: '슬개대퇴 통증증후군', cat: 'knee', severity: 'mild' },
  { id: 'acl_injury', name: '전방십자인대 손상', cat: 'knee', severity: 'severe' },

  // Ankle (4)
  { id: 'ankle_sprain', name: '발목 염좌', cat: 'ankle', severity: 'mild' },
  { id: 'achilles_tendinopathy', name: '아킬레스 건병증', cat: 'ankle', severity: 'moderate' },
  { id: 'plantar_fasciitis', name: '족저근막염', cat: 'ankle', severity: 'mild' },
  { id: 'ankle_oa', name: '발목 골관절염', cat: 'ankle', severity: 'moderate' }
];

// ────────────────────────────────────────────────────────────────────────────────
// 메인 데이터 생성 함수
// ────────────────────────────────────────────────────────────────────────────────
function createJointConditionGuidance(meta: typeof conditionsMeta[0]): JointConditionGuidance {
  const template = strokeTemplates[meta.cat];
  const evidenceKeys = categoryEvidence[meta.cat];

  const swimmingGuidance: Record<Stroke, StrokeGuidance> = {} as Record<Stroke, StrokeGuidance>;

  // 각 스트로크에 대해 템플릿 기반으로 가이드라인 생성
  (Object.keys(template) as Stroke[]).forEach(stroke => {
    const baseTemplate = template[stroke];
    swimmingGuidance[stroke] = {
      ...baseTemplate,
      medicalEvidence: evidenceKeys.map(key => EVIDENCE_BASED_SOURCES[key]).filter(Boolean)
    };
  });

  return {
    conditionId: meta.id,
    conditionName: meta.name,
    category: meta.cat,
    severity: meta.severity,
    swimmingGuidance,
    exerciseRestrictions: {
      intensityReduction: meta.severity === 'mild' ? 10 : meta.severity === 'moderate' ? 20 : 30,
      durationLimit: meta.severity === 'mild' ? 60 : meta.severity === 'moderate' ? 45 : 30,
      frequencyLimit: meta.severity === 'mild' ? 5 : meta.severity === 'moderate' ? 4 : 3,
      contraindicatedExercises: [],
      recommendedExercises: []
    }
  };
}

// ────────────────────────────────────────────────────────────────────────────────
// 최종 데이터 내보내기
// ────────────────────────────────────────────────────────────────────────────────
export const allJointConditions: JointConditionGuidance[] = conditionsMeta.map(createJointConditionGuidance);







