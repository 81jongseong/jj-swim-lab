"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const Notification_1 = require("../models/Notification");
const auth_1 = require("../middleware/auth");
const logger_1 = require("../utils/logger");
const router = express_1.default.Router();
router.get('/', auth_1.authMiddleware, async (req, res) => {
    try {
        const user = req.user;
        const userId = user._id || user.id || user.userId;
        const { page = 1, limit = 20, type, priority, isRead } = req.query;
        const query = { userId };
        if (type)
            query.type = type;
        if (priority)
            query.priority = priority;
        if (isRead !== undefined)
            query.isRead = isRead === 'true';
        const notifications = await Notification_1.Notification.find(query)
            .sort({ createdAt: -1 })
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit))
            .populate('userId', 'name email');
        const total = await Notification_1.Notification.countDocuments(query);
        res.json({
            success: true,
            data: {
                notifications,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total,
                    pages: Math.ceil(total / Number(limit))
                }
            }
        });
    }
    catch (error) {
        (0, logger_1.logError)('❌ 알림 목록 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '알림 목록 조회 중 오류가 발생했습니다.',
            error: error instanceof Error ? error.message : '알 수 없는 오류'
        });
    }
});
router.get('/unread-count', auth_1.authMiddleware, async (req, res) => {
    try {
        const user = req.user;
        const userId = user._id || user.id || user.userId;
        const count = await Notification_1.Notification.countDocuments({ userId, isRead: false });
        res.json({
            success: true,
            data: { count }
        });
    }
    catch (error) {
        (0, logger_1.logError)('❌ 읽지 않은 알림 개수 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '읽지 않은 알림 개수 조회 중 오류가 발생했습니다.',
            error: error instanceof Error ? error.message : '알 수 없는 오류'
        });
    }
});
router.put('/:id/read', auth_1.authMiddleware, async (req, res) => {
    try {
        const user = req.user;
        const userId = user._id || user.id || user.userId;
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: '유효하지 않은 알림 ID입니다.'
            });
        }
        const notification = await Notification_1.Notification.findOne({ _id: id, userId });
        if (!notification) {
            return res.status(404).json({
                success: false,
                message: '알림을 찾을 수 없습니다.'
            });
        }
        notification.isRead = true;
        await notification.save();
        res.json({
            success: true,
            message: '알림이 읽음 처리되었습니다.',
            data: notification
        });
    }
    catch (error) {
        (0, logger_1.logError)('❌ 알림 읽음 처리 오류:', error);
        res.status(500).json({
            success: false,
            message: '알림 읽음 처리 중 오류가 발생했습니다.',
            error: error instanceof Error ? error.message : '알 수 없는 오류'
        });
    }
});
router.put('/read-all', auth_1.authMiddleware, async (req, res) => {
    try {
        const user = req.user;
        const userId = user._id || user.id || user.userId;
        const result = await Notification_1.Notification.updateMany({ userId, isRead: false }, { isRead: true });
        res.json({
            success: true,
            message: `${result.modifiedCount}개의 알림이 읽음 처리되었습니다.`,
            data: { modifiedCount: result.modifiedCount }
        });
    }
    catch (error) {
        (0, logger_1.logError)('❌ 모든 알림 읽음 처리 오류:', error);
        res.status(500).json({
            success: false,
            message: '모든 알림 읽음 처리 중 오류가 발생했습니다.',
            error: error instanceof Error ? error.message : '알 수 없는 오류'
        });
    }
});
router.delete('/:id', auth_1.authMiddleware, async (req, res) => {
    try {
        const user = req.user;
        const userId = user._id || user.id || user.userId;
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: '유효하지 않은 알림 ID입니다.'
            });
        }
        const notification = await Notification_1.Notification.findOneAndDelete({ _id: id, userId });
        if (!notification) {
            return res.status(404).json({
                success: false,
                message: '알림을 찾을 수 없습니다.'
            });
        }
        res.json({
            success: true,
            message: '알림이 삭제되었습니다.'
        });
    }
    catch (error) {
        (0, logger_1.logError)('❌ 알림 삭제 오류:', error);
        res.status(500).json({
            success: false,
            message: '알림 삭제 중 오류가 발생했습니다.',
            error: error instanceof Error ? error.message : '알 수 없는 오류'
        });
    }
});
router.post('/', auth_1.authMiddleware, (0, auth_1.requireRole)(['superAdmin', 'centerAdmin']), async (req, res) => {
    try {
        const { userId, type, title, message, data, priority = 'medium', expiresAt } = req.body;
        if (!userId || !type || !title || !message) {
            return res.status(400).json({
                success: false,
                message: '필수 필드가 누락되었습니다.'
            });
        }
        const notification = await Notification_1.Notification.create({
            userId,
            type,
            title,
            message,
            data,
            priority,
            expiresAt: expiresAt ? new Date(expiresAt) : undefined
        });
        res.status(201).json({
            success: true,
            message: '알림이 생성되었습니다.',
            data: notification
        });
    }
    catch (error) {
        (0, logger_1.logError)('❌ 알림 생성 오류:', error);
        res.status(500).json({
            success: false,
            message: '알림 생성 중 오류가 발생했습니다.',
            error: error instanceof Error ? error.message : '알 수 없는 오류'
        });
    }
});
exports.default = router;
//# sourceMappingURL=notifications.js.map