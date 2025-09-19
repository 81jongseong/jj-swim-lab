"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const ChecklistTemplate_1 = require("../models/ChecklistTemplate");
const logger_1 = require("../utils/logger");
const router = express_1.default.Router();
router.post('/', auth_1.authMiddleware, (0, auth_1.requireRole)(['instructor', 'centerAdmin']), async (req, res) => {
    try {
        const { name, description, levels, items, isPublic, tags } = req.body;
        const creatorId = req.user?._id;
        const creatorType = req.user?.userType === 'centerAdmin' ? 'center' : 'instructor';
        const centerId = req.user?.centerId;
        if (!name || !levels || !items || !Array.isArray(levels) || !Array.isArray(items)) {
            return res.status(400).json({ error: '필수 정보가 누락되었습니다.' });
        }
        const template = new ChecklistTemplate_1.ChecklistTemplate({
            name,
            description: description || '',
            creatorId,
            creatorType,
            centerId,
            levels,
            items: items.map((item, index) => ({
                ...item,
                stepOrder: index + 1
            })),
            isPublic: isPublic || false,
            tags: tags || [],
            isActive: true
        });
        await template.save();
        (0, logger_1.logInfo)('체크리스트 템플릿 생성', {
            templateId: template._id,
            name,
            creatorId,
            levels: levels.length,
            itemCount: items.length
        });
        res.status(201).json({
            success: true,
            message: '체크리스트 템플릿이 성공적으로 생성되었습니다.',
            template
        });
    }
    catch (error) {
        (0, logger_1.logError)('체크리스트 템플릿 생성 실패', error);
        res.status(500).json({ error: '체크리스트 템플릿 생성에 실패했습니다.' });
    }
});
router.get('/', auth_1.authMiddleware, (0, auth_1.requireRole)(['instructor', 'centerAdmin']), async (req, res) => {
    try {
        const userId = req.user?._id;
        const centerId = req.user?.centerId;
        const userType = req.user?.userType;
        const query = { isActive: true };
        if (userType === 'centerAdmin') {
            query.$or = [
                { creatorId: userId },
                { centerId: centerId },
                { isPublic: true }
            ];
        }
        else {
            query.$or = [
                { creatorId: userId },
                { centerId: centerId },
                { isPublic: true }
            ];
        }
        const templates = await ChecklistTemplate_1.ChecklistTemplate.find(query)
            .populate('creatorId', 'name')
            .populate('centerId', 'name')
            .sort({ createdAt: -1 });
        (0, logger_1.logInfo)('체크리스트 템플릿 목록 조회', {
            userId,
            templateCount: templates.length
        });
        res.json({
            success: true,
            templates
        });
    }
    catch (error) {
        (0, logger_1.logError)('체크리스트 템플릿 목록 조회 실패', error);
        res.status(500).json({ error: '체크리스트 템플릿 목록 조회에 실패했습니다.' });
    }
});
router.get('/:templateId', auth_1.authMiddleware, (0, auth_1.requireRole)(['instructor', 'centerAdmin']), async (req, res) => {
    try {
        const { templateId } = req.params;
        const userId = req.user?._id;
        const centerId = req.user?.centerId;
        const template = await ChecklistTemplate_1.ChecklistTemplate.findById(templateId)
            .populate('creatorId', 'name')
            .populate('centerId', 'name');
        if (!template) {
            return res.status(404).json({ error: '템플릿을 찾을 수 없습니다.' });
        }
        const hasAccess = template.creatorId.equals(userId) ||
            template.centerId?.equals(centerId) ||
            template.isPublic;
        if (!hasAccess) {
            return res.status(403).json({ error: '이 템플릿에 접근할 권한이 없습니다.' });
        }
        res.json({
            success: true,
            template
        });
    }
    catch (error) {
        (0, logger_1.logError)('체크리스트 템플릿 조회 실패', error);
        res.status(500).json({ error: '체크리스트 템플릿 조회에 실패했습니다.' });
    }
});
router.put('/:templateId', auth_1.authMiddleware, (0, auth_1.requireRole)(['instructor', 'centerAdmin']), async (req, res) => {
    try {
        const { templateId } = req.params;
        const { name, description, levels, items, isPublic, tags } = req.body;
        const userId = req.user?._id;
        const template = await ChecklistTemplate_1.ChecklistTemplate.findById(templateId);
        if (!template) {
            return res.status(404).json({ error: '템플릿을 찾을 수 없습니다.' });
        }
        if (!template.creatorId.equals(userId)) {
            return res.status(403).json({ error: '이 템플릿을 수정할 권한이 없습니다.' });
        }
        template.name = name || template.name;
        template.description = description || template.description;
        template.levels = levels || template.levels;
        template.items = items ? items.map((item, index) => ({
            ...item,
            stepOrder: index + 1
        })) : template.items;
        template.isPublic = isPublic !== undefined ? isPublic : template.isPublic;
        template.tags = tags || template.tags;
        await template.save();
        (0, logger_1.logInfo)('체크리스트 템플릿 수정', {
            templateId,
            userId
        });
        res.json({
            success: true,
            message: '체크리스트 템플릿이 성공적으로 수정되었습니다.',
            template
        });
    }
    catch (error) {
        (0, logger_1.logError)('체크리스트 템플릿 수정 실패', error);
        res.status(500).json({ error: '체크리스트 템플릿 수정에 실패했습니다.' });
    }
});
router.delete('/:templateId', auth_1.authMiddleware, (0, auth_1.requireRole)(['instructor', 'centerAdmin']), async (req, res) => {
    try {
        const { templateId } = req.params;
        const userId = req.user?._id;
        const template = await ChecklistTemplate_1.ChecklistTemplate.findById(templateId);
        if (!template) {
            return res.status(404).json({ error: '템플릿을 찾을 수 없습니다.' });
        }
        if (!template.creatorId.equals(userId)) {
            return res.status(403).json({ error: '이 템플릿을 삭제할 권한이 없습니다.' });
        }
        template.isActive = false;
        await template.save();
        (0, logger_1.logInfo)('체크리스트 템플릿 비활성화', {
            templateId,
            userId
        });
        res.json({
            success: true,
            message: '체크리스트 템플릿이 성공적으로 비활성화되었습니다.'
        });
    }
    catch (error) {
        (0, logger_1.logError)('체크리스트 템플릿 삭제 실패', error);
        res.status(500).json({ error: '체크리스트 템플릿 삭제에 실패했습니다.' });
    }
});
exports.default = router;
//# sourceMappingURL=checklist-template.js.map