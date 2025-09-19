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
const ChecklistTemplate_1 = require("../models/ChecklistTemplate");
const TeachingMethod_1 = require("../models/TeachingMethod");
const Course_1 = require("../models/Course");
const User_1 = require("../models/User");
const router = express_1.default.Router();
router.get('/', auth_1.authMiddleware, (0, cache_1.cache)({ ttl: 300 }), async (req, res) => {
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
router.get('/instructor/:instructorId', auth_1.authMiddleware, (0, auth_1.requireRole)(['instructor']), async (req, res) => {
    try {
        const { instructorId } = req.params;
        const { page = 1, limit = 20, status } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const filter = { instructorId };
        if (status)
            filter.status = status;
        const checklists = await Checklist_1.Checklist.find(filter)
            .populate('studentId', 'name email phone currentLevel lastLesson nextLesson attendance totalLessons')
            .populate('courseId', 'name level')
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
router.get('/instructor/me', auth_1.authMiddleware, (0, auth_1.requireRole)(['instructor']), async (req, res) => {
    try {
        const instructorId = req.user._id;
        const checklists = await Checklist_1.Checklist.find({ instructorId })
            .populate('studentId', 'name email phone currentLevel lastLesson nextLesson attendance totalLessons')
            .populate('courseId', 'name level')
            .populate('teachingMethodId', 'name')
            .sort({ lastUpdated: -1 });
        res.json({ checklists });
    }
    catch (error) {
        (0, logger_1.logError)('현재 강사 체크리스트 조회 실패', error);
        res.status(500).json({ error: '체크리스트를 불러오는데 실패했습니다.' });
    }
});
router.get('/student/:studentId/course/:courseId', auth_1.authMiddleware, (0, auth_1.requireRole)(['instructor', 'centerAdmin']), async (req, res) => {
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
router.post('/generate', auth_1.authMiddleware, (0, auth_1.requireRole)(['instructor', 'centerAdmin']), async (req, res) => {
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
        const allItems = [];
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
router.get('/:checklistId', auth_1.authMiddleware, async (req, res) => {
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
router.patch('/:checklistId/items/:itemIndex', auth_1.authMiddleware, (0, auth_1.requireRole)(['instructor', 'centerAdmin']), async (req, res) => {
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
router.patch('/:checklistId', auth_1.authMiddleware, (0, auth_1.requireRole)(['instructor', 'centerAdmin']), async (req, res) => {
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
router.delete('/:checklistId', auth_1.authMiddleware, (0, auth_1.requireRole)(['instructor', 'centerAdmin']), async (req, res) => {
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
router.put('/:checklistId/status', auth_1.authMiddleware, (0, auth_1.requireRole)(['instructor', 'centerAdmin']), async (req, res) => {
    try {
        const { checklistId } = req.params;
        const { status, notes } = req.body;
        if (!['active', 'completed', 'paused'].includes(status)) {
            return res.status(400).json({ error: '유효하지 않은 상태입니다.' });
        }
        const checklist = await Checklist_1.Checklist.findById(checklistId);
        if (!checklist) {
            return res.status(404).json({ error: '체크리스트를 찾을 수 없습니다.' });
        }
        if (checklist.instructorId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: '이 체크리스트를 수정할 권한이 없습니다.' });
        }
        checklist.status = status;
        if (notes !== undefined)
            checklist.notes = notes;
        checklist.lastUpdated = new Date();
        if (status === 'completed' && !checklist.completedAt) {
            checklist.completedAt = new Date();
        }
        await checklist.save();
        res.json({
            success: true,
            message: '체크리스트 상태가 업데이트되었습니다.',
            data: {
                status: checklist.status,
                lastUpdated: checklist.lastUpdated,
                completedAt: checklist.completedAt
            }
        });
    }
    catch (error) {
        (0, logger_1.logError)('체크리스트 상태 업데이트 실패', error);
        res.status(500).json({ error: '체크리스트 상태 업데이트에 실패했습니다.' });
    }
});
router.get('/instructor/:instructorId/performance', auth_1.authMiddleware, (0, auth_1.requireRole)(['centerAdmin', 'superAdmin']), async (req, res) => {
    try {
        const { instructorId } = req.params;
        const instructor = await User_1.User.findById(instructorId);
        if (!instructor || instructor.userType !== 'instructor') {
            return res.status(404).json({ error: '강사를 찾을 수 없습니다.' });
        }
        const totalChecklists = await Checklist_1.Checklist.countDocuments({ instructorId });
        const completedChecklists = await Checklist_1.Checklist.countDocuments({
            instructorId,
            status: 'completed'
        });
        const checklists = await Checklist_1.Checklist.find({ instructorId });
        const averageProgress = checklists.length > 0
            ? Math.round(checklists.reduce((sum, checklist) => sum + checklist.overallProgress, 0) / checklists.length)
            : 0;
        const uniqueStudents = await Checklist_1.Checklist.distinct('studentId', { instructorId });
        const activeStudents = await Checklist_1.Checklist.distinct('studentId', {
            instructorId,
            status: 'active'
        });
        const recentChecklists = await Checklist_1.Checklist.find({ instructorId })
            .populate('studentId', 'name')
            .sort({ lastUpdated: -1 })
            .limit(5);
        const recentActivity = recentChecklists.map(checklist => ({
            date: checklist.lastUpdated.toISOString().split('T')[0],
            action: checklist.status === 'completed' ? '체크리스트 완료' : '진행도 업데이트',
            student: checklist.studentId?.name || '알 수 없음'
        }));
        res.json({
            success: true,
            data: {
                totalChecklists,
                completedChecklists,
                averageProgress,
                totalStudents: uniqueStudents.length,
                activeStudents: activeStudents.length,
                recentActivity
            }
        });
    }
    catch (error) {
        (0, logger_1.logError)('강사 성과 분석 실패', error);
        res.status(500).json({ error: '성과 분석에 실패했습니다.' });
    }
});
router.get('/templates', auth_1.authMiddleware, async (req, res) => {
    try {
        const { page = 1, limit = 20, level, creatorType } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const filter = { isActive: true };
        if (level && level !== 'all') {
            filter.levels = level;
        }
        if (creatorType) {
            filter.creatorType = creatorType;
        }
        const user = req.user;
        if (user.userType === 'instructor') {
            filter.$or = [
                { isPublic: true },
                { creatorId: user._id, creatorType: 'instructor' }
            ];
        }
        else if (user.userType === 'centerAdmin') {
            filter.$or = [
                { isPublic: true },
                { creatorType: 'center' }
            ];
        }
        const templates = await ChecklistTemplate_1.ChecklistTemplate.find(filter)
            .populate('creatorId', 'name')
            .sort({ updatedAt: -1 })
            .skip(skip)
            .limit(Number(limit));
        const total = await ChecklistTemplate_1.ChecklistTemplate.countDocuments(filter);
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
        (0, logger_1.logError)('템플릿 목록 조회 실패', error);
        res.status(500).json({ error: '템플릿 목록 조회에 실패했습니다.' });
    }
});
router.post('/templates', auth_1.authMiddleware, (0, auth_1.requireRole)(['instructor', 'centerAdmin', 'superAdmin']), async (req, res) => {
    try {
        const { name, description, levels, items, tags, isPublic } = req.body;
        const user = req.user;
        if (!name || !description || !items || items.length === 0) {
            return res.status(400).json({ error: '필수 필드가 누락되었습니다.' });
        }
        const templateData = {
            name,
            description,
            levels: levels || [],
            items: items.map((item, index) => ({
                ...item,
                stepOrder: index + 1
            })),
            tags: tags || [],
            isPublic: isPublic || false,
            creatorId: user._id,
            creatorType: user.userType === 'instructor' ? 'instructor' : 'center',
            isActive: true
        };
        if (user.userType === 'centerAdmin' && user.centerAdminInfo?.managedCenters?.[0]) {
            templateData.centerId = user.centerAdminInfo.managedCenters[0];
        }
        const template = new ChecklistTemplate_1.ChecklistTemplate(templateData);
        await template.save();
        res.status(201).json({
            success: true,
            message: '템플릿이 성공적으로 생성되었습니다.',
            data: template
        });
    }
    catch (error) {
        (0, logger_1.logError)('템플릿 생성 실패', error);
        res.status(500).json({ error: '템플릿 생성에 실패했습니다.' });
    }
});
router.delete('/templates/:id', auth_1.authMiddleware, (0, auth_1.requireRole)(['instructor', 'centerAdmin', 'superAdmin']), async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;
        const template = await ChecklistTemplate_1.ChecklistTemplate.findById(id);
        if (!template) {
            return res.status(404).json({ error: '템플릿을 찾을 수 없습니다.' });
        }
        const canDelete = template.creatorId.toString() === user._id.toString() ||
            user.userType === 'superAdmin' ||
            (user.userType === 'centerAdmin' && template.creatorType === 'center');
        if (!canDelete) {
            return res.status(403).json({ error: '템플릿을 삭제할 권한이 없습니다.' });
        }
        await ChecklistTemplate_1.ChecklistTemplate.findByIdAndDelete(id);
        res.json({
            success: true,
            message: '템플릿이 성공적으로 삭제되었습니다.'
        });
    }
    catch (error) {
        (0, logger_1.logError)('템플릿 삭제 실패', error);
        res.status(500).json({ error: '템플릿 삭제에 실패했습니다.' });
    }
});
router.post('/from-template/:templateId', auth_1.authMiddleware, (0, auth_1.requireRole)(['instructor']), async (req, res) => {
    try {
        const { templateId } = req.params;
        const { studentId, courseId } = req.body;
        const user = req.user;
        if (!studentId || !courseId) {
            return res.status(400).json({ error: '학생 ID와 과정 ID가 필요합니다.' });
        }
        const template = await ChecklistTemplate_1.ChecklistTemplate.findById(templateId);
        if (!template || !template.isActive) {
            return res.status(404).json({ error: '템플릿을 찾을 수 없습니다.' });
        }
        const student = await User_1.User.findById(studentId);
        const course = await Course_1.Course.findById(courseId);
        if (!student || student.userType !== 'student') {
            return res.status(404).json({ error: '학생을 찾을 수 없습니다.' });
        }
        if (!course) {
            return res.status(404).json({ error: '과정을 찾을 수 없습니다.' });
        }
        const checklistData = {
            studentId,
            courseId,
            instructorId: user._id,
            items: template.items.map((item) => ({
                stepName: item.stepName,
                stepOrder: item.stepOrder,
                category: item.category,
                difficulty: item.difficulty,
                tips: item.tips,
                isCompleted: false
            })),
            overallProgress: 0,
            status: 'active',
            startDate: new Date()
        };
        const checklist = new Checklist_1.Checklist(checklistData);
        await checklist.save();
        res.status(201).json({
            success: true,
            message: '템플릿으로부터 체크리스트가 생성되었습니다.',
            data: checklist
        });
    }
    catch (error) {
        (0, logger_1.logError)('템플릿 기반 체크리스트 생성 실패', error);
        res.status(500).json({ error: '체크리스트 생성에 실패했습니다.' });
    }
});
exports.default = router;
//# sourceMappingURL=checklist.js.map