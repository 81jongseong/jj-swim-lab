"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExercisePrescriptionSystem = void 0;
class ExercisePrescriptionSystem {
    static classifyHealthGrade(healthData, user) {
        const age = healthData.age || user.age || 30;
        const bmi = healthData.bmi || this.calculateBMI(healthData.weight, healthData.height);
        const systolicBP = healthData.systolicBP || healthData.bloodPressure?.systolic || 120;
        const diastolicBP = healthData.diastolicBP || healthData.bloodPressure?.diastolic || 80;
        const restingHR = healthData.restingHeartRate || healthData.heartRate || 70;
        let obesityGrade;
        if (bmi < 23) {
            obesityGrade = 'normal';
        }
        else if (bmi < 25) {
            obesityGrade = 'overweight';
        }
        else if (bmi < 30) {
            obesityGrade = 'obesity1';
        }
        else if (bmi < 35) {
            obesityGrade = 'obesity2';
        }
        else {
            obesityGrade = 'obesity3';
        }
        let cardiovascularGrade = 'low';
        let riskScore = 0;
        if (user.gender === 'male' && age >= 45)
            riskScore += 1;
        else if (user.gender === 'female' && age >= 55)
            riskScore += 1;
        if (systolicBP >= 140 || diastolicBP >= 90)
            riskScore += 1;
        if (restingHR >= 100)
            riskScore += 1;
        else if (restingHR >= 80)
            riskScore += 0.5;
        if (riskScore <= 0.5)
            cardiovascularGrade = 'low';
        else if (riskScore <= 1.5)
            cardiovascularGrade = 'moderate';
        else if (riskScore <= 2.5)
            cardiovascularGrade = 'high';
        else
            cardiovascularGrade = 'very_high';
        let fitnessGrade = 'beginner';
        if (age < 30 && bmi < 25)
            fitnessGrade = 'advanced';
        else if (age < 50 && bmi < 30)
            fitnessGrade = 'intermediate';
        let ageGrade;
        if (age < 30)
            ageGrade = 'young';
        else if (age < 60)
            ageGrade = 'middle';
        else
            ageGrade = 'senior';
        const overallGrade = this.calculateOverallGrade({
            obesityGrade,
            cardiovascularGrade,
            fitnessGrade,
            ageGrade,
            exerciseHistory: 'beginner',
            metabolicGrade: 'normal',
            musculoskeletalGrade: 'normal',
            respiratoryGrade: 'normal',
            neurologicalGrade: 'normal',
            lifestyleGrade: 'good',
            sleepGrade: 'good',
            stressGrade: 'low',
            injuryHistory: 'none',
            flexibilityGrade: 'good'
        });
        return {
            obesityGrade,
            cardiovascularGrade,
            fitnessGrade,
            ageGrade,
            exerciseHistory: 'beginner',
            metabolicGrade: 'normal',
            musculoskeletalGrade: 'normal',
            respiratoryGrade: 'normal',
            neurologicalGrade: 'normal',
            lifestyleGrade: 'good',
            sleepGrade: 'good',
            stressGrade: 'low',
            injuryHistory: 'none',
            flexibilityGrade: 'good',
            overallGrade
        };
    }
    static calculateOverallGrade(grades) {
        let score = 0;
        const obesityScores = { normal: 5, overweight: 4, obesity1: 3, obesity2: 2, obesity3: 1 };
        score += obesityScores[grades.obesityGrade] * 0.4;
        const cardioScores = { low: 5, moderate: 4, high: 2, very_high: 1 };
        score += cardioScores[grades.cardiovascularGrade] * 0.3;
        const fitnessScores = { beginner: 2, intermediate: 4, advanced: 5 };
        score += fitnessScores[grades.fitnessGrade] * 0.2;
        const ageScores = { young: 5, middle: 4, senior: 2 };
        score += ageScores[grades.ageGrade] * 0.1;
        if (score >= 4.5)
            return 'A';
        else if (score >= 3.5)
            return 'B';
        else if (score >= 2.5)
            return 'C';
        else if (score >= 1.5)
            return 'D';
        else
            return 'E';
    }
    static calculateExerciseIntensity(restingHR, maxHR, targetIntensity, healthGrade, method = 'karvonen', additionalData) {
        const ageBasedMaxHR = 220 - (healthGrade.ageGrade === 'young' ? 25 :
            healthGrade.ageGrade === 'middle' ? 45 : 65);
        const actualMaxHR = Math.min(maxHR || ageBasedMaxHR, ageBasedMaxHR);
        let adjustedIntensity = targetIntensity;
        const adjustmentFactors = [];
        if (healthGrade.cardiovascularGrade === 'high' || healthGrade.cardiovascularGrade === 'very_high') {
            adjustedIntensity *= 0.8;
            adjustmentFactors.push('심혈관 위험도 높음 (-20%)');
        }
        if (healthGrade.obesityGrade === 'obesity2' || healthGrade.obesityGrade === 'obesity3') {
            adjustedIntensity *= 0.85;
            adjustmentFactors.push('고도비만 (-15%)');
        }
        if (healthGrade.metabolicGrade === 'diabetes' || healthGrade.metabolicGrade === 'metabolic_syndrome') {
            adjustedIntensity *= 0.9;
            adjustmentFactors.push('대사 질환 (-10%)');
        }
        if (healthGrade.musculoskeletalGrade === 'moderate_risk' || healthGrade.musculoskeletalGrade === 'high_risk') {
            adjustedIntensity *= 0.85;
            adjustmentFactors.push('근골격계 위험 (-15%)');
        }
        if (healthGrade.exerciseHistory === 'none' || healthGrade.exerciseHistory === 'beginner') {
            adjustedIntensity *= 0.8;
            adjustmentFactors.push('운동 초보자 (-20%)');
        }
        let targetHR;
        let calculationMethod;
        switch (method) {
            case 'karvonen':
                const hrReserve = actualMaxHR - restingHR;
                targetHR = restingHR + (hrReserve * adjustedIntensity);
                calculationMethod = 'karvonen';
                break;
            case 'max_hr_percentage':
                targetHR = actualMaxHR * adjustedIntensity;
                calculationMethod = 'max_hr_percentage';
                break;
            case 'vo2_max_percentage':
                const estimatedVO2Max = this.estimateVO2Max(additionalData);
                const targetVO2 = estimatedVO2Max * adjustedIntensity;
                targetHR = this.convertVO2ToHeartRate(targetVO2, actualMaxHR, restingHR);
                calculationMethod = 'vo2_max_percentage';
                break;
            case 'rpe_based':
                const rpeScale = Math.round(adjustedIntensity * 10);
                targetHR = this.convertRPEToHeartRate(rpeScale, actualMaxHR, restingHR);
                calculationMethod = 'rpe_based';
                break;
            case 'hybrid':
                const karvonenHR = restingHR + ((actualMaxHR - restingHR) * adjustedIntensity);
                const maxHRPercentage = actualMaxHR * adjustedIntensity;
                const rpeHR = this.convertRPEToHeartRate(Math.round(adjustedIntensity * 10), actualMaxHR, restingHR);
                targetHR = (karvonenHR + maxHRPercentage + rpeHR) / 3;
                calculationMethod = 'hybrid';
                break;
            case 'ai_adaptive':
                targetHR = this.calculateAIAdaptiveIntensity(restingHR, actualMaxHR, adjustedIntensity, healthGrade, additionalData);
                calculationMethod = 'ai_adaptive';
                break;
            default:
                const defaultHRReserve = actualMaxHR - restingHR;
                targetHR = restingHR + (defaultHRReserve * adjustedIntensity);
                calculationMethod = 'karvonen';
        }
        const estimatedVO2Max = this.estimateVO2Max(additionalData);
        const targetVO2 = estimatedVO2Max * adjustedIntensity;
        const compositeScore = this.calculateCompositeIntensityScore(adjustedIntensity, healthGrade, targetHR, actualMaxHR);
        return {
            targetHeartRate: {
                min: Math.round(targetHR * 0.9),
                max: Math.round(targetHR * 1.1),
                optimal: Math.round(targetHR),
                method: calculationMethod
            },
            perceivedExertion: {
                scale: Math.round(adjustedIntensity * 10),
                description: this.getExertionDescription(adjustedIntensity),
                borgScale: Math.round(adjustedIntensity * 14) + 6
            },
            swimmingPace: {
                metersPerMinute: this.calculateSwimmingPace(adjustedIntensity, healthGrade),
                strokeRate: this.calculateStrokeRate(adjustedIntensity, healthGrade),
                strokeEfficiency: this.calculateStrokeEfficiency(healthGrade)
            },
            vo2Intensity: {
                percentage: adjustedIntensity * 100,
                estimatedVO2Max,
                targetVO2
            },
            compositeIntensity: {
                score: compositeScore,
                factors: adjustmentFactors,
                confidence: this.calculateConfidenceScore(healthGrade, additionalData)
            }
        };
    }
    static generateExercisePrescription(healthGrade, healthData, user, exerciseHistory) {
        const restingHR = healthData.restingHeartRate || healthData.heartRate || 70;
        const maxHR = healthData.maxHeartRate || (220 - (healthData.age || user.age || 30));
        let baseIntensity = 0.6;
        let sessionDuration = 30;
        let weeklyFrequency = 3;
        switch (healthGrade.overallGrade) {
            case 'A':
                baseIntensity = 0.7;
                sessionDuration = 45;
                weeklyFrequency = 4;
                break;
            case 'B':
                baseIntensity = 0.65;
                sessionDuration = 40;
                weeklyFrequency = 3;
                break;
            case 'C':
                baseIntensity = 0.6;
                sessionDuration = 35;
                weeklyFrequency = 3;
                break;
            case 'D':
                baseIntensity = 0.5;
                sessionDuration = 25;
                weeklyFrequency = 2;
                break;
            case 'E':
                baseIntensity = 0.4;
                sessionDuration = 20;
                weeklyFrequency = 2;
                break;
        }
        if (healthGrade.obesityGrade === 'obesity2' || healthGrade.obesityGrade === 'obesity3') {
            sessionDuration = Math.min(sessionDuration, 30);
            baseIntensity *= 0.8;
        }
        if (healthGrade.cardiovascularGrade === 'high' || healthGrade.cardiovascularGrade === 'very_high') {
            sessionDuration = Math.min(sessionDuration, 25);
            baseIntensity *= 0.7;
        }
        const intensity = this.calculateExerciseIntensity(restingHR, maxHR, baseIntensity, healthGrade);
        const totalDistance = Math.round(sessionDuration * intensity.swimmingPace.metersPerMinute);
        const adjustment = exerciseHistory ? this.calculateHistoryBasedAdjustment(exerciseHistory) : null;
        const adjustedDuration = adjustment ?
            Math.round(sessionDuration * (1 + adjustment.adjustmentAmount / 100)) : sessionDuration;
        const adjustedIntensity = adjustment ?
            this.calculateExerciseIntensity(restingHR, maxHR, baseIntensity * (1 + adjustment.adjustmentAmount / 100), healthGrade) : intensity;
        return {
            sessionDuration: adjustedDuration,
            totalDistance: Math.round(totalDistance * (adjustedDuration / sessionDuration)),
            targetHeartRate: adjustedIntensity.targetHeartRate,
            recommendedExercises: {
                warmUp: {
                    duration: Math.round(adjustedDuration * 0.15),
                    intensity: '낮음 (50-60% 최대심박수)'
                },
                mainExercise: {
                    duration: Math.round(adjustedDuration * 0.7),
                    intensity: `${adjustedIntensity.perceivedExertion.scale}/10 (${adjustedIntensity.perceivedExertion.description})`,
                    sets: healthGrade.overallGrade === 'A' || healthGrade.overallGrade === 'B' ? 2 : 1
                },
                coolDown: {
                    duration: Math.round(adjustedDuration * 0.15),
                    intensity: '낮음 (40-50% 최대심박수)'
                }
            },
            weeklyFrequency,
            progressionPlan: {
                currentWeek: 1,
                totalWeeks: 12,
                weeklyIncrease: healthGrade.overallGrade === 'A' ? 5 :
                    healthGrade.overallGrade === 'B' ? 4 :
                        healthGrade.overallGrade === 'C' ? 3 : 2
            },
            safetyGuidelines: this.generateSafetyGuidelines(healthGrade),
            contraindications: this.generateContraindications(healthGrade)
        };
    }
    static calculateHistoryBasedAdjustment(history) {
        if (history.length < 3) {
            return {
                adjustmentType: 'maintain',
                adjustmentAmount: 0,
                newPrescription: {},
                reasoning: ['충분한 운동 이력이 없어 현재 강도 유지'],
                confidence: 0.3
            };
        }
        const recentSessions = history.slice(-3);
        const avgCompletionRate = recentSessions.reduce((sum, session) => sum + session.actualPerformance.completionRate, 0) / 3;
        const avgPerceivedExertion = recentSessions.reduce((sum, session) => sum + session.actualPerformance.perceivedExertion, 0) / 3;
        const avgDifficulty = recentSessions.reduce((sum, session) => {
            const difficultyScore = session.feedback.difficulty === 'too_easy' ? 1 :
                session.feedback.difficulty === 'appropriate' ? 0 : -1;
            return sum + difficultyScore;
        }, 0) / 3;
        let adjustmentType = 'maintain';
        let adjustmentAmount = 0;
        const reasoning = [];
        if (avgCompletionRate >= 95) {
            adjustmentType = 'increase';
            adjustmentAmount = 5;
            reasoning.push('완주율 95% 이상으로 강도 증가 가능');
        }
        else if (avgCompletionRate <= 70) {
            adjustmentType = 'decrease';
            adjustmentAmount = 10;
            reasoning.push('완주율 70% 이하로 강도 감소 필요');
        }
        if (avgDifficulty > 0.3) {
            if (adjustmentType === 'increase')
                adjustmentAmount += 3;
            else if (adjustmentType === 'maintain') {
                adjustmentType = 'increase';
                adjustmentAmount = 5;
            }
            reasoning.push('운동이 너무 쉬워 강도 증가');
        }
        else if (avgDifficulty < -0.3) {
            if (adjustmentType === 'decrease')
                adjustmentAmount += 5;
            else if (adjustmentType === 'maintain') {
                adjustmentType = 'decrease';
                adjustmentAmount = 10;
            }
            reasoning.push('운동이 너무 어려워 강도 감소');
        }
        const highFatigueCount = recentSessions.filter(s => s.feedback.fatigue === 'high').length;
        if (highFatigueCount >= 2) {
            adjustmentType = 'decrease';
            adjustmentAmount = Math.max(adjustmentAmount, 8);
            reasoning.push('높은 피로도로 인한 강도 감소');
        }
        return {
            adjustmentType,
            adjustmentAmount: Math.min(adjustmentAmount, 20),
            newPrescription: {},
            reasoning,
            confidence: Math.min(0.9, 0.5 + (history.length * 0.1))
        };
    }
    static calculateBMI(weight, height) {
        if (!weight || !height)
            return 23;
        const heightInMeters = height / 100;
        return weight / (heightInMeters * heightInMeters);
    }
    static estimateVO2Max(data) {
        if (!data)
            return 35;
        const { age = 30, weight = 70, height = 170, gender = 'male', exerciseHistory = 'beginner' } = data;
        const bmi = weight / Math.pow(height / 100, 2);
        let baseVO2 = 0;
        if (gender === 'male') {
            baseVO2 = 14.8 - (1.379 * age) + (0.451 * Math.pow(age, 2)) - (0.012 * Math.pow(age, 3));
        }
        else {
            baseVO2 = 4.38 * age - 3.9;
        }
        if (bmi > 30)
            baseVO2 *= 0.8;
        else if (bmi > 25)
            baseVO2 *= 0.9;
        const exerciseMultiplier = {
            'none': 0.7,
            'beginner': 0.8,
            'intermediate': 1.0,
            'advanced': 1.2,
            'elite': 1.4
        };
        return Math.max(15, baseVO2 * (exerciseMultiplier[exerciseHistory] || 1.0));
    }
    static convertVO2ToHeartRate(vo2, maxHR, restingHR) {
        const vo2Reserve = vo2 / 50;
        return restingHR + ((maxHR - restingHR) * vo2Reserve);
    }
    static convertRPEToHeartRate(rpe, maxHR, restingHR) {
        const intensity = (rpe - 1) / 9;
        return restingHR + ((maxHR - restingHR) * intensity);
    }
    static calculateAIAdaptiveIntensity(restingHR, maxHR, baseIntensity, healthGrade, data) {
        let adaptiveIntensity = baseIntensity;
        const healthScore = this.calculateHealthScore(healthGrade);
        adaptiveIntensity *= (healthScore / 100);
        if (healthGrade.ageGrade === 'senior') {
            adaptiveIntensity *= 0.85;
        }
        else if (healthGrade.ageGrade === 'young') {
            adaptiveIntensity *= 1.1;
        }
        if (healthGrade.exerciseHistory === 'elite') {
            adaptiveIntensity *= 1.2;
        }
        else if (healthGrade.exerciseHistory === 'none') {
            adaptiveIntensity *= 0.7;
        }
        const hrReserve = maxHR - restingHR;
        return restingHR + (hrReserve * Math.min(adaptiveIntensity, 0.95));
    }
    static calculateHealthScore(healthGrade) {
        let score = 100;
        const deductions = {
            cardiovascularGrade: { low: 0, moderate: -10, high: -20, very_high: -30 },
            obesityGrade: { normal: 0, overweight: -5, obesity1: -10, obesity2: -20, obesity3: -30 },
            metabolicGrade: { normal: 0, prediabetes: -10, diabetes: -20, metabolic_syndrome: -25 },
            musculoskeletalGrade: { normal: 0, mild_risk: -5, moderate_risk: -15, high_risk: -25 },
            exerciseHistory: { none: -20, beginner: -10, intermediate: 0, advanced: 10, elite: 15 }
        };
        score += deductions.cardiovascularGrade[healthGrade.cardiovascularGrade];
        score += deductions.obesityGrade[healthGrade.obesityGrade];
        score += deductions.metabolicGrade[healthGrade.metabolicGrade];
        score += deductions.musculoskeletalGrade[healthGrade.musculoskeletalGrade];
        score += deductions.exerciseHistory[healthGrade.exerciseHistory];
        return Math.max(20, Math.min(100, score));
    }
    static calculateCompositeIntensityScore(intensity, healthGrade, targetHR, maxHR) {
        const hrPercentage = (targetHR / maxHR) * 100;
        const healthScore = this.calculateHealthScore(healthGrade);
        return Math.round((intensity * 40) + (hrPercentage * 0.3) + (healthScore * 0.3));
    }
    static calculateConfidenceScore(healthGrade, data) {
        let confidence = 0.8;
        if (data?.vo2Max)
            confidence += 0.1;
        if (data?.age && data?.weight && data?.height)
            confidence += 0.05;
        const healthConsistency = this.calculateHealthConsistency(healthGrade);
        confidence += healthConsistency * 0.1;
        return Math.min(1.0, confidence);
    }
    static calculateHealthConsistency(healthGrade) {
        const grades = [
            healthGrade.cardiovascularGrade,
            healthGrade.obesityGrade,
            healthGrade.metabolicGrade,
            healthGrade.musculoskeletalGrade
        ];
        const gradeScores = grades.map(grade => {
            if (typeof grade === 'string') {
                const scoreMap = {
                    'low': 4, 'moderate': 3, 'high': 2, 'very_high': 1,
                    'normal': 4, 'overweight': 3, 'obesity1': 2, 'obesity2': 1, 'obesity3': 0,
                    'prediabetes': 2, 'diabetes': 1, 'metabolic_syndrome': 0,
                    'mild_risk': 3, 'moderate_risk': 2, 'high_risk': 1
                };
                return scoreMap[grade] || 2;
            }
            return 2;
        });
        const mean = gradeScores.reduce((sum, score) => sum + score, 0) / gradeScores.length;
        const variance = gradeScores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / gradeScores.length;
        const consistency = Math.max(0, 1 - (variance / 4));
        return consistency;
    }
    static calculateStrokeEfficiency(healthGrade) {
        let efficiency = 0.8;
        const flexibilityMultiplier = {
            'excellent': 1.1,
            'good': 1.0,
            'fair': 0.9,
            'poor': 0.8
        };
        efficiency *= flexibilityMultiplier[healthGrade.flexibilityGrade];
        const experienceMultiplier = {
            'none': 0.7,
            'beginner': 0.8,
            'intermediate': 0.9,
            'advanced': 1.0,
            'elite': 1.1
        };
        efficiency *= experienceMultiplier[healthGrade.exerciseHistory];
        return Math.min(1.0, efficiency);
    }
    static getExertionDescription(intensity) {
        if (intensity <= 0.3)
            return '매우 쉬움';
        else if (intensity <= 0.5)
            return '쉬움';
        else if (intensity <= 0.6)
            return '약간 힘듦';
        else if (intensity <= 0.7)
            return '힘듦';
        else if (intensity <= 0.8)
            return '매우 힘듦';
        else
            return '극도로 힘듦';
    }
    static calculateSwimmingPace(intensity, healthGrade) {
        let basePace = 30;
        basePace *= intensity;
        switch (healthGrade.overallGrade) {
            case 'A':
                basePace *= 1.2;
                break;
            case 'B':
                basePace *= 1.0;
                break;
            case 'C':
                basePace *= 0.8;
                break;
            case 'D':
                basePace *= 0.6;
                break;
            case 'E':
                basePace *= 0.4;
                break;
        }
        return Math.round(basePace);
    }
    static calculateStrokeRate(intensity, healthGrade) {
        let baseRate = 20;
        baseRate *= intensity;
        switch (healthGrade.overallGrade) {
            case 'A':
                baseRate *= 1.1;
                break;
            case 'B':
                baseRate *= 1.0;
                break;
            case 'C':
                baseRate *= 0.9;
                break;
            case 'D':
                baseRate *= 0.8;
                break;
            case 'E':
                baseRate *= 0.7;
                break;
        }
        return Math.round(baseRate);
    }
    static generateSafetyGuidelines(healthGrade) {
        const guidelines = [
            '운동 전 충분한 준비운동 필수',
            '운동 중 충분한 수분 섭취',
            '이상 증상 발생 시 즉시 운동 중단'
        ];
        if (healthGrade.cardiovascularGrade === 'high' || healthGrade.cardiovascularGrade === 'very_high') {
            guidelines.push('심박수 모니터링 필수');
            guidelines.push('의료진 상담 후 운동 시작 권장');
        }
        if (healthGrade.obesityGrade === 'obesity2' || healthGrade.obesityGrade === 'obesity3') {
            guidelines.push('관절 부담 최소화를 위한 저충격 운동');
            guidelines.push('점진적 강도 증가');
        }
        if (healthGrade.ageGrade === 'senior') {
            guidelines.push('고령자 특화 안전 수칙 준수');
            guidelines.push('낙상 예방에 특별 주의');
        }
        return guidelines;
    }
    static generateContraindications(healthGrade) {
        const contraindications = [];
        if (healthGrade.cardiovascularGrade === 'very_high') {
            contraindications.push('고강도 운동 금지');
            contraindications.push('의료진 감독 하에서만 운동');
        }
        if (healthGrade.obesityGrade === 'obesity3') {
            contraindications.push('관절 부담이 큰 운동 제한');
            contraindications.push('급격한 강도 증가 금지');
        }
        return contraindications;
    }
}
exports.ExercisePrescriptionSystem = ExercisePrescriptionSystem;
//# sourceMappingURL=ExercisePrescriptionSystem.js.map