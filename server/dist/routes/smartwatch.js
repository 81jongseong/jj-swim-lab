"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const SmartWatchData_1 = require("../models/SmartWatchData");
const IntegratedAIEngine_1 = require("../utils/IntegratedAIEngine");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.post('/sync', auth_1.auth, (0, auth_1.requireRole)(['student', 'instructor', 'centerAdmin']), async (req, res) => {
    try {
        const { sessionId, deviceInfo, sessionInfo, performanceMetrics, detailedData } = req.body;
        if (!sessionId || !deviceInfo || !sessionInfo || !performanceMetrics) {
            return res.status(400).json({
                success: false,
                message: '필수 데이터가 누락되었습니다.'
            });
        }
        const smartWatchData = new SmartWatchData_1.SmartWatchData({
            studentId: req.user._id,
            sessionId,
            deviceInfo,
            sessionInfo,
            performanceMetrics,
            detailedData,
            isProcessed: false
        });
        await smartWatchData.save();
        setImmediate(async () => {
            try {
                await processSmartWatchData(smartWatchData._id.toString());
            }
            catch (error) {
                console.error('스마트 워치 데이터 AI 분석 오류:', error);
            }
        });
        res.json({
            success: true,
            data: smartWatchData,
            message: '스마트 워치 데이터가 성공적으로 동기화되었습니다.'
        });
    }
    catch (error) {
        console.error('스마트 워치 데이터 동기화 오류:', error);
        res.status(500).json({
            success: false,
            message: '데이터 동기화 중 오류가 발생했습니다.'
        });
    }
});
router.get('/data', auth_1.auth, (0, auth_1.requireRole)(['student', 'instructor', 'centerAdmin']), async (req, res) => {
    try {
        const { studentId, technique, limit = 10, offset = 0 } = req.query;
        const query = {};
        if (req.user.userType === 'student') {
            query.studentId = req.user._id;
        }
        else if (req.user.userType === 'instructor') {
            query.studentId = studentId || req.user._id;
        }
        else if (req.user.userType === 'centerAdmin') {
            query.studentId = studentId;
        }
        if (technique) {
            query['sessionInfo.technique'] = technique;
        }
        const data = await SmartWatchData_1.SmartWatchData.find(query)
            .sort({ 'sessionInfo.startTime': -1 })
            .limit(parseInt(limit))
            .skip(parseInt(offset))
            .populate('studentId', 'name email');
        const total = await SmartWatchData_1.SmartWatchData.countDocuments(query);
        res.json({
            success: true,
            data: {
                sessions: data,
                pagination: {
                    total,
                    limit: parseInt(limit),
                    offset: parseInt(offset),
                    hasMore: total > parseInt(offset) + parseInt(limit)
                }
            }
        });
    }
    catch (error) {
        console.error('스마트 워치 데이터 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '데이터 조회 중 오류가 발생했습니다.'
        });
    }
});
router.get('/data/:sessionId', auth_1.auth, (0, auth_1.requireRole)(['student', 'instructor', 'centerAdmin']), async (req, res) => {
    try {
        const { sessionId } = req.params;
        const data = await SmartWatchData_1.SmartWatchData.findOne({ sessionId })
            .populate('studentId', 'name email studentInfo');
        if (!data) {
            return res.status(404).json({
                success: false,
                message: '세션 데이터를 찾을 수 없습니다.'
            });
        }
        if (req.user.userType === 'student' && data.studentId._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: '접근 권한이 없습니다.'
            });
        }
        res.json({
            success: true,
            data
        });
    }
    catch (error) {
        console.error('스마트 워치 데이터 상세 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '데이터 조회 중 오류가 발생했습니다.'
        });
    }
});
router.get('/analysis/:sessionId', auth_1.auth, (0, auth_1.requireRole)(['student', 'instructor', 'centerAdmin']), async (req, res) => {
    try {
        const { sessionId } = req.params;
        const data = await SmartWatchData_1.SmartWatchData.findOne({ sessionId })
            .populate('studentId', 'name email');
        if (!data) {
            return res.status(404).json({
                success: false,
                message: '세션 데이터를 찾을 수 없습니다.'
            });
        }
        if (req.user.userType === 'student' && data.studentId._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: '접근 권한이 없습니다.'
            });
        }
        if (!data.isProcessed) {
            return res.json({
                success: true,
                data: {
                    isProcessed: false,
                    message: 'AI 분석이 진행 중입니다.'
                }
            });
        }
        res.json({
            success: true,
            data: {
                isProcessed: true,
                analysis: data.aiAnalysis,
                performanceMetrics: data.performanceMetrics
            }
        });
    }
    catch (error) {
        console.error('AI 분석 결과 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '분석 결과 조회 중 오류가 발생했습니다.'
        });
    }
});
router.post('/integrated-analysis', auth_1.auth, (0, auth_1.requireRole)(['instructor', 'centerAdmin']), async (req, res) => {
    try {
        const { studentId, technique, smartWatchSessionId, videoAnalysisId, instructorObservations, manualMetrics } = req.body;
        if (!studentId || !technique || !instructorObservations) {
            return res.status(400).json({
                success: false,
                message: '필수 데이터가 누락되었습니다.'
            });
        }
        let smartWatchData = null;
        if (smartWatchSessionId) {
            smartWatchData = await SmartWatchData_1.SmartWatchData.findOne({ sessionId: smartWatchSessionId });
        }
        let videoAnalysisData = null;
        if (videoAnalysisId) {
        }
        const analysisInput = {
            studentId,
            technique,
            smartWatchData,
            videoAnalysisData,
            instructorObservations,
            manualMetrics
        };
        const result = await IntegratedAIEngine_1.IntegratedAIEngine.performIntegratedAnalysis(analysisInput);
        res.json({
            success: true,
            data: result
        });
    }
    catch (error) {
        console.error('통합 AI 분석 오류:', error);
        res.status(500).json({
            success: false,
            message: 'AI 분석 중 오류가 발생했습니다.'
        });
    }
});
async function processSmartWatchData(dataId) {
    try {
        const data = await SmartWatchData_1.SmartWatchData.findById(dataId);
        if (!data)
            return;
        const analysis = {
            postureScore: Math.round(Math.random() * 40 + 60),
            breathingPattern: {
                averageBreathRate: data.performanceMetrics.strokeRate / 2,
                breathConsistency: Math.round(Math.random() * 30 + 70),
                breathEfficiency: Math.round(Math.random() * 25 + 75)
            },
            strokeAnalysis: {
                strokeConsistency: Math.round(Math.random() * 20 + 80),
                strokeEfficiency: Math.round(data.performanceMetrics.efficiency),
                strokePower: Math.round(Math.random() * 30 + 70)
            },
            overallEfficiency: Math.round(data.performanceMetrics.efficiency),
            recommendations: [
                '심박수 안정화를 위한 호흡 연습을 강화하세요',
                '스트로크 일관성을 높이기 위한 기본 동작 연습을 하세요',
                '전체적인 효율성 향상을 위해 코어 근력 운동을 추가하세요'
            ]
        };
        data.aiAnalysis = analysis;
        data.isProcessed = true;
        await data.save();
        console.log(`스마트 워치 데이터 AI 분석 완료: ${dataId}`);
    }
    catch (error) {
        console.error('스마트 워치 데이터 AI 분석 처리 오류:', error);
    }
}
exports.default = router;
//# sourceMappingURL=smartwatch.js.map