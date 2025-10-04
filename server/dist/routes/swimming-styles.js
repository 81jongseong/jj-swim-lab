"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const SwimmingStyle_1 = require("../models/SwimmingStyle");
const router = express_1.default.Router();
router.get('/', async (req, res) => {
    try {
        const { isPublicDemo, isActive } = req.query;
        const query = {};
        if (isPublicDemo !== undefined)
            query.isPublicDemo = isPublicDemo === 'true';
        if (isActive !== undefined)
            query.isActive = isActive === 'true';
        const styles = await SwimmingStyle_1.SwimmingStyle.find(query).sort({ createdAt: -1 });
        res.json({
            success: true,
            data: styles
        });
    }
    catch (error) {
        console.error('영법 목록 조회 실패:', error);
        res.status(500).json({
            success: false,
            message: '영법 목록 조회에 실패했습니다.'
        });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const style = await SwimmingStyle_1.SwimmingStyle.findById(req.params.id);
        if (!style) {
            return res.status(404).json({
                success: false,
                message: '영법을 찾을 수 없습니다.'
            });
        }
        res.json({
            success: true,
            data: style
        });
    }
    catch (error) {
        console.error('영법 조회 실패:', error);
        res.status(500).json({
            success: false,
            message: '영법 조회에 실패했습니다.'
        });
    }
});
router.post('/', auth_1.authMiddleware, (0, auth_1.requireRole)(['superAdmin', 'centerAdmin']), async (req, res) => {
    try {
        const style = new SwimmingStyle_1.SwimmingStyle(req.body);
        await style.save();
        res.status(201).json({
            success: true,
            message: '영법이 생성되었습니다.',
            data: style
        });
    }
    catch (error) {
        console.error('영법 생성 실패:', error);
        res.status(500).json({
            success: false,
            message: '영법 생성에 실패했습니다.'
        });
    }
});
router.put('/:id', auth_1.authMiddleware, (0, auth_1.requireRole)(['superAdmin', 'centerAdmin']), async (req, res) => {
    try {
        const style = await SwimmingStyle_1.SwimmingStyle.findByIdAndUpdate(req.params.id, { ...req.body, updatedAt: new Date() }, { new: true, runValidators: true });
        if (!style) {
            return res.status(404).json({
                success: false,
                message: '영법을 찾을 수 없습니다.'
            });
        }
        res.json({
            success: true,
            message: '영법이 수정되었습니다.',
            data: style
        });
    }
    catch (error) {
        console.error('영법 수정 실패:', error);
        res.status(500).json({
            success: false,
            message: '영법 수정에 실패했습니다.'
        });
    }
});
router.delete('/:id', auth_1.authMiddleware, (0, auth_1.requireRole)(['superAdmin', 'centerAdmin']), async (req, res) => {
    try {
        const style = await SwimmingStyle_1.SwimmingStyle.findByIdAndDelete(req.params.id);
        if (!style) {
            return res.status(404).json({
                success: false,
                message: '영법을 찾을 수 없습니다.'
            });
        }
        res.json({
            success: true,
            message: '영법이 삭제되었습니다.'
        });
    }
    catch (error) {
        console.error('영법 삭제 실패:', error);
        res.status(500).json({
            success: false,
            message: '영법 삭제에 실패했습니다.'
        });
    }
});
exports.default = router;
//# sourceMappingURL=swimming-styles.js.map