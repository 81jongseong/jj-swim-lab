"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const TeachingMethod_1 = require("../models/TeachingMethod");
const router = express_1.default.Router();
router.get('/', async (req, res) => {
    try {
        const { category, level, difficulty, search } = req.query;
        const query = {};
        if (category) {
            query.category = category;
        }
        if (difficulty) {
            query.level = difficulty;
        }
        else if (level) {
            query.level = level;
        }
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { category: { $regex: search, $options: 'i' } }
            ];
        }
        console.log('🔍 강습법 조회 쿼리:', JSON.stringify(query, null, 2));
        const methods = await TeachingMethod_1.TeachingMethod.find(query)
            .sort({ order: 1, createdAt: 1 })
            .select('-__v');
        console.log(`📊 쿼리 결과: ${methods.length}개의 강습법 발견`);
        if (methods.length > 0) {
            console.log('📋 첫 번째 강습법 샘플:', {
                id: methods[0]._id,
                name: methods[0].name,
                isActive: methods[0].isActive,
                level: methods[0].level,
                steps: methods[0].steps?.length || 0
            });
        }
        res.json({
            success: true,
            message: '강습법 목록 조회 성공!',
            data: methods,
            total: methods.length
        });
    }
    catch (error) {
        console.error('강습법 목록 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '강습법 목록을 불러오는 데 실패했습니다.'
        });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const method = await TeachingMethod_1.TeachingMethod.findById(id).select('-__v');
        if (!method) {
            return res.status(404).json({
                success: false,
                message: '강습법을 찾을 수 없습니다.'
            });
        }
        res.json({
            success: true,
            message: '강습법 조회 성공!',
            data: method
        });
    }
    catch (error) {
        console.error('강습법 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '강습법을 불러오는 데 실패했습니다.'
        });
    }
});
router.post('/', auth_1.auth, (0, auth_1.requireRole)(['instructor', 'centerAdmin', 'superAdmin']), async (req, res) => {
    try {
        const { name, description, category, level, steps, tips, videoUrl, imageUrl } = req.body;
        if (!name || !description || !category || !steps) {
            return res.status(400).json({
                success: false,
                message: '필수 필드가 누락되었습니다.'
            });
        }
        const newMethod = new TeachingMethod_1.TeachingMethod({
            name,
            description,
            category,
            level: level || 'beginner',
            steps: Array.isArray(steps) ? steps : [steps],
            tips: Array.isArray(tips) ? tips : [],
            videoUrl,
            imageUrl,
            order: req.body.order || 0,
            createdBy: req.user._id,
            isActive: true
        });
        await newMethod.save();
        res.status(201).json({
            success: true,
            message: '강습법이 성공적으로 생성되었습니다!',
            data: newMethod
        });
    }
    catch (error) {
        console.error('강습법 생성 오류:', error);
        res.status(500).json({
            success: false,
            message: '강습법 생성에 실패했습니다.'
        });
    }
});
router.put('/:id', auth_1.auth, (0, auth_1.requireRole)(['instructor', 'centerAdmin', 'superAdmin']), async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, category, level, steps, tips, videoUrl, imageUrl } = req.body;
        const method = await TeachingMethod_1.TeachingMethod.findById(id);
        if (!method) {
            return res.status(404).json({
                success: false,
                message: '강습법을 찾을 수 없습니다.'
            });
        }
        if (req.user.userType !== 'superAdmin' &&
            req.user.userType !== 'centerAdmin' &&
            (!method.createdBy || method.createdBy.toString() !== req.user._id.toString())) {
            return res.status(403).json({
                success: false,
                message: '수정 권한이 없습니다.'
            });
        }
        if (name)
            method.name = name;
        if (description)
            method.description = description;
        if (category)
            method.category = category;
        if (level)
            method.level = level;
        if (steps)
            method.steps = Array.isArray(steps) ? steps : [steps];
        if (tips)
            method.tips = Array.isArray(tips) ? tips : [];
        if (videoUrl !== undefined)
            method.videoUrl = videoUrl;
        if (imageUrl !== undefined)
            method.imageUrl = imageUrl;
        if (req.body.order !== undefined)
            method.order = req.body.order;
        method.updatedAt = new Date();
        await method.save();
        res.json({
            success: true,
            message: '강습법이 성공적으로 수정되었습니다!',
            data: method
        });
    }
    catch (error) {
        console.error('강습법 수정 오류:', error);
        res.status(500).json({
            success: false,
            message: '강습법 수정에 실패했습니다.'
        });
    }
});
router.delete('/:id', auth_1.auth, (0, auth_1.requireRole)(['instructor', 'centerAdmin', 'superAdmin']), async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`🗑️ 강습법 삭제 요청: ${id}`);
        const method = await TeachingMethod_1.TeachingMethod.findById(id);
        if (!method) {
            console.log(`❌ 강습법을 찾을 수 없음: ${id}`);
            return res.status(404).json({
                success: false,
                message: '강습법을 찾을 수 없습니다.'
            });
        }
        console.log(`📋 삭제할 강습법: ${method.name} (${method.category})`);
        if (req.user.userType !== 'superAdmin' &&
            req.user.userType !== 'centerAdmin' &&
            (!method.createdBy || method.createdBy.toString() !== req.user._id.toString())) {
            console.log(`❌ 삭제 권한 없음: 사용자 ${req.user.userType}, 강습법 생성자 ${method.createdBy}`);
            return res.status(403).json({
                success: false,
                message: '삭제 권한이 없습니다.'
            });
        }
        const deleteResult = await TeachingMethod_1.TeachingMethod.findByIdAndDelete(id);
        console.log(`✅ 강습법 삭제 완료: ${id}, 결과:`, deleteResult);
        res.json({
            success: true,
            message: '강습법이 성공적으로 삭제되었습니다!'
        });
    }
    catch (error) {
        console.error('강습법 삭제 오류:', error);
        res.status(500).json({
            success: false,
            message: '강습법 삭제에 실패했습니다.'
        });
    }
});
router.get('/stats/categories', async (req, res) => {
    try {
        const stats = await TeachingMethod_1.TeachingMethod.aggregate([
            { $match: { isActive: true } },
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 },
                    levels: { $addToSet: '$level' }
                }
            },
            { $sort: { count: -1 } }
        ]);
        res.json({
            success: true,
            message: '카테고리별 통계 조회 성공!',
            data: stats
        });
    }
    catch (error) {
        console.error('카테고리 통계 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '통계 조회에 실패했습니다.'
        });
    }
});
router.get('/stats/difficulties', async (req, res) => {
    try {
        const stats = await TeachingMethod_1.TeachingMethod.aggregate([
            { $match: { isActive: true } },
            {
                $group: {
                    _id: '$level',
                    count: { $sum: 1 },
                    categories: { $addToSet: '$category' }
                }
            },
            { $sort: { count: -1 } }
        ]);
        res.json({
            success: true,
            message: '난이도별 통계 조회 성공!',
            data: stats
        });
    }
    catch (error) {
        console.error('난이도 통계 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '통계 조회에 실패했습니다.'
        });
    }
});
exports.default = router;
//# sourceMappingURL=teaching-methods.js.map