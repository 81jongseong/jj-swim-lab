"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const auth_1 = require("../middleware/auth");
const communityService_1 = require("../services/communityService");
const Community_1 = require("../models/Community");
const logger_1 = require("../utils/logger");
const router = (0, express_1.Router)();
const communityService = communityService_1.CommunityService.getInstance();
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
            cb(null, true);
        }
        else {
            cb(new Error('이미지 또는 PDF 파일만 업로드 가능합니다.'));
        }
    }
});
router.get('/rooms', auth_1.authMiddleware, async (req, res) => {
    try {
        res.json({
            success: true,
            data: {
                rooms: Community_1.ROOM_CONFIGS,
                message: '커뮤니티 방 목록 조회가 완료되었습니다.'
            }
        });
    }
    catch (error) {
        (0, logger_1.logError)('커뮤니티 방 목록 조회 오류:', error);
        res.status(500).json({ success: false, error: '방 목록 조회 중 오류가 발생했습니다.' });
    }
});
router.post('/equipment-review', auth_1.authMiddleware, upload.array('images', 10), async (req, res) => {
    try {
        const { title, content, productName, brand, model, category, rating, usagePeriod, purchasePrice, purchaseDate, purchaseLocation, detailedRating, pros, cons, recommendedFor, wouldBuyAgain, recommendToOthers, comparedProducts } = req.body;
        const userId = req.user?.userId;
        const userName = req.user?.name || 'Unknown';
        const userRole = req.user?.userType || 'student';
        const images = req.files?.map(file => ({
            type: 'image',
            url: `/uploads/equipment-reviews/${file.filename}`,
            filename: file.originalname,
            size: file.size
        })) || [];
        const reviewPost = await communityService.createEquipmentReview({
            title, content, authorId: userId, authorName: userName, authorRole: userRole,
            productName, brand, model, category, rating: Number(rating), usagePeriod,
            purchasePrice: purchasePrice ? Number(purchasePrice) : undefined,
            purchaseDate: purchaseDate ? new Date(purchaseDate) : undefined,
            purchaseLocation,
            detailedRating: JSON.parse(detailedRating),
            pros: JSON.parse(pros || '[]'),
            cons: JSON.parse(cons || '[]'),
            recommendedFor: JSON.parse(recommendedFor || '[]'),
            wouldBuyAgain: wouldBuyAgain === 'true',
            recommendToOthers: recommendToOthers === 'true',
            comparedProducts: comparedProducts ? JSON.parse(comparedProducts) : undefined,
            attachments: images
        });
        res.json({
            success: true,
            data: { post: reviewPost, message: '용품 후기가 성공적으로 작성되었습니다.' }
        });
    }
    catch (error) {
        (0, logger_1.logError)('용품 후기 작성 API 오류:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : '용품 후기 작성 중 오류가 발생했습니다.'
        });
    }
});
exports.default = router;
//# sourceMappingURL=socialCommunity.js.map