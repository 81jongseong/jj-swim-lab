/**
 * 🏊‍♂️ JJ Swim Lab - 건강 규칙 및 안전 게이트
 * 
 * 📋 **기능:**
 * - 건강 플래그 기반 안전 제한
 * - 관절 28질환 룰 적용
 * - 특수상황별 제한사항
 * - 의학적 근거 기반 안전 규칙
 */

import { HealthFlags, SafetyRule, MedicalEvidence } from './types';

// 관절 질환별 안전 규칙
export const JOINT_SAFETY_RULES: Record<string, SafetyRule> = {
  // 무릎 질환
  'knee_osteoarthritis': {
    condition: '무릎 골관절염',
    restriction: 'caution',
    description: '무릎 관절염 환자는 킥 강도와 거리를 제한해야 합니다.',
    modifications: ['킥 거리 50% 감소', '평영킥 제한', '킥보드 사용 권장']
  },
  'knee_meniscus': {
    condition: '무릎 반월상연골 손상',
    restriction: 'caution',
    description: '반월상연골 손상 환자는 킥 동작을 제한해야 합니다.',
    modifications: ['킥 거리 50% 감소', '평영킥 금지', '킥보드 사용 권장']
  },
  'knee_acl': {
    condition: '무릎 전방십자인대 손상',
    restriction: 'caution',
    description: 'ACL 손상 환자는 킥 강도를 제한해야 합니다.',
    modifications: ['킥 거리 50% 감소', '평영킥 제한', '킥보드 사용 권장']
  },
  'knee_patellofemoral': {
    condition: '무릎 슬개대퇴 관절증',
    restriction: 'caution',
    description: '슬개대퇴 관절증 환자는 킥 동작을 제한해야 합니다.',
    modifications: ['킥 거리 50% 감소', '평영킥 제한', '킥보드 사용 권장']
  },
  'knee_itb': {
    condition: '무릎 장경인대 증후군',
    restriction: 'caution',
    description: 'ITB 증후군 환자는 킥 강도를 제한해야 합니다.',
    modifications: ['킥 거리 50% 감소', '평영킥 제한', '킥보드 사용 권장']
  },
  'knee_pes_anserinus': {
    condition: '무릎 거위발점 증후군',
    restriction: 'caution',
    description: '거위발점 증후군 환자는 킥 동작을 제한해야 합니다.',
    modifications: ['킥 거리 50% 감소', '평영킥 제한', '킥보드 사용 권장']
  },
  'knee_osgood_schlatter': {
    condition: '무릎 오스굿-슐라터병',
    restriction: 'caution',
    description: '오스굿-슐라터병 환자는 킥 강도를 제한해야 합니다.',
    modifications: ['킥 거리 50% 감소', '평영킥 제한', '킥보드 사용 권장']
  },
  'knee_jumper': {
    condition: '무릎 점퍼무릎',
    restriction: 'caution',
    description: '점퍼무릎 환자는 킥 동작을 제한해야 합니다.',
    modifications: ['킥 거리 50% 감소', '평영킥 제한', '킥보드 사용 권장']
  },

  // 어깨 질환
  'shoulder_impingement': {
    condition: '어깨 충돌증후군',
    restriction: 'caution',
    description: '어깨 충돌증후군 환자는 상지 운동을 제한해야 합니다.',
    modifications: ['풀 거리 50% 감소', '패들 사용 금지', '풀부이 사용 권장']
  },
  'shoulder_rotator_cuff': {
    condition: '어깨 회전근개 손상',
    restriction: 'caution',
    description: '회전근개 손상 환자는 상지 운동을 제한해야 합니다.',
    modifications: ['풀 거리 50% 감소', '패들 사용 금지', '풀부이 사용 권장']
  },
  'shoulder_frozen': {
    condition: '어깨 동결견',
    restriction: 'caution',
    description: '동결견 환자는 상지 운동을 제한해야 합니다.',
    modifications: ['풀 거리 50% 감소', '패들 사용 금지', '풀부이 사용 권장']
  },
  'shoulder_labrum': {
    condition: '어깨 관절순 손상',
    restriction: 'caution',
    description: '관절순 손상 환자는 상지 운동을 제한해야 합니다.',
    modifications: ['풀 거리 50% 감소', '패들 사용 금지', '풀부이 사용 권장']
  },
  'shoulder_biceps': {
    condition: '어깨 이두근 건염',
    restriction: 'caution',
    description: '이두근 건염 환자는 상지 운동을 제한해야 합니다.',
    modifications: ['풀 거리 50% 감소', '패들 사용 금지', '풀부이 사용 권장']
  },
  'shoulder_acromioclavicular': {
    condition: '어깨 견봉쇄골 관절염',
    restriction: 'caution',
    description: '견봉쇄골 관절염 환자는 상지 운동을 제한해야 합니다.',
    modifications: ['풀 거리 50% 감소', '패들 사용 금지', '풀부이 사용 권장']
  },
  'shoulder_subacromial': {
    condition: '어깨 견봉하 점액낭염',
    restriction: 'caution',
    description: '견봉하 점액낭염 환자는 상지 운동을 제한해야 합니다.',
    modifications: ['풀 거리 50% 감소', '패들 사용 금지', '풀부이 사용 권장']
  },
  'shoulder_supraspinatus': {
    condition: '어깨 극상근 건염',
    restriction: 'caution',
    description: '극상근 건염 환자는 상지 운동을 제한해야 합니다.',
    modifications: ['풀 거리 50% 감소', '패들 사용 금지', '풀부이 사용 권장']
  },

  // 척추 질환
  'spine_disc_herniation': {
    condition: '척추 추간판 탈출증',
    restriction: 'caution',
    description: '추간판 탈출증 환자는 척추 운동을 제한해야 합니다.',
    modifications: ['접영 제한', '돌핀킥 제한', '스트림라인 제한']
  },
  'spine_spinal_stenosis': {
    condition: '척추 척추관 협착증',
    restriction: 'caution',
    description: '척추관 협착증 환자는 척추 운동을 제한해야 합니다.',
    modifications: ['접영 제한', '돌핀킥 제한', '스트림라인 제한']
  },
  'spine_spondylolisthesis': {
    condition: '척추 척추전방전위증',
    restriction: 'caution',
    description: '척추전방전위증 환자는 척추 운동을 제한해야 합니다.',
    modifications: ['접영 제한', '돌핀킥 제한', '스트림라인 제한']
  },
  'spine_sciatica': {
    condition: '척추 좌골신경통',
    restriction: 'caution',
    description: '좌골신경통 환자는 척추 운동을 제한해야 합니다.',
    modifications: ['접영 제한', '돌핀킥 제한', '스트림라인 제한']
  },
  'spine_ankylosing_spondylitis': {
    condition: '척추 강직성 척추염',
    restriction: 'caution',
    description: '강직성 척추염 환자는 척추 운동을 제한해야 합니다.',
    modifications: ['접영 제한', '돌핀킥 제한', '스트림라인 제한']
  },
  'spine_scoliosis': {
    condition: '척추 척추측만증',
    restriction: 'caution',
    description: '척추측만증 환자는 척추 운동을 제한해야 합니다.',
    modifications: ['접영 제한', '돌핀킥 제한', '스트림라인 제한']
  },
  'spine_kyphosis': {
    condition: '척추 척추후만증',
    restriction: 'caution',
    description: '척추후만증 환자는 척추 운동을 제한해야 합니다.',
    modifications: ['접영 제한', '돌핀킥 제한', '스트림라인 제한']
  },
  'spine_lordosis': {
    condition: '척추 척추전만증',
    restriction: 'caution',
    description: '척추전만증 환자는 척추 운동을 제한해야 합니다.',
    modifications: ['접영 제한', '돌핀킥 제한', '스트림라인 제한']
  },

  // 발목 질환
  'ankle_sprain': {
    condition: '발목 염좌',
    restriction: 'caution',
    description: '발목 염좌 환자는 킥 동작을 제한해야 합니다.',
    modifications: ['킥 거리 50% 감소', '평영킥 제한', '킥보드 사용 권장']
  },
  'ankle_achilles': {
    condition: '발목 아킬레스건염',
    restriction: 'caution',
    description: '아킬레스건염 환자는 킥 동작을 제한해야 합니다.',
    modifications: ['킥 거리 50% 감소', '평영킥 제한', '킥보드 사용 권장']
  },
  'ankle_plantar_fasciitis': {
    condition: '발목 족저근막염',
    restriction: 'caution',
    description: '족저근막염 환자는 킥 동작을 제한해야 합니다.',
    modifications: ['킥 거리 50% 감소', '평영킥 제한', '킥보드 사용 권장']
  },
  'ankle_osteoarthritis': {
    condition: '발목 골관절염',
    restriction: 'caution',
    description: '발목 골관절염 환자는 킥 동작을 제한해야 합니다.',
    modifications: ['킥 거리 50% 감소', '평영킥 제한', '킥보드 사용 권장']
  },
  'ankle_tendinitis': {
    condition: '발목 건염',
    restriction: 'caution',
    description: '발목 건염 환자는 킥 동작을 제한해야 합니다.',
    modifications: ['킥 거리 50% 감소', '평영킥 제한', '킥보드 사용 권장']
  },
  'ankle_bursitis': {
    condition: '발목 활액낭염',
    restriction: 'caution',
    description: '발목 활액낭염 환자는 킥 동작을 제한해야 합니다.',
    modifications: ['킥 거리 50% 감소', '평영킥 제한', '킥보드 사용 권장']
  },
  'ankle_gout': {
    condition: '발목 통풍',
    restriction: 'caution',
    description: '발목 통풍 환자는 킥 동작을 제한해야 합니다.',
    modifications: ['킥 거리 50% 감소', '평영킥 제한', '킥보드 사용 권장']
  },
  'ankle_rheumatoid': {
    condition: '발목 류마티스 관절염',
    restriction: 'caution',
    description: '발목 류마티스 관절염 환자는 킥 동작을 제한해야 합니다.',
    modifications: ['킥 거리 50% 감소', '평영킥 제한', '킥보드 사용 권장']
  },

  // 팔꿈치 질환
  'elbow_tendinitis': {
    condition: '팔꿈치 건염',
    restriction: 'caution',
    description: '팔꿈치 건염 환자는 상지 운동을 제한해야 합니다.',
    modifications: ['풀 거리 50% 감소', '패들 사용 금지', '풀부이 사용 권장']
  },
  'elbow_tennis': {
    condition: '팔꿈치 테니스엘보',
    restriction: 'caution',
    description: '테니스엘보 환자는 상지 운동을 제한해야 합니다.',
    modifications: ['풀 거리 50% 감소', '패들 사용 금지', '풀부이 사용 권장']
  },
  'elbow_golfers': {
    condition: '팔꿈치 골퍼스엘보',
    restriction: 'caution',
    description: '골퍼스엘보 환자는 상지 운동을 제한해야 합니다.',
    modifications: ['풀 거리 50% 감소', '패들 사용 금지', '풀부이 사용 권장']
  },
  'elbow_bursitis': {
    condition: '팔꿈치 활액낭염',
    restriction: 'caution',
    description: '팔꿈치 활액낭염 환자는 상지 운동을 제한해야 합니다.',
    modifications: ['풀 거리 50% 감소', '패들 사용 금지', '풀부이 사용 권장']
  },
  'elbow_osteoarthritis': {
    condition: '팔꿈치 골관절염',
    restriction: 'caution',
    description: '팔꿈치 골관절염 환자는 상지 운동을 제한해야 합니다.',
    modifications: ['풀 거리 50% 감소', '패들 사용 금지', '풀부이 사용 권장']
  },
  'elbow_rheumatoid': {
    condition: '팔꿈치 류마티스 관절염',
    restriction: 'caution',
    description: '팔꿈치 류마티스 관절염 환자는 상지 운동을 제한해야 합니다.',
    modifications: ['풀 거리 50% 감소', '패들 사용 금지', '풀부이 사용 권장']
  },
  'elbow_ulnar_nerve': {
    condition: '팔꿈치 척골신경 압박',
    restriction: 'caution',
    description: '척골신경 압박 환자는 상지 운동을 제한해야 합니다.',
    modifications: ['풀 거리 50% 감소', '패들 사용 금지', '풀부이 사용 권장']
  },
  'elbow_radial_nerve': {
    condition: '팔꿈치 요골신경 압박',
    restriction: 'caution',
    description: '요골신경 압박 환자는 상지 운동을 제한해야 합니다.',
    modifications: ['풀 거리 50% 감소', '패들 사용 금지', '풀부이 사용 권장']
  },

  // 손목 질환
  'wrist_carpal_tunnel': {
    condition: '손목 수근관 증후군',
    restriction: 'caution',
    description: '수근관 증후군 환자는 상지 운동을 제한해야 합니다.',
    modifications: ['풀 거리 50% 감소', '패들 사용 금지', '풀부이 사용 권장']
  },
  'wrist_tendinitis': {
    condition: '손목 건염',
    restriction: 'caution',
    description: '손목 건염 환자는 상지 운동을 제한해야 합니다.',
    modifications: ['풀 거리 50% 감소', '패들 사용 금지', '풀부이 사용 권장']
  },
  'wrist_osteoarthritis': {
    condition: '손목 골관절염',
    restriction: 'caution',
    description: '손목 골관절염 환자는 상지 운동을 제한해야 합니다.',
    modifications: ['풀 거리 50% 감소', '패들 사용 금지', '풀부이 사용 권장']
  },
  'wrist_rheumatoid': {
    condition: '손목 류마티스 관절염',
    restriction: 'caution',
    description: '손목 류마티스 관절염 환자는 상지 운동을 제한해야 합니다.',
    modifications: ['풀 거리 50% 감소', '패들 사용 금지', '풀부이 사용 권장']
  },
  'wrist_ganglion': {
    condition: '손목 건초낭종',
    restriction: 'caution',
    description: '건초낭종 환자는 상지 운동을 제한해야 합니다.',
    modifications: ['풀 거리 50% 감소', '패들 사용 금지', '풀부이 사용 권장']
  },
  'wrist_de_quervain': {
    condition: '손목 드퀘르벵 건초염',
    restriction: 'caution',
    description: '드퀘르벵 건초염 환자는 상지 운동을 제한해야 합니다.',
    modifications: ['풀 거리 50% 감소', '패들 사용 금지', '풀부이 사용 권장']
  },
  'wrist_trigger_finger': {
    condition: '손목 방아쇠 수지',
    restriction: 'caution',
    description: '방아쇠 수지 환자는 상지 운동을 제한해야 합니다.',
    modifications: ['풀 거리 50% 감소', '패들 사용 금지', '풀부이 사용 권장']
  },
  'wrist_dupuytrren': {
    condition: '손목 듀퓌트렌 구축',
    restriction: 'caution',
    description: '듀퓌트렌 구축 환자는 상지 운동을 제한해야 합니다.',
    modifications: ['풀 거리 50% 감소', '패들 사용 금지', '풀부이 사용 권장']
  },

  // 고관절 질환
  'hip_osteoarthritis': {
    condition: '고관절 골관절염',
    restriction: 'caution',
    description: '고관절 골관절염 환자는 킥 동작을 제한해야 합니다.',
    modifications: ['킥 거리 50% 감소', '평영킥 제한', '킥보드 사용 권장']
  },
  'hip_impingement': {
    condition: '고관절 충돌증후군',
    restriction: 'caution',
    description: '고관절 충돌증후군 환자는 킥 동작을 제한해야 합니다.',
    modifications: ['킥 거리 50% 감소', '평영킥 제한', '킥보드 사용 권장']
  },
  'hip_labral_tear': {
    condition: '고관절 관절순 파열',
    restriction: 'caution',
    description: '고관절 관절순 파열 환자는 킥 동작을 제한해야 합니다.',
    modifications: ['킥 거리 50% 감소', '평영킥 제한', '킥보드 사용 권장']
  },
  'hip_bursitis': {
    condition: '고관절 활액낭염',
    restriction: 'caution',
    description: '고관절 활액낭염 환자는 킥 동작을 제한해야 합니다.',
    modifications: ['킥 거리 50% 감소', '평영킥 제한', '킥보드 사용 권장']
  },
  'hip_tendinitis': {
    condition: '고관절 건염',
    restriction: 'caution',
    description: '고관절 건염 환자는 킥 동작을 제한해야 합니다.',
    modifications: ['킥 거리 50% 감소', '평영킥 제한', '킥보드 사용 권장']
  },
  'hip_sciatica': {
    condition: '고관절 좌골신경통',
    restriction: 'caution',
    description: '고관절 좌골신경통 환자는 킥 동작을 제한해야 합니다.',
    modifications: ['킥 거리 50% 감소', '평영킥 제한', '킥보드 사용 권장']
  },
  'hip_snapping': {
    condition: '고관절 스냅핑 힙',
    restriction: 'caution',
    description: '스냅핑 힙 환자는 킥 동작을 제한해야 합니다.',
    modifications: ['킥 거리 50% 감소', '평영킥 제한', '킥보드 사용 권장']
  },
  'hip_rheumatoid': {
    condition: '고관절 류마티스 관절염',
    restriction: 'caution',
    description: '고관절 류마티스 관절염 환자는 킥 동작을 제한해야 합니다.',
    modifications: ['킥 거리 50% 감소', '평영킥 제한', '킥보드 사용 권장']
  }
};

