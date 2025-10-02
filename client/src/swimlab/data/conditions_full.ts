/**
 * SwimLab Data Pack v4 - 전체 질환 데이터베이스
 * 
 * MSK 28개 질환 + 피부/일반/정신/특수 질환 포함
 * ChatGPT 구조 기반, 기존 healthConditions 데이터 통합
 */

export type ImpactType = 'movement'|'volume'|'intensity'|'rest'|'equipment'|'breath';
export type StrokeName = 'freestyle'|'backstroke'|'breaststroke'|'butterfly'|'elementary_backstroke'|'sidestroke';

export interface Condition {
  id:string; 
  name:string; 
  category:'spine'|'shoulder'|'elbow'|'wrist'|'hip'|'knee'|'ankle'|'skin'|'ent'|'chronic'|'mental'|'special'|'other';
  severity?:'mild'|'moderate'|'severe';
  impacts:{ type:ImpactType; how:string; delta?:number }[];
  strokeNotes?: Partial<Record<StrokeName,{level:'safe'|'caution'|'avoid'; mods?:string[]}>>;
  evidenceKeys:string[]; 
  notes?:string[];
}

export const CONDITIONS: Condition[] = [
  // ========== SPINE (5개) ==========
  { 
    id:'lumbar_disc_herniation', 
    name:'요추 추간판탈출증(허리디스크)', 
    category:'spine', 
    severity:'moderate',
    impacts:[
      {type:'movement',how:'접영 회피, 과신전/돌핀킥 제한'},
      {type:'volume',how:'볼륨 20% 감소',delta:-20},
      {type:'intensity',how:'Z3 이하로 제한'},
      {type:'rest',how:'휴식 +15초'}
    ],
    strokeNotes:{
      butterfly:{level:'avoid'},
      backstroke:{level:'safe',mods:['중립척추 유지']},
      breaststroke:{level:'caution',mods:['좁은 킥']},
      elementary_backstroke:{level:'safe'}
    },
    evidenceKeys:['LBP_CPG_JOSPT_2021','LBP_AQUATIC_RCT_JAMA_2022'],
    notes:['스노클로 경추 회전/신전 감소']
  },
  { 
    id:'lumbar_spinal_stenosis', 
    name:'요추관협착증', 
    category:'spine', 
    severity:'moderate',
    impacts:[
      {type:'movement',how:'과신전 회피'},
      {type:'volume',how:'볼륨 15% 감소',delta:-15},
      {type:'intensity',how:'Z3 이하'},
      {type:'rest',how:'휴식 +10초'}
    ],
    strokeNotes:{
      butterfly:{level:'avoid'},
      backstroke:{level:'safe'}
    },
    evidenceKeys:['LBP_CPG_JOSPT_2021'],
    notes:['중립 척추 유지']
  },
  { 
    id:'chronic_nonspecific_lbp', 
    name:'만성 비특이적 요통', 
    category:'spine', 
    severity:'moderate',
    impacts:[
      {type:'intensity',how:'CSS 이하 유지'},
      {type:'volume',how:'점진 증가(10% 규칙)'}
    ],
    strokeNotes:{
      butterfly:{level:'avoid'},
      backstroke:{level:'safe'},
      freestyle:{level:'caution'}
    },
    evidenceKeys:['LBP_CPG_JOSPT_2021','LBP_AQUATIC_RCT_JAMA_2022']
  },
  { 
    id:'cervical_radiculopathy', 
    name:'경추 신경뿌리병증/경부통', 
    category:'spine', 
    severity:'mild',
    impacts:[{type:'movement',how:'과도한 회전/신전 회피'}],
    strokeNotes:{
      freestyle:{level:'caution',mods:['스노클 사용','양측호흡 회피']},
      backstroke:{level:'safe'},
      butterfly:{level:'avoid'}
    },
    evidenceKeys:['LBP_CPG_JOSPT_2021']
  },
  { 
    id:'axial_spondyloarthritis', 
    name:'축성 척추관절염', 
    category:'spine', 
    severity:'moderate',
    impacts:[
      {type:'intensity',how:'점진적 템포'},
      {type:'movement',how:'유연성 운동 포함'}
    ],
    strokeNotes:{
      freestyle:{level:'safe'},
      breaststroke:{level:'caution'},
      butterfly:{level:'caution'}
    },
    evidenceKeys:['AXSPA_ASAS_EULAR_2022'],
    notes:['척추 유연성 운동']
  },

  // ========== SHOULDER (6개) ==========
  { 
    id:'rotator_cuff_tendinopathy', 
    name:'회전근개 건병증', 
    category:'shoulder', 
    severity:'moderate',
    impacts:[
      {type:'movement',how:'오버헤드 볼륨 감소'},
      {type:'equipment',how:'패들 금지'}
    ],
    strokeNotes:{
      butterfly:{level:'avoid'},
      freestyle:{level:'caution',mods:['볼륨 감소','풀부이 사용']},
      breaststroke:{level:'safe'}
    },
    evidenceKeys:['RCRSP_CPG_JOSPT_2025','SAPS_SR_JOSPT_2020','SWIMMERS_SHOULDER_SR_2020']
  },
  { 
    id:'subacromial_pain_syndrome', 
    name:'견봉하 통증', 
    category:'shoulder', 
    severity:'moderate',
    impacts:[{type:'movement',how:'충돌 유발 범위 회피'}],
    strokeNotes:{
      butterfly:{level:'avoid'},
      freestyle:{level:'caution'},
      breaststroke:{level:'safe'}
    },
    evidenceKeys:['SAPS_SR_JOSPT_2020']
  },
  { 
    id:'glenohumeral_instability', 
    name:'견관절 불안정성', 
    category:'shoulder', 
    severity:'moderate',
    impacts:[
      {type:'movement',how:'범위/속도 제한'},
      {type:'equipment',how:'패들 금지'}
    ],
    strokeNotes:{
      butterfly:{level:'avoid'},
      freestyle:{level:'caution'}
    },
    evidenceKeys:['SHOULDER_INSTABILITY_BESS_2019']
  },
  { 
    id:'adhesive_capsulitis', 
    name:'유착성 관절낭염(오십견)', 
    category:'shoulder', 
    severity:'moderate',
    impacts:[{type:'movement',how:'가동범위 내 진행'}],
    strokeNotes:{
      freestyle:{level:'caution'},
      backstroke:{level:'safe'},
      butterfly:{level:'avoid'}
    },
    evidenceKeys:['ADHESIVE_CAP_CPG_JOSPT_2013']
  },
  { 
    id:'ac_joint_arthropathy', 
    name:'견쇄관절 병변', 
    category:'shoulder', 
    severity:'mild',
    impacts:[{type:'movement',how:'수평내전/딥캐치 회피'}],
    strokeNotes:{freestyle:{level:'caution'}},
    evidenceKeys:['SWIMMERS_SHOULDER_SR_2020']
  },
  { 
    id:'swimmer_shoulder_overuse', 
    name:'스위머스 숄더(과사용)', 
    category:'shoulder', 
    severity:'moderate',
    impacts:[
      {type:'volume',how:'총볼륨 10–20% 감량',delta:-15},
      {type:'equipment',how:'패들 금지'}
    ],
    strokeNotes:{freestyle:{level:'caution'}},
    evidenceKeys:['SWIMMERS_SHOULDER_SR_2020']
  },

  // ========== ELBOW/WRIST (5개) ==========
  { 
    id:'lateral_epicondylalgia', 
    name:'외측 상과 건병증(테니스 엘보)', 
    category:'elbow', 
    severity:'moderate',
    impacts:[
      {type:'movement',how:'고속 캐치/패들 회피'},
      {type:'intensity',how:'팔 품질 우선'}
    ],
    strokeNotes:{
      butterfly:{level:'avoid'},
      freestyle:{level:'caution'}
    },
    evidenceKeys:['LATERAL_ELBOW_CPG_JOSPT_2022']
  },
  { 
    id:'medial_epicondylitis', 
    name:'내측 상과염(골퍼 엘보)', 
    category:'elbow', 
    severity:'mild',
    impacts:[{type:'movement',how:'그립 완화/회내외 과다 금지'}],
    strokeNotes:{freestyle:{level:'caution'}},
    evidenceKeys:['LATERAL_ELBOW_CPG_JOSPT_2022']
  },
  { 
    id:'carpal_tunnel_syndrome', 
    name:'수근관증후군', 
    category:'wrist', 
    severity:'mild',
    impacts:[{type:'movement',how:'손목 중립/스컬 범위 제한'}],
    strokeNotes:{
      butterfly:{level:'avoid'},
      freestyle:{level:'caution',mods:['주먹쥔 수영']}
    },
    evidenceKeys:['CTS_AAOS_2024']
  },
  { 
    id:'de_quervain_tenosynovitis', 
    name:'드퀘르벵 건초염', 
    category:'wrist', 
    severity:'mild',
    impacts:[{type:'movement',how:'요/척측 편위 스컬 금지'}],
    strokeNotes:{freestyle:{level:'caution'}},
    evidenceKeys:['DQT_JAMA_SR_2023']
  },
  { 
    id:'tfcc_injury', 
    name:'TFCC(삼각섬유연골복합체) 손상', 
    category:'wrist', 
    severity:'moderate',
    impacts:[{type:'movement',how:'척측 편위 하중 회피'}],
    strokeNotes:{freestyle:{level:'caution'}},
    evidenceKeys:['DQT_JAMA_SR_2023']
  },

  // ========== HIP (4개) ==========
  { 
    id:'hip_oa', 
    name:'고관절 골관절염', 
    category:'hip', 
    severity:'moderate',
    impacts:[
      {type:'movement',how:'넓은 외전/외회전 회피'},
      {type:'intensity',how:'CSS 이하'}
    ],
    strokeNotes:{
      breaststroke:{level:'caution',mods:['킥 범위 축소']},
      butterfly:{level:'avoid'}
    },
    evidenceKeys:['HIP_OA_CPG_JOSPT_2017','AQUATIC_OA_CDSR_2016']
  },
  { 
    id:'femoroacetabular_impingement', 
    name:'FAI(대퇴비구 충돌)', 
    category:'hip', 
    severity:'moderate',
    impacts:[{type:'movement',how:'개구리킥 축소'}],
    strokeNotes:{
      breaststroke:{level:'caution'},
      butterfly:{level:'avoid'}
    },
    evidenceKeys:['FAIS_NONARTHRITIC_CPG_JOSPT_2023']
  },
  { 
    id:'labral_tear_hip', 
    name:'고관절 관절순 파열', 
    category:'hip', 
    severity:'moderate',
    impacts:[{type:'movement',how:'과범위 회피'}],
    strokeNotes:{breaststroke:{level:'caution'}},
    evidenceKeys:['FAIS_NONARTHRITIC_CPG_JOSPT_2023']
  },
  { 
    id:'post_total_hip_arthroplasty', 
    name:'고관절 치환술 후(안정기)', 
    category:'hip', 
    severity:'mild',
    impacts:[{type:'movement',how:'내회전/내전/굴곡 제한 준수'}],
    strokeNotes:{
      freestyle:{level:'safe'},
      breaststroke:{level:'caution'}
    },
    evidenceKeys:['HIP_OA_CPG_JOSPT_2017']
  },

  // ========== KNEE (4개) ==========
  { 
    id:'knee_oa', 
    name:'무릎 골관절염', 
    category:'knee', 
    severity:'moderate',
    impacts:[
      {type:'movement',how:'개구리킥 범위 감소'},
      {type:'intensity',how:'CSS 이하'}
    ],
    strokeNotes:{
      breaststroke:{level:'caution',mods:['좁은 킥']},
      elementary_backstroke:{level:'safe'}
    },
    evidenceKeys:['KNEE_OA_CDSR_2015','AQUATIC_OA_CDSR_2016']
  },
  { 
    id:'meniscal_tear', 
    name:'반월상연골 손상', 
    category:'knee', 
    severity:'moderate',
    impacts:[
      {type:'movement',how:'평영킥 회피, 무릎 회전 제한'},
      {type:'volume',how:'볼륨 25% 감소',delta:-25},
      {type:'intensity',how:'Z3 이하'},
      {type:'rest',how:'휴식 +15초'}
    ],
    strokeNotes:{breaststroke:{level:'caution'}},
    evidenceKeys:['MENISCUS_CPG_JOSPT_2018']
  },
  { 
    id:'knee_ligament_injury', 
    name:'무릎 인대 손상(ACL/MCL 등)', 
    category:'knee', 
    severity:'moderate',
    impacts:[
      {type:'movement',how:'평영킥 완전 회피, 전/후방 전단 스트레스 금지'},
      {type:'volume',how:'볼륨 30% 감소',delta:-30},
      {type:'intensity',how:'Z3 이하'},
      {type:'rest',how:'휴식 +20초'}
    ],
    strokeNotes:{breaststroke:{level:'avoid'}},
    evidenceKeys:['KNEE_LIG_CPG_JOSPT_2017']
  },
  { 
    id:'pfps', 
    name:'무릎 앞통증 증후군(PFPS)', 
    category:'knee', 
    severity:'mild',
    impacts:[
      {type:'movement',how:'넓은 외전/회전 킥 회피'},
      {type:'volume',how:'볼륨 10% 감소',delta:-10},
      {type:'intensity',how:'Z4 이하'},
      {type:'rest',how:'휴식 +5초'}
    ],
    strokeNotes:{breaststroke:{level:'caution',mods:['킥 범위 축소']}},
    evidenceKeys:['PFPS_CPG_JOSPT_2019']
  },

  // ========== ANKLE (4개) ==========
  { 
    id:'acute_lateral_ankle_sprain', 
    name:'급성 가쪽 발목 염좌', 
    category:'ankle', 
    severity:'moderate',
    impacts:[
      {type:'movement',how:'킥 최소/핀 금지'},
      {type:'equipment',how:'핀 사용 금지'}
    ],
    strokeNotes:{
      breaststroke:{level:'avoid'},
      butterfly:{level:'avoid'},
      elementary_backstroke:{level:'safe'}
    },
    evidenceKeys:['ANKLE_SPRAIN_CPG_2021']
  },
  { 
    id:'chronic_ankle_instability', 
    name:'만성 발목 불안정성', 
    category:'ankle', 
    severity:'moderate',
    impacts:[{type:'movement',how:'비대칭 킥 교대'}],
    strokeNotes:{freestyle:{level:'caution'}},
    evidenceKeys:['ANKLE_SPRAIN_CPG_2021']
  },
  { 
    id:'achilles_tendinopathy', 
    name:'아킬레스 건병증', 
    category:'ankle', 
    severity:'moderate',
    impacts:[
      {type:'movement',how:'강한 플랜타플렉션/핀 금지'},
      {type:'volume',how:'볼륨 20% 감소',delta:-20},
      {type:'intensity',how:'Z4 이하'},
      {type:'rest',how:'휴식 +15초'},
      {type:'equipment',how:'핀 제한'}
    ],
    strokeNotes:{
      butterfly:{level:'avoid'},
      freestyle:{level:'caution',mods:['풀부이 사용']}
    },
    evidenceKeys:['ACHILLES_CPG_2024']
  },
  { 
    id:'plantar_fasciitis', 
    name:'족저근막염', 
    category:'ankle', 
    severity:'mild',
    impacts:[
      {type:'movement',how:'강한 푸시오프 회피'},
      {type:'volume',how:'볼륨 10% 감소',delta:-10},
      {type:'intensity',how:'Z4 이하'},
      {type:'rest',how:'휴식 +5초'},
      {type:'equipment',how:'핀 사용 금지'}
    ],
    strokeNotes:{
      butterfly:{level:'caution'},
      freestyle:{level:'caution',mods:['부드러운 턴']}
    },
    evidenceKeys:['PLANTAR_FASCIA_CPG_2023']
  },

  // ========== SKIN/ENT (5개) ==========
  { 
    id:'open_wound', 
    name:'미치유 상처/거즈로 덮기 어려운 상처', 
    category:'skin', 
    severity:'moderate',
    impacts:[
      {type:'movement',how:'공공수영장 금지'},
      {type:'volume',how:'수영 완전 금지'}
    ],
    strokeNotes:{
      freestyle:{level:'avoid'},
      backstroke:{level:'avoid'},
      breaststroke:{level:'avoid'},
      butterfly:{level:'avoid'},
      elementary_backstroke:{level:'avoid'},
      sidestroke:{level:'avoid'}
    },
    evidenceKeys:['CDC_HEALTHY_SWIM'],
    notes:['상처 치유 전 회피','방수 드레싱 필요']
  },
  { 
    id:'diarrheal_illness', 
    name:'설사성 질환 또는 크립토스포리디움 의심', 
    category:'skin', 
    severity:'severe',
    impacts:[{type:'movement',how:'대변-수계 전파 방지'}],
    strokeNotes:{
      freestyle:{level:'avoid'},
      backstroke:{level:'avoid'},
      breaststroke:{level:'avoid'},
      butterfly:{level:'avoid'},
      elementary_backstroke:{level:'avoid'},
      sidestroke:{level:'avoid'}
    },
    evidenceKeys:['CDC_HEALTHY_SWIM'],
    notes:['증상 소실 후 2주 회피']
  },
  { 
    id:'eczema_atopic', 
    name:'아토피/습진', 
    category:'skin', 
    severity:'mild',
    impacts:[
      {type:'rest',how:'샤워/보습 루틴'},
      {type:'equipment',how:'민감피부용 수모/고글'}
    ],
    evidenceKeys:['CDC_HEALTHY_SWIM']
  },
  { 
    id:'tinea_pedis', 
    name:'무좀(족부백선)', 
    category:'skin', 
    severity:'mild',
    impacts:[
      {type:'rest',how:'발 건조/샤워'},
      {type:'equipment',how:'슬리퍼 착용'}
    ],
    evidenceKeys:['CDC_HEALTHY_SWIM']
  },
  { 
    id:'otitis_externa', 
    name:'외이도염(수영자귀)', 
    category:'ent', 
    severity:'mild',
    impacts:[
      {type:'movement',how:'잠수/헤드업 회피'},
      {type:'rest',how:'귀 건조'}
    ],
    evidenceKeys:['CDC_HEALTHY_SWIM']
  },

  // ========== CHRONIC/GENERAL (6개) ==========
  { 
    id:'hypertension', 
    name:'고혈압', 
    category:'chronic', 
    severity:'moderate',
    impacts:[
      {type:'intensity',how:'EN1–EN2 우선, 발살바 금지'},
      {type:'rest',how:'인터벌 휴식 충분'}
    ],
    strokeNotes:{
      freestyle:{level:'safe'},
      backstroke:{level:'safe'}
    },
    evidenceKeys:['WHO_2020_PA'],
    notes:['무호흡 스프린트 금지','과도한 혈압 상승 회피']
  },
  { 
    id:'diabetes', 
    name:'당뇨병', 
    category:'chronic', 
    severity:'moderate',
    impacts:[
      {type:'rest',how:'저혈당 모니터링/간식'},
      {type:'intensity',how:'서서히 증감'}
    ],
    evidenceKeys:['ADA_SOC_2025'],
    notes:['저혈당 대처','발상태 점검','규칙적 운동']
  },
  { 
    id:'asthma', 
    name:'천식', 
    category:'chronic', 
    severity:'mild',
    impacts:[
      {type:'intensity',how:'충분 워밍업, 사전 흡입제 고려'},
      {type:'breath',how:'하이폭식 금지'}
    ],
    evidenceKeys:['GINA_2024','ARC_YMCA_HYPOXIC_2022'],
    notes:['준비운동 필수','SABA 사전사용']
  },
  { 
    id:'pregnancy', 
    name:'임신', 
    category:'special', 
    severity:'mild',
    impacts:[
      {type:'intensity',how:'중등도 150분/주, 과열·하이폭식 금지'},
      {type:'movement',how:'복부압력 드릴 회피'}
    ],
    evidenceKeys:['ACOG_PREG_2020','WHO_2020_PA'],
    notes:['과열 방지','미끄럼 주의']
  },
  { 
    id:'stable_coronary_disease', 
    name:'안정형 허혈성 심장병', 
    category:'chronic', 
    severity:'moderate',
    impacts:[
      {type:'intensity',how:'의료진 허가 하 Z1–Z2 중심'},
      {type:'rest',how:'증상 모니터링'}
    ],
    evidenceKeys:['WHO_2020_PA']
  },
  { 
    id:'obesity', 
    name:'비만/과체중', 
    category:'chronic', 
    severity:'mild',
    impacts:[
      {type:'movement',how:'점프/깊은 돌핀 제한'},
      {type:'intensity',how:'지속 위주'}
    ],
    evidenceKeys:['WHO_2020_PA']
  },

  // ========== MENTAL/SPECIAL (6개) ==========
  { 
    id:'depression', 
    name:'우울', 
    category:'mental', 
    severity:'mild',
    impacts:[
      {type:'intensity',how:'규칙적 운동'},
      {type:'volume',how:'EN1-EN2 중심'}
    ],
    notes:['규칙적 운동','EN1-EN2 중심','과도한 피로 회피'],
    evidenceKeys:['WHO_2020_PA']
  },
  { 
    id:'anxiety', 
    name:'불안', 
    category:'mental', 
    severity:'mild',
    impacts:[
      {type:'intensity',how:'안정적인 환경'},
      {type:'breath',how:'하이폭식 금지'}
    ],
    notes:['안정적인 환경','EN1-EN2 중심','스트레스 상황 회피'],
    evidenceKeys:['WHO_2020_PA','ARC_YMCA_HYPOXIC_2022']
  },
  { 
    id:'anxiety_panic', 
    name:'불안/공황', 
    category:'mental', 
    severity:'mild',
    impacts:[
      {type:'breath',how:'하이폭식 금지'},
      {type:'rest',how:'안전감 확보/동반자 수영'}
    ],
    evidenceKeys:['WHO_2020_PA','ARC_YMCA_HYPOXIC_2022']
  },
  { 
    id:'epilepsy', 
    name:'뇌전증', 
    category:'special', 
    severity:'mild',
    impacts:[
      {type:'movement',how:'단독수영 금지/감독 필요'},
      {type:'breath',how:'장시간 숨참기 금지'}
    ],
    evidenceKeys:['ARC_YMCA_HYPOXIC_2022']
  },
  { 
    id:'openwater_beginner', 
    name:'오픈워터 입문', 
    category:'special', 
    severity:'mild',
    impacts:[
      {type:'movement',how:'안전 장비 착용'},
      {type:'volume',how:'짧은 거리부터'},
      {type:'rest',how:'휴식 +10초'}
    ],
    notes:['안전 장비 착용','짧은 거리부터','혼자 수영 금지'],
    evidenceKeys:[]
  },
  { 
    id:'cold_water', 
    name:'저수온', 
    category:'special', 
    severity:'moderate',
    impacts:[
      {type:'movement',how:'적응 시간 필요'},
      {type:'volume',how:'볼륨 20% 감소',delta:-20},
      {type:'intensity',how:'Z3 이하'},
      {type:'rest',how:'휴식 +15초'}
    ],
    notes:['적응 시간 필요','저체온증 주의','볼륨 20% 감소'],
    evidenceKeys:[]
  }
];




