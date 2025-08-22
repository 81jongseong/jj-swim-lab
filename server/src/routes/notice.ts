import express, { Router } from 'express';
import { auth, requirePermission, requireLevel } from '../middleware/auth';
import { Notice, NoticeView } from '../models/Notice';
import { User } from '../models/User';

interface AuthRequest extends express.Request {
  user?: any;
}

const router: Router = express.Router();

// 공지사항 목록 조회
router.get('/', auth, async (req: AuthRequest, res) => {
  try {
    const { category, priority, isPinned, page = 1, limit = 10 } = req.query;
    const user = req.user;

    let query: any = { isPublished: true };
    
    if (category) query.category = category;
    if (priority) query.priority = priority;
    if (isPinned !== undefined) query.isPinned = isPinned === 'true';

    // 사용자 타입에 따른 필터링
    if (user.userType !== 'superAdmin') {
      query.targetUserTypes = { $in: [user.userType] };
    }

    // 센터 관리자와 강사의 경우 해당 센터 공지사항만
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
    
    const notices = await Notice.find(query)
      .populate('author', 'name email')
      .sort({ isPinned: -1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Notice.countDocuments(query);

    res.json({
      notices,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ message: '공지사항 목록 조회 실패', error: error instanceof Error ? error.message : String(error) });
  }
});

// 공지사항 상세 조회
router.get('/:id', auth, async (req: AuthRequest, res) => {
  try {
    const notice = await Notice.findById(req.params.id)
      .populate('author', 'name email');

    if (!notice) {
      return res.status(404).json({ message: '공지사항을 찾을 수 없습니다.' });
    }

    // 조회수 증가
    const viewRecord = await NoticeView.findOneAndUpdate(
      { noticeId: req.params.id, userId: req.user._id },
      { viewedAt: new Date() },
      { upsert: true, new: true }
    );

    if (!viewRecord.isNew) {
      await Notice.findByIdAndUpdate(req.params.id, { $inc: { viewCount: 1 } });
    }

    res.json(notice);
  } catch (error) {
    return res.status(500).json({ message: '공지사항 조회 실패', error: error instanceof Error ? error.message : String(error) });
  }
});

// 공지사항 생성 (총관리자, 센터관리자)
router.post('/', auth, requirePermission('noticeManagement'), async (req: AuthRequest, res) => {
  try {
    const {
      title,
      content,
      category,
      priority,
      targetUserTypes,
      targetCenters,
      isPublished,
      expiresAt,
      attachments,
      tags,
      isPinned,
      allowComments
    } = req.body;

    const notice = new Notice({
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
  } catch (error) {
    return res.status(500).json({ message: '공지사항 생성 실패', error: error instanceof Error ? error.message : String(error) });
  }
});

// 공지사항 수정
router.put('/:id', auth, requirePermission('noticeManagement'), async (req: AuthRequest, res) => {
  try {
    const notice = await Notice.findById(req.params.id);
    if (!notice) {
      return res.status(404).json({ message: '공지사항을 찾을 수 없습니다.' });
    }

    // 센터관리자는 자신이 작성한 공지사항만 수정 가능
    if (req.user.userType === 'centerAdmin' && notice.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: '수정 권한이 없습니다.' });
    }

    Object.assign(notice, req.body);
    
    // 발행 상태가 변경된 경우 publishedAt 업데이트
    if (req.body.isPublished && !notice.publishedAt) {
      notice.publishedAt = new Date();
    }

    await notice.save();
    res.json(notice);
  } catch (error) {
    return res.status(500).json({ message: '공지사항 수정 실패', error: error instanceof Error ? error.message : String(error) });
  }
});

// 공지사항 삭제
router.delete('/:id', auth, requirePermission('noticeManagement'), async (req: AuthRequest, res) => {
  try {
    const notice = await Notice.findById(req.params.id);
    if (!notice) {
      return res.status(404).json({ message: '공지사항을 찾을 수 없습니다.' });
    }

    // 센터관리자는 자신이 작성한 공지사항만 삭제 가능
    if (req.user.userType === 'centerAdmin' && notice.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: '삭제 권한이 없습니다.' });
    }

    await Notice.findByIdAndDelete(req.params.id);
    await NoticeView.deleteMany({ noticeId: req.params.id });

    res.json({ message: '공지사항이 삭제되었습니다.' });
  } catch (error) {
    res.status(500).json({ message: '공지사항 삭제 실패', error: error instanceof Error ? error.message : String(error) });
  }
});

// 공지사항 발행/비발행
router.patch('/:id/publish', auth, requirePermission('noticeManagement'), async (req: AuthRequest, res) => {
  try {
    const { isPublished } = req.body;
    
    const notice = await Notice.findById(req.params.id);
    if (!notice) {
      return res.status(404).json({ message: '공지사항을 찾을 수 없습니다.' });
    }

    notice.isPublished = isPublished;
    notice.publishedAt = isPublished ? new Date() : undefined;
    await notice.save();

    res.json({ message: `공지사항이 ${isPublished ? '발행' : '비발행'}되었습니다.` });
  } catch (error) {
    res.status(500).json({ message: '공지사항 상태 변경 실패', error: error instanceof Error ? error.message : String(error) });
  }
});

// 공지사항 고정/해제
router.patch('/:id/pin', auth, requirePermission('noticeManagement'), async (req: AuthRequest, res) => {
  try {
    const { isPinned } = req.body;
    
    const notice = await Notice.findById(req.params.id);
    if (!notice) {
      return res.status(404).json({ message: '공지사항을 찾을 수 없습니다.' });
    }

    notice.isPinned = isPinned;
    await notice.save();

    res.json({ message: `공지사항이 ${isPinned ? '고정' : '해제'}되었습니다.` });
  } catch (error) {
    res.status(500).json({ message: '공지사항 고정 상태 변경 실패', error: error instanceof Error ? error.message : String(error) });
  }
});

// 사용자별 읽지 않은 공지사항 수
router.get('/unread/count', auth, async (req: AuthRequest, res) => {
  try {
    const user = req.user;
    
    let query: any = { isPublished: true };
    
    if (user.userType !== 'superAdmin') {
      query.targetUserTypes = { $in: [user.userType] };
    }

    const totalNotices = await Notice.countDocuments(query);
    const readNotices = await NoticeView.countDocuments({ userId: user._id });

    res.json({ unreadCount: totalNotices - readNotices });
  } catch (error) {
    res.status(500).json({ message: '읽지 않은 공지사항 수 조회 실패', error: error instanceof Error ? error.message : String(error) });
  }
});

// 공지사항 통계 (총관리자, 센터관리자)
router.get('/stats/overview', auth, requirePermission('noticeManagement'), async (req: AuthRequest, res) => {
  try {
    const stats = await Notice.aggregate([
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
  } catch (error) {
    res.status(500).json({ message: '공지사항 통계 조회 실패', error: error instanceof Error ? error.message : String(error) });
  }
});

// 인기 공지사항 (조회수 기준)
router.get('/popular', auth, async (req: AuthRequest, res) => {
  try {
    const { limit = 5 } = req.query;
    const user = req.user;

    let query: any = { isPublished: true };
    
    if (user.userType !== 'superAdmin') {
      query.targetUserTypes = { $in: [user.userType] };
    }

    const popularNotices = await Notice.find(query)
      .populate('author', 'name email')
      .sort({ viewCount: -1, createdAt: -1 })
      .limit(Number(limit));

    res.json(popularNotices);
  } catch (error) {
    res.status(500).json({ message: '인기 공지사항 조회 실패', error: error instanceof Error ? error.message : String(error) });
  }
});

export default router; 