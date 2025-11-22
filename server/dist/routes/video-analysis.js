"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const VideoAnalysisCriteria_1 = require("../models/VideoAnalysisCriteria");
const auth_1 = require("../middleware/auth");
const logger_1 = require("../utils/logger");
const router = express_1.default.Router();
router.get('/criteria', auth_1.authMiddleware, (0, auth_1.requireRole)(['instructor', 'centerAdmin', 'superAdmin']), async (req, res) => {
    try {
        const { technique, analysisType, isActive } = req.query;
        const query = {};
        if (technique)
            query.technique = technique;
        if (analysisType)
            query.analysisType = analysisType;
        if (isActive !== undefined)
            query.isActive = isActive === 'true';
        const criteria = await VideoAnalysisCriteria_1.VideoAnalysisCriteria.find(query)
            .populate('createdBy', 'name email')
            .sort({ technique: 1, analysisType: 1, weight: -1 });
        res.json({
            success: true,
            data: criteria
        });
    }
    catch (error) {
        (0, logger_1.logError)('영상 분석 기준 조회 오류', error);
        res.status(500).json({
            success: false,
            message: '기준 조회 중 오류가 발생했습니다.'
        });
    }
});
router.post('/criteria', auth_1.authMiddleware, (0, auth_1.requireRole)(['instructor', 'centerAdmin', 'superAdmin']), async (req, res) => {
    try {
        const criteriaData = {
            ...req.body,
            createdBy: req.user._id,
            lastModified: new Date()
        };
        const criteria = new VideoAnalysisCriteria_1.VideoAnalysisCriteria(criteriaData);
        await criteria.save();
        res.json({
            success: true,
            data: criteria,
            message: '영상 분석 기준이 성공적으로 생성되었습니다.'
        });
    }
    catch (error) {
        (0, logger_1.logError)('영상 분석 기준 생성 오류', error);
        res.status(500).json({
            success: false,
            message: '기준 생성 중 오류가 발생했습니다.'
        });
    }
});
router.put('/criteria/:id', auth_1.authMiddleware, (0, auth_1.requireRole)(['instructor', 'centerAdmin', 'superAdmin']), async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = {
            ...req.body,
            lastModified: new Date()
        };
        const criteria = await VideoAnalysisCriteria_1.VideoAnalysisCriteria.findByIdAndUpdate(id, updateData, { new: true });
        if (!criteria) {
            return res.status(404).json({
                success: false,
                message: '기준을 찾을 수 없습니다.'
            });
        }
        res.json({
            success: true,
            data: criteria,
            message: '영상 분석 기준이 성공적으로 수정되었습니다.'
        });
    }
    catch (error) {
        (0, logger_1.logError)('영상 분석 기준 수정 오류', error);
        res.status(500).json({
            success: false,
            message: '기준 수정 중 오류가 발생했습니다.'
        });
    }
});
router.delete('/criteria/:id', auth_1.authMiddleware, (0, auth_1.requireRole)(['superAdmin']), async (req, res) => {
    try {
        const { id } = req.params;
        const criteria = await VideoAnalysisCriteria_1.VideoAnalysisCriteria.findByIdAndDelete(id);
        if (!criteria) {
            return res.status(404).json({
                success: false,
                message: '기준을 찾을 수 없습니다.'
            });
        }
        res.json({
            success: true,
            message: '영상 분석 기준이 성공적으로 삭제되었습니다.'
        });
    }
    catch (error) {
        (0, logger_1.logError)('영상 분석 기준 삭제 오류', error);
        res.status(500).json({
            success: false,
            message: '기준 삭제 중 오류가 발생했습니다.'
        });
    }
});
router.patch('/criteria/:id/toggle', auth_1.authMiddleware, (0, auth_1.requireRole)(['instructor', 'centerAdmin', 'superAdmin']), async (req, res) => {
    try {
        const { id } = req.params;
        const criteria = await VideoAnalysisCriteria_1.VideoAnalysisCriteria.findById(id);
        if (!criteria) {
            return res.status(404).json({
                success: false,
                message: '기준을 찾을 수 없습니다.'
            });
        }
        criteria.isActive = !criteria.isActive;
        criteria.updatedAt = new Date();
        await criteria.save();
        res.json({
            success: true,
            data: criteria,
            message: `기준이 ${criteria.isActive ? '활성화' : '비활성화'}되었습니다.`
        });
    }
    catch (error) {
        (0, logger_1.logError)('영상 분석 기준 토글 오류', error);
        res.status(500).json({
            success: false,
            message: '기준 상태 변경 중 오류가 발생했습니다.'
        });
    }
});
router.post('/result', auth_1.authMiddleware, (0, auth_1.requireRole)(['instructor', 'centerAdmin']), async (req, res) => {
    try {
        const resultData = {
            ...req.body,
            studentId: req.body.studentId || req.user._id
        };
        const result = new VideoAnalysisCriteria_1.VideoAnalysisResult(resultData);
        await result.save();
        res.json({
            success: true,
            data: result,
            message: '영상 분석 결과가 성공적으로 저장되었습니다.'
        });
    }
    catch (error) {
        (0, logger_1.logError)('영상 분석 결과 저장 오류', error);
        res.status(500).json({
            success: false,
            message: '결과 저장 중 오류가 발생했습니다.'
        });
    }
});
router.get('/result', auth_1.authMiddleware, (0, auth_1.requireRole)(['student', 'instructor', 'centerAdmin']), async (req, res) => {
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
            query.technique = technique;
        }
        const results = await VideoAnalysisCriteria_1.VideoAnalysisResult.find(query)
            .sort({ analysisDate: -1 })
            .limit(parseInt(limit))
            .skip(parseInt(offset))
            .populate('studentId', 'name email');
        const total = await VideoAnalysisCriteria_1.VideoAnalysisResult.countDocuments(query);
        res.json({
            success: true,
            data: {
                results,
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
        (0, logger_1.logError)('영상 분석 결과 조회 오류', error);
        res.status(500).json({
            success: false,
            message: '결과 조회 중 오류가 발생했습니다.'
        });
    }
});
router.get('/result/:id', auth_1.authMiddleware, (0, auth_1.requireRole)(['student', 'instructor', 'centerAdmin']), async (req, res) => {
    try {
        const { id } = req.params;
        const result = await VideoAnalysisCriteria_1.VideoAnalysisResult.findById(id)
            .populate('studentId', 'name email studentInfo');
        if (!result) {
            return res.status(404).json({
                success: false,
                message: '분석 결과를 찾을 수 없습니다.'
            });
        }
        if (req.user.userType === 'student' && result.studentId._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: '접근 권한이 없습니다.'
            });
        }
        res.json({
            success: true,
            data: result
        });
    }
    catch (error) {
        (0, logger_1.logError)('영상 분석 결과 상세 조회 오류', error);
        res.status(500).json({
            success: false,
            message: '결과 조회 중 오류가 발생했습니다.'
        });
    }
});
router.post('/criteria/template', auth_1.authMiddleware, (0, auth_1.requireRole)(['superAdmin']), async (req, res) => {
    try {
        const { technique } = req.body;
        if (!technique) {
            return res.status(400).json({
                success: false,
                message: '수영 기법을 지정해주세요.'
            });
        }
        const defaultCriteria = [
            {
                technique,
                analysisType: 'posture',
                criteriaName: '몸통 정렬',
                description: '수영 중 몸통의 수평 정렬 상태를 평가합니다.',
                weight: 0.3,
                thresholds: {
                    excellent: 90,
                    good: 75,
                    average: 60,
                    poor: 45
                },
                analysisMethod: {
                    algorithm: 'pose_estimation',
                    parameters: {
                        keyPoints: ['shoulder', 'hip', 'knee', 'ankle'],
                        tolerance: 5,
                        frameRate: 30
                    },
                    confidence: 0.85
                },
                feedback: {
                    excellent: ['완벽한 몸통 정렬을 유지하고 있습니다'],
                    good: ['대체로 좋은 몸통 정렬을 보입니다'],
                    average: ['몸통 정렬에 약간의 개선이 필요합니다'],
                    poor: ['몸통 정렬을 크게 개선해야 합니다']
                },
                recommendations: {
                    improvement: ['코어 근력 강화', '수평 자세 연습'],
                    exercises: ['플랭크', '사이드 플랭크', '수평 자세 유지 연습'],
                    focusAreas: ['코어 근력', '자세 인식']
                },
                isActive: true,
                createdBy: req.user._id
            },
            {
                technique,
                analysisType: 'movement',
                criteriaName: '팔 스트로크',
                description: '팔 스트로크의 기술적 정확성을 평가합니다.',
                weight: 0.4,
                thresholds: {
                    excellent: 90,
                    good: 75,
                    average: 60,
                    poor: 45
                },
                analysisMethod: {
                    algorithm: 'motion_analysis',
                    parameters: {
                        keyPoints: ['shoulder', 'elbow', 'wrist'],
                        strokePhase: ['catch', 'pull', 'push', 'recovery'],
                        frameRate: 30
                    },
                    confidence: 0.8
                },
                feedback: {
                    excellent: ['매우 정확한 팔 스트로크를 보입니다'],
                    good: ['좋은 팔 스트로크 기술을 보입니다'],
                    average: ['팔 스트로크에 개선이 필요합니다'],
                    poor: ['팔 스트로크를 크게 개선해야 합니다']
                },
                recommendations: {
                    improvement: ['스트로크 기술 연습', '풀링 동작 강화'],
                    exercises: ['풀링 연습', '스트로크 드릴', '저항 훈련'],
                    focusAreas: ['스트로크 기술', '풀링 파워']
                },
                isActive: true,
                createdBy: req.user._id
            }
        ];
        const createdCriteria = await VideoAnalysisCriteria_1.VideoAnalysisCriteria.insertMany(defaultCriteria);
        res.json({
            success: true,
            data: createdCriteria,
            message: `${technique} 기법의 기본 영상 분석 기준이 생성되었습니다.`
        });
    }
    catch (error) {
        (0, logger_1.logError)('영상 분석 기준 템플릿 생성 오류', error);
        res.status(500).json({
            success: false,
            message: '기준 템플릿 생성 중 오류가 발생했습니다.'
        });
    }
});
exports.default = router;
//# sourceMappingURL=video-analysis.js.map