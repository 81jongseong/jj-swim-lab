"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mongoose_1 = __importDefault(require("mongoose"));
const ExerciseRecommendation_1 = __importDefault(require("../models/ExerciseRecommendation"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/', auth_1.auth, async (req, res) => {
    try {
        const { technique, level, category, isActive } = req.query;
        const user = req.user;
        const filter = {};
        if (user.userType !== 'admin' && user.centerId) {
            filter.centerId = user.centerId;
        }
        if (technique)
            filter.technique = technique;
        if (level)
            filter.level = level;
        if (category)
            filter.category = category;
        if (isActive !== undefined)
            filter.isActive = isActive === 'true';
        const recommendations = await ExerciseRecommendation_1.default.find(filter)
            .populate('createdBy', 'name email')
            .populate('centerId', 'name')
            .sort({ createdAt: -1 });
        res.json({
            success: true,
            recommendations
        });
    }
    catch (error) {
        console.error('운동 추천 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '운동 추천을 불러오는 중 오류가 발생했습니다.'
        });
    }
});
router.get('/:id', auth_1.auth, async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: '유효하지 않은 ID입니다.'
            });
        }
        const filter = { _id: id };
        if (user.userType !== 'admin' && user.centerId) {
            filter.centerId = user.centerId;
        }
        const recommendation = await ExerciseRecommendation_1.default.findOne(filter)
            .populate('createdBy', 'name email')
            .populate('centerId', 'name');
        if (!recommendation) {
            return res.status(404).json({
                success: false,
                message: '운동 추천을 찾을 수 없습니다.'
            });
        }
        res.json({
            success: true,
            recommendation
        });
    }
    catch (error) {
        console.error('운동 추천 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '운동 추천을 불러오는 중 오류가 발생했습니다.'
        });
    }
});
router.post('/', auth_1.auth, (0, auth_1.requireRole)(['superAdmin', 'admin', 'centerAdmin', 'instructor']), async (req, res) => {
    try {
        const user = req.user;
        const { technique, level, category, exercises, workoutPlan, isActive = true } = req.body;
        if (!technique || !level || !category) {
            return res.status(400).json({
                success: false,
                message: '수영 기법, 레벨, 카테고리는 필수입니다.'
            });
        }
        const validTechniques = ['freestyle', 'backstroke', 'breaststroke', 'butterfly'];
        const validLevels = ['beginner', 'intermediate', 'advanced', 'expert'];
        const validCategories = ['posture', 'breathing', 'movement', 'efficiency'];
        if (!validTechniques.includes(technique)) {
            return res.status(400).json({
                success: false,
                message: '유효하지 않은 수영 기법입니다.'
            });
        }
        if (!validLevels.includes(level)) {
            return res.status(400).json({
                success: false,
                message: '유효하지 않은 레벨입니다.'
            });
        }
        if (!validCategories.includes(category)) {
            return res.status(400).json({
                success: false,
                message: '유효하지 않은 카테고리입니다.'
            });
        }
        const existingRecommendation = await ExerciseRecommendation_1.default.findOne({
            technique,
            level,
            category,
            centerId: user.centerId
        });
        if (existingRecommendation) {
            return res.status(400).json({
                success: false,
                message: '이미 같은 기법, 레벨, 카테고리의 운동 추천이 존재합니다.'
            });
        }
        const recommendation = new ExerciseRecommendation_1.default({
            technique,
            level,
            category,
            exercises: exercises || [],
            workoutPlan: workoutPlan || [],
            isActive,
            createdBy: user._id,
            centerId: user.centerId
        });
        await recommendation.save();
        const savedRecommendation = await ExerciseRecommendation_1.default.findById(recommendation._id)
            .populate('createdBy', 'name email')
            .populate('centerId', 'name');
        res.status(201).json({
            success: true,
            message: '운동 추천이 성공적으로 생성되었습니다.',
            recommendation: savedRecommendation
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
router.put('/:id', auth_1.auth, (0, auth_1.requireRole)(['superAdmin', 'admin', 'centerAdmin', 'instructor']), async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;
        const updateData = req.body;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: '유효하지 않은 ID입니다.'
            });
        }
        const filter = { _id: id };
        if (user.userType !== 'admin' && user.centerId) {
            filter.centerId = user.centerId;
        }
        if (user.userType !== 'admin') {
            filter.createdBy = user._id;
        }
        const recommendation = await ExerciseRecommendation_1.default.findOne(filter);
        if (!recommendation) {
            return res.status(404).json({
                success: false,
                message: '운동 추천을 찾을 수 없거나 수정 권한이 없습니다.'
            });
        }
        const allowedFields = ['technique', 'level', 'category', 'exercises', 'workoutPlan', 'isActive'];
        const updateFields = {};
        allowedFields.forEach(field => {
            if (updateData[field] !== undefined) {
                updateFields[field] = updateData[field];
            }
        });
        const updatedRecommendation = await ExerciseRecommendation_1.default.findByIdAndUpdate(id, updateFields, { new: true, runValidators: true }).populate('createdBy', 'name email')
            .populate('centerId', 'name');
        res.json({
            success: true,
            message: '운동 추천이 성공적으로 수정되었습니다.',
            recommendation: updatedRecommendation
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
router.delete('/:id', auth_1.auth, (0, auth_1.requireRole)(['superAdmin', 'admin', 'centerAdmin', 'instructor']), async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: '유효하지 않은 ID입니다.'
            });
        }
        const filter = { _id: id };
        if (user.userType !== 'admin' && user.centerId) {
            filter.centerId = user.centerId;
        }
        if (user.userType !== 'admin') {
            filter.createdBy = user._id;
        }
        const recommendation = await ExerciseRecommendation_1.default.findOne(filter);
        if (!recommendation) {
            return res.status(404).json({
                success: false,
                message: '운동 추천을 찾을 수 없거나 삭제 권한이 없습니다.'
            });
        }
        await ExerciseRecommendation_1.default.findByIdAndDelete(id);
        res.json({
            success: true,
            message: '운동 추천이 성공적으로 삭제되었습니다.'
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
router.patch('/:id/toggle', auth_1.auth, (0, auth_1.requireRole)(['superAdmin', 'admin', 'centerAdmin', 'instructor']), async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: '유효하지 않은 ID입니다.'
            });
        }
        const filter = { _id: id };
        if (user.userType !== 'admin' && user.centerId) {
            filter.centerId = user.centerId;
        }
        const recommendation = await ExerciseRecommendation_1.default.findOne(filter);
        if (!recommendation) {
            return res.status(404).json({
                success: false,
                message: '운동 추천을 찾을 수 없습니다.'
            });
        }
        recommendation.isActive = !recommendation.isActive;
        await recommendation.save();
        res.json({
            success: true,
            message: `운동 추천이 ${recommendation.isActive ? '활성화' : '비활성화'}되었습니다.`,
            recommendation
        });
    }
    catch (error) {
        console.error('운동 추천 토글 오류:', error);
        res.status(500).json({
            success: false,
            message: '운동 추천 상태 변경 중 오류가 발생했습니다.'
        });
    }
});
exports.default = router;
//# sourceMappingURL=ai-exercise-recommendations.js.map