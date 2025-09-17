"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const aiPerformancePredictionService_1 = require("../services/aiPerformancePredictionService");
const PerformancePrediction_1 = require("../models/PerformancePrediction");
const mongoose_1 = __importDefault(require("mongoose"));
const router = express_1.default.Router();
router.post('/predict', auth_1.authMiddleware, async (req, res) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            return res.status(401).json({ error: '인증이 필요합니다.' });
        }
        const { userProfile, currentRecords, trainingData, physiologicalData, targetEvents } = req.body;
        if (!userProfile || !trainingData || !targetEvents) {
            return res.status(400).json({
                error: '필수 정보가 누락되었습니다.',
                required: ['userProfile', 'trainingData', 'targetEvents']
            });
        }
        const predictionRequest = {
            userId: new mongoose_1.default.Types.ObjectId(userId),
            userProfile: {
                age: parseInt(userProfile.age) || 25,
                weight: parseFloat(userProfile.weight) || 70,
                height: parseFloat(userProfile.height) || 170,
                experience: parseInt(userProfile.experience) || 0,
                currentLevel: userProfile.currentLevel || 'beginner',
                dominantStroke: userProfile.dominantStroke || PerformancePrediction_1.SwimmingEvent.FREESTYLE_100,
                trainingFrequency: parseInt(userProfile.trainingFrequency) || 3,
                competitionExperience: userProfile.competitionExperience || false
            },
            currentRecords: (currentRecords || []).map((record) => ({
                event: record.event,
                bestTime: parseFloat(record.bestTime),
                achievedDate: new Date(record.achievedDate),
                conditions: record.conditions || 'practice'
            })),
            trainingData: trainingData.map((data) => ({
                date: new Date(data.date),
                event: data.event,
                time: parseFloat(data.time),
                distance: parseInt(data.distance) || 100,
                strokeCount: parseInt(data.strokeCount) || 50,
                strokeRate: parseInt(data.strokeRate) || 30,
                splitTimes: data.splitTimes ? data.splitTimes.map((t) => parseFloat(t)) : [],
                heartRateAvg: data.heartRateAvg ? parseInt(data.heartRateAvg) : undefined,
                heartRateMax: data.heartRateMax ? parseInt(data.heartRateMax) : undefined,
                lactateLevel: data.lactateLevel ? parseFloat(data.lactateLevel) : undefined,
                perceivedExertion: parseInt(data.perceivedExertion) || 5,
                conditions: {
                    poolLength: parseInt(data.conditions?.poolLength) || 25,
                    waterTemp: parseFloat(data.conditions?.waterTemp) || 26,
                    weather: data.conditions?.weather,
                    competition: data.conditions?.competition || false
                },
                technique: {
                    efficiency: parseInt(data.technique?.efficiency) || 5,
                    consistency: parseInt(data.technique?.consistency) || 5,
                    startTime: data.technique?.startTime ? parseFloat(data.technique.startTime) : undefined,
                    turnTimes: data.technique?.turnTimes ? data.technique.turnTimes.map((t) => parseFloat(t)) : undefined,
                    finishTime: data.technique?.finishTime ? parseFloat(data.technique.finishTime) : undefined
                }
            })),
            physiologicalData: (physiologicalData || []).map((data) => ({
                date: new Date(data.date),
                vo2Max: data.vo2Max ? parseFloat(data.vo2Max) : undefined,
                anaerobicThreshold: data.anaerobicThreshold ? parseFloat(data.anaerobicThreshold) : undefined,
                lactateThreshold: data.lactateThreshold ? parseFloat(data.lactateThreshold) : undefined,
                restingHeartRate: parseInt(data.restingHeartRate) || 60,
                maxHeartRate: parseInt(data.maxHeartRate) || 190,
                bodyFatPercentage: data.bodyFatPercentage ? parseFloat(data.bodyFatPercentage) : undefined,
                muscleMass: data.muscleMass ? parseFloat(data.muscleMass) : undefined,
                flexibility: {
                    shoulderFlexibility: parseInt(data.flexibility?.shoulderFlexibility) || 7,
                    ankleFlexibility: parseInt(data.flexibility?.ankleFlexibility) || 7,
                    spinalFlexibility: parseInt(data.flexibility?.spinalFlexibility) || 7
                },
                strength: {
                    upperBodyStrength: parseInt(data.strength?.upperBodyStrength) || 7,
                    coreStrength: parseInt(data.strength?.coreStrength) || 7,
                    legStrength: parseInt(data.strength?.legStrength) || 7
                }
            })),
            targetEvents: targetEvents
        };
        const prediction = await aiPerformancePredictionService_1.AIPerformancePredictionService.predictPerformance(predictionRequest);
        res.status(201).json({
            message: 'AI 수영 기록 예측이 성공적으로 완료되었습니다.',
            data: prediction
        });
    }
    catch (error) {
        console.error('AI 수영 기록 예측 오류:', error);
        res.status(500).json({
            error: 'AI 수영 기록 예측에 실패했습니다.',
            details: error instanceof Error ? error.message : '알 수 없는 오류'
        });
    }
});
router.get('/user/:userId', auth_1.authMiddleware, async (req, res) => {
    try {
        const { userId } = req.params;
        const requestUserId = req.user?._id;
        if (userId !== requestUserId && req.user?.userType !== 'superAdmin' && req.user?.userType !== 'centerAdmin') {
            return res.status(403).json({ error: '접근 권한이 없습니다.' });
        }
        const predictions = await aiPerformancePredictionService_1.AIPerformancePredictionService.getUserPredictions(new mongoose_1.default.Types.ObjectId(userId));
        res.json({
            message: '기록 예측 목록을 성공적으로 조회했습니다.',
            data: predictions
        });
    }
    catch (error) {
        console.error('기록 예측 조회 오류:', error);
        res.status(500).json({
            error: '기록 예측 조회에 실패했습니다.',
            details: error instanceof Error ? error.message : '알 수 없는 오류'
        });
    }
});
router.get('/user/:userId/latest', auth_1.authMiddleware, async (req, res) => {
    try {
        const { userId } = req.params;
        const requestUserId = req.user?._id;
        if (userId !== requestUserId && req.user?.userType !== 'superAdmin' && req.user?.userType !== 'centerAdmin') {
            return res.status(403).json({ error: '접근 권한이 없습니다.' });
        }
        const latestPrediction = await aiPerformancePredictionService_1.AIPerformancePredictionService.getLatestPrediction(new mongoose_1.default.Types.ObjectId(userId));
        if (!latestPrediction) {
            return res.status(404).json({ error: '기록 예측을 찾을 수 없습니다.' });
        }
        res.json({
            message: '최신 기록 예측을 성공적으로 조회했습니다.',
            data: latestPrediction
        });
    }
    catch (error) {
        console.error('최신 기록 예측 조회 오류:', error);
        res.status(500).json({
            error: '최신 기록 예측 조회에 실패했습니다.',
            details: error instanceof Error ? error.message : '알 수 없는 오류'
        });
    }
});
router.get('/:predictionId', auth_1.authMiddleware, async (req, res) => {
    try {
        const { predictionId } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(predictionId)) {
            return res.status(400).json({ error: '유효하지 않은 예측 ID입니다.' });
        }
        const prediction = await PerformancePrediction_1.PerformancePrediction.findById(predictionId)
            .populate('userId', 'name email');
        if (!prediction) {
            return res.status(404).json({ error: '기록 예측을 찾을 수 없습니다.' });
        }
        if (prediction.userId.toString() !== req.user?._id &&
            req.user?.userType !== 'superAdmin' &&
            req.user?.userType !== 'centerAdmin') {
            return res.status(403).json({ error: '접근 권한이 없습니다.' });
        }
        res.json({
            message: '기록 예측을 성공적으로 조회했습니다.',
            data: prediction
        });
    }
    catch (error) {
        console.error('기록 예측 상세 조회 오류:', error);
        res.status(500).json({
            error: '기록 예측 조회에 실패했습니다.',
            details: error instanceof Error ? error.message : '알 수 없는 오류'
        });
    }
});
router.post('/:predictionId/actual-result', auth_1.authMiddleware, async (req, res) => {
    try {
        const { predictionId } = req.params;
        const { event, predictedTime, actualTime, achievedDate } = req.body;
        if (!mongoose_1.default.Types.ObjectId.isValid(predictionId)) {
            return res.status(400).json({ error: '유효하지 않은 예측 ID입니다.' });
        }
        if (!event || !predictedTime || !actualTime || !achievedDate) {
            return res.status(400).json({
                error: '필수 정보가 누락되었습니다.',
                required: ['event', 'predictedTime', 'actualTime', 'achievedDate']
            });
        }
        const prediction = await PerformancePrediction_1.PerformancePrediction.findById(predictionId);
        if (!prediction) {
            return res.status(404).json({ error: '기록 예측을 찾을 수 없습니다.' });
        }
        if (prediction.userId.toString() !== req.user?._id &&
            req.user?.userType !== 'superAdmin' &&
            req.user?.userType !== 'centerAdmin') {
            return res.status(403).json({ error: '접근 권한이 없습니다.' });
        }
        const updatedPrediction = await aiPerformancePredictionService_1.AIPerformancePredictionService.addActualResult(new mongoose_1.default.Types.ObjectId(predictionId), event, parseFloat(predictedTime), parseFloat(actualTime), new Date(achievedDate));
        if (!updatedPrediction) {
            return res.status(404).json({ error: '기록 예측을 찾을 수 없습니다.' });
        }
        res.json({
            message: '실제 기록 결과가 성공적으로 추가되었습니다.',
            data: updatedPrediction
        });
    }
    catch (error) {
        console.error('실제 결과 추가 오류:', error);
        res.status(500).json({
            error: '실제 결과 추가에 실패했습니다.',
            details: error instanceof Error ? error.message : '알 수 없는 오류'
        });
    }
});
router.get('/:predictionId/accuracy', auth_1.authMiddleware, async (req, res) => {
    try {
        const { predictionId } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(predictionId)) {
            return res.status(400).json({ error: '유효하지 않은 예측 ID입니다.' });
        }
        const prediction = await PerformancePrediction_1.PerformancePrediction.findById(predictionId);
        if (!prediction) {
            return res.status(404).json({ error: '기록 예측을 찾을 수 없습니다.' });
        }
        if (prediction.userId.toString() !== req.user?._id &&
            req.user?.userType !== 'superAdmin' &&
            req.user?.userType !== 'centerAdmin') {
            return res.status(403).json({ error: '접근 권한이 없습니다.' });
        }
        const overallAccuracy = prediction.calculateOverallAccuracy();
        const improvementTrend = prediction.analyzeImprovementTrend();
        res.json({
            message: '예측 정확도를 성공적으로 조회했습니다.',
            data: {
                overallAccuracy,
                improvementTrend,
                actualResults: prediction.tracking.actualResults,
                totalPredictions: prediction.predictions.length,
                completedResults: prediction.tracking.actualResults.length,
                completionRate: prediction.tracking.actualResults.length / prediction.predictions.length * 100
            }
        });
    }
    catch (error) {
        console.error('예측 정확도 조회 오류:', error);
        res.status(500).json({
            error: '예측 정확도 조회에 실패했습니다.',
            details: error instanceof Error ? error.message : '알 수 없는 오류'
        });
    }
});
router.get('/statistics/events/:event', auth_1.authMiddleware, async (req, res) => {
    try {
        const { event } = req.params;
        if (req.user?.userType !== 'superAdmin' && req.user?.userType !== 'centerAdmin') {
            return res.status(403).json({ error: '관리자 권한이 필요합니다.' });
        }
        if (!Object.values(PerformancePrediction_1.SwimmingEvent).includes(event)) {
            return res.status(400).json({ error: '유효하지 않은 종목입니다.' });
        }
        const statistics = await aiPerformancePredictionService_1.AIPerformancePredictionService.getEventStatistics(event);
        res.json({
            message: '종목별 예측 통계를 성공적으로 조회했습니다.',
            data: {
                event,
                statistics
            }
        });
    }
    catch (error) {
        console.error('종목별 통계 조회 오류:', error);
        res.status(500).json({
            error: '종목별 통계 조회에 실패했습니다.',
            details: error instanceof Error ? error.message : '알 수 없는 오류'
        });
    }
});
router.get('/statistics/accuracy', auth_1.authMiddleware, async (req, res) => {
    try {
        if (req.user?.userType !== 'superAdmin' && req.user?.userType !== 'centerAdmin') {
            return res.status(403).json({ error: '관리자 권한이 필요합니다.' });
        }
        const accuracyStatistics = await aiPerformancePredictionService_1.AIPerformancePredictionService.getAccuracyStatistics();
        const totalPredictions = await PerformancePrediction_1.PerformancePrediction.countDocuments({ isActive: true });
        const predictionsWithResults = await PerformancePrediction_1.PerformancePrediction.countDocuments({
            isActive: true,
            'tracking.actualResults.0': { $exists: true }
        });
        const recentPredictions = await PerformancePrediction_1.PerformancePrediction.countDocuments({
            isActive: true,
            predictionDate: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        });
        res.json({
            message: '예측 정확도 통계를 성공적으로 조회했습니다.',
            data: {
                overview: {
                    totalPredictions,
                    predictionsWithResults,
                    recentPredictions,
                    completionRate: (predictionsWithResults / totalPredictions) * 100
                },
                accuracyByEvent: accuracyStatistics
            }
        });
    }
    catch (error) {
        console.error('정확도 통계 조회 오류:', error);
        res.status(500).json({
            error: '정확도 통계 조회에 실패했습니다.',
            details: error instanceof Error ? error.message : '알 수 없는 오류'
        });
    }
});
router.put('/:predictionId/expert-validation', auth_1.authMiddleware, async (req, res) => {
    try {
        const { predictionId } = req.params;
        const { coachReview, adjustments, approvalStatus } = req.body;
        if (req.user?.userType !== 'superAdmin' &&
            req.user?.userType !== 'centerAdmin' &&
            req.user?.userType !== 'instructor') {
            return res.status(403).json({ error: '전문가 권한이 필요합니다.' });
        }
        if (!mongoose_1.default.Types.ObjectId.isValid(predictionId)) {
            return res.status(400).json({ error: '유효하지 않은 예측 ID입니다.' });
        }
        const prediction = await PerformancePrediction_1.PerformancePrediction.findById(predictionId);
        if (!prediction) {
            return res.status(404).json({ error: '기록 예측을 찾을 수 없습니다.' });
        }
        if (!prediction.validation.expertValidation) {
            prediction.validation.expertValidation = {
                coachReview: '',
                adjustments: [],
                approvalStatus: 'pending'
            };
        }
        if (coachReview)
            prediction.validation.expertValidation.coachReview = coachReview;
        if (adjustments)
            prediction.validation.expertValidation.adjustments = adjustments;
        if (approvalStatus)
            prediction.validation.expertValidation.approvalStatus = approvalStatus;
        await prediction.save();
        res.json({
            message: '전문가 검증이 성공적으로 업데이트되었습니다.',
            data: prediction
        });
    }
    catch (error) {
        console.error('전문가 검증 업데이트 오류:', error);
        res.status(500).json({
            error: '전문가 검증 업데이트에 실패했습니다.',
            details: error instanceof Error ? error.message : '알 수 없는 오류'
        });
    }
});
router.get('/:predictionId/needs-update', auth_1.authMiddleware, async (req, res) => {
    try {
        const { predictionId } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(predictionId)) {
            return res.status(400).json({ error: '유효하지 않은 예측 ID입니다.' });
        }
        const prediction = await PerformancePrediction_1.PerformancePrediction.findById(predictionId);
        if (!prediction) {
            return res.status(404).json({ error: '기록 예측을 찾을 수 없습니다.' });
        }
        if (prediction.userId.toString() !== req.user?._id &&
            req.user?.userType !== 'superAdmin' &&
            req.user?.userType !== 'centerAdmin') {
            return res.status(403).json({ error: '접근 권한이 없습니다.' });
        }
        const needsUpdate = prediction.needsUpdate();
        const daysSinceUpdate = Math.floor((Date.now() - prediction.updatedAt.getTime()) / (1000 * 60 * 60 * 24));
        res.json({
            message: '업데이트 필요 여부를 성공적으로 확인했습니다.',
            data: {
                needsUpdate,
                daysSinceUpdate,
                lastUpdateDate: prediction.updatedAt,
                nextPredictionDate: prediction.tracking.nextPredictionDate,
                recentPerformancesCount: prediction.trainingAnalysis.recentPerformances.length,
                hasNewData: prediction.trainingAnalysis.recentPerformances.length >= 10
            }
        });
    }
    catch (error) {
        console.error('업데이트 필요 여부 확인 오류:', error);
        res.status(500).json({
            error: '업데이트 필요 여부 확인에 실패했습니다.',
            details: error instanceof Error ? error.message : '알 수 없는 오류'
        });
    }
});
router.delete('/:predictionId', auth_1.authMiddleware, async (req, res) => {
    try {
        const { predictionId } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(predictionId)) {
            return res.status(400).json({ error: '유효하지 않은 예측 ID입니다.' });
        }
        const prediction = await PerformancePrediction_1.PerformancePrediction.findById(predictionId);
        if (!prediction) {
            return res.status(404).json({ error: '기록 예측을 찾을 수 없습니다.' });
        }
        if (prediction.userId.toString() !== req.user?._id &&
            req.user?.userType !== 'superAdmin' &&
            req.user?.userType !== 'centerAdmin') {
            return res.status(403).json({ error: '접근 권한이 없습니다.' });
        }
        prediction.isActive = false;
        await prediction.save();
        res.json({
            message: '기록 예측이 성공적으로 삭제되었습니다.',
            data: { predictionId, deletedAt: new Date() }
        });
    }
    catch (error) {
        console.error('기록 예측 삭제 오류:', error);
        res.status(500).json({
            error: '기록 예측 삭제에 실패했습니다.',
            details: error instanceof Error ? error.message : '알 수 없는 오류'
        });
    }
});
exports.default = router;
//# sourceMappingURL=aiPerformancePrediction.js.map