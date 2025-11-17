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
            const feedback = this.buildFeedback(overallScore, strengths, weaknesses, criteria);
            const recommendations = this.buildRecommendations(analysisResult, criteria);
            await this.persistAnalysisResult(input, analysisResult, feedback, recommendations).catch(() => undefined);
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
        const frames = frameAnalysis.analyzedFrames || [];
        const targetAlignment = criteria?.analysisThresholds?.posture?.alignment ?? 90;
        const targetRotation = criteria?.analysisThresholds?.posture?.rotation ?? 0;
        const targetDeviation = criteria?.analysisThresholds?.posture?.deviation ?? 5;
        const aggregates = frames.reduce((acc, frame) => {
            acc.alignment += frame.poseData?.angles?.shoulder ?? targetAlignment;
            acc.rotation += frame.poseData?.angles?.hip ?? targetRotation;
            acc.deviation += Math.abs((frame.poseData?.distances?.shoulderWidth ?? 0) - (frame.poseData?.distances?.bodyLength ?? 0) / 3);
            return acc;
        }, { alignment: 0, rotation: 0, deviation: 0 });
        const count = Math.max(1, frames.length);
        const avgAlignment = aggregates.alignment / count;
        const avgRotation = aggregates.rotation / count;
        const avgDeviation = aggregates.deviation / count;
        const alignmentScore = Math.max(0, 100 - Math.abs(avgAlignment - targetAlignment));
        const rotationScore = Math.max(0, 100 - Math.abs(avgRotation - targetRotation));
        const deviationScore = Math.max(0, 100 - Math.abs(avgDeviation - targetDeviation) * 10);
        const score = Math.round((alignmentScore * 0.5) + (rotationScore * 0.3) + (deviationScore * 0.2));
        const postureSuggestions = criteria?.improvementSuggestions?.posture ?? [];
        const feedback = score >= 80
            ? (criteria?.feedbackTemplates?.excellent?.[0] ?? '우수한 자세를 유지하고 있습니다.')
            : (postureSuggestions[0] ?? '자세 개선이 필요합니다.');
        return {
            score,
            details: {
                spineAlignment: Math.round(avgAlignment),
                bodyRotation: Math.round(avgRotation),
                lateralDeviation: Math.round(avgDeviation)
            },
            feedback
        };
    }
    static async analyzeBreathing(frameAnalysis, criteria) {
        const frames = frameAnalysis.analyzedFrames || [];
        const targetRate = criteria?.analysisThresholds?.breathing?.rate ?? 18;
        const targetTiming = criteria?.analysisThresholds?.breathing?.timing ?? 80;
        const targetRotation = criteria?.analysisThresholds?.breathing?.rotation ?? 70;
        const aggregates = frames.reduce((acc, frame) => {
            const movement = frame.movementData || {};
            acc.rate += (movement.velocity ?? 0) * 10;
            acc.timing += (frame.timestamp % 2) * 100;
            acc.rotation += frame.poseData?.angles?.neck ?? targetRotation;
            return acc;
        }, { rate: 0, timing: 0, rotation: 0 });
        const count = Math.max(1, frames.length);
        const avgRate = aggregates.rate / count;
        const avgTiming = aggregates.timing / count;
        const avgRotation = aggregates.rotation / count;
        const rateScore = Math.max(0, 100 - Math.abs(avgRate - targetRate) * 3);
        const timingScore = Math.max(0, 100 - Math.abs(avgTiming - targetTiming));
        const rotationScore = Math.max(0, 100 - Math.abs(avgRotation - targetRotation));
        const score = Math.round((rateScore * 0.3) + (timingScore * 0.4) + (rotationScore * 0.3));
        const breathingSuggestions = criteria?.improvementSuggestions?.breathing ?? [];
        const feedback = score >= 80
            ? (criteria?.feedbackTemplates?.good?.[0] ?? '적절한 호흡 패턴을 보이고 있습니다.')
            : (breathingSuggestions[0] ?? '호흡 타이밍 개선이 필요합니다.');
        return {
            score,
            details: {
                breathingRate: parseFloat(avgRate.toFixed(1)),
                breathingTiming: Math.round(avgTiming),
                headRotation: Math.round(avgRotation)
            },
            feedback
        };
    }
    static async analyzeMovement(frameAnalysis, criteria) {
        const frames = frameAnalysis.analyzedFrames || [];
        const aggregates = frames.reduce((acc, frame) => {
            const movement = frame.movementData || {};
            acc.strokeRate += movement.velocity ?? 0;
            acc.strokeLength += (movement.stability ?? 0.7) * 2;
            acc.trajectory += frame.poseData?.angles?.elbow ?? 90;
            acc.entry += frame.poseData?.angles?.shoulder ?? 80;
            return acc;
        }, { strokeRate: 0, strokeLength: 0, trajectory: 0, entry: 0 });
        const count = Math.max(1, frames.length);
        const avgStrokeRate = aggregates.strokeRate / count;
        const avgStrokeLength = aggregates.strokeLength / count;
        const avgTrajectory = aggregates.trajectory / count;
        const avgEntry = aggregates.entry / count;
        const rateTarget = criteria?.analysisThresholds?.movement?.strokeRate ?? 1.2;
        const lengthTarget = criteria?.analysisThresholds?.movement?.strokeLength ?? 2.0;
        const rateScore = Math.max(0, 100 - Math.abs(avgStrokeRate - rateTarget) * 40);
        const lengthScore = Math.max(0, 100 - Math.abs(avgStrokeLength - lengthTarget) * 30);
        const techniqueScore = Math.max(0, 100 - Math.abs(avgTrajectory - 90));
        const entryScore = Math.max(0, 100 - Math.abs(avgEntry - 80));
        const score = Math.round(rateScore * 0.25 + lengthScore * 0.25 + techniqueScore * 0.25 + entryScore * 0.25);
        const movementSuggestions = criteria?.improvementSuggestions?.movement ?? [];
        const feedback = score >= 80
            ? (criteria?.feedbackTemplates?.excellent?.[0] ?? '효율적인 동작을 보이고 있습니다.')
            : (movementSuggestions[0] ?? '동작 개선이 필요합니다.');
        return {
            score,
            details: {
                strokeRate: parseFloat(avgStrokeRate.toFixed(2)),
                strokeLength: parseFloat(avgStrokeLength.toFixed(2)),
                armTrajectory: Math.round(avgTrajectory),
                handEntryAngle: Math.round(avgEntry)
            },
            feedback
        };
    }
    static async analyzeEfficiency(frameAnalysis, criteria) {
        const frames = frameAnalysis.analyzedFrames || [];
        const aggregates = frames.reduce((acc, frame) => {
            const movement = frame.movementData || {};
            acc.drag += Math.abs((movement.velocity ?? 0) - (movement.acceleration ?? 0.1));
            acc.propulsion += movement.stability ?? 0.7;
            acc.energy += (movement.velocity ?? 0) * (movement.acceleration ?? 0.1) * 10;
            return acc;
        }, { drag: 0, propulsion: 0, energy: 0 });
        const count = Math.max(1, frames.length);
        const avgDrag = aggregates.drag / count;
        const avgPropulsion = aggregates.propulsion / count;
        const avgEnergy = aggregates.energy / count;
        const dragTarget = criteria?.analysisThresholds?.efficiency?.drag ?? 0.3;
        const propulsionTarget = criteria?.analysisThresholds?.efficiency?.propulsion ?? 0.7;
        const energyTarget = criteria?.analysisThresholds?.efficiency?.energy ?? 20;
        const dragScore = Math.max(0, 100 - Math.abs(avgDrag - dragTarget) * 120);
        const propulsionScore = Math.max(0, 100 - Math.abs(avgPropulsion - propulsionTarget) * 80);
        const energyScore = Math.max(0, 100 - Math.abs(avgEnergy - energyTarget) * 2);
        const score = Math.round(dragScore * 0.3 + propulsionScore * 0.4 + energyScore * 0.3);
        const efficiencySuggestions = criteria?.improvementSuggestions?.efficiency ?? [];
        const feedback = score >= 80
            ? (criteria?.feedbackTemplates?.good?.[1] ?? '높은 수영 효율을 보이고 있습니다.')
            : (efficiencySuggestions[0] ?? '효율성 개선이 필요합니다.');
        return {
            score,
            details: {
                dragCoefficient: parseFloat(avgDrag.toFixed(3)),
                propulsionEfficiency: parseFloat(avgPropulsion.toFixed(2)),
                energyExpenditure: parseFloat(avgEnergy.toFixed(1))
            },
            feedback
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
        const totalFrames = frameAnalysis.analyzedFrames.length;
        const interval = Math.max(1, Math.floor(totalFrames / 10));
        for (let i = 0; i < totalFrames; i += interval) {
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
    static buildFeedback(overallScore, strengths, weaknesses, criteria) {
        const summary = `전체 점수: ${overallScore}점`;
        const detailedTemplate = overallScore >= 80
            ? criteria?.feedbackTemplates?.excellent?.[0] ?? '우수한 기술을 보여주고 있습니다.'
            : criteria?.feedbackTemplates?.average?.[0] ?? '안정적인 실력을 유지하고 있습니다.';
        const encouragement = overallScore >= 80
            ? criteria?.feedbackTemplates?.excellent?.[1] ?? '현재 페이스를 유지하세요!'
            : criteria?.feedbackTemplates?.good?.[1] ?? '꾸준한 연습으로 더 향상될 수 있습니다.';
        const goals = weaknesses.length > 0 ? weaknesses.map(item => `${item} 달성`) : ['현재 실력 유지'];
        return {
            summary,
            detailedFeedback: detailedTemplate,
            encouragement,
            goals
        };
    }
    static buildRecommendations(analysisResult, criteria) {
        const exercises = (analysisResult.improvementAreas.length ? analysisResult.improvementAreas : ['기본기 강화']).map((area, index) => ({
            name: area.replace(' 필요', ' 드릴'),
            priority: index === 0 ? 'high' : index === 1 ? 'medium' : 'low',
            reason: `${area} 개선을 위한 맞춤 훈련`,
            duration: 15 + index * 5
        }));
        const defaultPlan = criteria?.recommendedWorkouts?.[0];
        const workoutPlan = defaultPlan ? {
            name: defaultPlan.name,
            description: defaultPlan.description,
            duration: defaultPlan.duration,
            frequency: defaultPlan.frequency
        } : {
            name: '표준 수영 훈련 계획',
            description: '기본 기술 강화와 호흡 패턴 개선을 위한 프로그램',
            duration: 60,
            frequency: 3
        };
        return {
            exercises,
            workoutPlan,
            nextAnalysisDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14)
        };
    }
    static async persistAnalysisResult(input, analysisResult, feedback, recommendations) {
        await VideoAnalysisCriteria_1.VideoAnalysisResult.create({
            studentId: input.studentId,
            instructorId: input.instructorId,
            videoId: input.videoId,
            technique: input.technique,
            level: input.level,
            videoMetadata: input.videoMetadata,
            analysisResult,
            recommendations: {
                exercises: recommendations.exercises,
                workoutPlan: recommendations.workoutPlan,
                nextAnalysisDate: recommendations.nextAnalysisDate
            },
            feedback,
            filePaths: {
                video3D: undefined,
                originalFrames: [],
                depthMaps: [],
                reconstructed3D: []
            },
            analysisDate: new Date()
        });
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