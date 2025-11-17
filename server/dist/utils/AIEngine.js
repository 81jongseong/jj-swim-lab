"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIEngine = void 0;
const AIAnalysis_1 = require("../models/AIAnalysis");
const Checklist_1 = require("../models/Checklist");
const User_1 = require("../models/User");
class AIEngine {
    static async analyzePosture(studentId, technique, checklistData) {
        const completedItems = checklistData.filter(item => item.isCompleted);
        const totalItems = checklistData.length;
        const completionRate = (completedItems.length / totalItems) * 100;
        const techniqueRules = {
            freestyle: {
                keyPoints: ['자세', '호흡', '팔동작', '다리동작', '타이밍'],
                weights: [0.3, 0.25, 0.25, 0.15, 0.05]
            },
            backstroke: {
                keyPoints: ['자세', '팔동작', '다리동작', '호흡', '균형'],
                weights: [0.25, 0.25, 0.2, 0.15, 0.15]
            },
            breaststroke: {
                keyPoints: ['자세', '팔동작', '다리동작', '호흡', '타이밍'],
                weights: [0.2, 0.25, 0.25, 0.2, 0.1]
            },
            butterfly: {
                keyPoints: ['자세', '팔동작', '다리동작', '호흡', '리듬'],
                weights: [0.2, 0.3, 0.2, 0.15, 0.15]
            }
        };
        const rules = techniqueRules[technique];
        let score = 0;
        const strengths = [];
        const improvements = [];
        rules.keyPoints.forEach((point, index) => {
            const pointItems = checklistData.filter(item => item.category === point || item.description.includes(point));
            const pointCompletion = pointItems.length > 0 ?
                (pointItems.filter(item => item.isCompleted).length / pointItems.length) * 100 : 0;
            score += pointCompletion * rules.weights[index];
            if (pointCompletion >= 80) {
                strengths.push(point);
            }
            else if (pointCompletion < 50) {
                improvements.push(point);
            }
        });
        const detailedFeedback = this.generateDetailedFeedback(technique, score, strengths, improvements);
        return {
            technique,
            score: Math.round(score),
            strengths,
            improvements,
            detailedFeedback,
            completionRate: Math.round(completionRate)
        };
    }
    static async predictProgress(studentId, instructorId) {
        const checklists = await Checklist_1.Checklist.find({
            studentId,
            instructorId,
            status: { $in: ['completed', 'active'] }
        }).sort({ createdAt: -1 }).limit(10);
        if (checklists.length === 0) {
            return {
                currentLevel: '초급',
                predictedNextLevel: '초급+',
                estimatedWeeks: 4,
                confidence: 0.3,
                factors: ['데이터 부족']
            };
        }
        const progressPattern = this.analyzeProgressPattern(checklists);
        const currentLevel = this.determineCurrentLevel(progressPattern);
        const predictedNextLevel = this.predictNextLevel(currentLevel, progressPattern);
        const estimatedWeeks = this.estimateWeeksToNextLevel(progressPattern);
        const confidence = this.calculateConfidence(checklists.length, progressPattern);
        const factors = this.identifyProgressFactors(progressPattern);
        return {
            currentLevel,
            predictedNextLevel,
            estimatedWeeks,
            confidence,
            factors
        };
    }
    static async generatePersonalizedRecommendation(studentId, instructorId, options = {}) {
        const studentProfile = await User_1.User.findById(studentId).select('name profileLevel');
        const recentChecklists = await Checklist_1.Checklist.find({
            studentId,
            instructorId,
            createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        });
        const weaknesses = this.identifyWeaknesses(recentChecklists);
        const strengths = this.identifyStrengths(recentChecklists);
        const recommendedExercises = this.generateExerciseRecommendations(weaknesses, strengths);
        const focusAreas = this.determineFocusAreas(weaknesses);
        const difficultyAdjustment = this.suggestDifficultyAdjustment(recentChecklists);
        const estimatedImprovement = this.estimateImprovement(weaknesses, recommendedExercises, studentProfile?.name);
        const recommendationPayload = {
            recommendedExercises,
            focusAreas,
            difficultyAdjustment,
            estimatedImprovement
        };
        if (options.persist !== false) {
            await AIAnalysis_1.AIAnalysis.create({
                studentId,
                instructorId,
                analysisType: 'recommendation',
                personalizedRecommendation: recommendationPayload
            }).catch(() => undefined);
        }
        return recommendationPayload;
    }
    static async analyzePerformance(studentId, instructorId, options = {}) {
        const checklists = await Checklist_1.Checklist.find({
            studentId,
            instructorId
        }).sort({ createdAt: -1 });
        if (checklists.length === 0) {
            const emptyReport = {
                overallScore: 0,
                improvementRate: 0,
                consistencyScore: 0,
                recommendations: ['더 많은 데이터가 필요합니다']
            };
            if (options.persist !== false) {
                await AIAnalysis_1.AIAnalysis.create({
                    studentId,
                    instructorId,
                    analysisType: 'performance',
                    performanceAnalysis: emptyReport
                }).catch(() => undefined);
            }
            return emptyReport;
        }
        const overallScore = this.calculateOverallScore(checklists);
        const improvementRate = this.calculateImprovementRate(checklists);
        const consistencyScore = this.calculateConsistencyScore(checklists);
        const recommendations = this.generatePerformanceRecommendations(overallScore, improvementRate, consistencyScore);
        const report = {
            overallScore,
            improvementRate,
            consistencyScore,
            recommendations
        };
        if (options.persist !== false) {
            await AIAnalysis_1.AIAnalysis.create({
                studentId,
                instructorId,
                analysisType: 'performance',
                performanceAnalysis: report
            }).catch(() => undefined);
        }
        return report;
    }
    static generateDetailedFeedback(technique, score, strengths, improvements) {
        let feedback = `${technique} 수영 분석 결과입니다.\n\n`;
        if (score >= 80) {
            feedback += `전반적으로 우수한 수영 실력을 보여주고 있습니다. `;
        }
        else if (score >= 60) {
            feedback += `양호한 수영 실력을 보여주고 있습니다. `;
        }
        else {
            feedback += `기본기를 더욱 다져야 할 필요가 있습니다. `;
        }
        if (strengths.length > 0) {
            feedback += `특히 ${strengths.join(', ')} 부분에서 뛰어난 모습을 보여주고 있습니다. `;
        }
        if (improvements.length > 0) {
            feedback += `${improvements.join(', ')} 부분에 더 집중하여 연습하시면 좋겠습니다.`;
        }
        return feedback;
    }
    static analyzeProgressPattern(checklists) {
        const completionRates = checklists.map(c => c.progress || 0);
        const avgCompletionRate = completionRates.reduce((a, b) => a + b, 0) / completionRates.length;
        const trend = this.calculateTrend(completionRates);
        return {
            avgCompletionRate,
            trend,
            consistency: this.calculateConsistency(completionRates),
            recentPerformance: completionRates.slice(0, 3)
        };
    }
    static determineCurrentLevel(pattern) {
        if (pattern.avgCompletionRate >= 90)
            return '고급';
        if (pattern.avgCompletionRate >= 70)
            return '중급';
        if (pattern.avgCompletionRate >= 50)
            return '초급+';
        return '초급';
    }
    static predictNextLevel(currentLevel, pattern) {
        const levelProgression = {
            '초급': '초급+',
            '초급+': '중급',
            '중급': '고급',
            '고급': '전문가'
        };
        if (pattern.trend > 0.1) {
            return levelProgression[currentLevel] || currentLevel;
        }
        return currentLevel;
    }
    static estimateWeeksToNextLevel(pattern) {
        if (pattern.trend > 0.2)
            return 2;
        if (pattern.trend > 0.1)
            return 4;
        if (pattern.trend > 0)
            return 6;
        return 8;
    }
    static calculateConfidence(dataPoints, pattern) {
        let confidence = Math.min(dataPoints / 10, 1);
        confidence *= pattern.consistency;
        return Math.round(confidence * 100) / 100;
    }
    static identifyProgressFactors(pattern) {
        const factors = [];
        if (pattern.trend > 0.1)
            factors.push('지속적인 개선');
        if (pattern.consistency > 0.8)
            factors.push('안정적인 실력');
        if (pattern.avgCompletionRate > 80)
            factors.push('높은 완성도');
        return factors;
    }
    static identifyWeaknesses(checklists) {
        const allItems = checklists.flatMap(c => c.items || []);
        const incompleteItems = allItems.filter(item => !item.isCompleted);
        const categoryStats = {};
        incompleteItems.forEach(item => {
            const category = item.category || '기타';
            categoryStats[category] = (categoryStats[category] || 0) + 1;
        });
        return Object.entries(categoryStats)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([category]) => category);
    }
    static identifyStrengths(checklists) {
        const allItems = checklists.flatMap(c => c.items || []);
        const completeItems = allItems.filter(item => item.isCompleted);
        const categoryStats = {};
        completeItems.forEach(item => {
            const category = item.category || '기타';
            categoryStats[category] = (categoryStats[category] || 0) + 1;
        });
        return Object.entries(categoryStats)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([category]) => category);
    }
    static generateExerciseRecommendations(weaknesses, strengths) {
        const exerciseMap = {
            '자세': ['플랭크', '코어 스트레칭', '자세 교정 운동'],
            '호흡': ['호흡 연습', '수중 호흡', '호흡 타이밍 연습'],
            '팔동작': ['팔 스트로크 연습', '풀링 연습', '리커버리 연습'],
            '다리동작': ['킥 연습', '다리 근력 운동', '플렉서빌리티'],
            '타이밍': ['리듬 연습', '타이밍 연습', '조화 운동']
        };
        const recommendations = [];
        weaknesses.forEach(weakness => {
            if (exerciseMap[weakness]) {
                recommendations.push(...exerciseMap[weakness]);
            }
        });
        strengths.forEach(strength => {
            if (exerciseMap[strength]) {
                recommendations.push(`${strength} 유지 훈련: ${exerciseMap[strength][0]}`);
            }
        });
        return [...new Set(recommendations)];
    }
    static determineFocusAreas(weaknesses) {
        return weaknesses.slice(0, 2);
    }
    static suggestDifficultyAdjustment(checklists) {
        if (checklists.length === 0)
            return 'same';
        const recentAvgProgress = checklists.slice(0, 3)
            .reduce((sum, c) => sum + (c.progress || 0), 0) / Math.min(checklists.length, 3);
        if (recentAvgProgress >= 90)
            return 'harder';
        if (recentAvgProgress < 60)
            return 'easier';
        return 'same';
    }
    static estimateImprovement(weaknesses, recommendedExercises, studentName) {
        if (weaknesses.length === 0) {
            return studentName
                ? `${studentName}님의 현재 프로그램은 균형 잡혀 있습니다.`
                : '현재 프로그램은 균형 잡혀 있습니다.';
        }
        const keyWeakness = weaknesses[0];
        const exercise = recommendedExercises[0] || '맞춤 운동';
        const namePrefix = studentName ? `${studentName}님, ` : '';
        return `${namePrefix}${keyWeakness} 개선을 위해 ${exercise}을(를) 집중적으로 수행해보세요.`;
    }
    static calculateOverallScore(checklists) {
        if (checklists.length === 0)
            return 0;
        const totalProgress = checklists.reduce((sum, c) => sum + (c.progress || 0), 0);
        return Math.round(totalProgress / checklists.length);
    }
    static calculateImprovementRate(checklists) {
        if (checklists.length < 2)
            return 0;
        const recent = checklists.slice(0, 3).reduce((sum, c) => sum + (c.progress || 0), 0) / 3;
        const older = checklists.slice(-3).reduce((sum, c) => sum + (c.progress || 0), 0) / 3;
        return Math.round(((recent - older) / older) * 100);
    }
    static calculateConsistencyScore(checklists) {
        if (checklists.length < 2)
            return 0;
        const progresses = checklists.map(c => c.progress || 0);
        const mean = progresses.reduce((a, b) => a + b, 0) / progresses.length;
        const variance = progresses.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / progresses.length;
        const stdDev = Math.sqrt(variance);
        return Math.max(0, 1 - (stdDev / 100));
    }
    static generatePerformanceRecommendations(overallScore, improvementRate, consistencyScore) {
        const recommendations = [];
        if (overallScore < 70) {
            recommendations.push('기본기 연습을 더욱 강화하세요');
        }
        if (improvementRate < 0) {
            recommendations.push('학습 방법을 재검토해보세요');
        }
        if (consistencyScore < 0.7) {
            recommendations.push('꾸준한 연습이 필요합니다');
        }
        if (overallScore >= 80 && improvementRate > 10) {
            recommendations.push('다음 단계로 도전해보세요');
        }
        return recommendations.length > 0 ? recommendations : ['현재 잘하고 있습니다!'];
    }
    static calculateTrend(values) {
        if (values.length < 2)
            return 0;
        let trend = 0;
        for (let i = 1; i < values.length; i++) {
            trend += values[i] - values[i - 1];
        }
        return trend / (values.length - 1);
    }
    static calculateConsistency(values) {
        if (values.length < 2)
            return 1;
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
        const stdDev = Math.sqrt(variance);
        return Math.max(0, 1 - (stdDev / 100));
    }
}
exports.AIEngine = AIEngine;
//# sourceMappingURL=AIEngine.js.map