import { JointConditionGuidance, Stroke, SafetyLevel, MedicalCitation } from '../types';

export const EVIDENCE_BASED_SOURCES: Record<string, MedicalCitation> = {
  BARTELS_2016_COCHRANE: {
    id: 'BARTELS_2016_COCHRANE',
    citation: 'Bartels EM et al. Aquatic exercise for the treatment of knee and hip osteoarthritis',
    link: 'https://pubmed.ncbi.nlm.nih.gov/27007113/',
    level: 'SR/MA',
    keyFindings: '수중 운동이 무릎과 고관절 골관절염 환자의 통증과 기능을 단기적으로 개선함'
  },
  HAYDEN_2005_COCHRANE: {
    id: 'HAYDEN_2005_COCHRANE',
    citation: 'Hayden JA et al. Exercise therapy for treatment of non-specific low back pain',
    link: 'https://pubmed.ncbi.nlm.nih.gov/16034851/',
    level: 'SR/MA',
    keyFindings: '만성 요통에서 운동 치료가 통증과 기능에 소~중등도 이점을 제공함'
  }
};

const strokeTemplates = {
  spine: {
    freestyle: { level: 'safe' as SafetyLevel, reason: '척추에 부담이 적은 수평 자세', allowedMovements: ['자유형 팔 동작', '자유형 다리 동작'], prohibitedMovements: [], modifications: [], alternatives: ['backstroke' as Stroke, 'elementary_backstroke' as Stroke], medicalEvidence: [], detailedExplanation: '척추에 부담이 적은 수평 자세로 안전하게 수영할 수 있습니다.' },
    backstroke: { level: 'safe' as SafetyLevel, reason: '척추 신전에 도움', allowedMovements: ['배영 팔 동작', '배영 다리 동작'], prohibitedMovements: [], modifications: [], alternatives: ['freestyle' as Stroke, 'elementary_backstroke' as Stroke], medicalEvidence: [], detailedExplanation: '척추 신전에 도움이 되는 자세입니다.' },
    breaststroke: { level: 'caution' as SafetyLevel, reason: '척추 과신전 위험', allowedMovements: ['평영 팔 동작'], prohibitedMovements: ['과도한 척추 신전'], modifications: ['척추 중립 자세 유지', '킥 폭 축소'], alternatives: ['freestyle' as Stroke, 'backstroke' as Stroke], medicalEvidence: [], detailedExplanation: '척추 과신전을 피하고 중립 자세를 유지해야 합니다.' },
    butterfly: { level: 'avoid' as SafetyLevel, reason: '척추에 과도한 부담', allowedMovements: [], prohibitedMovements: ['나비영 전체 동작'], modifications: [], alternatives: ['freestyle' as Stroke, 'backstroke' as Stroke], medicalEvidence: [], detailedExplanation: '척추에 과도한 부담을 주므로 피해야 합니다.' },
    elementary_backstroke: { level: 'safe' as SafetyLevel, reason: '척추에 부담이 적은 안전한 영법', allowedMovements: ['기본 배영 팔 동작', '기본 배영 다리 동작'], prohibitedMovements: [], modifications: [], alternatives: ['freestyle' as Stroke, 'backstroke' as Stroke], medicalEvidence: [], detailedExplanation: '척추에 부담이 적은 가장 안전한 영법입니다.' },
    sidestroke: { level: 'safe' as SafetyLevel, reason: '척추에 부담이 적은 측영', allowedMovements: ['측영 팔 동작', '측영 다리 동작'], prohibitedMovements: [], modifications: [], alternatives: ['freestyle' as Stroke, 'backstroke' as Stroke], medicalEvidence: [], detailedExplanation: '척추에 부담이 적은 측영 자세입니다.' }
  }
};

