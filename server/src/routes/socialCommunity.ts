/**
 * 🏊‍♂️ JJ Swim Lab - 소셜 커뮤니티 API 라우트
 */

import { Router, Request, Response } from 'express';
import multer from 'multer';
import { authMiddleware } from '../middleware/auth';
import { CommunityService } from '../services/communityService';
import { ROOM_CONFIGS } from '../models/Community';
import { logError } from '../utils/logger';

const router = Router();
const communityService = CommunityService.getInstance();

// 파일 업로드 설정
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('이미지 또는 PDF 파일만 업로드 가능합니다.'));
    }
  }
});

/**
 * GET /api/social-community/rooms
 * 커뮤니티 방 목록 조회
 */
router.get('/rooms', authMiddleware, async (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: {
        rooms: ROOM_CONFIGS,
        message: '커뮤니티 방 목록 조회가 완료되었습니다.'
      }
    });
  } catch (error) {
    logError('커뮤니티 방 목록 조회 오류:', error);
    res.status(500).json({ success: false, error: '방 목록 조회 중 오류가 발생했습니다.' });
  }
});

/**
 * POST /api/social-community/equipment-review
 * 용품 후기 작성
 */
router.post('/equipment-review', authMiddleware, upload.array('images', 10), async (req: Request, res: Response) => {
  try {
    const {
      title, content, productName, brand, model, category, rating, usagePeriod,
      purchasePrice, purchaseDate, purchaseLocation, detailedRating, pros, cons,
      recommendedFor, wouldBuyAgain, recommendToOthers, comparedProducts
    } = req.body;

    const userId = (req as any).user?.userId;
    const userName = (req as any).user?.name || 'Unknown';
    const userRole = (req as any).user?.userType || 'student';

    const images = (req.files as Express.Multer.File[])?.map(file => ({
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

  } catch (error) {
    logError('용품 후기 작성 API 오류:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '용품 후기 작성 중 오류가 발생했습니다.'
    });
  }
});

export default router;
