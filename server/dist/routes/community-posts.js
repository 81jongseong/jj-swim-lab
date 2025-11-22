"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const Community_1 = require("../models/Community");
const mongoose_1 = __importDefault(require("mongoose"));
const logger_1 = require("../utils/logger");
const router = (0, express_1.Router)();
router.get('/posts', async (req, res) => {
    try {
        const { roomType } = req.query;
        const filter = {};
        if (roomType) {
            filter.roomType = roomType;
        }
        const posts = await Community_1.CommunityPost.find(filter)
            .populate('authorId', 'name email')
            .populate({
            path: 'roomSpecific.jobBoard.centerId',
            select: 'name',
            model: mongoose_1.default.models.Center || mongoose_1.default.models.SwimmingCenter || 'Center'
        })
            .sort({ createdAt: -1 })
            .limit(100);
        res.json({
            success: true,
            data: posts
        });
    }
    catch (error) {
        (0, logger_1.logError)('게시글 조회 오류', error);
        res.status(500).json({
            success: false,
            message: '게시글 조회 중 오류가 발생했습니다.'
        });
    }
});
router.post('/posts', auth_1.authMiddleware, async (req, res) => {
    try {
        const { title, content, roomType, roomSpecific } = req.body;
        const user = req.user;
        console.log('📝 게시글 작성 요청:', { title, roomType, user: user?.name });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: '인증이 필요합니다.'
            });
        }
        if (!title || !content) {
            return res.status(400).json({
                success: false,
                message: '제목과 내용은 필수입니다.'
            });
        }
        if (roomType === 'job_board' && !roomSpecific?.jobBoard) {
            return res.status(400).json({
                success: false,
                message: '구인구직 게시글은 jobBoard 정보가 필요합니다.'
            });
        }
        let authorRole = user.userType || 'student';
        if (authorRole === 'center-admin') {
            authorRole = 'centerAdmin';
        }
        const postData = {
            title,
            content,
            roomType: roomType || 'chat',
            authorId: user._id || user.id,
            authorName: user.name || '익명',
            authorRole: authorRole,
            roomSpecific: roomSpecific || {}
        };
        if (roomType === 'job_board' && roomSpecific?.jobBoard) {
            if (user.userType === 'centerAdmin' || user.userType === 'center-admin') {
                if (user.centerId) {
                    postData.roomSpecific.jobBoard.centerId = user.centerId;
                }
                else if (user.memberships && user.memberships.length > 0) {
                    const centerMembership = user.memberships.find((m) => m.role === 'centerAdmin');
                    if (centerMembership) {
                        postData.roomSpecific.jobBoard.centerId = centerMembership.centerId;
                    }
                }
            }
            if (!postData.roomSpecific.jobBoard.status) {
                postData.roomSpecific.jobBoard.status = 'open';
            }
        }
        const newPost = new Community_1.CommunityPost(postData);
        await newPost.save();
        await newPost.populate('authorId', 'name email');
        if (roomType === 'job_board' && newPost.roomSpecific?.jobBoard?.centerId) {
            await newPost.populate({
                path: 'roomSpecific.jobBoard.centerId',
                select: 'name',
                model: mongoose_1.default.models.Center || mongoose_1.default.models.SwimmingCenter || 'Center'
            });
        }
        console.log('✅ 게시글 생성 성공:', newPost._id);
        res.json({
            success: true,
            data: newPost,
            message: '게시글이 작성되었습니다.'
        });
    }
    catch (error) {
        (0, logger_1.logError)('게시글 작성 오류', error);
        res.status(500).json({
            success: false,
            message: error.message || '게시글 작성 중 오류가 발생했습니다.'
        });
    }
});
router.put('/posts/:id', auth_1.authMiddleware, async (req, res) => {
    try {
        const user = req.user;
        const { title, content, roomSpecific } = req.body;
        const post = await Community_1.CommunityPost.findById(req.params.id);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: '게시글을 찾을 수 없습니다.'
            });
        }
        const isAuthor = post.authorId.toString() === (user._id || user.id).toString();
        const isSuperAdmin = user.userType === 'superAdmin';
        if (!isAuthor && !isSuperAdmin) {
            return res.status(403).json({
                success: false,
                message: '수정 권한이 없습니다.'
            });
        }
        if (title)
            post.title = title;
        if (content)
            post.content = content;
        if (roomSpecific) {
            post.roomSpecific = { ...post.roomSpecific, ...roomSpecific };
        }
        await post.save();
        await post.populate('authorId', 'name email');
        if (post.roomType === 'job_board' && post.roomSpecific?.jobBoard?.centerId) {
            await post.populate({
                path: 'roomSpecific.jobBoard.centerId',
                select: 'name',
                model: mongoose_1.default.models.Center || mongoose_1.default.models.SwimmingCenter || 'Center'
            });
        }
        res.json({
            success: true,
            data: post,
            message: '게시글이 수정되었습니다.'
        });
    }
    catch (error) {
        (0, logger_1.logError)('게시글 수정 오류', error);
        res.status(500).json({
            success: false,
            message: error.message || '게시글 수정 중 오류가 발생했습니다.'
        });
    }
});
router.delete('/posts/:id', auth_1.authMiddleware, async (req, res) => {
    try {
        const user = req.user;
        const post = await Community_1.CommunityPost.findById(req.params.id);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: '게시글을 찾을 수 없습니다.'
            });
        }
        const isAuthor = post.authorId.toString() === (user._id || user.id).toString();
        const isSuperAdmin = user.userType === 'superAdmin';
        if (!isAuthor && !isSuperAdmin) {
            return res.status(403).json({
                success: false,
                message: '삭제 권한이 없습니다.'
            });
        }
        await Community_1.CommunityPost.findByIdAndDelete(req.params.id);
        res.json({
            success: true,
            message: '게시글이 삭제되었습니다.'
        });
    }
    catch (error) {
        (0, logger_1.logError)('게시글 삭제 오류', error);
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
        const post = await Community_1.CommunityPost.findByIdAndUpdate(req.params.id, { isHidden: true }, { new: true });
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
        (0, logger_1.logError)('블라인드 처리 오류', error);
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
        const post = await Community_1.CommunityPost.findByIdAndUpdate(req.params.id, { isHidden: false }, { new: true });
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
        (0, logger_1.logError)('블라인드 해제 오류', error);
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
        void authorId;
        if (user.userType !== 'superAdmin') {
            return res.status(403).json({
                success: false,
                message: '경고 발송 권한이 없습니다.'
            });
        }
        const post = await Community_1.CommunityPost.findByIdAndUpdate(req.params.id, { $inc: { warnings: 1 } }, { new: true });
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
        (0, logger_1.logError)('경고 발송 오류', error);
        res.status(500).json({
            success: false,
            message: '경고 발송 중 오류가 발생했습니다.'
        });
    }
});
router.post('/posts/:id/join', auth_1.authMiddleware, async (req, res) => {
    try {
        const { userId, userName } = req.body;
        const post = await Community_1.CommunityPost.findById(req.params.id);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: '게시글을 찾을 수 없습니다.'
            });
        }
        const meetupDetails = post.meetupDetails;
        if (!meetupDetails) {
            return res.status(400).json({
                success: false,
                message: '번개모임 게시글이 아닙니다.'
            });
        }
        const alreadyJoined = meetupDetails.participants?.some((participant) => participant.userId === userId);
        if (alreadyJoined) {
            return res.status(400).json({
                success: false,
                message: '이미 참가 신청한 모임입니다.'
            });
        }
        if (meetupDetails.currentParticipants >= meetupDetails.maxParticipants) {
            return res.status(400).json({
                success: false,
                message: '모집 인원이 마감되었습니다.'
            });
        }
        if (!meetupDetails.participants) {
            meetupDetails.participants = [];
        }
        meetupDetails.participants.push({
            userId,
            userName,
            joinedAt: new Date()
        });
        meetupDetails.currentParticipants = (meetupDetails.currentParticipants || 0) + 1;
        post.meetupDetails = meetupDetails;
        await post.save();
        res.json({
            success: true,
            post: post,
            message: '번개모임 참가 신청이 완료되었습니다.'
        });
    }
    catch (error) {
        (0, logger_1.logError)('참가 신청 오류', error);
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
        (0, logger_1.logError)('규칙 저장 오류', error);
        res.status(500).json({
            success: false,
            message: '규칙 저장 중 오류가 발생했습니다.'
        });
    }
});
exports.default = router;
//# sourceMappingURL=community-posts.js.map