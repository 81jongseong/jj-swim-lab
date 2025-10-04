"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const mongoose_1 = __importDefault(require("mongoose"));
const router = (0, express_1.Router)();
const CommunityPostSchema = new mongoose_1.default.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: {
        name: { type: String, required: true },
        userId: { type: String, required: true }
    },
    category: {
        type: String,
        enum: ['tip', 'question', 'review', 'meetup', 'event', 'general'],
        default: 'general'
    },
    likes: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    isBlinded: { type: Boolean, default: false },
    warnings: { type: Number, default: 0 },
    reportCount: { type: Number, default: 0 },
    meetupDetails: {
        location: String,
        date: String,
        time: String,
        strokeType: String,
        distance: String,
        pace: String,
        maxParticipants: Number,
        currentParticipants: { type: Number, default: 0 },
        cost: Number,
        level: String,
        participants: [{ userId: String, userName: String, joinedAt: Date }]
    }
}, { timestamps: true });
const CommunityPost = mongoose_1.default.models.CommunityPost || mongoose_1.default.model('CommunityPost', CommunityPostSchema);
router.get('/posts', async (req, res) => {
    try {
        const posts = await CommunityPost.find()
            .sort({ createdAt: -1 })
            .limit(100);
        res.json({
            success: true,
            posts: posts
        });
    }
    catch (error) {
        console.error('게시글 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '게시글 조회 중 오류가 발생했습니다.'
        });
    }
});
router.post('/posts', auth_1.authMiddleware, async (req, res) => {
    try {
        const { title, content, category, meetupDetails } = req.body;
        const user = req.user;
        console.log('📝 게시글 작성 요청:', { title, category, user: user?.name });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: '인증이 필요합니다.'
            });
        }
        const newPost = new CommunityPost({
            title,
            content,
            category: category || 'general',
            author: {
                name: user.name || '익명',
                userId: user._id?.toString() || user.id?.toString() || 'unknown'
            },
            meetupDetails: category === 'meetup' ? {
                ...meetupDetails,
                currentParticipants: meetupDetails?.currentParticipants || 0,
                participants: meetupDetails?.participants || []
            } : undefined
        });
        await newPost.save();
        console.log('✅ 게시글 생성 성공:', newPost._id);
        res.json({
            success: true,
            post: newPost,
            message: '게시글이 작성되었습니다.'
        });
    }
    catch (error) {
        console.error('❌ 게시글 작성 오류:', error);
        res.status(500).json({
            success: false,
            message: error.message || '게시글 작성 중 오류가 발생했습니다.'
        });
    }
});
router.delete('/posts/:id', auth_1.authMiddleware, async (req, res) => {
    try {
        const user = req.user;
        if (user.userType !== 'superAdmin') {
            return res.status(403).json({
                success: false,
                message: '삭제 권한이 없습니다.'
            });
        }
        const post = await CommunityPost.findByIdAndDelete(req.params.id);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: '게시글을 찾을 수 없습니다.'
            });
        }
        res.json({
            success: true,
            message: '게시글이 삭제되었습니다.'
        });
    }
    catch (error) {
        console.error('게시글 삭제 오류:', error);
        res.status(500).json({
            success: false,
            message: '게시글 삭제 중 오류가 발생했습니다.'
        });
    }
});
router.post('/posts/:id/blind', auth_1.authMiddleware, async (req, res) => {
    try {
        const user = req.user;
        if (user.userType !== 'superAdmin') {
            return res.status(403).json({
                success: false,
                message: '블라인드 처리 권한이 없습니다.'
            });
        }
        const post = await CommunityPost.findByIdAndUpdate(req.params.id, { isBlinded: true }, { new: true });
        if (!post) {
            return res.status(404).json({
                success: false,
                message: '게시글을 찾을 수 없습니다.'
            });
        }
        res.json({
            success: true,
            post: post,
            message: '게시글이 블라인드 처리되었습니다.'
        });
    }
    catch (error) {
        console.error('블라인드 처리 오류:', error);
        res.status(500).json({
            success: false,
            message: '블라인드 처리 중 오류가 발생했습니다.'
        });
    }
});
router.post('/posts/:id/unblind', auth_1.authMiddleware, async (req, res) => {
    try {
        const user = req.user;
        if (user.userType !== 'superAdmin') {
            return res.status(403).json({
                success: false,
                message: '블라인드 해제 권한이 없습니다.'
            });
        }
        const post = await CommunityPost.findByIdAndUpdate(req.params.id, { isBlinded: false }, { new: true });
        if (!post) {
            return res.status(404).json({
                success: false,
                message: '게시글을 찾을 수 없습니다.'
            });
        }
        res.json({
            success: true,
            post: post,
            message: '게시글 블라인드가 해제되었습니다.'
        });
    }
    catch (error) {
        console.error('블라인드 해제 오류:', error);
        res.status(500).json({
            success: false,
            message: '블라인드 해제 중 오류가 발생했습니다.'
        });
    }
});
router.post('/posts/:id/warn', auth_1.authMiddleware, async (req, res) => {
    try {
        const user = req.user;
        const { authorId, reason } = req.body;
        if (user.userType !== 'superAdmin') {
            return res.status(403).json({
                success: false,
                message: '경고 발송 권한이 없습니다.'
            });
        }
        const post = await CommunityPost.findByIdAndUpdate(req.params.id, { $inc: { warnings: 1 } }, { new: true });
        if (!post) {
            return res.status(404).json({
                success: false,
                message: '게시글을 찾을 수 없습니다.'
            });
        }
        res.json({
            success: true,
            post: post,
            message: `작성자에게 경고가 발송되었습니다. (사유: ${reason})`
        });
    }
    catch (error) {
        console.error('경고 발송 오류:', error);
        res.status(500).json({
            success: false,
            message: '경고 발송 중 오류가 발생했습니다.'
        });
    }
});
router.post('/posts/:id/join', auth_1.authMiddleware, async (req, res) => {
    try {
        const { userId, userName } = req.body;
        const post = await CommunityPost.findById(req.params.id);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: '게시글을 찾을 수 없습니다.'
            });
        }
        if (!post.meetupDetails) {
            return res.status(400).json({
                success: false,
                message: '번개모임 게시글이 아닙니다.'
            });
        }
        const alreadyJoined = post.meetupDetails.participants?.some(p => p.userId === userId);
        if (alreadyJoined) {
            return res.status(400).json({
                success: false,
                message: '이미 참가 신청한 모임입니다.'
            });
        }
        if (post.meetupDetails.currentParticipants >= post.meetupDetails.maxParticipants) {
            return res.status(400).json({
                success: false,
                message: '모집 인원이 마감되었습니다.'
            });
        }
        if (!post.meetupDetails.participants) {
            post.meetupDetails.participants = [];
        }
        post.meetupDetails.participants.push({
            userId,
            userName,
            joinedAt: new Date()
        });
        post.meetupDetails.currentParticipants = (post.meetupDetails.currentParticipants || 0) + 1;
        await post.save();
        res.json({
            success: true,
            post: post,
            message: '번개모임 참가 신청이 완료되었습니다.'
        });
    }
    catch (error) {
        console.error('참가 신청 오류:', error);
        res.status(500).json({
            success: false,
            message: '참가 신청 중 오류가 발생했습니다.'
        });
    }
});
router.put('/rules', auth_1.authMiddleware, async (req, res) => {
    try {
        const user = req.user;
        if (user.userType !== 'superAdmin') {
            return res.status(403).json({
                success: false,
                message: '규칙 설정 권한이 없습니다.'
            });
        }
        const { title, rules, penalties } = req.body;
        res.json({
            success: true,
            rules: { title, rules, penalties },
            message: '커뮤니티 운영 규칙이 저장되었습니다.'
        });
    }
    catch (error) {
        console.error('규칙 저장 오류:', error);
        res.status(500).json({
            success: false,
            message: '규칙 저장 중 오류가 발생했습니다.'
        });
    }
});
exports.default = router;
//# sourceMappingURL=community-posts.js.map