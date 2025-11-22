"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const HealthBasedExerciseAI_1 = require("../utils/HealthBasedExerciseAI");
const HealthData_1 = require("../models/HealthData");
const User_1 = require("../models/User");
const logger_1 = require("../utils/logger");
const router = express_1.default.Router();
router.post('/calculate', auth_1.auth, async (req, res) => {
    try {
        const { userId, currentFitnessLevel, exerciseGoals, medicalConditions, currentExerciseCapacity } = req.body;
        if (req.user._id.toString() !== userId && !['superAdmin', 'centerAdmin', 'instructor'].includes(req.user.userType)) {
            return res.status(403).json({
                success: false,
                message: '접근 권한이 없습니다.'
            });
        }
        const healthData = await HealthData_1.HealthData.findOne({ userId }).lean();
        if (!healthData) {
            return res.status(404).json({
                success: false,
                message: '건강정보를 찾을 수 없습니다.'
            });
        }
        const result = await HealthBasedExerciseAI_1.HealthBasedExerciseAI.calculateHealthBasedExercise({
            userId,
            healthData,
            currentFitnessLevel: currentFitnessLevel || 'beginner',
            exerciseGoals: exerciseGoals || [],
            medicalConditions: medicalConditions || [],
            currentExerciseCapacity
        });
        if (!result.success) {
            return res.status(500).json({
                success: false,
                message: result.message || '운동량 계산 중 오류가 발생했습니다.'
            });
        }
        res.json({
            success: true,
            data: result.data,
            message: '건강정보 기반 운동량 계산이 완료되었습니다.'
        });
    }
    catch (error) {
        (0, logger_1.logError)('건강정보 기반 운동량 계산 오류', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});
router.post('/adjust-realtime', auth_1.auth, async (req, res) => {
    try {
        const { userId, currentHeartRate, currentIntensity, exerciseRecommendation } = req.body;
        if (req.user._id.toString() !== userId && !['superAdmin', 'centerAdmin', 'instructor'].includes(req.user.userType)) {
            return res.status(403).json({
                success: false,
                message: '접근 권한이 없습니다.'
            });
        }
        if (!currentHeartRate || !currentIntensity || !exerciseRecommendation) {
            return res.status(400).json({
                success: false,
                message: '필수 파라미터가 누락되었습니다.'
            });
        }
        const adjustment = await HealthBasedExerciseAI_1.HealthBasedExerciseAI.adjustExerciseInRealTime(userId, currentHeartRate, currentIntensity, exerciseRecommendation);
        res.json({
            success: true,
            data: adjustment,
            message: '실시간 운동량 조정이 완료되었습니다.'
        });
    }
    catch (error) {
        (0, logger_1.logError)('실시간 운동량 조정 오류', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});
router.get('/user/:userId', auth_1.auth, async (req, res) => {
    try {
        const { userId } = req.params;
        if (req.user._id.toString() !== userId && !['superAdmin', 'centerAdmin', 'instructor'].includes(req.user.userType)) {
            return res.status(403).json({
                success: false,
                message: '접근 권한이 없습니다.'
            });
        }
        const user = await User_1.User.findById(userId).lean();
        if (!user) {
            return res.status(404).json({
                success: false,
                message: '사용자를 찾을 수 없습니다.'
            });
        }
        const healthData = await HealthData_1.HealthData.findOne({ userId }).lean();
        if (!healthData) {
            return res.status(404).json({
                success: false,
                message: '건강정보를 찾을 수 없습니다.'
            });
        }
        const result = await HealthBasedExerciseAI_1.HealthBasedExerciseAI.calculateHealthBasedExercise({
            userId,
            healthData,
            currentFitnessLevel: user.fitnessLevel || 'beginner',
            exerciseGoals: user.exerciseGoals || [],
            medicalConditions: healthData.medicalConditions || [],
            currentExerciseCapacity: user.currentExerciseCapacity
        });
        if (!result.success) {
            return res.status(500).json({
                success: false,
                message: result.message || '운동 추천 조회 중 오류가 발생했습니다.'
            });
        }
        res.json({
            success: true,
            data: {
                user: {
                    name: user.name,
                    age: healthData.age,
                    fitnessLevel: user.fitnessLevel || 'beginner'
                },
                recommendation: result.data
            },
            message: '건강기반 운동 추천을 조회했습니다.'
        });
    }
    catch (error) {
        (0, logger_1.logError)('건강기반 운동 추천 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});
router.get('/health-weights/:userId', auth_1.auth, async (req, res) => {
    try {
        const { userId } = req.params;
        if (req.user._id.toString() !== userId && !['superAdmin', 'centerAdmin', 'instructor'].includes(req.user.userType)) {
            return res.status(403).json({
                success: false,
                message: '접근 권한이 없습니다.'
            });
        }
        const healthData = await HealthData_1.HealthData.findOne({ userId }).lean();
        if (!healthData) {
            return res.status(404).json({
                success: false,
                message: '건강정보를 찾을 수 없습니다.'
            });
        }
        const result = await HealthBasedExerciseAI_1.HealthBasedExerciseAI.calculateHealthBasedExercise({
            userId,
            healthData,
            currentFitnessLevel: 'intermediate',
            exerciseGoals: [],
            medicalConditions: [],
        });
        if (!result.success || !result.data) {
            return res.status(500).json({
                success: false,
                message: '건강정보 가중치 계산 중 오류가 발생했습니다.'
            });
        }
        res.json({
            success: true,
            data: {
                healthWeights: result.data.healthWeights,
                adjustmentFactors: result.data.adjustmentFactors,
                riskAssessment: result.data.riskAssessment
            },
            message: '건강정보 가중치를 조회했습니다.'
        });
    }
    catch (error) {
        (0, logger_1.logError)('건강정보 가중치 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});
exports.default = router;
//# sourceMappingURL=health-exercise-ai.js.map