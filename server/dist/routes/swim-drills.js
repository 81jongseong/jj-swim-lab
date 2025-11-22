"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const SwimDrill_1 = require("../models/SwimDrill");
const auth_1 = require("../middleware/auth");
const logger_1 = require("../utils/logger");
const router = express_1.default.Router();
router.get('/', async (req, res) => {
    try {
        const { category, tag, centerId, isActive = 'true' } = req.query;
        const filter = {};
        if (category)
            filter.category = category;
        if (tag)
            filter.tags = tag;
        if (centerId)
            filter.$or = [{ centerId }, { centerId: null }];
        if (isActive)
            filter.isActive = isActive === 'true';
        const drills = await SwimDrill_1.SwimDrill.find(filter)
            .sort({ order: 1, createdAt: 1 })
            .lean();
        res.json({
            success: true,
            count: drills.length,
            data: drills
        });
    }
    catch (error) {
        (0, logger_1.logError)('드릴 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '드릴 조회 중 오류가 발생했습니다',
            error: error.message
        });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const drill = await SwimDrill_1.SwimDrill.findOne({ id: req.params.id }).lean();
        if (!drill) {
            return res.status(404).json({
                success: false,
                message: '드릴을 찾을 수 없습니다'
            });
        }
        res.json({
            success: true,
            data: drill
        });
    }
    catch (error) {
        (0, logger_1.logError)('드릴 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '드릴 조회 중 오류가 발생했습니다',
            error: error.message
        });
    }
});
router.post('/', auth_1.auth, async (req, res) => {
    try {
        const drillData = {
            ...req.body,
            createdBy: req.user._id
        };
        const drill = new SwimDrill_1.SwimDrill(drillData);
        await drill.save();
        res.status(201).json({
            success: true,
            message: '드릴이 추가되었습니다',
            data: drill
        });
    }
    catch (error) {
        (0, logger_1.logError)('드릴 추가 오류:', error);
        res.status(500).json({
            success: false,
            message: '드릴 추가 중 오류가 발생했습니다',
            error: error.message
        });
    }
});
router.put('/:id', auth_1.auth, async (req, res) => {
    try {
        const drill = await SwimDrill_1.SwimDrill.findOneAndUpdate({ id: req.params.id }, req.body, { new: true, runValidators: true });
        if (!drill) {
            return res.status(404).json({
                success: false,
                message: '드릴을 찾을 수 없습니다'
            });
        }
        res.json({
            success: true,
            message: '드릴이 수정되었습니다',
            data: drill
        });
    }
    catch (error) {
        (0, logger_1.logError)('드릴 수정 오류:', error);
        res.status(500).json({
            success: false,
            message: '드릴 수정 중 오류가 발생했습니다',
            error: error.message
        });
    }
});
router.delete('/:id', auth_1.auth, async (req, res) => {
    try {
        const drill = await SwimDrill_1.SwimDrill.findOneAndDelete({ id: req.params.id });
        if (!drill) {
            return res.status(404).json({
                success: false,
                message: '드릴을 찾을 수 없습니다'
            });
        }
        res.json({
            success: true,
            message: '드릴이 삭제되었습니다'
        });
    }
    catch (error) {
        (0, logger_1.logError)('드릴 삭제 오류:', error);
        res.status(500).json({
            success: false,
            message: '드릴 삭제 중 오류가 발생했습니다',
            error: error.message
        });
    }
});
exports.default = router;
//# sourceMappingURL=swim-drills.js.map