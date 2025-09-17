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
        const { technique, level, category, difficulty } = req.query;
        const filter = {};
        if (technique)
            filter.technique = technique;
        if (level)
            filter.level = level;
        if (category)
            filter.category = category;
        if (difficulty)
            filter.difficulty = difficulty;
        const recommendations = await ExerciseRecommendation_1.default.find(filter)
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
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: '유효하지 않은 ID입니다.'
            });
        }
        const recommendation = await ExerciseRecommendation_1.default.findById(id);
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
        const { id, name, description, difficulty, category, duration, equipment, instructions, benefits } = req.body;
        if (!id || !name || !description || !difficulty || !category || !duration || !instructions || !benefits) {
            return res.status(400).json({
                success: false,
                message: '모든 필수 필드를 입력해주세요.'
            });
        }
        const validDifficulties = ['beginner', 'intermediate', 'advanced'];
        if (!validDifficulties.includes(difficulty)) {
            return res.status(400).json({
                success: false,
                message: '유효하지 않은 난이도입니다.'
            });
        }
        const existingRecommendation = await ExerciseRecommendation_1.default.findOne({
            id
        });
        if (existingRecommendation) {
            return res.status(400).json({
                success: false,
                message: '이미 같은 ID의 운동 추천이 존재합니다.'
            });
        }
        const recommendation = new ExerciseRecommendation_1.default({
            id,
            name,
            description,
            difficulty,
            category,
            duration,
            equipment: equipment || [],
            instructions,
            benefits
        });
        await recommendation.save();
        res.status(201).json({
            success: true,
            message: '운동 추천이 성공적으로 생성되었습니다.',
            recommendation
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
        const updateData = req.body;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: '유효하지 않은 ID입니다.'
            });
        }
        const recommendation = await ExerciseRecommendation_1.default.findById(id);
        if (!recommendation) {
            return res.status(404).json({
                success: false,
                message: '운동 추천을 찾을 수 없습니다.'
            });
        }
        const allowedFields = ['name', 'description', 'difficulty', 'category', 'duration', 'equipment', 'instructions', 'benefits'];
        const updateFields = {};
        allowedFields.forEach(field => {
            if (updateData[field] !== undefined) {
                updateFields[field] = updateData[field];
            }
        });
        const updatedRecommendation = await ExerciseRecommendation_1.default.findByIdAndUpdate(id, updateFields, { new: true, runValidators: true });
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
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: '유효하지 않은 ID입니다.'
            });
        }
        const recommendation = await ExerciseRecommendation_1.default.findById(id);
        if (!recommendation) {
            return res.status(404).json({
                success: false,
                message: '운동 추천을 찾을 수 없습니다.'
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
exports.default = router;
//# sourceMappingURL=ai-exercise-recommendations.js.map