"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const cache_1 = require("../middleware/cache");
const logger_1 = require("../utils/logger");
const Checklist_1 = require("../models/Checklist");
const TeachingMethod_1 = require("../models/TeachingMethod");
const router = express_1.default.Router();
router.get('/', auth_1.auth, (0, cache_1.cache)({ ttl: 300 }), async (req, res) => {
    try {
        const { page = 1, limit = 20, status, studentId, courseId } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const filter = {};
        if (status)
            filter.status = status;
        if (studentId)
            filter.studentId = studentId;
        if (courseId)
            filter.courseId = courseId;
        const checklists = await Checklist_1.Checklist.find(filter)
            .populate('studentId', 'name email')
            .populate('courseId', 'name')
            .populate('instructorId', 'name email')
            .populate('teachingMethodId', 'name')
            .skip(skip)
            .limit(Number(limit))
            .sort({ lastUpdated: -1 });
        const total = await Checklist_1.Checklist.countDocuments(filter);
        res.json({
            checklists,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        });
    }
    catch (error) {
        (0, logger_1.logError)('체크리스트 목록 조회 실패', error);
        res.status(500).json({ error: '체크리스트 목록을 불러오는데 실패했습니다.' });
    }
});
router.get('/instructor/:instructorId', auth_1.auth, (0, auth_1.requireRole)(['instructor']), async (req, res) => {
    try {
        const { instructorId } = req.params;
        const { page = 1, limit = 20, status } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const filter = { instructorId };
        if (status)
            filter.status = status;
        const checklists = await Checklist_1.Checklist.find(filter)
            .populate('studentId', 'name email')
            .populate('courseId', 'name')
            .populate('teachingMethodId', 'name')
            .skip(skip)
            .limit(Number(limit))
            .sort({ lastUpdated: -1 });
        const total = await Checklist_1.Checklist.countDocuments(filter);
        res.json({
            checklists,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        });
    }
    catch (error) {
        (0, logger_1.logError)('강사별 체크리스트 조회 실패', error);
        res.status(500).json({ error: '체크리스트를 불러오는데 실패했습니다.' });
    }
});
router.get('/student/:studentId/course/:courseId', auth_1.auth, (0, auth_1.requireRole)(['instructor', 'centerAdmin']), async (req, res) => {
    try {
        const { studentId, courseId } = req.params;
        const checklist = await Checklist_1.Checklist.findOne({ studentId, courseId })
            .populate('studentId', 'name email')
            .populate('courseId', 'name')
            .populate('instructorId', 'name email');
        if (!checklist) {
            return res.status(404).json({ error: '체크리스트를 찾을 수 없습니다.' });
        }
        res.json({ checklist });
    }
    catch (error) {
        (0, logger_1.logError)('학생별 체크리스트 조회 실패', error);
        res.status(500).json({ error: '체크리스트를 불러오는데 실패했습니다.' });
    }
});
router.post('/generate', auth_1.auth, (0, auth_1.requireRole)(['instructor', 'centerAdmin']), async (req, res) => {
    try {
        const { studentId, courseId, studentLevel } = req.body;
        if (!studentId || !courseId || !studentLevel) {
            return res.status(400).json({ error: '필수 필드가 누락되었습니다.' });
        }
        const existingChecklist = await Checklist_1.Checklist.findOne({ studentId, courseId });
        if (existingChecklist) {
            return res.status(400).json({ error: '이미 체크리스트가 존재합니다.' });
        }
        const englishLevel = studentLevel === '초급' ? 'beginner' :
            studentLevel === '중급' ? 'intermediate' :
                studentLevel === '고급' ? 'advanced' : 'beginner';
        const teachingMethods = await TeachingMethod_1.TeachingMethod.find({ level: englishLevel });
        if (!teachingMethods || teachingMethods.length === 0) {
            return res.status(404).json({ error: '해당 레벨의 강습법을 찾을 수 없습니다.' });
        }
        let allItems = [];
        let stepOrder = 1;
        teachingMethods.forEach((method, methodIndex) => {
            method.steps.forEach((step, stepIndex) => {
                allItems.push({
                    stepName: step,
                    stepOrder: stepOrder++,
                    category: method.category || 'general',
                    difficulty: method.level || 'beginner',
                    tips: method.tips[stepIndex] || '',
                    teachingMethodId: method._id,
                    isCompleted: false
                });
            });
        });
        const checklist = new Checklist_1.Checklist({
            studentId,
            courseId,
            instructorId: req.user._id,
            items: allItems,
            overallProgress: 0,
            status: 'active',
            startDate: new Date()
        });
        await checklist.save();
        (0, logger_1.logInfo)('체크리스트 생성', { checklistId: checklist._id, studentId, courseId });
        res.status(201).json({ checklist });
    }
    catch (error) {
        (0, logger_1.logError)('체크리스트 생성 실패', error);
        res.status(500).json({ error: '체크리스트 생성에 실패했습니다.' });
    }
});
router.get('/:checklistId', auth_1.auth, async (req, res) => {
    try {
        const checklist = await Checklist_1.Checklist.findById(req.params.checklistId)
            .populate('studentId', 'name email')
            .populate('courseId', 'name')
            .populate('instructorId', 'name email');
        if (!checklist) {
            return res.status(404).json({ error: '체크리스트를 찾을 수 없습니다.' });
        }
        res.json({ checklist });
    }
    catch (error) {
        (0, logger_1.logError)('체크리스트 상세 조회 실패', error);
        res.status(500).json({ error: '체크리스트를 불러오는데 실패했습니다.' });
    }
});
router.patch('/:checklistId/items/:itemIndex', auth_1.auth, (0, auth_1.requireRole)(['instructor', 'centerAdmin']), async (req, res) => {
    try {
        const { checklistId, itemIndex } = req.params;
        const { isCompleted, notes } = req.body;
        const checklist = await Checklist_1.Checklist.findById(checklistId);
        if (!checklist) {
            return res.status(404).json({ error: '체크리스트를 찾을 수 없습니다.' });
        }
        const itemIndexNum = Number(itemIndex);
        if (itemIndexNum < 0 || itemIndexNum >= checklist.items.length) {
            return res.status(400).json({ error: '유효하지 않은 아이템 인덱스입니다.' });
        }
        const item = checklist.items[itemIndexNum];
        if (isCompleted !== undefined) {
            item.isCompleted = isCompleted;
            if (isCompleted) {
                item.completedAt = new Date();
            }
            else {
                item.completedAt = undefined;
            }
        }
        if (notes !== undefined) {
            item.notes = notes;
        }
        await checklist.save();
        (0, logger_1.logInfo)('체크리스트 아이템 상태 변경', { checklistId, itemIndex, isCompleted });
        res.json({ checklist });
    }
    catch (error) {
        (0, logger_1.logError)('체크리스트 아이템 상태 변경 실패', error);
        res.status(500).json({ error: '아이템 상태 변경에 실패했습니다.' });
    }
});
router.patch('/:checklistId', auth_1.auth, (0, auth_1.requireRole)(['instructor', 'centerAdmin']), async (req, res) => {
    try {
        const { status, notes, targetCompletionDate } = req.body;
        const updateData = {};
        if (status !== undefined)
            updateData.status = status;
        if (notes !== undefined)
            updateData.notes = notes;
        if (targetCompletionDate !== undefined)
            updateData.targetCompletionDate = targetCompletionDate;
        const checklist = await Checklist_1.Checklist.findByIdAndUpdate(req.params.checklistId, updateData, { new: true });
        if (!checklist) {
            return res.status(404).json({ error: '체크리스트를 찾을 수 없습니다.' });
        }
        (0, logger_1.logInfo)('체크리스트 수정', { checklistId: checklist._id, status });
        res.json({ checklist });
    }
    catch (error) {
        (0, logger_1.logError)('체크리스트 수정 실패', error);
        res.status(500).json({ error: '체크리스트 수정에 실패했습니다.' });
    }
});
router.delete('/:checklistId', auth_1.auth, (0, auth_1.requireRole)(['instructor', 'centerAdmin']), async (req, res) => {
    try {
        const checklist = await Checklist_1.Checklist.findByIdAndDelete(req.params.checklistId);
        if (!checklist) {
            return res.status(404).json({ error: '체크리스트를 찾을 수 없습니다.' });
        }
        (0, logger_1.logInfo)('체크리스트 삭제', { checklistId: req.params.checklistId });
        res.json({ message: '체크리스트가 성공적으로 삭제되었습니다.' });
    }
    catch (error) {
        (0, logger_1.logError)('체크리스트 삭제 실패', error);
        res.status(500).json({ error: '체크리스트 삭제에 실패했습니다.' });
    }
});
exports.default = router;
//# sourceMappingURL=checklist.js.map