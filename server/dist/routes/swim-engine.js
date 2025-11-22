"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const logger_1 = require("../utils/logger");
const router = express_1.default.Router();
router.get('/status', auth_1.authMiddleware, async (req, res) => {
    try {
        console.log('🏊‍♂️ 수영 트레이닝 엔진 상태 확인 요청');
        const engineStatus = {
            status: 'active',
            version: '1.0.0',
            lastUpdated: new Date().toISOString(),
            features: {
                healthPolicy: true,
                swimPlan: true,
                jointGuidance: true,
                progression: true
            },
            health: {
                memory: 'normal',
                cpu: 'normal',
                responseTime: '< 100ms'
            }
        };
        res.json({
            success: true,
            message: '수영 트레이닝 엔진 상태 조회 성공',
            data: engineStatus
        });
    }
    catch (error) {
        (0, logger_1.logError)('수영 트레이닝 엔진 상태 확인 오류:', error);
        res.status(500).json({
            success: false,
            message: '수영 트레이닝 엔진 상태 확인 중 오류가 발생했습니다.'
        });
    }
});
router.post('/generate-plan', auth_1.authMiddleware, async (req, res) => {
    try {
        console.log('🏊‍♂️ 수영 프로그램 생성 요청');
        const { healthData } = req.body;
        if (!healthData) {
            return res.status(400).json({
                success: false,
                message: '건강 데이터가 필요합니다.'
            });
        }
        const mockPlan = {
            id: `plan_${Date.now()}`,
            title: '맞춤형 수영 프로그램',
            duration: '8주',
            sessions: [
                {
                    week: 1,
                    sessions: [
                        {
                            day: 1,
                            type: '기초 체력',
                            duration: 30,
                            intensity: 'low',
                            exercises: ['워밍업', '기본 자유형', '쿨다운']
                        }
                    ]
                }
            ],
            recommendations: [
                '충분한 휴식 시간을 가지세요',
                '물 섭취를 충분히 하세요',
                '점진적으로 강도를 높이세요'
            ],
            createdAt: new Date().toISOString()
        };
        res.json({
            success: true,
            message: '수영 프로그램 생성 성공',
            data: mockPlan
        });
    }
    catch (error) {
        (0, logger_1.logError)('수영 프로그램 생성 오류:', error);
        res.status(500).json({
            success: false,
            message: '수영 프로그램 생성 중 오류가 발생했습니다.'
        });
    }
});
router.get('/health-policy', auth_1.authMiddleware, async (req, res) => {
    try {
        console.log('🏊‍♂️ 건강 정책 정보 조회 요청');
        const healthPolicy = {
            conditions: [
                {
                    name: '고혈압',
                    restrictions: ['고강도 운동 제한', '혈압 모니터링 필요'],
                    recommendations: ['저강도 운동', '충분한 휴식']
                },
                {
                    name: '비만',
                    restrictions: ['관절 부담 운동 제한'],
                    recommendations: ['수중 운동', '점진적 강도 증가']
                }
            ],
            guidelines: [
                '의료진 상담 후 운동 시작',
                '정기적인 건강 상태 모니터링',
                '증상 발생 시 즉시 중단'
            ]
        };
        res.json({
            success: true,
            message: '건강 정책 정보 조회 성공',
            data: healthPolicy
        });
    }
    catch (error) {
        (0, logger_1.logError)('건강 정책 정보 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '건강 정책 정보 조회 중 오류가 발생했습니다.'
        });
    }
});
exports.default = router;
//# sourceMappingURL=swim-engine.js.map