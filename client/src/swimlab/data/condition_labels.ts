/**
 * SwimLab Data Pack v4 - 조건(질환) 한국어 라벨
 * 
 * UI에서 사용할 한국어 라벨 + 동의어
 * 
 * 관련 파일:
 * - client/src/swimlab/components/inputs/ConditionPicker.tsx
 * - client/src/swimlab/utils/idmap.ts
 * - client/src/swimlab/data/conditions_msk28_index.ts
 */

export type ConditionLabel = { id: string; label: string; synonyms?: string[] };

export const CONDITION_LABELS: ConditionLabel[] = [
  // Shoulder & Upper Thorax (8)
  { id:'shoulder_impingement', label:'어깨 충돌 증후군', synonyms:['임핑지먼트','어깨충돌','subacromial','견봉하'] },
  { id:'rotator_cuff_irritation', label:'회전근개 자극/통증', synonyms:['회전근개','로테이터커프','RC'] },
  { id:'labral_irritation', label:'관절와순 자극', synonyms:['와순','labrum','관절순'] },
  { id:'biceps_tendinopathy', label:'상완이두건 통증', synonyms:['이두건','biceps','상완이두'] },
  { id:'ac_joint_pain', label:'견봉쇄골 관절 통증', synonyms:['AC관절','견봉쇄골'] },
  { id:'scapular_dyskinesis', label:'견갑골 운동이상', synonyms:['견갑골','scapular','날개뼈'] },
  { id:'thoracic_outlet_syndrome', label:'흉곽출구 증후군', synonyms:['TOS','흉곽출구'] },
  { id:'rib_stress_irritation', label:'늑골 스트레스 자극', synonyms:['늑골','rib','갈비뼈'] },

  // Spine (4)
  { id:'cervical_strain', label:'목(경추) 긴장/통증', synonyms:['경추','목통증','cervical'] },
  { id:'lumbar_extension_intolerance', label:'허리(요추) 신전 민감', synonyms:['요통','허리통증','요추신전','lumbar'] },
  { id:'lumbar_flexion_intolerance', label:'허리(요추) 굴곡 민감', synonyms:['요추굴곡','허리굴곡'] },
  { id:'costochondritis', label:'늑연골염', synonyms:['늑연골','costochondritis'] },

  // Elbow/Wrist/Hand (5)
  { id:'medial_epicondylitis', label:'골프 엘보(내측상과염)', synonyms:['골프엘보','내측상과염','golfers elbow'] },
  { id:'lateral_epicondylitis', label:'테니스 엘보(외측상과염)', synonyms:['테니스엘보','외측상과염','tennis elbow'] },
  { id:'wrist_tendinopathy', label:'손목 힘줄 통증', synonyms:['손목통증','wrist','수근'] },
  { id:'tenosynovitis_hand', label:'손 힘줄윤활막염', synonyms:['손힘줄염','tenosynovitis'] },
  { id:'tmj_irritation', label:'턱관절 자극/통증', synonyms:['TMJ','턱관절','악관절'] },

  // Hip/Groin/Knee (6)
  { id:'hip_flexor_strain', label:'고관절 굴곡근 긴장', synonyms:['고관절굴곡','hip flexor','장요근'] },
  { id:'hip_fai_irritation', label:'고관절 충돌(FAI) 자극', synonyms:['FAI','고관절충돌'] },
  { id:'groin_adductor_strain', label:'사타구니 내전근 긴장', synonyms:['사타구니','내전근','adductor','그로인'] },
  { id:'patellofemoral_pain', label:'무릎 앞 통증(PFPS)', synonyms:['PFPS','슬개대퇴통증','무릎전방통증','무릎앞'] },
  { id:'patellar_tendinopathy', label:'슬개건 통증', synonyms:['슬개건','patellar','무릎힘줄'] },
  { id:'it_band_syndrome', label:'장경인대 증후군', synonyms:['ITB','장경인대','IT band'] },

  // Ankle/Foot (3)
  { id:'ankle_sprain_history', label:'발목 염좌 이력', synonyms:['발목염좌','ankle sprain','발목'] },
  { id:'achilles_tendinopathy', label:'아킬레스건 통증', synonyms:['아킬레스','아킬레스건염','achilles'] },
  { id:'plantar_fasciitis', label:'족저근막염', synonyms:['족저근막','발바닥통증','plantar'] },

  // Systemic/General (2)
  { id:'general_deconditioning', label:'전반적 디컨디셔닝', synonyms:['디컨디셔닝','체력저하','deconditioning'] },
  { id:'long_covid_fatigue', label:'장기 코로나 피로', synonyms:['롱코비드','장기코로나','long covid'] },
];

