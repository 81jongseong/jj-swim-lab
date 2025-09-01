"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoAnalysisAIEngine = void 0;
const VideoAnalysisCriteria_1 = require("../models/VideoAnalysisCriteria");
const logger_1 = require("./logger");
class VideoAnalysisAIEngine {
    static async analyzeVideo(input) {
        try {
            (0, logger_1.logInfo)('🎬 비디오 분석 시작', { studentId: input.studentId, technique: input.technique });
            const startTime = Date.now();
            const criteria = await this.getAnalysisCriteria(input.technique, input.level);
            if (!criteria) {
                return {
                    success: false,
                    message: '분석 기준을 찾을 수 없습니다.'
                };
            }
            const frameAnalysis = await this.analyzeVideoFrames(input);
            const postureAnalysis = await this.analyzePosture(frameAnalysis, criteria);
            const breathingAnalysis = await this.analyzeBreathing(frameAnalysis, criteria);
            const movementAnalysis = await this.analyzeMovement(frameAnalysis, criteria);
            const efficiencyAnalysis = await this.analyzeEfficiency(frameAnalysis, criteria);
            const overallScore = this.calculateOverallScore({
                posture: postureAnalysis.score,
                breathing: breathingAnalysis.score,
                movement: movementAnalysis.score,
                efficiency: efficiencyAnalysis.score
            });
            const strengths = this.identifyStrengths({
                posture: postureAnalysis.score,
                breathing: breathingAnalysis.score,
                movement: movementAnalysis.score,
                efficiency: efficiencyAnalysis.score
            });
            const weaknesses = this.identifyWeaknesses({
                posture: postureAnalysis.score,
                breathing: breathingAnalysis.score,
                movement: movementAnalysis.score,
                efficiency: efficiencyAnalysis.score
            });
            const keyFrames = this.extractKeyFrames(frameAnalysis);
            const analysisResult = {
                overallScore,
                categoryScores: {
                    posture: postureAnalysis.score,
                    breathing: breathingAnalysis.score,
                    movement: movementAnalysis.score,
                    efficiency: efficiencyAnalysis.score
                },
                detailedAnalysis: {
                    posture: postureAnalysis,
                    breathing: breathingAnalysis,
                    movement: movementAnalysis,
                    efficiency: efficiencyAnalysis
                },
                keyFrames,
                strengths,
                weaknesses,
                improvementAreas: weaknesses
            };
            const duration = Date.now() - startTime;
            (0, logger_1.logPerformance)(`비디오 분석 완료: ${input.studentId}`, { studentId: input.studentId, overallScore, duration });
            return {
                success: true,
                data: analysisResult
            };
        }
        catch (error) {
            (0, logger_1.logError)('비디오 분석 오류', error);
            return {
                success: false,
                message: '비디오 분석 중 오류가 발생했습니다.'
            };
        }
    }
    static async getAnalysisCriteria(technique, level) {
        try {
            const criteria = await VideoAnalysisCriteria_1.VideoAnalysisCriteria.findOne({
                technique,
                level,
                isActive: true
            });
            return criteria;
        }
        catch (error) {
            (0, logger_1.logError)('분석 기준 조회 오류', error);
            return null;
        }
    }
    static async analyzeVideoFrames(input) {
        const frameCount = Math.floor(input.videoMetadata.duration * input.videoMetadata.frameRate);
        const frames = [];
        for (let i = 0; i < frameCount; i += 30) {
            frames.push({
                frameNumber: i,
                timestamp: i / input.videoMetadata.frameRate,
                bodyLandmarks: this.generateSimulatedBodyLandmarks(),
                poseData: this.generateSimulatedPoseData(),
                movementData: this.generateSimulatedMovementData()
            });
        }
        return {
            totalFrames: frameCount,
            analyzedFrames: frames,
            frameRate: input.videoMetadata.frameRate
        };
    }
    static async analyzePosture(frameAnalysis, criteria) {
        const score = 70 + Math.random() * 30;
        return {
            score: Math.round(score),
            details: {
                spineAlignment: 75 + Math.random() * 25,
                bodyRotation: 70 + Math.random() * 30,
                lateralDeviation: 80 + Math.random() * 20
            },
            feedback: score >= 80 ? '우수한 자세를 유지하고 있습니다.' : '자세 개선이 필요합니다.'
        };
    }
    static async analyzeBreathing(frameAnalysis, criteria) {
        const score = 65 + Math.random() * 35;
        return {
            score: Math.round(score),
            details: {
                breathingRate: 20 + Math.random() * 10,
                breathingTiming: 70 + Math.random() * 30,
                headRotation: 75 + Math.random() * 25
            },
            feedback: score >= 80 ? '적절한 호흡 패턴을 보이고 있습니다.' : '호흡 타이밍 개선이 필요합니다.'
        };
    }
    static async analyzeMovement(frameAnalysis, criteria) {
        const score = 60 + Math.random() * 40;
        return {
            score: Math.round(score),
            details: {
                strokeRate: 60 + Math.random() * 20,
                strokeLength: 2.0 + Math.random() * 0.5,
                armTrajectory: 70 + Math.random() * 30,
                handEntryAngle: 75 + Math.random() * 25
            },
            feedback: score >= 80 ? '효율적인 동작을 보이고 있습니다.' : '동작 개선이 필요합니다.'
        };
    }
    static async analyzeEfficiency(frameAnalysis, criteria) {
        const score = 55 + Math.random() * 45;
        return {
            score: Math.round(score),
            details: {
                dragCoefficient: 0.5 + Math.random() * 0.3,
                propulsionEfficiency: 0.6 + Math.random() * 0.4,
                energyExpenditure: 0.7 + Math.random() * 0.3
            },
            feedback: score >= 80 ? '높은 수영 효율을 보이고 있습니다.' : '효율성 개선이 필요합니다.'
        };
    }
    static calculateOverallScore(scores) {
        const weights = { posture: 0.3, breathing: 0.2, movement: 0.3, efficiency: 0.2 };
        const weightedScore = scores.posture * weights.posture +
            scores.breathing * weights.breathing +
            scores.movement * weights.movement +
            scores.efficiency * weights.efficiency;
        return Math.round(weightedScore);
    }
    static identifyStrengths(scores) {
        const strengths = [];
        if (scores.posture >= 80)
            strengths.push('우수한 자세 유지');
        if (scores.breathing >= 80)
            strengths.push('적절한 호흡 패턴');
        if (scores.movement >= 80)
            strengths.push('효율적인 동작');
        if (scores.efficiency >= 80)
            strengths.push('높은 수영 효율');
        return strengths;
    }
    static identifyWeaknesses(scores) {
        const weaknesses = [];
        if (scores.posture < 60)
            weaknesses.push('자세 개선 필요');
        if (scores.breathing < 60)
            weaknesses.push('호흡 패턴 개선 필요');
        if (scores.movement < 60)
            weaknesses.push('동작 개선 필요');
        if (scores.efficiency < 60)
            weaknesses.push('효율성 개선 필요');
        return weaknesses;
    }
    static extractKeyFrames(frameAnalysis) {
        const keyFrames = [];
        const interval = Math.floor(frameAnalysis.analyzedFrames.length / 10);
        for (let i = 0; i < frameAnalysis.analyzedFrames.length; i += interval) {
            const frame = frameAnalysis.analyzedFrames[i];
            keyFrames.push({
                frameNumber: frame.frameNumber,
                timestamp: frame.timestamp,
                analysis: `프레임 ${frame.frameNumber} 분석 결과`,
                score: 70 + Math.random() * 30
            });
        }
        return keyFrames;
    }
    static generateSimulatedBodyLandmarks() {
        return {
            nose: { x: 50 + Math.random() * 10, y: 30 + Math.random() * 10 },
            leftShoulder: { x: 30 + Math.random() * 10, y: 50 + Math.random() * 10 },
            rightShoulder: { x: 70 + Math.random() * 10, y: 50 + Math.random() * 10 },
            leftElbow: { x: 25 + Math.random() * 10, y: 70 + Math.random() * 10 },
            rightElbow: { x: 75 + Math.random() * 10, y: 70 + Math.random() * 10 },
            leftWrist: { x: 20 + Math.random() * 10, y: 90 + Math.random() * 10 },
            rightWrist: { x: 80 + Math.random() * 10, y: 90 + Math.random() * 10 },
            leftHip: { x: 40 + Math.random() * 10, y: 80 + Math.random() * 10 },
            rightHip: { x: 60 + Math.random() * 10, y: 80 + Math.random() * 10 },
            leftKnee: { x: 35 + Math.random() * 10, y: 95 + Math.random() * 10 },
            rightKnee: { x: 65 + Math.random() * 10, y: 95 + Math.random() * 10 },
            leftAnkle: { x: 30 + Math.random() * 10, y: 100 + Math.random() * 10 },
            rightAnkle: { x: 70 + Math.random() * 10, y: 100 + Math.random() * 10 }
        };
    }
    static generateSimulatedPoseData() {
        return {
            confidence: 0.8 + Math.random() * 0.2,
            angles: {
                shoulder: Math.random() * 180,
                elbow: Math.random() * 180,
                hip: Math.random() * 180,
                knee: Math.random() * 180
            },
            distances: {
                shoulderWidth: 20 + Math.random() * 10,
                bodyLength: 60 + Math.random() * 20
            }
        };
    }
    static generateSimulatedMovementData() {
        return {
            velocity: 1.0 + Math.random() * 0.5,
            acceleration: 0.1 + Math.random() * 0.2,
            direction: Math.random() * 360,
            stability: 0.7 + Math.random() * 0.3
        };
    }
}
exports.VideoAnalysisAIEngine = VideoAnalysisAIEngine;
//# sourceMappingURL=VideoAnalysisAIEngine.js.map