"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const logger_1 = require("../utils/logger");
const ClassChecklist_1 = require("../models/ClassChecklist");
const TeachingMethod_1 = require("../models/TeachingMethod");
const router = express_1.default.Router();
router.post('/generate', auth_1.auth, (0, auth_1.requireRole)(['instructor', 'centerAdmin']), async (req, res) => {
    try {
        const { classId, level } = req.body;
        if (!classId || !level) {
            return res.status(400).json({ error: '반 ID와 레벨이 필요합니다.' });
        }
        const existingChecklist = await ClassChecklist_1.ClassChecklist.findOne({ classId, level });
        if (existingChecklist) {
            return res.status(400).json({ error: '이미 해당 반의 체크리스트가 존재합니다.' });
        }
        const englishLevel = level === '초급' ? 'beginner' :
            level === '중급' ? 'intermediate' :
                level === '고급' ? 'advanced' : 'beginner';
        const teachingMethods = await TeachingMethod_1.TeachingMethod.find({ level: englishLevel });
        if (!teachingMethods || teachingMethods.length === 0) {
            return res.status(404).json({ error: '해당 레벨의 강습법을 찾을 수 없습니다.' });
        }
        let allItems = [];
        let stepOrder = 1;
        teachingMethods.forEach((method) => {
            method.steps.forEach((step, stepIndex) => {
                allItems.push({
                    stepName: step,
                    stepOrder: stepOrder++,
                    category: method.category || 'general',
                    difficulty: method.level || 'beginner',
                    tips: method.tips[stepIndex] || '',
                    teachingMethodId: method._id
                });
            });
        });
        const classChecklist = new ClassChecklist_1.ClassChecklist({
            classId,
            level: englishLevel,
            items: allItems,
            isActive: true
        });
        await classChecklist.save();
        (0, logger_1.logInfo)('반 체크리스트 생성', {
            checklistId: classChecklist._id,
            classId,
            level: englishLevel,
            itemCount: allItems.length
        });
        res.status(201).json({
            success: true,
            message: '반 체크리스트가 성공적으로 생성되었습니다.',
            checklist: classChecklist
        });
    }
    catch (error) {
        (0, logger_1.logError)('반 체크리스트 생성 실패', error);
        res.status(500).json({ error: '반 체크리스트 생성에 실패했습니다.' });
    }
});
router.get('/class/:classId', auth_1.auth, (0, auth_1.requireRole)(['instructor', 'centerAdmin']), async (req, res) => {
    try {
        const { classId } = req.params;
        const checklist = await ClassChecklist_1.ClassChecklist.findOne({ classId, isActive: true })
            .populate('classId', 'name level');
        if (!checklist) {
            return res.status(404).json({ error: '해당 반의 체크리스트를 찾을 수 없습니다.' });
        }
        res.json({
            success: true,
            checklist
        });
    }
    catch (error) {
        (0, logger_1.logError)('반 체크리스트 조회 실패', error);
        res.status(500).json({ error: '반 체크리스트를 불러오는데 실패했습니다.' });
    }
});
router.put('/:checklistId', auth_1.auth, (0, auth_1.requireRole)(['instructor', 'centerAdmin']), async (req, res) => {
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
router.delete('/:checklistId', auth_1.auth, (0, auth_1.requireRole)(['instructor', 'centerAdmin']), async (req, res) => {
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
exports.default = router;
//# sourceMappingURL=class-checklist.js.map