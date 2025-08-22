"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const ExerciseData_1 = __importDefault(require("../models/ExerciseData"));
const User_1 = require("../models/User");
const router = express_1.default.Router();
router.post('/session/start', (0, auth_1.requireRole)(['student', 'instructor']), async (req, res) => {
    try {
        const { exerciseType, notes } = req.body;
        const userId = req.user._id;
        const sessionId = `session_${Date.now()}_${userId}`;
        const exerciseSession = new ExerciseData_1.default({
            userId,
            sessionId,
            exerciseType,
            startTime: new Date(),
            duration: 0,
            intensityData: {
                averageIntensity: 0,
                maxIntensity: 0,
                intensityHistory: [],
                totalCalories: 0,
                averageHeartRate: 0,
                maxHeartRate: 0
            },
            performanceMetrics: {
                goalAchievement: 0,
                improvement: 0,
                consistency: 0,
                effort: 0
            },
            aiRecommendations: {
                nextWorkout: '',
                focusAreas: [],
                restDays: 1,
                intensityAdjustment: '',
                techniqueImprovements: [],
                nutritionTips: []
            },
            notes
        });
        await exerciseSession.save();
        res.status(201).json({
            success: true,
            sessionId: exerciseSession.sessionId,
            message: '운동 세션이 시작되었습니다.'
        });
    }
    catch (error) {
        console.error('운동 세션 시작 오류:', error);
        res.status(500).json({
            success: false,
            message: '운동 세션을 시작할 수 없습니다.'
        });
    }
});
router.put('/session/:sessionId/update', (0, auth_1.requireRole)(['student', 'instructor']), async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { intensity, heartRate, movementSpeed, calories: caloriesData, poseData } = req.body;
        const userId = req.user._id;
        const exerciseSession = await ExerciseData_1.default.findOne({ sessionId, userId });
        if (!exerciseSession) {
            return res.status(404).json({
                success: false,
                message: '운동 세션을 찾을 수 없습니다.'
            });
        }
        const newDataPoint = {
            timestamp: new Date(),
            intensity,
            heartRate,
            movementSpeed,
            calories: caloriesData
        };
        exerciseSession.intensityData.intensityHistory.push(newDataPoint);
        const intensities = exerciseSession.intensityData.intensityHistory.map(d => d.intensity);
        const heartRates = exerciseSession.intensityData.intensityHistory
            .filter(d => d.heartRate)
            .map(d => d.heartRate);
        const caloriesArray = exerciseSession.intensityData.intensityHistory.map(d => d.calories);
        exerciseSession.intensityData.averageIntensity = Math.round(intensities.reduce((sum, val) => sum + val, 0) / intensities.length);
        exerciseSession.intensityData.maxIntensity = Math.max(...intensities);
        exerciseSession.intensityData.totalCalories = Math.round(caloriesArray.reduce((sum, val) => sum + val, 0));
        if (heartRates.length > 0) {
            exerciseSession.intensityData.averageHeartRate = Math.round(heartRates.reduce((sum, val) => sum + val, 0) / heartRates.length);
            exerciseSession.intensityData.maxHeartRate = Math.max(...heartRates);
        }
        if (poseData) {
            exerciseSession.poseAnalysis = {
                ...exerciseSession.poseAnalysis,
                ...poseData
            };
        }
        await exerciseSession.save();
        res.json({
            success: true,
            message: '운동 데이터가 업데이트되었습니다.',
            session: exerciseSession
        });
    }
    catch (error) {
        console.error('운동 데이터 업데이트 오류:', error);
        res.status(500).json({
            success: false,
            message: '운동 데이터를 업데이트할 수 없습니다.'
        });
    }
});
router.put('/session/:sessionId/complete', (0, auth_1.requireRole)(['student', 'instructor']), async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { endTime, notes, tags } = req.body;
        const userId = req.user._id;
        const exerciseSession = await ExerciseData_1.default.findOne({ sessionId, userId });
        if (!exerciseSession) {
            return res.status(404).json({
                success: false,
                message: '운동 세션을 찾을 수 없습니다.'
            });
        }
        const sessionEndTime = endTime ? new Date(endTime) : new Date();
        exerciseSession.endTime = sessionEndTime;
        exerciseSession.duration = Math.round((sessionEndTime.getTime() - exerciseSession.startTime.getTime()) / (1000 * 60));
        if (notes)
            exerciseSession.notes = notes;
        if (tags)
            exerciseSession.tags = tags;
        const performanceScore = 0;
        const aiRecommendations = {
            nextWorkout: '다음 운동을 계획해주세요',
            focusAreas: ['기본 자세', '호흡법'],
            restDays: 1,
            intensityAdjustment: '현재 강도 유지',
            techniqueImprovements: ['자세 교정에 집중'],
            nutritionTips: ['충분한 수분 섭취']
        };
        exerciseSession.aiRecommendations = aiRecommendations;
        await exerciseSession.save();
        res.json({
            success: true,
            message: '운동 세션이 완료되었습니다.',
            session: exerciseSession,
            performanceScore
        });
    }
    catch (error) {
        console.error('운동 세션 완료 오류:', error);
        res.status(500).json({
            success: false,
            message: '운동 세션을 완료할 수 없습니다.'
        });
    }
});
router.get('/stats', (0, auth_1.requireRole)(['student', 'instructor']), async (req, res) => {
    try {
        const userId = req.user._id;
        const { days = 30 } = req.query;
        const stats = {
            totalSessions: 0,
            averageDuration: 0,
            totalCalories: 0,
            averageIntensity: 0
        };
        const recentSessions = await ExerciseData_1.default.find({ userId })
            .sort({ startTime: -1 })
            .limit(10)
            .select('exerciseType startTime duration intensityData.averageIntensity poseAnalysis.overallScore');
        const aiRecommendations = {
            nextWorkout: '다음 운동을 계획해주세요',
            focusAreas: ['기본 자세', '호흡법'],
            restDays: 1,
            intensityAdjustment: '현재 강도 유지',
            techniqueImprovements: ['자세 교정에 집중'],
            nutritionTips: ['충분한 수분 섭취']
        };
        res.json({
            success: true,
            stats,
            recentSessions,
            aiRecommendations
        });
    }
    catch (error) {
        console.error('운동 통계 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '운동 통계를 조회할 수 없습니다.'
        });
    }
});
router.get('/history', (0, auth_1.requireRole)(['student', 'instructor']), async (req, res) => {
    try {
        const userId = req.user._id;
        const { page = 1, limit = 20, exerciseType, startDate, endDate } = req.query;
        const query = { userId };
        if (exerciseType)
            query.exerciseType = exerciseType;
        if (startDate || endDate) {
            query.startTime = {};
            if (startDate)
                query.startTime.$gte = new Date(startDate);
            if (endDate)
                query.startTime.$lte = new Date(endDate);
        }
        const skip = (Number(page) - 1) * Number(limit);
        const [sessions, total] = await Promise.all([
            ExerciseData_1.default.find(query)
                .sort({ startTime: -1 })
                .skip(skip)
                .limit(Number(limit))
                .select('-intensityData.intensityHistory -poseAnalysis.landmarks'),
            ExerciseData_1.default.countDocuments(query)
        ]);
        res.json({
            success: true,
            sessions,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        });
    }
    catch (error) {
        console.error('운동 기록 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '운동 기록을 조회할 수 없습니다.'
        });
    }
});
router.get('/session/:sessionId', (0, auth_1.requireRole)(['student', 'instructor']), async (req, res) => {
    try {
        const { sessionId } = req.params;
        const userId = req.user._id;
        const exerciseSession = await ExerciseData_1.default.findOne({ sessionId, userId });
        if (!exerciseSession) {
            return res.status(404).json({
                success: false,
                message: '운동 세션을 찾을 수 없습니다.'
            });
        }
        res.json({
            success: true,
            session: exerciseSession
        });
    }
    catch (error) {
        console.error('운동 세션 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '운동 세션을 조회할 수 없습니다.'
        });
    }
});
router.delete('/session/:sessionId', (0, auth_1.requireRole)(['student', 'instructor']), async (req, res) => {
    try {
        const { sessionId } = req.params;
        const userId = req.user._id;
        const exerciseSession = await ExerciseData_1.default.findOneAndDelete({ sessionId, userId });
        if (!exerciseSession) {
            return res.status(404).json({
                success: false,
                message: '운동 세션을 찾을 수 없습니다.'
            });
        }
        res.json({
            success: true,
            message: '운동 기록이 삭제되었습니다.'
        });
    }
    catch (error) {
        console.error('운동 기록 삭제 오류:', error);
        res.status(500).json({
            success: false,
            message: '운동 기록을 삭제할 수 없습니다.'
        });
    }
});
router.put('/health-profile', (0, auth_1.requireRole)(['student', 'instructor']), async (req, res) => {
    try {
        const userId = req.user._id;
        const healthData = req.body;
        if (healthData.height && healthData.weight) {
            const heightInMeters = healthData.height / 100;
            healthData.bmi = Math.round((healthData.weight / (heightInMeters * heightInMeters)) * 100) / 100;
        }
        healthData.lastHealthCheck = new Date();
        const user = await User_1.User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: '사용자를 찾을 수 없습니다.'
            });
        }
        if (!user.studentInfo) {
            user.studentInfo = {};
        }
        user.studentInfo.healthProfile = {
            ...user.studentInfo.healthProfile,
            ...healthData
        };
        await user.save();
        res.json({
            success: true,
            message: '건강상태가 업데이트되었습니다.',
            healthProfile: user.studentInfo.healthProfile
        });
    }
    catch (error) {
        console.error('건강상태 업데이트 오류:', error);
        res.status(500).json({
            success: false,
            message: '건강상태를 업데이트할 수 없습니다.'
        });
    }
});
router.get('/health-profile', (0, auth_1.requireRole)(['student', 'instructor']), async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User_1.User.findById(userId).select('studentInfo.healthProfile');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: '사용자를 찾을 수 없습니다.'
            });
        }
        res.json({
            success: true,
            healthProfile: user.studentInfo?.healthProfile || {}
        });
    }
    catch (error) {
        console.error('건강상태 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '건강상태를 조회할 수 없습니다.'
        });
    }
});
exports.default = router;
//# sourceMappingURL=exercise.js.map