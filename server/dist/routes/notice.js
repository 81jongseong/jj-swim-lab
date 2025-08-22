"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const Notice_1 = require("../models/Notice");
const router = express_1.default.Router();
router.get('/', auth_1.auth, async (req, res) => {
    try {
        const { category, priority, isPinned, page = 1, limit = 10 } = req.query;
        const user = req.user;
        let query = { isPublished: true };
        if (category)
            query.category = category;
        if (priority)
            query.priority = priority;
        if (isPinned !== undefined)
            query.isPinned = isPinned === 'true';
        if (user.userType !== 'superAdmin') {
            query.targetUserTypes = { $in: [user.userType] };
        }
        if (user.userType === 'centerAdmin' || user.userType === 'instructor') {
            if (user.centerId) {
                query.$or = [
                    { targetCenters: { $in: [user.centerId] } },
                    { targetCenters: { $exists: false } },
                    { targetCenters: { $size: 0 } }
                ];
            }
        }
        const skip = (Number(page) - 1) * Number(limit);
        const notices = await Notice_1.Notice.find(query)
            .populate('author', 'name email')
            .sort({ isPinned: -1, createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));
        const total = await Notice_1.Notice.countDocuments(query);
        res.json({
            notices,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        });
    }
    catch (error) {
        res.status(500).json({ message: '공지사항 목록 조회 실패', error: error instanceof Error ? error.message : String(error) });
    }
});
router.get('/:id', auth_1.auth, async (req, res) => {
    try {
        const notice = await Notice_1.Notice.findById(req.params.id)
            .populate('author', 'name email');
        if (!notice) {
            return res.status(404).json({ message: '공지사항을 찾을 수 없습니다.' });
        }
        const viewRecord = await Notice_1.NoticeView.findOneAndUpdate({ noticeId: req.params.id, userId: req.user._id }, { viewedAt: new Date() }, { upsert: true, new: true });
        if (!viewRecord.isNew) {
            await Notice_1.Notice.findByIdAndUpdate(req.params.id, { $inc: { viewCount: 1 } });
        }
        res.json(notice);
    }
    catch (error) {
        return res.status(500).json({ message: '공지사항 조회 실패', error: error instanceof Error ? error.message : String(error) });
    }
});
router.post('/', auth_1.auth, (0, auth_1.requirePermission)('noticeManagement'), async (req, res) => {
    try {
        const { title, content, category, priority, targetUserTypes, targetCenters, isPublished, expiresAt, attachments, tags, isPinned, allowComments } = req.body;
        const notice = new Notice_1.Notice({
            title,
            content,
            author: req.user._id,
            category,
            priority,
            targetUserTypes,
            targetCenters,
            isPublished: isPublished || false,
            publishedAt: isPublished ? new Date() : undefined,
            expiresAt,
            attachments,
            tags,
            isPinned: isPinned || false,
            allowComments: allowComments || false
        });
        await notice.save();
        res.status(201).json(notice);
    }
    catch (error) {
        return res.status(500).json({ message: '공지사항 생성 실패', error: error instanceof Error ? error.message : String(error) });
    }
});
router.put('/:id', auth_1.auth, (0, auth_1.requirePermission)('noticeManagement'), async (req, res) => {
    try {
        const notice = await Notice_1.Notice.findById(req.params.id);
        if (!notice) {
            return res.status(404).json({ message: '공지사항을 찾을 수 없습니다.' });
        }
        if (req.user.userType === 'centerAdmin' && notice.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: '수정 권한이 없습니다.' });
        }
        Object.assign(notice, req.body);
        if (req.body.isPublished && !notice.publishedAt) {
            notice.publishedAt = new Date();
        }
        await notice.save();
        res.json(notice);
    }
    catch (error) {
        return res.status(500).json({ message: '공지사항 수정 실패', error: error instanceof Error ? error.message : String(error) });
    }
});
router.delete('/:id', auth_1.auth, (0, auth_1.requirePermission)('noticeManagement'), async (req, res) => {
    try {
        const notice = await Notice_1.Notice.findById(req.params.id);
        if (!notice) {
            return res.status(404).json({ message: '공지사항을 찾을 수 없습니다.' });
        }
        if (req.user.userType === 'centerAdmin' && notice.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: '삭제 권한이 없습니다.' });
        }
        await Notice_1.Notice.findByIdAndDelete(req.params.id);
        await Notice_1.NoticeView.deleteMany({ noticeId: req.params.id });
        res.json({ message: '공지사항이 삭제되었습니다.' });
    }
    catch (error) {
        res.status(500).json({ message: '공지사항 삭제 실패', error: error instanceof Error ? error.message : String(error) });
    }
});
router.patch('/:id/publish', auth_1.auth, (0, auth_1.requirePermission)('noticeManagement'), async (req, res) => {
    try {
        const { isPublished } = req.body;
        const notice = await Notice_1.Notice.findById(req.params.id);
        if (!notice) {
            return res.status(404).json({ message: '공지사항을 찾을 수 없습니다.' });
        }
        notice.isPublished = isPublished;
        notice.publishedAt = isPublished ? new Date() : undefined;
        await notice.save();
        res.json({ message: `공지사항이 ${isPublished ? '발행' : '비발행'}되었습니다.` });
    }
    catch (error) {
        res.status(500).json({ message: '공지사항 상태 변경 실패', error: error instanceof Error ? error.message : String(error) });
    }
});
router.patch('/:id/pin', auth_1.auth, (0, auth_1.requirePermission)('noticeManagement'), async (req, res) => {
    try {
        const { isPinned } = req.body;
        const notice = await Notice_1.Notice.findById(req.params.id);
        if (!notice) {
            return res.status(404).json({ message: '공지사항을 찾을 수 없습니다.' });
        }
        notice.isPinned = isPinned;
        await notice.save();
        res.json({ message: `공지사항이 ${isPinned ? '고정' : '해제'}되었습니다.` });
    }
    catch (error) {
        res.status(500).json({ message: '공지사항 고정 상태 변경 실패', error: error instanceof Error ? error.message : String(error) });
    }
});
router.get('/unread/count', auth_1.auth, async (req, res) => {
    try {
        const user = req.user;
        let query = { isPublished: true };
        if (user.userType !== 'superAdmin') {
            query.targetUserTypes = { $in: [user.userType] };
        }
        const totalNotices = await Notice_1.Notice.countDocuments(query);
        const readNotices = await Notice_1.NoticeView.countDocuments({ userId: user._id });
        res.json({ unreadCount: totalNotices - readNotices });
    }
    catch (error) {
        res.status(500).json({ message: '읽지 않은 공지사항 수 조회 실패', error: error instanceof Error ? error.message : String(error) });
    }
});
router.get('/stats/overview', auth_1.auth, (0, auth_1.requirePermission)('noticeManagement'), async (req, res) => {
    try {
        const stats = await Notice_1.Notice.aggregate([
            {
                $group: {
                    _id: '$category',
                    totalNotices: { $sum: 1 },
                    publishedNotices: { $sum: { $cond: ['$isPublished', 1, 0] } },
                    pinnedNotices: { $sum: { $cond: ['$isPinned', 1, 0] } },
                    avgViewCount: { $avg: '$viewCount' }
                }
            },
            {
                $sort: { totalNotices: -1 }
            }
        ]);
        res.json(stats);
    }
    catch (error) {
        res.status(500).json({ message: '공지사항 통계 조회 실패', error: error instanceof Error ? error.message : String(error) });
    }
});
router.get('/popular', auth_1.auth, async (req, res) => {
    try {
        const { limit = 5 } = req.query;
        const user = req.user;
        let query = { isPublished: true };
        if (user.userType !== 'superAdmin') {
            query.targetUserTypes = { $in: [user.userType] };
        }
        const popularNotices = await Notice_1.Notice.find(query)
            .populate('author', 'name email')
            .sort({ viewCount: -1, createdAt: -1 })
            .limit(Number(limit));
        res.json(popularNotices);
    }
    catch (error) {
        res.status(500).json({ message: '인기 공지사항 조회 실패', error: error instanceof Error ? error.message : String(error) });
    }
});
exports.default = router;
//# sourceMappingURL=notice.js.map