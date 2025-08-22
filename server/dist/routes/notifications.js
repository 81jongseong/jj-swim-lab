"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Notification_1 = require("../models/Notification");
const User_1 = require("../models/User");
const auth_1 = require("../middleware/auth");
const cache_1 = require("../middleware/cache");
const logger_1 = require("../utils/logger");
const router = (0, express_1.Router)();
router.get('/', auth_1.auth, (0, cache_1.cache)({ ttl: 60 }), async (req, res) => {
    try {
        const { page = 1, limit = 20, category, isRead, type } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const filter = { userId: req.user._id };
        if (category)
            filter.category = category;
        if (isRead !== undefined)
            filter.isRead = isRead === 'true';
        if (type)
            filter.type = type;
        const notifications = await Notification_1.Notification.find(filter)
            .sort({ priority: -1, createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));
        const total = await Notification_1.Notification.countDocuments(filter);
        const unreadCount = await Notification_1.Notification.countDocuments({
            userId: req.user._id,
            isRead: false
        });
        res.json({
            notifications,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            },
            unreadCount
        });
    }
    catch (error) {
        (0, logger_1.logError)('알림 목록 조회 실패', error);
        res.status(500).json({ error: '알림을 불러오는데 실패했습니다.' });
    }
});
router.get('/:id', auth_1.auth, async (req, res) => {
    try {
        const notification = await Notification_1.Notification.findOne({
            _id: req.params.id,
            userId: req.user._id
        });
        if (!notification) {
            return res.status(404).json({ error: '알림을 찾을 수 없습니다.' });
        }
        res.json({ notification });
    }
    catch (error) {
        (0, logger_1.logError)('알림 조회 실패', error);
        res.status(500).json({ error: '알림을 불러오는데 실패했습니다.' });
    }
});
router.patch('/:id/read', auth_1.auth, async (req, res) => {
    try {
        const notification = await Notification_1.Notification.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, { isRead: true }, { new: true });
        if (!notification) {
            return res.status(404).json({ error: '알림을 찾을 수 없습니다.' });
        }
        res.json({ notification });
    }
    catch (error) {
        (0, logger_1.logError)('알림 읽음 처리 실패', error);
        res.status(500).json({ error: '알림 읽음 처리에 실패했습니다.' });
    }
});
router.patch('/read-all', auth_1.auth, async (req, res) => {
    try {
        await Notification_1.Notification.updateMany({ userId: req.user._id, isRead: false }, { isRead: true });
        res.json({ message: '모든 알림이 읽음 처리되었습니다.' });
    }
    catch (error) {
        (0, logger_1.logError)('전체 알림 읽음 처리 실패', error);
        res.status(500).json({ error: '알림 읽음 처리에 실패했습니다.' });
    }
});
router.delete('/:id', auth_1.auth, async (req, res) => {
    try {
        const notification = await Notification_1.Notification.findOneAndDelete({
            _id: req.params.id,
            userId: req.user._id
        });
        if (!notification) {
            return res.status(404).json({ error: '알림을 찾을 수 없습니다.' });
        }
        res.json({ message: '알림이 삭제되었습니다.' });
    }
    catch (error) {
        (0, logger_1.logError)('알림 삭제 실패', error);
        res.status(500).json({ error: '알림 삭제에 실패했습니다.' });
    }
});
router.get('/settings', auth_1.auth, async (req, res) => {
    try {
        const user = await User_1.User.findById(req.user._id).select('notificationSettings');
        res.json({ settings: {} });
    }
    catch (error) {
        (0, logger_1.logError)('알림 설정 조회 실패', error);
        res.status(500).json({ error: '알림 설정을 불러오는데 실패했습니다.' });
    }
});
router.put('/settings', auth_1.auth, async (req, res) => {
    try {
        const { email, push, sms, categories } = req.body;
        const updateData = {};
        if (email !== undefined)
            updateData['notificationSettings.email'] = email;
        if (push !== undefined)
            updateData['notificationSettings.push'] = push;
        if (sms !== undefined)
            updateData['notificationSettings.sms'] = sms;
        if (categories)
            updateData['notificationSettings.categories'] = categories;
        const user = await User_1.User.findByIdAndUpdate(req.user._id, { $set: updateData }, { new: true }).select('notificationSettings');
        res.json({ settings: {} });
    }
    catch (error) {
        (0, logger_1.logError)('알림 설정 업데이트 실패', error);
        res.status(500).json({ error: '알림 설정 업데이트에 실패했습니다.' });
    }
});
router.post('/broadcast', auth_1.auth, (0, auth_1.requireRole)(['superAdmin', 'centerAdmin']), async (req, res) => {
    try {
        const { title, message, type, category, priority, scheduledAt, expiresAt, targetUsers } = req.body;
        if (!title || !message) {
            return res.status(400).json({ error: '제목과 메시지는 필수입니다.' });
        }
        const filter = {};
        if (targetUsers && targetUsers.length > 0) {
            filter._id = { $in: targetUsers };
        }
        const users = await User_1.User.find(filter).select('_id');
        const notifications = users.map(user => ({
            userId: user._id,
            title,
            message,
            type: type || 'info',
            category: category || 'general',
            priority: priority || 'medium',
            scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
            expiresAt: expiresAt ? new Date(expiresAt) : undefined,
            metadata: { broadcast: true, sender: req.user._id }
        }));
        await Notification_1.Notification.insertMany(notifications);
        (0, logger_1.logInfo)('브로드캐스트 알림 발송', {
            count: notifications.length,
            title,
            sender: req.user._id
        });
        res.json({
            message: `${notifications.length}명에게 알림이 발송되었습니다.`,
            count: notifications.length
        });
    }
    catch (error) {
        (0, logger_1.logError)('브로드캐스트 알림 발송 실패', error);
        res.status(500).json({ error: '알림 발송에 실패했습니다.' });
    }
});
router.get('/stats/overview', auth_1.auth, (0, auth_1.requireRole)(['superAdmin', 'centerAdmin']), async (req, res) => {
    try {
        const totalNotifications = await Notification_1.Notification.countDocuments();
        const unreadNotifications = await Notification_1.Notification.countDocuments({ isRead: false });
        const todayNotifications = await Notification_1.Notification.countDocuments({
            createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
        });
        const categoryStats = await Notification_1.Notification.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        const typeStats = await Notification_1.Notification.aggregate([
            { $group: { _id: '$type', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        res.json({
            total: totalNotifications,
            unread: unreadNotifications,
            today: todayNotifications,
            byCategory: categoryStats,
            byType: typeStats
        });
    }
    catch (error) {
        (0, logger_1.logError)('알림 통계 조회 실패', error);
        res.status(500).json({ error: '알림 통계를 불러오는데 실패했습니다.' });
    }
});
exports.default = router;
//# sourceMappingURL=notifications.js.map