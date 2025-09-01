"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const AIEvaluationCriteria_1 = require("../models/AIEvaluationCriteria");
const AdvancedAIEngine_1 = require("../utils/AdvancedAIEngine");
const router = express_1.default.Router();
router.get('/evaluation-criteria', auth_1.auth, (0, auth_1.requireRole)(['instructor', 'centerAdmin', 'superAdmin']), async (req, res) => {
    try {
        const criteria = await AIEvaluationCriteria_1.EvaluationCriteria.find({ isActive: true }).sort({ technique: 1, level: 1 });
        res.json({
            success: true,
            data: { criteria },
            message: '평가 기준을 성공적으로 조회했습니다.'
        });
    }
    catch (error) {
        console.error('평가 기준 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '평가 기준 조회 중 오류가 발생했습니다.'
        });
    }
});
router.post('/evaluation-criteria', auth_1.auth, (0, auth_1.requireRole)(['centerAdmin', 'superAdmin']), async (req, res) => {
    try {
        const criteriaData = req.body;
        const existing = await AIEvaluationCriteria_1.EvaluationCriteria.findOne({
            technique: criteriaData.technique,
            level: criteriaData.level
        });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: '이미 존재하는 평가 기준입니다.'
            });
        }
        const criteria = new AIEvaluationCriteria_1.EvaluationCriteria(criteriaData);
        await criteria.save();
        res.status(201).json({
            success: true,
            data: { criteria },
            message: '평가 기준을 성공적으로 생성했습니다.'
        });
    }
    catch (error) {
        console.error('평가 기준 생성 오류:', error);
        res.status(500).json({
            success: false,
            message: '평가 기준 생성 중 오류가 발생했습니다.'
        });
    }
});
router.put('/evaluation-criteria/:id', auth_1.auth, (0, auth_1.requireRole)(['centerAdmin', 'superAdmin']), async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const criteria = await AIEvaluationCriteria_1.EvaluationCriteria.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
        if (!criteria) {
            return res.status(404).json({
                success: false,
                message: '평가 기준을 찾을 수 없습니다.'
            });
        }
        res.json({
            success: true,
            data: { criteria },
            message: '평가 기준을 성공적으로 수정했습니다.'
        });
    }
    catch (error) {
        console.error('평가 기준 수정 오류:', error);
        res.status(500).json({
            success: false,
            message: '평가 기준 수정 중 오류가 발생했습니다.'
        });
    }
});
router.delete('/evaluation-criteria/:id', auth_1.auth, (0, auth_1.requireRole)(['superAdmin']), async (req, res) => {
    try {
        const { id } = req.params;
        const criteria = await AIEvaluationCriteria_1.EvaluationCriteria.findByIdAndDelete(id);
        if (!criteria) {
            return res.status(404).json({
                success: false,
                message: '평가 기준을 찾을 수 없습니다.'
            });
        }
        res.json({
            success: true,
            message: '평가 기준을 성공적으로 삭제했습니다.'
        });
    }
    catch (error) {
        console.error('평가 기준 삭제 오류:', error);
        res.status(500).json({
            success: false,
            message: '평가 기준 삭제 중 오류가 발생했습니다.'
        });
    }
});
router.get('/exercise-recommendations', auth_1.auth, (0, auth_1.requireRole)(['instructor', 'centerAdmin', 'superAdmin']), async (req, res) => {
    try {
        const { technique, level, category } = req.query;
        const filter = { isActive: true };
        if (technique)
            filter.technique = technique;
        if (level)
            filter.level = level;
        if (category)
            filter.category = category;
        const recommendations = await AIEvaluationCriteria_1.ExerciseRecommendation.find(filter).sort({ technique: 1, level: 1, category: 1 });
        res.json({
            success: true,
            data: { recommendations },
            message: '운동 추천을 성공적으로 조회했습니다.'
        });
    }
    catch (error) {
        console.error('운동 추천 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '운동 추천 조회 중 오류가 발생했습니다.'
        });
    }
});
router.post('/exercise-recommendations', auth_1.auth, (0, auth_1.requireRole)(['centerAdmin', 'superAdmin']), async (req, res) => {
    try {
        const recommendationData = req.body;
        const recommendation = new AIEvaluationCriteria_1.ExerciseRecommendation(recommendationData);
        await recommendation.save();
        res.status(201).json({
            success: true,
            data: { recommendation },
            message: '운동 추천을 성공적으로 생성했습니다.'
        });
    }
    catch (error) {
        console.error('운동 추천 생성 오류:', error);
        res.status(500).json({
            success: false,
            message: '운동 추천 생성 중 오류가 발생했습니다.'
        });
    }
});
router.put('/exercise-recommendations/:id', auth_1.auth, (0, auth_1.requireRole)(['centerAdmin', 'superAdmin']), async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const recommendation = await AIEvaluationCriteria_1.ExerciseRecommendation.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
        if (!recommendation) {
            return res.status(404).json({
                success: false,
                message: '운동 추천을 찾을 수 없습니다.'
            });
        }
        res.json({
            success: true,
            data: { recommendation },
            message: '운동 추천을 성공적으로 수정했습니다.'
        });
    }
    catch (error) {
        console.error('운동 추천 수정 오류:', error);
        res.status(500).json({
            success: false,
            message: '운동 추천 수정 중 오류가 발생했습니다.'
        });
    }
});
router.delete('/exercise-recommendations/:id', auth_1.auth, (0, auth_1.requireRole)(['superAdmin']), async (req, res) => {
    try {
        const { id } = req.params;
        const recommendation = await AIEvaluationCriteria_1.ExerciseRecommendation.findByIdAndDelete(id);
        if (!recommendation) {
            return res.status(404).json({
                success: false,
                message: '운동 추천을 찾을 수 없습니다.'
            });
        }
        res.json({
            success: true,
            message: '운동 추천을 성공적으로 삭제했습니다.'
        });
    }
    catch (error) {
        console.error('운동 추천 삭제 오류:', error);
        res.status(500).json({
            success: false,
            message: '운동 추천 삭제 중 오류가 발생했습니다.'
        });
    }
});
router.post('/evaluate', auth_1.auth, (0, auth_1.requireRole)(['instructor', 'centerAdmin', 'superAdmin']), async (req, res) => {
    try {
        const evaluationInput = req.body;
        if (!evaluationInput.studentId || !evaluationInput.technique || !evaluationInput.level) {
            return res.status(400).json({
                success: false,
                message: '필수 입력 데이터가 누락되었습니다.'
            });
        }
        const result = await AdvancedAIEngine_1.AdvancedAIEngine.performComprehensiveEvaluation({
            studentId: evaluationInput.studentId,
            instructorId: req.user.id,
            technique: evaluationInput.technique,
            level: evaluationInput.level,
            performanceMetrics: evaluationInput.performanceMetrics || {},
            instructorObservations: evaluationInput.instructorObservations || {
                posture: 0,
                breathing: 0,
                movement: 0,
                efficiency: 0
            }
        });
        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: result.message || 'AI 평가 중 오류가 발생했습니다.'
            });
        }
        res.json({
            success: true,
            data: result.data,
            message: 'AI 평가가 성공적으로 완료되었습니다.'
        });
    }
    catch (error) {
        console.error('AI 평가 실행 오류:', error);
        res.status(500).json({
            success: false,
            message: 'AI 평가 실행 중 오류가 발생했습니다.'
        });
    }
});
router.get('/evaluation-results/:studentId', auth_1.auth, (0, auth_1.requireRole)(['instructor', 'centerAdmin', 'superAdmin']), async (req, res) => {
    try {
        const { studentId } = req.params;
        const { technique, limit = 10 } = req.query;
        const filter = { studentId };
        if (technique)
            filter.technique = technique;
        const results = await AIEvaluationCriteria_1.AIEvaluationResult.find(filter)
            .sort({ evaluationDate: -1 })
            .limit(parseInt(limit))
            .populate('instructorId', 'name email');
        res.json({
            success: true,
            data: { results },
            message: 'AI 평가 결과를 성공적으로 조회했습니다.'
        });
    }
    catch (error) {
        console.error('AI 평가 결과 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: 'AI 평가 결과 조회 중 오류가 발생했습니다.'
        });
    }
});
router.get('/evaluation-results/detail/:id', auth_1.auth, (0, auth_1.requireRole)(['instructor', 'centerAdmin', 'superAdmin']), async (req, res) => {
    try {
        const { id } = req.params;
        const result = await AIEvaluationCriteria_1.AIEvaluationResult.findById(id)
            .populate('studentId', 'name email')
            .populate('instructorId', 'name email');
        if (!result) {
            return res.status(404).json({
                success: false,
                message: 'AI 평가 결과를 찾을 수 없습니다.'
            });
        }
        res.json({
            success: true,
            data: { result },
            message: 'AI 평가 결과를 성공적으로 조회했습니다.'
        });
    }
    catch (error) {
        console.error('AI 평가 결과 상세 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: 'AI 평가 결과 상세 조회 중 오류가 발생했습니다.'
        });
    }
});
exports.default = router;
//# sourceMappingURL=ai-evaluation-criteria.js.map