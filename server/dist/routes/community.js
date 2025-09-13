"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
const defaultPosts = [
    {
        id: '1',
        title: '수영 초보자를 위한 기본 팁',
        content: '수영을 처음 시작하는 분들을 위한 기본적인 팁들을 공유합니다.',
        author: {
            id: 'admin',
            name: '시스템 관리자',
            userType: 'superAdmin'
        },
        category: 'tip',
        tags: ['초보자', '팁', '기본기'],
        likes: 25,
        comments: 8,
        views: 156,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }
];
router.get('/', auth_1.auth, async (req, res) => {
    try {
        const { page = 1, limit = 10, category, search } = req.query;
        console.log('🔍 커뮤니티 게시글 조회 요청:', { page, limit, category, search });
        let filteredPosts = defaultPosts.filter(post => post.isActive);
        if (category && category !== 'all') {
            filteredPosts = filteredPosts.filter(post => post.category === category);
        }
        if (search) {
            const searchTerm = search.toLowerCase();
            filteredPosts = filteredPosts.filter(post => post.title.toLowerCase().includes(searchTerm) ||
                post.content.toLowerCase().includes(searchTerm));
        }
        const startIndex = (Number(page) - 1) * Number(limit);
        const endIndex = startIndex + Number(limit);
        const paginatedPosts = filteredPosts.slice(startIndex, endIndex);
        const response = {
            success: true,
            data: {
                posts: paginatedPosts,
                pagination: {
                    currentPage: Number(page),
                    totalPages: Math.ceil(filteredPosts.length / Number(limit)),
                    totalPosts: filteredPosts.length,
                    hasNext: endIndex < filteredPosts.length,
                    hasPrev: Number(page) > 1
                }
            },
            message: '커뮤니티 게시글 목록을 성공적으로 조회했습니다.'
        };
        console.log('✅ 커뮤니티 게시글 조회 성공:', {
            totalPosts: filteredPosts.length,
            returnedPosts: paginatedPosts.length
        });
        res.status(200).json(response);
    }
    catch (error) {
        console.error('❌ 커뮤니티 게시글 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '커뮤니티 게시글 조회 중 오류가 발생했습니다.',
            error: error instanceof Error ? error.message : '알 수 없는 오류'
        });
    }
});
exports.default = router;
//# sourceMappingURL=community.js.map