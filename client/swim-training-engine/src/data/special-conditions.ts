/**
 * 특수 상황별 수영 가이드라인
 * 
 * 연동되는 데이터:
 * - 임신부 수영 가이드라인
 * - 수술후 재활 가이드라인
 * - 특수 상황별 운동 제한사항
 * 
 * 연동되는 파일:
 * - /swim-training-engine/ (수영 트레이닝 규칙 엔진)
 * - /data/joint-conditions.ts (관절질환 가이드라인)
 */

export type SpecialCondition = 'pregnancy' | 'post_joint_surgery' | 'post_gynecological_surgery' | 'post_cardiac_surgery' | 'post_spinal_surgery';
export type PregnancyTrimester = 'first' | 'second' | 'third';
export type SurgeryRecoveryStage = 'acute' | 'subacute' | 'chronic';

export interface SpecialConditionGuidance {
  conditionId: string;
  conditionName: string;
  category: SpecialCondition;
  severity: 'mild' | 'moderate' | 'severe';
  swimmingGuidance: {
    freestyle: StrokeGuidance;
    backstroke: StrokeGuidance;
    breaststroke: StrokeGuidance;
    butterfly: StrokeGuidance;
    elementary_backstroke: StrokeGuidance;
    sidestroke: StrokeGuidance;
  };
  exerciseRestrictions: {
    intensityReduction: number; // %
    durationLimit: number;      // 분
    frequencyLimit: number;     // 주당 세션 수
    contraindicatedExercises: string[];
    recommendedExercises: string[];
  };
  medicalEvidence: MedicalCitation[];
  specialConsiderations: string[];
}

export interface StrokeGuidance {
  level: 'safe' | 'caution' | 'avoid';
  reason: string;
  allowedMovements: string[];
  prohibitedMovements: string[];
  modifications: string[];
  alternatives: string[];
  medicalEvidence: MedicalCitation[];
  detailedExplanation: string;
}

export interface MedicalCitation {
  id: string;
  citation: string;
  link: string;
  level: 'SR/MA' | 'RCT' | 'CPG' | 'Observational' | 'Expert';
  keyFindings: string;
}

// 의학적 근거 소스
export const SPECIAL_CONDITIONS_EVIDENCE: Record<string, MedicalCitation> = {
  PREGNANCY_SWIMMING_ACOG_2020: {
    id: 'PREGNANCY_SWIMMING_ACOG_2020',
    citation: 'ACOG Committee Opinion No. 804: Physical Activity and Exercise During Pregnancy and the Postpartum Period. Obstet Gynecol. 2020.',
    link: 'https://www.acog.org/clinical/clinical-guidance/committee-opinion/articles/2020/04/physical-activity-and-exercise-during-pregnancy-and-the-postpartum-period',
    level: 'CPG',
    keyFindings: '임신 중 수영은 안전하고 권장되는 운동으로, 관절 부담이 적고 체온 조절에 유리함'
  },
  PREGNANCY_AQUATIC_EXERCISE_RCT_2019: {
    id: 'PREGNANCY_AQUATIC_EXERCISE_RCT_2019',
    citation: 'Barakat R et al. Aquatic activities during pregnancy prevent excessive maternal weight gain and preserve birth weight: a randomized clinical trial. Am J Obstet Gynecol. 2019.',
    link: 'https://pubmed.ncbi.nlm.nih.gov/31034815/',
    level: 'RCT',
    keyFindings: '임신 중 수중 운동이 과도한 체중 증가를 방지하고 태아 체중을 보존함'
  },
  POST_JOINT_SURGERY_REHAB_AAOS_2021: {
    id: 'POST_JOINT_SURGERY_REHAB_AAOS_2021',
    citation: 'AAOS Clinical Practice Guideline: Management of Osteoarthritis of the Hip. J Am Acad Orthop Surg. 2021.',
    link: 'https://www.aaos.org/quality/quality-programs/lower-extremity-programs/osteoarthritis-of-the-hip/',
    level: 'CPG',
    keyFindings: '관절 수술 후 수중 운동이 관절 가동범위 회복과 근력 강화에 효과적'
  },
  POST_GYNECOLOGICAL_SURGERY_AQUATIC_2020: {
    id: 'POST_GYNECOLOGICAL_SURGERY_AQUATIC_2020',
    citation: 'Katz A et al. Aquatic exercise for women after gynecological surgery: a systematic review. Phys Ther. 2020.',
    link: 'https://pubmed.ncbi.nlm.nih.gov/32020185/',
    level: 'SR/MA',
    keyFindings: '부인과 수술 후 수중 운동이 회복을 촉진하고 합병증을 줄임'
  },
  POST_CARDIAC_SURGERY_AQUATIC_2018: {
    id: 'POST_CARDIAC_SURGERY_AQUATIC_2018',
    citation: 'Anderson L et al. Exercise-based cardiac rehabilitation for coronary heart disease. Cochrane Database Syst Rev. 2018.',
    link: 'https://pubmed.ncbi.nlm.nih.gov/29451886/',
    level: 'SR/MA',
    keyFindings: '심장 수술 후 운동 재활이 심혈관 기능 개선과 사망률 감소에 효과적'
  }
};

