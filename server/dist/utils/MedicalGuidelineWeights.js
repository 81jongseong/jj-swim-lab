"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MedicalGuidelineWeights = void 0;
class MedicalGuidelineWeights {
    static assessCardiovascularRisk(factors) {
        let riskScore = 0;
        const riskFactors = [];
        if (factors.gender === 'male' && factors.age >= 45) {
            riskScore += 1;
            riskFactors.push('고령 남성 (≥45세)');
        }
        else if (factors.gender === 'female' && factors.age >= 55) {
            riskScore += 1;
            riskFactors.push('고령 여성 (≥55세)');
        }
        if (factors.familyHistory.some(h => h.includes('심장병') || h.includes('심근경색') || h.includes('관상동맥'))) {
            riskScore += 1;
            riskFactors.push('심혈관 질환 가족력');
        }
        if (factors.smokingStatus === 'current') {
            riskScore += 1;
            riskFactors.push('현재 흡연');
        }
        if (factors.systolicBP >= 140 || factors.diastolicBP >= 90) {
            riskScore += 1;
            riskFactors.push('고혈압');
        }
        if (factors.cholesterol && factors.cholesterol >= 200) {
            riskScore += 1;
            riskFactors.push('이상지질혈증');
        }
        if (factors.bloodSugar >= 126) {
            riskScore += 1;
            riskFactors.push('당뇨병');
        }
        if (factors.bmi >= 30) {
            riskScore += 1;
            riskFactors.push('비만');
        }
        let riskLevel;
        if (riskScore === 0) {
            riskLevel = 'low';
        }
        else if (riskScore <= 2) {
            riskLevel = 'moderate';
        }
        else {
            riskLevel = 'high';
        }
        return { riskLevel, riskScore, riskFactors };
    }
    static assessMetabolicRisk(factors) {
        let riskScore = 0;
        const riskFactors = [];
        if (factors.bloodSugar >= 126) {
            riskScore += 3;
            riskFactors.push('당뇨병 (공복혈당 ≥126 mg/dL)');
        }
        else if (factors.bloodSugar >= 100) {
            riskScore += 1;
            riskFactors.push('공복혈당장애 (100-125 mg/dL)');
        }
        if (factors.bmi >= 30) {
            riskScore += 2;
            riskFactors.push('비만 (BMI ≥30)');
        }
        else if (factors.bmi >= 25) {
            riskScore += 1;
            riskFactors.push('과체중 (BMI 25-29.9)');
        }
        if (factors.systolicBP >= 130 || factors.diastolicBP >= 85) {
            riskScore += 1;
            riskFactors.push('고혈압 (≥130/85 mmHg)');
        }
        if (factors.age >= 45) {
            riskScore += 1;
            riskFactors.push('고령 (≥45세)');
        }
        if (factors.familyHistory.some(h => h.includes('당뇨'))) {
            riskScore += 1;
            riskFactors.push('당뇨병 가족력');
        }
        let riskLevel;
        if (riskScore <= 1) {
            riskLevel = 'low';
        }
        else if (riskScore <= 3) {
            riskLevel = 'moderate';
        }
        else {
            riskLevel = 'high';
        }
        return { riskLevel, riskScore, riskFactors };
    }
    static assessMusculoskeletalRisk(factors) {
        let riskScore = 0;
        const riskFactors = [];
        if (factors.age >= 65) {
            riskScore += 2;
            riskFactors.push('고령 (≥65세) - 근골격계 퇴행');
        }
        else if (factors.age >= 50) {
            riskScore += 1;
            riskFactors.push('중년 (50-64세) - 근골격계 주의');
        }
        if (factors.bmi >= 35) {
            riskScore += 3;
            riskFactors.push('고도비만 (BMI ≥35) - 관절 과부하');
        }
        else if (factors.bmi >= 30) {
            riskScore += 2;
            riskFactors.push('비만 (BMI ≥30) - 관절 부담');
        }
        else if (factors.bmi >= 25) {
            riskScore += 1;
            riskFactors.push('과체중 (BMI ≥25) - 관절 주의');
        }
        if (factors.medicalConditions.some(c => c.includes('관절염') || c.includes('디스크') || c.includes('골다공증'))) {
            riskScore += 2;
            riskFactors.push('기존 근골격계 질환');
        }
        let riskLevel;
        if (riskScore <= 1) {
            riskLevel = 'low';
        }
        else if (riskScore <= 3) {
            riskLevel = 'moderate';
        }
        else {
            riskLevel = 'high';
        }
        return { riskLevel, riskScore, riskFactors };
    }
    static calculateMedicalWeights(factors) {
        const cardioRisk = this.assessCardiovascularRisk(factors);
        const metabolicRisk = this.assessMetabolicRisk(factors);
        const musculoRisk = this.assessMusculoskeletalRisk(factors);
        const totalRiskScore = (cardioRisk.riskScore * 0.4) +
            (metabolicRisk.riskScore * 0.3) +
            (musculoRisk.riskScore * 0.2) +
            (factors.age > 70 ? 0.5 : 0);
        let overallRisk;
        if (totalRiskScore <= 1) {
            overallRisk = 'low';
        }
        else if (totalRiskScore <= 2.5) {
            overallRisk = 'moderate';
        }
        else if (totalRiskScore <= 4) {
            overallRisk = 'high';
        }
        else {
            overallRisk = 'very_high';
        }
        const allRiskFactors = [
            ...cardioRisk.riskFactors,
            ...metabolicRisk.riskFactors,
            ...musculoRisk.riskFactors
        ];
        const exerciseRestrictions = [];
        const recommendations = [];
        if (overallRisk === 'very_high') {
            exerciseRestrictions.push('고강도 운동 금지');
            exerciseRestrictions.push('의료진 감독 하에서만 운동');
            recommendations.push('운동 전 의사 상담 필수');
            recommendations.push('심전도 및 운동부하검사 권장');
        }
        else if (overallRisk === 'high') {
            exerciseRestrictions.push('중강도 이상 운동 제한');
            exerciseRestrictions.push('운동 중 심박수 모니터링 필수');
            recommendations.push('운동 전 건강검진 권장');
            recommendations.push('전문가 지도 하에 운동 시작');
        }
        else if (overallRisk === 'moderate') {
            exerciseRestrictions.push('점진적 운동 강도 증가');
            recommendations.push('정기적인 건강상태 확인');
            recommendations.push('운동 중 이상 증상 발생 시 즉시 중단');
        }
        const weighting = {
            cardiovascularWeight: cardioRisk.riskScore * 0.4,
            metabolicWeight: metabolicRisk.riskScore * 0.3,
            musculoskeletalWeight: musculoRisk.riskScore * 0.2,
            overallRiskModifier: overallRisk === 'very_high' ? 0.3 :
                overallRisk === 'high' ? 0.5 :
                    overallRisk === 'moderate' ? 0.8 : 1.0
        };
        const recommendedIntensity = overallRisk === 'very_high' || overallRisk === 'high' ? 'light' :
            overallRisk === 'moderate' ? 'moderate' : 'vigorous';
        const classification = {
            riskLevel: overallRisk,
            riskScore: totalRiskScore,
            primaryRiskFactors: allRiskFactors,
            exerciseRestrictions,
            recommendedIntensity,
            medicalClearanceRequired: overallRisk === 'very_high' || overallRisk === 'high',
            supervisionRequired: overallRisk === 'very_high'
        };
        return {
            classification,
            weighting,
            recommendations
        };
    }
    static assessSwimmingSpecificRisks(factors) {
        const restrictions = [];
        const benefits = [];
        const considerations = [];
        if (factors.systolicBP >= 180 || factors.diastolicBP >= 110) {
            restrictions.push('중증 고혈압으로 인한 수영 제한');
            considerations.push('혈압 안정화 후 수영 시작');
        }
        if (factors.medicalConditions.some(c => c.includes('부정맥'))) {
            restrictions.push('부정맥 환자 - 수영 중 심박수 모니터링 필수');
            considerations.push('응급상황 대비 안전요원 배치');
        }
        if (factors.bmi >= 30) {
            benefits.push('관절 부담 최소화로 안전한 체중 감량');
            benefits.push('부력으로 인한 관절 보호 효과');
        }
        if (factors.age >= 65) {
            benefits.push('저충격 운동으로 노인에게 적합');
            benefits.push('전신 근력 강화 및 심폐기능 향상');
        }
        if (factors.medicalConditions.some(c => c.includes('관절염'))) {
            benefits.push('관절염 환자에게 권장되는 운동');
            benefits.push('관절 가동범위 개선 효과');
        }
        if (factors.bloodSugar >= 126) {
            considerations.push('당뇨병 환자 - 운동 전후 혈당 측정');
            considerations.push('저혈당 예방을 위한 간식 준비');
        }
        return {
            swimmingRestrictions: restrictions,
            swimmingBenefits: benefits,
            specialConsiderations: considerations
        };
    }
}
exports.MedicalGuidelineWeights = MedicalGuidelineWeights;
//# sourceMappingURL=MedicalGuidelineWeights.js.map