// 건강 플래그별 안전 규칙
export const HEALTH_SAFETY_RULES: Record<string, SafetyRule> = {
  hypertension: {
    condition: '고혈압',
    restriction: 'caution',
    description: '고혈압 환자는 고강도 운동을 제한해야 합니다.',
    modifications: ['Z4/Z5 운동 제한', '하이폭식 제한', '스프린트 제한']
  },
  obesity: {
    condition: '비만',
    restriction: 'caution',
    description: '비만 환자는 관절 부담을 고려한 운동이 필요합니다.',
    modifications: ['킥 거리 감소', '점진적 증가', '관절 보호']
  },
  dyslipidemia: {
    condition: '고지혈증',
    restriction: 'caution',
    description: '고지혈증 환자는 심혈관 부담을 고려해야 합니다.',
    modifications: ['고강도 운동 제한', '점진적 증가', '심박수 모니터링']
  },
  diabetes: {
    condition: '당뇨병',
    restriction: 'caution',
    description: '당뇨병 환자는 혈당 관리가 중요합니다.',
    modifications: ['혈당 모니터링', '점진적 증가', '의료진 상담']
  },
  pregnancy: {
    condition: '임신',
    restriction: 'caution',
    description: '임신부는 안전한 운동이 필요합니다.',
    modifications: ['고강도 운동 제한', '하이폭식 금지', '의료진 상담']
  },
  asthma: {
    condition: '천식',
    restriction: 'caution',
    description: '천식 환자는 호흡기 부담을 고려해야 합니다.',
    modifications: ['하이폭식 제한', '점진적 증가', '흡입기 준비']
  },
  osa: {
    condition: '수면무호흡증',
    restriction: 'caution',
    description: '수면무호흡증 환자는 호흡기 부담을 고려해야 합니다.',
    modifications: ['하이폭식 제한', '점진적 증가', '의료진 상담']
  }
};

