"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const YouTubeVideo_1 = require("../models/YouTubeVideo");
const TeachingMethod_1 = require("../models/TeachingMethod");
const router = express_1.default.Router();
const extractVideoId = (url) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : '';
};
const getThumbnailUrl = (videoId) => {
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
};
router.get('/', async (req, res) => {
    try {
        const { category, level, search, teachingMethodId } = req.query;
        const query = { isActive: true };
        if (category) {
            query.category = category;
        }
        if (level) {
            query.level = level;
        }
        if (teachingMethodId) {
            query.teachingMethodId = teachingMethodId;
        }
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { category: { $regex: search, $options: 'i' } }
            ];
        }
        console.log('🔍 YouTube 비디오 조회 쿼리:', JSON.stringify(query, null, 2));
        const videos = await YouTubeVideo_1.YouTubeVideo.find(query)
            .populate('teachingMethodId', 'name category level')
            .populate('createdBy', 'name userType')
            .sort({ createdAt: -1 })
            .select('-__v');
        console.log(`📊 쿼리 결과: ${videos.length}개의 비디오 발견`);
        res.json({
            success: true,
            message: 'YouTube 비디오 목록 조회 성공!',
            data: videos,
            total: videos.length
        });
    }
    catch (error) {
        console.error('YouTube 비디오 목록 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: 'YouTube 비디오 목록을 불러오는 데 실패했습니다.'
        });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const video = await YouTubeVideo_1.YouTubeVideo.findById(id)
            .populate('teachingMethodId', 'name category level steps tips')
            .populate('createdBy', 'name userType')
            .select('-__v');
        if (!video) {
            return res.status(404).json({
                success: false,
                message: 'YouTube 비디오를 찾을 수 없습니다.'
            });
        }
        res.json({
            success: true,
            message: 'YouTube 비디오 조회 성공!',
            data: video
        });
    }
    catch (error) {
        console.error('YouTube 비디오 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: 'YouTube 비디오를 불러오는 데 실패했습니다.'
        });
    }
});
router.post('/', auth_1.auth, (0, auth_1.requireRole)(['instructor', 'centerAdmin', 'superAdmin']), async (req, res) => {
    try {
        const { title, description, videoId, category, level, duration, teachingMethodId, tags } = req.body;
        if (!title || !description || !videoId || !category || !level) {
            return res.status(400).json({
                success: false,
                message: '필수 필드가 누락되었습니다.'
            });
        }
        const extractedVideoId = extractVideoId(videoId);
        if (!extractedVideoId) {
            return res.status(400).json({
                success: false,
                message: '유효한 YouTube URL을 입력해주세요.'
            });
        }
        const existingVideo = await YouTubeVideo_1.YouTubeVideo.findOne({ videoId: extractedVideoId });
        if (existingVideo) {
            return res.status(400).json({
                success: false,
                message: '이미 등록된 YouTube 비디오입니다.'
            });
        }
        if (teachingMethodId) {
            const teachingMethod = await TeachingMethod_1.TeachingMethod.findById(teachingMethodId);
            if (!teachingMethod) {
                return res.status(400).json({
                    success: false,
                    message: '연결할 강습법을 찾을 수 없습니다.'
                });
            }
        }
        const newVideo = new YouTubeVideo_1.YouTubeVideo({
            title,
            description,
            videoId: extractedVideoId,
            thumbnailUrl: getThumbnailUrl(extractedVideoId),
            duration: duration || '',
            category,
            level,
            teachingMethodId: teachingMethodId || null,
            createdBy: req.user._id,
            isActive: true,
            tags: Array.isArray(tags) ? tags : []
        });
        await newVideo.save();
        const savedVideo = await YouTubeVideo_1.YouTubeVideo.findById(newVideo._id)
            .populate('teachingMethodId', 'name category level')
            .populate('createdBy', 'name userType')
            .select('-__v');
        res.status(201).json({
            success: true,
            message: 'YouTube 비디오가 성공적으로 생성되었습니다!',
            data: savedVideo
        });
    }
    catch (error) {
        console.error('YouTube 비디오 생성 오류:', error);
        res.status(500).json({
            success: false,
            message: 'YouTube 비디오 생성에 실패했습니다.'
        });
    }
});
router.put('/:id', auth_1.auth, (0, auth_1.requireRole)(['instructor', 'centerAdmin', 'superAdmin']), async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, videoId, category, level, duration, teachingMethodId, tags } = req.body;
        const video = await YouTubeVideo_1.YouTubeVideo.findById(id);
        if (!video) {
            return res.status(404).json({
                success: false,
                message: 'YouTube 비디오를 찾을 수 없습니다.'
            });
        }
        if (req.user.userType !== 'superAdmin' &&
            req.user.userType !== 'centerAdmin' &&
            (!video.createdBy || video.createdBy.toString() !== req.user._id.toString())) {
            return res.status(403).json({
                success: false,
                message: '수정 권한이 없습니다.'
            });
        }
        let extractedVideoId = video.videoId;
        if (videoId && videoId !== video.videoId) {
            extractedVideoId = extractVideoId(videoId);
            if (!extractedVideoId) {
                return res.status(400).json({
                    success: false,
                    message: '유효한 YouTube URL을 입력해주세요.'
                });
            }
            const existingVideo = await YouTubeVideo_1.YouTubeVideo.findOne({
                videoId: extractedVideoId,
                _id: { $ne: id }
            });
            if (existingVideo) {
                return res.status(400).json({
                    success: false,
                    message: '이미 등록된 YouTube 비디오입니다.'
                });
            }
        }
        if (teachingMethodId && teachingMethodId !== video.teachingMethodId?.toString()) {
            const teachingMethod = await TeachingMethod_1.TeachingMethod.findById(teachingMethodId);
            if (!teachingMethod) {
                return res.status(400).json({
                    success: false,
                    message: '연결할 강습법을 찾을 수 없습니다.'
                });
            }
        }
        if (title)
            video.title = title;
        if (description)
            video.description = description;
        if (extractedVideoId !== video.videoId) {
            video.videoId = extractedVideoId;
            video.thumbnailUrl = getThumbnailUrl(extractedVideoId);
        }
        if (category)
            video.category = category;
        if (level)
            video.level = level;
        if (duration !== undefined)
            video.duration = duration;
        if (teachingMethodId !== undefined)
            video.teachingMethodId = teachingMethodId || null;
        if (tags !== undefined)
            video.tags = Array.isArray(tags) ? tags : [];
        video.updatedAt = new Date();
        await video.save();
        const updatedVideo = await YouTubeVideo_1.YouTubeVideo.findById(video._id)
            .populate('teachingMethodId', 'name category level')
            .populate('createdBy', 'name userType')
            .select('-__v');
        res.json({
            success: true,
            message: 'YouTube 비디오가 성공적으로 수정되었습니다!',
            data: updatedVideo
        });
    }
    catch (error) {
        console.error('YouTube 비디오 수정 오류:', error);
        res.status(500).json({
            success: false,
            message: 'YouTube 비디오 수정에 실패했습니다.'
        });
    }
});
router.delete('/:id', auth_1.auth, (0, auth_1.requireRole)(['instructor', 'centerAdmin', 'superAdmin']), async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`🗑️ YouTube 비디오 삭제 요청: ${id}`);
        const video = await YouTubeVideo_1.YouTubeVideo.findById(id);
        if (!video) {
            console.log(`❌ YouTube 비디오를 찾을 수 없음: ${id}`);
            return res.status(404).json({
                success: false,
                message: 'YouTube 비디오를 찾을 수 없습니다.'
            });
        }
        console.log(`📋 삭제할 YouTube 비디오: ${video.title} (${video.category})`);
        if (req.user.userType !== 'superAdmin' &&
            req.user.userType !== 'centerAdmin' &&
            (!video.createdBy || video.createdBy.toString() !== req.user._id.toString())) {
            console.log(`❌ 삭제 권한 없음: 사용자 ${req.user.userType}, 비디오 생성자 ${video.createdBy}`);
            return res.status(403).json({
                success: false,
                message: '삭제 권한이 없습니다.'
            });
        }
        const deleteResult = await YouTubeVideo_1.YouTubeVideo.findByIdAndDelete(id);
        console.log(`✅ YouTube 비디오 삭제 완료: ${id}, 결과:`, deleteResult);
        res.json({
            success: true,
            message: 'YouTube 비디오가 성공적으로 삭제되었습니다!'
        });
    }
    catch (error) {
        console.error('YouTube 비디오 삭제 오류:', error);
        res.status(500).json({
            success: false,
            message: 'YouTube 비디오 삭제에 실패했습니다.'
        });
    }
});
router.get('/teaching-method/:methodId', async (req, res) => {
    try {
        const { methodId } = req.params;
        const videos = await YouTubeVideo_1.YouTubeVideo.find({
            teachingMethodId: methodId,
            isActive: true
        })
            .populate('teachingMethodId', 'name category level')
            .populate('createdBy', 'name userType')
            .sort({ createdAt: -1 })
            .select('-__v');
        res.json({
            success: true,
            message: '강습법별 YouTube 비디오 조회 성공!',
            data: videos,
            total: videos.length
        });
    }
    catch (error) {
        console.error('강습법별 YouTube 비디오 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '강습법별 YouTube 비디오 조회에 실패했습니다.'
        });
    }
});
router.get('/stats/categories', async (req, res) => {
    try {
        const stats = await YouTubeVideo_1.YouTubeVideo.aggregate([
            { $match: { isActive: true } },
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 },
                    levels: { $addToSet: '$level' }
                }
            },
            { $sort: { count: -1 } }
        ]);
        res.json({
            success: true,
            message: '카테고리별 통계 조회 성공!',
            data: stats
        });
    }
    catch (error) {
        console.error('카테고리 통계 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '통계 조회에 실패했습니다.'
        });
    }
});
router.get('/stats/levels', async (req, res) => {
    try {
        const stats = await YouTubeVideo_1.YouTubeVideo.aggregate([
            { $match: { isActive: true } },
            {
                $group: {
                    _id: '$level',
                    count: { $sum: 1 },
                    categories: { $addToSet: '$category' }
                }
            },
            { $sort: { count: -1 } }
        ]);
        res.json({
            success: true,
            message: '레벨별 통계 조회 성공!',
            data: stats
        });
    }
    catch (error) {
        console.error('레벨 통계 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '통계 조회에 실패했습니다.'
        });
    }
});
exports.default = router;
//# sourceMappingURL=youtube-videos.js.map