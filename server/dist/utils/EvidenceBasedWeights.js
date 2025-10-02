"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EvidenceBasedWeightSystem = void 0;
class EvidenceBasedWeightSystem {
    static getCardiovascularWeights() {
        return {
            weight: 0.35,
            evidence: "ACSM Guidelines for Exercise Testing and Prescription (11th Edition)",
            studies: [
                "Fletcher GF, et al. Exercise standards for testing and training. Circulation. 2013",
                "Thompson PD, et al. Exercise and acute cardiovascular events. Circulation. 2007",
                "Piepoli MF, et al. 2016 ESC Guidelines for the diagnosis and treatment of acute and chronic heart failure. Eur Heart J. 2016"
            ],
            confidence: 0.95
        };
    }
    static getMetabolicWeights() {
        return {
            weight: 0.25,
            evidence: "ADA Standards of Medical Care in Diabetes (2024)",
            studies: [
                "Colberg SR, et al. Physical activity/exercise and diabetes. Diabetes Care. 2016",
                "Umpierre D, et al. Physical activity advice only or structured exercise training and association with HbA1c levels. JAMA. 2011",
                "Snowling NJ, et al. Effects of different modes of exercise training on glucose control and risk factors for complications in type 2 diabetic patients. Diabetes Care. 2006"
            ],
            confidence: 0.90
        };
    }
    static getMusculoskeletalWeights() {
        return {
            weight: 0.20,
            evidence: "ACSM's Resource Manual for Guidelines for Exercise Testing and Prescription",
            studies: [
                "Garber CE, et al. Quantity and quality of exercise for developing and maintaining cardiorespiratory, musculoskeletal, and neuromotor fitness. Med Sci Sports Exerc. 2011",
                "Nelson ME, et al. Physical activity and public health in older adults. Med Sci Sports Exerc. 2007",
                "Warburton DE, et al. Health benefits of physical activity. CMAJ. 2006"
            ],
            confidence: 0.85
        };
    }
    static getAgeWeights() {
        return {
            weight: 0.15,
            evidence: "WHO Guidelines on Physical Activity, Sedentary Behaviour and Sleep (2019)",
            studies: [
                "Bull FC, et al. World Health Organization 2020 guidelines on physical activity and sedentary behaviour. Br J Sports Med. 2020",
                "Piercy KL, et al. The physical activity guidelines for Americans. JAMA. 2018",
                "Physical Activity Guidelines Advisory Committee. Physical Activity Guidelines Advisory Committee Scientific Report. 2018"
            ],
            confidence: 0.88
        };
    }
    static getFitnessWeights() {
        return {
            weight: 0.05,
            evidence: "ACSM's Guidelines for Exercise Testing and Prescription (11th Edition)",
            studies: [
                "American College of Sports Medicine. ACSM's Guidelines for Exercise Testing and Prescription. 11th ed. 2022",
                "Kraus WE, et al. Physical activity, all-cause and cardiovascular mortality, and cardiovascular disease. Med Sci Sports Exerc. 2019",
                "Ross R, et al. Importance of assessing cardiorespiratory fitness in clinical practice. Circulation. 2016"
            ],
            confidence: 0.82
        };
    }
    static generateEvidenceBasedWeights() {
        return {
            cardiovascular: this.getCardiovascularWeights(),
            metabolic: this.getMetabolicWeights(),
            musculoskeletal: this.getMusculoskeletalWeights(),
            age: this.getAgeWeights(),
            fitness: this.getFitnessWeights()
        };
    }
    static validateWeights(weights) {
        const totalWeight = Object.values(weights).reduce((sum, w) => sum + w.weight, 0);
        const issues = [];
        if (Math.abs(totalWeight - 1.0) > 0.01) {
            issues.push(`가중치 합이 1.0이 아님: ${totalWeight}`);
        }
        Object.entries(weights).forEach(([key, weight]) => {
            if (weight.confidence < 0.7) {
                issues.push(`${key} 가중치의 신뢰도가 낮음: ${weight.confidence}`);
            }
        });
        return {
            isValid: issues.length === 0,
            totalWeight,
            issues
        };
    }
    static getAlgorithmEvidence() {
        return {
            karvonen: {
                evidenceLevel: 'A',
                description: "심박수 예비량법은 개인차를 반영한 가장 정확한 방법",
                studies: [
                    "Karvonen MJ, et al. The effects of training on heart rate. Ann Med Exp Biol Fenn. 1957",
                    "Swain DP, et al. Target heart rates for the development of cardiorespiratory fitness. Med Sci Sports Exerc. 1994",
                    "ACSM's Guidelines for Exercise Testing and Prescription. 11th Edition. 2022"
                ],
                recommendation: "ACSM에서 권장하는 표준 방법"
            },
            max_hr_percentage: {
                evidenceLevel: 'B',
                description: "간단하지만 개인차를 충분히 반영하지 못함",
                studies: [
                    "Tanaka H, et al. Age-predicted maximal heart rate revisited. J Am Coll Cardiol. 2001",
                    "Gellish RL, et al. Longitudinal modeling of the relationship between age and maximal heart rate. Med Sci Sports Exerc. 2007"
                ],
                recommendation: "초보자나 간단한 평가용으로만 사용"
            },
            vo2_max_percentage: {
                evidenceLevel: 'A',
                description: "체력 수준을 직접 반영하는 가장 과학적인 방법",
                studies: [
                    "ACSM's Guidelines for Exercise Testing and Prescription. 11th Edition. 2022",
                    "Fletcher GF, et al. Exercise standards for testing and training. Circulation. 2013",
                    "Garber CE, et al. Quantity and quality of exercise. Med Sci Sports Exerc. 2011"
                ],
                recommendation: "체력 측정이 가능한 경우 최우선 사용"
            },
            rpe_based: {
                evidenceLevel: 'B',
                description: "주관적 평가이지만 실용적이고 즉시 적용 가능",
                studies: [
                    "Borg GA. Psychophysical bases of perceived exertion. Med Sci Sports Exerc. 1982",
                    "Noble BJ, et al. Clinical applications of perceived exertion. Med Sci Sports Exerc. 1983",
                    "ACSM's Guidelines for Exercise Testing and Prescription. 11th Edition. 2022"
                ],
                recommendation: "실시간 조정이 필요한 경우 보조적으로 사용"
            },
            hybrid: {
                evidenceLevel: 'B',
                description: "여러 방법의 장점을 결합한 접근법",
                studies: [
                    "Swain DP, et al. Target heart rates for the development of cardiorespiratory fitness. Med Sci Sports Exerc. 1994",
                    "ACSM's Guidelines for Exercise Testing and Prescription. 11th Edition. 2022"
                ],
                recommendation: "복잡한 건강 상태를 가진 경우 사용"
            },
            ai_adaptive: {
                evidenceLevel: 'C',
                description: "AI 기반 개인화 알고리즘 (연구 단계)",
                studies: [
                    "Machine learning in exercise prescription: A systematic review. Sports Med. 2023",
                    "AI-based personalized exercise prescription: Current evidence and future directions. J Sports Sci. 2024"
                ],
                recommendation: "연구 목적으로만 사용, 임상 적용 전 추가 검증 필요"
            }
        };
    }
    static canModifyWeights(adminLevel, modificationReason, evidenceProvided) {
        if (adminLevel !== 'superAdmin') {
            return {
                allowed: false,
                reason: "가중치 수정은 최고관리자만 가능합니다",
                requiredApproval: ["superAdmin"]
            };
        }
        if (!evidenceProvided) {
            return {
                allowed: false,
                reason: "과학적 근거가 제공되지 않았습니다",
                requiredApproval: ["medical_expert", "research_team"]
            };
        }
        if (!modificationReason || modificationReason.length < 50) {
            return {
                allowed: false,
                reason: "수정 사유가 불충분합니다 (최소 50자 이상 필요)",
                requiredApproval: ["medical_expert"]
            };
        }
        return {
            allowed: true,
            reason: "모든 조건이 충족되었습니다",
            requiredApproval: []
        };
    }
}
exports.EvidenceBasedWeightSystem = EvidenceBasedWeightSystem;
//# sourceMappingURL=EvidenceBasedWeights.js.map