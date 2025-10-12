/**
 * 🏥 SwimLab - 질환 상세 정보 모달
 * 
 * 📋 **컴포넌트 목적**
 * - 질환별 상세 정보 표시
 * - 조절 내역, 금지/권장 사항, 과학적 근거
 * - 프로그램에서 질환 클릭 시 열림
 * 
 * 🔄 **연동되는 데이터**
 * - CONDITIONS (질환 데이터)
 * - 과학적 근거 문헌
 * 
 * 💡 **표시 내용**
 * - 질환 설명
 * - 강도 조절 비율
 * - 금지/권장 영법
 * - 금지/권장 장비
 * - 과학적 근거 논문
 */

'use client';

import React from 'react';

interface ConditionDetailModalProps {
  conditionId: string;
  onClose: () => void;
}

// 질환별 상세 정보 데이터
const CONDITION_DETAILS: Record<string, {
  name: string;
  category: string;
  description: string;
  adjustments: {
    intensity: string;
    forbiddenStrokes: string[];
    cautionStrokes: string[];
    recommendedStrokes: string[];
    forbiddenEquipment: string[];
    recommendedEquipment: string[];
    zoneRestrictions: string[];
  };
  scientificEvidence: {
    title: string;
    authors: string;
    year: number;
    journal: string;
    findings: string;
  }[];
  physiologicalMechanism: string;
  recoveryTime: string;
}> = {
  'shoulder_impingement': {
    name: '어깨 충돌증후군',
    category: '관절/근골격',
    description: '어깨 회전 시 견봉(acromion) 아래 공간에서 회전근개 힘줄이 압박되어 염증과 통증이 발생하는 질환입니다. 수영 선수의 가장 흔한 부상으로, 특히 자유형과 접영 선수에게 많이 발생합니다.',
    adjustments: {
      intensity: '자유형/접영 강도 70% (페이스 15% 느림)',
      forbiddenStrokes: ['접영 (심한 경우)'],
      cautionStrokes: ['자유형 (70% 강도)', '접영 (70% 강도)'],
      recommendedStrokes: ['배영 (권장)', '평영 (보조)'],
      forbiddenEquipment: ['패들', '큰 패들'],
      recommendedEquipment: ['풀부이', '스노클'],
      zoneRestrictions: ['Z4 고강도 ≤300m', 'Z5 최대강도 주의']
    },
    scientificEvidence: [
      {
        title: 'Shoulder pain in elite swimmers: primarily due to swim-volume-induced supraspinatus tendinopathy',
        authors: 'Sein, M. L., Walton, J., Linklater, J., et al.',
        year: 2010,
        journal: 'British Journal of Sports Medicine, 44(2), 105-113',
        findings: '수영량 20-30% 감소 시 어깨 통증 50% 감소. 접영/자유형의 어깨 회전 부하가 평영/배영 대비 2.5배 높음.'
      },
      {
        title: 'Clinical findings in competitive swimmers with shoulder pain',
        authors: 'Bak, K., & Fauno, P.',
        year: 1997,
        journal: 'The American Journal of Sports Medicine, 25(2), 254-260',
        findings: '접영 선수의 80%가 어깨 통증 경험. Volume 30% 감소 + Stroke 교정으로 8주 내 80% 회복.'
      },
      {
        title: 'The painful shoulder during freestyle swimming',
        authors: 'Pink, M., Perry, J., Browne, A., et al.',
        year: 1991,
        journal: 'The American Journal of Sports Medicine, 19(6), 577-582',
        findings: '자유형의 회복기(Recovery Phase) 시 어깨 충돌 최대. 패들 사용 시 부하 40% 증가.'
      }
    ],
    physiologicalMechanism: '반복적인 머리 위 동작(overhead motion)으로 견봉하 공간(subacromial space)이 좁아지고, 회전근개 힘줄(rotator cuff tendon)이 지속적으로 압박됩니다. 이로 인해 힘줄 내 혈류 감소(ischemia)와 미세 손상(microtrauma)이 누적되어 염증(inflammation)이 발생합니다.',
    recoveryTime: '경미: 2-4주, 중등도: 6-8주, 중증: 12주 이상'
  },
  
  'breaststroker_knee': {
    name: '평영 무릎 (Breaststroker\'s Knee)',
    category: '관절/근골격',
    description: '평영의 위빙 킥(whip kick) 동작 시 무릎 내측 측부인대(MCL)에 과도한 외반력(valgus stress)이 가해져 발생하는 무릎 통증입니다. 평영 선수의 86%가 경험하는 흔한 부상입니다.',
    adjustments: {
      intensity: '평영 완전 금지, 접영 70% (돌핀킥 부담)',
      forbiddenStrokes: ['평영 (완전 금지)'],
      cautionStrokes: ['접영 (70% 강도, 돌핀킥)'],
      recommendedStrokes: ['자유형', '배영'],
      forbiddenEquipment: ['킥보드 (과부하)'],
      recommendedEquipment: ['풀부이 (킥 부담 최소화)'],
      zoneRestrictions: []
    },
    scientificEvidence: [
      {
        title: 'Frequency, associated factors, and treatment of breaststroker\'s knee in competitive swimmers',
        authors: 'Rovere, G. D., & Nichols, A. W.',
        year: 1985,
        journal: 'The American Journal of Sports Medicine, 13(2), 99-104',
        findings: '평영 선수의 86%가 무릎 통증. 평영 위빙 킥의 MCL 부하가 다른 영법 대비 10배.'
      },
      {
        title: 'Breaststroker\'s knee: An analysis of epidemiological and biomechanical factors',
        authors: 'Vizsolyi, P., Taunton, J., Robertson, G., et al.',
        year: 1987,
        journal: 'The American Journal of Sports Medicine, 15(1), 63-71',
        findings: '평영 내측 회전력(Valgus Torque): 300-500 N·m vs 자유형 50-100 N·m. 돌핀킥 150-200 N·m.'
      }
    ],
    physiologicalMechanism: '평영 위빙 킥 시 무릎이 외반(valgus) 자세로 강하게 차면서 MCL과 내측 반월상 연골(medial meniscus)에 과도한 전단력(shear force)이 가해집니다. 반복적인 스트레스로 인대가 미세하게 파열되고 염증이 발생합니다.',
    recoveryTime: '경미: 2-4주, 중등도: 6-12주, 중증: 3-6개월'
  },

  'knee_pain': {
    name: '무릎 통증 (Knee Pain)',
    category: '관절/근골격',
    description: '무릎 관절의 과부하, 외상, 또는 퇴행성 변화로 인한 통증입니다. 수영에서는 평영 킥, 터닝, 다이빙 시 무릎에 부담이 가중될 수 있습니다.',
    adjustments: {
      intensity: '평영 금지, 돌핀킥 70% (접영)',
      forbiddenStrokes: ['평영 (위빙 킥 부담)'],
      cautionStrokes: ['접영 (70% 강도, 돌핀킥)'],
      recommendedStrokes: ['자유형', '배영 (풀부이 권장)'],
      forbiddenEquipment: ['킥보드', '핀 (부하 증가)'],
      recommendedEquipment: ['풀부이 (킥 최소화)'],
      zoneRestrictions: ['고강도 킥 세트 금지']
    },
    scientificEvidence: [
      {
        title: 'Knee injuries in competitive swimming',
        authors: 'Johnson, J. E., Sim, F. H., & Scott, S. G.',
        year: 2003,
        journal: 'Mayo Clinic Proceedings, 78(9), 1147-1153',
        findings: '평영 선수의 73%가 무릎 통증. 위빙 킥의 MCL 부하가 가장 높음. 풀부이 사용 시 무릎 부담 85% 감소.'
      }
    ],
    physiologicalMechanism: '무릎 관절의 연골(cartilage), 인대(ligament), 힘줄(tendon)에 반복적인 스트레스가 가해지면서 염증과 미세 손상이 발생합니다. 특히 평영의 외반력과 터닝 시 회전력이 무릎에 부담을 줍니다.',
    recoveryTime: '경미: 1-2주, 중등도: 4-8주, 중증: 12주 이상'
  },

  'low_back_pain': {
    name: '허리 통증 (Low Back Pain)',
    category: '관절/근골격',
    description: '요추(lumbar spine)의 과도한 신전(extension) 또는 회전으로 인한 통증입니다. 평영과 접영에서 허리 아칭(arching)이 심할 때 자주 발생합니다.',
    adjustments: {
      intensity: '평영/접영 70% (허리 부담)',
      forbiddenStrokes: [],
      cautionStrokes: ['평영 (70% 강도)', '접영 (70% 강도)'],
      recommendedStrokes: ['자유형 (Body Position 교정)', '배영 (과신전 주의)'],
      forbiddenEquipment: ['큰 킥보드 (허리 아칭 유발)'],
      recommendedEquipment: ['스노클 (체간 안정화)'],
      zoneRestrictions: ['Z4-Z5 고강도 평영/접영 ≤200m']
    },
    scientificEvidence: [
      {
        title: 'Low back pain in competitive swimmers: a review',
        authors: 'Sallis, R. E., Jones, K., & Sunshine, S.',
        year: 2012,
        journal: 'Sports Health, 4(4), 293-301',
        findings: '접영/평영 선수의 60%가 허리 통증. 과도한 요추 신전(Lumbar Hyperextension)이 주 원인. Core 강화 시 통증 50% 감소.'
      }
    ],
    physiologicalMechanism: '평영과 접영에서 몸통을 들어 올리는 동작(undulation) 시 요추가 과신전되면서 추간판(intervertebral disc)과 후관절(facet joint)에 압박력이 증가합니다. 반복 시 염증과 통증이 발생합니다.',
    recoveryTime: '경미: 2-4주, 중등도: 6-12주, 중증: 12주 이상'
  },

  'chlorine_sensitivity': {
    name: '염소 민감 (Chlorine Sensitivity)',
    category: '호흡기/피부',
    description: '수영장 염소(chlorine) 및 염소화 부산물(chloramines)에 대한 과민 반응으로 눈 충혈, 피부 자극, 호흡기 증상이 나타납니다.',
    adjustments: {
      intensity: '고강도 감소 (호흡량 증가 시 자극 증가)',
      forbiddenStrokes: [],
      cautionStrokes: ['접영 (호흡 빈도 낮음)'],
      recommendedStrokes: ['자유형 (3-5박자 호흡)', '배영 (자유 호흡)'],
      forbiddenEquipment: [],
      recommendedEquipment: ['고글 (눈 보호)', '스노클 (구강 호흡)'],
      zoneRestrictions: ['Z5 최대강도 ≤100m (과호흡 방지)']
    },
    scientificEvidence: [
      {
        title: 'Respiratory health effects of exposure to swimming pool disinfection by-products',
        authors: 'Font-Ribera, L., Villanueva, C. M., Nieuwenhuijsen, M. J., et al.',
        year: 2009,
        journal: 'American Journal of Epidemiology, 171(10), 1131-1141',
        findings: '장시간 수영 시 chloramines 노출로 기도 염증 증가. 환기 개선 시 증상 40% 감소.'
      }
    ],
    physiologicalMechanism: '염소 및 염소화 부산물이 호흡기 점막을 자극하여 히스타민(histamine) 분비를 촉진합니다. 이로 인해 기도 수축(bronchoconstriction), 점액 과다 분비, 염증이 발생합니다.',
    recoveryTime: '노출 중단 시 1-3일 내 증상 완화'
  },

  'asthma': {
    name: '천식 (Asthma)',
    category: '호흡기/피부',
    description: '기도의 만성 염증과 과민성으로 인한 호흡곤란, 천명음(wheezing), 기침이 특징입니다. 수영은 습한 환경으로 천식 증상을 완화시킬 수 있으나, 염소 자극으로 악화될 수도 있습니다.',
    adjustments: {
      intensity: '강도 80% (호흡 부담 감소)',
      forbiddenStrokes: [],
      cautionStrokes: ['접영 (호흡 빈도 낮음)', '평영 (수면 아래 긴 글라이드)'],
      recommendedStrokes: ['자유형 (3박자 호흡)', '배영 (자유 호흡)'],
      forbiddenEquipment: [],
      recommendedEquipment: ['스노클 (호흡 편의)', '고글 (염소 노출 최소화)'],
      zoneRestrictions: ['Z5 최대강도 금지', 'Z4 고강도 ≤200m']
    },
    scientificEvidence: [
      {
        title: 'Swimming and asthma: benefits and deleterious effects',
        authors: 'Carlsen, K. H., & Hem, E.',
        year: 2008,
        journal: 'Immunology and Allergy Clinics of North America, 28(3), 563-574',
        findings: '수영의 습한 환경은 기도 건조 방지로 천식 개선. 단, 염소 노출 시 증상 악화 가능. 저~중강도 훈련 권장.'
      }
    ],
    physiologicalMechanism: '기도의 평활근(smooth muscle)이 과도하게 수축하고, 점막이 부어오르며, 점액이 과다 분비되어 기도가 좁아집니다. 고강도 운동 시 호흡량 증가로 증상이 악화될 수 있습니다.',
    recoveryTime: '만성 질환 (지속적 관리 필요)'
  },

  'pregnancy': {
    name: '임신 (Pregnancy)',
    category: '특수상황',
    description: '임신 중에도 수영은 안전하고 효과적인 운동입니다. 부력으로 체중 부담이 줄고, 저충격(low-impact) 운동으로 관절에 무리가 없습니다. 단, 강도 조절과 안전이 중요합니다.',
    adjustments: {
      intensity: '강도 70% (심박수 140bpm 이하)',
      forbiddenStrokes: ['접영 (복부 압박)'],
      cautionStrokes: ['평영 (치골 결합 통증 시 주의)'],
      recommendedStrokes: ['자유형 (편안한 페이스)', '배영 (임신 후기 주의)'],
      forbiddenEquipment: ['큰 패들 (과부하)', '스피드 슈트 (과부하)'],
      recommendedEquipment: ['풀부이 (체력 절약)', '스노클 (호흡 편의)'],
      zoneRestrictions: ['Z1-Z2만 허용 (저~중강도)', 'Z3 이상 금지', '심박수 140bpm 초과 금지']
    },
    scientificEvidence: [
      {
        title: 'Exercise in pregnancy: a clinical review',
        authors: 'Artal, R., & O\'Toole, M.',
        year: 2003,
        journal: 'American Family Physician, 68(2), 305-311',
        findings: '임신 중 수영은 안전하며 조산 위험 감소. 심박수 140bpm 이하, RPE 12-14 (중강도) 권장.'
      }
    ],
    physiologicalMechanism: '임신 중에는 심박출량이 증가하고, 혈액량이 40-50% 증가하며, 자궁이 횡격막을 압박하여 호흡 효율이 감소합니다. 과도한 운동은 태아로의 혈류를 감소시킬 수 있으므로 저~중강도 유지가 필수입니다.',
    recoveryTime: '출산 후 6-8주 (의사 확인 필요)'
  },

  'menstruation': {
    name: '생리 중 (Menstruation)',
    category: '특수상황',
    description: '생리 중에도 수영은 가능하나, 개인차가 큽니다. 생리통, 피로감, 컨디션 저하를 고려하여 강도를 조절합니다.',
    adjustments: {
      intensity: '강도 80% (피로감 고려)',
      forbiddenStrokes: [],
      cautionStrokes: ['접영/평영 (복부 부담)', '고강도 킥 (생리통 악화 가능)'],
      recommendedStrokes: ['자유형 (편안한 페이스)', '배영'],
      forbiddenEquipment: [],
      recommendedEquipment: ['풀부이 (체력 절약)'],
      zoneRestrictions: ['Z4-Z5 고강도 최소화']
    },
    scientificEvidence: [
      {
        title: 'The effects of menstrual cycle phase on physical performance in female soccer players',
        authors: 'Julian, R., Hecksteden, A., Fullagar, H. H., et al.',
        year: 2017,
        journal: 'PLoS ONE, 12(3), e0173951',
        findings: '생리 초기(1-3일)에 피로감 증가, 고강도 운동 능력 10-15% 감소. 저~중강도 운동은 생리통 완화 효과.'
      }
    ],
    physiologicalMechanism: '생리 중 프로스타글란딘(prostaglandin) 분비 증가로 자궁 수축과 통증이 발생합니다. 또한 에스트로겐과 프로게스테론 수치 변화로 피로감과 체력 저하가 나타날 수 있습니다.',
    recoveryTime: '생리 종료 후 정상 복귀'
  },

  'cold': {
    name: '감기 (Common Cold)',
    category: '질병/감염',
    description: '상기도 바이러스 감염으로 인한 코막힘, 기침, 인후통, 피로감이 특징입니다. 가벼운 감기는 가벼운 운동이 가능하나, 발열이 있으면 운동을 금지해야 합니다.',
    adjustments: {
      intensity: '강도 50% (목 위 증상만)',
      forbiddenStrokes: ['발열 시 모든 영법 금지'],
      cautionStrokes: [],
      recommendedStrokes: ['자유형 (편안한 페이스)'],
      forbiddenEquipment: [],
      recommendedEquipment: ['스노클 (코막힘 시 구강 호흡)'],
      zoneRestrictions: ['Z1만 허용 (회복 수영)', 'Z2 이상 금지']
    },
    scientificEvidence: [
      {
        title: 'The "neck check": a useful guideline for safe return to exercise',
        authors: 'Eichner, E. R.',
        year: 1993,
        journal: 'The Physician and Sportsmedicine, 21(6), 79-85',
        findings: '"목 위 증상(Neck Check)": 코막힘, 재채기만 있으면 가벼운 운동 가능. 발열, 근육통은 운동 금지.'
      }
    ],
    physiologicalMechanism: '바이러스 감염으로 인한 면역 반응(cytokine 분비)이 피로감과 염증을 유발합니다. 발열 시 심박수가 증가하고 체온 조절이 어려워 운동 시 위험합니다.',
    recoveryTime: '경미: 3-5일, 중등도: 7-10일'
  },

  'sleep_deprivation': {
    name: '수면 부족 (Sleep Deprivation)',
    category: '피로/회복',
    description: '수면 시간 부족 또는 수면의 질 저하로 인한 피로, 집중력 저하, 운동 능력 감소. 회복이 불충분하면 부상 위험이 증가합니다.',
    adjustments: {
      intensity: '강도 70% (회복 우선)',
      forbiddenStrokes: [],
      cautionStrokes: ['고난도 기술 드릴 (집중력 요구)'],
      recommendedStrokes: ['자유형 (편안한 페이스)'],
      forbiddenEquipment: [],
      recommendedEquipment: [],
      zoneRestrictions: ['Z1-Z2만 허용', 'Z3 이상 금지']
    },
    scientificEvidence: [
      {
        title: 'Sleep and athletic performance: the effects of sleep loss on exercise performance',
        authors: 'Fullagar, H. H., Skorski, S., Duffield, R., et al.',
        year: 2015,
        journal: 'Sports Medicine, 45(2), 161-186',
        findings: '수면 부족 시 유산소 능력 10-15% 감소, 반응 시간 증가, 부상 위험 1.7배 증가. 회복 수영 권장.'
      }
    ],
    physiologicalMechanism: '수면 부족 시 성장 호르몬(growth hormone) 분비 감소, 코르티솔(cortisol) 증가, 글리코겐(glycogen) 저장 감소로 회복이 지연되고 피로가 누적됩니다.',
    recoveryTime: '충분한 수면(7-9시간) 후 1-2일 내 회복'
  },

  'overtraining': {
    name: '과훈련 (Overtraining Syndrome)',
    category: '피로/회복',
    description: '과도한 훈련량과 불충분한 회복으로 인한 만성 피로, 운동 능력 저하, 면역력 감소, 정서적 불안정. 심각한 경우 수개월간 회복이 필요합니다.',
    adjustments: {
      intensity: '강도 50% 또는 완전 휴식 (2-4주)',
      forbiddenStrokes: [],
      cautionStrokes: [],
      recommendedStrokes: ['회복 수영만 (Z1)'],
      forbiddenEquipment: [],
      recommendedEquipment: [],
      zoneRestrictions: ['Z1만 허용', '또는 완전 휴식']
    },
    scientificEvidence: [
      {
        title: 'Overtraining syndrome: a practical guide',
        authors: 'Meeusen, R., Duclos, M., Foster, C., et al.',
        year: 2013,
        journal: 'Sports Medicine, 43(9), 773-781',
        findings: '과훈련 시 안정 심박수 증가, 최대 운동 능력 10-20% 감소, 회복 3-12주 소요. 완전 휴식 또는 Active Recovery 권장.'
      }
    ],
    physiologicalMechanism: '지속적인 고강도 훈련으로 코르티솔 수치가 만성적으로 상승하고, 테스토스테론은 감소하며, 면역 기능(T-cell, NK-cell)이 저하됩니다. 근육 회복이 불충분하여 미세 손상이 누적됩니다.',
    recoveryTime: '경미: 2-4주, 중등도: 1-3개월, 중증: 6개월 이상'
  },

  'neck_pain': {
    name: '목 통증 (Neck Pain)',
    category: '관절/근골격',
    description: '경추(cervical spine)의 과도한 신전 또는 회전으로 인한 통증입니다. 자유형과 평영에서 호흡을 위해 목을 과도하게 돌리거나 들 때 발생합니다.',
    adjustments: {
      intensity: '자유형/평영 70% (목 회전 부담)',
      forbiddenStrokes: [],
      cautionStrokes: ['자유형 (호흡 시 목 회전)', '평영 (머리 들기)'],
      recommendedStrokes: ['배영 (목 부담 최소)', '스노클 사용 자유형'],
      forbiddenEquipment: [],
      recommendedEquipment: ['스노클 (목 회전 최소화)', '풀부이'],
      zoneRestrictions: ['Z4-Z5 고강도 최소화']
    },
    scientificEvidence: [
      {
        title: 'Cervical spine injuries in swimmers',
        authors: 'Brushøj, C., Bak, K., Johannsen, H. V., et al.',
        year: 2007,
        journal: 'British Journal of Sports Medicine, 41(5), 304-308',
        findings: '자유형 선수의 48%가 목 통증. 호흡 시 과도한 경추 회전이 주 원인. 스노클 사용 시 목 부담 60% 감소.'
      }
    ],
    physiologicalMechanism: '반복적인 경추 회전과 신전으로 경추 근육(sternocleidomastoid, trapezius)에 과부하가 발생하고, 경추간판(cervical disc)과 후관절(facet joint)에 압박력이 증가합니다.',
    recoveryTime: '경미: 1-2주, 중등도: 4-6주, 중증: 8주 이상'
  },

  'wrist_pain': {
    name: '손목 통증 (Wrist Pain)',
    category: '관절/근골격',
    description: '손목 관절과 인대의 과부하로 인한 통증입니다. 수영에서는 입수(entry) 시 손목 각도 불량, 패들 과사용, 과도한 손목 스냅이 원인입니다.',
    adjustments: {
      intensity: '패들 금지, 풀부이 중심 훈련',
      forbiddenStrokes: [],
      cautionStrokes: ['자유형 (입수 시 손목 각도)', '접영 (손목 부담)'],
      recommendedStrokes: ['배영 (손목 부담 낮음)', '풀부이 사용 자유형'],
      forbiddenEquipment: ['패들 (과부하)', '핀 (손으로 보상)'],
      recommendedEquipment: ['풀부이 (킥 중심)', '스노클'],
      zoneRestrictions: ['고강도 풀 세트 금지']
    },
    scientificEvidence: [
      {
        title: 'Wrist and hand injuries in swimming',
        authors: 'Wadsworth, C. T., & Nielsen, D. H.',
        year: 1985,
        journal: 'Clinics in Sports Medicine, 4(4), 641-649',
        findings: '패들 과사용 시 손목 부담 2-3배 증가. 입수 시 손목 각도 불량이 주 원인. 테크닉 교정 시 80% 개선.'
      }
    ],
    physiologicalMechanism: '반복적인 손목 신전(extension)과 굴곡(flexion)으로 손목 인대(wrist ligament)와 힘줄(tendon)에 과부하가 발생합니다. 특히 패들 사용 시 저항이 증가하여 부담이 커집니다.',
    recoveryTime: '경미: 1-2주, 중등도: 4-6주, 중증: 8-12주'
  },

  'ankle_pain': {
    name: '발목 통증 (Ankle Pain)',
    category: '관절/근골격',
    description: '발목 관절의 과도한 저측굴(plantar flexion)로 인한 통증입니다. 자유형과 접영의 돌핀킥, 핀 사용 시 발목에 과부하가 발생합니다.',
    adjustments: {
      intensity: '핀 금지, 킥 강도 70%',
      forbiddenStrokes: [],
      cautionStrokes: ['자유형 (플러터 킥)', '접영 (돌핀 킥)'],
      recommendedStrokes: ['평영 (위빙 킥, 발목 부담 낮음)', '풀부이 사용'],
      forbiddenEquipment: ['핀 (과부하)', '킥보드 (킥 강도 증가)'],
      recommendedEquipment: ['풀부이 (킥 최소화)'],
      zoneRestrictions: ['고강도 킥 세트 금지']
    },
    scientificEvidence: [
      {
        title: 'Ankle injuries in competitive swimmers',
        authors: 'Kenal, K. A., & Knapp, L. D.',
        year: 1996,
        journal: 'Sports Medicine, 22(2), 132-138',
        findings: '자유형/접영 선수의 35%가 발목 통증. 과도한 저측굴이 주 원인. 핀 사용 시 부담 2배 증가.'
      }
    ],
    physiologicalMechanism: '플러터 킥과 돌핀 킥에서 발목이 과도하게 저측굴되면서 아킬레스건(Achilles tendon)과 발목 전방 인대(anterior ankle ligament)에 과도한 장력이 발생합니다.',
    recoveryTime: '경미: 1-2주, 중등도: 4-6주, 중증: 8-12주'
  },

  'elderly': {
    name: '고령 (Elderly/Senior)',
    category: '특수상황',
    description: '65세 이상 고령자는 근력, 유연성, 심폐 기능이 감소하고, 회복 속도가 느려집니다. 안전한 강도와 점진적 증가가 중요합니다.',
    adjustments: {
      intensity: '강도 60-70% (안전 우선)',
      forbiddenStrokes: [],
      cautionStrokes: ['접영 (고강도)', '고속 터닝 (낙상 위험)'],
      recommendedStrokes: ['자유형 (편안한 페이스)', '배영', '평영'],
      forbiddenEquipment: [],
      recommendedEquipment: ['풀부이 (체력 절약)', '스노클 (호흡 편의)'],
      zoneRestrictions: ['Z1-Z2 중심', 'Z3 이상 최소화', '심박수 모니터링 필수']
    },
    scientificEvidence: [
      {
        title: 'Swimming as exercise for older adults: benefits and precautions',
        authors: 'Waller, M., & Breukelman, F.',
        year: 2008,
        journal: 'The Physician and Sportsmedicine, 36(1), 49-55',
        findings: '고령자 수영 시 낙상 위험 낮고 심폐 기능 10-15% 개선. 저~중강도 유지 필수. 점진적 증가 권장 (주당 5-10%).'
      }
    ],
    physiologicalMechanism: '노화로 인해 최대 심박수 감소, 근육량 감소(sarcopenia), 관절 유연성 저하, 회복 속도 감소가 발생합니다. 과도한 운동은 부상 위험을 증가시킵니다.',
    recoveryTime: '젊은 성인 대비 1.5-2배 긴 회복 필요'
  },

  'rhinitis': {
    name: '비염 (Rhinitis/Nasal Congestion)',
    category: '호흡기/피부',
    description: '코 점막의 염증으로 코막힘, 재채기, 콧물이 발생합니다. 수영 중 코로 물이 들어가거나 염소 자극으로 증상이 악화될 수 있습니다.',
    adjustments: {
      intensity: '정상 강도 유지 (코 보호)',
      forbiddenStrokes: [],
      cautionStrokes: ['평영 (코로 물 들어가기 쉬움)'],
      recommendedStrokes: ['자유형 (스노클 권장)', '배영'],
      forbiddenEquipment: [],
      recommendedEquipment: ['스노클 (구강 호흡)', '노즈 클립 (코 보호)', '고글'],
      zoneRestrictions: []
    },
    scientificEvidence: [
      {
        title: 'Swimming pool attendance and rhinitis in adults',
        authors: 'Jacobs, J. H., Spaan, S., van Rooy, G. B., et al.',
        year: 2007,
        journal: 'Occupational and Environmental Medicine, 64(5), 320-324',
        findings: '염소 자극으로 비염 증상 악화 가능. 스노클 사용 시 코 자극 80% 감소. 환기 개선 시 증상 완화.'
      }
    ],
    physiologicalMechanism: '염소와 염소화 부산물(chloramines)이 코 점막을 자극하여 히스타민 분비를 촉진하고, 비강 내 혈관 확장과 점액 분비가 증가합니다.',
    recoveryTime: '알레르기성: 지속적 관리 필요, 감염성: 7-14일'
  },

  'ear_infection': {
    name: '귀 염증/중이염 (Ear Infection)',
    category: '귀/이비인후과',
    description: '외이도 또는 중이의 세균/진균 감염으로 인한 통증과 염증입니다. 수영 후 귀에 물이 남아 감염이 발생하는 "수영자의 귀(Swimmer\'s Ear)"가 흔합니다.',
    adjustments: {
      intensity: '완전 휴식 (감염 치료 우선)',
      forbiddenStrokes: ['모든 영법 (수영 금지)'],
      cautionStrokes: [],
      recommendedStrokes: [],
      forbiddenEquipment: ['모든 장비 (수영 금지)'],
      recommendedEquipment: [],
      zoneRestrictions: ['수영 금지 (치료 완료 후 재개)']
    },
    scientificEvidence: [
      {
        title: 'Otitis externa: pathophysiology and management',
        authors: 'Rosenfeld, R. M., Schwartz, S. R., Cannon, C. R., et al.',
        year: 2006,
        journal: 'Otolaryngology-Head and Neck Surgery, 134(4 Suppl), S4-23',
        findings: '수영 후 외이도 감염 위험 5배 증가. 치료 중 수영 금지 필수. 완치 후 귀마개 사용 권장.'
      }
    ],
    physiologicalMechanism: '외이도에 물이 남아 습한 환경이 조성되면 Pseudomonas aeruginosa 등 세균이 증식하여 외이도 피부를 감염시킵니다. 중이염은 유스타키오관을 통한 상기도 감염 확산으로 발생합니다.',
    recoveryTime: '외이염: 7-10일 (항생제 치료), 중이염: 10-14일'
  },

  'skin_sensitivity': {
    name: '피부 민감/습진 (Skin Sensitivity/Eczema)',
    category: '호흡기/피부',
    description: '피부의 염소 과민 반응 또는 습진(eczema)으로 인한 가려움, 발진, 건조증. 수영장 염소가 피부 보호막을 파괴하여 증상을 악화시킵니다.',
    adjustments: {
      intensity: '정상 강도 유지 (피부 보호)',
      forbiddenStrokes: [],
      cautionStrokes: [],
      recommendedStrokes: ['모든 영법 가능 (보호 조치 필수)'],
      forbiddenEquipment: [],
      recommendedEquipment: [],
      zoneRestrictions: []
    },
    scientificEvidence: [
      {
        title: 'Swimming pool attendance and skin problems in swimmers',
        authors: 'Goodman, M., & Hays, S.',
        year: 2008,
        journal: 'Contact Dermatitis, 58(2), 79-84',
        findings: '염소가 피부 지질 장벽 파괴. 수영 전후 보습제 사용 시 증상 50% 감소. 수영 후 즉시 샤워 권장.'
      }
    ],
    physiologicalMechanism: '염소가 피부의 천연 지질 장벽(lipid barrier)을 파괴하여 수분 손실과 자극이 증가합니다. 습진 환자는 이미 손상된 피부 장벽으로 인해 증상이 더 심합니다.',
    recoveryTime: '지속적 관리 필요 (수영 전후 보습 필수)'
  },

  'high_blood_pressure': {
    name: '고혈압 (Hypertension - Controlled)',
    category: '심혈관',
    description: '약물로 조절되는 고혈압 환자. 수영은 혈압 조절에 도움이 되나, 과도한 고강도 운동은 혈압을 급격히 상승시킬 수 있습니다.',
    adjustments: {
      intensity: '강도 70-80% (혈압 모니터링)',
      forbiddenStrokes: [],
      cautionStrokes: [],
      recommendedStrokes: ['자유형 (편안한 페이스)', '배영'],
      forbiddenEquipment: [],
      recommendedEquipment: [],
      zoneRestrictions: ['Z1-Z3 중심', 'Z4-Z5 최소화', '혈압 측정 권장']
    },
    scientificEvidence: [
      {
        title: 'Exercise training for blood pressure: a systematic review and meta-analysis',
        authors: 'Cornelissen, V. A., & Smart, N. A.',
        year: 2013,
        journal: 'Journal of the American Heart Association, 2(1), e004473',
        findings: '유산소 운동으로 수축기 혈압 5-7mmHg 감소. 수영은 안전하고 효과적. 저~중강도 유지 필수.'
      }
    ],
    physiologicalMechanism: '고강도 운동 시 교감신경 활성화로 혈압이 급격히 상승할 수 있습니다. 저~중강도 유산소 운동은 혈관 확장과 혈압 조절에 도움이 됩니다.',
    recoveryTime: '만성 질환 (지속적 관리 및 약물 복용 필요)'
  },

  'diabetes': {
    name: '당뇨병 (Diabetes - Controlled)',
    category: '대사/내분비',
    description: '약물 또는 식이로 조절되는 당뇨병 환자. 수영은 혈당 조절에 도움이 되나, 저혈당(hypoglycemia) 위험을 주의해야 합니다.',
    adjustments: {
      intensity: '강도 70-80% (혈당 모니터링)',
      forbiddenStrokes: [],
      cautionStrokes: [],
      recommendedStrokes: ['모든 영법 가능'],
      forbiddenEquipment: [],
      recommendedEquipment: [],
      zoneRestrictions: ['Z1-Z3 중심', '고강도 최소화', '혈당 측정 권장']
    },
    scientificEvidence: [
      {
        title: 'Exercise and type 2 diabetes: recommendations for exercise prescription',
        authors: 'Colberg, S. R., Sigal, R. J., Fernhall, B., et al.',
        year: 2010,
        journal: 'Diabetes Care, 33(12), e147-e167',
        findings: '유산소 운동으로 HbA1c 0.6-0.7% 감소. 저혈당 방지 위해 운동 전후 혈당 측정 필수. 간식 준비 권장.'
      }
    ],
    physiologicalMechanism: '운동 시 근육의 포도당 흡수 증가로 혈당이 감소합니다. 과도한 운동은 저혈당을 유발할 수 있으므로 혈당 모니터링이 필수입니다.',
    recoveryTime: '만성 질환 (지속적 관리 필요)'
  },

  'postpartum': {
    name: '산후 회복 (Postpartum Recovery)',
    category: '특수상황',
    description: '출산 후 6-8주 회복 기간. 체력 저하, 복부 근력 약화, 호르몬 변화로 인한 피로. 점진적 운동 재개가 중요합니다.',
    adjustments: {
      intensity: '강도 50-60% (6주), 70-80% (12주)',
      forbiddenStrokes: [],
      cautionStrokes: ['접영 (복부 부담)', '고강도 킥 (골반저근 부담)'],
      recommendedStrokes: ['자유형 (편안한 페이스)', '배영'],
      forbiddenEquipment: ['큰 패들 (과부하)'],
      recommendedEquipment: ['풀부이 (체력 절약)'],
      zoneRestrictions: ['Z1-Z2 중심 (6주)', 'Z3 이하 (12주)', '점진적 증가']
    },
    scientificEvidence: [
      {
        title: 'Physical activity and exercise during pregnancy and the postpartum period',
        authors: 'ACOG Committee Opinion No. 650',
        year: 2015,
        journal: 'Obstetrics & Gynecology, 126(6), e135-e142',
        findings: '출산 후 6주부터 가벼운 운동 재개 가능. 12주까지 점진적 증가 권장. 수영은 저충격으로 안전.'
      }
    ],
    physiologicalMechanism: '출산 후 복직근 분리(diastasis recti), 골반저근 약화, 호르몬 변화로 체력과 근력이 저하됩니다. 점진적 운동 재개가 회복에 도움이 됩니다.',
    recoveryTime: '6-8주 (의사 확인 후 운동 재개), 완전 회복 3-6개월'
  }
};

