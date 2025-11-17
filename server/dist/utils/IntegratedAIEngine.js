"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegratedAIEngine = void 0;
const SmartWatchData_1 = require("../models/SmartWatchData");
const VideoAnalysisCriteria_1 = require("../models/VideoAnalysisCriteria");
const VideoAnalysisCriteria_2 = require("../models/VideoAnalysisCriteria");
const AIEvaluationCriteria_1 = require("../models/AIEvaluationCriteria");
class IntegratedAIEngine {
    static async performIntegratedAnalysis(input) {
        try {
            const [storedSmartWatch, storedVideoResult, lastEvaluation, analysisCriteria] = await Promise.all([
                SmartWatchData_1.SmartWatchData.findOne({ studentId: input.studentId }).sort({ recordedAt: -1 }).lean(),
                VideoAnalysisCriteria_1.VideoAnalysisResult.findOne({ studentId: input.studentId, technique: input.technique }).sort({ createdAt: -1 }).lean(),
                AIEvaluationCriteria_1.AIEvaluationResult.findOne({ studentId: input.studentId, technique: input.technique }).sort({ evaluationDate: -1 }).lean(),
                VideoAnalysisCriteria_2.VideoAnalysisCriteria.findOne({ technique: input.technique }).lean()
            ]);
            const enrichedInput = {
                ...input,
                smartWatchData: input.smartWatchData || storedSmartWatch || undefined,
                videoAnalysisData: input.videoAnalysisData || storedVideoResult || undefined
            };
            const smartWatchAnalysis = await this.analyzeSmartWatchData(enrichedInput);
            const videoAnalysis = await this.analyzeVideoData(enrichedInput, analysisCriteria);
            const instructorAnalysis = this.analyzeInstructorObservations(enrichedInput.instructorObservations);
            const dataSourceWeights = this.calculateDataSourceWeights(smartWatchAnalysis, videoAnalysis, instructorAnalysis);
            const overallScore = this.calculateOverallScore(smartWatchAnalysis, videoAnalysis, instructorAnalysis, dataSourceWeights);
            const categoryScores = this.calculateCategoryScores(smartWatchAnalysis, videoAnalysis, instructorAnalysis, dataSourceWeights);
            const detailedAnalysis = this.generateDetailedAnalysis(smartWatchAnalysis, videoAnalysis, instructorAnalysis);
            const recommendations = this.generateRecommendations(overallScore, categoryScores, detailedAnalysis, analysisCriteria);
            const exercisePlan = this.generateExercisePlan(overallScore, categoryScores, input.technique);
            const progressPrediction = this.predictProgress(overallScore, categoryScores, input.studentId, lastEvaluation);
            return {
                overallScore,
                dataSources: {
                    smartWatch: {
                        available: smartWatchAnalysis.available,
                        score: smartWatchAnalysis.overallScore,
                        confidence: smartWatchAnalysis.confidence
                    },
                    videoAnalysis: {
                        available: videoAnalysis.available,
                        score: videoAnalysis.overallScore,
                        confidence: videoAnalysis.confidence
                    },
                    instructorObservation: {
                        score: instructorAnalysis.overallScore,
                        confidence: instructorAnalysis.confidence
                    }
                },
                categoryScores,
                detailedAnalysis,
                recommendations,
                exercisePlan,
                progressPrediction
            };
        }
        catch (error) {
            console.error('통합 AI 분석 오류:', error);
            throw error;
        }
    }
    static async analyzeSmartWatchData(input) {
        if (!input.smartWatchData) {
            return {
                available: false,
                overallScore: 0,
                confidence: 0,
                insights: {}
            };
        }
        const data = input.smartWatchData;
        const heartRateAnalysis = this.analyzeHeartRateData(data.performanceMetrics);
        const strokeAnalysis = this.analyzeStrokeData(data.performanceMetrics);
        const efficiencyAnalysis = this.analyzeEfficiencyData(data.performanceMetrics);
        const overallScore = (heartRateAnalysis.score * 0.3 +
            strokeAnalysis.score * 0.4 +
            efficiencyAnalysis.score * 0.3);
        return {
            available: true,
            overallScore: Math.round(overallScore),
            confidence: 0.9,
            insights: {
                heartRate: heartRateAnalysis,
                stroke: strokeAnalysis,
                efficiency: efficiencyAnalysis
            }
        };
    }
    static async analyzeVideoData(input, criteria) {
        if (!input.videoAnalysisData) {
            return {
                available: false,
                overallScore: 0,
                confidence: 0,
                insights: {}
            };
        }
        const data = input.videoAnalysisData;
        const postureAnalysis = this.analyzePostureFromVideo(data.detailedAnalysis.postureAnalysis);
        const movementAnalysis = this.analyzeMovementFromVideo(data.detailedAnalysis.movementAnalysis);
        const timingAnalysis = this.analyzeTimingFromVideo(data.detailedAnalysis.timingAnalysis);
        const calibration = criteria?.calibration || {};
        const postureWeight = calibration.postureWeight ?? 0.35;
        const movementWeight = calibration.movementWeight ?? 0.35;
        const timingWeight = calibration.timingWeight ?? 0.3;
        const confidenceBoost = calibration.confidenceBoost ?? 0;
        const overallScore = (postureAnalysis.score * postureWeight +
            movementAnalysis.score * movementWeight +
            timingAnalysis.score * timingWeight);
        return {
            available: true,
            overallScore: Math.round(overallScore),
            confidence: Math.min(1, 0.8 + confidenceBoost),
            insights: {
                posture: postureAnalysis,
                movement: movementAnalysis,
                timing: timingAnalysis
            }
        };
    }
    static analyzeInstructorObservations(observations) {
        const scores = Object.values(observations);
        const overallScore = scores.reduce((sum, score) => sum + score, 0) / scores.length * 10;
        return {
            overallScore: Math.round(overallScore),
            confidence: 0.7,
            insights: {
                posture: observations.posture * 10,
                breathing: observations.breathing * 10,
                movement: observations.movement * 10,
                efficiency: observations.efficiency * 10
            }
        };
    }
    static calculateDataSourceWeights(smartWatch, video, instructor) {
        const smartWeight = smartWatch.available ? smartWatch.confidence ?? 0.8 : 0;
        const videoWeight = video.available ? video.confidence ?? 0.7 : 0;
        const instructorWeight = instructor?.confidence ?? 0.6;
        const total = smartWeight + videoWeight + instructorWeight;
        if (total === 0) {
            return { smartWatch: 0, video: 0, instructor: 1 };
        }
        return {
            smartWatch: smartWeight / total,
            video: videoWeight / total,
            instructor: instructorWeight / total
        };
    }
    static calculateOverallScore(smartWatch, video, instructor, weights) {
        let totalScore = 0;
        let totalWeight = 0;
        if (smartWatch.available) {
            totalScore += smartWatch.overallScore * weights.smartWatch;
            totalWeight += weights.smartWatch;
        }
        if (video.available) {
            totalScore += video.overallScore * weights.video;
            totalWeight += weights.video;
        }
        totalScore += instructor.overallScore * weights.instructor;
        totalWeight += weights.instructor;
        return Math.round(totalScore / totalWeight);
    }
    static calculateCategoryScores(smartWatch, video, instructor, weights) {
        const categories = ['posture', 'breathing', 'movement', 'efficiency'];
        const categoryScores = {};
        categories.forEach(category => {
            let totalScore = 0;
            let totalWeight = 0;
            if (smartWatch.available && smartWatch.insights[category]) {
                totalScore += smartWatch.insights[category] * weights.smartWatch;
                totalWeight += weights.smartWatch;
            }
            if (video.available && video.insights[category]) {
                totalScore += video.insights[category] * weights.video;
                totalWeight += weights.video;
            }
            if (instructor.insights[category]) {
                totalScore += instructor.insights[category] * weights.instructor;
                totalWeight += weights.instructor;
            }
            categoryScores[category] = Math.round(totalScore / totalWeight);
        });
        return categoryScores;
    }
    static generateDetailedAnalysis(smartWatch, video, instructor) {
        return {
            smartWatchInsights: smartWatch.available ? smartWatch.insights : null,
            videoAnalysisInsights: video.available ? video.insights : null,
            instructorInsights: instructor.insights
        };
    }
    static generateRecommendations(overallScore, categoryScores, detailedAnalysis, criteria) {
        const recommendations = {
            immediate: [],
            shortTerm: [],
            longTerm: []
        };
        if (categoryScores.posture < 60) {
            recommendations.immediate.push('자세 교정 운동을 시작하세요');
            if (criteria?.posture?.recommendations) {
                recommendations.immediate.push(...criteria.posture.recommendations);
            }
        }
        if (categoryScores.breathing < 60) {
            recommendations.immediate.push('호흡 타이밍 연습을 강화하세요');
            if (criteria?.breathing?.recommendations) {
                recommendations.immediate.push(...criteria.breathing.recommendations);
            }
        }
        if (overallScore < 70) {
            recommendations.shortTerm.push('기본 동작 연습을 집중적으로 하세요');
            if (criteria?.movement?.recommendations) {
                recommendations.shortTerm.push(...criteria.movement.recommendations);
            }
        }
        if (overallScore > 80) {
            recommendations.longTerm.push('고급 기술 습득을 목표로 하세요');
            if (criteria?.efficiency?.recommendations) {
                recommendations.longTerm.push(...criteria.efficiency.recommendations);
            }
        }
        return recommendations;
    }
    static generateExercisePlan(overallScore, categoryScores, technique) {
        const baseDuration = Math.max(30, overallScore * 0.5);
        return {
            totalDuration: Math.round(baseDuration),
            warmUp: {
                duration: Math.round(baseDuration * 0.15),
                exercises: ['어깨 스트레칭', '가벼운 수영 동작']
            },
            mainTraining: {
                duration: Math.round(baseDuration * 0.7),
                exercises: this.getTechniqueSpecificExercises(technique, categoryScores)
            },
            coolDown: {
                duration: Math.round(baseDuration * 0.15),
                exercises: ['가벼운 스트레칭', '호흡 정리']
            }
        };
    }
    static predictProgress(overallScore, categoryScores, studentId, lastEvaluation) {
        const previousScore = lastEvaluation?.overallScore ?? 0;
        const delta = overallScore - previousScore;
        const improvementRate = delta !== 0 ? Math.max(0.2, Math.min(1, delta / 10 + 0.5)) : 0.5;
        const scoreEntries = Object.entries(categoryScores ?? {});
        const categoryFocus = scoreEntries
            .sort(([, a], [, b]) => b - a)
            .slice(0, 2)
            .map(([category]) => category);
        return {
            expectedImprovement: Math.round(overallScore * improvementRate * 0.1),
            timeToNextLevel: Math.max(1, Math.round((100 - overallScore) / improvementRate)),
            confidence: Math.min(0.95, 0.6 + (delta >= 0 ? 0.1 : -0.05)),
            referenceEvaluationId: lastEvaluation?._id ?? null,
            focusCategories: categoryFocus,
            studentId
        };
    }
    static analyzeHeartRateData(metrics) {
        const avgHR = metrics.averageHeartRate;
        const maxHR = metrics.maxHeartRate;
        const efficiency = Math.max(0, 100 - Math.abs(avgHR - 150) / 2);
        return {
            score: Math.round(efficiency),
            insights: {
                averageHeartRate: avgHR,
                maxHeartRate: maxHR,
                efficiency: efficiency
            }
        };
    }
    static analyzeStrokeData(metrics) {
        const strokeRate = metrics.strokeRate;
        const strokeCount = metrics.strokeCount;
        const efficiency = Math.max(0, 100 - Math.abs(strokeRate - 60) / 2);
        return {
            score: Math.round(efficiency),
            insights: {
                strokeRate: strokeRate,
                strokeCount: strokeCount,
                efficiency: efficiency
            }
        };
    }
    static analyzeEfficiencyData(metrics) {
        const speed = metrics.averageSpeed;
        const efficiency = metrics.efficiency;
        return {
            score: Math.round(efficiency),
            insights: {
                speed: speed,
                efficiency: efficiency
            }
        };
    }
    static analyzePostureFromVideo(postureData) {
        const scores = Object.values(postureData);
        const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
        return {
            score: Math.round(averageScore),
            insights: postureData
        };
    }
    static analyzeMovementFromVideo(movementData) {
        const scores = Object.values(movementData);
        const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
        return {
            score: Math.round(averageScore),
            insights: movementData
        };
    }
    static analyzeTimingFromVideo(timingData) {
        const scores = Object.values(timingData);
        const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
        return {
            score: Math.round(averageScore),
            insights: timingData
        };
    }
    static getTechniqueSpecificExercises(technique, categoryScores) {
        const baseExercises = {
            freestyle: ['프리스트로크 기본 동작', '호흡 타이밍 연습'],
            backstroke: ['백스트로크 기본 동작', '호흡 연습'],
            breaststroke: ['브레스트스트로크 기본 동작', '호흡 타이밍 연습'],
            butterfly: ['버터플라이 기본 동작', '호흡 타이밍 연습']
        };
        const exercises = baseExercises[technique] || baseExercises.freestyle;
        if (categoryScores.posture < 60) {
            exercises.push('자세 교정 운동');
        }
        if (categoryScores.breathing < 60) {
            exercises.push('호흡 개선 운동');
        }
        return exercises;
    }
}
exports.IntegratedAIEngine = IntegratedAIEngine;
//# sourceMappingURL=IntegratedAIEngine.js.map