"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const Notice_1 = require("../models/Notice");
const router = (0, express_1.Router)();
router.get('/', async (req, res) => {
    try {
        const { category, priority, tag } = req.query;
        const filter = { isPublished: true };
        if (category)
            filter.category = category;
        if (priority)
            filter.priority = priority;
        if (tag)
            filter.tags = tag;
        filter.$or = [
            { expiresAt: { $exists: false } },
            { expiresAt: { $gt: new Date() } }
        ];
        const notices = await Notice_1.Notice.find(filter)
            .populate('author', 'name userId')
            .sort({ priority: -1, createdAt: -1 });
        return res.json({ notices });
    }
    catch (error) {
        console.error('공지사항 조회 오류:', error);
        return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const notice = await Notice_1.Notice.findById(req.params.id)
            .populate('author', 'name userId');
        if (!notice) {
            return res.status(404).json({ error: '공지사항을 찾을 수 없습니다.' });
        }
        if (!notice.isPublished) {
            return res.status(403).json({ error: '조회 권한이 없습니다.' });
        }
        notice.viewCount += 1;
        await notice.save();
        return res.json({ notice });
    }
    catch (error) {
        console.error('공지사항 조회 오류:', error);
        return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
});
router.post('/', auth_1.auth, (0, auth_1.requireRole)(['superAdmin']), async (req, res) => {
    try {
        const { title, content, category, priority, isPublished, expiresAt, attachments, tags } = req.body;
        if (!title || !content) {
            return res.status(400).json({ error: '제목과 내용은 필수입니다.' });
        }
        const noticeData = {
            title,
            content,
            author: req.user._id,
            category: category || 'general',
            priority: priority || 'medium',
            isPublished: isPublished || false,
            expiresAt: expiresAt ? new Date(expiresAt) : undefined,
            attachments: attachments || [],
            tags: tags || [],
        };
        const notice = new Notice_1.Notice(noticeData);
        await notice.save();
        const populatedNotice = await Notice_1.Notice.findById(notice._id)
            .populate('author', 'name userId');
        return res.status(201).json({
            message: '공지사항이 생성되었습니다.',
            notice: populatedNotice
        });
    }
    catch (error) {
        console.error('공지사항 생성 오류:', error);
        return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
});
router.put('/:id', auth_1.auth, (0, auth_1.requireRole)(['superAdmin']), async (req, res) => {
    try {
        const notice = await Notice_1.Notice.findById(req.params.id);
        if (!notice) {
            return res.status(404).json({ error: '공지사항을 찾을 수 없습니다.' });
        }
        const updatedNotice = await Notice_1.Notice.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('author', 'name userId');
        return res.json({
            message: '공지사항이 수정되었습니다.',
            notice: updatedNotice
        });
    }
    catch (error) {
        console.error('공지사항 수정 오류:', error);
        return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
});
router.delete('/:id', auth_1.auth, (0, auth_1.requireRole)(['superAdmin']), async (req, res) => {
    try {
        const notice = await Notice_1.Notice.findById(req.params.id);
        if (!notice) {
            return res.status(404).json({ error: '공지사항을 찾을 수 없습니다.' });
        }
        await Notice_1.Notice.findByIdAndDelete(req.params.id);
        return res.json({ message: '공지사항이 삭제되었습니다.' });
    }
    catch (error) {
        console.error('공지사항 삭제 오류:', error);
        return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
});
router.patch('/:id/publish', auth_1.auth, (0, auth_1.requireRole)(['superAdmin']), async (req, res) => {
    try {
        const { isPublished } = req.body;
        if (typeof isPublished !== 'boolean') {
            return res.status(400).json({ error: '발행 상태를 지정해주세요.' });
        }
        const notice = await Notice_1.Notice.findByIdAndUpdate(req.params.id, {
            isPublished,
            publishedAt: isPublished ? new Date() : undefined
        }, { new: true }).populate('author', 'name userId');
        if (!notice) {
            return res.status(404).json({ error: '공지사항을 찾을 수 없습니다.' });
        }
        return res.json({
            message: `공지사항이 ${isPublished ? '발행' : '비발행'}되었습니다.`,
            notice
        });
    }
    catch (error) {
        console.error('공지사항 발행 상태 변경 오류:', error);
        return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
});
router.get('/admin/all', auth_1.auth, (0, auth_1.requireRole)(['superAdmin']), async (req, res) => {
    try {
        const { category, priority, isPublished } = req.query;
        const filter = {};
        if (category)
            filter.category = category;
        if (priority)
            filter.priority = priority;
        if (isPublished !== undefined)
            filter.isPublished = isPublished === 'true';
        const notices = await Notice_1.Notice.find(filter)
            .populate('author', 'name userId')
            .sort({ createdAt: -1 });
        return res.json({ notices });
    }
    catch (error) {
        console.error('관리자 공지사항 조회 오류:', error);
        return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
});
router.get('/admin/stats', auth_1.auth, (0, auth_1.requireRole)(['superAdmin']), async (req, res) => {
    try {
        const totalNotices = await Notice_1.Notice.countDocuments();
        const publishedNotices = await Notice_1.Notice.countDocuments({ isPublished: true });
        const expiredNotices = await Notice_1.Notice.countDocuments({
            expiresAt: { $lt: new Date() }
        });
        const categoryStats = await Notice_1.Notice.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } }
        ]);
        const priorityStats = await Notice_1.Notice.aggregate([
            { $group: { _id: '$priority', count: { $sum: 1 } } }
        ]);
        return res.json({
            totalNotices,
            publishedNotices,
            expiredNotices,
            categoryStats,
            priorityStats
        });
    }
    catch (error) {
        console.error('공지사항 통계 조회 오류:', error);
        return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
});
exports.default = router;
//# sourceMappingURL=notices.js.map