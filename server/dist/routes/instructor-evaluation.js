"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const InstructorEvaluationCriteria_1 = __importDefault(require("../models/InstructorEvaluationCriteria"));
const InstructorEvaluationResult_1 = __importDefault(require("../models/InstructorEvaluationResult"));
const router = express_1.default.Router();
router.get('/criteria', auth_1.authMiddleware, async (req, res) => {
    try {
        const { centerId, includeInactive } = req.query;
        const query = {};
        if (centerId) {
            query.centerId = centerId;
        }
        else {
            query.centerId = null;
        }
        if (!includeInactive) {
            query.isActive = true;
        }
        const criteria = await InstructorEvaluationCriteria_1.default
            .find(query)
            .populate('createdBy', 'name email')
            .populate('updatedBy', 'name email')
            .populate('centerId', 'name address')
            .sort({ version: -1, createdAt: -1 });
        res.json({
            success: true,
            data: criteria,
            total: criteria.length
        });
    }
    catch (error) {
        console.error('평가 기준 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '평가 기준 조회 중 오류가 발생했습니다.',
            error: error instanceof Error ? error.message : '알 수 없는 오류'
        });
    }
});
router.post('/criteria', auth_1.authMiddleware, async (req, res) => {
    try {
        const user = req.user;
        if (!['superAdmin', 'centerAdmin'].includes(user.userType)) {
            return res.status(403).json({
                success: false,
                message: '평가 기준 생성 권한이 없습니다.'
            });
        }
        let centerId = req.body.centerId;
        if (user.userType === 'centerAdmin') {
            centerId = user.centerId;
        }
        const criteriaData = {
            ...req.body,
            centerId,
            createdBy: user._id,
            updatedBy: user._id
        };
        const criteria = new InstructorEvaluationCriteria_1.default(criteriaData);
        await criteria.save();
        const savedCriteria = await InstructorEvaluationCriteria_1.default
            .findById(criteria._id)
            .populate('createdBy', 'name email')
            .populate('updatedBy', 'name email')
            .populate('centerId', 'name address');
        res.status(201).json({
            success: true,
            message: '평가 기준이 성공적으로 생성되었습니다.',
            data: savedCriteria
        });
    }
    catch (error) {
        console.error('평가 기준 생성 오류:', error);
        res.status(500).json({
            success: false,
            message: '평가 기준 생성 중 오류가 발생했습니다.',
            error: error instanceof Error ? error.message : '알 수 없는 오류'
        });
    }
});
router.put('/criteria/:id', auth_1.authMiddleware, async (req, res) => {
    try {
        const user = req.user;
        const { id } = req.params;
        if (!['superAdmin', 'centerAdmin'].includes(user.userType)) {
            return res.status(403).json({
                success: false,
                message: '평가 기준 수정 권한이 없습니다.'
            });
        }
        const existingCriteria = await InstructorEvaluationCriteria_1.default.findById(id);
        if (!existingCriteria) {
            return res.status(404).json({
                success: false,
                message: '평가 기준을 찾을 수 없습니다.'
            });
        }
        if (user.userType === 'centerAdmin' &&
            existingCriteria.centerId?.toString() !== user.centerId?.toString()) {
            return res.status(403).json({
                success: false,
                message: '해당 평가 기준을 수정할 권한이 없습니다.'
            });
        }
        const updatedCriteria = await InstructorEvaluationCriteria_1.default
            .findByIdAndUpdate(id, {
            ...req.body,
            updatedBy: user._id
        }, { new: true })
            .populate('createdBy', 'name email')
            .populate('updatedBy', 'name email')
            .populate('centerId', 'name address');
        res.json({
            success: true,
            message: '평가 기준이 성공적으로 수정되었습니다.',
            data: updatedCriteria
        });
    }
    catch (error) {
        console.error('평가 기준 수정 오류:', error);
        res.status(500).json({
            success: false,
            message: '평가 기준 수정 중 오류가 발생했습니다.',
            error: error instanceof Error ? error.message : '알 수 없는 오류'
        });
    }
});
router.get('/results', auth_1.authMiddleware, async (req, res) => {
    try {
        const user = req.user;
        const { instructorId, centerId, year, quarter, status, page = 1, limit = 10 } = req.query;
        const query = {};
        if (user.userType === 'centerAdmin') {
            query.centerId = user.centerId;
        }
        else if (user.userType === 'instructor') {
            query.instructorId = user._id;
        }
        if (instructorId)
            query.instructorId = instructorId;
        if (centerId && user.userType === 'superAdmin')
            query.centerId = centerId;
        if (year)
            query['evaluationPeriod.year'] = parseInt(year);
        if (quarter)
            query['evaluationPeriod.quarter'] = quarter;
        if (status)
            query.status = status;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const results = await InstructorEvaluationResult_1.default
            .find(query)
            .populate('instructorId', 'name email level')
            .populate('centerId', 'name address')
            .populate('criteriaId', 'title version')
            .populate('createdBy', 'name email')
            .sort({ 'evaluationPeriod.year': -1, 'evaluationPeriod.quarter': -1 })
            .skip(skip)
            .limit(parseInt(limit));
        const total = await InstructorEvaluationResult_1.default.countDocuments(query);
        res.json({
            success: true,
            data: results,
            pagination: {
                current: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    }
    catch (error) {
        console.error('평가 결과 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '평가 결과 조회 중 오류가 발생했습니다.',
            error: error instanceof Error ? error.message : '알 수 없는 오류'
        });
    }
});
router.post('/submit', auth_1.authMiddleware, async (req, res) => {
    try {
        const user = req.user;
        const { instructorId, evaluationResultId, scores, overallComment, recommendations, strengths, improvements, isAnonymous = false } = req.body;
        const evaluationResult = await InstructorEvaluationResult_1.default.findById(evaluationResultId);
        if (!evaluationResult) {
            return res.status(404).json({
                success: false,
                message: '평가 결과를 찾을 수 없습니다.'
            });
        }
        let evaluatorType;
        if (user._id.toString() === instructorId) {
            evaluatorType = 'self';
        }
        else if (user.userType === 'student') {
            evaluatorType = 'student';
        }
        else if (user.userType === 'instructor') {
            evaluatorType = 'peer';
        }
        else {
            evaluatorType = 'management';
        }
        const existingAssessment = evaluationResult.assessments.find(assessment => assessment.evaluatorId.toString() === user._id.toString());
        if (existingAssessment) {
            return res.status(400).json({
                success: false,
                message: '이미 평가를 완료하셨습니다.'
            });
        }
        const newAssessment = {
            evaluatorId: user._id,
            evaluatorType,
            evaluatedAt: new Date(),
            scores,
            overallComment,
            recommendations,
            strengths,
            improvements,
            isAnonymous
        };
        evaluationResult.assessments.push(newAssessment);
        if (evaluationResult.status === 'draft') {
            evaluationResult.status = 'in_progress';
        }
        await evaluationResult.save();
        res.json({
            success: true,
            message: '평가가 성공적으로 제출되었습니다.',
            data: {
                evaluationResultId: evaluationResult._id,
                assessmentId: newAssessment
            }
        });
    }
    catch (error) {
        console.error('평가 제출 오류:', error);
        res.status(500).json({
            success: false,
            message: '평가 제출 중 오류가 발생했습니다.',
            error: error instanceof Error ? error.message : '알 수 없는 오류'
        });
    }
});
router.get('/statistics', auth_1.authMiddleware, async (req, res) => {
    try {
        const user = req.user;
        const { centerId, year, quarter } = req.query;
        const query = {};
        if (user.userType === 'centerAdmin') {
            query.centerId = user.centerId;
        }
        else if (centerId && user.userType === 'superAdmin') {
            query.centerId = centerId;
        }
        if (year)
            query['evaluationPeriod.year'] = parseInt(year);
        if (quarter)
            query['evaluationPeriod.quarter'] = quarter;
        const totalResults = await InstructorEvaluationResult_1.default.countDocuments(query);
        const gradeDistribution = await InstructorEvaluationResult_1.default.aggregate([
            { $match: query },
            { $group: {
                    _id: '$calculatedResults.grade',
                    count: { $sum: 1 },
                    avgScore: { $avg: '$calculatedResults.totalScore' }
                }
            },
            { $sort: { _id: 1 } }
        ]);
        const averageScore = await InstructorEvaluationResult_1.default.aggregate([
            { $match: query },
            { $group: {
                    _id: null,
                    avgTotal: { $avg: '$calculatedResults.totalScore' },
                    avgStudentFeedback: { $avg: '$calculatedResults.averageScores.studentFeedback' },
                    avgTeachingSkill: { $avg: '$calculatedResults.averageScores.teachingSkill' },
                    avgCommunication: { $avg: '$calculatedResults.averageScores.communication' },
                    avgPunctuality: { $avg: '$calculatedResults.averageScores.punctuality' },
                    avgImprovement: { $avg: '$calculatedResults.averageScores.improvement' },
                    avgSafety: { $avg: '$calculatedResults.averageScores.safety' }
                }
            }
        ]);
        const monthlyTrend = await InstructorEvaluationResult_1.default.aggregate([
            { $match: query },
            { $group: {
                    _id: {
                        year: '$evaluationPeriod.year',
                        quarter: '$evaluationPeriod.quarter'
                    },
                    count: { $sum: 1 },
                    avgScore: { $avg: '$calculatedResults.totalScore' }
                }
            },
            { $sort: { '_id.year': -1, '_id.quarter': -1 } },
            { $limit: 12 }
        ]);
        res.json({
            success: true,
            data: {
                totalResults,
                gradeDistribution,
                averageScores: averageScore[0] || {},
                monthlyTrend
            }
        });
    }
    catch (error) {
        console.error('평가 통계 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '평가 통계 조회 중 오류가 발생했습니다.',
            error: error instanceof Error ? error.message : '알 수 없는 오류'
        });
    }
});
router.post('/create-default-criteria', auth_1.authMiddleware, async (req, res) => {
    try {
        const user = req.user;
        if (user.userType !== 'superAdmin') {
            return res.status(403).json({
                success: false,
                message: '기본 평가 기준 생성 권한이 없습니다.'
            });
        }
        const existingCriteria = await InstructorEvaluationCriteria_1.default.findOne({
            centerId: null,
            title: 'JJ 수영장 기본 강사 평가 기준'
        });
        if (existingCriteria) {
            return res.status(400).json({
                success: false,
                message: '기본 평가 기준이 이미 존재합니다.'
            });
        }
        const defaultCriteria = new InstructorEvaluationCriteria_1.default({
            centerId: null,
            title: 'JJ 수영장 기본 강사 평가 기준',
            description: 'JJ 수영장의 표준 강사 평가 기준입니다. 모든 센터에서 공통으로 사용할 수 있습니다.',
            version: '1.0.0',
            isActive: true,
            createdBy: user._id,
            updatedBy: user._id
        });
        await defaultCriteria.save();
        res.status(201).json({
            success: true,
            message: '기본 평가 기준이 성공적으로 생성되었습니다.',
            data: defaultCriteria
        });
    }
    catch (error) {
        console.error('기본 평가 기준 생성 오류:', error);
        res.status(500).json({
            success: false,
            message: '기본 평가 기준 생성 중 오류가 발생했습니다.',
            error: error instanceof Error ? error.message : '알 수 없는 오류'
        });
    }
});
exports.default = router;
//# sourceMappingURL=instructor-evaluation.js.map