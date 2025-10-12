"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthBasedExerciseAI = void 0;
const MedicalGuidelineWeights_1 = require("./MedicalGuidelineWeights");
class HealthBasedExerciseAI {
    static async calculateHealthBasedExercise(input) {
        try {
            console.log(`🏥 건강정보 기반 운동량 조정 시작: 사용자 ${input.userId}`);
            const medicalFactors = this.convertToMedicalFactors(input.healthData, input.medicalConditions);
            const medicalAssessment = MedicalGuidelineWeights_1.MedicalGuidelineWeights.calculateMedicalWeights(medicalFactors);
            const swimmingGuidance = MedicalGuidelineWeights_1.MedicalGuidelineWeights.assessSwimmingSpecificRisks(medicalFactors);
            const healthWeights = await this.calculateHealthWeights(input.healthData);
            const riskAssessment = this.assessHealthRisks(input.healthData, input.medicalConditions);
            const adjustmentFactors = this.calculateAdjustmentFactors(input.healthData, riskAssessment, input.currentFitnessLevel);
            const exerciseRecommendation = this.generateExerciseRecommendation(input, healthWeights, adjustmentFactors, riskAssessment);
            const nextReviewDate = this.calculateNextReviewDate(riskAssessment);
            const result = {
                exerciseRecommendation,
                riskAssessment,
                medicalClassification: medicalAssessment.classification,
                medicalWeighting: medicalAssessment.weighting,
                healthWeights,
                adjustmentFactors,
                medicalRecommendations: medicalAssessment.recommendations,
                swimmingSpecificGuidance: {
                    restrictions: swimmingGuidance.swimmingRestrictions,
                    benefits: swimmingGuidance.swimmingBenefits,
                    considerations: swimmingGuidance.specialConsiderations
                },
                nextReviewDate
            };
            console.log(`✅ 의학적 가이드라인 기반 운동량 조정 완료:`);
            console.log(`   - 의학적 위험도: ${medicalAssessment.classification.riskLevel}`);
            console.log(`   - 권장 강도: ${medicalAssessment.classification.recommendedIntensity}`);
            console.log(`   - 의료진 승인 필요: ${medicalAssessment.classification.medicalClearanceRequired ? '예' : '아니오'}`);
            return { success: true, data: result };
        }
        catch (error) {
            console.error('❌ 건강정보 기반 운동량 조정 오류:', error);
            return {
                success: false,
                message: '건강정보 기반 운동량 조정 중 오류가 발생했습니다.'
            };
        }
    }
    static convertToMedicalFactors(healthData, medicalConditions) {
        return {
            age: healthData.age || 30,
            gender: healthData.gender || 'male',
            bmi: healthData.bmi || this.calculateBMI(healthData.weight, healthData.height),
            systolicBP: healthData.bloodPressure?.systolic || healthData.systolicBP || 120,
            diastolicBP: healthData.bloodPressure?.diastolic || healthData.diastolicBP || 80,
            restingHR: healthData.restingHeartRate || healthData.heartRate || 70,
            bloodSugar: healthData.bloodSugar || healthData.glucose || 90,
            cholesterol: healthData.cholesterol || undefined,
            smokingStatus: healthData.smokingStatus || 'never',
            familyHistory: healthData.familyHistory || [],
            medications: healthData.medications || [],
            medicalConditions: medicalConditions || []
        };
    }
    static calculateBMI(weight, height) {
        if (!weight || !height)
            return 23;
        const heightInMeters = height / 100;
        return weight / (heightInMeters * heightInMeters);
    }
    static async calculateHealthWeights(healthData) {
        const weights = {};
        const defaultWeights = {
            age: 0.15,
            weight: 0.10,
            height: 0.05,
            bmi: 0.15,
            bloodPressure: 0.20,
            heartRate: 0.15,
            bloodSugar: 0.10,
            cholesterol: 0.10
        };
        Object.keys(defaultWeights).forEach(key => {
            let weight = defaultWeights[key];
            if (key === 'age' && healthData.age) {
                if (healthData.age > 60)
                    weight *= 1.5;
                else if (healthData.age > 45)
                    weight *= 1.2;
                else if (healthData.age < 25)
                    weight *= 0.8;
            }
            if (key === 'bmi' && healthData.bmi) {
                if (healthData.bmi > 30)
                    weight *= 1.8;
                else if (healthData.bmi > 25)
                    weight *= 1.3;
                else if (healthData.bmi < 18.5)
                    weight *= 1.4;
            }
            if (key === 'bloodPressure' && healthData.bloodPressure) {
                const systolic = healthData.bloodPressure.systolic;
                const diastolic = healthData.bloodPressure.diastolic;
                if (systolic > 140 || diastolic > 90)
                    weight *= 2.0;
                else if (systolic > 130 || diastolic > 85)
                    weight *= 1.5;
                else if (systolic < 90 || diastolic < 60)
                    weight *= 1.3;
            }
            weights[key] = weight;
        });
        return weights;
    }
    static assessHealthRisks(healthData, medicalConditions) {
        const riskFactors = [];
        const recommendations = [];
        const exerciseLimitations = [];
        let riskScore = 0;
        if (healthData.age > 65) {
            riskScore += 2;
            riskFactors.push('고령 (65세 이상)');
            recommendations.push('저강도 운동부터 시작하세요');
            exerciseLimitations.push('고강도 운동 제한');
        }
        else if (healthData.age > 50) {
            riskScore += 1;
            riskFactors.push('중년 (50세 이상)');
        }
        if (healthData.bmi > 30) {
            riskScore += 3;
            riskFactors.push('비만 (BMI > 30)');
            recommendations.push('체중 감량을 위한 유산소 운동 집중');
            exerciseLimitations.push('관절에 부담을 주는 운동 주의');
        }
        else if (healthData.bmi > 25) {
            riskScore += 1;
            riskFactors.push('과체중 (BMI > 25)');
            recommendations.push('균형잡힌 운동과 식단 관리');
        }
        else if (healthData.bmi < 18.5) {
            riskScore += 2;
            riskFactors.push('저체중 (BMI < 18.5)');
            recommendations.push('근력 운동과 영양 보충');
            exerciseLimitations.push('과도한 유산소 운동 제한');
        }
        if (healthData.bloodPressure) {
            const systolic = healthData.bloodPressure.systolic;
            const diastolic = healthData.bloodPressure.diastolic;
            if (systolic > 180 || diastolic > 110) {
                riskScore += 4;
                riskFactors.push('중증 고혈압');
                recommendations.push('의사와 상담 후 운동 시작');
                exerciseLimitations.push('고강도 운동 금지');
            }
            else if (systolic > 140 || diastolic > 90) {
                riskScore += 2;
                riskFactors.push('고혈압');
                recommendations.push('저-중강도 운동 권장');
                exerciseLimitations.push('급격한 강도 변화 주의');
            }
        }
        if (healthData.restingHeartRate) {
            if (healthData.restingHeartRate > 100) {
                riskScore += 2;
                riskFactors.push('빈맥 (안정시 심박수 > 100)');
                recommendations.push('심박수 모니터링 필수');
            }
            else if (healthData.restingHeartRate < 50) {
                riskScore += 1;
                riskFactors.push('서맥 (안정시 심박수 < 50)');
                recommendations.push('운동 중 심박수 확인');
            }
        }
        if (medicalConditions) {
            medicalConditions.forEach(condition => {
                switch (condition.toLowerCase()) {
                    case 'diabetes':
                    case '당뇨병':
                        riskScore += 2;
                        riskFactors.push('당뇨병');
                        recommendations.push('혈당 모니터링 필수');
                        exerciseLimitations.push('공복 운동 주의');
                        break;
                    case 'heart_disease':
                    case '심장병':
                        riskScore += 4;
                        riskFactors.push('심장병');
                        recommendations.push('심장 재활 전문의 상담');
                        exerciseLimitations.push('고강도 운동 금지');
                        break;
                    case 'asthma':
                    case '천식':
                        riskScore += 1;
                        riskFactors.push('천식');
                        recommendations.push('흡입기 준비');
                        exerciseLimitations.push('찬 공기 운동 주의');
                        break;
                }
            });
        }
        let overallRisk;
        if (riskScore >= 8)
            overallRisk = 'critical';
        else if (riskScore >= 5)
            overallRisk = 'high';
        else if (riskScore >= 2)
            overallRisk = 'moderate';
        else
            overallRisk = 'low';
        return {
            overallRisk,
            riskFactors,
            recommendations,
            exerciseLimitations,
            monitoringRequired: riskScore >= 2
        };
    }
    static calculateAdjustmentFactors(healthData, riskAssessment, fitnessLevel) {
        const factors = {
            intensity: 1.0,
            duration: 1.0,
            frequency: 1.0,
            recovery: 1.0
        };
        switch (riskAssessment.overallRisk) {
            case 'critical':
                factors.intensity *= 0.3;
                factors.duration *= 0.5;
                factors.frequency *= 0.6;
                factors.recovery *= 2.0;
                break;
            case 'high':
                factors.intensity *= 0.5;
                factors.duration *= 0.7;
                factors.frequency *= 0.8;
                factors.recovery *= 1.5;
                break;
            case 'moderate':
                factors.intensity *= 0.8;
                factors.duration *= 0.9;
                factors.frequency *= 0.9;
                factors.recovery *= 1.2;
                break;
            case 'low':
                break;
        }
        switch (fitnessLevel) {
            case 'beginner':
                factors.intensity *= 0.7;
                factors.duration *= 0.8;
                factors.recovery *= 1.3;
                break;
            case 'intermediate':
                break;
            case 'advanced':
                factors.intensity *= 1.2;
                factors.duration *= 1.1;
                factors.recovery *= 0.8;
                break;
        }
        if (healthData.age > 60) {
            factors.intensity *= 0.8;
            factors.recovery *= 1.3;
        }
        else if (healthData.age > 45) {
            factors.intensity *= 0.9;
            factors.recovery *= 1.1;
        }
        if (healthData.bmi > 30) {
            factors.intensity *= 0.7;
            factors.duration *= 1.2;
            factors.recovery *= 1.2;
        }
        else if (healthData.bmi < 18.5) {
            factors.intensity *= 0.8;
            factors.duration *= 0.9;
        }
        return factors;
    }
    static generateExerciseRecommendation(input, healthWeights, adjustmentFactors, riskAssessment) {
        let baseIntensity = 'moderate';
        let baseDuration = 45;
        let baseFrequency = 3;
        let baseCalories = 300;
        switch (input.currentFitnessLevel) {
            case 'beginner':
                baseIntensity = 'low';
                baseDuration = 30;
                baseFrequency = 2;
                baseCalories = 200;
                break;
            case 'advanced':
                baseIntensity = 'high';
                baseDuration = 60;
                baseFrequency = 4;
                baseCalories = 450;
                break;
        }
        const adjustedDuration = Math.round(baseDuration * adjustmentFactors.duration);
        const adjustedFrequency = Math.round(baseFrequency * adjustmentFactors.frequency);
        const adjustedCalories = Math.round(baseCalories * adjustmentFactors.intensity);
        let finalIntensity = baseIntensity;
        if (adjustmentFactors.intensity < 0.6) {
            finalIntensity = 'low';
        }
        else if (adjustmentFactors.intensity > 1.2) {
            finalIntensity = 'high';
        }
        const maxHeartRate = 220 - (input.healthData.age || 30);
        let heartRateRange;
        switch (finalIntensity) {
            case 'low':
                heartRateRange = {
                    min: Math.round(maxHeartRate * 0.5),
                    max: Math.round(maxHeartRate * 0.6)
                };
                break;
            case 'moderate':
                heartRateRange = {
                    min: Math.round(maxHeartRate * 0.6),
                    max: Math.round(maxHeartRate * 0.7)
                };
                break;
            case 'high':
                heartRateRange = {
                    min: Math.round(maxHeartRate * 0.7),
                    max: Math.round(maxHeartRate * 0.8)
                };
                break;
        }
        const precautions = [...riskAssessment.recommendations];
        if (riskAssessment.monitoringRequired) {
            precautions.push('운동 중 심박수 및 혈압 모니터링 필수');
        }
        const modifications = [...riskAssessment.exerciseLimitations];
        if (input.healthData.bmi > 30) {
            modifications.push('수중 운동으로 관절 부담 최소화');
        }
        return {
            exerciseType: 'swimming',
            intensity: finalIntensity,
            duration: adjustedDuration,
            frequency: adjustedFrequency,
            calorieTarget: adjustedCalories,
            heartRateRange,
            precautions,
            modifications
        };
    }
    static calculateNextReviewDate(riskAssessment) {
        const now = new Date();
        let daysToAdd;
        switch (riskAssessment.overallRisk) {
            case 'critical':
                daysToAdd = 7;
                break;
            case 'high':
                daysToAdd = 14;
                break;
            case 'moderate':
                daysToAdd = 30;
                break;
            case 'low':
                daysToAdd = 90;
                break;
        }
        return new Date(now.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
    }
    static async adjustExerciseInRealTime(userId, currentHeartRate, currentIntensity, exerciseRecommendation) {
        let adjustedIntensity = currentIntensity;
        let warning;
        let shouldStop = false;
        if (currentHeartRate > exerciseRecommendation.heartRateRange.max * 1.1) {
            adjustedIntensity = Math.max(currentIntensity * 0.8, 0.3);
            warning = '심박수가 너무 높습니다. 강도를 낮춰주세요.';
            if (currentHeartRate > exerciseRecommendation.heartRateRange.max * 1.3) {
                shouldStop = true;
                warning = '심박수가 위험 수준입니다. 운동을 중단하고 휴식하세요.';
            }
        }
        else if (currentHeartRate < exerciseRecommendation.heartRateRange.min * 0.9) {
            adjustedIntensity = Math.min(currentIntensity * 1.1, 1.0);
            warning = '강도를 조금 높여도 좋습니다.';
        }
        return {
            adjustedIntensity,
            warning,
            shouldStop
        };
    }
}
exports.HealthBasedExerciseAI = HealthBasedExerciseAI;
//# sourceMappingURL=HealthBasedExerciseAI.js.map