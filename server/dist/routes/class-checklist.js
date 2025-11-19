"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const logger_1 = require("../utils/logger");
const ClassChecklist_1 = require("../models/ClassChecklist");
const ChecklistTemplate_1 = require("../models/ChecklistTemplate");
const TeachingMethod_1 = require("../models/TeachingMethod");
const router = express_1.default.Router();
router.post('/generate', auth_1.authMiddleware, (0, auth_1.requireRole)(['instructor', 'centerAdmin']), async (req, res) => {
    try {
        const { classId, level, templateId, customLevel, isPrivateLesson } = req.body;
        if (!classId) {
            return res.status(400).json({ error: '반 ID가 필요합니다.' });
        }
        let items = [];
        let finalLevel = '';
        if (isPrivateLesson) {
            const userId = req.user?._id;
            const teachingMethodQuery = {
                isActive: true,
                $or: [
                    { createdByRole: 'superAdmin' },
                    { createdByRole: { $exists: false } },
                    { createdByRole: null },
                    {
                        createdByRole: 'instructor',
                        createdBy: userId
                    }
                ]
            };
            const allTeachingMethods = await TeachingMethod_1.TeachingMethod.find(teachingMethodQuery)
                .sort({ order: 1, createdAt: 1 });
            if (!allTeachingMethods || allTeachingMethods.length === 0) {
                return res.status(404).json({ error: '강습법을 찾을 수 없습니다. 최고관리자 강습법 또는 본인이 등록한 강습법이 필요합니다.' });
            }
            (0, logger_1.logInfo)('개인레슨 체크리스트용 강습법 조회', {
                userId,
                methodCount: allTeachingMethods.length,
                methodIds: allTeachingMethods.map(m => m._id)
            });
            let stepOrder = 1;
            allTeachingMethods.forEach((method) => {
                method.steps.forEach((step, stepIndex) => {
                    items.push({
                        stepName: step,
                        stepOrder: stepOrder++,
                        category: method.category || 'general',
                        difficulty: method.level || 'beginner',
                        tips: method.tips[stepIndex] || '',
                        teachingMethodId: method._id
                    });
                });
            });
            finalLevel = 'personal';
        }
        else if (templateId && customLevel) {
            const template = await ChecklistTemplate_1.ChecklistTemplate.findById(templateId);
            if (!template || !template.isActive) {
                return res.status(404).json({ error: '사용할 수 없는 템플릿입니다.' });
            }
            const userId = req.user?._id;
            const centerId = req.user?.centerId;
            const hasAccess = template.creatorId.equals(userId) ||
                template.centerId?.equals(centerId) ||
                template.isPublic;
            if (!hasAccess) {
                return res.status(403).json({ error: '이 템플릿에 접근할 권한이 없습니다.' });
            }
            items = template.items.filter(item => item.difficulty === customLevel);
            finalLevel = customLevel;
            if (items.length === 0) {
                return res.status(400).json({ error: `해당 레벨(${customLevel})의 항목이 템플릿에 없습니다.` });
            }
        }
        else if (level) {
            const userId = req.user?._id;
            const englishLevel = level === '초급' ? 'beginner' :
                level === '중급' ? 'intermediate' :
                    level === '고급' ? 'advanced' : 'beginner';
            const teachingMethodQuery = {
                isActive: true,
                level: englishLevel,
                $or: [
                    { createdByRole: 'superAdmin' },
                    { createdByRole: { $exists: false } },
                    { createdByRole: null },
                    {
                        createdByRole: 'instructor',
                        createdBy: userId
                    }
                ]
            };
            const teachingMethods = await TeachingMethod_1.TeachingMethod.find(teachingMethodQuery)
                .sort({ order: 1, createdAt: 1 });
            if (!teachingMethods || teachingMethods.length === 0) {
                return res.status(404).json({ error: `해당 레벨(${level})의 강습법을 찾을 수 없습니다. 최고관리자 강습법 또는 본인이 등록한 강습법이 필요합니다.` });
            }
            (0, logger_1.logInfo)('반 체크리스트용 강습법 조회', {
                userId,
                level: englishLevel,
                methodCount: teachingMethods.length,
                methodIds: teachingMethods.map(m => m._id)
            });
            let stepOrder = 1;
            teachingMethods.forEach((method) => {
                method.steps.forEach((step, stepIndex) => {
                    items.push({
                        stepName: step,
                        stepOrder: stepOrder++,
                        category: method.category || 'general',
                        difficulty: method.level || 'beginner',
                        tips: method.tips[stepIndex] || '',
                        teachingMethodId: method._id
                    });
                });
            });
            finalLevel = englishLevel;
        }
        else {
            return res.status(400).json({ error: '레벨, 템플릿 정보, 또는 개인레슨 여부가 필요합니다.' });
        }
        const existingChecklist = await ClassChecklist_1.ClassChecklist.findOne({ classId });
        if (existingChecklist) {
            if (templateId) {
                existingChecklist.templateId = templateId;
                existingChecklist.customLevel = customLevel;
            }
            existingChecklist.level = finalLevel;
            existingChecklist.items = items;
            existingChecklist.isActive = true;
            existingChecklist.updatedAt = new Date();
            await existingChecklist.save();
            (0, logger_1.logInfo)('반 체크리스트 업데이트', {
                checklistId: existingChecklist._id,
                classId,
                level: finalLevel,
                itemCount: items.length,
                isPrivateLesson: !!isPrivateLesson
            });
            res.json({
                success: true,
                message: '반 체크리스트가 성공적으로 업데이트되었습니다.',
                checklist: existingChecklist
            });
        }
        else {
            const classChecklist = new ClassChecklist_1.ClassChecklist({
                classId,
                level: finalLevel,
                templateId: templateId || undefined,
                customLevel: customLevel || undefined,
                items: items,
                hiddenItems: [],
                customItems: [],
                isActive: true
            });
            await classChecklist.save();
            (0, logger_1.logInfo)('반 체크리스트 생성', {
                checklistId: classChecklist._id,
                classId,
                level: finalLevel,
                itemCount: items.length,
                isPrivateLesson: !!isPrivateLesson
            });
            res.status(201).json({
                success: true,
                message: '반 체크리스트가 성공적으로 생성되었습니다.',
                checklist: classChecklist
            });
        }
    }
    catch (error) {
        (0, logger_1.logError)('반 체크리스트 생성/업데이트 실패', error);
        res.status(500).json({ error: '반 체크리스트 생성/업데이트에 실패했습니다.' });
    }
});
router.get('/class/:classId', auth_1.authMiddleware, (0, auth_1.requireRole)(['instructor', 'centerAdmin']), async (req, res) => {
    try {
        const { classId } = req.params;
        const { includeHidden = false } = req.query;
        const checklist = await ClassChecklist_1.ClassChecklist.findOne({ classId, isActive: true })
            .populate('classId', 'name level');
        if (!checklist) {
            return res.status(404).json({ error: '해당 반의 체크리스트를 찾을 수 없습니다.' });
        }
        const responseChecklist = { ...checklist.toObject() };
        if (!includeHidden && checklist.hiddenItems && checklist.hiddenItems.length > 0) {
            responseChecklist.items = checklist.items.filter(item => !checklist.hiddenItems.includes(item._id.toString()));
            responseChecklist.customItems = checklist.customItems.filter(item => !checklist.hiddenItems.includes(item._id.toString()));
        }
        res.json({
            success: true,
            checklist: responseChecklist,
            totalItems: checklist.items.length + checklist.customItems.length,
            visibleItems: responseChecklist.items.length + responseChecklist.customItems.length,
            hiddenItems: checklist.hiddenItems.length
        });
    }
    catch (error) {
        (0, logger_1.logError)('반 체크리스트 조회 실패', error);
        res.status(500).json({ error: '반 체크리스트를 불러오는데 실패했습니다.' });
    }
});
router.put('/:checklistId', auth_1.authMiddleware, (0, auth_1.requireRole)(['instructor', 'centerAdmin']), async (req, res) => {
    try {
        const { checklistId } = req.params;
        const { items, isActive } = req.body;
        const checklist = await ClassChecklist_1.ClassChecklist.findById(checklistId);
        if (!checklist) {
            return res.status(404).json({ error: '체크리스트를 찾을 수 없습니다.' });
        }
        if (items)
            checklist.items = items;
        if (isActive !== undefined)
            checklist.isActive = isActive;
        await checklist.save();
        (0, logger_1.logInfo)('반 체크리스트 수정', { checklistId });
        res.json({
            success: true,
            message: '반 체크리스트가 수정되었습니다.',
            checklist
        });
    }
    catch (error) {
        (0, logger_1.logError)('반 체크리스트 수정 실패', error);
        res.status(500).json({ error: '반 체크리스트 수정에 실패했습니다.' });
    }
});
router.delete('/:checklistId', auth_1.authMiddleware, (0, auth_1.requireRole)(['instructor', 'centerAdmin']), async (req, res) => {
    try {
        const { checklistId } = req.params;
        const checklist = await ClassChecklist_1.ClassChecklist.findById(checklistId);
        if (!checklist) {
            return res.status(404).json({ error: '체크리스트를 찾을 수 없습니다.' });
        }
        await ClassChecklist_1.ClassChecklist.findByIdAndDelete(checklistId);
        (0, logger_1.logInfo)('반 체크리스트 삭제', { checklistId });
        res.json({
            success: true,
            message: '반 체크리스트가 삭제되었습니다.'
        });
    }
    catch (error) {
        (0, logger_1.logError)('반 체크리스트 삭제 실패', error);
        res.status(500).json({ error: '반 체크리스트 삭제에 실패했습니다.' });
    }
});
router.put('/:checklistId/items', auth_1.authMiddleware, (0, auth_1.requireRole)(['instructor', 'centerAdmin']), async (req, res) => {
    try {
        const { checklistId } = req.params;
        const { items } = req.body;
        const checklist = await ClassChecklist_1.ClassChecklist.findById(checklistId);
        if (!checklist) {
            return res.status(404).json({ error: '체크리스트를 찾을 수 없습니다.' });
        }
        checklist.items = items.map((item, index) => ({
            ...item,
            stepOrder: index + 1,
            updatedAt: new Date()
        }));
        await checklist.save();
        (0, logger_1.logInfo)('체크리스트 항목 순서 변경', { checklistId, itemCount: items.length });
        res.json({
            success: true,
            message: '체크리스트 항목이 수정되었습니다.',
            checklist
        });
    }
    catch (error) {
        (0, logger_1.logError)('체크리스트 항목 수정 실패', error);
        res.status(500).json({ error: '체크리스트 항목 수정에 실패했습니다.' });
    }
});
router.put('/:checklistId/items/:itemId/message', auth_1.authMiddleware, (0, auth_1.requireRole)(['instructor', 'centerAdmin']), async (req, res) => {
    try {
        const { checklistId, itemId } = req.params;
        const { message } = req.body;
        const checklist = await ClassChecklist_1.ClassChecklist.findById(checklistId);
        if (!checklist) {
            return res.status(404).json({ error: '체크리스트를 찾을 수 없습니다.' });
        }
        const item = checklist.items.find((item) => item._id.toString() === itemId);
        if (!item) {
            return res.status(404).json({ error: '체크리스트 항목을 찾을 수 없습니다.' });
        }
        item.instructorMessage = message;
        item.messageUpdatedAt = new Date();
        await checklist.save();
        (0, logger_1.logInfo)('체크리스트 항목 메시지 추가', { checklistId, itemId, messageLength: message.length });
        res.json({
            success: true,
            message: '메시지가 추가되었습니다.',
            item
        });
    }
    catch (error) {
        (0, logger_1.logError)('체크리스트 항목 메시지 추가 실패', error);
        res.status(500).json({ error: '메시지 추가에 실패했습니다.' });
    }
});
router.put('/:checklistId/hide-items', auth_1.authMiddleware, (0, auth_1.requireRole)(['instructor', 'centerAdmin']), async (req, res) => {
    try {
        const { checklistId } = req.params;
        const { hiddenItemIds } = req.body;
        const checklist = await ClassChecklist_1.ClassChecklist.findById(checklistId);
        if (!checklist) {
            return res.status(404).json({ error: '체크리스트를 찾을 수 없습니다.' });
        }
        checklist.hiddenItems = hiddenItemIds || [];
        await checklist.save();
        (0, logger_1.logInfo)('개인레슨 체크리스트 항목 숨김 설정', {
            checklistId,
            hiddenItemCount: checklist.hiddenItems.length
        });
        res.json({
            success: true,
            message: '체크리스트 항목 숨김 설정이 업데이트되었습니다.',
            checklist
        });
    }
    catch (error) {
        (0, logger_1.logError)('체크리스트 항목 숨김 설정 실패', error);
        res.status(500).json({ error: '항목 숨김 설정에 실패했습니다.' });
    }
});
router.post('/:checklistId/custom-items', auth_1.authMiddleware, (0, auth_1.requireRole)(['instructor', 'centerAdmin']), async (req, res) => {
    try {
        const { checklistId } = req.params;
        const { customItems } = req.body;
        const checklist = await ClassChecklist_1.ClassChecklist.findById(checklistId);
        if (!checklist) {
            return res.status(404).json({ error: '체크리스트를 찾을 수 없습니다.' });
        }
        const newCustomItems = customItems.map((item, index) => ({
            stepName: item.stepName,
            stepOrder: checklist.items.length + checklist.customItems.length + index + 1,
            category: item.category || 'custom',
            difficulty: item.difficulty || 'custom',
            tips: item.tips || '',
            teachingMethodId: item.teachingMethodId || null,
            instructorMessage: item.instructorMessage || '',
            isCompleted: false
        }));
        checklist.customItems = [...checklist.customItems, ...newCustomItems];
        await checklist.save();
        (0, logger_1.logInfo)('개인레슨 체크리스트 커스텀 항목 추가', {
            checklistId,
            addedItemCount: newCustomItems.length,
            totalCustomItems: checklist.customItems.length
        });
        res.json({
            success: true,
            message: '커스텀 항목이 추가되었습니다.',
            checklist
        });
    }
    catch (error) {
        (0, logger_1.logError)('체크리스트 커스텀 항목 추가 실패', error);
        res.status(500).json({ error: '커스텀 항목 추가에 실패했습니다.' });
    }
});
exports.default = router;
//# sourceMappingURL=class-checklist.js.map