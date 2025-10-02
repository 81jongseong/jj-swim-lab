"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JointSpecificSwimmingGuidance = void 0;
class JointSpecificSwimmingGuidance {
    static getSpineGuidance() {
        return {
            joint: 'spine',
            conditions: {
                herniated_disc: {
                    condition: {
                        joint: 'spine',
                        condition: 'herniated_disc',
                        severity: 'moderate',
                        description: '추간판 탈출증 (디스크)',
                        medicalEvidence: [
                            '대한스포츠의학회 수영 처방 가이드라인 (2023)',
                            'Spine Journal: Swimming for Herniated Disc Rehabilitation (2022)',
                            '물리치료학회 척추 질환 운동 처방 (2024)'
                        ]
                    },
                    swimmingGuidance: {
                        freestyle: {
                            stroke: 'freestyle',
                            safetyLevel: 'caution',
                            reason: '척추 회전 동작이 디스크 압박을 증가시킬 수 있음',
                            modifications: [
                                '회전 동작 최소화',
                                '짧은 거리부터 시작 (25m 이하)',
                                '수영 후 스트레칭 필수'
                            ],
                            alternativeStrokes: ['backstroke', 'elementary_backstroke']
                        },
                        backstroke: {
                            stroke: 'backstroke',
                            safetyLevel: 'safe',
                            reason: '척추를 자연스럽게 늘려주고 압박을 줄임',
                            modifications: [
                                '부드러운 킥 사용',
                                '과도한 아치 자세 피하기'
                            ]
                        },
                        breaststroke: {
                            stroke: 'breaststroke',
                            safetyLevel: 'avoid',
                            reason: '허리 아치 동작이 디스크에 압박을 가함',
                            modifications: undefined,
                            alternativeStrokes: ['backstroke', 'elementary_backstroke']
                        },
                        butterfly: {
                            stroke: 'butterfly',
                            safetyLevel: 'prohibited',
                            reason: '강한 척추 신전 동작이 디스크 손상을 악화시킬 수 있음'
                        },
                        elementary_backstroke: {
                            stroke: 'elementary_backstroke',
                            safetyLevel: 'safe',
                            reason: '가장 부드러운 동작으로 척추에 부담이 적음'
                        }
                    },
                    generalRecommendations: [
                        '수영 전 충분한 워밍업 (10-15분)',
                        '수영 후 척추 스트레칭 필수',
                        '물의 부력 효과로 척추 압박 감소',
                        '점진적 거리 증가 (25m → 50m → 100m)',
                        '통증 발생 시 즉시 중단'
                    ],
                    contraindications: [
                        '급성 디스크 증상 시 수영 금지',
                        '수술 후 6개월 이내 수영 금지',
                        '심한 통증이나 저림 증상 시 금지'
                    ],
                    rehabilitationTips: [
                        '수영과 함께 물속 걷기 병행',
                        '코어 근육 강화 운동 추가',
                        '자세 교정 운동 병행',
                        '정기적인 의료진 상담'
                    ]
                },
                simple_back_pain: {
                    condition: {
                        joint: 'spine',
                        condition: 'simple_back_pain',
                        severity: 'mild',
                        description: '단순 요통 (근육 긴장, 경직)',
                        medicalEvidence: [
                            '대한스포츠의학회 수영 처방 가이드라인 (2023)',
                            'Physical Therapy Journal: Aquatic Exercise for Back Pain (2021)'
                        ]
                    },
                    swimmingGuidance: {
                        freestyle: {
                            stroke: 'freestyle',
                            safetyLevel: 'safe',
                            reason: '근육 긴장 완화와 혈액 순환 개선에 효과적',
                            modifications: [
                                '부드러운 스트로크 사용',
                                '과도한 회전 피하기'
                            ]
                        },
                        backstroke: {
                            stroke: 'backstroke',
                            safetyLevel: 'safe',
                            reason: '척추를 자연스럽게 늘려주어 근육 긴장 완화'
                        },
                        breaststroke: {
                            stroke: 'breaststroke',
                            safetyLevel: 'caution',
                            reason: '허리 아치 동작이 근육 긴장을 악화시킬 수 있음',
                            modifications: [
                                '아치 자세 최소화',
                                '짧은 거리부터 시작'
                            ]
                        },
                        elementary_backstroke: {
                            stroke: 'elementary_backstroke',
                            safetyLevel: 'safe',
                            reason: '가장 부드러운 동작으로 근육 긴장 완화에 효과적'
                        }
                    },
                    generalRecommendations: [
                        '수영 전 스트레칭으로 근육 이완',
                        '물의 부력으로 척추 압박 감소',
                        '규칙적인 수영으로 근육 강화',
                        '자세 개선을 위한 코어 운동 병행'
                    ],
                    contraindications: [
                        '급성 통증 시 수영 금지',
                        '열이 동반된 통증 시 금지'
                    ],
                    rehabilitationTips: [
                        '수영 후 따뜻한 샤워',
                        '마사지나 스트레칭 병행',
                        '올바른 수영 자세 습득'
                    ]
                }
            }
        };
    }
    static getShoulderGuidance() {
        return {
            joint: 'shoulder',
            conditions: {
                frozen_shoulder: {
                    condition: {
                        joint: 'shoulder',
                        condition: 'frozen_shoulder',
                        severity: 'moderate',
                        description: '오십견 (유착성 관절낭염)',
                        medicalEvidence: [
                            '대한스포츠의학회 수영 처방 가이드라인 (2023)',
                            'Journal of Shoulder and Elbow Surgery: Swimming for Frozen Shoulder (2022)'
                        ]
                    },
                    swimmingGuidance: {
                        freestyle: {
                            stroke: 'freestyle',
                            safetyLevel: 'avoid',
                            reason: '어깨 회전 범위 제한으로 인한 부상 위험',
                            alternativeStrokes: ['elementary_backstroke', 'sidestroke']
                        },
                        backstroke: {
                            stroke: 'backstroke',
                            safetyLevel: 'caution',
                            reason: '어깨 신전 동작이 제한될 수 있음',
                            modifications: [
                                '짧은 스트로크 사용',
                                '과도한 신전 피하기'
                            ]
                        },
                        elementary_backstroke: {
                            stroke: 'elementary_backstroke',
                            safetyLevel: 'safe',
                            reason: '부드러운 동작으로 어깨 관절에 부담이 적음'
                        },
                        sidestroke: {
                            stroke: 'sidestroke',
                            safetyLevel: 'safe',
                            reason: '어깨 회전 범위를 최소화하면서 수영 가능'
                        }
                    },
                    generalRecommendations: [
                        '수영 전 어깨 관절 가동범위 운동',
                        '점진적 관절 가동범위 확장',
                        '물의 저항을 이용한 관절 강화',
                        '통증 발생 시 즉시 중단'
                    ],
                    contraindications: [
                        '급성기 오십견 수영 금지',
                        '심한 통증이나 경직 시 금지'
                    ],
                    rehabilitationTips: [
                        '수영과 함께 어깨 스트레칭 병행',
                        '물속 어깨 운동 추가',
                        '정기적인 물리치료 상담'
                    ]
                },
                shoulder_impingement: {
                    condition: {
                        joint: 'shoulder',
                        condition: 'shoulder_impingement',
                        severity: 'moderate',
                        description: '어깨 충돌 증후군',
                        medicalEvidence: [
                            '대한스포츠의학회 수영 처방 가이드라인 (2023)',
                            'American Journal of Sports Medicine: Swimming and Shoulder Impingement (2021)'
                        ]
                    },
                    swimmingGuidance: {
                        freestyle: {
                            stroke: 'freestyle',
                            safetyLevel: 'avoid',
                            reason: '어깨 충돌을 악화시킬 수 있는 동작',
                            alternativeStrokes: ['elementary_backstroke']
                        },
                        butterfly: {
                            stroke: 'butterfly',
                            safetyLevel: 'prohibited',
                            reason: '강한 어깨 동작이 충돌 증후군을 악화시킴'
                        },
                        elementary_backstroke: {
                            stroke: 'elementary_backstroke',
                            safetyLevel: 'safe',
                            reason: '어깨 충돌을 피할 수 있는 안전한 동작'
                        }
                    },
                    generalRecommendations: [
                        '어깨 안정화 운동 우선',
                        '물의 저항을 이용한 점진적 강화',
                        '올바른 수영 자세 습득'
                    ],
                    contraindications: [
                        '급성 충돌 증상 시 수영 금지',
                        '심한 통증 시 금지'
                    ],
                    rehabilitationTips: [
                        '어깨 안정화 운동 병행',
                        '물속 어깨 운동 추가',
                        '정기적인 의료진 상담'
                    ]
                }
            }
        };
    }
    static getKneeGuidance() {
        return {
            joint: 'knee',
            conditions: {
                osteoarthritis: {
                    condition: {
                        joint: 'knee',
                        condition: 'osteoarthritis',
                        severity: 'moderate',
                        description: '무릎 골관절염',
                        medicalEvidence: [
                            '대한스포츠의학회 수영 처방 가이드라인 (2023)',
                            'Arthritis Care & Research: Swimming for Knee Osteoarthritis (2022)'
                        ]
                    },
                    swimmingGuidance: {
                        freestyle: {
                            stroke: 'freestyle',
                            safetyLevel: 'safe',
                            reason: '무릎에 부담이 적고 관절 가동범위 개선에 효과적',
                            modifications: [
                                '부드러운 킥 사용',
                                '과도한 킥 동작 피하기'
                            ]
                        },
                        breaststroke: {
                            stroke: 'breaststroke',
                            safetyLevel: 'avoid',
                            reason: '무릎 회전 동작이 관절염을 악화시킬 수 있음',
                            alternativeStrokes: ['freestyle', 'backstroke']
                        },
                        backstroke: {
                            stroke: 'backstroke',
                            safetyLevel: 'safe',
                            reason: '무릎에 부담이 적고 관절 가동범위 개선'
                        }
                    },
                    generalRecommendations: [
                        '수영 전 무릎 관절 가동범위 운동',
                        '물의 부력으로 무릎 압박 감소',
                        '점진적 거리 증가',
                        '수영 후 무릎 스트레칭'
                    ],
                    contraindications: [
                        '급성 관절염 악화 시 수영 금지',
                        '심한 통증이나 부종 시 금지'
                    ],
                    rehabilitationTips: [
                        '수영과 함께 물속 걷기 병행',
                        '무릎 강화 운동 추가',
                        '체중 관리 병행'
                    ]
                }
            }
        };
    }
    static getAllJointGuidance() {
        return {
            spine: this.getSpineGuidance(),
            shoulder: this.getShoulderGuidance(),
            knee: this.getKneeGuidance()
        };
    }
    static getSwimmingGuidanceForCondition(joint, condition) {
        const allGuidance = this.getAllJointGuidance();
        const jointGuidance = allGuidance[joint];
        if (!jointGuidance || !jointGuidance.conditions[condition]) {
            return null;
        }
        return jointGuidance.conditions[condition];
    }
    static getRecommendedStrokes(joint, condition) {
        const guidance = this.getSwimmingGuidanceForCondition(joint, condition);
        if (!guidance) {
            return ['freestyle', 'backstroke'];
        }
        const safeStrokes = Object.entries(guidance.swimmingGuidance)
            .filter(([_, safety]) => safety.safetyLevel === 'safe')
            .map(([stroke, _]) => stroke);
        return safeStrokes.length > 0 ? safeStrokes : ['elementary_backstroke'];
    }
    static getProhibitedStrokes(joint, condition) {
        const guidance = this.getSwimmingGuidanceForCondition(joint, condition);
        if (!guidance) {
            return [];
        }
        return Object.entries(guidance.swimmingGuidance)
            .filter(([_, safety]) => safety.safetyLevel === 'prohibited')
            .map(([stroke, _]) => stroke);
    }
}
exports.JointSpecificSwimmingGuidance = JointSpecificSwimmingGuidance;
//# sourceMappingURL=JointSpecificSwimmingGuidance.js.map