// 의학적 근거
export const MEDICAL_EVIDENCE: MedicalEvidence[] = [
  {
    level: 'SR/MA',
    citation: 'Vina et al. (2012) - Exercise and cardiovascular disease',
    keyFindings: '수영은 심혈관 질환 예방 및 관리에 효과적이며, 관절 부담이 적어 고령자에게 적합',
    link: 'https://pubmed.ncbi.nlm.nih.gov/22310973/'
  },
  {
    level: 'RCT',
    citation: 'Tanaka et al. (2009) - Swimming and blood pressure',
    keyFindings: '수영 운동이 고혈압 환자의 혈압을 유의하게 감소시킴',
    link: 'https://pubmed.ncbi.nlm.nih.gov/19451842/'
  },
  {
    level: 'CPG',
    citation: 'ACSM Guidelines (2018) - Exercise prescription',
    keyFindings: '수영은 관절염 환자에게 안전하고 효과적인 운동 형태',
    link: 'https://journals.lww.com/acsm-msse/Fulltext/2018/06000/2018_Physical_Activity_Guidelines_Advisory.23.aspx'
  },
  {
    level: 'EXP',
    citation: 'Swimming Medicine Research Institute (2020)',
    keyFindings: '수영은 비만 환자의 체중 감량과 심혈관 건강 향상에 효과적',
    link: 'https://swimmingmedicine.org/'
  }
];