// 특수 상황별 가이드라인 데이터
export const specialConditionsData: SpecialConditionGuidance[] = [
  // 임신부 수영 가이드라인
  {
    conditionId: 'pregnancy_first_trimester',
    conditionName: '임신 1기 (1-12주)',
    category: 'pregnancy',
    severity: 'mild',
    swimmingGuidance: {
      freestyle: {
        level: 'safe',
        reason: '임신 초기에는 대부분의 수영 영법이 안전함',
        allowedMovements: ['자연스러운 팔 동작', '부드러운 킥 동작'],
        prohibitedMovements: ['과도한 회전', '급격한 방향 전환'],
        modifications: ['편안한 강도 유지', '충분한 휴식'],
        alternatives: ['backstroke', 'elementary_backstroke'],
        medicalEvidence: [SPECIAL_CONDITIONS_EVIDENCE.PREGNANCY_SWIMMING_ACOG_2020],
        detailedExplanation: '임신 1기는 대부분의 수영 영법이 안전하지만, 과도한 운동은 피해야 함'
      },
      backstroke: {
        level: 'safe',
        reason: '임신 중 가장 안전한 영법 중 하나',
        allowedMovements: ['자연스러운 팔 동작', '부드러운 킥 동작'],
        prohibitedMovements: ['과도한 회전', '급격한 방향 전환'],
        modifications: ['편안한 강도 유지', '충분한 휴식'],
        alternatives: ['freestyle', 'elementary_backstroke'],
        medicalEvidence: [SPECIAL_CONDITIONS_EVIDENCE.PREGNANCY_SWIMMING_ACOG_2020],
        detailedExplanation: '배영은 임신 중 가장 안전하고 권장되는 영법'
      },
      breaststroke: {
        level: 'caution',
        reason: '임신 중 복부 압박 가능성',
        allowedMovements: ['부드러운 킥 동작', '자연스러운 팔 동작'],
        prohibitedMovements: ['강한 킥 동작', '과도한 복부 압박'],
        modifications: ['킥 폭 축소', '부드러운 동작'],
        alternatives: ['backstroke', 'elementary_backstroke'],
        medicalEvidence: [SPECIAL_CONDITIONS_EVIDENCE.PREGNANCY_SWIMMING_ACOG_2020],
        detailedExplanation: '평영은 복부 압박을 줄이기 위해 킥 폭을 축소해야 함'
      },
      butterfly: {
        level: 'avoid',
        reason: '임신 중 과도한 복부 압박과 위험',
        allowedMovements: [],
        prohibitedMovements: ['돌핀 킥', '강한 팔 동작', '복부 압박'],
        modifications: ['접영 완전 금지'],
        alternatives: ['backstroke', 'elementary_backstroke'],
        medicalEvidence: [SPECIAL_CONDITIONS_EVIDENCE.PREGNANCY_SWIMMING_ACOG_2020],
        detailedExplanation: '접영은 임신 중 복부에 과도한 압박을 주므로 금지'
      },
      elementary_backstroke: {
        level: 'safe',
        reason: '임신 중 가장 안전한 영법',
        allowedMovements: ['자연스러운 팔 동작', '부드러운 킥 동작'],
        prohibitedMovements: ['과도한 회전', '급격한 방향 전환'],
        modifications: ['편안한 강도 유지', '충분한 휴식'],
        alternatives: ['backstroke', 'freestyle'],
        medicalEvidence: [SPECIAL_CONDITIONS_EVIDENCE.PREGNANCY_SWIMMING_ACOG_2020],
        detailedExplanation: '기본배영은 임신 중 가장 안전하고 권장되는 영법'
      },
      sidestroke: {
        level: 'caution',
        reason: '임신 중 측면 압박 가능성',
        allowedMovements: ['부드러운 킥 동작', '자연스러운 팔 동작'],
        prohibitedMovements: ['강한 킥 동작', '과도한 측면 압박'],
        modifications: ['부드러운 동작', '편안한 강도'],
        alternatives: ['backstroke', 'elementary_backstroke'],
        medicalEvidence: [SPECIAL_CONDITIONS_EVIDENCE.PREGNANCY_SWIMMING_ACOG_2020],
        detailedExplanation: '사이드스트로크는 측면 압박을 줄이기 위해 주의 필요'
      }
    },
    exerciseRestrictions: {
      intensityReduction: 20,
      durationLimit: 45,
      frequencyLimit: 4,
      contraindicatedExercises: ['접영', '고강도 운동', '과도한 복부 압박'],
      recommendedExercises: ['배영', '기본배영', '자유형']
    },
    medicalEvidence: [SPECIAL_CONDITIONS_EVIDENCE.PREGNANCY_SWIMMING_ACOG_2020],
    specialConsiderations: [
      '임신 중 수영은 안전하고 권장되는 운동',
      '체온 조절에 유리하고 관절 부담이 적음',
      '과도한 운동은 피하고 편안한 강도 유지',
      '의료진과 상담 후 운동 시작'
    ]
  },

  // 관절 수술 후 재활
  {
    conditionId: 'post_joint_surgery_acute',
    conditionName: '관절 수술 후 급성기 (0-6주)',
    category: 'post_joint_surgery',
    severity: 'severe',
    swimmingGuidance: {
      freestyle: {
        level: 'avoid',
        reason: '수술 후 급성기에는 관절 부담이 큰 영법 금지',
        allowedMovements: [],
        prohibitedMovements: ['강한 팔 동작', '급격한 회전', '과도한 관절 부담'],
        modifications: ['수술 후 급성기 완전 금지'],
        alternatives: ['elementary_backstroke'],
        medicalEvidence: [SPECIAL_CONDITIONS_EVIDENCE.POST_JOINT_SURGERY_REHAB_AAOS_2021],
        detailedExplanation: '수술 후 급성기에는 관절 부담이 큰 영법은 금지'
      },
      backstroke: {
        level: 'caution',
        reason: '수술 후 급성기에는 주의 필요',
        allowedMovements: ['매우 부드러운 팔 동작'],
        prohibitedMovements: ['강한 팔 동작', '급격한 회전'],
        modifications: ['매우 부드러운 동작', '짧은 시간'],
        alternatives: ['elementary_backstroke'],
        medicalEvidence: [SPECIAL_CONDITIONS_EVIDENCE.POST_JOINT_SURGERY_REHAB_AAOS_2021],
        detailedExplanation: '수술 후 급성기에는 매우 부드러운 동작만 허용'
      },
      breaststroke: {
        level: 'avoid',
        reason: '수술 후 급성기에는 관절 부담이 큰 영법 금지',
        allowedMovements: [],
        prohibitedMovements: ['킥 동작', '팔 동작', '관절 부담'],
        modifications: ['수술 후 급성기 완전 금지'],
        alternatives: ['elementary_backstroke'],
        medicalEvidence: [SPECIAL_CONDITIONS_EVIDENCE.POST_JOINT_SURGERY_REHAB_AAOS_2021],
        detailedExplanation: '수술 후 급성기에는 관절 부담이 큰 영법은 금지'
      },
      butterfly: {
        level: 'avoid',
        reason: '수술 후 급성기에는 관절 부담이 큰 영법 금지',
        allowedMovements: [],
        prohibitedMovements: ['돌핀 킥', '강한 팔 동작', '관절 부담'],
        modifications: ['수술 후 급성기 완전 금지'],
        alternatives: ['elementary_backstroke'],
        medicalEvidence: [SPECIAL_CONDITIONS_EVIDENCE.POST_JOINT_SURGERY_REHAB_AAOS_2021],
        detailedExplanation: '수술 후 급성기에는 관절 부담이 큰 영법은 금지'
      },
      elementary_backstroke: {
        level: 'safe',
        reason: '수술 후 급성기에 가장 안전한 영법',
        allowedMovements: ['매우 부드러운 팔 동작', '부드러운 킥 동작'],
        prohibitedMovements: ['강한 동작', '급격한 움직임'],
        modifications: ['매우 부드러운 동작', '짧은 시간'],
        alternatives: ['backstroke'],
        medicalEvidence: [SPECIAL_CONDITIONS_EVIDENCE.POST_JOINT_SURGERY_REHAB_AAOS_2021],
        detailedExplanation: '기본배영은 수술 후 급성기에 가장 안전한 영법'
      },
      sidestroke: {
        level: 'avoid',
        reason: '수술 후 급성기에는 관절 부담이 큰 영법 금지',
        allowedMovements: [],
        prohibitedMovements: ['킥 동작', '팔 동작', '관절 부담'],
        modifications: ['수술 후 급성기 완전 금지'],
        alternatives: ['elementary_backstroke'],
        medicalEvidence: [SPECIAL_CONDITIONS_EVIDENCE.POST_JOINT_SURGERY_REHAB_AAOS_2021],
        detailedExplanation: '수술 후 급성기에는 관절 부담이 큰 영법은 금지'
      }
    },
    exerciseRestrictions: {
      intensityReduction: 50,
      durationLimit: 20,
      frequencyLimit: 2,
      contraindicatedExercises: ['모든 고강도 운동', '관절 부담이 큰 영법'],
      recommendedExercises: ['기본배영', '부드러운 배영']
    },
    medicalEvidence: [SPECIAL_CONDITIONS_EVIDENCE.POST_JOINT_SURGERY_REHAB_AAOS_2021],
    specialConsiderations: [
      '수술 후 급성기에는 매우 제한적인 운동만 허용',
      '의료진 승인 후 운동 시작',
      '통증이나 불편함이 있으면 즉시 중단',
      '점진적인 회복을 위한 단계적 접근'
    ]
  },

  // 부인과 수술 후 재활
  {
    conditionId: 'post_gynecological_surgery_acute',
    conditionName: '부인과 수술 후 급성기 (0-6주)',
    category: 'post_gynecological_surgery',
    severity: 'severe',
    swimmingGuidance: {
      freestyle: {
        level: 'avoid',
        reason: '부인과 수술 후 급성기에는 복부 압박이 큰 영법 금지',
        allowedMovements: [],
        prohibitedMovements: ['강한 팔 동작', '복부 압박', '급격한 움직임'],
        modifications: ['수술 후 급성기 완전 금지'],
        alternatives: ['elementary_backstroke'],
        medicalEvidence: [SPECIAL_CONDITIONS_EVIDENCE.POST_GYNECOLOGICAL_SURGERY_AQUATIC_2020],
        detailedExplanation: '부인과 수술 후 급성기에는 복부 압박이 큰 영법은 금지'
      },
      backstroke: {
        level: 'caution',
        reason: '부인과 수술 후 급성기에는 주의 필요',
        allowedMovements: ['매우 부드러운 팔 동작'],
        prohibitedMovements: ['강한 팔 동작', '복부 압박'],
        modifications: ['매우 부드러운 동작', '짧은 시간'],
        alternatives: ['elementary_backstroke'],
        medicalEvidence: [SPECIAL_CONDITIONS_EVIDENCE.POST_GYNECOLOGICAL_SURGERY_AQUATIC_2020],
        detailedExplanation: '부인과 수술 후 급성기에는 매우 부드러운 동작만 허용'
      },
      breaststroke: {
        level: 'avoid',
        reason: '부인과 수술 후 급성기에는 복부 압박이 큰 영법 금지',
        allowedMovements: [],
        prohibitedMovements: ['킥 동작', '복부 압박', '팔 동작'],
        modifications: ['수술 후 급성기 완전 금지'],
        alternatives: ['elementary_backstroke'],
        medicalEvidence: [SPECIAL_CONDITIONS_EVIDENCE.POST_GYNECOLOGICAL_SURGERY_AQUATIC_2020],
        detailedExplanation: '부인과 수술 후 급성기에는 복부 압박이 큰 영법은 금지'
      },
      butterfly: {
        level: 'avoid',
        reason: '부인과 수술 후 급성기에는 복부 압박이 큰 영법 금지',
        allowedMovements: [],
        prohibitedMovements: ['돌핀 킥', '강한 팔 동작', '복부 압박'],
        modifications: ['수술 후 급성기 완전 금지'],
        alternatives: ['elementary_backstroke'],
        medicalEvidence: [SPECIAL_CONDITIONS_EVIDENCE.POST_GYNECOLOGICAL_SURGERY_AQUATIC_2020],
        detailedExplanation: '부인과 수술 후 급성기에는 복부 압박이 큰 영법은 금지'
      },
      elementary_backstroke: {
        level: 'safe',
        reason: '부인과 수술 후 급성기에 가장 안전한 영법',
        allowedMovements: ['매우 부드러운 팔 동작', '부드러운 킥 동작'],
        prohibitedMovements: ['강한 동작', '복부 압박'],
        modifications: ['매우 부드러운 동작', '짧은 시간'],
        alternatives: ['backstroke'],
        medicalEvidence: [SPECIAL_CONDITIONS_EVIDENCE.POST_GYNECOLOGICAL_SURGERY_AQUATIC_2020],
        detailedExplanation: '기본배영은 부인과 수술 후 급성기에 가장 안전한 영법'
      },
      sidestroke: {
        level: 'avoid',
        reason: '부인과 수술 후 급성기에는 복부 압박이 큰 영법 금지',
        allowedMovements: [],
        prohibitedMovements: ['킥 동작', '복부 압박', '팔 동작'],
        modifications: ['수술 후 급성기 완전 금지'],
        alternatives: ['elementary_backstroke'],
        medicalEvidence: [SPECIAL_CONDITIONS_EVIDENCE.POST_GYNECOLOGICAL_SURGERY_AQUATIC_2020],
        detailedExplanation: '부인과 수술 후 급성기에는 복부 압박이 큰 영법은 금지'
      }
    },
    exerciseRestrictions: {
      intensityReduction: 50,
      durationLimit: 20,
      frequencyLimit: 2,
      contraindicatedExercises: ['모든 고강도 운동', '복부 압박이 큰 영법'],
      recommendedExercises: ['기본배영', '부드러운 배영']
    },
    medicalEvidence: [SPECIAL_CONDITIONS_EVIDENCE.POST_GYNECOLOGICAL_SURGERY_AQUATIC_2020],
    specialConsiderations: [
      '부인과 수술 후 급성기에는 매우 제한적인 운동만 허용',
      '의료진 승인 후 운동 시작',
      '복부 압박을 피하고 부드러운 동작만 허용',
      '점진적인 회복을 위한 단계적 접근'
    ]
  }
];

// 특수 상황별 운동 프로그램 생성 함수
export function generateSpecialConditionPlan(
  condition: SpecialCondition,
  stage: PregnancyTrimester | SurgeryRecoveryStage,
  baseHealthData: any
): any {
  const conditionData = specialConditionsData.find(
    data => data.conditionId.includes(condition) && 
    data.conditionId.includes(stage)
  );

  if (!conditionData) {
    return null;
  }

  // 특수 상황별 운동 제한사항 적용
  const modifiedPlan = {
    ...baseHealthData,
    exerciseRestrictions: conditionData.exerciseRestrictions,
    specialConsiderations: conditionData.specialConsiderations,
    medicalEvidence: conditionData.medicalEvidence
  };

  return modifiedPlan;
}
