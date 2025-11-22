"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const LessonPlanTemplate_1 = require("../models/LessonPlanTemplate");
const LessonPlan_1 = require("../models/LessonPlan");
const logger_1 = require("../utils/logger");
const router = express_1.default.Router();
router.get('/', auth_1.authMiddleware, async (req, res) => {
    try {
        const { category, level, search, page = 1, limit = 20 } = req.query;
        const user = req.user;
        const filter = { isActive: true };
        if (user.userType === 'centerAdmin') {
            filter.isPublic = true;
        }
        if (category && category !== 'all') {
            filter.category = category;
        }
        if (level && level !== 'all') {
            filter.level = level;
        }
        if (search) {
            filter.$or = [
                { templateName: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } }
            ];
        }
        const skip = (Number(page) - 1) * Number(limit);
        const templates = await LessonPlanTemplate_1.LessonPlanTemplate.find(filter)
            .populate('createdBy', 'name')
            .sort({ usageCount: -1, rating: -1, createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));
        const total = await LessonPlanTemplate_1.LessonPlanTemplate.countDocuments(filter);
        res.json({
            success: true,
            data: templates,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        });
    }
    catch (error) {
        (0, logger_1.logError)('템플릿 목록 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '템플릿 목록 조회 중 오류가 발생했습니다.'
        });
    }
});
router.get('/:id', auth_1.authMiddleware, async (req, res) => {
    try {
        const template = await LessonPlanTemplate_1.LessonPlanTemplate.findById(req.params.id)
            .populate('createdBy', 'name email');
        if (!template) {
            return res.status(404).json({
                success: false,
                message: '템플릿을 찾을 수 없습니다.'
            });
        }
        res.json({
            success: true,
            data: template
        });
    }
    catch (error) {
        (0, logger_1.logError)('템플릿 상세 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '템플릿 상세 조회 중 오류가 발생했습니다.'
        });
    }
});
router.post('/', auth_1.authMiddleware, (0, auth_1.requireRole)(['superAdmin']), async (req, res) => {
    try {
        const userId = req.user._id;
        const templateData = {
            ...req.body,
            createdBy: userId,
            usageCount: 0,
            rating: 0
        };
        const template = new LessonPlanTemplate_1.LessonPlanTemplate(templateData);
        await template.save();
        res.status(201).json({
            success: true,
            message: '강습 계획 템플릿이 생성되었습니다.',
            data: template
        });
    }
    catch (error) {
        (0, logger_1.logError)('템플릿 생성 오류:', error);
        res.status(500).json({
            success: false,
            message: '템플릿 생성 중 오류가 발생했습니다.'
        });
    }
});
router.put('/:id', auth_1.authMiddleware, (0, auth_1.requireRole)(['superAdmin']), async (req, res) => {
    try {
        const template = await LessonPlanTemplate_1.LessonPlanTemplate.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!template) {
            return res.status(404).json({
                success: false,
                message: '템플릿을 찾을 수 없습니다.'
            });
        }
        res.json({
            success: true,
            message: '템플릿이 수정되었습니다.',
            data: template
        });
    }
    catch (error) {
        (0, logger_1.logError)('템플릿 수정 오류:', error);
        res.status(500).json({
            success: false,
            message: '템플릿 수정 중 오류가 발생했습니다.'
        });
    }
});
router.delete('/:id', auth_1.authMiddleware, (0, auth_1.requireRole)(['superAdmin']), async (req, res) => {
    try {
        const template = await LessonPlanTemplate_1.LessonPlanTemplate.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
        if (!template) {
            return res.status(404).json({
                success: false,
                message: '템플릿을 찾을 수 없습니다.'
            });
        }
        res.json({
            success: true,
            message: '템플릿이 비활성화되었습니다.'
        });
    }
    catch (error) {
        (0, logger_1.logError)('템플릿 삭제 오류:', error);
        res.status(500).json({
            success: false,
            message: '템플릿 삭제 중 오류가 발생했습니다.'
        });
    }
});
router.post('/:templateId/create-plan', auth_1.authMiddleware, (0, auth_1.requireRole)(['centerAdmin']), async (req, res) => {
    try {
        const user = req.user;
        const { templateId } = req.params;
        const { customizations, students, date, time, location } = req.body;
        const template = await LessonPlanTemplate_1.LessonPlanTemplate.findById(templateId);
        if (!template) {
            return res.status(404).json({
                success: false,
                message: '템플릿을 찾을 수 없습니다.'
            });
        }
        const lessonPlan = new LessonPlan_1.LessonPlan({
            instructorId: user._id,
            centerId: user.centerId,
            title: customizations?.title || template.templateName,
            description: customizations?.description || template.description,
            teachingMethods: template.stages.flatMap(stage => stage.teachingMethods),
            students: students || [],
            duration: customizations?.duration || template.sessionDuration,
            date: new Date(date),
            time,
            location,
            objectives: customizations?.objectives || template.stages.flatMap(stage => stage.objectives),
            materials: customizations?.materials || template.stages.flatMap(stage => stage.materials),
            notes: customizations?.notes || '',
            status: 'draft',
            attendance: [],
            feedback: []
        });
        await lessonPlan.save();
        await LessonPlanTemplate_1.LessonPlanTemplate.findByIdAndUpdate(templateId, {
            $inc: { usageCount: 1 }
        });
        res.status(201).json({
            success: true,
            message: '템플릿을 기반으로 강습 계획이 생성되었습니다.',
            data: lessonPlan
        });
    }
    catch (error) {
        (0, logger_1.logError)('템플릿 기반 강습 계획 생성 오류:', error);
        res.status(500).json({
            success: false,
            message: '강습 계획 생성 중 오류가 발생했습니다.'
        });
    }
});
router.post('/:templateId/rate', auth_1.authMiddleware, (0, auth_1.requireRole)(['centerAdmin']), async (req, res) => {
    try {
        const { templateId } = req.params;
        const { rating, feedback } = req.body;
        void feedback;
        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: '평점은 1-5 사이의 값이어야 합니다.'
            });
        }
        const template = await LessonPlanTemplate_1.LessonPlanTemplate.findById(templateId);
        if (!template) {
            return res.status(404).json({
                success: false,
                message: '템플릿을 찾을 수 없습니다.'
            });
        }
        const newRating = ((template.rating * template.usageCount) + rating) / (template.usageCount + 1);
        await LessonPlanTemplate_1.LessonPlanTemplate.findByIdAndUpdate(templateId, {
            rating: Math.round(newRating * 10) / 10
        });
        res.json({
            success: true,
            message: '템플릿 평가가 완료되었습니다.'
        });
    }
    catch (error) {
        (0, logger_1.logError)('템플릿 평가 오류:', error);
        res.status(500).json({
            success: false,
            message: '템플릿 평가 중 오류가 발생했습니다.'
        });
    }
});
router.get('/stats/overview', auth_1.authMiddleware, (0, auth_1.requireRole)(['superAdmin']), async (req, res) => {
    try {
        const totalTemplates = await LessonPlanTemplate_1.LessonPlanTemplate.countDocuments({ isActive: true });
        const publicTemplates = await LessonPlanTemplate_1.LessonPlanTemplate.countDocuments({ isActive: true, isPublic: true });
        const categoryStats = await LessonPlanTemplate_1.LessonPlanTemplate.aggregate([
            { $match: { isActive: true } },
            { $group: { _id: '$category', count: { $sum: 1 }, avgRating: { $avg: '$rating' } } }
        ]);
        const levelStats = await LessonPlanTemplate_1.LessonPlanTemplate.aggregate([
            { $match: { isActive: true } },
            { $group: { _id: '$level', count: { $sum: 1 }, avgUsage: { $avg: '$usageCount' } } }
        ]);
        const topTemplates = await LessonPlanTemplate_1.LessonPlanTemplate.find({ isActive: true })
            .sort({ usageCount: -1, rating: -1 })
            .limit(5)
            .select('templateName usageCount rating category level');
        res.json({
            success: true,
            data: {
                overview: {
                    totalTemplates,
                    publicTemplates,
                    privateTemplates: totalTemplates - publicTemplates
                },
                categoryStats,
                levelStats,
                topTemplates
            }
        });
    }
    catch (error) {
        (0, logger_1.logError)('템플릿 통계 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '템플릿 통계 조회 중 오류가 발생했습니다.'
        });
    }
});
exports.default = router;
//# sourceMappingURL=lesson-plan-templates.js.map