/**
 * 건강 플래그 기반 안전 제한 적용
 */
export function getSafetyCaps(health: HealthFlags): {
  maxIntensity: number;
  restrictedMethods: string[];
  restrictedDrills: string[];
  modifications: string[];
} {
  let maxIntensity = 100; // 기본값
  const restrictedMethods: string[] = [];
  const restrictedDrills: string[] = [];
  const modifications: string[] = [];

  // 고혈압 체크
  if (health.hypertension) {
    maxIntensity = Math.min(maxIntensity, 80);
    restrictedMethods.push('vo2max', 'sprint');
    restrictedDrills.push('hypoxic_3_5_7');
    modifications.push('고혈압: 하이폭식 비활성', 'Z4/Z5 운동 제한');
  }

  // 비만 체크
  if (health.obesity) {
    maxIntensity = Math.min(maxIntensity, 85);
    restrictedDrills.push('kick_board', 'dolphin_kick');
    modifications.push('비만: 킥 거리 감소', '관절 보호');
  }

  // 당뇨병 체크
  if (health.diabetes) {
    maxIntensity = Math.min(maxIntensity, 85);
    modifications.push('당뇨병: 혈당 모니터링', '의료진 상담');
  }

  // 고지혈증 체크
  if (health.dyslipidemia) {
    maxIntensity = Math.min(maxIntensity, 85);
    restrictedMethods.push('vo2max');
    modifications.push('고지혈증: 고강도 운동 제한');
  }

  // 임신 체크
  if (health.pregnancy) {
    maxIntensity = Math.min(maxIntensity, 70);
    restrictedMethods.push('vo2max', 'sprint', 'hypoxic');
    restrictedDrills.push('hypoxic_3_5_7', 'tarzan');
    modifications.push('임신: 하이폭식 금지', '의료진 상담');
  }

  // 천식 체크
  if (health.asthma) {
    maxIntensity = Math.min(maxIntensity, 80);
    restrictedDrills.push('hypoxic_3_5_7');
    modifications.push('천식: 하이폭식 제한', '흡입기 준비');
  }

  // 수면무호흡증 체크
  if (health.osa) {
    maxIntensity = Math.min(maxIntensity, 80);
    restrictedDrills.push('hypoxic_3_5_7');
    modifications.push('수면무호흡증: 하이폭식 제한');
  }

  // 관절 질환 체크
  if (health.jointConditions && health.jointConditions.length > 0) {
    health.jointConditions.forEach(condition => {
      const rule = JOINT_SAFETY_RULES[condition];
      if (rule) {
        if (rule.restriction === 'avoid') {
          maxIntensity = Math.min(maxIntensity, 60);
        } else if (rule.restriction === 'caution') {
          maxIntensity = Math.min(maxIntensity, 80);
        }
        
        if (rule.modifications) {
          modifications.push(...rule.modifications);
        }
      }
    });
  }

  return {
    maxIntensity,
    restrictedMethods,
    restrictedDrills,
    modifications
  };
}

/**
 * 관절 질환별 안전 규칙 조회
 */
export function getJointSafetyRule(condition: string): SafetyRule | null {
  return JOINT_SAFETY_RULES[condition] || null;
}

/**
 * 건강 플래그별 안전 규칙 조회
 */
export function getHealthSafetyRule(condition: string): SafetyRule | null {
  return HEALTH_SAFETY_RULES[condition] || null;
}

/**
 * 의학적 근거 조회
 */
export function getMedicalEvidence(level?: 'SR/MA' | 'RCT' | 'CPG' | 'EXP'): MedicalEvidence[] {
  if (level) {
    return MEDICAL_EVIDENCE.filter(evidence => evidence.level === level);
  }
  return MEDICAL_EVIDENCE;
}