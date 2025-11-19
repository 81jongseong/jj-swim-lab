"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const aiRoutineRecommendationService_1 = require("../services/aiRoutineRecommendationService");
const cache_1 = require("../middleware/cache");
const logger_1 = require("../utils/logger");
const router = express_1.default.Router();
router.get('/analyze/:userId', auth_1.authMiddleware, cache_1.cacheMiddleware.statistics, async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user?.id;
        if (userId !== currentUserId && req.user?.userType !== 'instructor' && req.user?.userType !== 'superAdmin') {
            return res.status(403).json({
                success: false,
                message: '권한이 없습니다.'
            });
        }
        (0, logger_1.logInfo)('사용자 패턴 분석 요청', { userId, currentUserId });
        const pattern = await aiRoutineRecommendationService_1.AIRoutineRecommendationService.analyzeUserPattern(userId);
        res.json({
            success: true,
            data: pattern
        });
    }
    catch (error) {
        (0, logger_1.logError)('사용자 패턴 분석 실패', error);
        res.status(500).json({
            success: false,
            message: error.message || '사용자 패턴 분석 중 오류가 발생했습니다.'
        });
    }
});
router.post('/generate/:userId', auth_1.authMiddleware, async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user?.id;
        const { goals } = req.body;
        if (userId !== currentUserId && req.user?.userType !== 'instructor' && req.user?.userType !== 'superAdmin') {
            return res.status(403).json({
                success: false,
                message: '권한이 없습니다.'
            });
        }
        (0, logger_1.logInfo)('AI 루틴 추천 요청', { userId, currentUserId, goals });
        const recommendation = await aiRoutineRecommendationService_1.AIRoutineRecommendationService.generateRoutineRecommendation(userId, Array.isArray(goals) ? goals : []);
        res.json({
            success: true,
            data: recommendation
        });
    }
    catch (error) {
        (0, logger_1.logError)('AI 루틴 추천 실패', error);
        res.status(500).json({
            success: false,
            message: error.message || 'AI 루틴 추천 중 오류가 발생했습니다.'
        });
    }
});
router.post('/generate-options/:userId', auth_1.authMiddleware, async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user?.id;
        const { count = 3 } = req.body;
        if (userId !== currentUserId && req.user?.userType !== 'instructor' && req.user?.userType !== 'superAdmin') {
            return res.status(403).json({
                success: false,
                message: '권한이 없습니다.'
            });
        }
        (0, logger_1.logInfo)('AI 루틴 옵션 생성 요청', { userId, currentUserId, count });
        const options = await aiRoutineRecommendationService_1.AIRoutineRecommendationService.generateMultipleRoutineOptions(userId, Math.min(Math.max(count, 1), 5));
        res.json({
            success: true,
            data: options
        });
    }
    catch (error) {
        (0, logger_1.logError)('AI 루틴 옵션 생성 실패', error);
        res.status(500).json({
            success: false,
            message: error.message || 'AI 루틴 옵션 생성 중 오류가 발생했습니다.'
        });
    }
});
exports.default = router;
//# sourceMappingURL=ai-routine-recommendations.js.map