"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const SwimCondition_1 = require("../models/SwimCondition");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.get('/', async (req, res) => {
    try {
        const { category, group, keyword, isMSK28, centerId, isActive = 'true' } = req.query;
        const filter = {};
        if (category)
            filter.category = category;
        if (group)
            filter.group = group;
        if (keyword)
            filter.keywords = keyword;
        if (isMSK28 !== undefined)
            filter.isMSK28 = isMSK28 === 'true';
        if (centerId)
            filter.$or = [{ centerId }, { centerId: null }];
        if (isActive)
            filter.isActive = isActive === 'true';
        const conditions = await SwimCondition_1.SwimCondition.find(filter)
            .sort({ order: 1, createdAt: 1 })
            .lean();
        res.json({
            success: true,
            count: conditions.length,
            data: conditions
        });
    }
    catch (error) {
        console.error('질환 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '질환 조회 중 오류가 발생했습니다',
            error: error.message
        });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const condition = await SwimCondition_1.SwimCondition.findOne({ id: req.params.id }).lean();
        if (!condition) {
            return res.status(404).json({
                success: false,
                message: '질환을 찾을 수 없습니다'
            });
        }
        res.json({
            success: true,
            data: condition
        });
    }
    catch (error) {
        console.error('질환 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '질환 조회 중 오류가 발생했습니다',
            error: error.message
        });
    }
});
router.post('/', auth_1.auth, async (req, res) => {
    try {
        const conditionData = {
            ...req.body,
            createdBy: req.user._id
        };
        const condition = new SwimCondition_1.SwimCondition(conditionData);
        await condition.save();
        res.status(201).json({
            success: true,
            message: '질환이 추가되었습니다',
            data: condition
        });
    }
    catch (error) {
        console.error('질환 추가 오류:', error);
        res.status(500).json({
            success: false,
            message: '질환 추가 중 오류가 발생했습니다',
            error: error.message
        });
    }
});
router.put('/:id', auth_1.auth, async (req, res) => {
    try {
        const condition = await SwimCondition_1.SwimCondition.findOneAndUpdate({ id: req.params.id }, req.body, { new: true, runValidators: true });
        if (!condition) {
            return res.status(404).json({
                success: false,
                message: '질환을 찾을 수 없습니다'
            });
        }
        res.json({
            success: true,
            message: '질환이 수정되었습니다',
            data: condition
        });
    }
    catch (error) {
        console.error('질환 수정 오류:', error);
        res.status(500).json({
            success: false,
            message: '질환 수정 중 오류가 발생했습니다',
            error: error.message
        });
    }
});
router.delete('/:id', auth_1.auth, async (req, res) => {
    try {
        const condition = await SwimCondition_1.SwimCondition.findOneAndDelete({ id: req.params.id });
        if (!condition) {
            return res.status(404).json({
                success: false,
                message: '질환을 찾을 수 없습니다'
            });
        }
        res.json({
            success: true,
            message: '질환이 삭제되었습니다'
        });
    }
    catch (error) {
        console.error('질환 삭제 오류:', error);
        res.status(500).json({
            success: false,
            message: '질환 삭제 중 오류가 발생했습니다',
            error: error.message
        });
    }
});
exports.default = router;
//# sourceMappingURL=swim-conditions.js.map