"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const SwimTrainingMethod_1 = require("../models/SwimTrainingMethod");
const auth_1 = require("../middleware/auth");
const logger_1 = require("../utils/logger");
const router = express_1.default.Router();
router.get('/', async (req, res) => {
    try {
        const { category, centerId, isActive = 'true' } = req.query;
        const filter = {};
        if (category)
            filter.category = category;
        if (centerId)
            filter.$or = [{ centerId }, { centerId: null }];
        if (isActive)
            filter.isActive = isActive === 'true';
        const methods = await SwimTrainingMethod_1.SwimTrainingMethod.find(filter)
            .sort({ order: 1, createdAt: 1 })
            .lean();
        res.json({
            success: true,
            count: methods.length,
            data: methods
        });
    }
    catch (error) {
        (0, logger_1.logError)('훈련법 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '훈련법 조회 중 오류가 발생했습니다',
            error: error.message
        });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const method = await SwimTrainingMethod_1.SwimTrainingMethod.findOne({ id: req.params.id }).lean();
        if (!method) {
            return res.status(404).json({
                success: false,
                message: '훈련법을 찾을 수 없습니다'
            });
        }
        res.json({
            success: true,
            data: method
        });
    }
    catch (error) {
        (0, logger_1.logError)('훈련법 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '훈련법 조회 중 오류가 발생했습니다',
            error: error.message
        });
    }
});
router.post('/', auth_1.auth, async (req, res) => {
    try {
        const methodData = {
            ...req.body,
            createdBy: req.user._id
        };
        const method = new SwimTrainingMethod_1.SwimTrainingMethod(methodData);
        await method.save();
        res.status(201).json({
            success: true,
            message: '훈련법이 추가되었습니다',
            data: method
        });
    }
    catch (error) {
        (0, logger_1.logError)('훈련법 추가 오류:', error);
        res.status(500).json({
            success: false,
            message: '훈련법 추가 중 오류가 발생했습니다',
            error: error.message
        });
    }
});
router.put('/:id', auth_1.auth, async (req, res) => {
    try {
        const method = await SwimTrainingMethod_1.SwimTrainingMethod.findOneAndUpdate({ id: req.params.id }, req.body, { new: true, runValidators: true });
        if (!method) {
            return res.status(404).json({
                success: false,
                message: '훈련법을 찾을 수 없습니다'
            });
        }
        res.json({
            success: true,
            message: '훈련법이 수정되었습니다',
            data: method
        });
    }
    catch (error) {
        (0, logger_1.logError)('훈련법 수정 오류:', error);
        res.status(500).json({
            success: false,
            message: '훈련법 수정 중 오류가 발생했습니다',
            error: error.message
        });
    }
});
router.delete('/:id', auth_1.auth, async (req, res) => {
    try {
        const method = await SwimTrainingMethod_1.SwimTrainingMethod.findOneAndDelete({ id: req.params.id });
        if (!method) {
            return res.status(404).json({
                success: false,
                message: '훈련법을 찾을 수 없습니다'
            });
        }
        res.json({
            success: true,
            message: '훈련법이 삭제되었습니다'
        });
    }
    catch (error) {
        (0, logger_1.logError)('훈련법 삭제 오류:', error);
        res.status(500).json({
            success: false,
            message: '훈련법 삭제 중 오류가 발생했습니다',
            error: error.message
        });
    }
});
exports.default = router;
//# sourceMappingURL=swim-training-methods.js.map