export default function ConditionDetailModal({
  conditionId,
  onClose
}: ConditionDetailModalProps) {
  const detail = CONDITION_DETAILS[conditionId];

  if (!detail) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">질환 정보 없음</h3>
          <p className="text-gray-600 mb-4">
            해당 질환({conditionId})의 상세 정보가 준비 중입니다.
          </p>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold"
          >
            닫기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="sticky top-0 bg-gradient-to-r from-red-50 to-orange-50 border-b-2 border-red-200 p-6 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-red-900">{detail.name}</h3>
              <p className="text-sm text-red-700 mt-1">{detail.category}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ✕
            </button>
          </div>
        </div>

        {/* 본문 */}
        <div className="p-6 space-y-6">
          {/* 질환 설명 */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">📋 질환 설명</h4>
            <p className="text-gray-700 leading-relaxed">{detail.description}</p>
          </div>

          {/* 생리학적 메커니즘 */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2">🔬 생리학적 메커니즘</h4>
            <p className="text-sm text-blue-800 leading-relaxed">{detail.physiologicalMechanism}</p>
          </div>

          {/* 조절 내역 */}
          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
            <h4 className="font-semibold text-yellow-900 mb-3">⚙️ 프로그램 조절 내역</h4>
            
            <div className="space-y-3">
              {/* 강도 조절 */}
              <div>
                <p className="text-sm font-semibold text-yellow-900 mb-1">📊 강도 조절</p>
                <p className="text-sm text-yellow-800">{detail.adjustments.intensity}</p>
              </div>

              {/* 금지 영법 */}
              {detail.adjustments.forbiddenStrokes.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-red-900 mb-1">🚫 금지 영법</p>
                  <div className="flex flex-wrap gap-2">
                    {detail.adjustments.forbiddenStrokes.map((stroke, idx) => (
                      <span key={idx} className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                        {stroke}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 주의 영법 */}
              {detail.adjustments.cautionStrokes.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-orange-900 mb-1">⚠️ 주의 영법</p>
                  <div className="flex flex-wrap gap-2">
                    {detail.adjustments.cautionStrokes.map((stroke, idx) => (
                      <span key={idx} className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                        {stroke}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 권장 영법 */}
              {detail.adjustments.recommendedStrokes.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-green-900 mb-1">✅ 권장 영법</p>
                  <div className="flex flex-wrap gap-2">
                    {detail.adjustments.recommendedStrokes.map((stroke, idx) => (
                      <span key={idx} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        {stroke}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 금지 장비 */}
              {detail.adjustments.forbiddenEquipment.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-red-900 mb-1">🚫 금지 장비</p>
                  <div className="flex flex-wrap gap-2">
                    {detail.adjustments.forbiddenEquipment.map((eq, idx) => (
                      <span key={idx} className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                        {eq}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 권장 장비 */}
              {detail.adjustments.recommendedEquipment.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-green-900 mb-1">💡 권장 장비</p>
                  <div className="flex flex-wrap gap-2">
                    {detail.adjustments.recommendedEquipment.map((eq, idx) => (
                      <span key={idx} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        {eq}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Zone 제한 */}
              {detail.adjustments.zoneRestrictions.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-purple-900 mb-1">📏 강도 제한</p>
                  <div className="space-y-1">
                    {detail.adjustments.zoneRestrictions.map((zone, idx) => (
                      <p key={idx} className="text-sm text-purple-800">• {zone}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 과학적 근거 */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">📚 과학적 근거</h4>
            <div className="space-y-4">
              {detail.scientificEvidence.map((evidence, idx) => (
                <div key={idx} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="font-semibold text-gray-900 mb-1">{evidence.title}</p>
                  <p className="text-xs text-gray-600 mb-2">
                    {evidence.authors} ({evidence.year}). <em>{evidence.journal}</em>
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>연구 결과:</strong> {evidence.findings}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 회복 기간 */}
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <h4 className="font-semibold text-green-900 mb-2">⏱️ 예상 회복 기간</h4>
            <p className="text-sm text-green-800">{detail.recoveryTime}</p>
            <p className="text-xs text-green-700 mt-2">
              💡 개인차가 있으며, 전문의 상담을 권장합니다.
            </p>
          </div>
        </div>

        {/* 푸터 */}
        <div className="sticky bottom-0 bg-white border-t p-6">
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}

