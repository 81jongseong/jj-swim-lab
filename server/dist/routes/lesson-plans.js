"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const LessonPlan_1 = __importDefault(require("../models/LessonPlan"));
const router = express_1.default.Router();
router.get('/', async (req, res) => {
    try {
        const { stroke, level, search, createdBy } = req.query;
        let filter = { isActive: true };
        if (stroke)
            filter.stroke = stroke;
        if (level)
            filter.level = level;
        if (createdBy)
            filter.createdBy = createdBy;
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        const lessonPlans = await LessonPlan_1.default.find(filter)
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 });
        res.json({ success: true, data: lessonPlans });
    }
    catch (error) {
        console.error('수업 계획 조회 오류:', error);
        res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const lessonPlan = await LessonPlan_1.default.findById(id)
            .populate('createdBy', 'name email');
        if (!lessonPlan) {
            return res.status(404).json({
                success: false,
                message: '수업 계획을 찾을 수 없습니다.'
            });
        }
        res.json({ success: true, data: lessonPlan });
    }
    catch (error) {
        console.error('수업 계획 조회 오류:', error);
        res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
    }
});
router.post('/', async (req, res) => {
    try {
        const { title, description, stroke, level, duration, objectives, activities, assessment, notes } = req.body;
        if (!title || !description || !stroke || !level || !duration) {
            return res.status(400).json({
                success: false,
                message: '필수 필드를 모두 입력해주세요.'
            });
        }
        const lessonPlan = new LessonPlan_1.default({
            title,
            description,
            stroke,
            level,
            duration,
            objectives: objectives || [],
            activities: activities || [],
            assessment: assessment || '',
            notes: notes || '',
            createdBy: req.user?._id || '000000000000000000000000'
        });
        await lessonPlan.save();
        res.status(201).json({ success: true, data: lessonPlan });
    }
    catch (error) {
        console.error('수업 계획 추가 오류:', error);
        res.status(400).json({ success: false, message: '입력 오류가 발생했습니다.' });
    }
});
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const lessonPlan = await LessonPlan_1.default.findByIdAndUpdate(id, { ...updateData, updatedAt: new Date() }, { new: true, runValidators: true });
        if (!lessonPlan) {
            return res.status(404).json({
                success: false,
                message: '수업 계획을 찾을 수 없습니다.'
            });
        }
        res.json({ success: true, data: lessonPlan });
    }
    catch (error) {
        console.error('수업 계획 수정 오류:', error);
        res.status(400).json({ success: false, message: '수정 오류가 발생했습니다.' });
    }
});
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const lessonPlan = await LessonPlan_1.default.findByIdAndUpdate(id, { isActive: false, updatedAt: new Date() }, { new: true });
        if (!lessonPlan) {
            return res.status(404).json({
                success: false,
                message: '수업 계획을 찾을 수 없습니다.'
            });
        }
        res.json({ success: true, message: '수업 계획이 비활성화되었습니다.' });
    }
    catch (error) {
        console.error('수업 계획 삭제 오류:', error);
        res.status(500).json({ success: false, message: '삭제 오류가 발생했습니다.' });
    }
});
exports.default = router;
//# sourceMappingURL=lesson-plans.js.map