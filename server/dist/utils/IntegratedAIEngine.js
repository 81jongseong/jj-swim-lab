"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegratedAIEngine = void 0;
class IntegratedAIEngine {
    static async performIntegratedAnalysis(input) {
        try {
            const smartWatchAnalysis = await this.analyzeSmartWatchData(input);
            const videoAnalysis = await this.analyzeVideoData(input);
            const instructorAnalysis = this.analyzeInstructorObservations(input.instructorObservations);
            const dataSourceWeights = this.calculateDataSourceWeights(smartWatchAnalysis, videoAnalysis, instructorAnalysis);
            const overallScore = this.calculateOverallScore(smartWatchAnalysis, videoAnalysis, instructorAnalysis, dataSourceWeights);
            const categoryScores = this.calculateCategoryScores(smartWatchAnalysis, videoAnalysis, instructorAnalysis, dataSourceWeights);
            const detailedAnalysis = this.generateDetailedAnalysis(smartWatchAnalysis, videoAnalysis, instructorAnalysis);
            const recommendations = this.generateRecommendations(overallScore, categoryScores, detailedAnalysis);
            const exercisePlan = this.generateExercisePlan(overallScore, categoryScores, input.technique);
            const progressPrediction = this.predictProgress(overallScore, categoryScores, input.studentId);
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
    static async analyzeVideoData(input) {
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
        const overallScore = (postureAnalysis.score * 0.35 +
            movementAnalysis.score * 0.35 +
            timingAnalysis.score * 0.3);
        return {
            available: true,
            overallScore: Math.round(overallScore),
            confidence: 0.8,
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
        const totalSources = [smartWatch.available, video.available, true].filter(Boolean).length;
        if (totalSources === 3) {
            return {
                smartWatch: 0.4,
                video: 0.4,
                instructor: 0.2
            };
        }
        else if (totalSources === 2) {
            if (smartWatch.available && video.available) {
                return { smartWatch: 0.5, video: 0.5, instructor: 0 };
            }
            else if (smartWatch.available) {
                return { smartWatch: 0.6, instructor: 0.4, video: 0 };
            }
            else {
                return { video: 0.6, instructor: 0.4, smartWatch: 0 };
            }
        }
        else {
            return { instructor: 1, smartWatch: 0, video: 0 };
        }
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
    static generateRecommendations(overallScore, categoryScores, detailedAnalysis) {
        const recommendations = {
            immediate: [],
            shortTerm: [],
            longTerm: []
        };
        if (categoryScores.posture < 60) {
            recommendations.immediate.push('자세 교정 운동을 시작하세요');
        }
        if (categoryScores.breathing < 60) {
            recommendations.immediate.push('호흡 타이밍 연습을 강화하세요');
        }
        if (overallScore < 70) {
            recommendations.shortTerm.push('기본 동작 연습을 집중적으로 하세요');
        }
        if (overallScore > 80) {
            recommendations.longTerm.push('고급 기술 습득을 목표로 하세요');
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
    static predictProgress(overallScore, categoryScores, studentId) {
        const improvementRate = 0.5;
        return {
            expectedImprovement: Math.round(overallScore * improvementRate * 0.1),
            timeToNextLevel: Math.round((100 - overallScore) / improvementRate),
            confidence: 0.7
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