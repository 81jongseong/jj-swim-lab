"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const CommunityPost_1 = require("../models/CommunityPost");
const CommunityComment_1 = require("../models/CommunityComment");
const CommunityReport_1 = require("../models/CommunityReport");
const router = express_1.default.Router();
router.get('/posts', async (req, res) => {
    try {
        const { q, tag, page = 1, limit = 10 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const filter = { isPublished: true };
        if (q)
            filter.$text = { $search: q };
        if (tag)
            filter.tags = tag;
        const posts = await CommunityPost_1.CommunityPost.find(filter).populate('author', 'name userId').skip(skip).limit(Number(limit)).sort({ createdAt: -1 });
        const total = await CommunityPost_1.CommunityPost.countDocuments(filter);
        res.json({ posts, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) } });
    }
    catch (e) {
        res.status(500).json({ error: '게시글 목록을 불러오는데 실패했습니다.' });
    }
});
router.post('/posts', auth_1.auth, async (req, res) => {
    try {
        const { title, content, tags } = req.body;
        if (!title || !content)
            return res.status(400).json({ error: '제목과 내용은 필수입니다.' });
        const post = await CommunityPost_1.CommunityPost.create({ title, content, tags: tags || [], author: req.user._id });
        res.status(201).json({ post });
    }
    catch (e) {
        res.status(500).json({ error: '게시글 생성에 실패했습니다.' });
    }
});
router.get('/posts/:id', async (req, res) => {
    try {
        const post = await CommunityPost_1.CommunityPost.findById(req.params.id).populate('author', 'name userId');
        if (!post || !post.isPublished)
            return res.status(404).json({ error: '게시글을 찾을 수 없습니다.' });
        res.json({ post });
    }
    catch (e) {
        res.status(500).json({ error: '게시글 조회에 실패했습니다.' });
    }
});
router.put('/posts/:id', auth_1.auth, async (req, res) => {
    try {
        const post = await CommunityPost_1.CommunityPost.findById(req.params.id);
        if (!post)
            return res.status(404).json({ error: '게시글을 찾을 수 없습니다.' });
        if (String(post.author) !== String(req.user._id) && req.user.userType !== 'superAdmin') {
            return res.status(403).json({ error: '수정 권한이 없습니다.' });
        }
        const updated = await CommunityPost_1.CommunityPost.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ post: updated });
    }
    catch (e) {
        res.status(500).json({ error: '게시글 수정에 실패했습니다.' });
    }
});
router.get('/posts/:id/comments', async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const comments = await CommunityComment_1.CommunityComment.find({ postId: req.params.id }).populate('author', 'name userId').skip(skip).limit(Number(limit)).sort({ createdAt: -1 });
        const total = await CommunityComment_1.CommunityComment.countDocuments({ postId: req.params.id });
        res.json({ comments, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) } });
    }
    catch (e) {
        res.status(500).json({ error: '댓글 목록을 불러오는데 실패했습니다.' });
    }
});
router.post('/posts/:id/comments', auth_1.auth, async (req, res) => {
    try {
        const { content } = req.body;
        if (!content)
            return res.status(400).json({ error: '내용을 입력해주세요.' });
        const comment = await CommunityComment_1.CommunityComment.create({ postId: req.params.id, author: req.user._id, content });
        await CommunityPost_1.CommunityPost.findByIdAndUpdate(req.params.id, { $inc: { commentsCount: 1 } });
        res.status(201).json({ comment });
    }
    catch (e) {
        res.status(500).json({ error: '댓글 작성에 실패했습니다.' });
    }
});
exports.default = router;
router.post('/reports', auth_1.auth, async (req, res) => {
    try {
        const { targetType, targetId, reason } = req.body;
        if (!['post', 'comment'].includes(targetType) || !targetId || !reason)
            return res.status(400).json({ error: '잘못된 신고 데이터' });
        const report = await CommunityReport_1.CommunityReport.create({ targetType, targetId, reason, reporter: req.user._id });
        res.status(201).json({ report });
    }
    catch (e) {
        if (e.code === 11000)
            return res.status(400).json({ error: '이미 신고한 대상입니다.' });
        res.status(500).json({ error: '신고 접수 실패' });
    }
});
router.get('/reports', auth_1.auth, (0, auth_1.requireRole)(['superAdmin']), async (req, res) => {
    try {
        const { status = 'open', page = 1, limit = 20 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const filter = {};
        if (status)
            filter.status = status;
        const reports = await CommunityReport_1.CommunityReport.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit));
        const total = await CommunityReport_1.CommunityReport.countDocuments(filter);
        res.json({ reports, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) } });
    }
    catch (e) {
        res.status(500).json({ error: '신고 목록 조회 실패' });
    }
});
router.patch('/reports/:id/status', auth_1.auth, (0, auth_1.requireRole)(['superAdmin']), async (req, res) => {
    try {
        const { status } = req.body;
        if (!['open', 'reviewed', 'dismissed'].includes(status))
            return res.status(400).json({ error: '유효하지 않은 상태' });
        const updated = await CommunityReport_1.CommunityReport.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!updated)
            return res.status(404).json({ error: '신고를 찾을 수 없습니다.' });
        res.json({ report: updated });
    }
    catch (e) {
        res.status(500).json({ error: '신고 상태 변경 실패' });
    }
});
//# sourceMappingURL=community.js.map