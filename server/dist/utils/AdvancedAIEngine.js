"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdvancedAIEngine = void 0;
const Checklist_1 = require("../models/Checklist");
const AIAnalysis_1 = require("../models/AIAnalysis");
const AIEvaluationCriteria_1 = require("../models/AIEvaluationCriteria");
const ExerciseRecommendation_1 = __importDefault(require("../models/ExerciseRecommendation"));
class AdvancedAIEngine {
    static async performComprehensiveEvaluation(input) {
        try {
            console.log('🤖 고급 AI 엔진 - 종합 평가 시작:', input.technique, input.level);
            const criteria = await AIEvaluationCriteria_1.EvaluationCriteria.findOne({
                technique: input.technique,
                level: input.level,
                isActive: true
            });
            if (!criteria) {
                return {
                    success: false,
                    data: null,
                    message: `${input.technique} ${input.level} 레벨의 평가 기준을 찾을 수 없습니다.`
                };
            }
            const recentChecklists = await Checklist_1.Checklist.find({
                studentId: input.studentId,
                instructorId: input.instructorId
            }).sort({ createdAt: -1 }).limit(5).lean();
            const historicalTrend = this.calculateHistoricalTrend(recentChecklists);
            const performanceAnalysis = this.analyzePerformanceMetrics(input.performanceMetrics, criteria.performanceMetrics, input.level);
            const observationAnalysis = this.analyzeInstructorObservations(input.instructorObservations, criteria.categories);
            const overallScore = this.calculateOverallScore(performanceAnalysis, observationAnalysis, criteria.categories);
            const categoryScores = this.calculateCategoryScores(performanceAnalysis, observationAnalysis, criteria.categories);
            const levelAssessment = this.assessLevel(overallScore, input.level);
            const { strengths, weaknesses, improvementAreas } = this.analyzeStrengthsAndWeaknesses(categoryScores, criteria);
            const exerciseRecommendations = await this.generateExerciseRecommendations(input.technique, input.level, improvementAreas);
            const feedback = this.generateFeedback(overallScore, strengths, weaknesses);
            if (historicalTrend.sessionsAnalyzed > 0) {
                feedback.detailedFeedback += ` 최근 ${historicalTrend.sessionsAnalyzed}회 평균 완수율은 ${historicalTrend.averageProgress}%입니다.`;
            }
            const result = {
                overallScore,
                categoryScores,
                levelAssessment,
                strengths,
                weaknesses,
                improvementAreas,
                recommendations: {
                    exercises: exerciseRecommendations.exercises,
                    workoutPlan: exerciseRecommendations.workoutPlan,
                    nextEvaluationDate: this.calculateNextEvaluationDate(input.level, overallScore)
                },
                feedback,
                historicalContext: historicalTrend
            };
            await this.saveEvaluationResult(input, result);
            await AIAnalysis_1.AIAnalysis.create({
                studentId: input.studentId,
                instructorId: input.instructorId,
                analysisType: 'progress',
                progressPrediction: {
                    currentLevel: input.level,
                    predictedNextLevel: levelAssessment,
                    estimatedWeeks: Math.max(1, historicalTrend.sessionsAnalyzed * 2),
                    confidence: Math.min(1, overallScore / 100),
                    factors: improvementAreas.length > 0 ? improvementAreas : ['steady_progress']
                }
            }).catch(() => undefined);
            console.log('✅ 고급 AI 엔진 - 종합 평가 완료:', overallScore);
            return {
                success: true,
                data: result,
                message: 'AI 평가가 성공적으로 완료되었습니다.'
            };
        }
        catch (error) {
            console.error('❌ 고급 AI 엔진 오류:', error);
            return {
                success: false,
                data: null,
                message: 'AI 평가 중 오류가 발생했습니다.'
            };
        }
    }
    static analyzePerformanceMetrics(metrics, criteria, level) {
        const analysis = {};
        Object.keys(metrics).forEach(metric => {
            if (metrics[metric] !== undefined && criteria[metric]) {
                const levelCriteria = criteria[metric][level];
                if (levelCriteria) {
                    const normalizedScore = this.normalizeMetricScore(metrics[metric], levelCriteria.min, levelCriteria.max);
                    analysis[metric] = normalizedScore;
                }
            }
        });
        return analysis;
    }
    static analyzeInstructorObservations(observations, categories) {
        const analysis = {};
        Object.keys(categories).forEach(category => {
            const observedScore = observations[category];
            const weight = categories[category]?.weight ?? 1;
            const normalizedScore = typeof observedScore === 'number' ? observedScore : 0;
            analysis[category] = Math.min(100, Math.max(0, Math.round(normalizedScore * weight)));
        });
        return analysis;
    }
    static calculateOverallScore(performanceAnalysis, observationAnalysis, categories) {
        let totalScore = 0;
        let totalWeight = 0;
        Object.keys(categories).forEach(category => {
            const weight = categories[category].weight;
            const score = observationAnalysis[category] || 0;
            totalScore += score * weight;
            totalWeight += weight;
        });
        const performanceWeight = 0.3;
        const performanceScore = Object.values(performanceAnalysis).reduce((sum, score) => sum + score, 0) / Object.keys(performanceAnalysis).length || 0;
        totalScore += performanceScore * performanceWeight;
        totalWeight += performanceWeight;
        return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
    }
    static calculateCategoryScores(performanceAnalysis, observationAnalysis, categories) {
        const performanceAverage = Object.keys(performanceAnalysis).length > 0
            ? Object.values(performanceAnalysis).reduce((sum, score) => sum + score, 0) / Object.values(performanceAnalysis).length
            : 0;
        const blendedScores = {};
        Object.keys(categories).forEach(category => {
            const weight = categories[category]?.weight ?? 1;
            const observationScore = observationAnalysis[category] ?? 0;
            const blended = (observationScore * 0.7) + (performanceAverage * 0.3);
            blendedScores[category] = Math.min(100, Math.max(0, Math.round(blended * weight)));
        });
        return {
            posture: blendedScores.posture ?? 0,
            breathing: blendedScores.breathing ?? 0,
            movement: blendedScores.movement ?? 0,
            efficiency: blendedScores.efficiency ?? 0
        };
    }
    static assessLevel(overallScore, currentLevel) {
        const baselineByLevel = {
            beginner: 50,
            intermediate: 65,
            advanced: 75,
            expert: 85
        };
        const baseline = baselineByLevel[currentLevel] ?? 65;
        if (overallScore >= baseline + 15)
            return 'expert';
        if (overallScore >= baseline + 5)
            return 'advanced';
        if (overallScore >= baseline - 5)
            return 'intermediate';
        return 'beginner';
    }
    static analyzeStrengthsAndWeaknesses(categoryScores, criteria) {
        const strengths = [];
        const weaknesses = [];
        const improvementAreas = [];
        Object.keys(categoryScores).forEach(category => {
            const score = categoryScores[category];
            const categoryName = this.getCategoryKoreanName(category);
            if (score >= 80) {
                strengths.push(categoryName);
            }
            else if (score < 60) {
                weaknesses.push(categoryName);
                improvementAreas.push(categoryName);
                const subCategories = criteria?.categories?.[category]?.subCategories;
                if (subCategories) {
                    Object.keys(subCategories).forEach(sub => {
                        improvementAreas.push(`${categoryName} - ${this.getSubCategoryKoreanName(sub)}`);
                    });
                }
            }
        });
        return { strengths, weaknesses, improvementAreas: [...new Set(improvementAreas)] };
    }
    static async generateExerciseRecommendations(technique, level, improvementAreas) {
        const exercises = [];
        let workoutPlan = null;
        for (const area of improvementAreas) {
            const recommendations = await ExerciseRecommendation_1.default.find({
                category: this.getCategoryEnglishName(area.replace(/\s*-.*$/, '')),
                difficulty: level === 'expert' ? 'advanced' : level
            });
            recommendations.forEach(rec => {
                if (rec.instructions) {
                    rec.instructions.forEach(instruction => {
                        exercises.push({
                            name: instruction,
                            priority: this.determinePriority(area, rec.difficulty),
                            reason: `${area} 개선을 위한 ${instruction}`,
                            duration: rec.duration
                        });
                    });
                }
            });
            if (!workoutPlan && recommendations.length > 0) {
                const rec = recommendations[0];
                const frequency = rec.frequency ?? 3;
                workoutPlan = {
                    name: rec.name,
                    description: rec.description,
                    duration: rec.duration,
                    frequency
                };
            }
        }
        if (!workoutPlan) {
            workoutPlan = {
                name: `${technique} 기본 훈련 계획`,
                description: '기본적인 수영 기술 향상을 위한 훈련 계획',
                duration: 60,
                frequency: 3
            };
        }
        return { exercises, workoutPlan };
    }
    static generateFeedback(overallScore, strengths, weaknesses) {
        let feedbackLevel;
        if (overallScore >= 90)
            feedbackLevel = 'excellent';
        else if (overallScore >= 75)
            feedbackLevel = 'good';
        else if (overallScore >= 60)
            feedbackLevel = 'average';
        else
            feedbackLevel = 'poor';
        const feedbackTemplates = {
            excellent: ['훌륭한 실력을 보여주고 있습니다!', '완벽에 가까운 기술을 보여주고 있습니다!'],
            good: ['좋은 실력을 보여주고 있습니다!', '꾸준한 노력이 보입니다!'],
            average: ['기본기를 잘 다지고 있습니다!', '조금 더 연습하면 더 좋아질 것입니다!'],
            poor: ['기본기를 다시 한번 점검해보세요!', '꾸준한 연습이 필요합니다!']
        };
        const template = feedbackTemplates[feedbackLevel] || feedbackTemplates.average;
        const randomTemplate = template[Math.floor(Math.random() * template.length)] || '좋은 노력을 보이고 있습니다.';
        return {
            summary: `전체 점수: ${overallScore}점 (${this.getLevelKoreanName(feedbackLevel)})`,
            detailedFeedback: randomTemplate,
            encouragement: this.generateEncouragement(overallScore, strengths),
            goals: this.generateGoals(weaknesses)
        };
    }
    static async saveEvaluationResult(input, result) {
        const evaluationResult = new AIEvaluationCriteria_1.AIEvaluationResult({
            studentId: input.studentId,
            instructorId: input.instructorId,
            technique: input.technique,
            level: input.level,
            inputData: {
                performanceMetrics: input.performanceMetrics,
                instructorObservations: input.instructorObservations
            },
            analysisResult: {
                overallScore: result.overallScore,
                categoryScores: result.categoryScores,
                levelAssessment: result.levelAssessment,
                strengths: result.strengths,
                weaknesses: result.weaknesses,
                improvementAreas: result.improvementAreas,
                historicalContext: result.historicalContext
            },
            recommendations: result.recommendations,
            feedback: result.feedback,
            evaluationDate: new Date()
        });
        await evaluationResult.save();
    }
    static normalizeMetricScore(value, min, max) {
        if (value <= min)
            return 0;
        if (value >= max)
            return 100;
        return Math.round(((value - min) / (max - min)) * 100);
    }
    static getCategoryKoreanName(category) {
        const names = {
            'posture': '자세',
            'breathing': '호흡',
            'movement': '동작',
            'efficiency': '효율성'
        };
        return names[category] || category;
    }
    static getCategoryEnglishName(category) {
        const names = {
            '자세': 'posture',
            '호흡': 'breathing',
            '동작': 'movement',
            '효율성': 'efficiency'
        };
        return names[category] || category;
    }
    static getLevelKoreanName(level) {
        const names = {
            'excellent': '우수',
            'good': '양호',
            'average': '보통',
            'poor': '개선 필요'
        };
        return names[level] || level;
    }
    static determinePriority(area, difficulty) {
        if (area.startsWith('자세') || area.startsWith('호흡'))
            return 'high';
        if (difficulty === 'hard')
            return 'low';
        return 'medium';
    }
    static calculateNextEvaluationDate(level, score) {
        const baseDaysByLevel = {
            beginner: 3,
            intermediate: 7,
            advanced: 10,
            expert: 14
        };
        const baseDays = baseDaysByLevel[level] ?? 7;
        const modifier = score >= 85 ? 1.5 : score >= 70 ? 1 : 0.5;
        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + Math.round(baseDays * modifier));
        return nextDate;
    }
    static generateEncouragement(score, strengths) {
        if (score >= 80) {
            return `훌륭한 실력을 보여주고 있습니다! ${strengths.join(', ')} 영역에서 특히 우수합니다.`;
        }
        else if (score >= 60) {
            return `꾸준한 발전을 보이고 있습니다. 계속 노력하시면 더욱 향상될 것입니다.`;
        }
        else {
            return `기초를 탄탄히 다지면 빠르게 향상될 수 있습니다. 포기하지 마세요!`;
        }
    }
    static generateGoals(weaknesses) {
        return weaknesses.map(weakness => `${weakness} 개선하기`);
    }
    static getSubCategoryKoreanName(subCategory) {
        const names = {
            bodyAlignment: '몸의 정렬',
            headPosition: '머리 위치',
            coreStability: '코어 안정성',
            timing: '호흡 타이밍',
            technique: '호흡 기술',
            consistency: '호흡 일관성',
            strokeTechnique: '스트로크 기술',
            rhythm: '리듬',
            coordination: '협응력',
            power: '파워',
            endurance: '지구력',
            speed: '속도'
        };
        return names[subCategory] || subCategory;
    }
    static calculateHistoricalTrend(checklists) {
        if (!checklists || checklists.length === 0) {
            return {
                averageProgress: 0,
                sessionsAnalyzed: 0,
                latestChecklistDate: null
            };
        }
        const progressValues = checklists.map(checklist => checklist.progress ?? 0);
        const averageProgress = Math.round(progressValues.reduce((sum, value) => sum + value, 0) / checklists.length);
        const latestChecklistDate = checklists[0]?.createdAt ? new Date(checklists[0].createdAt) : null;
        return {
            averageProgress,
            sessionsAnalyzed: checklists.length,
            latestChecklistDate
        };
    }
}
exports.AdvancedAIEngine = AdvancedAIEngine;
//# sourceMappingURL=AdvancedAIEngine.js.map