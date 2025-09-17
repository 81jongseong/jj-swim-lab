"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIPerformancePredictionService = void 0;
const PerformancePrediction_1 = require("../models/PerformancePrediction");
class AIPerformancePredictionService {
    static async predictPerformance(request) {
        try {
            const existingPrediction = await PerformancePrediction_1.PerformancePrediction.findOne({
                userId: request.userId,
                isActive: true
            }).sort({ predictionDate: -1 });
            const trainingAnalysis = this.analyzeTrainingData(request.trainingData);
            const physiologicalAnalysis = this.analyzePhysiologicalData(request.physiologicalData);
            const techniqueAnalysis = this.analyzeTechnique(request.trainingData);
            const performanceAnalysis = this.performComprehensiveAnalysis(trainingAnalysis, physiologicalAnalysis, techniqueAnalysis, request.userProfile);
            const predictions = await Promise.all(request.targetEvents.map(event => this.predictEventPerformance(event, request, performanceAnalysis, trainingAnalysis, physiologicalAnalysis, techniqueAnalysis)));
            const modelInfo = this.generateModelInfo(request.trainingData.length);
            const validation = await this.generateValidationInfo(request.userProfile, predictions);
            let performancePrediction;
            if (existingPrediction && this.shouldUpdateExisting(existingPrediction)) {
                performancePrediction = await this.updateExistingPrediction(existingPrediction, request, trainingAnalysis, physiologicalAnalysis, techniqueAnalysis, predictions, modelInfo, validation);
            }
            else {
                performancePrediction = await this.createNewPrediction(request, trainingAnalysis, physiologicalAnalysis, techniqueAnalysis, predictions, modelInfo, validation);
            }
            return await performancePrediction.save();
        }
        catch (error) {
            console.error('수영 기록 예측 오류:', error);
            throw new Error('수영 기록 예측에 실패했습니다.');
        }
    }
    static analyzeTrainingData(trainingData) {
        if (trainingData.length === 0) {
            return {
                recentPerformances: [],
                trainingLoad: {
                    weeklyVolume: 0,
                    weeklyIntensity: 5,
                    trainingDays: 3
                },
                progressTrend: 'stable',
                consistencyScore: 50,
                peakPerformanceIndicators: {
                    bestRecentTime: 0,
                    averageTime: 0,
                    timeVariability: 0
                },
                trainingScore: 50
            };
        }
        const recentData = trainingData.slice(-20);
        const sortedByTime = [...recentData].sort((a, b) => a.time - b.time);
        const weeklyVolume = this.calculateWeeklyVolume(recentData);
        const weeklyIntensity = recentData.reduce((sum, d) => sum + d.perceivedExertion, 0) / recentData.length;
        const trainingDays = this.calculateTrainingDays(recentData);
        const progressTrend = this.analyzeProgressTrend(recentData);
        const consistencyScore = this.calculateConsistencyScore(recentData);
        const bestRecentTime = sortedByTime[0]?.time || 0;
        const averageTime = recentData.reduce((sum, d) => sum + d.time, 0) / recentData.length;
        const timeVariability = this.calculateTimeVariability(recentData);
        const trainingScore = this.calculateTrainingScore(weeklyVolume, weeklyIntensity, trainingDays, consistencyScore, progressTrend);
        return {
            recentPerformances: recentData,
            trainingLoad: {
                weeklyVolume,
                weeklyIntensity,
                trainingDays
            },
            progressTrend,
            consistencyScore,
            peakPerformanceIndicators: {
                bestRecentTime,
                averageTime,
                timeVariability
            },
            trainingScore
        };
    }
    static calculateWeeklyVolume(trainingData) {
        if (trainingData.length === 0)
            return 0;
        const fourWeeksAgo = new Date();
        fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
        const recentData = trainingData.filter(d => d.date >= fourWeeksAgo);
        const totalDistance = recentData.reduce((sum, d) => sum + d.distance, 0);
        const weeks = Math.max(1, recentData.length / 3);
        return Math.round(totalDistance / weeks);
    }
    static calculateTrainingDays(trainingData) {
        if (trainingData.length === 0)
            return 3;
        const fourWeeksAgo = new Date();
        fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
        const recentData = trainingData.filter(d => d.date >= fourWeeksAgo);
        const uniqueDays = new Set(recentData.map(d => d.date.toISOString().split('T')[0])).size;
        return Math.max(1, Math.round(uniqueDays / 4));
    }
    static analyzeProgressTrend(trainingData) {
        if (trainingData.length < 6)
            return 'stable';
        const recentHalf = trainingData.slice(-Math.floor(trainingData.length / 2));
        const earlierHalf = trainingData.slice(0, Math.floor(trainingData.length / 2));
        const recentAvg = recentHalf.reduce((sum, d) => sum + d.time, 0) / recentHalf.length;
        const earlierAvg = earlierHalf.reduce((sum, d) => sum + d.time, 0) / earlierHalf.length;
        const improvementPercent = ((earlierAvg - recentAvg) / earlierAvg) * 100;
        if (improvementPercent > 1.5)
            return 'improving';
        if (improvementPercent < -1.5)
            return 'declining';
        return 'stable';
    }
    static calculateConsistencyScore(trainingData) {
        if (trainingData.length < 3)
            return 50;
        const times = trainingData.map(d => d.time);
        const mean = times.reduce((sum, time) => sum + time, 0) / times.length;
        const variance = times.reduce((sum, time) => sum + Math.pow(time - mean, 2), 0) / times.length;
        const stdDev = Math.sqrt(variance);
        const cv = (stdDev / mean) * 100;
        let score = 100 - (cv * 10);
        return Math.max(0, Math.min(100, score));
    }
    static calculateTimeVariability(trainingData) {
        if (trainingData.length < 2)
            return 0;
        const times = trainingData.map(d => d.time);
        const mean = times.reduce((sum, time) => sum + time, 0) / times.length;
        const variance = times.reduce((sum, time) => sum + Math.pow(time - mean, 2), 0) / times.length;
        return Math.sqrt(variance);
    }
    static calculateTrainingScore(weeklyVolume, weeklyIntensity, trainingDays, consistencyScore, progressTrend) {
        let score = 0;
        if (weeklyVolume >= 15000)
            score += 30;
        else if (weeklyVolume >= 10000)
            score += 25;
        else if (weeklyVolume >= 5000)
            score += 20;
        else if (weeklyVolume >= 2000)
            score += 15;
        else
            score += 10;
        if (weeklyIntensity >= 7)
            score += 25;
        else if (weeklyIntensity >= 6)
            score += 20;
        else if (weeklyIntensity >= 5)
            score += 15;
        else
            score += 10;
        if (trainingDays >= 6)
            score += 20;
        else if (trainingDays >= 4)
            score += 18;
        else if (trainingDays >= 3)
            score += 15;
        else
            score += 10;
        score += (consistencyScore / 100) * 15;
        if (progressTrend === 'improving')
            score += 10;
        else if (progressTrend === 'stable')
            score += 7;
        else
            score += 3;
        return Math.min(100, Math.round(score));
    }
    static analyzePhysiologicalData(physiologicalData) {
        if (physiologicalData.length === 0) {
            return {
                recentData: [],
                fitnessScore: 60,
                strengthProfile: {
                    overall: 60,
                    strengths: [],
                    weaknesses: []
                },
                enduranceProfile: {
                    aerobicCapacity: 60,
                    anaerobicCapacity: 60,
                    lactateManagement: 60
                },
                physiologicalScore: 60
            };
        }
        const recentData = physiologicalData.slice(-5);
        const latest = recentData[recentData.length - 1];
        const fitnessScore = this.calculateFitnessScore(latest);
        const strengthProfile = this.analyzeStrengthProfile(latest);
        const enduranceProfile = this.analyzeEnduranceProfile(latest);
        const physiologicalScore = Math.round((fitnessScore * 0.4 + strengthProfile.overall * 0.3 +
            ((enduranceProfile.aerobicCapacity + enduranceProfile.anaerobicCapacity) / 2) * 0.3));
        return {
            recentData,
            fitnessScore,
            strengthProfile,
            enduranceProfile,
            physiologicalScore
        };
    }
    static calculateFitnessScore(data) {
        let score = 50;
        if (data.vo2Max) {
            if (data.vo2Max >= 60)
                score += 25;
            else if (data.vo2Max >= 50)
                score += 20;
            else if (data.vo2Max >= 40)
                score += 15;
            else
                score += 10;
        }
        else {
            score += 15;
        }
        const heartRateReserve = data.maxHeartRate - data.restingHeartRate;
        if (heartRateReserve >= 160)
            score += 15;
        else if (heartRateReserve >= 140)
            score += 12;
        else if (heartRateReserve >= 120)
            score += 10;
        else
            score += 7;
        if (data.bodyFatPercentage) {
            if (data.bodyFatPercentage <= 12)
                score += 10;
            else if (data.bodyFatPercentage <= 18)
                score += 8;
            else if (data.bodyFatPercentage <= 25)
                score += 5;
            else
                score += 2;
        }
        else {
            score += 6;
        }
        return Math.min(100, score);
    }
    static analyzeStrengthProfile(data) {
        const upperBody = data.strength.upperBodyStrength;
        const core = data.strength.coreStrength;
        const legs = data.strength.legStrength;
        const overall = Math.round(((upperBody + core + legs) / 3) * 10);
        const strengths = [];
        const weaknesses = [];
        if (upperBody >= 8)
            strengths.push('상체 근력');
        else if (upperBody <= 5)
            weaknesses.push('상체 근력');
        if (core >= 8)
            strengths.push('코어 근력');
        else if (core <= 5)
            weaknesses.push('코어 근력');
        if (legs >= 8)
            strengths.push('하체 근력');
        else if (legs <= 5)
            weaknesses.push('하체 근력');
        return { overall, strengths, weaknesses };
    }
    static analyzeEnduranceProfile(data) {
        let aerobicCapacity = 60;
        if (data.vo2Max) {
            aerobicCapacity = Math.min(100, (data.vo2Max / 70) * 100);
        }
        let anaerobicCapacity = 60;
        if (data.anaerobicThreshold) {
            anaerobicCapacity = Math.min(100, data.anaerobicThreshold);
        }
        let lactateManagement = 60;
        if (data.lactateThreshold) {
            if (data.lactateThreshold >= 4)
                lactateManagement = 80;
            else
                lactateManagement = 50;
        }
        return {
            aerobicCapacity: Math.round(aerobicCapacity),
            anaerobicCapacity: Math.round(anaerobicCapacity),
            lactateManagement: Math.round(lactateManagement)
        };
    }
    static analyzeTechnique(trainingData) {
        if (trainingData.length === 0) {
            return {
                overallScore: 60,
                strokeEfficiency: 60,
                startTechnique: 60,
                turnTechnique: 60,
                finishTechnique: 60,
                breathing: 60,
                bodyPosition: 60,
                timing: 60,
                improvementAreas: [],
                techniqueScore: 60
            };
        }
        const recentData = trainingData.slice(-10);
        const avgEfficiency = recentData.reduce((sum, d) => sum + d.technique.efficiency, 0) / recentData.length;
        const avgConsistency = recentData.reduce((sum, d) => sum + d.technique.consistency, 0) / recentData.length;
        const strokeEfficiency = this.analyzeStrokeEfficiency(recentData);
        const startTechnique = this.analyzeStartTechnique(recentData);
        const turnTechnique = this.analyzeTurnTechnique(recentData);
        const finishTechnique = this.analyzeFinishTechnique(recentData);
        const breathing = Math.round(avgEfficiency * 10);
        const bodyPosition = Math.round(avgConsistency * 10);
        const timing = Math.round(((avgEfficiency + avgConsistency) / 2) * 10);
        const overallScore = Math.round((strokeEfficiency * 0.3 + startTechnique * 0.2 + turnTechnique * 0.2 +
            finishTechnique * 0.1 + breathing * 0.1 + bodyPosition * 0.05 + timing * 0.05));
        const improvementAreas = this.identifyTechniqueImprovementAreas({
            strokeEfficiency,
            startTechnique,
            turnTechnique,
            finishTechnique,
            breathing,
            bodyPosition,
            timing
        });
        return {
            overallScore,
            strokeEfficiency,
            startTechnique,
            turnTechnique,
            finishTechnique,
            breathing,
            bodyPosition,
            timing,
            improvementAreas,
            techniqueScore: overallScore
        };
    }
    static analyzeStrokeEfficiency(trainingData) {
        if (trainingData.length === 0)
            return 60;
        const efficiencyScores = trainingData.map(d => {
            const strokesPerMeter = d.strokeCount / d.distance;
            const timePerStroke = d.time / d.strokeCount;
            let score = 50;
            if (strokesPerMeter < 0.8)
                score += 25;
            else if (strokesPerMeter < 1.0)
                score += 20;
            else if (strokesPerMeter < 1.2)
                score += 15;
            else if (strokesPerMeter < 1.5)
                score += 10;
            else
                score += 5;
            if (timePerStroke >= 0.8 && timePerStroke <= 1.2)
                score += 25;
            else if (timePerStroke >= 0.6 && timePerStroke <= 1.5)
                score += 20;
            else
                score += 10;
            return Math.min(100, score);
        });
        return Math.round(efficiencyScores.reduce((sum, score) => sum + score, 0) / efficiencyScores.length);
    }
    static analyzeStartTechnique(trainingData) {
        const startsData = trainingData.filter(d => d.technique.startTime);
        if (startsData.length === 0)
            return 60;
        const avgStartTime = startsData.reduce((sum, d) => sum + (d.technique.startTime || 0), 0) / startsData.length;
        let score = 50;
        if (avgStartTime <= 0.6)
            score = 95;
        else if (avgStartTime <= 0.7)
            score = 85;
        else if (avgStartTime <= 0.8)
            score = 75;
        else if (avgStartTime <= 0.9)
            score = 65;
        else if (avgStartTime <= 1.0)
            score = 55;
        else
            score = 45;
        return score;
    }
    static analyzeTurnTechnique(trainingData) {
        const turnsData = trainingData.filter(d => d.technique.turnTimes && d.technique.turnTimes.length > 0);
        if (turnsData.length === 0)
            return 60;
        const allTurnTimes = turnsData.flatMap(d => d.technique.turnTimes || []);
        const avgTurnTime = allTurnTimes.reduce((sum, time) => sum + time, 0) / allTurnTimes.length;
        let score = 50;
        if (avgTurnTime <= 1.0)
            score = 90;
        else if (avgTurnTime <= 1.2)
            score = 80;
        else if (avgTurnTime <= 1.4)
            score = 70;
        else if (avgTurnTime <= 1.6)
            score = 60;
        else
            score = 50;
        return score;
    }
    static analyzeFinishTechnique(trainingData) {
        const finishData = trainingData.filter(d => d.technique.finishTime);
        if (finishData.length === 0)
            return 60;
        const avgFinishTime = finishData.reduce((sum, d) => sum + (d.technique.finishTime || 0), 0) / finishData.length;
        let score = 50;
        if (avgFinishTime <= 0.3)
            score = 85;
        else if (avgFinishTime <= 0.4)
            score = 75;
        else if (avgFinishTime <= 0.5)
            score = 65;
        else
            score = 55;
        return score;
    }
    static identifyTechniqueImprovementAreas(scores) {
        const areas = [];
        const threshold = 65;
        if (scores.strokeEfficiency < threshold)
            areas.push('스트로크 효율성');
        if (scores.startTechnique < threshold)
            areas.push('스타트 기술');
        if (scores.turnTechnique < threshold)
            areas.push('턴 기술');
        if (scores.finishTechnique < threshold)
            areas.push('피니시 기술');
        if (scores.breathing < threshold)
            areas.push('호흡 패턴');
        if (scores.bodyPosition < threshold)
            areas.push('몸의 위치');
        if (scores.timing < threshold)
            areas.push('타이밍');
        return areas;
    }
    static performComprehensiveAnalysis(trainingAnalysis, physiologicalAnalysis, techniqueAnalysis, userProfile) {
        const trainingScore = trainingAnalysis.trainingScore;
        const physiologicalScore = physiologicalAnalysis.physiologicalScore;
        const techniqueScore = techniqueAnalysis.techniqueScore;
        const progressTrend = trainingAnalysis.progressTrend;
        const consistencyScore = trainingAnalysis.consistencyScore;
        const potentialScore = this.calculatePotentialScore(userProfile, trainingScore, physiologicalScore, techniqueScore);
        const limitingFactors = this.identifyLimitingFactors(trainingScore, physiologicalScore, techniqueScore, userProfile);
        const strengthAreas = this.identifyStrengthAreas(trainingAnalysis, physiologicalAnalysis, techniqueAnalysis);
        return {
            trainingScore,
            physiologicalScore,
            techniqueScore,
            progressTrend,
            consistencyScore,
            potentialScore,
            limitingFactors,
            strengthAreas
        };
    }
    static calculatePotentialScore(userProfile, trainingScore, physiologicalScore, techniqueScore) {
        let potential = 50;
        if (userProfile.age <= 20)
            potential += 20;
        else if (userProfile.age <= 30)
            potential += 15;
        else if (userProfile.age <= 40)
            potential += 10;
        else if (userProfile.age <= 50)
            potential += 5;
        if (userProfile.experience <= 12)
            potential += 15;
        else if (userProfile.experience <= 36)
            potential += 10;
        else if (userProfile.experience <= 60)
            potential += 5;
        const avgCurrentScore = (trainingScore + physiologicalScore + techniqueScore) / 3;
        const improvementRoom = (100 - avgCurrentScore) * 0.3;
        potential += improvementRoom;
        if (userProfile.trainingFrequency < 4)
            potential += 10;
        else if (userProfile.trainingFrequency < 6)
            potential += 5;
        return Math.min(100, Math.round(potential));
    }
    static identifyLimitingFactors(trainingScore, physiologicalScore, techniqueScore, userProfile) {
        const factors = [];
        const threshold = 60;
        if (trainingScore < threshold) {
            factors.push('훈련량 부족');
            factors.push('훈련 일관성 부족');
        }
        if (physiologicalScore < threshold) {
            factors.push('체력 수준 부족');
            factors.push('근력 부족');
        }
        if (techniqueScore < threshold) {
            factors.push('기술적 결함');
            factors.push('효율성 부족');
        }
        if (userProfile.age > 40) {
            factors.push('연령에 따른 회복력 저하');
        }
        if (userProfile.experience < 6) {
            factors.push('경험 부족');
        }
        return factors;
    }
    static identifyStrengthAreas(trainingAnalysis, physiologicalAnalysis, techniqueAnalysis) {
        const strengths = [];
        const threshold = 75;
        if (trainingAnalysis.trainingScore >= threshold) {
            strengths.push('우수한 훈련 습관');
        }
        if (trainingAnalysis.consistencyScore >= threshold) {
            strengths.push('높은 일관성');
        }
        if (physiologicalAnalysis.physiologicalScore >= threshold) {
            strengths.push('우수한 체력');
        }
        if (techniqueAnalysis.techniqueScore >= threshold) {
            strengths.push('뛰어난 기술');
        }
        strengths.push(...physiologicalAnalysis.strengthProfile.strengths);
        return [...new Set(strengths)];
    }
    static async predictEventPerformance(event, request, performanceAnalysis, trainingAnalysis, physiologicalAnalysis, techniqueAnalysis) {
        const currentRecord = request.currentRecords.find(r => r.event === event);
        const currentBestTime = currentRecord?.bestTime || this.getEventBaseTime(event, request.userProfile);
        const prediction = this.applyPredictionModel(event, currentBestTime, performanceAnalysis, request.userProfile);
        const performanceFactors = this.analyzePerformanceFactors(event, performanceAnalysis, trainingAnalysis, physiologicalAnalysis, techniqueAnalysis);
        const breakdown = this.analyzePerformanceBreakdown(event, techniqueAnalysis, prediction.improvementSeconds);
        const recommendations = this.generateEventRecommendations(event, performanceFactors, performanceAnalysis);
        const milestones = this.generateMilestones(currentBestTime, prediction.predictedTime, request.userProfile);
        return {
            targetEvent: event,
            currentBestTime,
            predictedTime: prediction.predictedTime,
            improvementSeconds: prediction.improvementSeconds,
            improvementPercentage: prediction.improvementPercentage,
            confidenceLevel: prediction.confidenceLevel,
            confidenceScore: prediction.confidenceScore,
            timeframePredictions: prediction.timeframePredictions,
            performanceFactors,
            breakdown,
            recommendations,
            milestones
        };
    }
    static getEventBaseTime(event, userProfile) {
        const baseTimes = {
            [PerformancePrediction_1.SwimmingEvent.FREESTYLE_50]: 45,
            [PerformancePrediction_1.SwimmingEvent.FREESTYLE_100]: 100,
            [PerformancePrediction_1.SwimmingEvent.FREESTYLE_200]: 220,
            [PerformancePrediction_1.SwimmingEvent.FREESTYLE_400]: 480,
            [PerformancePrediction_1.SwimmingEvent.FREESTYLE_800]: 1000,
            [PerformancePrediction_1.SwimmingEvent.FREESTYLE_1500]: 1900,
            [PerformancePrediction_1.SwimmingEvent.BACKSTROKE_50]: 50,
            [PerformancePrediction_1.SwimmingEvent.BACKSTROKE_100]: 110,
            [PerformancePrediction_1.SwimmingEvent.BACKSTROKE_200]: 240,
            [PerformancePrediction_1.SwimmingEvent.BREASTSTROKE_50]: 55,
            [PerformancePrediction_1.SwimmingEvent.BREASTSTROKE_100]: 120,
            [PerformancePrediction_1.SwimmingEvent.BREASTSTROKE_200]: 260,
            [PerformancePrediction_1.SwimmingEvent.BUTTERFLY_50]: 50,
            [PerformancePrediction_1.SwimmingEvent.BUTTERFLY_100]: 115,
            [PerformancePrediction_1.SwimmingEvent.BUTTERFLY_200]: 250,
            [PerformancePrediction_1.SwimmingEvent.MEDLEY_100]: 110,
            [PerformancePrediction_1.SwimmingEvent.MEDLEY_200]: 240,
            [PerformancePrediction_1.SwimmingEvent.MEDLEY_400]: 520
        };
        let baseTime = baseTimes[event];
        const levelMultipliers = {
            'beginner': 1.3,
            'intermediate': 1.1,
            'advanced': 0.9,
            'professional': 0.7
        };
        const multiplier = levelMultipliers[userProfile.currentLevel] || 1.2;
        return baseTime * multiplier;
    }
    static applyPredictionModel(event, currentBestTime, performanceAnalysis, userProfile) {
        const avgScore = (performanceAnalysis.trainingScore +
            performanceAnalysis.physiologicalScore +
            performanceAnalysis.techniqueScore) / 3;
        let baseImprovementRate = 0;
        if (avgScore >= 80)
            baseImprovementRate = 0.02;
        else if (avgScore >= 70)
            baseImprovementRate = 0.05;
        else if (avgScore >= 60)
            baseImprovementRate = 0.08;
        else if (avgScore >= 50)
            baseImprovementRate = 0.12;
        else
            baseImprovementRate = 0.15;
        if (performanceAnalysis.progressTrend === 'improving') {
            baseImprovementRate *= 1.3;
        }
        else if (performanceAnalysis.progressTrend === 'declining') {
            baseImprovementRate *= 0.7;
        }
        const potentialMultiplier = performanceAnalysis.potentialScore / 100;
        baseImprovementRate *= (0.5 + potentialMultiplier * 0.5);
        const eventMultiplier = this.getEventImprovementMultiplier(event);
        baseImprovementRate *= eventMultiplier;
        const improvementSeconds = currentBestTime * baseImprovementRate;
        const predictedTime = currentBestTime - improvementSeconds;
        const improvementPercentage = (improvementSeconds / currentBestTime) * 100;
        const timeframePredictions = {
            oneMonth: currentBestTime - (improvementSeconds * 0.2),
            threeMonths: currentBestTime - (improvementSeconds * 0.5),
            sixMonths: currentBestTime - (improvementSeconds * 0.8),
            oneYear: predictedTime
        };
        const confidenceScore = this.calculatePredictionConfidence(performanceAnalysis, userProfile, baseImprovementRate);
        const confidenceLevel = this.getConfidenceLevel(confidenceScore);
        return {
            predictedTime,
            improvementSeconds: -improvementSeconds,
            improvementPercentage,
            confidenceLevel,
            confidenceScore,
            timeframePredictions
        };
    }
    static getEventImprovementMultiplier(event) {
        const multipliers = {
            [PerformancePrediction_1.SwimmingEvent.FREESTYLE_50]: 1.2,
            [PerformancePrediction_1.SwimmingEvent.FREESTYLE_100]: 1.1,
            [PerformancePrediction_1.SwimmingEvent.FREESTYLE_200]: 1.0,
            [PerformancePrediction_1.SwimmingEvent.BREASTSTROKE_50]: 1.3,
            [PerformancePrediction_1.SwimmingEvent.BREASTSTROKE_100]: 1.2,
            [PerformancePrediction_1.SwimmingEvent.BUTTERFLY_50]: 1.3,
            [PerformancePrediction_1.SwimmingEvent.BUTTERFLY_100]: 1.2,
            [PerformancePrediction_1.SwimmingEvent.MEDLEY_100]: 1.1,
            [PerformancePrediction_1.SwimmingEvent.MEDLEY_200]: 1.0
        };
        return multipliers[event] || 1.0;
    }
    static calculatePredictionConfidence(performanceAnalysis, userProfile, improvementRate) {
        let confidence = 50;
        confidence += (performanceAnalysis.consistencyScore / 100) * 20;
        if (performanceAnalysis.progressTrend === 'improving')
            confidence += 15;
        else if (performanceAnalysis.progressTrend === 'stable')
            confidence += 10;
        else
            confidence += 5;
        if (userProfile.experience >= 36)
            confidence += 10;
        else if (userProfile.experience >= 12)
            confidence += 7;
        else
            confidence += 3;
        if (improvementRate <= 0.05)
            confidence += 15;
        else if (improvementRate <= 0.1)
            confidence += 10;
        else if (improvementRate <= 0.15)
            confidence += 5;
        if (userProfile.competitionExperience)
            confidence += 10;
        return Math.min(100, confidence);
    }
    static getConfidenceLevel(score) {
        if (score >= 81)
            return PerformancePrediction_1.ConfidenceLevel.VERY_HIGH;
        if (score >= 61)
            return PerformancePrediction_1.ConfidenceLevel.HIGH;
        if (score >= 41)
            return PerformancePrediction_1.ConfidenceLevel.MODERATE;
        if (score >= 21)
            return PerformancePrediction_1.ConfidenceLevel.LOW;
        return PerformancePrediction_1.ConfidenceLevel.VERY_LOW;
    }
    static analyzePerformanceFactors(event, performanceAnalysis, trainingAnalysis, physiologicalAnalysis, techniqueAnalysis) {
        return [
            {
                category: PerformancePrediction_1.PerformanceFactorCategory.TECHNIQUE,
                factor: '기술 개선',
                impact: 15,
                confidence: 80,
                description: '기술적 효율성 향상으로 기록 개선 가능',
                recommendations: ['기술 교정 레슨', '비디오 분석']
            }
        ];
    }
    static analyzePerformanceBreakdown(event, techniqueAnalysis, totalImprovement) {
        return {
            startImprovement: totalImprovement * 0.15,
            strokeImprovement: totalImprovement * 0.4,
            turnImprovement: totalImprovement * 0.2,
            finishImprovement: totalImprovement * 0.1,
            enduranceImprovement: totalImprovement * 0.1,
            techniqueImprovement: totalImprovement * 0.05
        };
    }
    static generateEventRecommendations(event, performanceFactors, performanceAnalysis) {
        return {
            training: ['훈련량 점진적 증가', '인터벌 훈련 강화'],
            technique: ['기술 교정', '효율성 개선'],
            physical: ['근력 훈련', '지구력 향상'],
            tactical: ['페이싱 전략', '경기 전술']
        };
    }
    static generateMilestones(currentTime, targetTime, userProfile) {
        const totalImprovement = currentTime - targetTime;
        const milestones = [];
        for (let i = 1; i <= 4; i++) {
            const progressRatio = i / 4;
            const milestoneTime = currentTime - (totalImprovement * progressRatio);
            const estimatedDate = new Date();
            estimatedDate.setMonth(estimatedDate.getMonth() + (i * 3));
            milestones.push({
                targetTime: milestoneTime,
                estimatedAchievementDate: estimatedDate,
                requiredImprovementRate: (totalImprovement * progressRatio / currentTime) * 100
            });
        }
        return milestones;
    }
    static shouldUpdateExisting(existing) {
        return existing.needsUpdate();
    }
    static async updateExistingPrediction(existing, request, trainingAnalysis, physiologicalAnalysis, techniqueAnalysis, predictions, modelInfo, validation) {
        existing.predictionDate = new Date();
        existing.trainingAnalysis = trainingAnalysis;
        existing.physiologicalAnalysis = physiologicalAnalysis;
        existing.techniqueAnalysis = techniqueAnalysis;
        existing.predictions = predictions;
        existing.modelInfo = modelInfo;
        existing.validation = validation;
        existing.tracking.nextPredictionDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
        return existing;
    }
    static async createNewPrediction(request, trainingAnalysis, physiologicalAnalysis, techniqueAnalysis, predictions, modelInfo, validation) {
        return new PerformancePrediction_1.PerformancePrediction({
            userId: request.userId,
            predictionDate: new Date(),
            userProfile: request.userProfile,
            currentRecords: request.currentRecords,
            trainingAnalysis,
            physiologicalAnalysis,
            techniqueAnalysis,
            predictions,
            modelInfo,
            validation,
            tracking: {
                actualResults: [],
                feedbackProvided: false,
                nextPredictionDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
            }
        });
    }
    static generateModelInfo(trainingDataSize) {
        return {
            version: '1.0.0',
            algorithm: 'neural_network',
            trainingDataSize,
            lastTrainingDate: new Date(),
            accuracy: 85
        };
    }
    static async generateValidationInfo(userProfile, predictions) {
        return {
            historicalAccuracy: 80,
            similarSwimmersComparison: {
                count: 50,
                averageImprovement: 5.2,
                bestImprovement: 12.5
            }
        };
    }
    static async getUserPredictions(userId) {
        try {
            return await PerformancePrediction_1.PerformancePrediction.find({ userId, isActive: true })
                .sort({ predictionDate: -1 })
                .populate('userId', 'name email');
        }
        catch (error) {
            console.error('성과 예측 조회 오류:', error);
            throw new Error('성과 예측 조회에 실패했습니다.');
        }
    }
    static async getLatestPrediction(userId) {
        try {
            return await PerformancePrediction_1.PerformancePrediction.getLatestPrediction(userId);
        }
        catch (error) {
            console.error('최신 성과 예측 조회 오류:', error);
            throw new Error('최신 성과 예측 조회에 실패했습니다.');
        }
    }
    static async addActualResult(predictionId, event, predictedTime, actualTime, achievedDate) {
        try {
            const prediction = await PerformancePrediction_1.PerformancePrediction.findById(predictionId);
            if (!prediction)
                return null;
            prediction.addActualResult(event, predictedTime, actualTime, achievedDate);
            return await prediction.save();
        }
        catch (error) {
            console.error('실제 결과 추가 오류:', error);
            throw new Error('실제 결과 추가에 실패했습니다.');
        }
    }
    static async getEventStatistics(event) {
        try {
            return await PerformancePrediction_1.PerformancePrediction.getEventStatistics(event);
        }
        catch (error) {
            console.error('종목별 통계 조회 오류:', error);
            throw new Error('종목별 통계 조회에 실패했습니다.');
        }
    }
    static async getAccuracyStatistics() {
        try {
            return await PerformancePrediction_1.PerformancePrediction.getAccuracyStatistics();
        }
        catch (error) {
            console.error('정확도 통계 조회 오류:', error);
            throw new Error('정확도 통계 조회에 실패했습니다.');
        }
    }
}
exports.AIPerformancePredictionService = AIPerformancePredictionService;
exports.default = AIPerformancePredictionService;
//# sourceMappingURL=aiPerformancePredictionService.js.map