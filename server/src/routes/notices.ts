import { Router, Request, Response } from 'express';
import { auth as authenticateToken, requireRole } from '../middleware/auth';
import { Notice } from '../models/Notice';
import { User } from '../models/User';

// Request 타입 확장
interface AuthRequest extends Request {
  user?: any;
}

const router: Router = Router();

// 공통 인증/권한 미들웨어 사용

// 모든 공지사항 조회 (공개된 것만)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, priority, tag } = req.query;
    const filter: any = { isPublished: true };
    
    if (category) filter.category = category;
    if (priority) filter.priority = priority;
    if (tag) filter.tags = tag;

    // 만료된 공지사항 제외
    filter.$or = [
      { expiresAt: { $exists: false } },
      { expiresAt: { $gt: new Date() } }
    ];

    const notices = await Notice.find(filter)
      .populate('author', 'name userId')
      .sort({ priority: -1, createdAt: -1 });

    return res.json({ notices });
  } catch (error) {
    console.error('공지사항 조회 오류:', error);
    return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 특정 공지사항 조회
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const notice = await Notice.findById(req.params.id)
      .populate('author', 'name userId');

    if (!notice) {
      return res.status(404).json({ error: '공지사항을 찾을 수 없습니다.' });
    }

    // 공개되지 않은 공지사항은 관리자만 조회 가능
    if (!notice.isPublished) {
      return res.status(403).json({ error: '조회 권한이 없습니다.' });
    }

    // 조회수 증가
    notice.viewCount += 1;
    await notice.save();

    return res.json({ notice });
  } catch (error) {
    console.error('공지사항 조회 오류:', error);
    return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 공지사항 생성 (관리자만)
router.post('/', authenticateToken, requireRole(['superAdmin']), async (req: AuthRequest, res: Response) => {
  try {
    const { 
      title, 
      content, 
      category, 
      priority, 
      isPublished, 
      expiresAt, 
      attachments, 
      tags 
    } = req.body;

    // 필수 필드 검증
    if (!title || !content) {
      return res.status(400).json({ error: '제목과 내용은 필수입니다.' });
    }

    const noticeData = {
      title,
      content,
      author: (req as any).user._id,
      category: category || 'general',
      priority: priority || 'medium',
      isPublished: isPublished || false,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      attachments: attachments || [],
      tags: tags || [],
    };

    const notice = new Notice(noticeData);
    await notice.save();

    const populatedNotice = await Notice.findById(notice._id)
      .populate('author', 'name userId');

    return res.status(201).json({
      message: '공지사항이 생성되었습니다.',
      notice: populatedNotice
    });
  } catch (error) {
    console.error('공지사항 생성 오류:', error);
    return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 공지사항 수정 (관리자만)
router.put('/:id', authenticateToken, requireRole(['superAdmin']), async (req: AuthRequest, res: Response) => {
  try {
    const notice = await Notice.findById(req.params.id);
    
    if (!notice) {
      return res.status(404).json({ error: '공지사항을 찾을 수 없습니다.' });
    }

    const updatedNotice = await Notice.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('author', 'name userId');

    return res.json({
      message: '공지사항이 수정되었습니다.',
      notice: updatedNotice
    });
  } catch (error) {
    console.error('공지사항 수정 오류:', error);
    return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 공지사항 삭제 (관리자만)
router.delete('/:id', authenticateToken, requireRole(['superAdmin']), async (req: AuthRequest, res: Response) => {
  try {
    const notice = await Notice.findById(req.params.id);
    
    if (!notice) {
      return res.status(404).json({ error: '공지사항을 찾을 수 없습니다.' });
    }

    await Notice.findByIdAndDelete(req.params.id);

    return res.json({ message: '공지사항이 삭제되었습니다.' });
  } catch (error) {
    console.error('공지사항 삭제 오류:', error);
    return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 공지사항 발행/비발행 (관리자만)
router.patch('/:id/publish', authenticateToken, requireRole(['superAdmin']), async (req: AuthRequest, res: Response) => {
  try {
    const { isPublished } = req.body;
    
    if (typeof isPublished !== 'boolean') {
      return res.status(400).json({ error: '발행 상태를 지정해주세요.' });
    }

    const notice = await Notice.findByIdAndUpdate(
      req.params.id,
      { 
        isPublished,
        publishedAt: isPublished ? new Date() : undefined
      },
      { new: true }
    ).populate('author', 'name userId');

    if (!notice) {
      return res.status(404).json({ error: '공지사항을 찾을 수 없습니다.' });
    }

    return res.json({
      message: `공지사항이 ${isPublished ? '발행' : '비발행'}되었습니다.`,
      notice
    });
  } catch (error) {
    console.error('공지사항 발행 상태 변경 오류:', error);
    return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 관리자용 전체 공지사항 조회
router.get('/admin/all', authenticateToken, requireRole(['superAdmin']), async (req: AuthRequest, res: Response) => {
  try {
    const { category, priority, isPublished } = req.query;
    const filter: any = {};
    
    if (category) filter.category = category;
    if (priority) filter.priority = priority;
    if (isPublished !== undefined) filter.isPublished = isPublished === 'true';

    const notices = await Notice.find(filter)
      .populate('author', 'name userId')
      .sort({ createdAt: -1 });

    return res.json({ notices });
  } catch (error) {
    console.error('관리자 공지사항 조회 오류:', error);
    return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 공지사항 통계 (관리자만)
router.get('/admin/stats', authenticateToken, requireRole(['superAdmin']), async (req: AuthRequest, res: Response) => {
  try {
    const totalNotices = await Notice.countDocuments();
    const publishedNotices = await Notice.countDocuments({ isPublished: true });
    const expiredNotices = await Notice.countDocuments({
      expiresAt: { $lt: new Date() }
    });

    const categoryStats = await Notice.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    const priorityStats = await Notice.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    return res.json({
      totalNotices,
      publishedNotices,
      expiredNotices,
      categoryStats,
      priorityStats
    });
  } catch (error) {
    console.error('공지사항 통계 조회 오류:', error);
    return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

export default router; 