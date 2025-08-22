import express, { Request, Response } from 'express';
import { auth, requireRole } from '../middleware/auth';
import { CommunityPost } from '../models/CommunityPost';
import { CommunityComment } from '../models/CommunityComment';
import { CommunityReport } from '../models/CommunityReport';

const router: express.Router = express.Router();

// 게시글 목록
router.get('/posts', async (req: Request, res: Response) => {
  try {
    const { q, tag, page = 1, limit = 10 } = req.query as any;
    const skip = (Number(page)-1) * Number(limit);
    const filter: any = { isPublished: true };
    if (q) filter.$text = { $search: q };
    if (tag) filter.tags = tag;
    const posts = await CommunityPost.find(filter).populate('author','name userId').skip(skip).limit(Number(limit)).sort({ createdAt: -1 });
    const total = await CommunityPost.countDocuments(filter);
    res.json({ posts, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total/Number(limit)) } });
  } catch (e) {
    res.status(500).json({ error: '게시글 목록을 불러오는데 실패했습니다.' });
  }
});

// 게시글 생성
router.post('/posts', auth, async (req: any, res: Response) => {
  try {
    const { title, content, tags } = req.body;
    if (!title || !content) return res.status(400).json({ error: '제목과 내용은 필수입니다.' });
    const post = await CommunityPost.create({ title, content, tags: tags||[], author: req.user._id });
    res.status(201).json({ post });
  } catch (e) {
    res.status(500).json({ error: '게시글 생성에 실패했습니다.' });
  }
});

// 게시글 상세
router.get('/posts/:id', async (req: Request, res: Response) => {
  try {
    const post = await CommunityPost.findById(req.params.id).populate('author','name userId');
    if (!post || !post.isPublished) return res.status(404).json({ error: '게시글을 찾을 수 없습니다.' });
    res.json({ post });
  } catch (e) {
    res.status(500).json({ error: '게시글 조회에 실패했습니다.' });
  }
});

// 게시글 수정/토글(작성자 또는 슈퍼관리자)
router.put('/posts/:id', auth, async (req: any, res: Response) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post) return res.status(404).json({ error: '게시글을 찾을 수 없습니다.' });
    if (String(post.author) !== String(req.user._id) && req.user.userType !== 'superAdmin') {
      return res.status(403).json({ error: '수정 권한이 없습니다.' });
    }
    const updated = await CommunityPost.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ post: updated });
  } catch (e) {
    res.status(500).json({ error: '게시글 수정에 실패했습니다.' });
  }
});

// 댓글 목록
router.get('/posts/:id/comments', async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10 } = req.query as any;
    const skip = (Number(page)-1) * Number(limit);
    const comments = await CommunityComment.find({ postId: req.params.id }).populate('author','name userId').skip(skip).limit(Number(limit)).sort({ createdAt: -1 });
    const total = await CommunityComment.countDocuments({ postId: req.params.id });
    res.json({ comments, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total/Number(limit)) } });
  } catch (e) {
    res.status(500).json({ error: '댓글 목록을 불러오는데 실패했습니다.' });
  }
});

// 댓글 작성
router.post('/posts/:id/comments', auth, async (req: any, res: Response) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: '내용을 입력해주세요.' });
    const comment = await CommunityComment.create({ postId: req.params.id, author: req.user._id, content });
    await CommunityPost.findByIdAndUpdate(req.params.id, { $inc: { commentsCount: 1 } });
    res.status(201).json({ comment });
  } catch (e) {
    res.status(500).json({ error: '댓글 작성에 실패했습니다.' });
  }
});

export default router;

// 신고 하기
router.post('/reports', auth, async (req: any, res: Response) => {
  try {
    const { targetType, targetId, reason } = req.body;
    if (!['post','comment'].includes(targetType) || !targetId || !reason) return res.status(400).json({ error: '잘못된 신고 데이터' });
    const report = await CommunityReport.create({ targetType, targetId, reason, reporter: req.user._id });
    res.status(201).json({ report });
  } catch (e) {
    if ((e as any).code === 11000) return res.status(400).json({ error: '이미 신고한 대상입니다.' });
    res.status(500).json({ error: '신고 접수 실패' });
  }
});

// 관리자: 신고 목록/상태 변경
router.get('/reports', auth, requireRole(['superAdmin']), async (req: Request, res: Response) => {
  try {
    const { status = 'open', page = 1, limit = 20 } = req.query as any;
    const skip = (Number(page)-1) * Number(limit);
    const filter: any = {};
    if (status) filter.status = status;
    const reports = await CommunityReport.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit));
    const total = await CommunityReport.countDocuments(filter);
    res.json({ reports, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total/Number(limit)) } });
  } catch (e) {
    res.status(500).json({ error: '신고 목록 조회 실패' });
  }
});

router.patch('/reports/:id/status', auth, requireRole(['superAdmin']), async (req: Request, res: Response) => {
  try {
    const { status } = req.body as any;
    if (!['open','reviewed','dismissed'].includes(status)) return res.status(400).json({ error: '유효하지 않은 상태' });
    const updated = await CommunityReport.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!updated) return res.status(404).json({ error: '신고를 찾을 수 없습니다.' });
    res.json({ report: updated });
  } catch (e) {
    res.status(500).json({ error: '신고 상태 변경 실패' });
  }
});