export const allJointConditions: JointConditionGuidance[] = [
  {
    conditionId: 'lumbar_disc_herniation',
    conditionName: '허리 디스크',
    category: 'spine',
    severity: 'moderate',
    description: '허리 척추 사이의 디스크가 튀어나와 신경을 압박하는 질환',
    swimmingGuidance: {
      freestyle: { ...strokeTemplates.spine.freestyle, medicalEvidence: [EVIDENCE_BASED_SOURCES.HAYDEN_2005_COCHRANE] },
      backstroke: { ...strokeTemplates.spine.backstroke, medicalEvidence: [EVIDENCE_BASED_SOURCES.HAYDEN_2005_COCHRANE] },
      breaststroke: { ...strokeTemplates.spine.breaststroke, medicalEvidence: [EVIDENCE_BASED_SOURCES.HAYDEN_2005_COCHRANE] },
      butterfly: { ...strokeTemplates.spine.butterfly, medicalEvidence: [EVIDENCE_BASED_SOURCES.HAYDEN_2005_COCHRANE] },
      elementary_backstroke: { ...strokeTemplates.spine.elementary_backstroke, medicalEvidence: [EVIDENCE_BASED_SOURCES.HAYDEN_2005_COCHRANE] },
      sidestroke: { ...strokeTemplates.spine.sidestroke, medicalEvidence: [EVIDENCE_BASED_SOURCES.HAYDEN_2005_COCHRANE] }
    },
    exerciseRestrictions: {
      intensityReduction: 20,
      durationLimit: 45,
      frequencyLimit: 4,
      contraindicatedExercises: ['무거운 물건 들기', '급격한 회전 동작'],
      recommendedExercises: ['수중 걷기', '수중 스트레칭']
    }
  },
  {
    conditionId: 'cervical_disc_herniation',
    conditionName: '목 디스크',
    category: 'spine',
    severity: 'moderate',
    description: '목 척추 사이의 디스크가 튀어나와 신경을 압박하는 질환',
    swimmingGuidance: {
      freestyle: { ...strokeTemplates.spine.freestyle, medicalEvidence: [EVIDENCE_BASED_SOURCES.HAYDEN_2005_COCHRANE] },
      backstroke: { ...strokeTemplates.spine.backstroke, medicalEvidence: [EVIDENCE_BASED_SOURCES.HAYDEN_2005_COCHRANE] },
      breaststroke: { ...strokeTemplates.spine.breaststroke, medicalEvidence: [EVIDENCE_BASED_SOURCES.HAYDEN_2005_COCHRANE] },
      butterfly: { ...strokeTemplates.spine.butterfly, medicalEvidence: [EVIDENCE_BASED_SOURCES.HAYDEN_2005_COCHRANE] },
      elementary_backstroke: { ...strokeTemplates.spine.elementary_backstroke, medicalEvidence: [EVIDENCE_BASED_SOURCES.HAYDEN_2005_COCHRANE] },
      sidestroke: { ...strokeTemplates.spine.sidestroke, medicalEvidence: [EVIDENCE_BASED_SOURCES.HAYDEN_2005_COCHRANE] }
    },
    exerciseRestrictions: {
      intensityReduction: 25,
      durationLimit: 40,
      frequencyLimit: 3,
      contraindicatedExercises: ['목 과신전', '급격한 회전 동작'],
      recommendedExercises: ['수중 걷기', '수중 스트레칭']
    }
  },
  {
    conditionId: 'knee_osteoarthritis',
    conditionName: '무릎 관절염',
    category: 'knee',
    severity: 'moderate',
    description: '무릎 관절의 연골이 닳아서 생기는 관절염',
    swimmingGuidance: {
      freestyle: { level: 'safe' as SafetyLevel, reason: '무릎에 부담이 적음', allowedMovements: ['자유형 팔 동작', '자유형 다리 동작'], prohibitedMovements: [], modifications: [], alternatives: ['backstroke' as Stroke, 'elementary_backstroke' as Stroke], medicalEvidence: [EVIDENCE_BASED_SOURCES.BARTELS_2016_COCHRANE], detailedExplanation: '무릎에 부담이 적은 안전한 영법입니다.' },
      backstroke: { level: 'safe' as SafetyLevel, reason: '무릎에 부담이 적음', allowedMovements: ['배영 팔 동작', '배영 다리 동작'], prohibitedMovements: [], modifications: [], alternatives: ['freestyle' as Stroke, 'elementary_backstroke' as Stroke], medicalEvidence: [EVIDENCE_BASED_SOURCES.BARTELS_2016_COCHRANE], detailedExplanation: '무릎에 부담이 적은 안전한 영법입니다.' },
      breaststroke: { level: 'avoid' as SafetyLevel, reason: '무릎에 과도한 부담', allowedMovements: [], prohibitedMovements: ['평영 킥'], modifications: [], alternatives: ['freestyle' as Stroke, 'backstroke' as Stroke], medicalEvidence: [EVIDENCE_BASED_SOURCES.BARTELS_2016_COCHRANE], detailedExplanation: '무릎에 과도한 부담을 주므로 피해야 합니다.' },
      butterfly: { level: 'avoid' as SafetyLevel, reason: '무릎에 과도한 부담', allowedMovements: [], prohibitedMovements: ['나비영 다리 동작'], modifications: [], alternatives: ['freestyle' as Stroke, 'backstroke' as Stroke], medicalEvidence: [EVIDENCE_BASED_SOURCES.BARTELS_2016_COCHRANE], detailedExplanation: '무릎에 과도한 부담을 주므로 피해야 합니다.' },
      elementary_backstroke: { level: 'safe' as SafetyLevel, reason: '무릎에 부담이 적음', allowedMovements: ['기본 배영 팔 동작', '기본 배영 다리 동작'], prohibitedMovements: [], modifications: [], alternatives: ['freestyle' as Stroke, 'backstroke' as Stroke], medicalEvidence: [EVIDENCE_BASED_SOURCES.BARTELS_2016_COCHRANE], detailedExplanation: '무릎에 부담이 적은 안전한 영법입니다.' },
      sidestroke: { level: 'safe' as SafetyLevel, reason: '무릎에 부담이 적음', allowedMovements: ['측영 팔 동작', '측영 다리 동작'], prohibitedMovements: [], modifications: [], alternatives: ['freestyle' as Stroke, 'backstroke' as Stroke], medicalEvidence: [EVIDENCE_BASED_SOURCES.BARTELS_2016_COCHRANE], detailedExplanation: '무릎에 부담이 적은 안전한 영법입니다.' }
    },
    exerciseRestrictions: {
      intensityReduction: 30,
      durationLimit: 30,
      frequencyLimit: 3,
      contraindicatedExercises: ['무릎 굴곡 운동', '점프 동작'],
      recommendedExercises: ['수중 걷기', '수중 스트레칭']
    }
  },
  {
    conditionId: 'hip_osteoarthritis',
    conditionName: '고관절 관절염',
    category: 'hip',
    severity: 'moderate',
    description: '고관절의 연골이 닳아서 생기는 관절염',
    swimmingGuidance: {
      freestyle: { level: 'safe' as SafetyLevel, reason: '고관절에 부담이 적음', allowedMovements: ['자유형 팔 동작', '자유형 다리 동작'], prohibitedMovements: [], modifications: [], alternatives: ['backstroke' as Stroke, 'elementary_backstroke' as Stroke], medicalEvidence: [EVIDENCE_BASED_SOURCES.BARTELS_2016_COCHRANE], detailedExplanation: '고관절에 부담이 적은 안전한 영법입니다.' },
      backstroke: { level: 'safe' as SafetyLevel, reason: '고관절에 부담이 적음', allowedMovements: ['배영 팔 동작', '배영 다리 동작'], prohibitedMovements: [], modifications: [], alternatives: ['freestyle' as Stroke, 'elementary_backstroke' as Stroke], medicalEvidence: [EVIDENCE_BASED_SOURCES.BARTELS_2016_COCHRANE], detailedExplanation: '고관절에 부담이 적은 안전한 영법입니다.' },
      breaststroke: { level: 'caution' as SafetyLevel, reason: '고관절 외회전 부담', allowedMovements: ['평영 팔 동작'], prohibitedMovements: ['과도한 고관절 외회전'], modifications: ['킥 폭 축소'], alternatives: ['freestyle' as Stroke, 'backstroke' as Stroke], medicalEvidence: [EVIDENCE_BASED_SOURCES.BARTELS_2016_COCHRANE], detailedExplanation: '고관절 외회전을 피하고 킥 폭을 축소해야 합니다.' },
      butterfly: { level: 'avoid' as SafetyLevel, reason: '고관절에 과도한 부담', allowedMovements: [], prohibitedMovements: ['나비영 다리 동작'], modifications: [], alternatives: ['freestyle' as Stroke, 'backstroke' as Stroke], medicalEvidence: [EVIDENCE_BASED_SOURCES.BARTELS_2016_COCHRANE], detailedExplanation: '고관절에 과도한 부담을 주므로 피해야 합니다.' },
      elementary_backstroke: { level: 'safe' as SafetyLevel, reason: '고관절에 부담이 적음', allowedMovements: ['기본 배영 팔 동작', '기본 배영 다리 동작'], prohibitedMovements: [], modifications: [], alternatives: ['freestyle' as Stroke, 'backstroke' as Stroke], medicalEvidence: [EVIDENCE_BASED_SOURCES.BARTELS_2016_COCHRANE], detailedExplanation: '고관절에 부담이 적은 안전한 영법입니다.' },
      sidestroke: { level: 'safe' as SafetyLevel, reason: '고관절에 부담이 적음', allowedMovements: ['측영 팔 동작', '측영 다리 동작'], prohibitedMovements: [], modifications: [], alternatives: ['freestyle' as Stroke, 'backstroke' as Stroke], medicalEvidence: [EVIDENCE_BASED_SOURCES.BARTELS_2016_COCHRANE], detailedExplanation: '고관절에 부담이 적은 안전한 영법입니다.' }
    },
    exerciseRestrictions: {
      intensityReduction: 25,
      durationLimit: 35,
      frequencyLimit: 3,
      contraindicatedExercises: ['고관절 외회전 운동', '점프 동작'],
      recommendedExercises: ['수중 걷기', '수중 스트레칭']
    }
  },
  {
    conditionId: 'shoulder_impingement',
    conditionName: '어깨 충돌증후군',
    category: 'shoulder',
    severity: 'moderate',
    description: '어깨 관절에서 힘줄이 뼈에 눌려서 생기는 질환',
    swimmingGuidance: {
      freestyle: { level: 'caution' as SafetyLevel, reason: '어깨 과사용 위험', allowedMovements: ['자유형 다리 동작'], prohibitedMovements: ['과도한 팔 올리기'], modifications: ['팔 동작 범위 축소'], alternatives: ['backstroke' as Stroke, 'elementary_backstroke' as Stroke], medicalEvidence: [], detailedExplanation: '어깨 과사용을 피하고 팔 동작 범위를 축소해야 합니다.' },
      backstroke: { level: 'safe' as SafetyLevel, reason: '어깨에 부담이 적음', allowedMovements: ['배영 팔 동작', '배영 다리 동작'], prohibitedMovements: [], modifications: [], alternatives: ['freestyle' as Stroke, 'elementary_backstroke' as Stroke], medicalEvidence: [], detailedExplanation: '어깨에 부담이 적은 안전한 영법입니다.' },
      breaststroke: { level: 'safe' as SafetyLevel, reason: '어깨에 부담이 적음', allowedMovements: ['평영 팔 동작', '평영 다리 동작'], prohibitedMovements: [], modifications: [], alternatives: ['freestyle' as Stroke, 'backstroke' as Stroke], medicalEvidence: [], detailedExplanation: '어깨에 부담이 적은 안전한 영법입니다.' },
      butterfly: { level: 'avoid' as SafetyLevel, reason: '어깨에 과도한 부담', allowedMovements: [], prohibitedMovements: ['나비영 팔 동작'], modifications: [], alternatives: ['freestyle' as Stroke, 'backstroke' as Stroke], medicalEvidence: [], detailedExplanation: '어깨에 과도한 부담을 주므로 피해야 합니다.' },
      elementary_backstroke: { level: 'safe' as SafetyLevel, reason: '어깨에 부담이 적음', allowedMovements: ['기본 배영 팔 동작', '기본 배영 다리 동작'], prohibitedMovements: [], modifications: [], alternatives: ['freestyle' as Stroke, 'backstroke' as Stroke], medicalEvidence: [], detailedExplanation: '어깨에 부담이 적은 안전한 영법입니다.' },
      sidestroke: { level: 'safe' as SafetyLevel, reason: '어깨에 부담이 적음', allowedMovements: ['측영 팔 동작', '측영 다리 동작'], prohibitedMovements: [], modifications: [], alternatives: ['freestyle' as Stroke, 'backstroke' as Stroke], medicalEvidence: [], detailedExplanation: '어깨에 부담이 적은 안전한 영법입니다.' }
    },
    exerciseRestrictions: {
      intensityReduction: 35,
      durationLimit: 25,
      frequencyLimit: 2,
      contraindicatedExercises: ['어깨 과사용', '팔 올리기 운동'],
      recommendedExercises: ['수중 걷기', '수중 스트레칭']
    }
  },
  {
    conditionId: 'ankle_sprain',
    conditionName: '발목 염좌',
    category: 'ankle',
    severity: 'mild',
    description: '발목 인대가 늘어나거나 찢어지는 손상',
    swimmingGuidance: {
      freestyle: { level: 'safe' as SafetyLevel, reason: '발목에 부담이 적음', allowedMovements: ['자유형 팔 동작', '자유형 다리 동작'], prohibitedMovements: [], modifications: [], alternatives: ['backstroke' as Stroke, 'elementary_backstroke' as Stroke], medicalEvidence: [], detailedExplanation: '발목에 부담이 적은 안전한 영법입니다.' },
      backstroke: { level: 'safe' as SafetyLevel, reason: '발목에 부담이 적음', allowedMovements: ['배영 팔 동작', '배영 다리 동작'], prohibitedMovements: [], modifications: [], alternatives: ['freestyle' as Stroke, 'elementary_backstroke' as Stroke], medicalEvidence: [], detailedExplanation: '발목에 부담이 적은 안전한 영법입니다.' },
      breaststroke: { level: 'caution' as SafetyLevel, reason: '발목 외회전 부담', allowedMovements: ['평영 팔 동작'], prohibitedMovements: ['과도한 발목 외회전'], modifications: ['킥 폭 축소'], alternatives: ['freestyle' as Stroke, 'backstroke' as Stroke], medicalEvidence: [], detailedExplanation: '발목 외회전을 피하고 킥 폭을 축소해야 합니다.' },
      butterfly: { level: 'avoid' as SafetyLevel, reason: '발목에 과도한 부담', allowedMovements: [], prohibitedMovements: ['나비영 다리 동작'], modifications: [], alternatives: ['freestyle' as Stroke, 'backstroke' as Stroke], medicalEvidence: [], detailedExplanation: '발목에 과도한 부담을 주므로 피해야 합니다.' },
      elementary_backstroke: { level: 'safe' as SafetyLevel, reason: '발목에 부담이 적음', allowedMovements: ['기본 배영 팔 동작', '기본 배영 다리 동작'], prohibitedMovements: [], modifications: [], alternatives: ['freestyle' as Stroke, 'backstroke' as Stroke], medicalEvidence: [], detailedExplanation: '발목에 부담이 적은 안전한 영법입니다.' },
      sidestroke: { level: 'safe' as SafetyLevel, reason: '발목에 부담이 적음', allowedMovements: ['측영 팔 동작', '측영 다리 동작'], prohibitedMovements: [], modifications: [], alternatives: ['freestyle' as Stroke, 'backstroke' as Stroke], medicalEvidence: [], detailedExplanation: '발목에 부담이 적은 안전한 영법입니다.' }
    },
    exerciseRestrictions: {
      intensityReduction: 20,
      durationLimit: 30,
      frequencyLimit: 3,
      contraindicatedExercises: ['발목 외회전 운동', '점프 동작'],
      recommendedExercises: ['수중 걷기', '수중 스트레칭']
    }
  },
  {
    conditionId: 'tennis_elbow',
    conditionName: '테니스 엘보',
    category: 'elbow',
    severity: 'moderate',
    description: '팔꿈치 외측 상과의 힘줄에 생기는 염증',
    swimmingGuidance: {
      freestyle: { level: 'caution' as SafetyLevel, reason: '팔꿈치 과사용 위험', allowedMovements: ['자유형 다리 동작'], prohibitedMovements: ['과도한 팔 동작'], modifications: ['팔 동작 범위 축소'], alternatives: ['backstroke' as Stroke, 'elementary_backstroke' as Stroke], medicalEvidence: [], detailedExplanation: '팔꿈치 과사용을 피하고 팔 동작 범위를 축소해야 합니다.' },
      backstroke: { level: 'safe' as SafetyLevel, reason: '팔꿈치에 부담이 적음', allowedMovements: ['배영 팔 동작', '배영 다리 동작'], prohibitedMovements: [], modifications: [], alternatives: ['freestyle' as Stroke, 'elementary_backstroke' as Stroke], medicalEvidence: [], detailedExplanation: '팔꿈치에 부담이 적은 안전한 영법입니다.' },
      breaststroke: { level: 'safe' as SafetyLevel, reason: '팔꿈치에 부담이 적음', allowedMovements: ['평영 팔 동작', '평영 다리 동작'], prohibitedMovements: [], modifications: [], alternatives: ['freestyle' as Stroke, 'backstroke' as Stroke], medicalEvidence: [], detailedExplanation: '팔꿈치에 부담이 적은 안전한 영법입니다.' },
      butterfly: { level: 'avoid' as SafetyLevel, reason: '팔꿈치에 과도한 부담', allowedMovements: [], prohibitedMovements: ['나비영 팔 동작'], modifications: [], alternatives: ['freestyle' as Stroke, 'backstroke' as Stroke], medicalEvidence: [], detailedExplanation: '팔꿈치에 과도한 부담을 주므로 피해야 합니다.' },
      elementary_backstroke: { level: 'safe' as SafetyLevel, reason: '팔꿈치에 부담이 적음', allowedMovements: ['기본 배영 팔 동작', '기본 배영 다리 동작'], prohibitedMovements: [], modifications: [], alternatives: ['freestyle' as Stroke, 'backstroke' as Stroke], medicalEvidence: [], detailedExplanation: '팔꿈치에 부담이 적은 안전한 영법입니다.' },
      sidestroke: { level: 'safe' as SafetyLevel, reason: '팔꿈치에 부담이 적음', allowedMovements: ['측영 팔 동작', '측영 다리 동작'], prohibitedMovements: [], modifications: [], alternatives: ['freestyle' as Stroke, 'backstroke' as Stroke], medicalEvidence: [], detailedExplanation: '팔꿈치에 부담이 적은 안전한 영법입니다.' }
    },
    exerciseRestrictions: {
      intensityReduction: 30,
      durationLimit: 25,
      frequencyLimit: 2,
      contraindicatedExercises: ['팔꿈치 과사용', '그립 운동'],
      recommendedExercises: ['수중 걷기', '수중 스트레칭']
    }
  },
  {
    conditionId: 'golfers_elbow',
    conditionName: '골프 엘보',
    category: 'elbow',
    severity: 'moderate',
    description: '팔꿈치 내측 상과의 힘줄에 생기는 염증',
    swimmingGuidance: {
      freestyle: { level: 'caution' as SafetyLevel, reason: '팔꿈치 과사용 위험', allowedMovements: ['자유형 다리 동작'], prohibitedMovements: ['과도한 팔 동작'], modifications: ['팔 동작 범위 축소'], alternatives: ['backstroke' as Stroke, 'elementary_backstroke' as Stroke], medicalEvidence: [], detailedExplanation: '팔꿈치 과사용을 피하고 팔 동작 범위를 축소해야 합니다.' },
      backstroke: { level: 'safe' as SafetyLevel, reason: '팔꿈치에 부담이 적음', allowedMovements: ['배영 팔 동작', '배영 다리 동작'], prohibitedMovements: [], modifications: [], alternatives: ['freestyle' as Stroke, 'elementary_backstroke' as Stroke], medicalEvidence: [], detailedExplanation: '팔꿈치에 부담이 적은 안전한 영법입니다.' },
      breaststroke: { level: 'safe' as SafetyLevel, reason: '팔꿈치에 부담이 적음', allowedMovements: ['평영 팔 동작', '평영 다리 동작'], prohibitedMovements: [], modifications: [], alternatives: ['freestyle' as Stroke, 'backstroke' as Stroke], medicalEvidence: [], detailedExplanation: '팔꿈치에 부담이 적은 안전한 영법입니다.' },
      butterfly: { level: 'avoid' as SafetyLevel, reason: '팔꿈치에 과도한 부담', allowedMovements: [], prohibitedMovements: ['나비영 팔 동작'], modifications: [], alternatives: ['freestyle' as Stroke, 'backstroke' as Stroke], medicalEvidence: [], detailedExplanation: '팔꿈치에 과도한 부담을 주므로 피해야 합니다.' },
      elementary_backstroke: { level: 'safe' as SafetyLevel, reason: '팔꿈치에 부담이 적음', allowedMovements: ['기본 배영 팔 동작', '기본 배영 다리 동작'], prohibitedMovements: [], modifications: [], alternatives: ['freestyle' as Stroke, 'backstroke' as Stroke], medicalEvidence: [], detailedExplanation: '팔꿈치에 부담이 적은 안전한 영법입니다.' },
      sidestroke: { level: 'safe' as SafetyLevel, reason: '팔꿈치에 부담이 적음', allowedMovements: ['측영 팔 동작', '측영 다리 동작'], prohibitedMovements: [], modifications: [], alternatives: ['freestyle' as Stroke, 'backstroke' as Stroke], medicalEvidence: [], detailedExplanation: '팔꿈치에 부담이 적은 안전한 영법입니다.' }
    },
    exerciseRestrictions: {
      intensityReduction: 30,
      durationLimit: 25,
      frequencyLimit: 2,
      contraindicatedExercises: ['팔꿈치 과사용', '그립 운동'],
      recommendedExercises: ['수중 걷기', '수중 스트레칭']
    }
  },
  {
    conditionId: 'wrist_carpal_tunnel',
    conditionName: '손목 터널증후군',
    category: 'wrist',
    severity: 'moderate',
    description: '손목의 정중신경이 압박되어 생기는 질환',
    swimmingGuidance: {
      freestyle: { level: 'caution' as SafetyLevel, reason: '손목 과사용 위험', allowedMovements: ['자유형 다리 동작'], prohibitedMovements: ['과도한 손목 굴곡'], modifications: ['손목 중립 자세 유지'], alternatives: ['backstroke' as Stroke, 'elementary_backstroke' as Stroke], medicalEvidence: [], detailedExplanation: '손목 과사용을 피하고 중립 자세를 유지해야 합니다.' },
      backstroke: { level: 'safe' as SafetyLevel, reason: '손목에 부담이 적음', allowedMovements: ['배영 팔 동작', '배영 다리 동작'], prohibitedMovements: [], modifications: [], alternatives: ['freestyle' as Stroke, 'elementary_backstroke' as Stroke], medicalEvidence: [], detailedExplanation: '손목에 부담이 적은 안전한 영법입니다.' },
      breaststroke: { level: 'safe' as SafetyLevel, reason: '손목에 부담이 적음', allowedMovements: ['평영 팔 동작', '평영 다리 동작'], prohibitedMovements: [], modifications: [], alternatives: ['freestyle' as Stroke, 'backstroke' as Stroke], medicalEvidence: [], detailedExplanation: '손목에 부담이 적은 안전한 영법입니다.' },
      butterfly: { level: 'avoid' as SafetyLevel, reason: '손목에 과도한 부담', allowedMovements: [], prohibitedMovements: ['나비영 팔 동작'], modifications: [], alternatives: ['freestyle' as Stroke, 'backstroke' as Stroke], medicalEvidence: [], detailedExplanation: '손목에 과도한 부담을 주므로 피해야 합니다.' },
      elementary_backstroke: { level: 'safe' as SafetyLevel, reason: '손목에 부담이 적음', allowedMovements: ['기본 배영 팔 동작', '기본 배영 다리 동작'], prohibitedMovements: [], modifications: [], alternatives: ['freestyle' as Stroke, 'backstroke' as Stroke], medicalEvidence: [], detailedExplanation: '손목에 부담이 적은 안전한 영법입니다.' },
      sidestroke: { level: 'safe' as SafetyLevel, reason: '손목에 부담이 적음', allowedMovements: ['측영 팔 동작', '측영 다리 동작'], prohibitedMovements: [], modifications: [], alternatives: ['freestyle' as Stroke, 'backstroke' as Stroke], medicalEvidence: [], detailedExplanation: '손목에 부담이 적은 안전한 영법입니다.' }
    },
    exerciseRestrictions: {
      intensityReduction: 25,
      durationLimit: 30,
      frequencyLimit: 3,
      contraindicatedExercises: ['손목 과사용', '그립 운동'],
      recommendedExercises: ['수중 걷기', '수중 스트레칭']
    }
  },
  {
    conditionId: 'rotator_cuff_tear',
    conditionName: '회전근개 파열',
    category: 'shoulder',
    severity: 'severe',
    description: '어깨의 회전근개 힘줄이 찢어지는 질환',
    swimmingGuidance: {
      freestyle: { level: 'avoid' as SafetyLevel, reason: '어깨에 과도한 부담', allowedMovements: [], prohibitedMovements: ['자유형 팔 동작'], modifications: [], alternatives: ['backstroke' as Stroke, 'elementary_backstroke' as Stroke], medicalEvidence: [], detailedExplanation: '어깨에 과도한 부담을 주므로 피해야 합니다.' },
      backstroke: { level: 'caution' as SafetyLevel, reason: '어깨 과사용 위험', allowedMovements: ['배영 다리 동작'], prohibitedMovements: ['과도한 팔 올리기'], modifications: ['팔 동작 범위 축소'], alternatives: ['freestyle' as Stroke, 'elementary_backstroke' as Stroke], medicalEvidence: [], detailedExplanation: '어깨 과사용을 피하고 팔 동작 범위를 축소해야 합니다.' },
      breaststroke: { level: 'safe' as SafetyLevel, reason: '어깨에 부담이 적음', allowedMovements: ['평영 팔 동작', '평영 다리 동작'], prohibitedMovements: [], modifications: [], alternatives: ['freestyle' as Stroke, 'backstroke' as Stroke], medicalEvidence: [], detailedExplanation: '어깨에 부담이 적은 안전한 영법입니다.' },
      butterfly: { level: 'avoid' as SafetyLevel, reason: '어깨에 과도한 부담', allowedMovements: [], prohibitedMovements: ['나비영 팔 동작'], modifications: [], alternatives: ['freestyle' as Stroke, 'backstroke' as Stroke], medicalEvidence: [], detailedExplanation: '어깨에 과도한 부담을 주므로 피해야 합니다.' },
      elementary_backstroke: { level: 'safe' as SafetyLevel, reason: '어깨에 부담이 적음', allowedMovements: ['기본 배영 팔 동작', '기본 배영 다리 동작'], prohibitedMovements: [], modifications: [], alternatives: ['freestyle' as Stroke, 'backstroke' as Stroke], medicalEvidence: [], detailedExplanation: '어깨에 부담이 적은 안전한 영법입니다.' },
      sidestroke: { level: 'safe' as SafetyLevel, reason: '어깨에 부담이 적음', allowedMovements: ['측영 팔 동작', '측영 다리 동작'], prohibitedMovements: [], modifications: [], alternatives: ['freestyle' as Stroke, 'backstroke' as Stroke], medicalEvidence: [], detailedExplanation: '어깨에 부담이 적은 안전한 영법입니다.' }
    },
    exerciseRestrictions: {
      intensityReduction: 50,
      durationLimit: 20,
      frequencyLimit: 2,
      contraindicatedExercises: ['어깨 과사용', '팔 올리기 운동'],
      recommendedExercises: ['수중 걷기', '수중 스트레칭']
    }
  }
];








