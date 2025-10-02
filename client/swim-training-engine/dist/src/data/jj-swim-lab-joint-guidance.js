export const EVIDENCE_BASED_SOURCES = {
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
        freestyle: { level: 'safe', reason: '척추에 부담이 적은 수평 자세', allowedMovements: ['자유형 팔 동작', '자유형 다리 동작'], prohibitedMovements: [], modifications: [], alternatives: ['backstroke', 'elementary_backstroke'], medicalEvidence: [], detailedExplanation: '척추에 부담이 적은 수평 자세로 안전하게 수영할 수 있습니다.' },
        backstroke: { level: 'safe', reason: '척추 신전에 도움', allowedMovements: ['배영 팔 동작', '배영 다리 동작'], prohibitedMovements: [], modifications: [], alternatives: ['freestyle', 'elementary_backstroke'], medicalEvidence: [], detailedExplanation: '척추 신전에 도움이 되는 자세입니다.' },
        breaststroke: { level: 'caution', reason: '척추 과신전 위험', allowedMovements: ['평영 팔 동작'], prohibitedMovements: ['과도한 척추 신전'], modifications: ['척추 중립 자세 유지', '킥 폭 축소'], alternatives: ['freestyle', 'backstroke'], medicalEvidence: [], detailedExplanation: '척추 과신전을 피하고 중립 자세를 유지해야 합니다.' },
        butterfly: { level: 'avoid', reason: '척추에 과도한 부담', allowedMovements: [], prohibitedMovements: ['나비영 전체 동작'], modifications: [], alternatives: ['freestyle', 'backstroke'], medicalEvidence: [], detailedExplanation: '척추에 과도한 부담을 주므로 피해야 합니다.' },
        elementary_backstroke: { level: 'safe', reason: '척추에 부담이 적은 안전한 영법', allowedMovements: ['기본 배영 팔 동작', '기본 배영 다리 동작'], prohibitedMovements: [], modifications: [], alternatives: ['freestyle', 'backstroke'], medicalEvidence: [], detailedExplanation: '척추에 부담이 적은 가장 안전한 영법입니다.' },
        sidestroke: { level: 'safe', reason: '척추에 부담이 적은 측영', allowedMovements: ['측영 팔 동작', '측영 다리 동작'], prohibitedMovements: [], modifications: [], alternatives: ['freestyle', 'backstroke'], medicalEvidence: [], detailedExplanation: '척추에 부담이 적은 측영 자세입니다.' }
    }
};
export const allJointConditions = [
    {
        conditionId: 'lumbar_disc_herniation',
        conditionName: '허리 디스크',
        category: 'spine',
        severity: 'moderate',
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
    }
];
//# sourceMappingURL=jj-swim-lab-joint-guidance.js.map