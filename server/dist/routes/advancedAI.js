"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const advancedAI_1 = require("../services/advancedAI");
const auth_1 = require("../middleware/auth");
const logger_1 = require("../utils/logger");
const router = (0, express_1.Router)();
const aiService = advancedAI_1.AdvancedAIService.getInstance();
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 100 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('video/')) {
            cb(null, true);
        }
        else {
            cb(new Error('비디오 파일만 업로드 가능합니다.'));
        }
    }
});
router.post('/analyze-pose', auth_1.authMiddleware, upload.single('video'), async (req, res) => {
    try {
        const { strokeType } = req.body;
        const videoFile = req.file;
        const userId = req.user?.userId;
        if (!videoFile) {
            return res.status(400).json({
                success: false,
                error: '비디오 파일이 필요합니다.'
            });
        }
        if (!strokeType) {
            return res.status(400).json({
                success: false,
                error: '영법 타입이 필요합니다.'
            });
        }
        (0, logger_1.logInfo)(`고급 자세 분석 요청: 사용자 ${userId}, 영법 ${strokeType}`);
        const analysis = await aiService.analyzeSwimmingPose(videoFile.buffer, userId, strokeType);
        res.json({
            success: true,
            data: {
                analysis,
                message: '수영 자세 분석이 완료되었습니다.'
            }
        });
    }
    catch (error) {
        (0, logger_1.logError)('고급 자세 분석 API 오류:', error);
        res.status(500).json({
            success: false,
            error: '자세 분석 중 오류가 발생했습니다.'
        });
    }
});
router.get('/learning-pattern/:userId', auth_1.authMiddleware, async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user?.userId;
        if (userId !== currentUserId && req.user?.role !== 'superAdmin') {
            return res.status(403).json({
                success: false,
                error: '권한이 없습니다.'
            });
        }
        (0, logger_1.logInfo)(`학습 패턴 분석 요청: 사용자 ${userId}`);
        const learningPattern = await aiService.analyzeLearningPattern(userId);
        res.json({
            success: true,
            data: {
                learningPattern,
                message: '학습 패턴 분석이 완료되었습니다.'
            }
        });
    }
    catch (error) {
        (0, logger_1.logError)('학습 패턴 분석 API 오류:', error);
        res.status(500).json({
            success: false,
            error: '학습 패턴 분석 중 오류가 발생했습니다.'
        });
    }
});
router.post('/injury-risk-assessment', auth_1.authMiddleware, async (req, res) => {
    try {
        const { poseAnalysis } = req.body;
        const userId = req.user?.userId;
        if (!poseAnalysis) {
            return res.status(400).json({
                success: false,
                error: '자세 분석 데이터가 필요합니다.'
            });
        }
        (0, logger_1.logInfo)(`부상 위험 평가 요청: 사용자 ${userId}`);
        const riskAssessment = await aiService.assessInjuryRisk(userId, poseAnalysis);
        res.json({
            success: true,
            data: {
                riskAssessment,
                message: '부상 위험 평가가 완료되었습니다.'
            }
        });
    }
    catch (error) {
        (0, logger_1.logError)('부상 위험 평가 API 오류:', error);
        res.status(500).json({
            success: false,
            error: '부상 위험 평가 중 오류가 발생했습니다.'
        });
    }
});
router.post('/generate-training-plan', auth_1.authMiddleware, async (req, res) => {
    try {
        const { currentLevel } = req.body;
        const userId = req.user?.userId;
        if (!currentLevel) {
            return res.status(400).json({
                success: false,
                error: '현재 수준 정보가 필요합니다.'
            });
        }
        (0, logger_1.logInfo)(`맞춤형 훈련 계획 생성 요청: 사용자 ${userId}, 레벨 ${currentLevel}`);
        const learningPattern = await aiService.analyzeLearningPattern(userId);
        const trainingPlan = await aiService.generatePersonalizedTrainingPlan(userId, learningPattern, currentLevel);
        res.json({
            success: true,
            data: {
                trainingPlan,
                learningPattern,
                message: '맞춤형 훈련 계획이 생성되었습니다.'
            }
        });
    }
    catch (error) {
        (0, logger_1.logError)('훈련 계획 생성 API 오류:', error);
        res.status(500).json({
            success: false,
            error: '훈련 계획 생성 중 오류가 발생했습니다.'
        });
    }
});
router.get('/analysis-history/:userId', auth_1.authMiddleware, async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 10, type } = req.query;
        void type;
        const currentUserId = req.user?.userId;
        if (userId !== currentUserId && req.user?.role !== 'superAdmin') {
            return res.status(403).json({
                success: false,
                error: '권한이 없습니다.'
            });
        }
        const mockHistory = {
            analyses: [
                {
                    id: '1',
                    type: 'pose-analysis',
                    timestamp: new Date(),
                    strokeType: 'freestyle',
                    overallScore: 85,
                    improvements: ['팔 동작 개선', '호흡 리듬 향상']
                },
                {
                    id: '2',
                    type: 'learning-pattern',
                    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                    learningStyle: 'visual',
                    progressRate: 0.75
                }
            ],
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total: 2,
                totalPages: 1
            }
        };
        res.json({
            success: true,
            data: mockHistory
        });
    }
    catch (error) {
        (0, logger_1.logError)('분석 히스토리 조회 API 오류:', error);
        res.status(500).json({
            success: false,
            error: '분석 히스토리 조회 중 오류가 발생했습니다.'
        });
    }
});
router.get('/recommendations/:userId', auth_1.authMiddleware, async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user?.userId;
        if (userId !== currentUserId && req.user?.role !== 'superAdmin') {
            return res.status(403).json({
                success: false,
                error: '권한이 없습니다.'
            });
        }
        const mockRecommendations = [
            {
                type: 'technique',
                priority: 'high',
                title: '킥 기술 개선',
                description: '다리 킥의 강도와 리듬을 개선하여 추진력을 향상시키세요.',
                exercises: [
                    {
                        name: '킥보드 연습',
                        duration: '10분',
                        difficulty: 'intermediate'
                    }
                ],
                expectedImprovement: 15,
                timeframe: '2-3주'
            },
            {
                type: 'training',
                priority: 'medium',
                title: '지구력 향상',
                description: '장거리 수영을 위한 지구력을 키워보세요.',
                exercises: [
                    {
                        name: '인터벌 훈련',
                        duration: '20분',
                        difficulty: 'advanced'
                    }
                ],
                expectedImprovement: 20,
                timeframe: '4-6주'
            }
        ];
        res.json({
            success: true,
            data: {
                recommendations: mockRecommendations,
                lastUpdated: new Date(),
                message: '맞춤 추천사항을 조회했습니다.'
            }
        });
    }
    catch (error) {
        (0, logger_1.logError)('추천사항 조회 API 오류:', error);
        res.status(500).json({
            success: false,
            error: '추천사항 조회 중 오류가 발생했습니다.'
        });
    }
});
router.post('/real-time-feedback', auth_1.authMiddleware, async (req, res) => {
    try {
        const { liveData } = req.body;
        const userId = req.user?.userId;
        if (!liveData) {
            return res.status(400).json({
                success: false,
                error: '실시간 데이터가 필요합니다.'
            });
        }
        const feedback = {
            timestamp: new Date(),
            userId,
            feedbackType: 'immediate',
            messages: [
                {
                    type: 'technique',
                    message: '팔 동작이 좋습니다! 이 리듬을 유지하세요.',
                    urgency: 'low'
                },
                {
                    type: 'correction',
                    message: '호흡 시 머리를 조금 더 낮게 유지해보세요.',
                    urgency: 'medium'
                }
            ],
            score: 82,
            improvements: ['호흡 타이밍']
        };
        res.json({
            success: true,
            data: {
                feedback,
                message: '실시간 피드백이 생성되었습니다.'
            }
        });
    }
    catch (error) {
        (0, logger_1.logError)('실시간 피드백 API 오류:', error);
        res.status(500).json({
            success: false,
            error: '실시간 피드백 생성 중 오류가 발생했습니다.'
        });
    }
});
exports.default = router;
//# sourceMappingURL=advancedAI.js.map