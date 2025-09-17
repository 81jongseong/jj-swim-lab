"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdvancedAIService = void 0;
const logger_1 = require("../utils/logger");
class AdvancedAIService {
    static getInstance() {
        if (!AdvancedAIService.instance) {
            AdvancedAIService.instance = new AdvancedAIService();
        }
        return AdvancedAIService.instance;
    }
    async analyzeSwimmingPose(videoData, userId, strokeType) {
        try {
            (0, logger_1.logInfo)(`고급 자세 분석 시작: 사용자 ${userId}, 영법 ${strokeType}`);
            const basicPose = await this.extractBasicPose(videoData);
            const pose3D = await this.calculate3DPose(basicPose);
            const strokeAnalysis = await this.analyzeStrokeSpecific(pose3D, strokeType);
            const techniqueScore = await this.analyzeTechnique(strokeAnalysis, strokeType);
            const efficiencyScore = await this.analyzeEfficiency(strokeAnalysis);
            const rhythmAnalysis = await this.analyzeRhythm(strokeAnalysis);
            const breathingAnalysis = await this.analyzeBreathing(strokeAnalysis);
            const recommendations = await this.generateRecommendations(userId, techniqueScore, efficiencyScore);
            const overallScore = this.calculateOverallScore(techniqueScore, efficiencyScore, rhythmAnalysis, breathingAnalysis);
            const analysis = {
                timestamp: new Date(),
                userId,
                strokeType: strokeType,
                bodyParts: pose3D,
                analysis: {
                    technique: techniqueScore,
                    efficiency: efficiencyScore,
                    rhythm: rhythmAnalysis,
                    breathing: breathingAnalysis
                },
                recommendations,
                overallScore
            };
            (0, logger_1.logInfo)(`고급 자세 분석 완료: 종합 점수 ${overallScore}`);
            return analysis;
        }
        catch (error) {
            (0, logger_1.logError)('고급 자세 분석 실패:', error);
            throw new Error('수영 자세 분석 중 오류가 발생했습니다.');
        }
    }
    async analyzeLearningPattern(userId) {
        try {
            const learningHistory = await this.getLearningHistory(userId);
            const learningStyle = this.determineLearningStyle(learningHistory);
            const progressRate = this.calculateProgressRate(learningHistory);
            const { strongAreas, challengingAreas } = this.analyzeSkillAreas(learningHistory);
            const motivationFactors = this.analyzeMotivationFactors(learningHistory);
            const optimalTrainingTime = this.findOptimalTrainingTime(learningHistory);
            const pattern = {
                userId,
                analysisDate: new Date(),
                learningStyle,
                progressRate,
                strongAreas,
                challengingAreas,
                motivationFactors,
                optimalTrainingTime,
                attentionSpan: this.calculateAttentionSpan(learningHistory),
                retentionRate: this.calculateRetentionRate(learningHistory),
                preferredFeedbackType: this.determinePreferredFeedbackType(learningHistory)
            };
            return pattern;
        }
        catch (error) {
            (0, logger_1.logError)('학습 패턴 분석 실패:', error);
            throw new Error('학습 패턴 분석 중 오류가 발생했습니다.');
        }
    }
    async assessInjuryRisk(userId, poseAnalysis) {
        try {
            const riskFactors = [];
            const postureRisks = this.analyzePostureRisks(poseAnalysis);
            riskFactors.push(...postureRisks);
            const repetitiveRisks = await this.analyzeRepetitiveMotionRisks(userId);
            riskFactors.push(...repetitiveRisks);
            const fatigueRisks = await this.analyzeFatigueRisks(userId);
            riskFactors.push(...fatigueRisks);
            const riskLevel = this.calculateOverallRiskLevel(riskFactors);
            const preventionRecommendations = this.generatePreventionRecommendations(riskFactors);
            const monitoringPoints = this.setMonitoringPoints(riskFactors);
            const assessment = {
                userId,
                riskLevel,
                riskFactors,
                preventionRecommendations,
                monitoringPoints,
                nextAssessment: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            };
            return assessment;
        }
        catch (error) {
            (0, logger_1.logError)('부상 위험 평가 실패:', error);
            throw new Error('부상 위험 평가 중 오류가 발생했습니다.');
        }
    }
    async generatePersonalizedTrainingPlan(userId, learningPattern, currentLevel) {
        try {
            const goals = await this.setPersonalizedGoals(userId, currentLevel);
            const trainingApproach = this.determineTrainingApproach(learningPattern);
            const weeklyPlans = this.generateWeeklyPlans(goals, trainingApproach, learningPattern);
            const assessmentCriteria = this.setAssessmentCriteria(goals);
            const trainingPlan = {
                userId,
                createdDate: new Date(),
                duration: '12주',
                goals,
                trainingApproach,
                weeklyPlans,
                assessmentCriteria,
                adaptiveAdjustments: true
            };
            return trainingPlan;
        }
        catch (error) {
            (0, logger_1.logError)('맞춤형 훈련 계획 생성 실패:', error);
            throw new Error('훈련 계획 생성 중 오류가 발생했습니다.');
        }
    }
    async extractBasicPose(videoData) {
        return {
            landmarks: Array.from({ length: 33 }, (_, i) => ({
                x: Math.random(),
                y: Math.random(),
                z: Math.random(),
                visibility: 0.8 + Math.random() * 0.2
            }))
        };
    }
    async calculate3DPose(basicPose) {
        return {
            head: { x: 0.5, y: 0.8, z: 0.5, confidence: 0.9 },
            shoulders: {
                left: { x: 0.4, y: 0.7, z: 0.5, confidence: 0.85 },
                right: { x: 0.6, y: 0.7, z: 0.5, confidence: 0.85 }
            },
            arms: {
                left: {
                    strokePhase: 'pull',
                    angle: 45,
                    velocity: 2.5,
                    power: 0.8,
                    efficiency: 0.75,
                    issues: []
                },
                right: {
                    strokePhase: 'recovery',
                    angle: 120,
                    velocity: 1.8,
                    power: 0.6,
                    efficiency: 0.8,
                    issues: []
                }
            },
            torso: {
                rotation: 15,
                stability: 0.85,
                alignment: 0.9,
                coreEngagement: 0.8
            },
            legs: {
                left: {
                    kickPhase: 'downkick',
                    frequency: 6,
                    amplitude: 0.3,
                    timing: 0.85,
                    coordination: 0.8
                },
                right: {
                    kickPhase: 'upkick',
                    frequency: 6,
                    amplitude: 0.35,
                    timing: 0.9,
                    coordination: 0.85
                }
            }
        };
    }
    async analyzeStrokeSpecific(pose3D, strokeType) {
        return pose3D;
    }
    async analyzeTechnique(strokeAnalysis, strokeType) {
        return {
            overall: 82,
            armTechnique: 85,
            legTechnique: 78,
            bodyPosition: 80,
            timing: 85,
            details: {
                strengths: ['좋은 팔 동작 리듬', '안정적인 몸통 자세'],
                weaknesses: ['킥 강도 부족', '호흡 타이밍 개선 필요'],
                criticalIssues: []
            }
        };
    }
    async analyzeEfficiency(strokeAnalysis) {
        return {
            overall: 78,
            energyWaste: 0.22,
            propulsionEfficiency: 0.8,
            dragReduction: 0.75,
            strokeLength: 1.8,
            strokeRate: 45
        };
    }
    async analyzeRhythm(strokeAnalysis) {
        return {
            consistency: 0.85,
            strokeTiming: 0.8,
            breathingTiming: 0.75,
            kickTiming: 0.9,
            synchronization: 0.82
        };
    }
    async analyzeBreathing(strokeAnalysis) {
        return {
            frequency: 3,
            timing: 0.8,
            headPosition: 0.85,
            efficiency: 0.78,
            issues: ['호흡 시 머리가 너무 높음']
        };
    }
    async generateRecommendations(userId, technique, efficiency) {
        const recommendations = [];
        if (technique.legTechnique < 80) {
            recommendations.push({
                type: 'technique',
                priority: 'high',
                title: '킥 기술 개선',
                description: '다리 킥의 강도와 리듬을 개선하여 추진력을 향상시키세요.',
                specificExercises: [
                    {
                        name: '킥보드 연습',
                        description: '킥보드를 이용한 집중 킥 연습',
                        duration: '10분',
                        repetitions: 5,
                        focusAreas: ['다리 근력', '킥 리듬'],
                        difficulty: 'intermediate'
                    }
                ],
                expectedImprovement: 15,
                timeframe: '2-3주'
            });
        }
        return recommendations;
    }
    calculateOverallScore(technique, efficiency, rhythm, breathing) {
        const weights = {
            technique: 0.4,
            efficiency: 0.3,
            rhythm: 0.2,
            breathing: 0.1
        };
        return Math.round(technique.overall * weights.technique +
            efficiency.overall * weights.efficiency +
            rhythm.consistency * 100 * weights.rhythm +
            breathing.efficiency * 100 * weights.breathing);
    }
    async getLearningHistory(userId) {
        return [];
    }
    determineLearningStyle(history) {
        return 'visual';
    }
    calculateProgressRate(history) {
        return 0.75;
    }
    analyzeSkillAreas(history) {
        return {
            strongAreas: ['자유형 팔 동작', '호흡 리듬'],
            challengingAreas: ['킥 동작', '턴 기술']
        };
    }
    analyzeMotivationFactors(history) {
        return ['성과 시각화', '목표 달성', '동료와의 경쟁'];
    }
    findOptimalTrainingTime(history) {
        return '오후 6-8시';
    }
    calculateAttentionSpan(history) {
        return 25;
    }
    calculateRetentionRate(history) {
        return 0.85;
    }
    determinePreferredFeedbackType(history) {
        return 'immediate';
    }
    analyzePostureRisks(analysis) {
        const risks = [];
        if (analysis.bodyParts.arms.left.angle > 160 || analysis.bodyParts.arms.right.angle > 160) {
            risks.push({
                factor: '어깨 과신전',
                severity: 7,
                description: '팔을 과도하게 뒤로 젖히는 동작으로 어깨 부상 위험이 있습니다.',
                prevention: ['스트로크 각도 조절', '어깨 스트레칭 강화']
            });
        }
        return risks;
    }
    async analyzeRepetitiveMotionRisks(userId) {
        return [];
    }
    async analyzeFatigueRisks(userId) {
        return [];
    }
    calculateOverallRiskLevel(risks) {
        const avgSeverity = risks.reduce((sum, risk) => sum + risk.severity, 0) / risks.length;
        if (avgSeverity >= 8)
            return 'critical';
        if (avgSeverity >= 6)
            return 'high';
        if (avgSeverity >= 4)
            return 'medium';
        return 'low';
    }
    generatePreventionRecommendations(risks) {
        const recommendations = new Set();
        risks.forEach(risk => {
            risk.prevention.forEach(prev => recommendations.add(prev));
        });
        return Array.from(recommendations);
    }
    setMonitoringPoints(risks) {
        return ['어깨 가동범위', '허리 유연성', '무릎 안정성'];
    }
    async setPersonalizedGoals(userId, currentLevel) {
        return {
            shortTerm: ['자유형 25m 연속 완주', '호흡 리듬 개선'],
            longTerm: ['자유형 100m 완주', '다양한 영법 습득'],
            technical: ['스트로크 효율성 20% 향상']
        };
    }
    determineTrainingApproach(pattern) {
        return pattern.learningStyle === 'visual' ? '시각적 피드백 중심' : '체감형 연습 중심';
    }
    generateWeeklyPlans(goals, approach, pattern) {
        return Array.from({ length: 12 }, (_, week) => ({
            week: week + 1,
            focus: week < 4 ? '기초 기술' : week < 8 ? '기술 향상' : '실전 적용',
            sessions: 3,
            duration: '60분',
            exercises: [`주차 ${week + 1} 맞춤 운동`]
        }));
    }
    setAssessmentCriteria(goals) {
        return {
            frequency: '매주',
            metrics: ['기술 점수', '지구력', '효율성'],
            passingScore: 80
        };
    }
}
exports.AdvancedAIService = AdvancedAIService;
exports.default = AdvancedAIService;
//# sourceMappingURL=advancedAI.js.map